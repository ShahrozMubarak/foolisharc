import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - Gymshark-inspired Bold Architectural Uppercase Wordmark with Arc Emblem on the Right
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  className = '',
  asLink = true
}) {
  const sizeConfig = {
    sm: { text: 'text-[1.1rem]', emblem: 'w-4 h-4', gap: 'gap-1.5' },
    md: { text: 'text-[1.35rem]', emblem: 'w-5 h-5 sm:w-5.5 sm:h-5.5', gap: 'gap-2' },
    lg: { text: 'text-[1.65rem]', emblem: 'w-6 h-6', gap: 'gap-2.5' },
    xl: { text: 'text-[2.1rem]', emblem: 'w-8 h-8', gap: 'gap-3' }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const innerContent = (
    <div className={`inline-flex items-center ${config.gap} select-none ${className}`}>
      {showWordmark && (
        <span
          className={`${config.text} font-black tracking-[-0.03em] uppercase leading-none text-[#141210] dark:text-[#FAF6F0] transition-colors`}
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            fontWeight: 900,
            letterSpacing: '-0.03em'
          }}
        >
          FOOLISH ARC
        </span>
      )}
      <img
        src="/images/brand/foolish/arc_emblem.png"
        alt="Foolish Arc Emblem"
        className={`${config.emblem} object-contain shrink-0`}
      />
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
