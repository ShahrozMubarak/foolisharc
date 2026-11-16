import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title="Shipping and Delivery Policy | FOOLISH ARC"
        description="FOOLISH ARC Shipping and Delivery Policy. Delivery timeframes, coverage, and tracking for orders across Pakistan."
        canonical="/shipping"
        ogType="website"
        ogTitle="Shipping and Delivery Policy | FOOLISH ARC"
        ogDescription="FOOLISH ARC Shipping and Delivery Policy. Delivery timeframes, coverage, and tracking."
        ogImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold">Shipping &amp; Delivery</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold mb-6">
          Last updated: [OWNER APPROVAL REQUIRED — insert effective date]
        </p>

        <div className="prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            FOOLISH ARC ships orders placed on https://www.foolisharc.com/ to [OWNER APPROVAL REQUIRED —
            specify delivery coverage, e.g. nationwide Pakistan]. Delivery is handled by
            [OWNER APPROVAL REQUIRED — specify courier partner].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">1. Delivery Coverage</h2>
          <p>
            [OWNER APPROVAL REQUIRED — list cities/regions served, e.g. all major cities across Pakistan.]
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">2. Delivery Timeframe</h2>
          <p>
            Estimated delivery: [OWNER APPROVAL REQUIRED — specify, e.g. 2–3 business days nationwide after
            order confirmation]. Actual delivery dates may vary by location and courier availability.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">3. Delivery Charges</h2>
          <p>
            Delivery fee: [OWNER APPROVAL REQUIRED — specify free or amount in PKR]. Orders above
            [OWNER APPROVAL REQUIRED — specify threshold] may qualify for [OWNER APPROVAL REQUIRED —
            specify: complimentary delivery].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">4. Order Tracking</h2>
          <p>
            Once dispatched, you can track your consignment at
            <Link to="/track" className="underline">Track Order</Link> using your order number and the email
            address used at checkout.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">5. Delays & Issues</h2>
          <p>
            [OWNER APPROVAL REQUIRED — describe process for delayed, lost, or damaged deliveries and how to
            contact customer care.]
          </p>

          <div className="bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl p-6 mt-12">
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
              [OWNER APPROVAL REQUIRED — The delivery timeframe ("2–3 days nationwide") advertised on product
              pages must be confirmed before publishing as a binding commitment.]
            </p>
          </div>
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
