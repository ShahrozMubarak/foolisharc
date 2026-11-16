import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import SEOHead from '../components/SEOHead';

/**
 * NotFoundPage - Editorial Luxury 404 Experience
 * Displayed when an invalid route is visited or when an unauthorized
 * user attempts to access restricted atelier destinations like /studio or /admin.
 */
export default function NotFoundPage({ onOpenAuthModal }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-white dark:bg-onyx-950 text-black dark:text-white transition-colors select-none">
      <SEOHead
        title="Page Not Found | FOOLISH ARC"
        description="The page you are looking for does not exist, has been archived, or access is restricted."
        canonical="/404"
        ogTitle="Page Not Found | FOOLISH ARC"
        ogDescription="The page you are looking for does not exist, has been archived, or access is restricted."
        noIndex
      />
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Monogram Mark */}
        <div className="flex justify-center" title="FOOLISH ARC">
          <BrandLogo size="lg" showWordmark={false} />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#A6865A] dark:text-[#E6D3B3]">
            Error 404 • Not Found
          </p>
          <h1 className="font-editorial text-4xl sm:text-5xl font-black uppercase tracking-tight">
            Page Not Found
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-sm mx-auto leading-relaxed pt-1">
            The page you are looking for does not exist, has been archived, or access is restricted.
          </p>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-neutral-800 text-white dark:bg-[#E6D3B3] dark:hover:bg-[#d9c19b] dark:text-black text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95"
          >
            Return to Homepage
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-neutral-100 text-black dark:bg-onyx-900 dark:text-white dark:hover:bg-onyx-800 text-xs font-bold uppercase tracking-[0.2em] border border-neutral-300 dark:border-onyx-700 transition-all active:scale-95"
          >
            Explore Collection
          </Link>
        </div>

      </div>
    </div>
  );
}
