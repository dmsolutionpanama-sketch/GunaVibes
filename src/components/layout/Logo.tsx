import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface LogoProps {
  className?: string;
  isLight?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'h-10', isLight = false }) => {
  const { config, theme } = useTheme();

  if (config?.logo_svg_url) {
    return <img src={config.logo_svg_url} alt="Guna Vibes" className={className} />;
  }

  const textColor = isLight ? '#FFFFFF' : theme.textColor || '#123C4B';
  const primaryColor = theme.primaryColor || '#0E9AA7';
  const secondaryColor = theme.secondaryColor || '#E8622C';
  const accentColor = theme.accentColor || '#F2B705';

  return (
    <div className={`flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      {/* Crisp SVG Vector Icon */}
      <svg
        viewBox="0 0 160 160"
        className="h-10 w-10 flex-shrink-0 drop-shadow-sm transition-transform hover:scale-105"
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

      <div className="flex flex-col leading-tight">
        <span
          className="font-extrabold tracking-tight text-xl font-heading flex items-center gap-1"
          style={{ color: textColor }}
        >
          GUNA<span style={{ color: secondaryColor }}>VIBES</span>
        </span>
        <span
          className="text-[10px] tracking-widest uppercase font-semibold opacity-80"
          style={{ color: textColor }}
        >
          Gunayala • San Blas
        </span>
      </div>
    </div>
  );
};
