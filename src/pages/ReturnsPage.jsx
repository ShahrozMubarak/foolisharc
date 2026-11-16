import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title="Returns and Exchange Policy | FOOLISH ARC"
        description="FOOLISH ARC Returns and Exchange Policy. Eligibility, timeframe, and process for returning or exchanging garments."
        canonical="/returns"
        ogType="website"
        ogTitle="Returns and Exchange Policy | FOOLISH ARC"
        ogDescription="FOOLISH ARC Returns and Exchange Policy. Eligibility, timeframe, and process."
        ogImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold">Returns &amp; Exchanges</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
          Returns &amp; Exchange Policy
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold mb-6">
          Last updated: [OWNER APPROVAL REQUIRED — insert effective date]
        </p>

        <div className="prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            FOOLISH ARC accepts [OWNER APPROVAL REQUIRED — specify: returns and/or exchanges] on eligible
            garments purchased from https://www.foolisharc.com/. Review the conditions below before
            initiating a request.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">1. Eligibility</h2>
          <p>
            [OWNER APPROVAL REQUIRED — specify: unworn, unwashed, with tags attached, original packaging,
            within X days of delivery.] Made-to-measure or tailored items may be [OWNER APPROVAL REQUIRED —
            specify: non-returnable / exchange-only].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">2. Timeframe</h2>
          <p>
            Requests must be made within [OWNER APPROVAL REQUIRED — specify, e.g. 14 days] of delivery.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">3. Process</h2>
          <p>
            Contact [OWNER APPROVAL REQUIRED — specify contact channel] with your order number and reason.
            Approved returns will receive [OWNER APPROVAL REQUIRED — specify: return instructions /
            courier pickup details].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">4. Refunds & Exchanges</h2>
          <p>
            Refunds are issued [OWNER APPROVAL REQUIRED — specify: to original payment method / as store
            credit] within [OWNER APPROVAL REQUIRED — specify timeframe] after receipt of the returned item.
            Exchanges are subject to stock availability.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">5. Non-Returnable Items</h2>
          <p>
            [OWNER APPROVAL REQUIRED — specify: e.g. final sale items, custom-tailored garments, intimate
            wear, perishables.] Return shipping costs are [OWNER APPROVAL REQUIRED — specify: borne by
            customer / covered by us for defective items].
          </p>

          <div className="bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl p-6 mt-12">
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
              [OWNER APPROVAL REQUIRED — The "14-day exchanges" and "complimentary resizing" claims advertised
              on product pages must be confirmed before publishing as binding commitments.]
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
