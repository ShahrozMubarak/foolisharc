import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { COLOR_PALETTE_INFO } from '../data/products';
import SEOHead from '../components/SEOHead';
import { PAGE_META } from '../utils/seoHead';

export default function AboutPage() {
  const [copiedHex, setCopiedHex] = useState(null);

  const handleCopyHex = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const paletteArray = Object.values(COLOR_PALETTE_INFO || {});

  const craftSteps = [
    {
      num: "01",
      title: "Botanical Sourcing",
      description: "Direct partnerships with certified organic flax and cashmere growers. Zero synthetics."
    },
    {
      num: "02",
      title: "River-Washed Natural Dyes",
      description: "Natural pigments and botanical oxides that patina gracefully with time and wear."
    },
    {
      num: "03",
      title: "Architectural Draping",
      description: "Calibrated 3D digital simulation paired with traditional master patternmaking."
    },
    {
      num: "04",
      title: "Permanent Longevity",
      description: "Reinforced French seams and natural horn closures crafted to endure across generations."
    }
  ];

  const fiberShowcases = [
    {
      name: "Belgian Organic Flax Linen",
      origin: "Kortrijk, Belgium",
      image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Grade-A Mongolian Cashmere",
      origin: "Alashan Plateau",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Kurabo Shuttle-Loomed Selvedge",
      origin: "Okayama, Japan",
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80"
    },
    {
      name: "Full-Grain Nappa Leather",
      origin: "Lahore Atelier",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title={PAGE_META.story.title}
        description={PAGE_META.story.description}
        canonical={PAGE_META.story.canonical}
        ogType={PAGE_META.story.ogType}
        ogTitle="FOOLISH ARC Atelier | Architectural Slow Luxury Pret"
        ogDescription="FOOLISH ARC crafts high-character, permanent garments in an intentional four-tone earth palette. Private sittings in Gulberg, Lahore by appointment."
        ogImage="https://foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-24 sm:space-y-32">
        
        {/* =========================================================================
            1. HERO SECTION - AIRY & SOPHISTICATED
        ========================================================================= */}
        <section className="pt-6 pb-12 border-b border-[#E8E0D5] dark:border-[#2C241D]">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] dark:bg-[#1A1613] text-[#8C6A3E] dark:text-[#E6D3B3] border border-[#E6D3B3] dark:border-[#382F26] text-xs font-mono tracking-widest uppercase shadow-2xs">
              <img 
                src="/images/brand/foolish/arc_emblem.png" 
                alt="FOOLISH ARC Emblem" 
                className="w-4 h-2 object-contain invert dark:invert-0" 
              />
              <span>FOOLISH ARC Atelier</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-6xl font-light tracking-tight text-[#1C1612] dark:text-white leading-[1.1]">
              Architectural drape, shaped by earth and patience.
            </h1>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-light leading-relaxed max-w-2xl">
              FOOLISH ARC crafts high-character, permanent garments in an intentional four-tone earth palette: 
              Olive Green, Desert Camel, Obsidian Black, and Alabaster Linen. Silhouettes sculpted to outlast trends.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                to="/shop"
                className="px-7 py-3.5 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest transition shadow-sm active:scale-95"
              >
                Explore Collection
              </Link>
              <Link
                to="/shop?cat=women"
                className="px-7 py-3.5 rounded-xl border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E] text-[#1C1612] dark:text-white hover:text-[#9A6E3E] font-bold text-xs uppercase tracking-widest transition active:scale-95"
              >
                Women's Pret →
              </Link>
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. THE 4-TONE HARMONIC PALETTE (AIRY, CLEAN CARDS)
        ========================================================================= */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold block">
              Color Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wide mt-1 text-[#1C1612] dark:text-white">
              The 4-Tone Spectrum
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paletteArray.map((c) => {
              const isCopied = copiedHex === c.hex;
              return (
                <div
                  key={c.name}
                  onClick={() => handleCopyHex(c.hex)}
                  className="group cursor-pointer rounded-2xl overflow-hidden border border-[#E8E0D5] dark:border-[#2C241D] bg-white dark:bg-[#1A1613] shadow-xs hover:shadow-md transition-all duration-300"
                >
                  {/* Color Swatch */}
                  <div
                    className="h-40 w-full relative p-4 flex flex-col justify-between"
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm self-start font-bold">
                      {isCopied ? 'Copied ✓' : 'Copy Hex'}
                    </span>
                    <span className="text-xs font-mono text-white/95 self-end font-bold drop-shadow-sm">
                      {c.hex}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="p-5 space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold block">
                      {c.role}
                    </span>
                    <h3 className="text-lg font-serif font-bold text-[#1C1612] dark:text-white">
                      {c.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            3. SUSTAINABLE FIBER PROVENANCE
        ========================================================================= */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold block">
              Textile Provenance
            </span>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wide mt-1 text-[#1C1612] dark:text-white">
              Master Raw Fibers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fiberShowcases.map((fiber) => (
              <div
                key={fiber.name}
                className="rounded-2xl overflow-hidden border border-[#E8E0D5] dark:border-[#2C241D] bg-white dark:bg-[#1A1613] shadow-xs group transition"
              >
                <div className="h-48 overflow-hidden relative">
                  <img
                    src={fiber.image}
                    alt={fiber.name}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[10px] font-mono">
                    {fiber.origin}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-serif text-base font-bold text-[#1C1612] dark:text-white">
                    {fiber.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            4. METHODOLOGY
        ========================================================================= */}
        <section className="space-y-8">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold block">
              Atelier Methodology
            </span>
            <h2 className="text-2xl sm:text-3xl font-light uppercase tracking-wide mt-1 text-[#1C1612] dark:text-white">
              The Craft Standard
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {craftSteps.map((step) => (
              <div
                key={step.num}
                className="p-6 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] space-y-3"
              >
                <span className="font-serif text-3xl font-bold text-[#9A6E3E]">
                  {step.num}
                </span>
                <h3 className="font-serif text-base font-bold text-[#1C1612] dark:text-white">
                  {step.title}
                </h3>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =========================================================================
            5. PRIVATE CONSULTATION BANNER
        ========================================================================= */}
        <section className="p-8 sm:p-12 rounded-3xl bg-[#1C1612] text-white border border-[#332A22] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#C69F6F] font-semibold block">
              Private Sittings • Gulberg, Lahore
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-white">
              Experience the Atelier in Person.
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-light leading-relaxed">
              Review raw textile bolts, consult on drape, and meet our master patternmakers by private appointment.
            </p>
          </div>

          <Link
            to="/contact"
            className="px-7 py-3.5 rounded-xl bg-[#C69F6F] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest transition shadow-md active:scale-95 shrink-0"
          >
            Request Appointment
          </Link>
        </section>

      </div>
    </div>
  );
}
