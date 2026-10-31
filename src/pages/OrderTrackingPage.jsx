import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import { fetchOrderByNumber, updateOrderStatusInDB } from '../services/api';
import OrderConfirmationModal from '../components/OrderConfirmationModal';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Cancellation State & Modal
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed mind / No longer needed');
  const [cancelNote, setCancelNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // Review State & Modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [fitRating, setFitRating] = useState('True to Size');
  const [craftHighlights, setCraftHighlights] = useState(['Flawless Stitching', 'Tailored Silhouette']);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [clientReview, setClientReview] = useState(null);
  const [submittedReviewToast, setSubmittedReviewToast] = useState(false);

  // Load orders from MongoDB or localStorage
  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setNotFound(false);
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      // 1. Try fetching from MongoDB database
      try {
        const dbOrder = await fetchOrderByNumber(orderId);
        if (dbOrder && isMounted) {
          setOrder(dbOrder);
          setNotFound(false);
          return;
        }
      } catch (err) {
        console.warn("DB lookup error:", err);
      }

      // 2. Check localStorage fallback
      try {
        const savedOrders = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
        const cleanOrderId = String(orderId || '').toLowerCase().trim();
        const found = Array.isArray(savedOrders) ? savedOrders.find(
          o => {
            if (!o) return false;
            const num = String(o.orderNumber || '').toLowerCase().trim();
            const id = String(o.id || '').toLowerCase().trim();
            return (num && num === cleanOrderId) || (id && id === cleanOrderId);
          }
        ) : null;

        if (found && isMounted) {
          setOrder(found);
          setNotFound(false);
          return;
        }
      } catch (e) {
        console.warn("Local storage lookup error:", e);
      }

      // 3. Fallback sample demo order if ID begins with ARC- or ZYT-
      if ((orderId.startsWith('ARC-') || orderId.startsWith('ZYT-')) && isMounted) {
        setOrder({
          orderNumber: orderId,
          id: orderId,
          customer: {
            firstName: "Ayesha",
            lastName: "Malik",
            phone: "03008472910",
            address: "18-C Gulberg III",
            city: "Lahore",
            province: "Punjab",
            email: "ayesha.malik@couture.pk"
          },
          paymentMethod: "jazzcash",
          total: 33300,
          status: "dispatched",
          courier: "TCS Express",
          trackingNumber: "TCS-99482104-LHE",
          createdAt: "2026-10-18T14:30:00Z",
          items: [
            {
              id: "forme-01",
              name: "The Olive Heritage Double-Breasted Trench",
              price: 18500,
              selectedSize: "M",
              selectedColor: "Olive Green",
              quantity: 1,
              image: "/images/campaign_olive_coat.jpg"
            },
            {
              id: "forme-02",
              name: "Pure Mongolian Camel Cashmere Knit",
              price: 14200,
              selectedSize: "M",
              selectedColor: "Desert Camel",
              quantity: 1,
              image: "/images/campaign_camel_knit.jpg"
            }
          ]
        });
        setNotFound(false);
      } else {
        setOrder(null);
        setNotFound(true);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  // Sync client review from order or localStorage reviews map
  useEffect(() => {
    if (!order) {
      setClientReview(null);
      return;
    }
    if (order.review) {
      setClientReview(order.review);
      setRating(order.review.rating || 5);
      setFitRating(order.review.fitRating || 'True to Size');
      setCraftHighlights(order.review.craftHighlights || ['Flawless Stitching']);
      setReviewComment(order.review.comment || '');
      return;
    }
    try {
      const reviewsMap = JSON.parse(localStorage.getItem('zaytoun_client_reviews') || '{}');
      const orderKey = order.orderNumber || order.id || order._id;
      if (reviewsMap[orderKey]) {
        const rev = reviewsMap[orderKey];
        setClientReview(rev);
        setRating(rev.rating || 5);
        setFitRating(rev.fitRating || 'True to Size');
        setCraftHighlights(rev.craftHighlights || ['Flawless Stitching']);
        setReviewComment(rev.comment || '');
      }
    } catch {}
  }, [order]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    navigate(`/track/${searchId.trim().toUpperCase()}`);
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  // Cancellation Flow
  const handleConfirmCancel = async () => {
    if (!order) return;
    setIsCancelling(true);
    const orderIdentifier = order.orderNumber || order.id || order._id;
    const cancelledAt = new Date().toISOString();
    const cancelData = {
      cancelReason,
      cancelNote: cancelNote.trim(),
      cancelledAt
    };

    try {
      await updateOrderStatusInDB(orderIdentifier, 'cancelled', cancelData);
    } catch (err) {
      console.warn("DB cancellation fallback:", err);
    }

    // Persist directly to local storage cache
    try {
      const saved = JSON.parse(localStorage.getItem('zaytoun_orders') || '[]');
      const cleanIdent = String(orderIdentifier || '').toLowerCase().trim();
      const updatedList = Array.isArray(saved) ? saved.map(o => {
        if (!o) return o;
        const num = String(o.orderNumber || '').toLowerCase().trim();
        const id = String(o.id || '').toLowerCase().trim();
        if ((num && num === cleanIdent) || (id && id === cleanIdent)) {
          return { ...o, status: 'cancelled', ...cancelData };
        }
        return o;
      }) : [];
      localStorage.setItem('zaytoun_orders', JSON.stringify(updatedList));
    } catch {}

    setOrder(prev => ({
      ...prev,
      status: 'cancelled',
      ...cancelData
    }));

    setIsCancelling(false);
    setShowCancelModal(false);
  };

  // Post-Delivery Review Submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReview(true);

    const orderIdentifier = order.orderNumber || order.id || order._id;
    const reviewData = {
      rating,
      fitRating,
      craftHighlights,
      comment: reviewComment.trim(),
      authorName: `${order.customer?.firstName || 'Atelier'} ${order.customer?.lastName || 'Client'}`.trim(),
      reviewedAt: new Date().toISOString(),
      verified: true
    };

    // Store in localStorage reviews map
    try {
      const reviewsMap = JSON.parse(localStorage.getItem('zaytoun_client_reviews') || '{}');
      reviewsMap[orderIdentifier] = reviewData;
      localStorage.setItem('zaytoun_client_reviews', JSON.stringify(reviewsMap));
    } catch {}

    // Update order in DB and localStorage
    try {
      await updateOrderStatusInDB(orderIdentifier, 'delivered', { review: reviewData });
    } catch {}

    // Update local state
    setOrder(prev => ({ ...prev, review: reviewData }));
    setClientReview(reviewData);
    setIsSubmittingReview(false);
    setShowReviewModal(false);
    setSubmittedReviewToast(true);
    setTimeout(() => setSubmittedReviewToast(false), 4000);
  };

  const stages = [
    { key: 'placed', label: 'Order Placed', desc: 'Proof Attached & Authenticated' },
    { key: 'verified', label: 'Studio Verified', desc: 'Proof Approved in Studio' },
    { key: 'processing', label: 'Tailoring & QC', desc: 'Hand-inspected in Lahore' },
    { key: 'dispatched', label: 'Dispatched', desc: 'Handed to Courier Rider' },
    { key: 'delivered', label: 'Delivered', desc: 'Signed & Completed' }
  ];

  const getStageIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 0;
      case 'approved':
      case 'confirmed':
      case 'verified':
        return 1;
      case 'processing':
        return 2;
      case 'dispatched':
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const isCancelled = (order?.status || '').toLowerCase() === 'cancelled';
  const isDelivered = (order?.status || '').toLowerCase() === 'delivered';
  const currentStageIdx = order ? getStageIndex(order.status) : 0;
  const isPendingApproval = (order?.status || '').toLowerCase() === 'pending';

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-onyx-950 dark:text-linen-100 transition-colors py-10 sm:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Slogan */}
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.25em] text-[#C69F6F] block">
            NATIONWIDE FULFILLMENT
          </span>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-[#1C1612] dark:text-white">
            ORDER CONSIGNMENT TRACKING
          </h1>
        </div>

        {/* Search Bar - Architectural Rounded Frame */}
        <div className="bg-white dark:bg-[#1A1613] rounded-2xl p-4 sm:p-6 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral-400 pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Consignment or Order ID (e.g. ARC-2026-1042 or TCS-99482104-PK)"
                aria-label="Order Tracking ID"
                className="w-full pl-11 pr-4 py-3.5 bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] rounded-xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-[#1C1612] dark:text-white focus:outline-none focus:border-[#7A4B26] focus:ring-2 focus:ring-[#7A4B26]/20 transition shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-[#1C1612] hover:bg-[#7A4B26] text-white font-bold px-8 py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md cursor-pointer"
            >
              TRACK ORDER →
            </button>
          </form>
        </div>

        {/* If Order is Found */}
        {order ? (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Order Header Summary Banner */}
            <div className="bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8C6A3E] dark:text-[#E6D3B3] font-bold block">
                  Confirmed Consignment Dossier
                </span>
                <div className="flex items-center space-x-3 mt-1 flex-wrap gap-2">
                  <h2 className="font-mono text-xl sm:text-2xl font-black text-[#1C1612] dark:text-white tracking-tight">
                    #{order.orderNumber || order.id}
                  </h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    isCancelled
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : isDelivered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : isPendingApproval
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isCancelled
                      ? 'Consignment Cancelled'
                      : isDelivered
                      ? 'Delivered'
                      : isPendingApproval
                      ? 'Pending Studio Verification'
                      : (order.status || 'Processing')}
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-1 font-mono">
                  Placed on {new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-PK', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Actions Group (Copy Link, Receipt, and Cancel Order) */}
              <div className="flex items-center flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2 rounded-xl border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#7A4B26] text-xs font-bold text-[#1C1612] dark:text-white bg-[#FAF9F6] dark:bg-[#201A16] hover:bg-white transition flex items-center space-x-2 cursor-pointer shadow-2xs"
                >
                  <span>{copiedLink ? '✓ Copied!' : '🔗 Copy Tracking Link'}</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-white/10 hover:bg-neutral-200 text-xs font-bold text-neutral-800 dark:text-neutral-200 transition cursor-pointer shadow-2xs flex items-center space-x-1.5"
                  title="View Official Thermal Receipt"
                >
                  <span>🖨️</span>
                  <span>Receipt</span>
                </button>

                {/* Cancel Order Option (Available before delivery or cancellation) */}
                {!isDelivered && !isCancelled && (
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-4 py-2 rounded-xl border border-red-300 dark:border-red-900/40 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                    title="Request Order Cancellation"
                  >
                    <span>✕</span>
                    <span>Cancel Consignment</span>
                  </button>
                )}
              </div>
            </div>

            {/* Toast Notification when Review is Published */}
            {submittedReviewToast && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl text-xs font-bold flex items-center justify-between animate-fadeIn shadow-sm">
                <span>✓ Thank you! Your atelier review has been published with verified client credentials.</span>
                <span className="text-amber-500">★★★★★</span>
              </div>
            )}

            {/* Cancellation Notice Banner (If Order Cancelled) */}
            {isCancelled && (
              <div className="bg-red-50/90 dark:bg-red-950/25 border-l-4 border-red-600 p-5 rounded-2xl shadow-sm space-y-2 animate-fadeIn">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <strong className="text-xs uppercase font-black tracking-wider text-red-900 dark:text-red-300">
                    CONSIGNMENT CANCELLED ON {new Date(order.cancelledAt || Date.now()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                  </strong>
                </div>
                <p className="text-xs text-red-800 dark:text-red-200 font-medium">
                  Cancellation Reason: <span className="font-bold underline decoration-red-400">{order.cancelReason || 'Client requested cancellation'}</span>
                  {order.cancelNote && (
                    <span className="block mt-1 italic font-mono text-[11px] text-red-700 dark:text-red-300">
                      "{order.cancelNote}"
                    </span>
                  )}
                </p>
                <div className="pt-2 flex items-center space-x-3">
                  <Link
                    to="/shop"
                    className="px-4 py-2 rounded-xl bg-[#1C1612] hover:bg-[#7A4B26] text-white text-xs font-bold uppercase tracking-wider transition active:scale-95 shadow-sm inline-block"
                  >
                    ← Browse Atelier Capsule
                  </Link>
                  <Link
                    to="/contact"
                    className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:underline"
                  >
                    Need assistance? Contact Concierge
                  </Link>
                </div>
              </div>
            )}

            {/* Post-Delivery Celebration & Atelier Review Section (When Delivered) */}
            {isDelivered && (
              <div className="bg-gradient-to-br from-emerald-50/70 via-white to-[#FAF6F0] dark:from-emerald-950/20 dark:via-[#1A1613] dark:to-[#221C16] border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-6 sm:p-7 shadow-sm space-y-5 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 dark:text-emerald-300 font-black">
                        Consignment Handed Over & Completed
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-[#1C1612] dark:text-white mt-1">
                      Atelier Drape & Textile Review
                    </h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                      Delivered via {order.courier || 'TCS Express'}. Share your impressions on the tailoring and fabric.
                    </p>
                  </div>

                  {!clientReview && (
                    <button
                      type="button"
                      onClick={() => setShowReviewModal(true)}
                      className="px-6 py-3 rounded-xl bg-[#7A4B26] hover:bg-[#5A341E] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
                    >
                      <span>Write Atelier Review</span>
                      <span className="text-amber-300">★★★★★</span>
                    </button>
                  )}
                </div>

                {/* If Review Already Exists: Render Verified Review Card */}
                {clientReview && (
                  <div className="bg-white dark:bg-[#201A16] border border-[#E6D3B3] dark:border-[#382F26] rounded-xl p-5 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex text-amber-500 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < (clientReview.rating || 5) ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-[#9A6E3E]">
                          {clientReview.rating === 5 ? 'Masterpiece' : clientReview.rating >= 4 ? 'Exceptional' : 'Verified Consignment'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          ✓ Verified Bespoke Client
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {new Date(clientReview.reviewedAt || Date.now()).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* Fit & Fabric Tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {clientReview.fitRating && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FAF6F0] dark:bg-[#1A1613] border border-[#E8E0D5] text-[#7A4B26] dark:text-[#E6D3B3]">
                          Fit: {clientReview.fitRating}
                        </span>
                      )}
                      {Array.isArray(clientReview.craftHighlights) && clientReview.craftHighlights.map((tag, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#FAF6F0] dark:bg-[#1A1613] border border-[#E8E0D5] text-neutral-700 dark:text-neutral-300">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {clientReview.comment && (
                      <p className="text-xs text-[#2C1F13] dark:text-neutral-200 italic leading-relaxed pt-1">
                        "{clientReview.comment}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                      <span>Reviewed by {clientReview.authorName || `${order.customer?.firstName} ${order.customer?.lastName}`}</span>
                      <button
                        type="button"
                        onClick={() => setShowReviewModal(true)}
                        className="text-[#9A6E3E] hover:underline font-bold uppercase text-[10px] cursor-pointer"
                      >
                        Edit Review ✎
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pending Studio Verification Notice */}
            {isPendingApproval && !isCancelled && (
              <div className="bg-[#FAF6F0] dark:bg-[#201A16] border-l-4 border-[#9A6E3E] p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#9A6E3E] animate-pulse"></span>
                    <strong className="text-xs uppercase font-black tracking-wider text-black dark:text-white">
                      PAYMENT VERIFICATION IN PROGRESS
                    </strong>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    STATUS: STUDIO CONCIERGE REVIEW • TCS COURIER ASSIGNED ON APPROVAL
                  </div>
                </div>
                {order.paymentReceipt && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-700 text-xs font-bold font-mono text-black dark:text-white uppercase rounded-xl">
                      <span>📎</span>
                      <span>PAYMENT PROOF ATTACHED</span>
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Live Visual Stepper (Enhanced with Wood gradient track & rounded-xl milestones) */}
            {!isCancelled && (
              <div className="bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E6D3B3] dark:border-[#332A22]">
                <span className="text-xs font-mono uppercase tracking-widest text-[#7A4B26] dark:text-[#E6D3B3] block mb-6 font-bold">
                  Consignment Fulfillment Stepper
                </span>

                {/* Stepper with wood-camel gradient */}
                <div className="relative">
                  {/* Connecting Track Line */}
                  <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-[#E8E0D5] dark:bg-[#332A22] rounded-full z-0 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#7A4B26] via-[#9A6E3E] to-[#C69F6F] transition-all duration-700 ease-out"
                      style={{ width: `${(currentStageIdx / (stages.length - 1)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-2 relative z-10">
                    {stages.map((stage, idx) => {
                      const isDone = idx <= currentStageIdx;
                      const isCurrent = idx === currentStageIdx;

                      return (
                        <div key={stage.key} className="flex sm:flex-col items-center sm:text-center space-x-4 sm:space-x-0">
                          {/* Milestone Icon */}
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-500 shadow-sm ${
                              isDone
                                ? 'bg-[#1C1612] text-white dark:bg-[#C69F6F] dark:text-[#1C1612]'
                                : 'bg-[#FAF6F0] dark:bg-[#201A16] text-neutral-400 border border-[#D8CEBF] dark:border-[#382F26]'
                            } ${isCurrent ? 'ring-2 ring-[#7A4B26] scale-105 shadow-md' : ''}`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>

                          <div className="sm:mt-3">
                            <p className={`text-xs font-black uppercase tracking-wider ${
                              isDone ? 'text-[#1C1612] dark:text-white' : 'text-neutral-400'
                            }`}>
                              {stage.label}
                            </p>
                            <span className="hidden sm:block text-[10px] text-neutral-400 mt-0.5">
                              {stage.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Courier Dispatch Card */}
                <div className="mt-8 p-4 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1C1612] text-white dark:bg-[#7A4B26] flex items-center justify-center font-bold text-sm shadow-xs">
                      🚚
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block">
                        Assigned White-Glove Courier:
                      </span>
                      <strong className="text-[#1C1612] dark:text-white font-bold">
                        {isPendingApproval ? 'Assigned upon Studio Approval' : (order.courier || 'TCS Express / Leopards')}
                      </strong>
                      <span className="text-neutral-400 ml-2 font-mono text-[11px]">
                        {isPendingApproval
                          ? '(Consignment assigned after approval)'
                          : `(Consignment #${order.trackingNumber || 'TCS-99482104-PK'})`}
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 dark:text-neutral-400 block">
                      Estimated Doorstep Arrival:
                    </span>
                    <strong className="text-[#7A4B26] dark:text-[#E6D3B3] font-bold">
                      {isDelivered
                        ? 'Consignment Delivered'
                        : isPendingApproval
                        ? '2 to 4 Days (Post-Verification)'
                        : '2 to 4 Business Days'}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Recipient Details & Purchased Garments */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Column: Delivery Destination (5 cols) */}
              <div className="md:col-span-5 bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] space-y-4 text-xs">
                <h3 className="text-base font-black uppercase tracking-tight text-[#1C1612] dark:text-white pb-3 border-b border-[#EFE9DF] dark:border-[#2C241D]">
                  Delivery Destination
                </h3>
                
                <div className="space-y-2 text-neutral-700 dark:text-neutral-300">
                  <div className="font-black text-[#1C1612] dark:text-white text-sm">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </div>
                  <div className="font-medium leading-relaxed">{order.customer?.address}</div>
                  <div className="font-bold text-[#8C6A3E] dark:text-[#E6D3B3]">{order.customer?.city}, {order.customer?.province || 'Punjab'}</div>
                  <div className="font-mono text-neutral-500 font-bold pt-1">
                    Contact: {order.customer?.phone}
                  </div>
                  <div className="font-mono text-neutral-500">
                    Email: {order.customer?.email}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#EFE9DF] dark:border-[#2C241D] space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500 font-bold">Payment Method:</span>
                    <span className="inline-block px-3 py-1 rounded-full bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] text-[#9A6E3E] font-black uppercase text-xs tracking-wider">
                      {order.paymentMethod ? order.paymentMethod.toUpperCase() : 'Cash on Delivery'}
                    </span>
                  </div>
                  {order.paymentReceipt && (
                    <div className="p-3 bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-xl flex items-center justify-between text-xs font-bold">
                      <span className="font-mono text-[#9A6E3E]">📎 Payment Screenshot on File</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100">Verified</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Garments Summary (7 cols) */}
              <div className="md:col-span-7 bg-white dark:bg-[#1A1613] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E6D3B3] dark:border-[#332A22] space-y-4">
                <h3 className="text-base font-black uppercase tracking-tight text-[#1C1612] dark:text-white pb-3 border-b border-[#EFE9DF] dark:border-[#2C241D]">
                  Ordered Garments ({order.items?.length || 0})
                </h3>

                <div className="space-y-3 divide-y divide-[#EFE9DF] dark:divide-[#2C241D]">
                  {(order.items || []).map((item, idx) => (
                    <div key={idx} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3.5">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-15 object-cover rounded-xl border border-black/10 shrink-0"
                          />
                        )}
                        <div>
                          <strong className="block text-[#1C1612] dark:text-white font-bold text-sm">
                            {item.name || item.product?.name}
                          </strong>
                          <span className="text-neutral-500 text-xs font-medium">
                            Qty: {item.quantity} • Size: {item.selectedSize || item.size || 'M'} • Color: {item.selectedColor || item.color || 'Sand'}
                          </span>
                        </div>
                      </div>
                      <div className="font-black text-[#1C1612] dark:text-white text-sm">
                        {formatPrice((item.price || item.product?.price || 0) * (item.quantity || 1))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-[#EFE9DF] dark:border-[#2C241D] flex justify-between items-center text-sm font-black text-[#1C1612] dark:text-white">
                  <span className="uppercase tracking-wider">Total Payable:</span>
                  <span className="text-xl text-[#7A4B26] dark:text-[#C69F6F] font-black tracking-tight">
                    {formatPrice(order.total || order.pricing?.finalTotal || 0)}
                  </span>
                </div>
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="text-center pt-4">
              <Link
                to="/shop"
                className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-[#7A4B26] dark:text-[#E6D3B3] hover:underline"
              >
                <span>← Return to Capsule Shop</span>
              </Link>
            </div>

          </div>
        ) : notFound ? (
          <div className="bg-white dark:bg-onyx-900 rounded-2xl p-10 text-center shadow-md border border-linen-300 dark:border-onyx-800 space-y-4">
            <span className="text-4xl block">🔍</span>
            <h2 className="font-editorial text-2xl font-bold">Consignment Not Found</h2>
            <p className="text-xs text-onyx-600 dark:text-linen-400 max-w-md mx-auto">
              We couldn't locate an order matching ID <strong className="font-mono text-[#7A4B26] dark:text-[#C69F6F]">{orderId}</strong>. Please check your order confirmation SMS or email, or contact our atelier concierge.
            </p>
            <div className="pt-2">
              <Link
                to="/contact"
                className="px-6 py-2.5 rounded-xl bg-[#1C1612] hover:bg-[#7A4B26] text-white text-xs font-bold uppercase tracking-widest transition"
              >
                Contact Concierge
              </Link>
            </div>
          </div>
        ) : null}

      </div>

      {/* =========================================================================
          CANCEL ORDER CONFIRMATION MODAL
      ========================================================================= */}
      {showCancelModal && order && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1613] rounded-2xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-[#E6D3B3] dark:border-[#332A22] space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-[#E8E0D5] dark:border-[#2C241D] pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <h3 className="text-base font-black uppercase tracking-tight text-[#1C1612] dark:text-white">
                  Cancel Consignment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Are you sure you wish to cancel consignment <strong className="font-mono text-[#1C1612] dark:text-white">#{order.orderNumber || order.id}</strong>? Any reserved tailored items will be released back to inventory.
            </p>

            {/* Cancellation Reason Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-[#7A4B26] dark:text-[#E6D3B3]">
                Select Cancellation Reason
              </label>
              <div className="space-y-1.5 text-xs">
                {[
                  'Changed mind / No longer needed',
                  'Ordered incorrect size or color',
                  'Need to modify delivery address',
                  'Found alternative garment',
                  'Other reason'
                ].map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                      cancelReason === reason
                        ? 'border-[#7A4B26] bg-[#FAF6F0] dark:bg-[#251E19] text-[#1C1612] dark:text-white font-bold'
                        : 'border-[#E8E0D5] dark:border-[#332A22] hover:bg-neutral-50 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={() => setCancelReason(reason)}
                      className="text-[#7A4B26] focus:ring-[#7A4B26]"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Optional Additional Note */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-500">
                Additional Comments (Optional)
              </label>
              <textarea
                value={cancelNote}
                onChange={(e) => setCancelNote(e.target.value)}
                placeholder="Let us know if you need to adjust measurements or shipping timing..."
                rows={2}
                className="w-full p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-[#1C1612] dark:text-white focus:outline-none focus:border-[#7A4B26] transition shadow-inner"
              />
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-onyx-700 hover:bg-neutral-100 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider transition cursor-pointer"
              >
                Keep Consignment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          POST-DELIVERY ATELIER REVIEW MODAL
      ========================================================================= */}
      {showReviewModal && order && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1613] rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-[#E6D3B3] dark:border-[#332A22] space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-[#E8E0D5] dark:border-[#2C241D] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A4B26] dark:text-[#E6D3B3] font-bold">
                  Bespoke Client Assessment
                </span>
                <h3 className="text-base sm:text-lg font-black uppercase tracking-tight text-[#1C1612] dark:text-white">
                  Review Your Consignment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="text-neutral-400 hover:text-black dark:hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              
              {/* Star Rating Interactive Selector */}
              <div className="text-center py-2 bg-[#FAF6F0] dark:bg-[#201A16] rounded-xl border border-[#E8E0D5] dark:border-[#332A22]">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-500 block mb-1">
                  Overall Atelier Craftsmanship & Experience
                </span>
                <div className="flex items-center justify-center space-x-1.5 text-2xl sm:text-3xl">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-115 active:scale-95 focus:outline-none"
                    >
                      <span className={
                        (hoverRating || rating) >= star
                          ? 'text-amber-500 drop-shadow-xs'
                          : 'text-neutral-300 dark:text-neutral-700'
                      }>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-[#7A4B26] dark:text-[#E6D3B3] mt-1 block">
                  {rating === 5 ? '5/5 • Masterpiece' : rating === 4 ? '4/5 • Exceptional' : rating === 3 ? '3/5 • Very Good' : rating === 2 ? '2/5 • Good' : '1/5 • Fair'}
                </span>
              </div>

              {/* Fit & Silhouette Drape */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#7A4B26] dark:text-[#E6D3B3]">
                  Garment Fit & Silhouette
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Runs Snug', 'True to Size', 'Generous / Relaxed'].map((fit) => (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => setFitRating(fit)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                        fitRating === fit
                          ? 'bg-[#1C1612] text-white dark:bg-white dark:text-black border-[#1C1612] dark:border-white shadow-xs'
                          : 'bg-[#FAF9F6] dark:bg-[#201A16] border-[#D8CEBF] dark:border-[#382F26] text-neutral-600 dark:text-neutral-300 hover:border-[#7A4B26]'
                      }`}
                    >
                      {fit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Craftsmanship Highlights Chips */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-[#7A4B26] dark:text-[#E6D3B3]">
                  Craftsmanship Highlights
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Luxurious Handfeel',
                    'Flawless Stitching',
                    'Rich Tone Depth',
                    'Tailored Silhouette',
                    'Perfect Weight',
                    'Premium Lining'
                  ].map((chip) => {
                    const isSelected = craftHighlights.includes(chip);
                    return (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setCraftHighlights(prev => prev.filter(c => c !== chip));
                          } else {
                            setCraftHighlights(prev => [...prev, chip]);
                          }
                        }}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-[#7A4B26] text-white border-[#7A4B26] shadow-2xs'
                            : 'bg-white dark:bg-[#201A16] border-[#D8CEBF] dark:border-[#382F26] text-neutral-600 dark:text-neutral-300 hover:border-[#7A4B26]'
                        }`}
                      >
                        {isSelected ? `✓ ${chip}` : `+ ${chip}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Client Reflections & Tailoring Notes
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe the textile drape, comfort, stitching precision, and overall aesthetic..."
                  rows={3}
                  required
                  className="w-full p-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-[#1C1612] dark:text-white focus:outline-none focus:border-[#7A4B26] transition shadow-inner"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-onyx-700 hover:bg-neutral-100 text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-[#7A4B26] hover:bg-[#5A341E] text-white text-xs font-black uppercase tracking-wider transition shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingReview ? 'Publishing...' : 'Publish Atelier Review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Official Thermal Receipt Extrusion Modal */}
      {showReceiptModal && order && (
        <OrderConfirmationModal
          order={order}
          isOpen={showReceiptModal}
          onClose={() => setShowReceiptModal(false)}
        />
      )}

    </div>
  );
}
