import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { useCurrency } from '../context/CurrencyContext';
import BrandLogo from './BrandLogo';
import SymbioteButton from './SymbioteButton';
import PullCordLamp from './PullCordLamp';

/**
 * Navbar - Bold, modern luxury navigation bar.
 * Clean announcement bar, bold typography, strong brand identity, and direct navigation.
 */
export default function Navbar({
  cartCount = 0,
  onOpenCart,
  theme,
  onToggleTheme,
  brandName = "FOOLISH ARC",
  user = null,
  onOpenAuthModal,
  onLogout,
  onOpenSearch,
  fitProfile = null,
  onOpenFitProfile
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // The Studio manages its own secure shell and sign-in screen.
  if (location.pathname.startsWith('/studio') || location.pathname.startsWith('/admin')) return null;

  // Bold navigation link style with Sand #E6D3B3 active indicator
  const navLinkClass = ({ isActive }) =>
    `text-xs sm:text-sm font-bold uppercase tracking-wider transition-all py-1 ${
      isActive
        ? 'text-black dark:text-[#E6D3B3] border-b-2 border-[#E6D3B3] font-extrabold'
        : 'text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-[#E6D3B3]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-onyx-950 border-b border-[#7A4B26]/20 dark:border-[#7A4B26]/30 transition-colors shadow-sm">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-8 lg:px-12 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo - Bespoke Luxury Atelier Monogram & Wide-Tracked Wordmark with Live Online Indicator */}
        <div className="flex items-center">
          <BrandLogo size="md" />
      
        </div>

        {/* Bold Center Navigation */}
        <nav className="hidden md:flex items-center space-x-8 lg:space-x-10">
          {[['Women', 'women'], ['Men', 'men'], ['Collection', '']].map(([name, cat]) => {
            const active = location.pathname === '/shop' && (new URLSearchParams(location.search).get('cat') || '') === cat;
            return <Link key={name} to={cat ? '/shop?cat=' + cat : '/shop'} aria-current={active ? 'page' : undefined}
              className={navLinkClass({ isActive: active })}>{name}</Link>;
          })}
          <NavLink to="/track" className={navLinkClass}>
            Track Order
          </NavLink>
        </nav>

        {/* Right Header Utilities */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 text-sm text-black dark:text-white shrink-0">
          
          {/* Search Button (Optional) */}
          {onOpenSearch && (
            <button
              onClick={onOpenSearch}
              className="p-2 rounded-xl text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
              title="Search"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {/* Currency Switcher (Desktop/Tablet) */}
          <button
            onClick={() => {
              const order = ['PKR', 'USD', 'EUR'];
              const nextIdx = (order.indexOf(currency) + 1) % order.length;
              setCurrency(order[nextIdx]);
            }}
            className="hidden sm:inline-block text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E] transition uppercase cursor-pointer"
            title="Switch Currency"
          >
            {currency}
          </button>

          {/* Little Motion Exp 001 Pull-Cord Lamp Model (Desktop/Tablet) */}
          <PullCordLamp
            compact={true}
            theme={theme}
            onToggleTheme={onToggleTheme}
            className="hidden sm:inline-flex p-1 rounded-lg hover:bg-linen-100 dark:hover:bg-onyx-900 transition"
          />

          {/* Google Sign In / User Profile */}
          {!user ? (
            <button
              onClick={() => onOpenAuthModal && onOpenAuthModal({ title: "Sign in with Google", subtitle: "Access your saved bag, couture orders, and concierge." })}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#9A6E3E] bg-white dark:bg-[#1A1613] text-xs font-bold transition-all shadow-2xs active:scale-95 text-neutral-800 dark:text-white cursor-pointer"
              title="Sign in with Google"
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span className="hidden sm:inline">Sign In</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-1.5 p-1 sm:pl-1.5 sm:pr-2.5 rounded-full border border-[#D8CEBF] dark:border-[#382F26] hover:border-[#C69F6F] bg-[#FAF9F6] dark:bg-[#1A1613] transition-all text-xs font-bold text-neutral-900 dark:text-white"
                title={`Signed in as ${user.name}`}
              >
                <div className="relative">
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                    alt={user.name}
                    className="w-6 h-6 rounded-full object-cover border border-[#D8CEBF] dark:border-[#382F26]"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#C69F6F] ring-2 ring-white dark:ring-[#1A1613]" title="Verified Patron"></span>
                </div>
                <span className="hidden sm:inline max-w-[110px] truncate text-left">{user.firstName || user.name}</span>
                <svg className="w-3 h-3 text-[#A6865A] hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-[#1A1613] border border-[#E6D3B3] dark:border-[#382F26] shadow-2xl py-2 z-50 animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-[#F0EAE1] dark:border-[#2C241D]">
                    <p className="font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">{user.email}</p>
                    <span className="inline-flex items-center space-x-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-[#FAF6F0] dark:bg-[#201A16] border border-[#E6D3B3] dark:border-[#382F26] text-[10px] font-bold uppercase tracking-wider text-[#8C6A3E] dark:text-[#E6D3B3]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C69F6F] animate-pulse"></span>
                      <span>Atelier Verified Patron</span>
                    </span>
                  </div>

                  <Link
                    to="/track"
                    onClick={() => setUserMenuOpen(false)}
                    className="block px-4 py-2.5 text-xs text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-onyx-900 transition flex items-center justify-between"
                  >
                    <span>Track My Orders</span>
                    <svg className="w-3.5 h-3.5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>



                  <div className="border-t border-neutral-100 dark:border-onyx-800 my-1"></div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      if (onLogout) onLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition flex items-center justify-between"
                  >
                    <span>Sign Out</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Shopping Bag Button with Symbiote Tether */}
          <SymbioteButton
            onClick={onOpenCart}
            theme="camel"
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1C1612] hover:bg-[#9A6E3E] text-white transition-all font-bold text-xs uppercase tracking-wider shadow-sm active:scale-95 cursor-pointer"
            title="Shopping Bag"
            ariaLabel="Shopping Bag"
          >
            <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="hidden sm:inline">BAG</span>
            <span className="w-4 h-4 rounded-full bg-[#9A6E3E] text-white text-[10px] flex items-center justify-center font-bold shadow-xs">
              {cartCount}
            </span>
          </SymbioteButton>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-black dark:text-white focus:outline-none"
            aria-label="Toggle Menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-onyx-950 border-t border-neutral-200 dark:border-onyx-800 px-6 py-6 space-y-4 font-bold uppercase text-sm">
          {user ? (
            <div className="p-3.5 rounded-2xl bg-linen-100 dark:bg-onyx-900 border border-neutral-200 dark:border-onyx-800 mb-2">
              <div className="flex items-center space-x-3 mb-2">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border border-camel-400"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-neutral-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-[11px] text-neutral-500 truncate normal-case">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onLogout) onLogout();
                }}
                className="w-full py-2 rounded-xl text-center text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAuthModal) onOpenAuthModal({ title: "Sign in with Google" });
              }}
              className="w-full py-3 px-4 rounded-xl bg-white dark:bg-onyx-900 border-2 border-neutral-300 dark:border-onyx-700 text-xs font-bold flex items-center justify-center space-x-2 shadow-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Sign in with Google</span>
            </button>
          )}

          <NavLink
            to="/shop?cat=women"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Women
          </NavLink>
          <NavLink
            to="/shop?cat=men"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Men
          </NavLink>
          <NavLink
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Collection
          </NavLink>
          <NavLink
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-black dark:text-white py-1"
          >
            Track Order
          </NavLink>

          {/* Mobile Currency & Lamp Theme Settings Row */}
          <div className="pt-4 border-t border-neutral-200 dark:border-onyx-800 flex items-center justify-between text-xs font-semibold normal-case">
            <div className="flex items-center space-x-2">
              <span className="text-neutral-500">Currency:</span>
              <button
                type="button"
                onClick={() => {
                  const order = ['PKR', 'USD', 'EUR'];
                  const nextIdx = (order.indexOf(currency) + 1) % order.length;
                  setCurrency(order[nextIdx]);
                }}
                className="px-2.5 py-1 rounded-lg border border-neutral-300 dark:border-onyx-700 font-bold uppercase text-onyx-950 dark:text-white bg-linen-100 dark:bg-onyx-900"
              >
                {currency}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-neutral-500 text-[11px] font-bold uppercase tracking-wider">Lamp Switch:</span>
              <PullCordLamp
                compact={true}
                theme={theme}
                onToggleTheme={onToggleTheme}
                className="p-1 rounded-lg border border-neutral-200 dark:border-onyx-700 bg-linen-100 dark:bg-onyx-900"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
