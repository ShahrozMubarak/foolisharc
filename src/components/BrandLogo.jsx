import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - Big Arc Emblem on the Left, Refined Compact Bold Name on the Right
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  asLink = true
}) {
  const sizeConfig = {
    sm: { text: 'text-[0.7rem]', emblem: 'w-8 h-8', gap: 'gap-2' },
    md: { text: 'text-[0.8rem] sm:text-[0.88rem]', emblem: 'w-11 h-11 sm:w-12 sm:h-12', gap: 'gap-2.5' },
    lg: { text: 'text-[0.95rem] sm:text-[1rem]', emblem: 'w-14 h-14 sm:w-16 sm:h-16', gap: 'gap-3' },
    xl: { text: 'text-[1.15rem]', emblem: 'w-20 h-20', gap: 'gap-4' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const innerContent = (
    <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
      {/* Big Arc Emblem on the Left */}
      <img
        src="/images/brand/foolish/arc_emblem.png"
        alt="Foolish Arc Emblem"
        className={`${config.emblem} object-contain shrink-0 filter drop-shadow-sm transition-transform group-hover:scale-105 duration-200`}
      />
      {/* Smaller, clean bold uppercase site name on the Right */}
      {showWordmark && (
        <span
          className={`${config.text} font-black uppercase tracking-wider leading-tight text-[#141210] dark:text-[#FAF6F0] transition-colors`}
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            letterSpacing: '0.04em'
          }}
        >
          FOOLISH ARC
        </span>
      )}
    </div>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="group select-none hover:opacity-90 transition-opacity inline-flex items-center"
        aria-label="FOOLISH ARC Home"
      >
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
