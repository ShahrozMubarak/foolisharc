import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';

/**
 * Footer - Luxury Camel Signature Editorial Split Footer
 * Theme: Pure Camel (#C69F6F / #B58E5C) with high-contrast espresso & ivory typography.
 */
export default function Footer({ onOpenSizeGuide }) {
  const location = useLocation();

  const [siteSettings, setSiteSettings] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem('foolisharc_site_settings') ||
        '{}'
      );
    } catch {
      return {
        location: "",
        email: "",
        phone: ""
      };
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('foolisharc_site_settings');
        if (stored) {
          setSiteSettings(JSON.parse(stored));
        }
      } catch {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (location.pathname.startsWith('/studio') || location.pathname.startsWith('/admin')) return null;

  const phoneDisplay = siteSettings.phone || '';
  const emailDisplay = siteSettings.email || '';
  const locationDisplay = siteSettings.location || 'Online Store';
  const waCleanPhone = phoneDisplay.replace(/[^0-9]/g, '');
  const hasWhatsAppPhone = waCleanPhone.length >= 10;

  return (
    <footer className="bg-[#C69F6F] text-[#1C1612] border-t-2 border-[#7A4B26] select-none transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
        
        {/* Split Grid: Left Half Just Logo & Heritage, Right Half Condensed Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 border-b border-[#B58E5C]/70">
          
          {/* Left Half: Purely Spacious with FOOLISH ARC Logo Suite */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs font-sans font-semibold tracking-wide text-[#3D2916] max-w-sm leading-relaxed">
              Architectural Slow Luxury • Crafted from Ring-Spun Cotton &amp; European Flax Linen
            </p>
          </div>

          {/* Right Half: Condensed Essential Links */}
          <div className="lg:col-span-5 flex flex-wrap gap-x-12 gap-y-6 text-xs uppercase tracking-widest font-bold">
            <div>
              <p className="text-[#1C1612] mb-3.5 font-sans font-bold uppercase tracking-[0.18em] underline decoration-[#9A6E3E] underline-offset-4">
                Couture
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-sans font-semibold normal-case tracking-normal text-sm">
                <li>
                  <Link to="/shop" className="hover:text-white transition">
                    Collection
                  </Link>
                </li>
                <li>
                  <Link to="/shop?cat=women" className="hover:text-white transition">
                    Women's Pret
                  </Link>
                </li>
                <li>
                  <Link to="/shop?cat=men" className="hover:text-white transition">
                    Men's Denim
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#1C1612] mb-3.5 font-sans font-bold uppercase tracking-[0.18em] underline decoration-[#9A6E3E] underline-offset-4">
                Assistance
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-sans font-semibold normal-case tracking-normal text-sm">
                <li>
                  <Link to="/track" className="hover:text-white transition">
                    Track Consignment
                  </Link>
                </li>
                {hasWhatsAppPhone && (
                  <li>
                    <a
                      href={`https://wa.me/${waCleanPhone}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition"
                    >
                      WhatsApp Concierge
                    </a>
                  </li>
                )}
                <li>
                  <span className="text-xs font-sans font-semibold text-[#473320]">
                    Tracked Delivery
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#1C1612] mb-3.5 font-sans font-bold uppercase tracking-[0.18em] underline decoration-[#9A6E3E] underline-offset-4">
                Contact
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-sans font-semibold normal-case tracking-normal text-sm">
                {phoneDisplay && (
                  <li>
                    <a href={`tel:${phoneDisplay}`} className="hover:text-white transition">
                      {phoneDisplay}
                    </a>
                  </li>
                )}
                {emailDisplay && (
                  <li>
                    <a href={`mailto:${emailDisplay}`} className="hover:text-white transition">
                      {emailDisplay}
                    </a>
                  </li>
                )}
                <li className="text-[#473320] text-xs font-sans font-semibold">
                  {locationDisplay}
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Clean Minimalist Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3D2916] font-sans font-semibold gap-3">
          <p>© {new Date().getFullYear()} FOOLISH ARC. All rights reserved.</p>
          <p className="text-[#2C1F13] font-bold">NEW YORK • LAHORE • PARIS</p>
        </div>

      </div>
    </footer>
  );
}
