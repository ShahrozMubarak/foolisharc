import { recommendProductSize } from '../engine/fitFinderEngine';
import FitFinderModal from '../components/FitFinderModal';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import SymbioteButton from '../components/SymbioteButton';

/**
 * ProductDetailPage - Outfitters-Style Full-Page Product Detail View
 * 
 * Aesthetic Rules:
 * - Pure white studio photography gallery with elongated 3:4 aspect ratio
 * - Zero rounded corners (rounded-none) across containers, swatches, and CTA blocks
 * - Minimalist editorial typography & Pakistan-wide delivery details
 */
export default function ProductDetailPage({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
  onOpenProductModal,
  fitProfile = null,
  onSaveFitProfile,
  onDeleteFitProfile
}) {
  const [isLocalFitOpen, setIsLocalFitOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();

  // Find product by id or slug
  const product = products.find(p => p.id === id || p.slug === id);

  // Active selections
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('fabric'); // 'fabric' | 'care' | 'delivery'
  const [isZoomed, setIsZoomed] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product) {
      setActiveImageIndex(0);
      const firstColor = product.colors?.[0];
      const initialColor = typeof firstColor === 'string' ? firstColor : (firstColor?.name || product.primaryColor || "");
      setSelectedColor(initialColor);
      const rec = fitProfile ? recommendProductSize(fitProfile, product) : null;
      if (rec?.recommendedSize && product.sizes?.includes(rec.recommendedSize)) {
        setSelectedSize(rec.recommendedSize);
      } else {
        setSelectedSize(product.sizes?.[0] || "M");
      }
      setQuantity(1);
    }
  }, [id, product]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-white dark:bg-onyx-950 text-center">
        <h1 className="text-2xl font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 mb-2">
          Garment Not Found
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          The requested atelier piece is unavailable or has been archived from this collection.
        </p>
        <Link
          to="/shop"
          className="px-6 py-3 bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold uppercase text-xs tracking-widest rounded-xl transition shadow-sm cursor-pointer"
        >
          Return to Collection
        </Link>
      </div>
    );
  }

  const productImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : [product.image || "/images/catalog/men_barrel_jeans_flat.jpg"];

  const colors = Array.isArray(product.colors) && product.colors.length > 0
    ? product.colors.map(c => typeof c === 'string' ? { name: c, hex: '#C69F6F' } : c)
    : [{ name: product.colorName || product.primaryColor || 'Default', hex: product.color || '#1E2A38' }];

  const sizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['XS', 'S', 'M', 'L', 'XL'];

  const isWishlisted = wishlist.includes(product.id);
  const currentStock = product.stockPerSize?.[selectedSize] !== undefined
    ? Number(product.stockPerSize[selectedSize])
    : Number(product.stock || 0);

  const handleAddToCart = () => {
    if (onAddToCart) {
      const res = onAddToCart(product, selectedSize, selectedColor, quantity);
      if (res !== false) {
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
      }
    }
  };

  // Related garments
  const relatedProducts = products
    .filter(p => p && p.id && p.id !== product.id && (p.person === product.person || p.slot === product.slot))
    .slice(0, 4);

  return (
    <div className="bg-white dark:bg-onyx-950 min-h-screen pt-24 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-6">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-black dark:hover:text-white transition">
            {String(product.person || "COLLECTION").toUpperCase()}
          </Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold line-clamp-1">{product.name}</span>
        </nav>

        {/* Product Hero Grid (60/40 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Multi-image Studio Gallery (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Vertical Thumbnail Strip */}
            {productImages.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible shrink-0 pb-2 sm:pb-0">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 sm:w-20 sm:h-26 rounded-xl overflow-hidden border-2 transition active:scale-95 bg-white shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#9A6E3E] shadow-sm'
                        : 'border-[#E8E0D5] dark:border-[#332A22] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage Studio Image */}
            <div
              className={`relative flex-1 aspect-[3/4] bg-white dark:bg-onyx-900 border border-[#E8E0D5] dark:border-[#2C241D] rounded-2xl overflow-hidden cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                className={`w-full h-full object-cover object-center transition-transform duration-500 ${
                  isZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
                }`}
              />



              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono px-2.5 py-1 rounded-lg pointer-events-none">
                {isZoomed ? "Click to reset" : "Click to zoom"}
              </div>
            </div>

          </div>

          {/* RIGHT: Garment Purchase Details (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-start space-y-6">
            
            {/* Subtitle & Title */}
            <div>
              <p className="text-xs font-mono font-bold tracking-widest text-[#9A6E3E] uppercase mb-1">
                {product.fitLine || `${String(product.fit || 'REGULAR').toUpperCase()} FIT | ${String(product.person || 'MEN').toUpperCase()}`}
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h1>
            </div>

            {/* Price & Rating */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-onyx-800">
              <div className="flex items-baseline space-x-3">
                <span className="text-2xl font-black text-neutral-900 dark:text-neutral-100 tracking-tight">
                  {formatPrice(product.price)}
                </span>
              </div>

              <div className="flex items-center space-x-1 text-xs font-mono text-neutral-600 dark:text-neutral-400">
                <span className="text-amber-500 font-bold">★ {product.rating || "4.9"}</span>
                <span>({product.reviewCount || "48"})</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">
              {product.description}
            </p>

            {/* Color Selection */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                <span className="text-neutral-800 dark:text-neutral-200">
                  Selected Wash: <strong className="uppercase">{selectedColor}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2.5">
                {colors.map((c, idx) => {
                  const colorName = c?.name || (typeof c === 'string' ? c : `Color ${idx + 1}`);
                  const colorHex = c?.hex || '#C69F6F';
                  return (
                    <button
                      key={colorName}
                      onClick={() => setSelectedColor(colorName)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border text-xs font-mono transition active:scale-95 cursor-pointer ${
                        selectedColor === colorName
                          ? 'border-[#9A6E3E] bg-[#FAF6F0] dark:bg-[#201A16] font-bold shadow-xs'
                          : 'border-neutral-200 dark:border-onyx-700 text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: colorHex }} />
                      <span>{colorName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Size Selector */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2.5">
                <span className="text-neutral-800 dark:text-neutral-200 font-bold">
                  Select Size: <strong className="text-[#9A6E3E] font-black">{selectedSize}</strong>
                </span>
                <span className="text-[11px] text-neutral-500 uppercase tracking-widest font-mono">
                  {currentStock > 0 ? (
                    currentStock <= 3 ? (
                      <span className="text-amber-600 font-black">Only {currentStock} left in atelier!</span>
                    ) : (
                      <span className="text-emerald-600 font-bold">{currentStock} in stock</span>
                    )
                  ) : (
                    <span className="text-red-600 font-bold">Sold Out</span>
                  )}
                </span>
              </div>

              {(() => {
                const rec = fitProfile ? recommendProductSize(fitProfile, product) : null;
                const recSize = rec?.recommendedSize;
                return (
                  <>
                    <div className="grid grid-cols-5 gap-2.5 pt-2">
                      {sizes.map((s) => {
                        const isRec = recSize === s;
                        return (
                          <div key={s} className="relative">
                            {isRec && (
                              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#C69F6F] text-[#141413] text-[9px] font-bold tracking-tight z-10 shadow-2xs">
                                Recommended for you
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => setSelectedSize(s)}
                              className={`w-full h-12 rounded-xl text-xs font-mono font-black border transition-all active:scale-95 flex items-center justify-center shadow-xs ${
                                selectedSize === s
                                  ? 'bg-[#1C1612] dark:bg-white text-white dark:text-black border-[#1C1612] dark:border-white shadow-sm ring-2 ring-[#9A6E3E]/30'
                                  : isRec
                                  ? 'bg-[#FAF8F5] text-[#141413] border-[#C69F6F]'
                                  : 'bg-white dark:bg-[#1A1613] text-neutral-800 dark:text-neutral-200 border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E]'
                              }`}
                            >
                              {s}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-3 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E5D3BD] text-xs">
                      <span className="text-[#141413] font-medium">
                        {recSize ? `Your fit profile recommends Size ${recSize} (${rec.confidence})` : 'Unsure which cut fits best?'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLocalFitOpen(true)}
                        className="font-bold underline text-[#9A6E3E] hover:text-[#141413] cursor-pointer"
                      >
                        Find my size
                      </button>
                    </div>
                    <FitFinderModal
                      isOpen={isLocalFitOpen}
                      onClose={() => setIsLocalFitOpen(false)}
                      product={product}
                      fitProfile={fitProfile}
                      onSaveProfile={onSaveFitProfile}
                      onDeleteProfile={onDeleteFitProfile}
                      onSelectSize={(sz) => setSelectedSize(sz)}
                    />
                  </>
                );
              })()}
            </div>

            {/* Quantity Selector & Add To Bag Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3">
                
                {/* Quantity Pill */}
                <div className="flex items-center border border-[#D8CEBF] dark:border-[#382F26] rounded-xl h-12 bg-white dark:bg-[#1A1613] overflow-hidden shadow-2xs">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-full flex items-center justify-center text-sm font-black hover:bg-neutral-100 dark:hover:bg-[#251E18] transition"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-mono text-xs font-black">
                    {quantity}
                  </span>
                  <button
                    disabled={quantity>=Math.min(20,currentStock)} onClick={()=>setQuantity(q=>Math.min(q+1,20,currentStock))}
                    className="w-10 h-full flex items-center justify-center text-sm font-black hover:bg-neutral-100 dark:hover:bg-[#251E18] transition"
                  >
                    +
                  </button>
                </div>

                {/* Primary Add to Bag CTA with Little Motion Cart Journey */}
                <SymbioteButton
                  onClick={handleAddToCart}
                  disabled={currentStock <= 0}
                  theme="camel"
                  containerClassName="flex-1"
                  className={`w-full h-11 px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 active:scale-95 cursor-pointer ${
                    isAdded
                      ? 'bg-[#7A4B26] text-white cart-journey-active'
                      : currentStock <= 0
                        ? 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        : 'bg-[#1C1612] hover:bg-[#7A4B26] text-white'
                  }`}
                >
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="cart-journey-box">◇</span>
                      <span>ADDED TO BAG ✓</span>
                    </span>
                  ) : currentStock <= 0 ? (
                    <span>OUT OF STOCK</span>
                  ) : (
                    <>
                      <span className="cart-journey-box">◇</span>
                      <svg className="w-4 h-4 cart-journey-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M6 7h12l2 14H4L6 7Z" />
                        <path d="M9 8V6a3 3 0 0 1 6 0v2" />
                      </svg>
                      <span>ADD TO BAG • {formatPrice(product.price * quantity)}</span>
                    </>
                  )}
                </SymbioteButton>

                {/* Wishlist Heart Button */}
                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                  className={`w-12 h-12 rounded-xl border transition-all active:scale-90 flex items-center justify-center shrink-0 shadow-2xs ${
                    isWishlisted
                      ? 'bg-red-600 text-white border-red-600 shadow-sm'
                      : 'border-[#D8CEBF] dark:border-[#382F26] text-neutral-700 dark:text-neutral-300 hover:border-[#9A6E3E]'
                  }`}
                  title={isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>

              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E8E0D5] dark:border-[#332A22] text-xs font-mono">
              <div className="p-3.5 bg-[#FAF6F0] dark:bg-[#1E1915] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl shadow-2xs">
                <p className="font-black uppercase text-xs text-[#1C1612] dark:text-white">TRACKED DELIVERY</p>
                <p className="text-xs font-bold uppercase text-[#9A6E3E] mt-1">2-3 DAYS NATIONWIDE</p>
              </div>
              <div className="p-3.5 bg-[#FAF6F0] dark:bg-[#1E1915] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl shadow-2xs">
                <p className="font-black uppercase text-xs text-[#1C1612] dark:text-white">14-DAY EXCHANGES</p>
                <p className="text-xs font-bold uppercase text-[#9A6E3E] mt-1">COMPLIMENTARY RESIZING</p>
              </div>
            </div>

            {/* Elevated Garment Specs Tabs */}
            <div className="pt-2">
              <div className="flex border-b border-neutral-200 dark:border-onyx-800 space-x-6 mb-3 pb-1 font-mono uppercase text-xs">
                <button
                  onClick={() => setActiveTab('fabric')}
                  className={`pb-2 transition ${activeTab === 'fabric' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Fabric & Weave
                </button>
                <button
                  onClick={() => setActiveTab('care')}
                  className={`pb-2 transition ${activeTab === 'care' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Wash & Care
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-2 transition ${activeTab === 'delivery' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                >
                  Courier & Delivery
                </button>
              </div>

              <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 leading-relaxed">
                {activeTab === 'fabric' && (
                  <p>{product.fabric ? product.fabric.toUpperCase() : "100% AUTHENTIC RING-SPUN COTTON DENIM (13.5OZ SELVEDGE)"}</p>
                )}
                {activeTab === 'care' && (
                  <p>{product.care ? product.care.toUpperCase() : "MACHINE WASH COLD INSIDE OUT • LINE DRY • ZERO TUMBLE"}</p>
                )}
                {activeTab === 'delivery' && (
                  <p>TCS WHITE-GLOVE COURIER • SAME-DAY DISPATCH • REAL-TIME CONSIGNMENT TRACKING</p>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* RELATED GARMENTS SECTION */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 pt-12 border-t border-neutral-200 dark:border-onyx-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold">Pair With</p>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                  Complete The Collection
                </h2>
              </div>
              <Link
                to="/shop"
                className="arrow-runway text-xs font-mono font-bold uppercase tracking-widest text-neutral-700 dark:text-neutral-300 hover:text-[#9A6E3E] dark:hover:text-[#E6D3B3] flex items-center space-x-1.5 group transition"
              >
                <span>View All Pieces</span>
                <span className="arrow-runway-box">
                  <b>→</b>
                  <b>→</b>
                </span>
              </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={onAddToCart}
                  onQuickView={onOpenProductModal}
                  onToggleWishlist={onToggleWishlist}
                  isWishlisted={wishlist.includes(p.id)}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
