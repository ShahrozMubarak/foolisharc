import {useModelViewer} from '../hooks/useModelViewer';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { isReducedMotionPreferred } from '../config/animations';

/**
 * Feature3DSection - Pinned interactive 3D feature showcase with scroll-scrub camera,
 * dynamic feature callouts with pointer indicator lines, and smooth angle transitions.
 */
export default function Feature3DSection({ className = "" }) {
  useModelViewer();
  const [activeStep, setActiveStep] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isManualControl, setIsManualControl] = useState(false);
  const viewerRef = useRef(null);
  const containerRef = useRef(null);
  const reducedMotion = isReducedMotionPreferred();

  const steps = [
    {
      id: 0,
      title: "100% Belgian Linen Twill",
      subtitle: "Fabric & Material",
      desc: "Woven on vintage slow-shuttle looms from raw European flax. Treated with organic garment-washing for a supple, lived-in handfeel that softens with every wear.",
      orbit: "0deg 75deg 105%",
      calloutX: "22%",
      calloutY: "32%",
      tag: "Pure Botanical",
      detail: "320 GSM Heavyweight"
    },
    {
      id: 1,
      title: "Sculptural Puff Sleeve",
      subtitle: "Artisanal Patternmaking",
      desc: "Engineered with subtle interior gathering and high armhole articulation, delivering dramatic silhouette volume without compromising everyday mobility.",
      orbit: "40deg 68deg 78%",
      calloutX: "32%",
      calloutY: "28%",
      tag: "Architectural Drape",
      detail: "Double-Needle Seams"
    },
    {
      id: 2,
      title: "Hand-Turned Horn Fastenings",
      subtitle: "Hardware & Closures",
      desc: "Each button is individually turned from ethically salvaged water-buffalo horn, then hand-sewn with cross-stitched thread stems to withstand decades of use.",
      orbit: "180deg 75deg 82%",
      calloutX: "68%",
      calloutY: "42%",
      tag: "Heirloom Grade",
      detail: "Concealed Placket"
    },
    {
      id: 3,
      title: "Reinforced French Hemline",
      subtitle: "Tailoring Longevity",
      desc: "Finished with a wide 4cm blind-catch bottom hem and bias-bound interior seams to prevent fraying and maintain the skirt’s natural pendulum swing.",
      orbit: "315deg 82deg 88%",
      calloutX: "72%",
      calloutY: "72%",
      tag: "Clean Interior",
      detail: "Bias-Bound Finish"
    }
  ];

  // Scroll spy to advance step when scrolling through section
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Check if container is in view
      if (rect.top <= windowHeight * 0.4 && rect.bottom >= windowHeight * 0.3) {
        const totalTravel = rect.height - windowHeight;
        const currentProgress = Math.max(0, Math.min(1, -rect.top / Math.max(1, totalTravel)));
        const newStep = Math.min(steps.length - 1, Math.floor(currentProgress * steps.length));
        
        if (newStep !== activeStep && !isManualControl) {
          setActiveStep(newStep);
          if (viewerRef.current) {
            viewerRef.current.cameraOrbit = steps[newStep].orbit;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeStep, isManualControl, reducedMotion, steps]);

  const handleStepSelect = (idx) => {
    setActiveStep(idx);
    setIsManualControl(false);
    setAutoRotate(false);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = steps[idx].orbit;
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setIsManualControl(false);
    setAutoRotate(false);
    if (viewerRef.current) {
      viewerRef.current.cameraOrbit = steps[0].orbit;
    }
  };

  const current = steps[activeStep];

  return (
    <section
      ref={containerRef}
      className={`relative py-16 sm:py-24 bg-gradient-to-b from-linen-100 via-linen-200/50 to-linen-100 dark:from-onyx-950 dark:via-onyx-900/60 dark:to-onyx-950 border-y border-linen-300 dark:border-onyx-800 transition-colors ${className}`}
    >
      <div className="max-w-[1500px] mx-auto px-4 sm:px-8 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-6 border-b border-linen-300 dark:border-onyx-800 gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-olive-700 dark:bg-camel-400 animate-pulse"></span>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-camel-600 dark:text-camel-400 font-semibold">
                Anatomy of an Atelier Masterpiece
              </span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-bold tracking-tight text-onyx-950 dark:text-linen-50 mt-1">
              Scrutinize Every Stitch.
            </h2>
            <p className="text-sm text-onyx-600 dark:text-linen-400 max-w-xl font-light mt-1">
              Explore the architectural draping of our signature puff sleeve & jumper skirt. 
              Drag to inspect in 360° or follow the tailored feature journey.
            </p>
          </div>

          {/* Interactive Mode & Fitting Room CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider border transition ${
                autoRotate
                  ? 'bg-olive-800 text-linen-100 dark:bg-camel-500 dark:text-onyx-950 border-olive-700'
                  : 'bg-linen-100 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 border-linen-300 dark:border-onyx-800'
              }`}
            >
              {autoRotate ? 'Turntable Active' : 'Start Turntable'}
            </button>

            <Link
              to="/fitting-room"
              className="px-4 py-1.5 rounded-full bg-onyx-950 dark:bg-linen-100 text-linen-100 dark:text-onyx-950 font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-sm"
            >
              Enter Fitting Room →
            </Link>
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Interactive Step Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
            {steps.map((step, idx) => {
              const isActive = activeStep === idx;
              return (
                <div
                  key={step.id}
                  onClick={() => handleStepSelect(idx)}
                  className={`cursor-pointer p-5 rounded-2xl border transition-all duration-300 relative ${
                    isActive
                      ? 'bg-linen-100 dark:bg-onyx-900 border-olive-800 dark:border-camel-400 shadow-lg scale-[1.02]'
                      : 'bg-linen-200/40 dark:bg-onyx-900/30 border-linen-300 dark:border-onyx-800 hover:border-camel-400/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-camel-600 dark:text-camel-400 font-bold">
                        0{idx + 1} • {step.subtitle}
                      </span>
                      <h3 className="font-editorial text-lg sm:text-xl font-bold text-onyx-950 dark:text-linen-50 mt-0.5">
                        {step.title}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-linen-200 dark:bg-onyx-800 text-onyx-700 dark:text-linen-300 font-bold">
                      {step.detail}
                    </span>
                  </div>

                  <p className="text-xs text-onyx-600 dark:text-linen-400 font-light leading-relaxed mt-2">
                    {step.desc}
                  </p>

                  {/* Active highlight bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-olive-700 dark:bg-camel-400 rounded-r-full" />
                  )}
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-2 px-1 text-xs font-mono text-onyx-500 dark:text-linen-400">
              <span>Scroll to scrub or click points above</span>
              <button
                onClick={handleReset}
                className="hover:underline text-camel-600 dark:text-camel-400"
              >
                Reset Camera
              </button>
            </div>
          </div>

          {/* Right Column: 3D Canvas with Live Indicator Callout (7 cols) */}
          <div className="lg:col-span-7 relative order-1 lg:order-2">
            <div className="relative w-full h-[540px] sm:h-[620px] rounded-3xl bg-gradient-to-b from-linen-200/60 via-linen-100 to-linen-200/40 dark:from-onyx-900 dark:via-onyx-950 dark:to-onyx-900 border border-linen-300 dark:border-onyx-800 overflow-hidden shadow-2xl flex items-center justify-center">
              
              {/* Studio Light Glow */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(198,159,111,0.2)_0%,rgba(54,70,52,0.06)_60%,transparent_80%)]" />

              {/* 3D GLB Model Viewer */}
              <model-viewer
                ref={viewerRef}
                src="/models/model.glb"
                alt="Architectural Tailored 3D Jumper Skirt and Blouse"
                camera-controls
                touch-action="pan-y"
                auto-rotate={autoRotate ? "" : null}
                auto-rotate-delay="0"
                rotation-per-second="20deg"
                shadow-intensity="1.4"
                shadow-softness="0.8"
                camera-orbit={current.orbit}
                min-camera-orbit="auto auto 5%"
                max-camera-orbit="auto auto 300%"
                onMouseDown={() => setIsManualControl(true)}
                onTouchStart={() => setIsManualControl(true)}
                style={{
                  width: '100%',
                  height: '100%',
                  outline: 'none',
                  '--poster-color': 'transparent'
                }}
              />

              {/* Dynamic Callout Floating Pin (follows the active step) */}
              <div
                className="absolute z-20 pointer-events-none transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hidden sm:flex items-center space-x-3"
                style={{ top: current.calloutY, left: current.calloutX }}
              >
                {/* Glowing Pulse Ring */}
                <div className="relative flex items-center justify-center">
                  <span className="w-4 h-4 rounded-full bg-camel-500/40 animate-ping absolute" />
                  <span className="w-2.5 h-2.5 rounded-full bg-camel-500 shadow-md relative" />
                </div>

                {/* Connecting Callout Pill */}
                <div className="bg-linen-100/95 dark:bg-onyx-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-camel-500/40 shadow-lg text-[11px] font-mono font-bold text-onyx-950 dark:text-linen-100 whitespace-nowrap">
                  <span className="text-camel-600 dark:text-camel-400 mr-1.5">●</span>
                  <span>{current.tag}</span>
                </div>
              </div>

              {/* Free Exploration Hint */}
              <div className="absolute bottom-4 left-4 z-10 bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md px-3.5 py-1 rounded-full border border-linen-300 dark:border-onyx-700 text-[10px] font-mono text-onyx-600 dark:text-linen-400">
                <span>Free 360° Drag & Zoom Enabled</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
