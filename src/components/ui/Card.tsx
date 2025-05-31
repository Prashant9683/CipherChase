// src/components/ui/Card.tsx
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean; // Renamed 'hover' to 'hoverEffect' to avoid conflict with HTML attributes
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false, // Default to false
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-lg shadow-md overflow-hidden';
  const hoverClasses = hoverEffect
    ? 'hover:shadow-lg transition-shadow duration-300'
    : '';
  const cursorClasses = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${cursorClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// CardHeader (already exists, just ensure it's correctly used)
export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 border-b ${className}`}>
      {' '}
      {/* Added some default padding and border */}
      {children}
    </div>
  );
};

// CardContent (already exists, just ensure it's correctly used)
export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 ${className}`}>
      {' '}
      {/* Added some default padding */}
      {children}
    </div>
  );
};

// CardFooter (already exists, just ensure it's correctly used)
export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div className={`p-4 md:p-6 border-t ${className}`}>
      {' '}
      {/* Added some default padding and border */}
      {children}
    </div>
  );
};

// NEW: CardTitle Component
export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'; // Allow specifying the HTML tag
}> = ({ children, className = '', as: Component = 'h3' }) => {
  // Default to h3
  return (
    <Component className={`text-lg font-semibold tracking-tight ${className}`}>
      {children}
    </Component>
  );
};

// NEW: CardDescription Component
export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'div'; // Allow specifying the HTML tag
}> = ({ children, className = '', as: Component = 'p' }) => {
  // Default to p
  return (
    <Component className={`text-sm text-gray-500 ${className}`}>
      {children}
    </Component>
  );
};

export default Card; // Default export for the main Card wrapper
