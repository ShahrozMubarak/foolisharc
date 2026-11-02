import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import TypewriterHeadline from '../components/TypewriterHeadline';
import { subscribeNewsletter } from '../services/api';
import SymbioteButton from '../components/SymbioteButton';

/**
 * HomePage - Editorial Outfitters-Inspired Storefront
 * Structure:
 * 1. Clean, Unobstructed White-Background Model Video Hero (rounded-none, sharp architectural block)
 * 2. Bold Headline & Clean Rectangular CTAs
 * 3. Realistic Apparel Thumbnails (Jeans, T-Shirts, Shirts on pure white studio background)
 * 4. Editorial Panoramic Banner Showcase
 * 5. New Arrivals Horizontal Shelf (Outfitters 3:4 product cards with models & flat-lays)
 * 6. 3 Featured Postures Showcase (sharp blocks, no zoom hover animations)
 * 7. Curated Collection Grid (Outfitters-style cards: title, fit subtitle, price, swatches, no buy now button)
 * 8. Gazette Newsletter Subscription with Automated Notification
 */
export default function HomePage({
  products = [],
  onAddToCart,
  onOpenProductModal,
  onToggleWishlist,
  wishlist = [],
  onSubscribe
}) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [homeEmail, setHomeEmail] = useState('');
  const [homeSubscribed, setHomeSubscribed] = useState(false);
  const [homeLoading, setHomeLoading] = useState(false);
  const videoRef = useRef(null);

  const handleSpotlight = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  // Panoramic Banner Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const categoryScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);

  const bannerSlides = [
    {
      id: 'barrel-denim',
      headline: 'DENIM EDIT',
      subtitle: 'BARREL FIT & BAGGY DENIM IN 13.5OZ RING-SPUN COTTON',
      description: 'Architectural curved leg silhouettes, washed charcoal enzyme finishes, and vintage whiskering on seamless studio pure white backdrops.',
      image: '/images/catalog/men_model_white_tee_jeans.jpg',
      ctaText: 'SHOP MEN DENIM',
      ctaLink: '/shop?cat=men',
      tag: 'RIGID COTTON'
    },
    {
      id: 'carpenter-utility',
      headline: 'UTILITY',
      subtitle: 'STRAIGHT FIT CARPENTER JEANS & HEAVYWEIGHT TEES',
      description: 'Functional hammer loops, triple-needle chain stitching, and heavyweight 280 GSM combed organic cotton t-shirts.',
      image: '/images/catalog/men_model_carpenter.jpg',
      ctaText: 'SHOP WORKWEAR',
      ctaLink: '/shop?cat=men',
      tag: 'HEAVYWEIGHT'
    },
    {
      id: 'women-tailored',
      headline: 'TAILORED PRET',
      subtitle: 'HIGH-RISE WIDE LEG JEANS & CRISP POPLIN SHIRTS',
      description: 'Parisian blue striped poplin button-downs paired with sculpted wide-leg denim and pleated camel trousers.',
      image: '/images/catalog/women_model_jeans_shirt.jpg',
      ctaText: 'SHOP WOMEN PRET',
      ctaLink: '/shop?cat=women',
      tag: 'POPLIN & DENIM'
    },
    {
      id: 'summer-linen',
      headline: 'FLAX LINEN',
      subtitle: 'NORMANDY FLAX LINEN SHIRTS & PLEATED CASUAL TROUSERS',
      description: 'Breezy enzyme-softened linen button-ups in sage green and natural ecru paired with relaxed trousers.',
      image: '/images/catalog/men_model_sage_shirt.jpg',
      ctaText: 'EXPLORE RESORT',
      ctaLink: '/shop?cat=men',
      tag: 'PURE LINEN'
    }
  ];

  // Auto-advance banner carousel every 6s unless hovered
  useEffect(() => {
    if (isSlidePaused) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isSlidePaused, bannerSlides.length]);

  const handleNextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % bannerSlides.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const scrollCategory = (direction) => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollNewArrivals = (direction) => {
    if (newArrivalsScrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      newArrivalsScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };


  // Filtering logic matching realistic categories
  const filteredProducts = products.filter(p => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'men') return p.person === 'men' || p.gender === 'men';
    if (selectedCategory === 'women') return p.person === 'women' || p.gender === 'women';
    if (selectedCategory === 'jeans') return p.name.includes('JEANS') || p.slug?.includes('jeans');
    if (selectedCategory === 'shirts') return p.slot === 'top' || p.name.includes('SHIRT') || p.name.includes('T-SHIRT');
    
    // Sub-filters from category strip
    if (selectedCategory === 'men-jeans') return (p.person === 'men' || p.gender === 'men') && p.name.includes('JEANS');
    if (selectedCategory === 'men-tee') return (p.person === 'men' || p.gender === 'men') && (p.name.includes('T-SHIRT') || p.style === 'tee');
    if (selectedCategory === 'men-shirt') return (p.person === 'men' || p.gender === 'men') && p.slot === 'top' && !p.name.includes('T-SHIRT');
    if (selectedCategory === 'women-jeans') return (p.person === 'women' || p.gender === 'women') && p.name.includes('JEANS');
    if (selectedCategory === 'women-trouser') return (p.person === 'women' || p.gender === 'women') && (p.name.includes('TROUSERS') || p.style === 'wide');
    if (selectedCategory === 'women-shirt') return (p.person === 'women' || p.gender === 'women') && p.slot === 'top';
    
    return true;
  });

  const handleSubscribeSubmit = async (e) => {
    e.preventDefault();
    const clean = (homeEmail || '').trim();
    if (clean && clean.includes('@')) {
      setHomeLoading(true);
      const result = await subscribeNewsletter(clean, 'homepage_cta');
      setHomeLoading(false);
      if (result && result.error) {
        alert(result.error);
      } else {
        setHomeSubscribed(true);
        if (onSubscribe) onSubscribe(clean);

        setTimeout(() => {
          setHomeEmail('');
          setHomeSubscribed(false);
        }, 4000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-onyx-950 text-black dark:text-white transition-colors">
      
      {/* =========================================================================
          1. INTEGRATED SEAMLESS STUDIO MODEL VIDEO HERO
          Starts immediately below the navbar with 0px gap, borderless edge-to-edge,
          pure white background seamless cyclorama integration
      ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-white dark:bg-onyx-950">
        <div className="relative w-full h-[75vh] sm:h-[88vh] lg:h-[94vh] overflow-hidden bg-white dark:bg-onyx-950">
          <video
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            poster="/images/catalog/men_model_white_tee_jeans.jpg"
            className="w-full h-full object-cover object-top sm:object-center select-none pointer-events-none"
          >
            <source src="/videos/hero_white_model_2.mp4" type="video/mp4" />
            <img
              src="/images/catalog/men_model_white_tee_jeans.jpg"
              alt="Foolish Arc Model"
              className="w-full h-full object-cover object-top sm:object-center"
            />
          </video>

        </div>
      </section>

      {/* =========================================================================
          2. BOLD HEADLINE & RECTANGULAR CTAS
      ========================================================================= */}
      <section className="w-full max-w-4xl mx-auto text-center py-10 sm:py-14 px-4 space-y-5">
        <ScrollReveal distance={20}>
          <div className="flex items-center justify-center space-x-2.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C69F6F] animate-pulse"></span>
            <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#8C6A3E] dark:text-[#E6D3B3]">
              ATELIER RAW FIBERS
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-black dark:text-white leading-tight min-h-[1.25em] flex items-center justify-center">
            <TypewriterHeadline
              words={[
                "WEAR LESS, WEAR LONGER.",
                "SLOW LUXURY.",
                "WEAR LESS, WEAR LONGER."
              ]}
              typingSpeed={75}
              deletingSpeed={35}
              pauseTime={3200}
              cursorClassName="bg-[#A6865A] dark:bg-[#E6D3B3]"
            />
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.15} distance={16}>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            {/* Little Motion Exp 008: Orbit Border Glow CTA */}
            <Link
              to="/shop"
              className="btn-orbit-border btn-tactile group shadow-sm active:scale-95"
            >
              <span className="btn-orbit-inner">
                <span>Explore Collection</span>
                <span className="arrow-runway text-sm">
                  <span>↘</span>
                  <span>↘</span>
                </span>
              </span>
            </Link>

            {/* Little Motion Exp 006: Liquid Fill CTAs */}
            <Link
              to="/shop?cat=men"
              className="btn-liquid-fill btn-tactile px-6 py-3.5 text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm"
            >
              <span>Shop Men</span>
            </Link>
            <Link
              to="/shop?cat=women"
              className="btn-liquid-fill btn-tactile px-6 py-3.5 text-xs font-bold uppercase tracking-wider active:scale-95 shadow-sm"
            >
              <span>Shop Women</span>
            </Link>

          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================================
          4. EDITORIAL PANORAMIC BANNER (ROUNDED-NONE, SHARP HIGH-FASHION FRAME)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div
          className="relative w-full rounded-none overflow-hidden min-h-[460px] sm:min-h-[520px] lg:min-h-[560px] border border-neutral-300 dark:border-onyx-800 shadow-md group"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          {/* Active Slide Image (No Zoom Scale) */}
          <img
            src={bannerSlides[currentSlide].image}
            alt={bannerSlides[currentSlide].headline}
            className="absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ease-out"
          />

          {/* Clickable Image to Collection */}
          <Link
            to={bannerSlides[currentSlide]?.ctaLink || "/shop"}
            className="absolute inset-0 block z-0"
            aria-label="View Collection"
          />

          {/* Left/Prev Arrow Button */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-none bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all z-20 border border-white/20 active:scale-95"
            aria-label="Previous Slide"
          >
            ←
          </button>

          {/* Right/Next Arrow Button */}
          <button
            onClick={handleNextSlide}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-none bg-black/40 hover:bg-black/80 text-white flex items-center justify-center transition-all z-20 border border-white/20 active:scale-95"
            aria-label="Next Slide"
          >
            →
          </button>

          {/* Pagination Indicators */}
          <div className="absolute bottom-4 inset-x-0 flex items-center justify-center space-x-2 z-20">
            {bannerSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 transition-all duration-300 rounded-none ${
                  idx === currentSlide
                    ? 'w-7 bg-white'
                    : 'w-2 bg-white/40 hover:bg-white/80'
                }`}
                aria-label={`Jump to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* Wood tone divider between Hero and Store Shelf */}
      <div className="divider-wood max-w-6xl mx-auto my-6 sm:my-8" />

      {/* =========================================================================
          5. NEW ARRIVALS HORIZONTAL PRODUCT SHELF (OUTFITTERS STYLE 3:4 CARDS)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-3 border-b border-neutral-200 dark:border-onyx-800 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              NEW IN STORE
            </h2>
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#C69F6F] mt-1 block">
              AUTUMN / WINTER 2026
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-2">
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => scrollNewArrivals('left')}
                className="w-8 h-8 rounded-none border border-neutral-300 dark:border-onyx-700 hover:border-black dark:hover:border-white text-xs font-bold flex items-center justify-center transition"
                aria-label="Scroll Left"
              >
                ←
              </button>
              <button
                onClick={() => scrollNewArrivals('right')}
                className="w-8 h-8 rounded-none border border-neutral-300 dark:border-onyx-700 hover:border-black dark:hover:border-white text-xs font-bold flex items-center justify-center transition"
                aria-label="Scroll Right"
              >
                →
              </button>
            </div>
            <Link
              to="/shop"
              className="arrow-runway text-xs font-mono font-bold uppercase tracking-widest text-black dark:text-white px-4 py-2 border border-neutral-300 dark:border-onyx-800 hover:border-[#9A6E3E] hover:text-[#9A6E3E] dark:hover:text-[#E6D3B3] rounded-none flex items-center space-x-2 transition cursor-pointer"
            >
              <span>View All Pieces</span>
              <span className="arrow-runway-box">
                <b>→</b>
                <b>→</b>
              </span>
            </Link>
          </div>
        </div>

        {/* Scrollable Products Row */}
        <div
          ref={newArrivalsScrollRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto pb-4 scrollbar-none scroll-smooth snap-x snap-mandatory"
        >
          {products.slice(0, 8).map((product) => (
            <div
              key={product.id}
              className="min-w-[240px] sm:min-w-[270px] max-w-[270px] snap-start flex-shrink-0"
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onOpenProductModal}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Wood tone divider between New Arrivals and Featured Postures */}
      <div className="divider-wood max-w-6xl mx-auto my-6 sm:my-8" />

      {/* =========================================================================
          6. 3 FEATURED POSTURES (SHARP RECTANGULAR BLOCKS, NO CLUTTER)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 pb-14 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Posture 1: BARREL JEANS */}
          <ScrollReveal delay={0.1} distance={20}>
            <Link
              to="/shop?cat=men"
              onMouseMove={handleSpotlight}
              className="group spotlight-card relative h-[250px] sm:h-[280px] md:h-[300px] rounded-none overflow-hidden block border border-neutral-300 dark:border-onyx-800 bg-white shadow-sm hover:border-black dark:hover:border-white transition-colors"
            >
              <img
                src="/images/catalog/men_barrel_jeans_flat.jpg"
                alt="Barrel Fit Jeans"
                className="w-full h-full object-cover object-center transition-opacity duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-3 z-10">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  BARREL JEANS
                </h3>
                <span className="btn-shimmer-sheen btn-tactile inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-none group-hover:bg-[#E6D3B3] transition-all shrink-0 shadow-sm">
                  <span>Shop</span>
                  <span className="arrow-runway text-xs">
                    <span>↘</span>
                    <span>↘</span>
                  </span>
                </span>
              </div>
            </Link>
          </ScrollReveal>

          {/* Posture 2: CARPENTER FIT */}
          <ScrollReveal delay={0.2} distance={20}>
            <Link
              to="/shop?cat=men"
              onMouseMove={handleSpotlight}
              className="group spotlight-card relative h-[250px] sm:h-[280px] md:h-[300px] rounded-none overflow-hidden block border border-neutral-300 dark:border-onyx-800 bg-white shadow-sm hover:border-black dark:hover:border-white transition-colors"
            >
              <img
                src="/images/catalog/men_model_carpenter.jpg"
                alt="Carpenter Straight Fit"
                className="w-full h-full object-cover object-top transition-opacity duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-3 z-10">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  CARPENTER FIT
                </h3>
                <span className="btn-shimmer-sheen btn-tactile inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-none group-hover:bg-[#E6D3B3] transition-all shrink-0 shadow-sm">
                  <span>Shop</span>
                  <span className="arrow-runway text-xs">
                    <span>↘</span>
                    <span>↘</span>
                  </span>
                </span>
              </div>
            </Link>
          </ScrollReveal>

          {/* Posture 3: TAILORED TROUSERS */}
          <ScrollReveal delay={0.3} distance={20}>
            <Link
              to="/shop?cat=women"
              onMouseMove={handleSpotlight}
              className="group spotlight-card relative h-[250px] sm:h-[280px] md:h-[300px] rounded-none overflow-hidden block border border-neutral-300 dark:border-onyx-800 bg-white shadow-sm hover:border-black dark:hover:border-white transition-colors"
            >
              <img
                src="/images/catalog/women_model_camel_trouser.jpg"
                alt="Tailored Camel Trousers"
                className="w-full h-full object-cover object-top transition-opacity duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

              <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between gap-3 z-10">
                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  TAILORED PRET
                </h3>
                <span className="btn-shimmer-sheen btn-tactile inline-flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold uppercase tracking-wider rounded-none group-hover:bg-[#E6D3B3] transition-all shrink-0 shadow-sm">
                  <span>Shop</span>
                  <span className="arrow-runway text-xs">
                    <span>↘</span>
                    <span>↘</span>
                  </span>
                </span>
              </div>
            </Link>
          </ScrollReveal>

        </div>
      </section>

      {/* Wood tone divider between Featured Postures and Collection */}
      <div className="divider-wood max-w-6xl mx-auto my-6 sm:my-8" />

      {/* =========================================================================
          7. CURATED COLLECTION GRID (OUTFITTERS 3:4 SHARP BLOCK CARDS)
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-16">
        
        {/* Category Header Bar */}
        <ScrollReveal distance={20}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-4 border-b border-neutral-200 dark:border-onyx-800 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight uppercase">
                Collection
              </h2>
              <p className="text-xs text-neutral-500 uppercase tracking-widest mt-0.5">
                {filteredProducts.length} Pieces Available
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'men', label: 'Men' },
                { id: 'women', label: 'Women' },
                { id: 'jeans', label: 'Denim' },
                { id: 'shirts', label: 'Tees & Shirts' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl border text-xs font-bold tracking-wider uppercase transition-all whitespace-nowrap active:scale-95 ${
                    selectedCategory === tab.id
                      ? 'bg-[#1C1612] text-white dark:bg-white dark:text-black border-[#1C1612] dark:border-white shadow-sm'
                      : 'bg-transparent text-neutral-600 dark:text-neutral-400 border-neutral-300 dark:border-onyx-700 hover:border-[#7A4B26] hover:text-[#7A4B26] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Clean 4-Column Product Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {filteredProducts.slice(0, 8).map((product, index) => (
            <ScrollReveal
              key={product.id}
              delay={Math.min((index % 4) * 0.08, 0.3)}
              distance={20}
            >
              <ProductCard
                product={product}
                onAddToCart={onAddToCart}
                onQuickView={onOpenProductModal}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlist.includes(product.id)}
              />
            </ScrollReveal>
          ))}
        </div>

      </section>

      {/* Wood tone divider before Gazette Subscription */}
      <div className="divider-wood max-w-6xl mx-auto my-6 sm:my-8" />

      {/* =========================================================================
          8. GAZETTE SUBSCRIPTION WITH AUTOMATED NOTIFICATION
      ========================================================================= */}
      <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-16 sm:py-24 border-t border-[#7A4B26]/20 text-center">
        <ScrollReveal distance={24}>
          <div className="max-w-xl mx-auto space-y-5">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              JOIN THE GAZETTE
            </h2>
            <form
              onSubmit={handleSubscribeSubmit}
              className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 max-w-md mx-auto"
            >
              <div className="w-full relative">
                <input
                  type="email"
                  required
                  value={homeEmail}
                  onChange={(e) => setHomeEmail(e.target.value)}
                  placeholder="Enter Atelier Email"
                  aria-label="Email address"
                  className="w-full px-4 py-3.5 bg-[#FAF9F6] dark:bg-[#1E1915] border border-[#D8CEBF] dark:border-[#382F26] rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition shadow-inner"
                />
              </div>

              <SymbioteButton
                type="submit"
                disabled={homeLoading}
                theme="camel"
                containerClassName="w-full sm:w-auto"
                className={`w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap disabled:opacity-50 shadow-md flex items-center justify-center gap-2 active:scale-95 ${
                  homeLoading ? 'envelope-dispatch-active' : ''
                }`}
              >
                {homeSubscribed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 dark:text-emerald-300 font-black uppercase">
                    <span>✓</span>
                    <span>SUBSCRIBED</span>
                  </span>
                ) : homeLoading ? (
                  <span className="inline-flex items-center gap-1 font-black uppercase">
                    <span className="envelope-icon"><i></i></span>
                    <span>DISPATCHING...</span>
                  </span>
                ) : (
                  <>
                    <span className="envelope-icon"><i></i></span>
                    <span className="font-black uppercase">SUBSCRIBE</span>
                    <span className="arrow-runway-right text-xs">
                      <span>→</span>
                      <span>→</span>
                    </span>
                  </>
                )}
              </SymbioteButton>
            </form>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
