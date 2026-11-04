/**
 * 🌿 FOOLISH ARC - CLIENT API SERVICE (JWT + CSRF + FIT FINDER)
 * Connects frontend React components to the Express + MongoDB backend.
 */

import { PRODUCTS } from '../data/products';
import { recommendProductSize } from '../engine/fitFinderEngine';

export const API_BASE = '/api';

function readBrowserCookie(name) {
  if (typeof document === 'undefined' || !document.cookie) return '';
  const match = document.cookie
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith(`${name}=`));
  if (!match) return '';
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return '';
  }
}

/**
 * 🔐 JWT + CSRF HEADERS
 */
export function getAuthHeaders() {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  };
  const csrf = readBrowserCookie('foolisharc_csrf');
  if (csrf) {
    headers['X-CSRF-Token'] = csrf;
  }
  return headers;
}

export async function loginAdmin(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Owner sign-in failed.');
  }

  return { success: true, admin: data.admin, expiresIn: data.expiresIn, csrfToken: data.csrfToken };
}

export async function verifyAdminSession() {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.valid) return { valid: false, admin: null };
    return { valid: true, admin: data.admin, csrfToken: data.csrfToken };
  } catch {
    return { valid: false, admin: null, offline: true };
  }
}

export async function logoutAdmin() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
  } catch {}
}

/**
 * 👤 CUSTOMER PERSISTENT SESSIONS & GOOGLE / EMAIL AUTH
 */
