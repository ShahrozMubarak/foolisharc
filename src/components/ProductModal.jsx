import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import SymbioteButton from './SymbioteButton';

/**
 * ProductModal - High-end editorial product detail modal
 * Styled with zero rounded corners (rounded-none), pure white studio image block,
 * and seamless garment specifications.
 */
export default function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onTryOn,
  onOpenSizeGuide,
  onOpenFitFinder,
  isWishlisted,
  onToggleWishlist
}) {
  const navigate = useNavigate();
  const productImages = Array.isArray(product?.images) && product.images.length > 0 
    ? product.images 
    : [product?.image || "/images/catalog/men_barrel_jeans_flat.jpg"];
  const colors = Array.isArray(product?.colors) && product.colors.length > 0
    ? product.colors
    : [{ name: product?.colorName || 'Default', hex: product?.color || '#1E2A38' }];
  const sizes = Array.isArray(product?.sizes) && product.sizes.length > 0
    ? product.sizes
    : ['28', '30', '32', '34', '36'];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[0]?.name || "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "32");
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('fabric'); // 'fabric' | 'care' | 'delivery'
  const [isAdded, setIsAdded] = useState(false);
  const [showFitHelper, setShowFitHelper] = useState(false);
  const [fitPreference, setFitPreference] = useState('relaxed');
  const { formatPrice } = useCurrency();

  const currentStock = Number(product?.stockPerSize?.[selectedSize] ?? product?.stock ?? 0);

  const handleAddToCart = () => {
    if(currentStock<quantity) return;
    const result = onAddToCart(product, selectedSize, selectedColor, quantity);
    if (result !== false) {
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
      }, 1800);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-white dark:bg-[#1A1613] rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-[#E8E0D5] dark:border-[#2C241D] relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-xl bg-white/95 dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E] text-black dark:text-white flex items-center justify-center transition active:scale-90 font-bold cursor-pointer"
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Image Gallery with Clean Pure White Studio BG */}
          <div className="p-4 sm:p-6 bg-white dark:bg-onyx-900 border-b md:border-b-0 md:border-r border-[#E8E0D5] dark:border-[#2C241D] flex flex-col justify-between">
            <div className="relative rounded-xl overflow-hidden bg-white dark:bg-onyx-950 aspect-[3/4] border border-[#E8E0D5] dark:border-[#2C241D]">
              <img
                src={productImages[activeImageIndex] || productImages[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-opacity duration-300"
              />
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex items-center space-x-2.5 mt-3">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-20 rounded-xl overflow-hidden border-2 transition active:scale-95 bg-white cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#9A6E3E] shadow-sm'
                        : 'border-[#E8E0D5] dark:border-[#382F26] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Garment Specs & Purchase Controls */}
          <div className="p-5 sm:p-7 flex flex-col justify-between space-y-5 overflow-y-auto max-h-[85vh] bg-white dark:bg-[#1A1613]">
            <div className="space-y-3.5">
              
              {/* Category & Collection */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-500 uppercase tracking-widest">
                <span>{product.fitLine || product.collection || "Permanent Edition"}</span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-xl sm:text-2xl font-bold uppercase tracking-wide text-neutral-900 dark:text-neutral-100">
                {product.name}
              </h2>

              {/* Price Row */}
              <div className="flex items-baseline space-x-3">
                <span className="font-serif text-2xl font-black text-black dark:text-white">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Color Swatches */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Color: <strong className="uppercase">{selectedColor}</strong>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {colors?.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-mono transition active:scale-95 cursor-pointer ${
                        selectedColor === c.name
                          ? 'border-[#9A6E3E] bg-[#FAF6F0] dark:bg-[#201A16] font-bold shadow-xs'
                          : 'border-[#D8CEBF] dark:border-[#382F26] text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selector & Fit Helper */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-800 dark:text-neutral-200">
                    Size: <strong>{selectedSize}</strong>
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => onOpenFitFinder ? onOpenFitFinder(product) : setShowFitHelper(!showFitHelper)}
                      className="px-2.5 py-1 rounded-lg border border-[#C69F6F] bg-[#FAF8F5] dark:bg-[#201A16] text-[#7A4B26] dark:text-[#E6D3B3] text-[11px] font-bold hover:bg-[#F2E9DE] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <span>📏</span>
                      <span>Find Your Size</span>
                    </button>
                    {onOpenSizeGuide && (
                      <button
                        type="button"
                        onClick={onOpenSizeGuide}
                        className="text-neutral-500 hover:underline cursor-pointer text-xs"
                      >
                        Size Guide
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {sizes?.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[44px] h-10 rounded-xl text-xs font-mono font-bold border transition active:scale-95 flex items-center justify-center cursor-pointer ${
                        selectedSize === s
                          ? 'bg-[#1C1612] text-white border-[#1C1612] shadow-sm'
                          : 'bg-white dark:bg-[#1A1613] text-neutral-800 dark:text-neutral-200 border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Stock Remaining Indicator for Selected Size */}
                {(() => {
                  const sizeStock = product.stockPerSize?.[selectedSize] !== undefined
                    ? Number(product.stockPerSize[selectedSize])
                    : product.stock !== undefined
                      ? Number(product.stock)
                      : 0;

                  return (
                    <div className="mt-2.5 flex items-center space-x-2 text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="font-mono text-[11px] text-neutral-600 dark:text-neutral-400">
                        {sizeStock <= 0 ? (
                          <strong className="text-red-600">Out of Stock in Size {selectedSize}</strong>
                        ) : sizeStock <= 3 ? (
                          <strong className="text-amber-600 font-bold">Only {sizeStock} pieces remaining!</strong>
                        ) : (
                          <span>{sizeStock} in stock for immediate dispatch</span>
                        )}
                      </span>
                    </div>
                  );
                })()}

                {/* Fit Helper Modal Box */}
                {showFitHelper && (
                  <div className="mt-3 p-3.5 rounded-none bg-neutral-100 dark:bg-onyx-900 border border-neutral-300 dark:border-onyx-700 text-xs space-y-2 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="font-mono uppercase text-[10px] text-neutral-500 font-bold">
                        Fit Recommendation
                      </span>
                      <button onClick={() => setShowFitHelper(false)} className="text-neutral-500">✕</button>
                    </div>
                    <div className="flex items-center space-x-2">
                      {['Slim', 'True to Size', 'Relaxed'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFitPreference(f.toLowerCase())}
                          className={`px-3 py-1 rounded-none text-[10px] font-mono border transition ${
                            fitPreference === f.toLowerCase()
                              ? 'bg-black text-white dark:bg-white dark:text-black font-bold'
                              : 'bg-white dark:bg-onyx-950 text-neutral-700 dark:text-neutral-300 border-neutral-300 dark:border-onyx-700'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-neutral-600 dark:text-neutral-400 font-light">
                      For a {fitPreference} drape with South Asian tailoring proportions, we recommend ordering your normal size <strong>({selectedSize})</strong>.
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Actions: Add to Bag (Clean Rectangular Button with Symbiote Tether) */}
            <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-onyx-800">
              <div className="flex items-center space-x-2.5">
                <SymbioteButton
                  disabled={currentStock<quantity} onClick={handleAddToCart}
                  theme="camel"
                  containerClassName="flex-1"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center space-x-2 active:scale-95 cursor-pointer ${
                    isAdded
                      ? 'bg-[#7A4B26] text-white cart-journey-active'
                      : 'bg-[#1C1612] hover:bg-[#7A4B26] dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black'
                  }`}
                >
                  {isAdded ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="cart-journey-box">◇</span>
                      <span>ADDED TO BAG ✓</span>
                    </span>
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

                <button
                  onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
                  className={`w-12 h-12 rounded-xl border transition active:scale-90 flex items-center justify-center shrink-0 shadow-2xs cursor-pointer ${
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

              {/* View Full Product Page Link */}
              <div className="pt-1 text-center">
                <button
                  onClick={() => {
                    onClose();
                    navigate(`/product/${product.id}`);
                  }}
                  className="text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white hover:underline transition"
                >
                  VIEW FULL SPECIFICATIONS →
                </button>
              </div>

              {/* Elevated Garment Specs */}
              <div className="text-xs pt-2 border-t border-neutral-200 dark:border-onyx-800">
                <div className="flex border-b border-neutral-200 dark:border-onyx-800 space-x-5 mb-3 pb-1 font-mono uppercase text-[11px]">
                  <button
                    onClick={() => setActiveTab('fabric')}
                    className={`pb-1.5 transition ${activeTab === 'fabric' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                  >
                    Fabric & Weave
                  </button>
                  <button
                    onClick={() => setActiveTab('care')}
                    className={`pb-1.5 transition ${activeTab === 'care' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                  >
                    Wash & Care
                  </button>
                  <button
                    onClick={() => setActiveTab('delivery')}
                    className={`pb-1.5 transition ${activeTab === 'delivery' ? 'text-black dark:text-white border-b-2 border-black dark:border-white font-black' : 'text-neutral-400'}`}
                  >
                    Courier & Delivery
                  </button>
                </div>

                <div className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200 leading-relaxed">
                  {activeTab === 'fabric' && <p>{product.fabric ? product.fabric.toUpperCase() : "100% AUTHENTIC RING-SPUN COTTON DENIM (13.5OZ)"}</p>}
                  {activeTab === 'care' && <p>{product.care ? product.care.toUpperCase() : "MACHINE WASH COLD INSIDE OUT • LINE DRY"}</p>}
                  {activeTab === 'delivery' && (
                    <p>TCS WHITE-GLOVE COURIER • SAME-DAY DISPATCH • SECURE TAMPER PACKAGING</p>
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
