import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';

/**
 * OrderConfirmationModal - FOOLISH ARC Thermal Invoice Extrusion
 * Clean, centered slow-luxury experience:
 * - Direct centered stage where the thermal invoice slip rolls out
 * - Consistent editorial monospace typography
 * - Completely removed emoji icons, congested hardware panels, and cluttered toolbars
 * - Primary "Track Order →" action at the end
 */
export default function OrderConfirmationModal({ order, isOpen, onClose }) {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [isExtruding, setIsExtruding] = useState(false);
  const audioCtxRef = useRef(null);
  const timersRef = useRef([]);

  const safeOrder = order || {};
  const orderId = safeOrder.orderNumber || safeOrder.id || 'Order reference pending';
  const trackingNumber = safeOrder.trackingNumber || 'Assigned after studio approval';
  const trackingUrl = typeof window !== 'undefined' ? `${window.location.origin}/track/${encodeURIComponent(orderId)}` : `/track/${encodeURIComponent(orderId)}`;
  const orderItems = Array.isArray(safeOrder.items) ? safeOrder.items : [];
  const rawDate = safeOrder.date || safeOrder.createdAt;
  const parsedDate = rawDate ? new Date(rawDate) : new Date();
  const orderDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
  const formattedDate = orderDate.toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).toUpperCase();
  const formattedTime = orderDate.toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  });
  const orderTotal = Number(safeOrder.total || safeOrder.pricing?.finalTotal || 0);

  // Subtle audio synthesis engine (Web Audio API)
  const playPosSound = (type) => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioContextClass();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      if (type === 'beep') {
        [1320, 1760].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.06, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.14);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.15);
        });
      } else if (type === 'stepper') {
        for (let i = 0; i < 16; i++) {
          const tOffset = now + i * 0.11;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(220 + (i % 3) * 30, tOffset);
          gain.gain.setValueAtTime(0.025, tOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, tOffset + 0.045);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(tOffset);
          osc.stop(tOffset + 0.05);
        }
      }
    } catch {
      // Audio optional
    }
  };

  const startPrintSequence = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];

    setIsExtruding(false);

    timersRef.current.push(setTimeout(() => {
      playPosSound('beep');
      playPosSound('stepper');
      setIsExtruding(true);
    }, 350));
  };

  useEffect(() => {
    if (!order || (isOpen !== undefined && !isOpen)) return;
    startPrintSequence();
    return () => {
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
    };
  }, [orderId, Boolean(order), isOpen]);

  const handleGoToTracking = () => {
    if (onClose) onClose();
    const targetPath = `/track/${orderId}`;
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleSaveInvoice = () => {
    setIsExtruding(true);
    setTimeout(() => {
      window.print();
    }, 50);
  };

  if (!order || (isOpen !== undefined && !isOpen)) return null;

  const clientName = typeof safeOrder.customer === 'string'
    ? safeOrder.customer
    : `${safeOrder.customer?.firstName || safeOrder.customer?.name || 'Valued Client'} ${safeOrder.customer?.lastName || ''}`.trim();

  const clientEmail = typeof safeOrder.customer === 'object'
    ? (safeOrder.customer?.email || 'client@foolisharc.com')
    : (safeOrder.email || 'client@foolisharc.com');

  const clientCity = typeof safeOrder.customer === 'object'
    ? (safeOrder.customer?.city || safeOrder.customer?.address || 'Lahore, PK')
    : (safeOrder.city || safeOrder.address || 'Lahore, PK');

  const isAlreadyOnTrackPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/track');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none pos-receipt-modal">
      
      {/* Top Close Button */}
      <button
        onClick={onClose}
        className="fixed top-5 right-5 z-50 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer no-print"
        aria-label="Close"
      >
        ✕
      </button>

      {/* Centered Slip Stage */}
      <div className="w-full max-w-sm my-auto flex flex-col items-center">
        
        {/* Minimalist Dispenser Mouth */}
        <div className="w-full bg-[#FAF9F6] border border-[#E6D3B3] rounded-t-2xl px-4 py-3 shadow-md flex items-center justify-between font-mono pos-dispenser-mouth no-print">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${isExtruding ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-bold uppercase tracking-wider text-black">
              FOOLISH ARC • DISPATCH
            </span>
          </div>
          <span className="text-[10px] text-[#9A6E3E] font-bold uppercase tracking-widest">
            {isExtruding ? 'PRINTING' : 'OFFICIAL'}
          </span>
        </div>

        {/* Paper Mouth Slot */}
        <div className="w-full pos-paper-mouth no-print">
          <div className="pos-serrated-blade" />
        </div>

        {/* Clipping Stage for Thermal Extrusion */}
        <div className="w-full pos-receipt-clip-stage">
          <div
            id="printable-thermal-slip"
            className={`thermal-invoice-slip rounded-b-sm border-x border-b border-[#EFE9DF] ${
              isExtruding ? 'extruding' : ''
            }`}
          >
            <div className="p-5 sm:p-6 font-mono text-xs space-y-3.5 bg-[#FCFBF9] text-[#111418]">
              
              {/* Slip Header */}
              <div className="text-center border-b border-dashed border-black/25 pb-3">
                <div className="flex justify-center mb-1.5">
                  <img
                    src="/images/brand/foolish/arc_emblem.png"
                    alt="FOOLISH ARC"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="font-editorial text-sm font-black tracking-widest text-black uppercase">
                  FOOLISH ARC
                </div>
                <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold mt-0.5">
                  Order Receipt & Summary
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5 font-medium">
                  Ref #{orderId} • {formattedDate} {formattedTime}
                </div>
              </div>

              {/* Patron & Destination Dossier */}
              <div className="space-y-1.5 text-[11px] border-b border-dashed border-black/25 pb-3">
                <div className="flex justify-between">
                  <span className="text-neutral-500">CLIENT</span>
                  <span className="font-bold text-black uppercase">{clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">EMAIL</span>
                  <span className="text-black font-medium">{clientEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">DESTINATION</span>
                  <span className="font-bold text-black">{clientCity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SETTLEMENT</span>
                  <span className="font-bold uppercase text-[#9A6E3E]">
                    {String(safeOrder.paymentMethod || 'COD').replace(/_/g, ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">COURIER</span>
                  <span className="font-bold text-black">{safeOrder.courier || 'Courier partner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">TRACKING NO</span>
                  <span className="font-bold font-mono text-[#9A6E3E]">{trackingNumber}</span>
                </div>
              </div>

              {/* Items Manifest */}
              <div className="space-y-2 text-[11px] border-b border-dashed border-black/25 pb-3">
                {orderItems.length === 0 ? (
                  <div className="flex justify-between font-bold">
                    <span>Your order</span>
                    <span>Rs. {orderTotal.toLocaleString()}</span>
                  </div>
                ) : (
                  orderItems.map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex justify-between font-bold">
                        <span className="truncate pr-2">{item.name || item.title || 'Garment'}</span>
                        <span>Rs. {Number(item.lineTotal ?? ((item.unitPrice ?? item.price ?? 0) * (item.quantity || 1))).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-neutral-500 text-[10px]">
                        <span>Size: {item.selectedSize || item.size || 'M'} • Qty: {item.quantity || 1}</span>
                        <span>{item.selectedColor || item.color || item.colorName || '—'}</span>
                      </div>
                    </div>
                  ))
                )}
                <div className="flex justify-between text-neutral-500 text-[10px] pt-1">
                  <span>Delivery</span>
                  <span className="text-neutral-700 font-bold">{Number(safeOrder.shippingFee ?? safeOrder.pricing?.shippingFee ?? 0) === 0 ? "FREE" : `Rs. ${Number(safeOrder.shippingFee ?? safeOrder.pricing?.shippingFee ?? 0).toLocaleString()}`}</span>
                </div>
              </div>

              {/* Total & Verification Badge */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-neutral-500 block uppercase">Total Amount</span>
                  <span className="font-black text-base text-black font-mono">
                    Rs. {orderTotal.toLocaleString()}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border font-mono font-bold text-[10px] tracking-wider uppercase border-[#C69F6F] text-[#9A6E3E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C69F6F]"></span>
                  <span>{String(safeOrder.status || 'PENDING').toUpperCase()}</span>
                </span>
              </div>

              {/* Clean Serialized Barcode Graphic (Vector SVG for flawless print fidelity) */}
              <div className="pt-2 text-center space-y-1">
                <div className="pos-barcode-graphic flex justify-center items-center h-8 w-full px-2 overflow-hidden">
                  <svg
                    className="w-full h-8"
                    viewBox="0 0 280 32"
                    preserveAspectRatio="none"
                    style={{ shapeRendering: 'crispEdges' }}
                  >
                    {[
                      3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 1, 4, 2, 2, 1, 3, 2, 4,
                      1, 2, 3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 1, 4, 2, 1, 3,
                      2, 4, 1, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 3, 1, 4, 2
                    ].map((width, i, arr) => {
                      const xOffset = arr.slice(0, i).reduce((acc, w) => acc + w * 1.5 + 2, 4);
                      return (
                        <rect
                          key={i}
                          x={xOffset}
                          y={0}
                          width={width * 1.5}
                          height={32}
                          fill="#111418"
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="text-[9px] tracking-[0.25em] text-neutral-500 uppercase font-mono">
                  *ARC-2026-{orderId}*
                </div>
              </div>

            </div>

            {/* Perforated Zigzag Tear Edge */}
            <div className="thermal-zigzag-bottom" />
          </div>
        </div>

        {/* Clean, Uncongested Actions At The End */}
        <div className="w-full mt-4 space-y-2 font-mono no-print">
          <button
            type="button"
            onClick={handleGoToTracking}
            className="w-full py-3.5 px-4 bg-[#1C1612] hover:bg-[#9A6E3E] text-white text-xs font-bold uppercase tracking-widest transition shadow-lg flex items-center justify-center space-x-2 rounded-xl active:scale-98 cursor-pointer"
          >
            <span>{isAlreadyOnTrackPage ? 'Close Receipt Window' : 'Track Consignment'}</span>
            <span>{isAlreadyOnTrackPage ? '✓' : '→'}</span>
          </button>
          
          <button
            type="button"
            onClick={handleSaveInvoice}
            className="w-full py-2.5 px-4 bg-white/90 hover:bg-white text-black text-[11px] font-bold uppercase tracking-wider border border-[#E6D3B3] transition rounded-xl cursor-pointer shadow-xs flex items-center justify-center space-x-1.5"
          >
            <span>🖨️</span>
            <span>Save / Print Order Receipt (PDF)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
