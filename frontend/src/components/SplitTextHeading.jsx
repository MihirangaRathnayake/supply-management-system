import React from 'react';

/**
 * Simple SplitText-style heading inspired by ReactBits (https://reactbits.dev).
 * Animates each character in with a slight stagger.
 */
const SplitTextHeading = ({ text, className = '' }) => {
  return (
    <h1 className={`inline-flex flex-wrap text-balance ${className}`}>
      {text.split('').map((char, index) => (
        <span
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          className="inline-block will-change-transform animate-[split-fade_0.6s_ease-out_forwards]"
          style={{ animationDelay: `${index * 0.03}s` }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </h1>
  );
};

export default SplitTextHeading;


