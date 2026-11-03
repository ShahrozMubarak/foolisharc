import {priceOrder,FREE_SHIPPING_THRESHOLD} from '../utils/pricing';
import {recommendProductSize} from '../engine/fitFinderEngine';
import React, { useState } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import SymbioteButton from './SymbioteButton';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  cartItems: propCartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onCheckout,
  user = null,
  onOpenAuthModal,
  fitProfile=null,
  onSwitchItemSize
}) {
  const [deletingKey, setDeletingKey] = useState(null);
  const { formatPrice } = useCurrency();

  const handleDeleteItem = (itemId, size, color) => {
    const key = `${itemId}-${size}-${color}`;
    setDeletingKey(key);
    setTimeout(() => {
      if (onRemoveItem) onRemoveItem(itemId, size, color);
      setDeletingKey(null);
    }, 450);
  };

  if (!isOpen) return null;

  const rawList = propCartItems || cart || [];
  const normalizedCartItems = rawList.map(item => {
    const p = item.product || item;
    const size = item.selectedSize || item.size || 'M';
    const color = item.selectedColor || item.colorName || item.color || p.primaryColor || 'Olive';
    const images = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : ["https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80"]);

    return {
      product: p,
      id: p.id || item.id,
      name: p.name || item.name || 'Atelier Piece',
      price: Number(p.price || item.price || 0),
      size,
      color,
      images,
      quantity: Number(item.quantity || 1)
    };
  });

  const subtotal=normalizedCartItems.reduce((sum,item)=>sum+item.price*item.quantity,0);
  const {discountAmount,shippingFee,finalTotal}=priceOrder(subtotal);
  const isShippingFree=subtotal>=FREE_SHIPPING_THRESHOLD;
  const progressToFreeShipping = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFree = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckoutClick = () => {
    const payload = {
      subtotal,
      discountAmount,
      shippingFee,
      finalTotal,
    };
    if (onProceedToCheckout) {
      onProceedToCheckout(payload);
    } else if (onCheckout) {
      onCheckout(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-onyx-950/70 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-onyx-900 h-full shadow-2xl flex flex-col justify-between border-l border-linen-300 dark:border-onyx-800 transition-colors animate-drawerSlide">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-linen-300 dark:border-onyx-800 flex items-center justify-between bg-linen-100 dark:bg-onyx-950">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-olive-700 dark:text-camel-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h3 className="font-editorial text-xl font-bold text-onyx-950 dark:text-linen-50">Your Shopping Bag</h3>
            <span className="text-xs bg-camel-500 text-onyx-950 font-bold px-2 py-0.5 rounded-full">
              {normalizedCartItems.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-1.5 rounded-full text-onyx-500 dark:text-linen-400 hover:text-onyx-950 dark:hover:text-linen-50 hover:bg-linen-200 dark:hover:bg-onyx-800 transition"
          >
            ✕
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-linen-200/60 dark:bg-onyx-950/60 px-5 py-3 border-b border-linen-300 dark:border-onyx-800 text-xs">
          <div className="flex justify-between items-center mb-1 text-onyx-700 dark:text-linen-300 font-medium">
            <span>
              {isShippingFree ? (
                <strong className="text-olive-700 dark:text-camel-400 font-bold">🎉 You have unlocked Free Standard Delivery!</strong>
              ) : (
                <span>Add <strong>Rs. {remainingForFree.toLocaleString()}</strong> more for Free Shipping</span>
              )}
            </span>
            <span className="font-bold text-olive-800 dark:text-camel-400">{progressToFreeShipping}%</span>
          </div>
          <div className="w-full h-1.5 bg-linen-300 dark:bg-onyx-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-olive-700 dark:bg-camel-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressToFreeShipping}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {normalizedCartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-onyx-500 dark:text-linen-400">
              <div className="w-16 h-16 rounded-none bg-neutral-100 dark:bg-onyx-800 flex items-center justify-center text-2xl border border-neutral-300 dark:border-onyx-700">
                🛍️
              </div>
              <h4 className="text-sm font-black uppercase tracking-widest text-black dark:text-white">YOUR BAG IS EMPTY</h4>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-bold">NO PIECES SELECTED</span>
              <button
                onClick={onClose}
                className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:text-black dark:hover:bg-neutral-200 px-7 py-3 rounded-none text-xs font-black uppercase tracking-widest transition shadow-sm"
              >
                START SHOPPING
              </button>
            </div>
          ) : (
            normalizedCartItems.map((item) => {
              const itemKey = `${item.id}-${item.size}-${item.color}`;
              const isDeleting = deletingKey === itemKey;
              return (
                <div 
                  key={itemKey}
                  className={`flex items-start space-x-3.5 p-3.5 rounded-2xl border border-neutral-200 dark:border-onyx-800 bg-white dark:bg-onyx-950 transition-all duration-300 shadow-2xs ${
                    isDeleting ? 'cart-item-deleting' : ''
                  }`}
                >
                  {/* Thumbnail */}
                  <img
                    src={item.images[0]}
                    alt={item.name}
                    className="w-16 h-20 object-cover object-top rounded-xl bg-neutral-100 dark:bg-onyx-800 flex-shrink-0 border border-[#E8E0D5] dark:border-onyx-800"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-black text-neutral-900 dark:text-neutral-100 truncate uppercase tracking-tight">
                      {item.name}
                    </h4>
                    <div className="flex items-center space-x-2 text-[11px] text-neutral-500 mt-1">
                      <span>SIZE: <strong className="text-black dark:text-white font-black">{item.size}</strong></span>
                      <span>•</span>
                      <span>COLOR: <strong className="text-black dark:text-white font-bold">{item.color}</strong></span>
                    </div>
                    {(() => {
                      const rec = fitProfile ? recommendProductSize(fitProfile, item.product) : null;
                      if (rec?.recommendedSize && rec.recommendedSize !== item.size && (item.product.stockPerSize?.[rec.recommendedSize] ?? item.product.stock) >= item.quantity) {
                        return (
                          <div className="mt-1.5 px-2.5 py-1.5 rounded-xl bg-[#F2E9DE] border border-[#C69F6F] text-[11px] text-[#141413] font-medium flex items-center justify-between gap-2">
                            <span>You usually fit <strong>{rec.recommendedSize}</strong> in this cut</span>
                            {onSwitchItemSize && (
                              <button
                                type="button"
                                onClick={() => onSwitchItemSize(item.id, item.size, item.color, rec.recommendedSize)}
                                className="underline font-bold text-[#9A6E3E] shrink-0"
                              >
                                Switch to {rec.recommendedSize}
                              </button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}
                    <div className="text-xs font-black text-[#9A6E3E] mt-1.5 font-mono">
                      {formatPrice(item.price * item.quantity)}
                    </div>

                    {/* Quantity & Tidy Delete controls */}
                    <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-neutral-100 dark:border-onyx-900">
                      <div className="flex items-center border border-neutral-300 dark:border-onyx-800 rounded-lg bg-neutral-50 dark:bg-onyx-900 overflow-hidden">
                        <button
                          onClick={() => {
                            if (onUpdateQuantity) {
                              onUpdateQuantity(item.id, item.size, item.color, -1);
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-onyx-800 font-bold transition"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-black text-black dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            if (onUpdateQuantity) {
                              onUpdateQuantity(item.id, item.size, item.color, 1);
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-onyx-800 font-bold transition"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Little Motion Tidy Delete Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id, item.size, item.color)}
                        disabled={isDeleting}
                        className={`text-[11px] font-black uppercase tracking-wider flex items-center transition py-1 px-2 rounded-lg cursor-pointer ${
                          isDeleting
                            ? 'text-[#C69F6F] tidy-delete-active'
                            : 'text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20'
                        }`}
                        title="Remove item"
                      >
                        <span className="tidy-bin">
                          <i></i>
                          <b></b>
                        </span>
                        <span>{isDeleting ? 'Clearing...' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Promo Code & Order Summary Footer */}
        {normalizedCartItems.length > 0 && (
          <div className="p-5 border-t border-neutral-200 dark:border-onyx-800 bg-white dark:bg-onyx-950 space-y-3">
            
            {/* Calculations Breakdown Card */}
            <div className="p-4 rounded-2xl bg-[#FAF6F0] dark:bg-[#1E1915] border border-[#E8E0D5] dark:border-[#2C241D] space-y-2 text-xs text-neutral-700 dark:text-neutral-300 shadow-2xs">
              <div className="flex justify-between">
                <span className="font-semibold">Subtotal</span>
                <span className="font-mono font-bold text-black dark:text-white">{formatPrice(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-semibold">Standard Delivery</span>
                <span className="font-mono">
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">FREE</strong>
                  ) : (
                    <strong className="text-black dark:text-white font-bold">{formatPrice(shippingFee)}</strong>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2.5 border-t border-[#E8E0D5] dark:border-[#332A22] text-sm font-black text-black dark:text-white">
                <span className="uppercase tracking-wider">Total Due</span>
                <span className="text-xl text-[#9A6E3E] font-black tracking-tight">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button with Symbiote Tether */}
            <SymbioteButton
              onClick={handleCheckoutClick}
              theme="camel"
              containerClassName="w-full"
              className="w-full bg-[#1C1612] hover:bg-[#7A4B26] text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 text-[11px] sm:text-xs uppercase tracking-wider cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT</span>
              <span className="arrow-runway-right text-xs">
                <span>→</span>
                <span>→</span>
              </span>
            </SymbioteButton>

            {/* Secure Atelier Checkout Note */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-neutral-500 font-mono tracking-widest pt-1 uppercase font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-black dark:text-white font-bold">TRACKED DISPATCH • SECURE CHECKOUT</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
