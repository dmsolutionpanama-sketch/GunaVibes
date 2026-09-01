import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export interface LogoProps {
  className?: string;
  isLight?: boolean;
  variant?: 'navbar' | 'footer' | 'admin' | 'banner' | 'modal' | 'custom';
  customHeight?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  isLight = false,
  variant = 'navbar',
  customHeight,
  showText,
}) => {
  const { config, theme } = useTheme();

  // Determine dynamic height from backend configuration based on placement variant
  let targetHeight = 48; // default
  if (customHeight) {
    targetHeight = customHeight;
  } else if (variant === 'navbar') {
    targetHeight = config?.logo_altura_navbar || 48;
  } else if (variant === 'footer') {
    targetHeight = config?.logo_altura_footer || 54;
  } else if (variant === 'admin') {
    targetHeight = config?.logo_altura_admin || 42;
  } else if (variant === 'banner') {
    targetHeight = config?.banner_logo_tamano === 'extragrande' ? 72 : config?.banner_logo_tamano === 'grande' ? 56 : 42;
  } else if (variant === 'modal') {
    targetHeight = config?.logo_altura_modal || 40;
  }

  const textColor = isLight ? '#FFFFFF' : theme?.textColor || '#123C4B';
  const primaryColor = theme?.primaryColor || '#0E9AA7';
  const secondaryColor = theme?.secondaryColor || '#E8622C';
  const accentColor = theme?.accentColor || '#F2B705';

  const shouldRenderText = showText !== undefined ? showText : (config?.logo_mostrar_texto !== false);

  // If user uploaded a custom logo image file or URL in the backend
  if (config?.logo_svg_url && config.logo_svg_url.trim() !== '') {
    return (
      <div
        className={`inline-flex items-center gap-3 cursor-pointer select-none transition-transform hover:scale-[1.02] ${className}`}
        style={{ height: `${targetHeight}px` }}
      >
        <img
          src={config.logo_svg_url}
          alt={config?.nombre_empresa || 'Guna Vibes'}
          className="w-auto object-contain drop-shadow-sm transition-all"
          style={{ height: `${targetHeight}px`, maxHeight: `${targetHeight}px` }}
        />
        {shouldRenderText && (
          <div className="flex flex-col leading-tight">
            <span
              className="font-extrabold tracking-tight font-heading flex items-center gap-1"
              style={{
                color: textColor,
                fontSize: `${Math.max(16, Math.round(targetHeight * 0.42))}px`,
              }}
            >
              GUNA<span style={{ color: secondaryColor }}>VIBES</span>
            </span>
            <span
              className="tracking-widest uppercase font-semibold opacity-85"
              style={{
                color: textColor,
                fontSize: `${Math.max(9, Math.round(targetHeight * 0.2))}px`,
              }}
            >
              Gunayala • San Blas
            </span>
          </div>
        )}
      </div>
    );
  }

  // Native Vector Geometric Mola/Sailboat Logo
  const iconSize = targetHeight;
  const titleSize = Math.max(16, Math.round(targetHeight * 0.42));
  const subSize = Math.max(9, Math.round(targetHeight * 0.2));

  return (
    <div
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none transition-transform hover:scale-[1.02] ${className}`}
      style={{ height: `${targetHeight}px` }}
    >
      {/* Crisp SVG Vector Icon with exact scalable height */}
      <svg
        viewBox="0 0 160 160"
        className="flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105"
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="80" cy="80" r="76" fill={primaryColor} fillOpacity="0.12" stroke={primaryColor} strokeWidth="6" />
        {/* Sun & Mola geom */}
        <circle cx="80" cy="55" r="22" fill={accentColor} />
        {/* Palm Island silhouette & Mola patterns */}
        <path
          d="M32 110C48 95 68 116 88 102C108 88 128 112 144 110V126C144 134 136 142 126 142H50C38 142 32 134 32 126V110Z"
          fill={primaryColor}
        />
        <path
          d="M45 116C60 106 75 120 90 110C105 100 120 118 135 116"
          stroke={secondaryColor}
          strokeWidth="5"
          strokeLinecap="round"
        />
        {/* Geometric Sailboat / Indigenous Canoe */}
        <path
          d="M80 34L106 78H80V34Z"
          fill={secondaryColor}
        />
        <path
          d="M74 46L56 78H74V46Z"
          fill={primaryColor}
        />
        <path
          d="M50 84C62 84 98 84 110 84C104 92 92 96 80 96C68 96 56 92 50 84Z"
          fill={isLight ? '#FFFFFF' : '#123C4B'}
        />
      </svg>

      {shouldRenderText && (
        <div className="flex flex-col leading-tight">
          <span
            className="font-extrabold tracking-tight font-heading flex items-center gap-1"
            style={{ color: textColor, fontSize: `${titleSize}px` }}
          >
            GUNA<span style={{ color: secondaryColor }}>VIBES</span>
          </span>
          <span
            className="tracking-widest uppercase font-semibold opacity-85"
            style={{ color: textColor, fontSize: `${subSize}px` }}
          >
            Gunayala • San Blas
          </span>
        </div>
      )}
    </div>
  );
};

