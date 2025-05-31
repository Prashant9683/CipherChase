// src/components/ui/Link.tsx
import React from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';

interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  to: string; // Ensure 'to' is always a string for internal links
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'subtle' | 'buttonLike'; // Added variants
  // external prop is implicitly handled by using <a> tag for external links
}

export const Link: React.FC<LinkProps> = ({
                                            to,
                                            children,
                                            className = '',
                                            variant = 'default',
                                            ...rest // Spread other valid RouterLinkProps like 'replace', 'state'
                                          }) => {
  const baseClasses = "transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variantClasses = {
    default: "text-blue-600 hover:text-blue-700 hover:underline focus:ring-blue-500 font-medium",
    subtle: "text-gray-600 hover:text-gray-800 hover:underline focus:ring-gray-500 text-sm",
    buttonLike: "inline-block px-4 py-2 text-sm font-medium rounded-md text-center " + // Use Button's primary styling as an example
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm",
  };

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  // Check if 'to' is an external link
  const isExternal = to.startsWith('http://') || to.startsWith('https://') || to.startsWith('mailto:') || to.startsWith('tel:');

  if (isExternal) {
    return (
        <a
            href={to}
            className={combinedClasses}
            target="_blank"
            rel="noopener noreferrer"
            {...(rest as React.AnchorHTMLAttributes<HTMLAnchorElement>)} // Cast rest for <a>
        >
          {children}
        </a>
    );
  }

  return (
      <RouterLink to={to} className={combinedClasses} {...rest}>
        {children}
      </RouterLink>
  );
};