export async function fetchCustomerSession() {
  try {
    const res = await fetch(`${API_BASE}/auth/customer-session`, {
      credentials: 'include',
      cache: 'no-store'
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.authenticated && data.user) {
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
}

export async function logoutCustomerSession() {
  const response = await fetch(`${API_BASE}/auth/customer-logout`, {
    method: 'POST', headers: getAuthHeaders(), credentials: 'include'
  });
  if (!response.ok) throw new Error('Sign-out failed.');
}

export async function syncGoogleClientToDB(userData) {
  if (!userData?.accessToken) {
    throw new Error('Google verification is required. Please sign in again.');
  }

  const response = await fetch(`${API_BASE}/auth/google-client`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ accessToken: userData.accessToken })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.user) {
    throw new Error(data.error || 'Could not verify your Google account.');
  }
  return data.user;
}

export async function setPasswordInDB(credentials) {
  const response = await fetch(`${API_BASE}/auth/set-password`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Failed to set password.');
  return data;
}

export async function loginWithEmailAndPassword(credentials) {
  const res = await fetch(`${API_BASE}/auth/client-login`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function signupWithEmailAndPassword(credentials) {
  const res = await fetch(`${API_BASE}/auth/client-signup`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function resetPasswordWithEmail(credentials) {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Password update failed');
  return data;
}

export async function updateAdminPassword(newPassword) {
  const res = await fetch(`${API_BASE}/admin/change-password`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ newPassword })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Failed to update password');
  return data;
}

/**
 * 📏 FIT FINDER API HELPERS
 */
export async function recommendFitFromAPI(payload, fallbackProduct = null) {
  try {
    const res = await fetch(`${API_BASE}/fit/recommend`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return recommendProductSize(payload, fallbackProduct || PRODUCTS[0]);
}

export async function saveFitProfileToAPI(profilePayload) {
  const res = await fetch(`${API_BASE}/fit/profile`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(profilePayload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not save fit profile.');
  return data.profile;
}

export async function fetchFitProfileFromAPI() {
  try {
    const res = await fetch(`${API_BASE}/fit/profile`, {
      credentials: 'include',
      cache: 'no-store'
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile || null;
    }
  } catch {}
  return null;
}

export async function deleteFitProfileFromAPI() {
  const response=await fetch(`${API_BASE}/fit/profile`, {method:'DELETE',credentials:'include',headers:getAuthHeaders()});
  if(!response.ok) throw new Error('Your measurements could not be deleted. Please try again.');
  return response.json();
}

export async function submitFitFeedbackToAPI(feedbackPayload) {
  const res = await fetch(`${API_BASE}/fit/feedback`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(feedbackPayload)
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Could not submit fit feedback.');
  return data;
}

/**
 * PAYMENT METHODS & HEALTH
 */
export async function fetchPaymentMethods() {
  try {
    const response = await fetch(`${API_BASE}/payment-methods`, { cache: 'no-store' });
    if (!response.ok) return [{ id: 'cod', enabled: true, label: 'Cash on Delivery' }];
    const data = await response.json();
    return Array.isArray(data.methods)
      ? data.methods.filter(method => method && method.enabled)
      : [{ id: 'cod', enabled: true, label: 'Cash on Delivery' }];
  } catch {
    return [{ id: 'cod', enabled: true, label: 'Cash on Delivery' }];
  }
}

export async function checkServerStatus() {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) throw new Error('Server not responding');
    return await res.json();
  } catch {
    return { status: 'offline', database: 'disconnected', fallback: true };
  }
}

/**
 * PRODUCTS
 */
export async function fetchProductsFromDB() {
  try {
    const res = await fetch(`${API_BASE}/products`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (Array.isArray(data)) {
      return data;
    }
  } catch (err) {
    console.info('Using local product catalog (MongoDB offline/loading):', err.message);
  }

  try {
    const saved = localStorage.getItem('zaytoun_products');
    return saved ? JSON.parse(saved) : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

export async function saveProductToDB(product) {
  const response = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(product)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Product could not be saved.');
  return data;
}

export async function deleteProductFromDB(productId) {
  const response = await fetch(`${API_BASE}/products/${encodeURIComponent(String(productId))}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: getAuthHeaders()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Product could not be deleted.');
  return data;
}

/**
 * ORDERS
 */
export async function fetchOrdersFromDB() {
  const response = await fetch(`${API_BASE}/orders`, {
    credentials: 'include',
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(10000),
    cache: 'no-store'
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not load orders. Please sign in again.');
  return Array.isArray(data) ? data : [];
}

export async function fetchOrderReceipt(id) {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(id)}/receipt`, { credentials: 'include', cache: 'no-store' });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.receipt) throw new Error(data.error || 'Could not load this receipt.');
  return data.receipt;
}

export async function fetchOrderByNumber(orderNumber, email) {
  if (!orderNumber) return null;
  const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(String(orderNumber))}?email=${encodeURIComponent(String(email || ''))}`, {
    signal: AbortSignal.timeout(8000),
    cache: 'no-store'
  });
  if (response.status === 404) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Order tracking is unavailable.');
  return data;
}

export async function cancelOrder(orderNumber, { email, cancelReason, cancelNote }) {
  const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(String(orderNumber))}/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, cancelReason, cancelNote })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'This order could not be cancelled.');
  return data;
}

export async function submitOrderReview(orderNumber, review) {
  const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(String(orderNumber))}/review`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(review)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Your review could not be saved.');
  return data;
}

export async function saveOrderToDB(order) {
  let lastError = null;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(order),
        signal: AbortSignal.timeout(20000)
      });
      const data = await response.json().catch(() => ({}));

      if (response.ok && data.orderNumber) return data;

      const error = new Error(data.error || `Order save failed (${response.status}).`);
      error.status = response.status;
      if (response.status !== 503 || attempt === 3) throw error;
      lastError = error;
    } catch (error) {
      lastError = error;
      if (error.status && error.status !== 503) throw error;
      if (attempt === 3) throw error;
    }

    await new Promise(resolve => setTimeout(resolve, attempt * 700));
  }

  throw lastError || new Error('Order could not be saved.');
}

export async function updateOrderStatusInDB(orderId, status, extraFields = {}) {
  if (!orderId) throw new Error('Order ID is required.');
  const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(String(orderId))}/status`, {
    method: 'PATCH',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, ...extraFields })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Could not update order status.');

  return data;
}

export async function approveOrderInDB(orderId) {
  if (!orderId) throw new Error('Order ID is required.');
  const response = await fetch(`${API_BASE}/orders/${encodeURIComponent(String(orderId))}/approve`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success) throw new Error(data.error || 'Could not approve this order.');
  return data;
}

/**
 * THEME / APPEARANCE
 */
export async function fetchThemeFromDB() {
  try {
    const res = await fetch(`${API_BASE}/theme`, { signal: AbortSignal.timeout(6000) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.brand) return data;
    }
  } catch {}
  try {
    const saved = localStorage.getItem('zaytoun_theme_config');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export async function saveThemeToDB(themeConfig) {
  const response = await fetch(`${API_BASE}/theme`, {
    method: 'POST',
    credentials: 'include',
    headers: getAuthHeaders(),
    body: JSON.stringify(themeConfig)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Theme could not be saved.');
  return data;
}

/**
 * NEWSLETTER SUBSCRIBERS & INQUIRIES
 */
export async function subscribeNewsletter(email, source = 'website') {
  try {
    const cleanEmail = (email || '').trim().toLowerCase();
    const res = await fetch(`${API_BASE}/subscribers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email: cleanEmail, source })
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json();
    return { success: false, error: errData.error || 'Subscription was rejected' };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function fetchSubscribersFromDB() {
  try {
    const res = await fetch(`${API_BASE}/subscribers`, {
      credentials: 'include',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function deleteSubscriberFromDB(id) {
  try {
    const res = await fetch(`${API_BASE}/subscribers/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchCustomersFromDB() {
  try {
    const res = await fetch(`${API_BASE}/customers`, {
      credentials: 'include',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function submitContactInquiry(inquiryData) {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inquiryData)
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json();
    return { success: false, error: errData.error };
  } catch {}
  return { success: false, error: 'Your message could not be saved. Please try again.' };
}

export async function fetchInquiriesFromDB() {
  try {
    const res = await fetch(`${API_BASE}/inquiries`, {
      credentials: 'include',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(8000)
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}
