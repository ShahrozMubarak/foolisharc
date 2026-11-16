import React, { useState, useEffect } from 'react';

/**
 * TypewriterHeadline - Clean luxury character-by-character typing & word-cycling animation
 */
export default function TypewriterHeadline({
  words = ["WEAR LESS, CHOOSE PIECES THAT LAST LONGER."],
  typingSpeed = 80,
  deletingSpeed = 40,
  pauseTime = 3000,
  className = "",
  cursorClassName = "bg-[#A6865A] dark:bg-[#E6D3B3]"
}) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words || words.length === 0) return;
    const currentWord = words[currentWordIndex % words.length];
    let timer;

    if (!isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1));
        }, typingSpeed);
      } else {
        // Full word typed -> pause then start deleting
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, pauseTime);
      }
    } else {
      // Deleting phase
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length - 1));
        }, deletingSpeed);
      } else {
        // Finished deleting -> move to next word
        setIsDeleting(false);
        setCurrentWordIndex(prev => (prev + 1) % words.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, currentWordIndex, words, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{displayText}</span>
      {/* Sleek luxury vertical blinking cursor */}
      <span
        className={`inline-block w-[2.5px] h-[0.9em] ml-1.5 rounded-full animate-pulse transition-opacity ${cursorClassName}`}
        style={{ animationDuration: '0.85s' }}
        aria-hidden="true"
      />
    </span>
  );
}
