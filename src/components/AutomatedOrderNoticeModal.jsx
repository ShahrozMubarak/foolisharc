import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { Link } from 'react-router-dom';

/**
 * AutomatedOrderNoticeModal - Instant automated message that pops up when an order is placed
 * Notifies the customer that their order has been registered, dispatched to fulfillment,
 * and that an automated confirmation email has been dispatched.
 */
export default function AutomatedOrderNoticeModal({ order, isOpen, onClose }) {
  const { formatPrice } = useCurrency();
  if (!isOpen || !order) return null;

  const items = order.items || [];
  const trackingNumber = order.trackingNumber || 'Assigned after studio approval';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-white dark:bg-onyx-950 border-2 border-black dark:border-white rounded-none shadow-2xl p-6 sm:p-8 text-black dark:text-white max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-black dark:hover:text-white text-base"
          aria-label="Close"
        >
          ✕
        </button>

        {/* Top Automated Status Badge */}
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 bg-emerald-600 rounded-none animate-ping" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
            Order Received
          </span>
        </div>

        {/* Headline */}
        <div className="mt-3 pb-4 border-b border-neutral-200 dark:border-onyx-800">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
            Order #{order.orderNumber || order.id}
          </h2>
          <p className="text-xs text-neutral-500 font-mono mt-1">
            Timestamp: {new Date(order.date || Date.now()).toLocaleString()}
          </p>
        </div>

        {/* Automated System Message Card */}
        <div className="mt-4 p-4 bg-neutral-100 dark:bg-onyx-900 border-l-4 border-black dark:border-white rounded-none space-y-2">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-black dark:text-white">
            Automated Message from Lahore Atelier:
          </p>
          <p className="text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300 leading-relaxed font-normal">
            Your order has been securely saved and is awaiting studio review. Courier details and a tracking reference will appear here after the order is approved and dispatched.
          </p>
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
            Your order details are saved. Check your order status using the order number and checkout email: <span className="underline font-medium text-black dark:text-white">{order.customer?.email || 'your email'}</span>.
          </p>
        </div>

        {/* Items Summary */}
        <div className="mt-5 space-y-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
            Items Ordered ({items.length})
          </span>
          <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const primaryImg = item.images?.[0] || item.product?.images?.[0] || "/images/catalog/men_barrel_jeans_flat.jpg";
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-neutral-50 dark:bg-onyx-900/60 border border-neutral-200 dark:border-onyx-800 rounded-none"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={primaryImg}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-none bg-white border border-neutral-200 dark:border-onyx-700"
                    />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-tight line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-[10px] text-neutral-500 uppercase tracking-wider">
                        Size: {item.selectedSize || item.size || 'M'} • Qty: {item.quantity || 1}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold font-mono">
                    {formatPrice(Number(item.lineTotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 1))))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Financial & Delivery Details */}
        <div className="mt-4 pt-3 border-t border-neutral-200 dark:border-onyx-800 space-y-1 text-xs">
          <div className="flex justify-between font-bold">
            <span className="uppercase tracking-wider">Order Total:</span>
            <span className="font-mono text-sm">{formatPrice(order.total)}</span>
          </div>
          <div className="flex justify-between text-neutral-500 text-[11px]">
            <span>Delivery Method:</span>
            <span>Courier partner (assigned after approval)</span>
          </div>
          {order.customer?.address && (
            <div className="flex justify-between text-neutral-500 text-[11px] pt-1">
              <span>Delivery To:</span>
              <span className="text-right truncate max-w-[200px]">{order.customer.address}, {order.customer.city}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          <Link
            to={`/track/${encodeURIComponent(order.orderNumber || order.id)}`}
            onClick={onClose}
            className="w-full sm:flex-1 py-3 text-center bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider rounded-none transition"
          >
            Track Delivery
          </Link>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-3 px-6 border border-neutral-300 dark:border-onyx-700 hover:bg-neutral-100 dark:hover:bg-onyx-900 text-xs font-bold uppercase tracking-wider rounded-none transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
