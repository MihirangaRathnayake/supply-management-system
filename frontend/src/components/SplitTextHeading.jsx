import React from 'react';

/**
 * Simple SplitText-style heading inspired by ReactBits (https://reactbits.dev).
 * Animates each character in with a slight stagger.
 */
const SplitTextHeading = ({ text, className = '' }) => {
  // Allow passing JSX or plain text. If not a string, render as-is.
  if (typeof text !== 'string') {
    return <h1 className={`inline-flex flex-wrap text-balance leading-tight ${className}`}>{text}</h1>;
  }

  const words = text.split(' ');
  let charIndex = 0;

  return (
    <h1 className={`inline-flex flex-wrap text-balance leading-tight ${className}`}>
      {words.map((word, wordIndex) => (
        <React.Fragment key={`word-${wordIndex}`}>
          <span className="inline-flex whitespace-nowrap">
            {word.split('').map((char, index) => {
              const delay = charIndex * 0.03;
              charIndex += 1;

              return (
                <span
                  key={`char-${wordIndex}-${index}`}
                  className="inline-block will-change-transform animate-[split-fade_0.6s_ease-out_forwards]"
                  style={{ animationDelay: `${delay}s` }}
                >
                  {char}
                </span>
              );
            })}
          </span>
          {wordIndex < words.length - 1 && ' '}
        </React.Fragment>
      ))}
    </h1>
  );
};

export default SplitTextHeading;


