import {useModelViewer} from '../hooks/useModelViewer';
import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Mannequin3D - Real 3D GLB Model Viewer (puff_sleeve_and_jumper_skirt.glb)
 * Renders the user-provided 3D GLB asset with full 360° rotation, turntable auto-rotate,
 * camera controls, studio lighting, and dynamic clothing recoloring on the 3D meshes (shirt1 & skirt1).
 */
export default function Mannequin3D({
  person = 'women',
  equippedOutfit = {},
  products = [],
  lightingMode = 'studio', // 'studio' | 'warm'
  autoRotateDefault = false,
  className = ""
}) {
  useModelViewer();
  const modelViewerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(autoRotateDefault);
  const [currentOrbit, setCurrentOrbit] = useState('0deg 75deg 105%');
  const [activeAngleLabel, setActiveAngleLabel] = useState('Front (0°)');

  // Direct 3D color overrides (when user clicks color dots on the 3D viewer)
  const [topColorOverride, setTopColorOverride] = useState(null);
  const [skirtColorOverride, setSkirtColorOverride] = useState(null);

  // Convert HEX to RGB [0-255]
  const hexToRgb = (hex, fallback = [54, 70, 52]) => {
    if (!hex) return fallback;
    const clean = hex.replace('#', '');
    if (clean.length === 3) {
      return [
        parseInt(clean[0] + clean[0], 16),
        parseInt(clean[1] + clean[1], 16),
        parseInt(clean[2] + clean[2], 16)
      ];
    }
    if (clean.length === 6) {
      return [
        parseInt(clean.slice(0, 2), 16),
        parseInt(clean.slice(2, 4), 16),
        parseInt(clean.slice(4, 6), 16)
      ];
    }
    return fallback;
  };

  // Find equipped products from catalog
  const getProduct = (slot) => {
    const item = equippedOutfit[slot];
    if (!item || !item.id) return null;
    return products.find(p => p.id === item.id) || null;
  };

  const equippedTop = getProduct('top');
  const equippedBottom = getProduct('bottom');
  const equippedOuter = getProduct('outer');
  const equippedDress = getProduct('dress');

  // Compute active colors from equipped outfit or overrides
  const topItem = equippedOuter || equippedTop;
  const topSlot = equippedOuter ? 'outer' : 'top';
  const topVariantIdx = equippedOutfit[topSlot]?.variant || 0;
  const outfitTopColor = topItem
    ? (topItem.colors?.[topVariantIdx]?.hex || topItem.color || topItem.colors?.[0]?.hex || '#FAF8F5')
    : '#FAF8F5'; // Default crisp linen cream for blouse

  const bottomItem = equippedDress || equippedBottom;
  const bottomSlot = equippedDress ? 'dress' : 'bottom';
  const bottomVariantIdx = equippedOutfit[bottomSlot]?.variant || 0;
  const outfitSkirtColor = bottomItem
    ? (bottomItem.colors?.[bottomVariantIdx]?.hex || bottomItem.color || bottomItem.colors?.[0]?.hex || '#364634')
    : '#364634'; // Default heritage slow-fashion olive for jumper skirt

  // Clear overrides when outfit changes from the rack
  useEffect(() => {
    setTopColorOverride(null);
    setSkirtColorOverride(null);
  }, [equippedOutfit]);

  const activeTopColor = topColorOverride || outfitTopColor;
  const activeSkirtColor = skirtColorOverride || outfitSkirtColor;

  // Apply colors to the 3D model materials
  const applyMaterials = useCallback(() => {
    const viewer = modelViewerRef.current;
    if (!viewer || !viewer.model) return;

    try {
      const shirtMat = viewer.model.getMaterialByName?.('shirt1') || viewer.model.materials?.find(m => m.name === 'shirt1');
      const skirtMat = viewer.model.getMaterialByName?.('skirt1') || viewer.model.materials?.find(m => m.name === 'skirt1');

      // Top / Shirt coloring (puff sleeve blouse)
      if (shirtMat && shirtMat.pbrMetallicRoughness) {
        const [r, g, b] = hexToRgb(activeTopColor, [250, 248, 245]);
        shirtMat.pbrMetallicRoughness.setBaseColorFactor([r / 255, g / 255, b / 255, 1.0]);
        if (typeof shirtMat.pbrMetallicRoughness.setRoughnessFactor === 'function') {
          shirtMat.pbrMetallicRoughness.setRoughnessFactor(0.85);
        }
        if (typeof shirtMat.pbrMetallicRoughness.setMetallicFactor === 'function') {
          shirtMat.pbrMetallicRoughness.setMetallicFactor(0.04);
        }
      }

      // Skirt / Jumper / Dress coloring (jumper skirt)
      if (skirtMat && skirtMat.pbrMetallicRoughness) {
        const [r, g, b] = hexToRgb(activeSkirtColor, [54, 70, 52]);
        skirtMat.pbrMetallicRoughness.setBaseColorFactor([r / 255, g / 255, b / 255, 1.0]);
        if (typeof skirtMat.pbrMetallicRoughness.setRoughnessFactor === 'function') {
          skirtMat.pbrMetallicRoughness.setRoughnessFactor(0.85);
        }
        if (typeof skirtMat.pbrMetallicRoughness.setMetallicFactor === 'function') {
          skirtMat.pbrMetallicRoughness.setMetallicFactor(0.04);
        }
      }
    } catch (err) {
      console.warn("Could not set material colors on 3D model:", err);
    }
  }, [activeTopColor, activeSkirtColor]);

  // Hook into model load event
  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      setIsLoaded(true);
      applyMaterials();
    };

    viewer.addEventListener('load', handleLoad);
    return () => {
      viewer.removeEventListener('load', handleLoad);
    };
  }, [applyMaterials]);

  // Re-apply materials when outfit or overrides change
  useEffect(() => {
    if (isLoaded) {
      applyMaterials();
    }
  }, [isLoaded, applyMaterials]);

  // Preset angle buttons
  const setPresetAngle = (label, orbit) => {
    setActiveAngleLabel(label);
    setAutoRotate(false);
    setCurrentOrbit(orbit);
    const viewer = modelViewerRef.current;
    if (viewer) {
      viewer.cameraOrbit = orbit;
    }
  };

  // Reset camera view
  const handleResetCamera = () => {
    setAutoRotate(false);
    setActiveAngleLabel('Front (0°)');
    const viewer = modelViewerRef.current;
    if (viewer) {
      viewer.cameraOrbit = '0deg 75deg 105%';
      viewer.fieldOfView = 'auto';
    }
  };

  // Quick zoom controls
  const handleZoom = (direction) => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;
    try {
      if (typeof viewer.zoom === 'function') {
        viewer.zoom(direction === 'in' ? 1 : -1);
      }
    } catch (e) {
      console.warn("Zoom error:", e);
    }
  };

  const isWarm = lightingMode === 'warm';

  // Quick signature palette swatches for the 3D model
  const paletteSwatches = [
    { label: 'Olive Green', hex: '#364634' },
    { label: 'Desert Camel', hex: '#C69F6F' },
    { label: 'Obsidian Black', hex: '#111315' },
    { label: 'Linen White', hex: '#FAF8F5' },
    { label: 'Terracotta', hex: '#99583D' }
  ];

  return (
    <div className={`relative select-none flex flex-col items-center ${className}`}>
      
      {/* 3D Stage Container */}
      <div className="relative w-full h-[520px] sm:h-[580px] flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-linen-200/50 via-linen-100 to-linen-200/30 dark:from-onyx-900/60 dark:via-onyx-950 dark:to-onyx-900/40 border border-linen-300 dark:border-onyx-800 transition-colors shadow-inner">
        
        {/* Dynamic Studio Lighting Ambient Backlight */}
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-700"
          style={{
            background: isWarm
              ? 'radial-gradient(circle at 50% 35%, rgba(198,159,111,0.25) 0%, rgba(54,70,52,0.06) 55%, transparent 80%)'
              : 'radial-gradient(circle at 50% 35%, rgba(250,248,245,0.45) 0%, rgba(54,70,52,0.06) 55%, transparent 80%)'
          }}
        />

        {/* Google model-viewer Web Component for the GLB file */}
        <model-viewer
          ref={modelViewerRef}
          src="/models/model.glb"
          alt="3D Apparel Model (Puff Sleeve and Jumper Skirt)"
          camera-controls
          touch-action="pan-y"
          auto-rotate={autoRotate ? "" : null}
          auto-rotate-delay="0"
          rotation-per-second="20deg"
          shadow-intensity="1.3"
          shadow-softness="0.75"
          exposure={isWarm ? "1.15" : "1.0"}
          camera-orbit={currentOrbit}
          min-camera-orbit="auto auto 5%"
          max-camera-orbit="auto auto 300%"
          style={{
            width: '100%',
            height: '100%',
            outline: 'none',
            '--poster-color': 'transparent'
          }}
        >
          {/* Loading Slot Overlay */}
          {!isLoaded && (
            <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-linen-100/90 dark:bg-onyx-950/90 text-xs font-mono space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-olive-800 dark:border-camel-400 border-t-transparent animate-spin" />
              <p className="text-onyx-700 dark:text-linen-300 tracking-wider uppercase">Loading 3D Model...</p>
            </div>
          )}
        </model-viewer>

        {/* Live Orbit Badge */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-linen-300 dark:border-onyx-700 text-[11px] font-mono text-onyx-800 dark:text-linen-200 shadow-sm pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-olive-600 dark:bg-camel-400 animate-pulse"></span>
          <span>3D GLB • {activeAngleLabel}</span>
        </div>

        {/* Drag to Rotate Hint overlay (visible when loaded) */}
        {isLoaded && !autoRotate && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-linen-300 dark:border-onyx-700 text-[10px] tracking-wider uppercase text-onyx-600 dark:text-linen-400 shadow-sm flex items-center space-x-2 animate-pulse">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8m8 8a8 8 0 01-8 8m-6-3l-3 3 3 3m12-18l3 3-3 3" />
            </svg>
            <span>Drag to rotate 360° • Pinch / Scroll to zoom</span>
          </div>
        )}

        {/* Floating Quick Camera & Zoom Controls on Top-Right */}
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          {/* Auto-rotate turntable toggle */}
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`p-2.5 rounded-full backdrop-blur-md border transition text-xs shadow-md active:scale-95 ${
              autoRotate
                ? 'bg-olive-800 text-linen-100 border-olive-700 dark:bg-camel-500 dark:text-onyx-950 dark:border-camel-400 ring-2 ring-olive-700/30'
                : 'bg-linen-100/90 dark:bg-onyx-900/90 text-onyx-800 dark:text-linen-200 border-linen-300 dark:border-onyx-700 hover:bg-linen-200 dark:hover:bg-onyx-800'
            }`}
            title={autoRotate ? "Pause 360° Turntable" : "Start 360° Turntable Auto-Rotate"}
            aria-label="Auto-Rotate"
          >
            <svg className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Zoom In */}
          <button
            onClick={() => handleZoom('in')}
            className="p-2.5 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-700 text-onyx-800 dark:text-linen-200 hover:bg-linen-200 dark:hover:bg-onyx-800 transition text-xs shadow-md active:scale-95"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* Zoom Out */}
          <button
            onClick={() => handleZoom('out')}
            className="p-2.5 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-700 text-onyx-800 dark:text-linen-200 hover:bg-linen-200 dark:hover:bg-onyx-800 transition text-xs shadow-md active:scale-95"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
            </svg>
          </button>

          {/* Reset Camera View */}
          <button
            onClick={handleResetCamera}
            className="p-2.5 rounded-full bg-linen-100/90 dark:bg-onyx-900/90 backdrop-blur-md border border-linen-300 dark:border-onyx-700 text-onyx-800 dark:text-linen-200 hover:bg-linen-200 dark:hover:bg-onyx-800 transition text-xs shadow-md active:scale-95"
            title="Reset 3D Camera View"
            aria-label="Reset View"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preset Angle Buttons Bar */}
      <div className="w-full mt-3.5 flex items-center justify-between gap-2 px-1">
        <span className="text-[10px] uppercase font-mono tracking-wider text-onyx-500 dark:text-linen-400 hidden sm:inline">
          View Angle:
        </span>
        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
          {[
            { label: 'Front (0°)', orbit: '0deg 75deg 105%' },
            { label: '3/4 Right (45°)', orbit: '45deg 75deg 105%' },
            { label: 'Right (90°)', orbit: '90deg 75deg 105%' },
            { label: 'Back (180°)', orbit: '180deg 75deg 105%' },
            { label: '3/4 Left (315°)', orbit: '315deg 75deg 105%' },
          ].map(p => (
            <button
              key={p.label}
              onClick={() => setPresetAngle(p.label, p.orbit)}
              className={`text-[10px] font-medium tracking-wide uppercase px-3 py-1.5 rounded-lg border transition active:scale-95 whitespace-nowrap shadow-sm ${
                activeAngleLabel === p.label
                  ? 'bg-olive-800 text-linen-100 border-olive-700 dark:bg-camel-500 dark:text-onyx-950 dark:border-camel-400 font-bold'
                  : 'bg-linen-100 dark:bg-onyx-900 text-onyx-700 dark:text-linen-300 border-linen-300 dark:border-onyx-800 hover:bg-linen-200 dark:hover:bg-onyx-800'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Real-time 3D Garment Color Control Bar */}
      <div className="w-full mt-4 p-3 rounded-2xl bg-linen-200/50 dark:bg-onyx-900/60 border border-linen-300 dark:border-onyx-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
        {/* Blouse Color */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase text-onyx-600 dark:text-linen-400">Blouse / Top:</span>
          <div className="flex items-center space-x-1.5">
            {paletteSwatches.map(s => (
              <button
                key={s.label}
                onClick={() => setTopColorOverride(s.hex)}
                className={`w-5 h-5 rounded-full border transition transform active:scale-90 ${
                  activeTopColor.toLowerCase() === s.hex.toLowerCase()
                    ? 'ring-2 ring-olive-700 dark:ring-camel-400 scale-110 shadow-sm'
                    : 'border-black/15 hover:scale-105'
                }`}
                style={{ backgroundColor: s.hex }}
                title={`Top: ${s.label}`}
              />
            ))}
          </div>
        </div>

        {/* Skirt Color */}
        <div className="flex items-center space-x-2">
          <span className="text-[10px] uppercase text-onyx-600 dark:text-linen-400">Jumper Skirt:</span>
          <div className="flex items-center space-x-1.5">
            {paletteSwatches.map(s => (
              <button
                key={s.label}
                onClick={() => setSkirtColorOverride(s.hex)}
                className={`w-5 h-5 rounded-full border transition transform active:scale-90 ${
                  activeSkirtColor.toLowerCase() === s.hex.toLowerCase()
                    ? 'ring-2 ring-olive-700 dark:ring-camel-400 scale-110 shadow-sm'
                    : 'border-black/15 hover:scale-105'
                }`}
                style={{ backgroundColor: s.hex }}
                title={`Skirt: ${s.label}`}
              />
            ))}
          </div>
        </div>

        {/* Clear custom overrides */}
        {(topColorOverride || skirtColorOverride) && (
          <button
            onClick={() => {
              setTopColorOverride(null);
              setSkirtColorOverride(null);
            }}
            className="text-[10px] text-camel-600 dark:text-camel-400 hover:underline uppercase tracking-wide self-end sm:self-auto"
          >
            Sync with Rack
          </button>
        )}
      </div>

    </div>
  );
}
