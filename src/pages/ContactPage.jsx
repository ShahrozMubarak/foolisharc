import React, { useEffect, useState } from 'react';
import { submitContactInquiry } from '../services/api';
import SymbioteButton from '../components/SymbioteButton';

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: '', email: '', orderNumber: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [siteSettings, setSiteSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('foolisharc_site_settings') || '{}'); }
    catch { return {}; }
  });

  const configuredPhone = String(siteSettings.phone || '').replace(/\D/g, '');
  const hasConfiguredPhone = configuredPhone.length >= 10;

  useEffect(() => {
    const syncSettings = () => {
      try { setSiteSettings(JSON.parse(localStorage.getItem('foolisharc_site_settings') || '{}')); }
      catch { setSiteSettings({}); }
    };
    window.addEventListener('storage', syncSettings);
    return () => window.removeEventListener('storage', syncSettings);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email && formData.message) {
      setLoading(true);
      setSubmitError('');
      try {
        const result = await submitContactInquiry(formData);
        if (!result?.success) throw new Error(result?.error || 'Your message could not be saved. Please try again.');
        setSubmitted(true);
        setTimeout(() => {
          setFormData({ name: '', email: '', orderNumber: '', message: '' });
          setSubmitted(false);
        }, 4000);
      } catch (error) {
        setSubmitError(error?.message || 'Your message could not be saved. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] dark:bg-onyx-950 text-neutral-900 dark:text-neutral-100 transition-colors py-12 sm:py-20 select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 space-y-16">
        
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-[#9A6E3E] font-semibold">
            Atelier Concierge
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light tracking-tight text-[#1C1612] dark:text-white">
            How May We Assist You?
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
            Send our team a message about your order, sizing, or a product. We will reply using the email address you provide.
          </p>
        </div>

        {/* Two-Column Grid: Left Information, Right Inquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column (5 cols): Atelier Info & Direct Contact */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Atelier Card */}
            <div className="p-7 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] space-y-3 shadow-2xs">
              <h3 className="font-serif text-lg font-bold text-[#1C1612] dark:text-white">FOOLISH ARC Customer Care</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 font-light leading-relaxed">
                {siteSettings.location || 'Online customer support'}
              </p>
              <div className="pt-2 text-xs font-mono space-y-1 text-neutral-700 dark:text-neutral-300">
                <p>{siteSettings.hours || 'Send us a message and we will get back to you.'}</p>
                <p></p>
              </div>
            </div>

            {/* Contact methods appear only when the owner has configured real details. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hasConfiguredPhone && (
                <a
                  href={`https://wa.me/${configuredPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-5 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] hover:border-[#9A6E3E] transition block group shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-[#9A6E3E] mb-1">
                    <span className="font-bold text-xs uppercase tracking-wider">WhatsApp</span>
                  </div>
                  <p className="text-xs font-mono text-neutral-900 dark:text-white font-bold">{siteSettings.phone}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Customer assistance</p>
                </a>
              )}
              {siteSettings.email && (
                <a
                  href={`mailto:${siteSettings.email}`}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] hover:border-[#9A6E3E] transition block group shadow-2xs"
                >
                  <div className="flex items-center space-x-2 text-[#9A6E3E] mb-1">
                    <span className="font-bold text-xs uppercase tracking-wider">Email Concierge</span>
                  </div>
                  <p className="text-xs font-mono text-neutral-900 dark:text-white font-bold break-all">{siteSettings.email}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">Customer assistance</p>
                </a>
              )}
              {!hasConfiguredPhone && !siteSettings.email && (
                <div className="sm:col-span-2 rounded-2xl border border-[#E8E0D5] dark:border-[#2C241D] bg-white dark:bg-[#1A1613] p-5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Use the inquiry form and our team will reply to the email address you provide.
                </div>
              )}
            </div>

          </div>

          {/* Right Column (7 cols): Inquiry Form */}
          <div className="lg:col-span-7">
            <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#1A1613] border border-[#E8E0D5] dark:border-[#2C241D] shadow-2xs">
              <h3 className="font-serif text-xl font-bold mb-1 text-[#1C1612] dark:text-white">Send an Inquiry</h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
                Your message is saved securely for the store team.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3 bg-[#FAF6F0] dark:bg-[#201A16] rounded-2xl border border-[#E8E0D5] dark:border-[#332A22]">
                  <span className="text-3xl text-[#9A6E3E]">✓</span>
                  <h4 className="text-lg font-serif font-bold text-[#1C1612] dark:text-white">
                    Inquiry Received
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 max-w-sm mx-auto">
                    Our atelier concierge has received your note and will contact you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ayesha Malik"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="ayesha@example.com"
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Order Number (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      placeholder="e.g. FA-ORDER-REFERENCE"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-mono font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-300 mb-1.5">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Details regarding your sizing or inquiry..."
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] dark:bg-[#201A16] border border-[#D8CEBF] dark:border-[#382F26] text-xs font-medium text-black dark:text-white focus:outline-none focus:border-[#9A6E3E] transition resize-none"
                    />
                  </div>

                  {submitError && (
                    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                      {submitError}
                    </p>
                  )}

                  <SymbioteButton
                    type="submit"
                    disabled={loading}
                    theme="camel"
                    containerClassName="w-full"
                    className="w-full py-4 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {loading ? (
                      <span>SENDING INQUIRY...</span>
                    ) : (
                      <span>SUBMIT INQUIRY →</span>
                    )}
                  </SymbioteButton>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
