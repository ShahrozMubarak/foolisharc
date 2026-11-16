import React from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/SEOHead';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <SEOHead
        title="Privacy Policy | FOOLISH ARC"
        description="FOOLISH ARC Privacy Policy. Learn how we collect, use and protect your personal information when you shop on our store."
        canonical="/privacy"
        ogType="website"
        ogTitle="Privacy Policy | FOOLISH ARC"
        ogDescription="FOOLISH ARC Privacy Policy. Learn how we collect, use and protect your personal information."
        ogImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
        twitterImage="https://www.foolisharc.com/images/editorial_camel_banner.jpg"
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <nav className="flex items-center space-x-2 text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">
          <Link to="/" className="hover:text-black dark:hover:text-white transition">Home</Link>
          <span>/</span>
          <span className="text-black dark:text-white font-bold">Privacy Policy</span>
        </nav>
        <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold mb-6">
          Last updated: [OWNER APPROVAL REQUIRED — insert effective date]
        </p>

        <div className="prose-sm dark:prose-invert text-neutral-600 dark:text-neutral-300 leading-relaxed space-y-6">
          <p>
            This Privacy Policy describes how FOOLISH ARC ("we," "us," or "our") collects, uses, and
            protects personal information when you visit or make a purchase from https://www.foolisharc.com/
            (the "Site").
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">1. Information We Collect</h2>
          <p>
            We may collect [OWNER APPROVAL REQUIRED — specify: name, email address, shipping/billing
            address, phone number, payment details, order history] when you place an order, subscribe to
            our Gazette newsletter, or submit a contact inquiry.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">2. How We Use Your Information</h2>
          <p>
            We use your information to process orders, arrange delivery, respond to inquiries, and send
            [OWNER APPROVAL REQUIRED — specify: newsletter/marketing communications, order updates] if you
            have opted in.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">3. Sharing & Disclosure</h2>
          <p>
            We do not sell your personal data. We may share information with [OWNER APPROVAL REQUIRED —
            specify: courier/delivery partners, payment processors, email service providers] solely to
            fulfil your orders and operate the Site.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">4. Data Retention</h2>
          <p>
            Order records are retained [OWNER APPROVAL REQUIRED — specify retention period] for tax, legal,
            and customer-service purposes.
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">5. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by contacting us at
            [OWNER APPROVAL REQUIRED — insert contact email].
          </p>

          <h2 className="text-xl font-serif font-bold text-[#1C1612] dark:text-white mt-8 mb-2">6. Cookies & Tracking</h2>
          <p>
            The Site uses [OWNER APPROVAL REQUIRED — specify: essential cookies, analytics, preference
            storage]. You may control cookie preferences through your browser settings.
          </p>

          <div className="bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E8E0D5] dark:border-[#332A22] rounded-2xl p-6 mt-12">
            <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mb-2">
              [OWNER APPROVAL REQUIRED — This privacy policy is a template. Review and approve all factual
              statements before publishing.]
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
