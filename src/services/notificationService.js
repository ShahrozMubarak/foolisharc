/**
 * notificationService.js - Official System & Browser Push Notification Engine
 * FOOLISH ARC Luxury Slow-Fashion Platform
 * 
 * Directly leverages the native browser Web Notification API and Service Worker
 * to prompt for SYSTEM permissions (not custom in-house HTML popups) and deliver
 * native desktop & mobile OS notifications for:
 * 1. Order Placed & Verification
 * 2. Order Approved & Courier Tracking Activation
 * 3. Consignment Dispatched & Status Updates
 * 4. Gazette & Private Atelier Drop Announcements
 */

// Track if system permission was already prompted in this session
const PERMISSION_SESSION_KEY = 'zaytoun_system_notif_requested';

/**
 * Request real system/browser notification permission directly from the OS.
 * Does not render any in-house modal; invokes the native browser dialog.
 */
export async function requestSystemNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }

  try {
    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    // Trigger the real system/browser prompt
    const permission = await Notification.requestPermission();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(PERMISSION_SESSION_KEY, 'true');
    }

    if (permission === 'granted') {
      sendSystemNotification({
        title: "FOOLISH ARC",
        body: "Notifications enabled. You will receive live updates on order verification & courier tracking.",
        tag: "welcome-system-alert"
      });
    }

    return permission;
  } catch (err) {
    console.warn("System notification permission request notice:", err);
    return 'default';
  }
}

/**
 * Send an authentic system/browser notification via Web Notification API.
 */
export function sendSystemNotification({
  title = "FOOLISH ARC",
  body = "",
  icon = "/images/catalog/men_barrel_jeans_flat.jpg",
  tag = "atelier-notification",
  url = "/",
  data = {}
} = {}) {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  try {
    const options = {
      body,
      icon,
      badge: icon,
      tag,
      renotify: true,
      data: { url, ...data }
    };

    // If service worker is ready, use registration.showNotification for robust mobile & desktop background support
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready
        .then(reg => {
          reg.showNotification(title, options);
        })
        .catch(() => {
          // Fallback to standard window Notification constructor
          const n = new Notification(title, options);
          n.onclick = () => {
            window.focus();
            if (url && window.location.pathname !== url) {
              window.location.href = url;
            }
          };
        });
    } else {
      const n = new Notification(title, options);
      n.onclick = () => {
        window.focus();
        if (url && window.location.pathname !== url) {
          window.location.href = url;
        }
      };
    }

    return true;
  } catch (err) {
    console.warn("Error dispatching system notification:", err);
    return false;
  }
}

/**
 * Trigger notification on Order Placed
 */
export function notifyOrderPlaced(order) {
  const orderNum = order.orderNumber || order.id || 'NEW';
  const total = Number(order.total || order.pricing?.finalTotal || 0).toLocaleString();
  
  return sendSystemNotification({
    title: `FOOLISH ARC • Order #${orderNum}`,
    body: `Your order for Rs. ${total} has been placed. Studio concierge verification is in progress.`,
    tag: `order-placed-${orderNum}`,
    url: `/track/${orderNum}`
  });
}

/**
 * Trigger notification on Order Approved
 */
export function notifyOrderApproved(order) {
  const orderNum = order.orderNumber || order.id || 'NEW';
  const trackingNum = order.trackingNumber || '';

  return sendSystemNotification({
    title: `FOOLISH ARC • Order Approved #${orderNum}`,
    body: trackingNum
      ? `Your order is approved. ${order?.courier || 'Courier partner'} tracking reference: ${trackingNum}.`
      : 'Your order is approved. Courier details will appear when dispatch is arranged.',
    tag: `order-approved-${orderNum}`,
    url: `/track/${orderNum}`
  });
}

/**
 * Trigger notification on Order Status Update (Dispatched / Delivered)
 */
export function notifyOrderStatusChange(orderNum, status) {
  let orderId = orderNum;
  let statusVal = status;
  if (typeof orderNum === 'object' && orderNum !== null) {
    orderId = orderNum.id || orderNum.orderNumber;
    statusVal = orderNum.status;
  }
  const cleanStatus = (statusVal || 'pending').toLowerCase();
  let message = `Order #${orderId} status updated to ${cleanStatus}.`;
  if (cleanStatus === 'dispatched' || cleanStatus === 'shipped') {
    message = `Order #${orderId} has been handed to the assigned courier partner for priority delivery.`;
  } else if (cleanStatus === 'delivered') {
    message = `Order #${orderId} has been delivered. Thank you for choosing Foolish Arc slow fashion.`;
  } else if (cleanStatus === 'approved') {
    message = `Order #${orderId} has been verified and approved for tailoring & dispatch.`;
  }

  return sendSystemNotification({
    title: `FOOLISH ARC • status: ${cleanStatus}`,
    body: message,
    tag: `order-status-${orderId}-${cleanStatus}`,
    url: `/track/${orderId}`
  });
}

/**
 * Trigger notification on Gazette Subscription
 */
export function notifyGazetteSubscribed(email) {
  return sendSystemNotification({
    title: "FOOLISH ARC • Gazette Active",
    body: `Welcome ${email}. You will receive private drop notices, restock receipts, and editorial digests.`,
    tag: "gazette-subscribed"
  });
}
