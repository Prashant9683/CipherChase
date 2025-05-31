// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    // You can add custom props here if needed, e.g., error state styling
    className?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={`flex h-10 w-full rounded-md border border-white-300 bg-white px-3 py-2 text-sm 
                    text-black-800 placeholder:text-black-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    disabled:cursor-not-allowed disabled:opacity-50 
                    dark:border-white-700 dark:bg-white-800 dark:text-white-50 dark:placeholder:text-white-500 dark:focus:ring-blue-600 dark:focus:border-blue-600
                    transition-colors duration-150 ease-in-out shadow-sm hover:border-white-400 dark:hover:border-white-600
                    ${className}`}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input"; // For better debugging in React DevTools

export default Input; // Default export if you prefer importing as `Input` directly
