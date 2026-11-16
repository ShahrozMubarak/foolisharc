import React from 'react';

/**
 * MarqueeStrip - Continuous luxury announcement ticker strip
 */
export default function MarqueeStrip({ className = "" }) {
  const announcements = [
    "COMPLIMENTARY NATIONWIDE & WORLDWIDE COURIER OVER RS. 25,000",
    "NEW DROP: AUTUMN / WINTER ARCHITECTURAL TAILORING",
    "HAND-CRAFTED FROM ORGANIC BELGIAN LINEN & MONGOLIAN CASHMERE",
    "VISIT OUR APPOINTMENT-ONLY SHOWROOM IN JOHAR TOWN, LAHORE",
    "SUSTAINABLE BOTANICAL FIBERS & REINFORCED FRENCH SEAMS"
  ];

  return (
    <div className={`w-full overflow-hidden bg-onyx-950 text-linen-200 dark:bg-onyx-900 border-b border-onyx-800 py-2.5 select-none ${className}`}>
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase">
        {/* Repeating track to ensure seamless infinite loop */}
        {[...Array(3)].map((_, loopIdx) => (
          <div key={loopIdx} className="flex items-center space-x-8 shrink-0 pr-8">
            {announcements.map((text, idx) => (
              <span key={idx} className="flex items-center space-x-4">
                <span className="text-camel-400 font-semibold">•</span>
                <span>{text}</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
