import React from 'react';

export default function HeroBanner({ onShopNow, onOpenBrandGuide, onOpenSizeFinder }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-olive-900 via-olive-800 to-onyx-950 text-linen-100">
      {/* Decorative Warm Camel Glow */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-camel-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/4 -mb-20 w-80 h-80 rounded-full bg-olive-500/20 blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-camel-500/20 border border-camel-400/30 text-camel-300 text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-camel-400 animate-pulse"></span>
              <span>Autumn / Winter Capsule • Earth Edit</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-editorial font-bold tracking-tight text-linen-50 leading-[1.15]">
              Draped in Nature. <br />
              <span className="italic font-normal text-camel-300">Tailored in Harmony.</span>
            </h1>

            <p className="text-linen-200 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Discover our signature clothing collection woven in organic Belgian linen, Mongolian camel cashmere, and handspun raw silk. Designed in a timeless palette of earthy <strong className="text-camel-300 font-medium">Olive Green</strong>, warm <strong className="text-camel-300 font-medium">Camel</strong>, crisp <strong className="text-linen-100 font-medium">Alabaster White</strong>, and deep <strong className="text-linen-100 font-medium">Obsidian Black</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onShopNow}
                className="bg-camel-500 hover:bg-camel-400 text-onyx-950 font-bold px-7 py-3 rounded-full shadow-lg hover:shadow-camel-500/20 transition transform active:scale-95 text-xs uppercase tracking-wider cursor-pointer"
              >
                Shop Collection
              </button>
              <button
                onClick={onOpenSizeFinder || onShopNow}
                className="bg-white/10 hover:bg-white/20 text-linen-100 border border-linen-300/40 font-bold px-6 py-3 rounded-full transition text-xs uppercase tracking-wider flex items-center space-x-2 cursor-pointer"
              >
                <span>📏 Find Your Size</span>
              </button>
              <button
                onClick={onOpenBrandGuide}
                className="bg-transparent hover:bg-white/10 text-linen-200 border border-transparent hover:border-linen-300/40 font-medium px-4 py-3 rounded-full transition text-xs flex items-center space-x-1 cursor-pointer"
              >
                <span>Color Palette</span>
                <span className="text-xs">→</span>
              </button>
            </div>

            {/* Atelier Trust Badges Row */}
            <div className="pt-6 border-t border-linen-200/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-linen-200">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-md bg-white/10 text-camel-300">🌿</span>
                <div>
                  <div className="font-semibold text-linen-50">Botanical Fibers</div>
                  <div className="text-[10px] text-linen-300">Belgian Linen & Cashmere</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-md bg-white/10 text-camel-300">📦</span>
                <div>
                  <div className="font-semibold text-linen-50">White-Glove Courier</div>
                  <div className="text-[10px] text-linen-300">Insured Doorstep Delivery</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-md bg-white/10 text-camel-300">📏</span>
                <div>
                  <div className="font-semibold text-linen-50">Precision Fit Finder</div>
                  <div className="text-[10px] text-linen-300">Smart Size Advisory</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-md bg-white/10 text-camel-300">✂️</span>
                <div>
                  <div className="font-semibold text-linen-50">Master Tailoring</div>
                  <div className="text-[10px] text-linen-300">Lahore Atelier Handcrafted</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Editorial Lookbook Cards */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-sm sm:max-w-md">
              {/* Main Lookbook Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-camel-400/30 group">
                <img
                  src="https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
                  alt="Olive & Camel Double Breasted Coat"
                  className="w-full h-[460px] object-cover object-top group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-onyx-950/80 via-transparent to-transparent"></div>
                
                {/* Floating Tag */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-onyx-900/90 backdrop-blur-md border border-linen-300/20 text-linen-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-camel-300 font-bold">Featured Ensemble</span>
                    <h4 className="font-editorial text-base font-medium">The Olive Heritage Trench</h4>
                    <span className="text-xs text-linen-300">Rs. 18,500</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#364634] border border-white" title="Olive Green"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#C69F6F] border border-white" title="Camel"></span>
                    <span className="w-3.5 h-3.5 rounded-full bg-[#111315] border border-white" title="Obsidian Black"></span>
                  </div>
                </div>
              </div>

              {/* Overlapping Floating Badge */}
              <div className="absolute -top-4 -left-4 bg-camel-500 text-onyx-950 p-3 rounded-xl shadow-xl flex items-center space-x-2 border-2 border-linen-100">
                <span className="text-lg">🌿</span>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-extrabold tracking-wider leading-none">100% Sustainable</div>
                  <div className="text-xs font-bold leading-tight">Artisan Loom Woven</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
