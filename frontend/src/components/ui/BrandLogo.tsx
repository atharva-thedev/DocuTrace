import React from 'react';
import darkLogo from '../../assets/darkthemelogo.png';
import lightLogo from '../../assets/lightthemelogo.png';
import { useTheme } from '../../context/ThemeContext';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  alt?: string;
}

const sizeClasses = {
  xs: 'h-6 max-h-6',
  sm: 'h-7 max-h-7',
  md: 'h-9 max-h-9',
  lg: 'h-11 max-h-11',
  xl: 'h-14 max-h-14',
};

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'DocuTrace',
}) => {
  const { theme } = useTheme();
  const currentLogo = theme === 'dark' ? darkLogo : lightLogo;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <img
        key={theme}
        src={currentLogo}
        alt={alt}
        className={`${sizeClasses[size]} w-auto object-contain transition-opacity duration-150`}
        loading="eager"
      />
    </div>
  );
};

