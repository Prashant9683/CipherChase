import React from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    options: SelectOption[];
    onValueChange?: (value: string) => void;
    onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    className?: string;
}

const Select: React.FC<SelectProps> = ({
                                           options,
                                           onValueChange,
                                           onChange,
                                           placeholder,
                                           className = '',
                                           value,
                                           ...props
                                       }) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;

        // Call the custom onValueChange callback if provided
        if (onValueChange) {
            onValueChange(selectedValue);
        }

        // Call the standard onChange callback if provided
        if (onChange) {
            onChange(e);
        }
    };

    return (
        <select
            value={value || ''}
            onChange={handleChange}
            className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
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
};

export default Select;
