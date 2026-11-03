import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { garment, thumb } from '../../src/engine/formeEngine.js';
import { recommendProductSize } from '../../src/engine/fitFinderEngine.js';
import { PRODUCTS } from '../../src/data/products.js';
import { priceOrder } from '../../src/utils/pricing.js';

process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = '';
process.env.PUBLIC_APP_URL = 'https://store.example.test';
process.env.ADMIN_EMAIL = 'owner@example.test';
const password = randomBytes(20).toString('hex');
process.env.ADMIN_PASSWORD_HASH = await bcrypt.hash(password, 4);
process.env.JWT_SECRET = randomBytes(48).toString('hex');
const { default: app } = await import('../../server/index.js');
let server, base;
before(async () => {
  server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  base = 'http://127.0.0.1:' + server.address().port;
});
after(() => new Promise((resolve) => server.close(resolve)));
const post = (path, body, headers) =>
  fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

test('admin writes require the token issued for that exact session', async () => {
  async function login() {
    const r = await post('/api/auth/login', {
      email: process.env.ADMIN_EMAIL,
      password,
    });
    assert.equal(r.status, 200);
    return {
      cookie: r.headers.getSetCookie()[0].split(';')[0],
      csrf: (await r.json()).csrfToken,
    };
  }
  const a = await login(),
    b = await login();
  for (const headers of [
    {},
    { 'X-Requested-With': 'XMLHttpRequest' },
    { 'X-CSRF-Token': b.csrf },
  ])
    assert.equal(
      (
        await post(
          '/api/theme',
          { brand: 'Demo' },
          { Cookie: a.cookie, ...headers },
        )
      ).status,
      403,
    );
  assert.equal(
    (
      await post(
        '/api/theme',
        { brand: 'Demo' },
        { Cookie: a.cookie, 'X-CSRF-Token': a.csrf },
      )
    ).status,
    503,
  );
});
test('anonymous order list is private', async () =>
  assert.equal((await fetch(base + '/api/orders')).status, 401));
test('origin, request encoding and payload limits', async () => {
  assert.equal(
    (
      await post(
        '/api/auth/customer-logout',
        {},
        { Origin: 'https://store.example.test.evil.test' },
      )
    ).status,
    403,
  );
  assert.equal(
    (
      await fetch(base + '/api/auth/customer-logout', {
        method: 'POST',
        body: 'form',
      })
    ).status,
    415,
  );
  assert.equal(
    (await post('/api/inquiries', { message: 'x'.repeat(40000) })).status,
    413,
  );
});
test('profile consent and storage outage', async () => {
  assert.equal((await post('/api/fit/profile', { chest: 93 })).status, 400);
  assert.equal(
    (await post('/api/fit/profile', { chest: 93, consentGiven: true })).status,
    503,
  );
  assert.deepEqual(
    await (
      await fetch(base + '/api/fit/profile?guestToken=someone-else')
    ).json(),
    { profile: null },
  );
});
test('anonymous rate limiting ignores untrusted forwarded addresses', async () => {
  let r;
  for (let i = 0; i < 7; i++)
    r = await post('/api/inquiries', {}, { 'X-Forwarded-For': '192.0.2.' + i });
  assert.equal(r.status, 429);
  assert.ok(Number(r.headers.get('retry-after')) > 0);
});
test('fit chart handles centimetres, inches and no matching size', () => {
  const p = PRODUCTS.find((p) => p.person === 'women' && p.slot === 'top');
  assert.equal(recommendProductSize({ chest: 93 }, p).recommendedSize, 'M');
  assert.equal(
    recommendProductSize({ chest: 93 / 2.54, measurementUnit: 'in' }, p)
      .recommendedSize,
    'M',
  );
  assert.equal(recommendProductSize({ chest: 165 }, p).recommendedSize, null);
});
test('fitting-room SVG does not execute catalogue markup', () => {
  const p = {
    person: 'women',
    slot: 'top',
    style: 'shirt',
    colors: [{ hex: '"><script>alert(1)</script>' }],
  };
  assert.doesNotMatch(garment(p), /<script|onerror=/);
  p.style = 'custom';
  p.asset = {
    src: 'javascript:alert(1)',
    x: 0,
    y: 0,
    width: '10" onerror="x',
    height: 10,
  };
  assert.doesNotMatch(thumb(p), /javascript:|onerror=/);
});
test('bag and server share the free-shipping boundary', () => {
  assert.equal(priceOrder(0).shippingFee, 0);
  assert.equal(priceOrder(14999).finalTotal, 15249);
  assert.equal(priceOrder(15000).finalTotal, 15000);
});
