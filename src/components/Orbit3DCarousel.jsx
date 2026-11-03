import {useModelViewer} from '../hooks/useModelViewer';
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

/**
 * 5 High-Fashion 3D Garment Models for the Revolving Circular Orbit Carousel
 */
export const ORBIT_MODELS = [
  {
    id: 'puff-sleeve',
    name: 'Puff Sleeve Jumper Skirt',
    subtitle: 'Washed Belgian Linen',
    category: "Women's Pret",
    price: 19500,
    formattedPrice: 'Rs. 19,500',
    modelSrc: '/models/model.glb',
    tag: 'Architectural Drape',
    accentColor: '#364634',
    accentName: 'Olive Green',
    cameraOrbit: '0deg 75deg 105%',
    description: 'Sculptural balloon sleeves paired with high-waisted pleated jumper skirt in natural river-washed Belgian flax.',
    previewImg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    features: ['100% Belgian Flax', 'Horn Fastenings', 'Bias-Bound Seams']
  },
  {
    id: 'black-dress',
    name: 'Noir Evening Slip Drape',
    subtitle: 'Obsidian Silk Charmeuse',
    category: "Women's Pret",
    price: 24000,
    formattedPrice: 'Rs. 24,000',
    modelSrc: '/models/black_dress.glb',
    tag: 'Liquid Silhouette',
    accentColor: '#1A1A1A',
    accentName: 'Obsidian Black',
    cameraOrbit: '0deg 80deg 100%',
    description: 'Pure liquid silk drape engineered for evening poise with open architectural back and subtle puddle train.',
    previewImg: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    features: ['19 Momme Silk', 'Cowl Neckline', 'Floor-Sweeping Hem']
  },
  {
    id: 'jeans',
    name: 'Artisanal Selvedge Denim',
    subtitle: '14oz Shuttle Loom Kurabo',
    category: "Men's Collection",
    price: 14500,
    formattedPrice: 'Rs. 14,500',
    modelSrc: '/models/jeans.glb',
    tag: 'Vintage River Wash',
    accentColor: '#3D526A',
    accentName: 'Indigo Mineral',
    cameraOrbit: '0deg 85deg 110%',
    description: 'Japanese shuttle-loomed selvedge denim, enzyme river-washed with hand-distressed whiskers and copper rivets.',
    previewImg: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80',
    features: ['14oz Selvedge Denim', 'Hand Distressed', 'Solid Copper Hardware']
  },
  {
    id: 'coat-leather',
    name: 'Moto Leather Trench Coat',
    subtitle: 'Full-Grain Calf Nappa',
    category: 'Outerwear',
    price: 42000,
    formattedPrice: 'Rs. 42,000',
    modelSrc: '/models/coat_leather.glb',
    tag: 'Supple Nappa Leather',
    accentColor: '#2B231D',
    accentName: 'Desert Leather',
    cameraOrbit: '0deg 75deg 100%',
    description: 'Heavyweight yet supple full-grain leather trench with notched storm lapels and double-prong waist cincher.',
    previewImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80',
    features: ['Full-Grain Calf Nappa', 'Custom Matte Hardware', 'Cupro Silk Lining']
  },
  {
    id: 'assassin',
    name: 'Night Hunter Tactical Armor',
    subtitle: 'Sculptural Articulated Leather',
    category: 'Couture Masterwork',
    price: 58000,
    formattedPrice: 'Rs. 58,000',
    modelSrc: '/models/assassin.glb',
    tag: 'Concept Couture',
    accentColor: '#12161A',
    accentName: 'Shadow Steel',
    cameraOrbit: '0deg 75deg 110%',
    description: 'Avant-garde runway masterwork featuring segmented cuirass plating, hand-embossed vambraces, and raven cowl.',
    previewImg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
    features: ['Articulated Cuirass', 'Full Shoulder Pauldrons', 'Layered Cowl Hood']
  }
];

