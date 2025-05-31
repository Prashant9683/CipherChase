// src/components/ui/ExpandableText.tsx
import React, { useState } from 'react';
import Button from './Button'; // Assuming your Button component can be used for small text links
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ExpandableTextProps {
  text: string;
  initialLineClamp?: number; // Number of lines to show initially
  className?: string;
  buttonClassName?: string;
  textClassName?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({
  text,
  initialLineClamp = 3, // Default to showing 3 lines initially
  className = '',
  buttonClassName = '',
  textClassName = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Estimate if the text actually needs clamping. This is a rough estimate.
  // A more precise method would involve rendering and measuring, but that's more complex.
  // For now, we'll assume if it's longer than ~50 words, it might clamp.
  // Or, you can pass a prop 'isClampedInitially' if you pre-calculate this.
  // For simplicity, we'll show the button if line clamp is active.
  // The line-clamp CSS will handle the actual truncation.
  const needsClamping = text.length > initialLineClamp * 70; // Rough estimate: 70 chars per line

  return (
    <div className={`relative ${className}`}>
      <p
        className={`text-sm leading-relaxed transition-all duration-300 ease-in-out ${textClassName} ${
          isExpanded ? 'line-clamp-none' : `line-clamp-${initialLineClamp}`
        }`}
      >
        {text}
      </p>
      {/* Only show button if text might actually be clamped */}
      {needsClamping && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`mt-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline focus:outline-none flex items-center ${buttonClassName}`}
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'View Less' : 'View More'}
          {isExpanded ? (
            <ChevronUp size={14} className="ml-1" />
          ) : (
            <ChevronDown size={14} className="ml-1" />
          )}
        </button>
      )}
    </div>
  );
};

export default ExpandableText;
