import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';

// Separate opt-in test. It creates and removes a uniquely named test database.
test('order integrity and fit profile ownership on a replica set', async () => {
  if (!process.env.TEST_MONGODB_URI)
    throw new Error('Set TEST_MONGODB_URI to a disposable test replica set.');
  process.env.NODE_ENV = 'test';
  process.env.MONGODB_URI = process.env.TEST_MONGODB_URI;
  process.env.MONGODB_DB_NAME =
    'foolisharc_test_' + randomUUID().replaceAll('-', '');
  for (const key of [
    'RESEND_API_KEY',
    'EMAIL_USER',
    'EMAIL_PASS',
    'ADMIN_NOTIFICATION_EMAIL',
    'ADMIN_EMAIL',
  ])
    process.env[key] = '';
  const { default: app } = await import('../../server/index.js');
  const { connectDB } = await import('../../server/db.js');
  const { default: Product } = await import('../../server/models/Product.js');
  const { default: Order } = await import('../../server/models/Order.js');
  const { default: Customer } = await import('../../server/models/Customer.js');
  const { default: FitProfile } = await import(
    '../../server/models/FitProfile.js'
  );
  let server;
  try {
    assert.ok(await connectDB());
    await Promise.all([
      Product.init(),
      Order.init(),
      Customer.init(),
      FitProfile.init(),
    ]);
    server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const base = 'http://127.0.0.1:' + server.address().port + '/api';
    const request = (path, method = 'GET', body, cookie) =>
      fetch(base + path, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(cookie ? { Cookie: cookie } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    const products = await (await request('/products')).json();
    const p = products.find((p) => p.id === 'forme-01'),
      size = 'M',
      start = p.stockPerSize[size];
    const stock = async () =>
      (await Product.findOne({ id: p.id }).lean()).stockPerSize[size];
    const order = {
      idempotencyKey: randomUUID(),
      customer: {
        firstName: 'Test',
        email: 'shopper@example.test',
        phone: '03001234567',
        address: 'Test Street 10',
        city: 'Lahore',
      },
      paymentMethod: 'cod',
      items: [{ id: p.id, size, quantity: 1, price: 1 }],
    };
    const bad = await request('/orders', 'POST', {
      ...order,
      idempotencyKey: randomUUID(),
      items: [...order.items, { id: 'missing', size, quantity: 1 }],
    });
    assert.equal(bad.status, 409);
    assert.equal(await stock(), start);
    assert.equal(await Order.countDocuments(), 0);
    const replies = await Promise.all([
      request('/orders', 'POST', order),
      request('/orders', 'POST', order),
    ]);
    assert.deepEqual(replies.map((r) => r.status).sort(), [200, 201]);
    const [a, b] = await Promise.all(replies.map((r) => r.json()));
    assert.equal(a.orderNumber, b.orderNumber);
    assert.equal(a.total, p.price);
    assert.equal(await stock(), start - 1);
    assert.equal(a.idempotencyKey, undefined);
    assert.equal(a.requestHash, undefined);
    assert.equal(
      (await Customer.findOne({ email: order.customer.email })).ordersCount,
      1,
    );
    assert.equal(
      (
        await request('/orders', 'POST', {
          ...order,
          customer: { ...order.customer, email: 'other@example.test' },
        })
      ).status,
      409,
    );
    const track = '/orders/' + a.orderNumber;
    assert.equal(
      (await request(track + '?email=wrong@example.test')).status,
      404,
    );
    assert.equal(
      (await request(track + '?email=shopper@example.test')).status,
      200,
    );
    const cancel = () =>
      request(track + '/cancel', 'POST', { email: order.customer.email });
    const cancellations = await Promise.all([cancel(), cancel()]);
    assert.deepEqual(cancellations.map((r) => r.status).sort(), [200, 409]);
    assert.equal(await stock(), start);
    const saved = await request('/fit/profile', 'POST', {
      chest: 94,
      consentGiven: true,
    });
    assert.equal(saved.status, 201);
    const cookie = saved.headers.getSetCookie()[0].split(';')[0];
    assert.deepEqual(
      await (
        await request('/fit/profile?guestToken=' + cookie.split('=')[1])
      ).json(),
      { profile: null },
    );
    assert.equal(
      (await (await request('/fit/profile', 'GET', null, cookie)).json())
        .profile.measurements.chestCm,
      94,
    );
    await request('/fit/profile?guestToken=' + cookie.split('=')[1], 'DELETE');
    assert.equal(await FitProfile.countDocuments(), 1);
    assert.equal(
      (await request('/fit/profile', 'DELETE', null, cookie)).status,
      200,
    );
    assert.equal(await FitProfile.countDocuments(), 0);
  } finally {
    if (server) await new Promise((resolve) => server.close(resolve));
    if (
      mongoose.connection.readyState === 1 &&
      mongoose.connection.name === process.env.MONGODB_DB_NAME
    )
      await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  }
});
