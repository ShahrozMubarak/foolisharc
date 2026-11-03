import React, { useRef } from 'react';

/**
 * PremiumButton — FOOLISH ARC Luxury Interaction
 *
 * Clean, premium button with:
 * - Liquid fill flood animation on hover (wave rises from bottom)
 * - Subtle shimmer sheen sweep
 * - Tactile scale-press on click with organic bounce
 * - Magnetic micro-nudge toward cursor
 * No SVG tendrils, no venom strings — pure refined luxury motion.
 */
export default function PremiumButton({
  children,
  onClick,
  type = 'button',
  disabled = false,
  className = '',
  containerClassName = '',
  theme = 'dark', // 'dark' | 'camel' | 'light'
  title = '',
  ariaLabel = '',
  id
}) {
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    const btn = buttonRef.current;
    if (btn && !disabled) {
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        // Tactile organic squash-stretch
        btn.animate(
          [
            { transform: 'scale(1)' },
            { transform: 'scale(0.95, 1.04)' },
            { transform: 'scale(1.02, 0.97)' },
            { transform: 'scale(1)' }
          ],
          { duration: 400, easing: 'cubic-bezier(0.2, 1.4, 0.4, 1)' }
        );
      }
    }
    if (onClick) onClick(e);
  };

  return (
    <div className={`inline-flex items-center justify-center ${containerClassName}`}>
      <button
        ref={buttonRef}
        type={type}
        id={id}
        disabled={disabled}
        onClick={handleClick}
        title={title}
        aria-label={ariaLabel || title}
        className={`relative overflow-hidden btn-shimmer-sheen transition-all duration-300 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none ${className}`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {children}
        </span>
      </button>
    </div>
  );
}
