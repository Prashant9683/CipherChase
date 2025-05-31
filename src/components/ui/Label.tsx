// src/components/ui/Label.tsx
import React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label'; // Using Radix for accessibility

// Define the props based on Radix's Root component props and allow className
interface LabelProps extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> {
    className?: string;
}

export const Label = React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    LabelProps
>(({ className, ...props }, ref) => (
    <LabelPrimitive.Root
        ref={ref}
        // Base styling for the label, aligned with your theme
        className={`block text-sm font-medium text-black-700 dark:text-black-300 mb-1.5 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
    />
));
Label.displayName = LabelPrimitive.Root.displayName; // For better debugging

export default Label;
