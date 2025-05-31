// src/components/ui/Avatar.tsx
import React from 'react';

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'User avatar',
  fallbackText = 'U',
  className = '',
  size = 'md',
  ...props
}) => {
  const [error, setError] = React.useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  const handleImageError = () => {
    setError(true);
  };

  React.useEffect(() => {
    setError(false); // Reset error state if src changes
  }, [src]);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold overflow-hidden ${sizeClasses[size]} ${className}`}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={handleImageError}
          {...props}
        />
      ) : (
        <span>{fallbackText.charAt(0).toUpperCase()}</span>
      )}
    </div>
  );
};

export const AvatarImage: React.FC<
  React.ImgHTMLAttributes<HTMLImageElement>
> = (props) => {
  // This is a conceptual component if you were using Radix Avatar.
  // For the simple Avatar above, this isn't strictly needed but can be used as a placeholder.
  return <img {...props} />;
};
AvatarImage.displayName = 'AvatarImage';

export const AvatarFallback: React.FC<
  React.HTMLAttributes<HTMLSpanElement>
> = ({ children, ...props }) => {
  // Conceptual component.
  return <span {...props}>{children}</span>;
};
AvatarFallback.displayName = 'AvatarFallback';

export default Avatar;
