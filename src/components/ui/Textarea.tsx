// src/components/ui/Textarea.tsx
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    className?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, ...props }, ref) => {
        return (
            <textarea
                className={`flex min-h-[80px] w-full rounded-md border border-white-300 bg-white px-3 py-2 text-sm 
                    text-white-800 placeholder:text-black-400 
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
Textarea.displayName = "Textarea";

export default Textarea;