export default function Orbit3DCarousel({
  onAddToCart,
  className = ""
}) {
  useModelViewer();
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [modelLoading, setModelLoading] = useState(false);
  const [modelLoadProgress, setModelLoadProgress] = useState(0);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const wheelLockRef = useRef(false);
  const touchStartRef = useRef(null);

  const activeModel = ORBIT_MODELS[activeIndex];

  // Rotate Carousel
  const rotateNext = () => {
    setActiveIndex(prev => (prev + 1) % ORBIT_MODELS.length);
  };

  const rotatePrev = () => {
    setActiveIndex(prev => (prev - 1 + ORBIT_MODELS.length) % ORBIT_MODELS.length);
  };

  const selectModel = (idx) => {
    if (idx === activeIndex) return;
    setActiveIndex(idx);
  };

  // Wheel scroll on carousel container revolves the orbit smoothly
  const handleWheel = (e) => {
    // If user is scrolling over the 3D carousel, scroll navigates through models
    if (Math.abs(e.deltaY) > 30 || Math.abs(e.deltaX) > 30) {
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      setTimeout(() => { wheelLockRef.current = false; }, 420);

      if (e.deltaY > 0 || e.deltaX > 0) {
        rotateNext();
      } else {
        rotatePrev();
      }
    }
  };

  // Touch Swipe for mobile/tablet
  const handleTouchStart = (e) => {
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartRef.current === null) return;
    const diff = touchStartRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) rotateNext();
      else rotatePrev();
    }
    touchStartRef.current = null;
  };

  // Listen to model-viewer loading progress
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    setModelLoading(true);
    setModelLoadProgress(15);

    const handleProgress = (event) => {
      const progress = Math.round(event.detail.totalProgress * 100);
      setModelLoadProgress(progress);
      if (progress >= 100) {
        setTimeout(() => setModelLoading(false), 200);
      }
    };

    const handleLoad = () => {
      setModelLoading(false);
      setModelLoadProgress(100);
    };

    viewer.addEventListener('progress', handleProgress);
    viewer.addEventListener('load', handleLoad);

    return () => {
      viewer.removeEventListener('progress', handleProgress);
      viewer.removeEventListener('load', handleLoad);
    };
  }, [activeIndex]);

  // Orbit 3D Position Configurations for 5 items
  // offset: 0 = active/front, 1 = right-mid, 2 = right-back, 3 = left-back, 4 = left-mid
  const getOrbitTransform = (offset) => {
    switch (offset) {
      case 0:
        return {
          transform: 'translate3d(0, 0, 80px) scale(1)',
          opacity: 1,
          filter: 'blur(0px)',
          zIndex: 30,
          pointerEvents: 'auto'
        };
      case 1:
        return {
          transform: 'translate3d(52%, -24px, -40px) scale(0.70)',
          opacity: 0.65,
          filter: 'blur(1.5px)',
          zIndex: 20,
          pointerEvents: 'auto'
        };
      case 2:
        return {
          transform: 'translate3d(28%, -50px, -120px) scale(0.48)',
          opacity: 0.35,
          filter: 'blur(3px)',
          zIndex: 10,
          pointerEvents: 'auto'
        };
      case 3:
        return {
          transform: 'translate3d(-28%, -50px, -120px) scale(0.48)',
          opacity: 0.35,
          filter: 'blur(3px)',
          zIndex: 10,
          pointerEvents: 'auto'
        };
      case 4:
        return {
          transform: 'translate3d(-52%, -24px, -40px) scale(0.70)',
          opacity: 0.65,
          filter: 'blur(1.5px)',
          zIndex: 20,
          pointerEvents: 'auto'
        };
      default:
        return {
          transform: 'translate3d(0, 0, -200px) scale(0.3)',
          opacity: 0,
          filter: 'blur(6px)',
          zIndex: 0,
          pointerEvents: 'none'
        };
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full select-none ${className}`}
      style={{ perspective: '1200px' }}
    >
      {/* Seamless Ambient Radial Ground Glow */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
        <div
          className="w-[500px] sm:w-[650px] lg:w-[800px] h-[340px] sm:h-[420px] rounded-full blur-3xl opacity-35 transition-all duration-1000 ease-out"
          style={{
            background: `radial-gradient(ellipse at center, ${activeModel.accentColor} 0%, rgba(198,159,111,0.2) 40%, transparent 75%)`
          }}
        />
      </div>

      {/* Elliptical 3D Orbit Ring Visualization */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-5">
        <div className="w-[86%] max-w-[680px] h-[320px] rounded-[50%] border border-dashed border-camel-500/25 dark:border-camel-400/20 [transform:rotateX(72deg)_translateY(60px)] shadow-[0_0_40px_rgba(198,159,111,0.06)]" />
      </div>

      {/* Ground Shadow & Stage Pedestal for Front Model */}
      <div className="absolute bottom-12 sm:bottom-16 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-12 rounded-[50%] bg-onyx-950/20 dark:bg-black/60 blur-xl pointer-events-none -z-5" />

      {/* =========================================================================
          THE 3D REVOLVING CIRCULAR ORBIT STAGE
      ========================================================================= */}
      <div className="relative w-full h-[520px] sm:h-[620px] lg:h-[680px] flex items-center justify-center">
        {ORBIT_MODELS.map((model, idx) => {
          const offset = (idx - activeIndex + ORBIT_MODELS.length) % ORBIT_MODELS.length;
          const isFront = offset === 0;
          const style = getOrbitTransform(offset);

          return (
            <div
              key={model.id}
              onClick={() => !isFront && selectModel(idx)}
              className="absolute top-0 bottom-0 left-0 right-0 m-auto w-full max-w-[440px] sm:max-w-[520px] h-[480px] sm:h-[580px] flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={style}
            >
              {isFront ? (
                /* ================= FRONT LIVE 3D MODEL ================= */
                <div className="relative w-full h-full flex items-center justify-center group">
                  
                  {/* Subtle Loading Progress Bar */}
                  {modelLoading && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 flex items-center space-x-2.5 px-4 py-2 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-800 shadow-xl">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-camel-500 border-t-transparent animate-spin" />
                      <span className="text-[11px] font-mono tracking-wider text-onyx-900 dark:text-linen-100">
                        Synthesizing 3D Mesh {modelLoadProgress > 0 ? `${modelLoadProgress}%` : ''}
                      </span>
                    </div>
                  )}

                  {/* Active 3D Model Viewer with 360° Drag & Zoom */}
                  <model-viewer
                    ref={viewerRef}
                    key={model.modelSrc}
                    src={model.modelSrc}
                    alt={model.name}
                    camera-controls
                    touch-action="pan-y"
                    auto-rotate={autoRotate ? "" : null}
                    auto-rotate-delay="0"
                    rotation-per-second="18deg"
                    shadow-intensity="1.6"
                    shadow-softness="0.7"
                    camera-orbit={model.cameraOrbit}
                    min-camera-orbit="auto auto 15%"
                    max-camera-orbit="auto auto 280%"
                    loading="eager"
                    reveal="auto"
                    style={{
                      width: '100%',
                      height: '100%',
                      outline: 'none',
                      '--poster-color': 'transparent'
                    }}
                  />

                  {/* Front Model Tag Badge */}
                  <div className="absolute top-4 left-4 z-30 pointer-events-none">
                    <span className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-linen-100/95 dark:bg-onyx-900/95 backdrop-blur-md border border-linen-300 dark:border-onyx-800 text-xs font-mono tracking-wider text-onyx-900 dark:text-linen-100 shadow-md">
                      <span className="w-2 h-2 rounded-full bg-camel-500 animate-pulse" />
                      <span className="font-bold">{model.tag}</span>
                    </span>
                  </div>

                  {/* Interactive Turntable & Reset Controls */}
                  <div className="absolute bottom-4 right-4 z-30 flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAutoRotate(!autoRotate);
                      }}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-wider border backdrop-blur-md transition shadow-md ${
                        autoRotate
                          ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 border-olive-700'
                          : 'bg-linen-100/90 dark:bg-onyx-900/90 text-onyx-800 dark:text-linen-200 border-linen-300 dark:border-onyx-800 hover:border-camel-500'
                      }`}
                    >
                      {autoRotate ? 'Turntable Active' : 'Start Turntable'}
                    </button>
                    {onAddToCart && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart({
                            id: `orbit-${model.id}`,
                            name: model.name,
                            price: model.price,
                            images: [model.previewImg],
                            primaryColor: model.accentName,
                            category: model.category
                          });
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-olive-800 hover:bg-olive-900 dark:bg-camel-500 dark:hover:bg-camel-600 text-linen-100 dark:text-onyx-950 font-mono text-[10px] font-bold uppercase tracking-wider transition shadow-md active:scale-95"
                      >
                        Add Active Look
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                /* ================= BACKGROUND LIVE 3D ORBIT NODE ================= */
                <div
                  className="group relative w-full h-full flex flex-col items-center justify-center cursor-pointer transition transform hover:scale-105"
                  title={`Click to orbit ${model.name} to front`}
                >
                  {/* Glowing Circular 3D Pedestal Disc */}
                  <div
                    className="w-48 sm:w-56 h-48 sm:h-56 rounded-full border border-linen-400/40 dark:border-onyx-700/60 flex flex-col items-center justify-center relative overflow-hidden backdrop-blur-sm transition-all duration-500 group-hover:border-camel-500 group-hover:shadow-[0_0_35px_rgba(198,159,111,0.35)] shadow-xl"
                    style={{
                      background: `radial-gradient(circle, ${model.accentColor}44 0%, rgba(20,20,20,0.7) 100%)`
                    }}
                  >
                    {/* Real Live 3D Model inside Orbit Circle (No 2D Image) */}
                    <model-viewer
                      src={model.modelSrc}
                      alt={model.name}
                      loading="lazy"
                      reveal="auto"
                      auto-rotate
                      rotation-per-second="14deg"
                      shadow-intensity="1.2"
                      shadow-softness="0.8"
                      camera-orbit={model.cameraOrbit}
                      interaction-prompt="none"
                      style={{
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                        '--poster-color': 'transparent'
                      }}
                    />

                    {/* Orbit Ring Indicator Glow */}
                    <div className="absolute inset-0 rounded-full border border-camel-400/25 group-hover:border-camel-400/60 pointer-events-none" />

                    {/* Quick Orbit Action Pill on Hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-onyx-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <span className="px-3.5 py-1.5 rounded-full bg-linen-100 dark:bg-onyx-900 text-onyx-950 dark:text-linen-100 text-[10px] font-mono tracking-wider font-bold shadow-xl border border-camel-500/40">
                        Orbit to Front ↻
                      </span>
                    </div>
                  </div>

                  {/* Garment Title Badge Underneath Orbit Disc */}
                  <div className="mt-3 text-center px-2">
                    <span className="text-[10px] font-mono tracking-widest uppercase text-camel-600 dark:text-camel-400 block font-semibold">
                      0{idx + 1} • {model.category}
                    </span>
                    <h4 className="font-editorial text-sm sm:text-base font-bold text-onyx-900 dark:text-linen-100 truncate max-w-[200px]">
                      {model.name}
                    </h4>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          ORBIT NAVIGATION: ARROWS & REVOLVING GARMENT SELECTOR PILLS
      ========================================================================= */}
      <div className="relative z-30 max-w-4xl mx-auto px-4 mt-2 sm:mt-4">
        
        {/* Next / Prev Orbit Navigation Chevrons */}
        <div className="flex items-center justify-between pointer-events-none mb-3">
          <button
            onClick={rotatePrev}
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-800 text-onyx-900 dark:text-linen-100 hover:border-camel-500 hover:text-camel-500 transition shadow-lg active:scale-95"
            aria-label="Orbit Previous Garment"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Active Garment Micro-Card */}
          <div className="pointer-events-auto text-center px-4 py-2 rounded-2xl bg-linen-100/80 dark:bg-onyx-900/80 backdrop-blur-md border border-linen-300 dark:border-onyx-800 shadow-lg">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-camel-600 dark:text-camel-400 font-bold block">
              Now Front • 0{activeIndex + 1} of 05
            </span>
            <div className="flex items-center space-x-3 justify-center mt-0.5">
              <span className="font-editorial text-base sm:text-lg font-bold text-onyx-950 dark:text-linen-50">
                {activeModel.name}
              </span>
              <span className="font-mono text-xs sm:text-sm font-bold text-olive-800 dark:text-camel-400">
                {activeModel.formattedPrice}
              </span>
            </div>
          </div>

          <button
            onClick={rotateNext}
            className="pointer-events-auto p-3 sm:p-4 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-800 text-onyx-900 dark:text-linen-100 hover:border-camel-500 hover:text-camel-500 transition shadow-lg active:scale-95"
            aria-label="Orbit Next Garment"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 5 Garment Carousel Pill Selectors */}
        <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          {ORBIT_MODELS.map((m, idx) => {
            const isActive = activeIndex === idx;
            return (
              <button
                key={m.id}
                onClick={() => selectModel(idx)}
                className={`group px-3.5 py-1.5 rounded-full text-xs font-mono transition-all duration-300 flex items-center space-x-2 border whitespace-nowrap ${
                  isActive
                    ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 border-olive-700 shadow-md font-bold scale-105'
                    : 'bg-linen-100/80 dark:bg-onyx-900/80 text-onyx-700 dark:text-linen-300 border-linen-300 dark:border-onyx-800 hover:border-camel-400'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: m.accentColor }}
                />
                <span>{m.name.split(' ')[0]} {m.name.split(' ')[1] || ''}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
}
