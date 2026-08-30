import React, { createContext, useContext, useEffect, useState } from 'react';
import { SiteConfig, ThemeConfig, UserPersonalTypography } from '../types';
import { api } from '../services/api';

const defaultTheme: ThemeConfig = {
  bgColor: '#F5EFE6', // Fondo color crema solicitado por el usuario
  cardBgColor: '#FFFFFF',
  primaryColor: '#0E9AA7', // Turquesa
  secondaryColor: '#E8622C', // Coral
  accentColor: '#F2B705', // Amarillo
  textColor: '#123C4B', // Azul marino
  headerDarkBg: '#123C4B',
  borderRadius: 'rounded-2xl',
  fontFamilyFrontendHeading: 'Outfit',
  fontFamilyFrontendBody: 'Plus Jakarta Sans',
  fontSizeFrontendBase: '16px',
  fontFamilyBackend: 'Plus Jakarta Sans',
  fontSizeBackendBase: '14px',
};

const PERSONAL_TYPO_STORAGE_KEY = 'guna_vibes_personal_backend_typography';

interface ThemeContextType {
  theme: ThemeConfig;
  config: SiteConfig | null;
  personalTypography: UserPersonalTypography;
  updateTheme: (newTheme: Partial<ThemeConfig>) => void;
  setPersonalTypography: (typo: Partial<UserPersonalTypography>) => void;
  resetPersonalTypography: () => void;
  refreshConfig: () => Promise<void>;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // User's personal typography override for backend view
  const [personalTypography, setPersonalTypographyState] = useState<UserPersonalTypography>(() => {
    try {
      const saved = localStorage.getItem(PERSONAL_TYPO_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading personal typography:', e);
    }
    return {
      fontFamily: 'Plus Jakarta Sans',
      fontSize: '14px',
      overrideSystem: false,
    };
  });

  const applyThemeToDOM = (t: ThemeConfig, personal?: UserPersonalTypography) => {
    const root = document.documentElement;
    root.style.setProperty('--bg-color', t.bgColor || '#F5EFE6');
    root.style.setProperty('--card-bg-color', t.cardBgColor || '#FFFFFF');
    root.style.setProperty('--primary-color', t.primaryColor || '#0E9AA7');
    root.style.setProperty('--secondary-color', t.secondaryColor || '#E8622C');
    root.style.setProperty('--accent-color', t.accentColor || '#F2B705');
    root.style.setProperty('--text-color', t.textColor || '#123C4B');
    root.style.setProperty('--header-bg', t.headerDarkBg || '#123C4B');

    // Frontend typography
    const feHeading = t.fontFamilyFrontendHeading || 'Outfit';
    const feBody = t.fontFamilyFrontendBody || 'Plus Jakarta Sans';
    const feSize = t.fontSizeFrontendBase || '16px';

    root.style.setProperty('--font-frontend-heading', `'${feHeading}', sans-serif`);
    root.style.setProperty('--font-frontend-body', `'${feBody}', sans-serif`);
    root.style.setProperty('--font-frontend-size', feSize);

    // Backend typography (system vs personal override)
    const activePersonal = personal || personalTypography;
    const beFont = activePersonal.overrideSystem
      ? activePersonal.fontFamily
      : (t.fontFamilyBackend || 'Plus Jakarta Sans');
    const beSize = activePersonal.overrideSystem
      ? activePersonal.fontSize
      : (t.fontSizeBackendBase || '14px');

    root.style.setProperty('--font-backend-body', `'${beFont}', sans-serif`);
    root.style.setProperty('--font-backend-size', beSize);

    if (document.body) {
      document.body.style.backgroundColor = t.bgColor || '#F5EFE6';
      document.body.style.color = t.textColor || '#123C4B';
      document.body.style.fontFamily = `'${feBody}', sans-serif`;
      document.body.style.fontSize = feSize;
    }
  };

  const refreshConfig = async () => {
    try {
      const cfg = await api.getConfig();
      setConfig(cfg);
      if (cfg.theme) {
        const fullTheme = { ...defaultTheme, ...cfg.theme };
        setTheme(fullTheme);
        applyThemeToDOM(fullTheme, personalTypography);
      }
    } catch (err) {
      console.warn('Usando configuración por defecto:', err);
      applyThemeToDOM(defaultTheme, personalTypography);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateTheme = (newTheme: Partial<ThemeConfig>) => {
    const updated = { ...theme, ...newTheme };
    setTheme(updated);
    applyThemeToDOM(updated, personalTypography);
  };

  const setPersonalTypography = (typo: Partial<UserPersonalTypography>) => {
    const updated: UserPersonalTypography = { ...personalTypography, ...typo };
    setPersonalTypographyState(updated);
    try {
      localStorage.setItem(PERSONAL_TYPO_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving personal typography:', e);
    }
    applyThemeToDOM(theme, updated);
  };

  const resetPersonalTypography = () => {
    const reset: UserPersonalTypography = {
      fontFamily: theme.fontFamilyBackend || 'Plus Jakarta Sans',
      fontSize: theme.fontSizeBackendBase || '14px',
      overrideSystem: false,
    };
    setPersonalTypographyState(reset);
    try {
      localStorage.removeItem(PERSONAL_TYPO_STORAGE_KEY);
    } catch (e) {
      console.warn('Error removing personal typography:', e);
    }
    applyThemeToDOM(theme, reset);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        config,
        personalTypography,
        updateTheme,
        setPersonalTypography,
        resetPersonalTypography,
        refreshConfig,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  return ctx;
};
