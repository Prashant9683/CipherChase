import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
  fullWidth = false,
  icon,
}) => {
  // Base classes
  const baseClasses =
    "font-medium rounded-md transition-all duration-200 flex items-center justify-center";

  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Variant classes
  const variantClasses = {
    primary:
        "bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-600/50",
    secondary:
        "bg-slate-800 text-white hover:bg-slate-900 focus:ring-2 focus:ring-slate-800/50",
    outline:
        "border-2 border-blue-600 text-blue-600 hover:bg-blue-600/10 focus:ring-2 focus:ring-blue-600/50",
    ghost:
        "text-blue-700 hover:bg-blue-100 focus:ring-2 focus:ring-blue-600/50",
  };

  // Disabled classes
  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed"
    : "cursor-pointer";

  // Width classes
  const widthClasses = fullWidth ? "w-full" : "";

  // Combine all classes
  const combinedClasses = `
    ${baseClasses} 
    ${sizeClasses[size]} 
    ${variantClasses[variant]} 
    ${disabledClasses} 
    ${widthClasses} 
    ${className}
  `;

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
