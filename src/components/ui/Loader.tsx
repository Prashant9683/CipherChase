// src/components/ui/Loader.tsx
import React from 'react';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Standardized size names
  className?: string;
  message?: string;
  variant?: 'primary' | 'light'; // For spinner color on different backgrounds
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  className = '',
  message,
  variant = 'primary', // Default to primary theme color
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5', // Slightly adjusted for better visual balance
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  // Spinner color based on variant
  const spinnerColorClasses =
    variant === 'primary'
      ? 'border-blue-600' // Theme primary color (e.g., CipherChase blue)
      : 'border-gray-700'; // A darker gray for light backgrounds if needed

  // Message color based on variant or context
  const messageColorClasses =
    variant === 'primary' ? 'text-gray-700' : 'text-gray-600';

  return (
    <div
      className={`flex flex-col items-center justify-center space-y-3 ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]} ${spinnerColorClasses}`}
        role="status"
        aria-live="polite" // For screen readers
      >
        <span className="sr-only">Loading...</span>{' '}
        {/* Accessibility: hidden but read by screen readers */}
      </div>
      {message && (
        <p className={`text-sm font-medium ${messageColorClasses}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
