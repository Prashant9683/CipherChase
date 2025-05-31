// src/components/ui/Select.tsx
import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  className?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <select
        className={`flex h-10 w-full rounded-md border border-white-300 bg-white px-3 py-2 text-sm 
                    text-white-800 placeholder:text-white-400 
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                    disabled:cursor-not-allowed disabled:opacity-50 
                    dark:border-white-700 dark:bg-white-800 dark:text-white-50 dark:placeholder:text-white-500 dark:focus:ring-blue-600 dark:focus:border-blue-600
                    transition-colors duration-150 ease-in-out shadow-sm hover:border-white-400 dark:hover:border-white-600
                    ${className}`}
        ref={ref}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = 'Select';

export default Select;
