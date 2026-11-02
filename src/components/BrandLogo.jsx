import React from 'react';
import { Link } from 'react-router-dom';

/**
 * BrandLogo - foolisharc tall condensed wordmark
 */
export default function BrandLogo({
  size = 'md',
  showWordmark = true,
  stacked = false,
  className = '',
  asLink = true
}) {
  const fontSizeMap = {
    sm: '1.15rem',
    md: '1.35rem',
    lg: '1.5rem',
    xl: '1.75rem'
  };

  const fontSize = fontSizeMap[size] || '1.35rem';

  const innerContent = (
    <span
      className={`inline-block select-none ${className}`}
      style={{
        color: '#B88648',
        fontWeight: 800,
        fontSize: fontSize,
        letterSpacing: '-0.03em',
        transform: 'scaleY(1.2)'
      }}
    >
      foolisharc
    </span>
  );

  if (asLink) {
    return (
      <Link
        to="/"
        className="group select-none hover:opacity-95 transition-opacity inline-flex items-center"
      >
        {innerContent}
      </Link>
    );
  }

  return innerContent;
}
