import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const GlassCard = ({
  children,
  className = "",
  hover = true,
  blur = "md",
  opacity = "low",
  textColor = "auto",
  onClick,
  ...props
}) => {
  const { theme } = useTheme();

  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md",
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  };

  // Theme-aware opacity and background classes
  const getThemeClasses = () => {
    const baseClasses = "glass-card";

    // Use CSS variables for consistent theming
    return baseClasses;
  };

  const getTextColorClasses = () => {
    if (textColor === "auto") {
      // Use CSS variables for automatic theme-aware text colors
      return "";
    }
    return textColor;
  };

  const hoverClasses = hover ? "hover:scale-[1.02] hover:shadow-2xl hover:-translate-y-1" : "";

  return (
    <div
      className={`
        ${getThemeClasses()}
        ${blurClasses[blur]}
        ${getTextColorClasses()}
        ${hoverClasses}
        rounded-xl shadow-xl transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
