import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title="Size Guide | FOOLISH ARC"
        description="FOOLISH ARC Size Guide. Find your fit for men's, women's and kids' garments including barrel jeans, shirts and tailored trousers."
        canonical="/size-guide"
        ogType="website"
        ogTitle="Size Guide | FOOLISH ARC"
        ogDescription="FOOLISH ARC Size Guide. Find your fit across men's, women's and kids' collections."
        ogImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold">Size Guide</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
          Size Guide
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold mb-6">
          Find your atelier fit across men's, women's and kids' collections.
        </p>

        <div className="prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            Use our Fit Finder on any product page to match your body measurements to the exact garment
            silhouette. Below are general reference charts. Actual fit varies by style — check each product
            page for its specific size chart.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">How to Measure</h2>
          <ul className="list-disc pl-6 space-y-2 text-neutral-600 dark:text-neutral-300">
            <li><strong>Chest:</strong> Measure around the fullest part of your chest, keeping the tape level.</li>
            <li><strong>Waist:</strong> Measure around your natural waistline, just above the hip bone.</li>
            <li><strong>Hips:</strong> Measure around the fullest part of your hips.</li>
            <li><strong>Inseam:</strong> Measure from the top of your inner thigh down to the ankle.</li>
          </ul>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {[
              { label: "Men", person: "men" },
              { label: "Women", person: "women" },
              { label: "Kids", person: "kids" }
            ].map((g) => (
              <div key={g.label} className="rounded-2xl border border-[#E8E0D5] dark:border-[#2C241D] bg-white dark:bg-[#1A1613] p-5 shadow-xs">
                <h3 className="font-serif text-base font-bold text-[#1C1612] dark:text-white mb-3 uppercase tracking-wider text-xs">
                  {g.label}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">
                  [OWNER APPROVAL REQUIRED — insert {g.label} size chart: chest, waist, length, shoulder measurements by size.]
                </p>
              </div>
            ))}
          </div>

          <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-8">
            [OWNER APPROVAL REQUIRED — This size guide is a template. Populate with verified garment
            measurements before publishing.]
          </p>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/shop" className="px-6 py-3 bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition shadow-sm">
            Return to Collection
          </Link>
          <Link to="/contact" className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] hover:underline">
            Questions? Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
}
