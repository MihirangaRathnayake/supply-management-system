import React, { useState } from 'react';

/**
 * Animated floating label inspired by ReactBits text animations.
 * Works best when `children` is a single input wrapper (e.g. a div containing the input + icon).
 */
const AnimatedLabel = ({ label, children, className = '' }) => {
  const [floated, setFloated] = useState(false);

  const handleFocus = () => setFloated(true);
  const handleBlur = (e) => {
    if (!e.target.value) {
      setFloated(false);
    }
  };

  const childWithHandlers = React.cloneElement(children, {
    onFocus: (e) => {
      children.props.onFocus && children.props.onFocus(e);
      handleFocus();
    },
    onBlur: (e) => {
      children.props.onBlur && children.props.onBlur(e);
      handleBlur(e);
    }
  });

  return (
    <div className={`relative pt-5 ${className}`}>
      <div
        className={`absolute left-0 top-2 text-xs font-semibold tracking-wide uppercase transition-all duration-200
          ${floated ? 'text-primary-600' : 'text-slate-500'}
        `}
      >
        {label}
      </div>
      {childWithHandlers}
    </div>
  );
};

export default AnimatedLabel;



