import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title="Terms and Conditions | FOOLISH ARC"
        description="FOOLISH ARC Terms and Conditions governing the use of our website and purchase of goods."
        canonical="/terms"
        ogType="website"
        ogTitle="Terms and Conditions | FOOLISH ARC"
        ogDescription="FOOLISH ARC Terms and Conditions. Governing the use of our website and purchase of goods."
        ogImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold">Terms and Conditions</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
          Terms and Conditions
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold mb-6">
          Last updated: [OWNER APPROVAL REQUIRED — insert effective date]
        </p>

        <div className="prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            Welcome to FOOLISH ARC. These Terms and Conditions ("Terms") govern your use of
            https://www.foolisharc.com/ and the purchase of goods from our store. By accessing or using the
            Site, you agree to these Terms.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">1. Acceptance of Terms</h2>
          <p>
            By placing an order or using the Site, you agree to be bound by these Terms and our
            <Link to="/privacy" className="underline">Privacy Policy</Link>. If you do not agree, please do
            not use the Site.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">2. Orders & Pricing</h2>
          <p>
            All prices are displayed in [OWNER APPROVAL REQUIRED — specify currency, e.g. PKR] and include
            [OWNER APPROVAL REQUIRED — specify tax treatment]. Prices are subject to change without notice.
            An order confirmation does not constitute acceptance; we reserve the right to [OWNER APPROVAL
            REQUIRED — specify: accept or reject orders].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">3. Payment</h2>
          <p>
            Payment methods available: [OWNER APPROVAL REQUIRED — specify: Cash on Delivery, JazzCash,
            EasyPaisa; only methods configured in the store environment are shown]. Payment is processed
            [OWNER APPROVAL REQUIRED — specify: on delivery / at checkout].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">4. Delivery</h2>
          <p>
            Delivery is [OWNER APPROVAL REQUIRED — specify: nationwide, e.g. across Pakistan] via
            [OWNER APPROVAL REQUIRED — specify courier]. Estimated delivery: [OWNER APPROVAL REQUIRED —
            specify timeframe]. Delivery charges: [OWNER APPROVAL REQUIRED — specify free/paid and amount].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">5. Returns & Exchanges</h2>
          <p>
            Please review our <Link to="/returns" className="underline">Returns and Exchange Policy</Link>
            for eligibility, timeframes, and conditions.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">6. Limitation of Liability</h2>
          <p>
            [OWNER APPROVAL REQUIRED — insert liability disclaimer consistent with applicable law.]
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">7. Governing Law</h2>
          <p>
            These Terms are governed by [OWNER APPROVAL REQUIRED — specify jurisdiction, e.g. the laws of
            Pakistan].
          </p>

          <div className="bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl p-6 mt-12">
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
              [OWNER APPROVAL REQUIRED — These terms are a template. Have them reviewed and approved by the
              business owner / legal counsel before publishing.]
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
