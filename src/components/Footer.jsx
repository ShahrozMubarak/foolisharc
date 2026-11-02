import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { isOwnerAuthorized } from '../utils/adminAuth';

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
        '{"location":"Gulberg III, Lahore","email":"concierge@foolisharc.com","phone":"+92 300 1234567"}'
      );
    } catch {
      return {
        location: "Gulberg III, Lahore",
        email: "concierge@foolisharc.com",
        phone: "+92 300 1234567"
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

  if (location.pathname.startsWith('/studio') || location.pathname.startsWith('/admin')) {
    if (isOwnerAuthorized()) {
      return null;
    }
  }

  const phoneDisplay = siteSettings.phone || '+92 300 1234567';
  const emailDisplay = siteSettings.email || 'concierge@foolisharc.com';
  const locationDisplay = siteSettings.location || 'Gulberg III, Lahore';
  const waCleanPhone = phoneDisplay.replace(/[^0-9]/g, '') || '923001234567';

  return (
    <footer className="bg-[#C69F6F] text-[#1C1612] border-t-2 border-[#7A4B26] select-none transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-14 sm:py-20">
        
        {/* Split Grid: Left Half Just Logo & Heritage, Right Half Condensed Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start pb-12 border-b border-[#B58E5C]/70">
          
          {/* Left Half: Purely Spacious with FOOLISH ARC Logo Suite */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-3">
            <BrandLogo size="md" />
            <p className="text-xs font-mono font-medium tracking-[0.18em] text-[#3D2916] max-w-sm">
              Architectural Slow Luxury • Crafted from Ring-Spun Cotton & European Flax Linen
            </p>
          </div>

          {/* Right Half: Condensed Essential Links */}
          <div className="lg:col-span-5 flex flex-wrap gap-x-12 gap-y-6 text-xs uppercase tracking-widest font-black">
            <div>
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Couture
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
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
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Assistance
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
                <li>
                  <Link to="/track" className="hover:text-white transition font-black">
                    Track Consignment
                  </Link>
                </li>
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
                <li>
                  <span className="text-xs font-mono font-bold text-[#473320]">
                    TCS Express Insured
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[#1C1612] mb-3 font-mono font-extrabold uppercase tracking-[0.2em] underline decoration-[#9A6E3E] underline-offset-4">
                Contact
              </p>
              <ul className="space-y-2.5 text-[#2C1F13] font-bold normal-case tracking-normal text-sm">
                <li>
                  <a href={`tel:${phoneDisplay}`} className="hover:text-white transition">
                    {phoneDisplay}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${emailDisplay}`} className="hover:text-white transition">
                    {emailDisplay}
                  </a>
                </li>
                <li className="text-[#473320] text-xs font-mono font-bold">
                  {locationDisplay}
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Clean Minimalist Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#3D2916] font-mono gap-3 font-bold">
          <p>© {new Date().getFullYear()} FOOLISH ARC. All rights reserved.</p>
          <p className="text-[#2C1F13]">NEW YORK • LAHORE • PARIS</p>
        </div>

      </div>
    </footer>
  );
}
