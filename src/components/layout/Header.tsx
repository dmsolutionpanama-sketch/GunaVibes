import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { ExternalMenuLink, MenuSection } from '../../types';
import { api } from '../../services/api';
import {
  Menu,
  X,
  Globe,
  ExternalLink,
  DoorOpen,
  CalendarCheck,
  Phone,
  Radio,
} from 'lucide-react';

interface HeaderProps {
  currentView?: string;
  activeSection?: string;
  onNavigate: (viewSlug: string) => void;
  onOpenAdmin?: () => void;
  onOpenLogin?: () => void;
  isLiveActive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  activeSection,
  onNavigate,
  onOpenAdmin,
  onOpenLogin,
  isLiveActive = false,
}) => {
  const currentActive = currentView || activeSection || 'inicio';
  const handleAdminClick = onOpenAdmin || onOpenLogin || (() => onNavigate('admin'));
  const { language, setLanguage, t } = useLanguage();
  const { theme } = useTheme();
  const { isAuthenticated } = useAuth();

  const [sections, setSections] = useState<MenuSection[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalMenuLink[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadHeaderData = async () => {
      try {
        const [secData, cfgData] = await Promise.all([
          api.getSections(),
          api.getConfig(),
        ]);
        setSections(secData);
        if (cfgData.externalLinks) {
          setExternalLinks(cfgData.externalLinks);
        }
      } catch (e) {
        console.error('Error cargando menú del header:', e);
      }
    };
    loadHeaderData();

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = sections.length > 0 ? sections : [
    { id: 1, slug: 'inicio', titulo_es: 'Inicio', titulo_en: 'Home', orden: 1, visible: true },
    { id: 2, slug: 'sobre-nosotros', titulo_es: 'Sobre nosotros', titulo_en: 'About us', orden: 2, visible: true },
    { id: 3, slug: 'galeria', titulo_es: 'Galería de Fotos', titulo_en: 'Photo Gallery', orden: 3, visible: true },
    { id: 4, slug: 'paquetes', titulo_es: 'Paquetes', titulo_en: 'Packages', orden: 4, visible: true },
    { id: 5, slug: 'testimonios', titulo_es: 'Testimonios', titulo_en: 'Testimonials', orden: 5, visible: true },
    { id: 6, slug: 'recomendaciones', titulo_es: 'Recomendaciones', titulo_en: 'Recommendations', orden: 6, visible: true },
    { id: 7, slug: 'politicas', titulo_es: 'Políticas de Devolución', titulo_en: 'Return Policy', orden: 7, visible: true },
    { id: 8, slug: 'contacto', titulo_es: 'Contacto', titulo_en: 'Contact', orden: 8, visible: true },
  ];

  return (
    <header
      id="main-header"
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-stone-200/80 py-2.5'
          : 'bg-white/90 backdrop-blur-sm border-b border-stone-200/60 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <div
            id="header-brand"
            onClick={() => onNavigate('inicio')}
            className="cursor-pointer flex items-center"
          >
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" className="hidden xl:flex items-center gap-1.5 2xl:gap-2">
            {navItems.map((item) => {
              const isActive = currentActive === item.slug;
              const label = language === 'en' ? item.titulo_en || item.titulo_es : item.titulo_es;

              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.slug}`}
                  onClick={() => onNavigate(item.slug)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-stone-700 hover:text-stone-950 hover:bg-stone-100/80'
                  }`}
                  style={{
                    backgroundColor: isActive ? theme.primaryColor : undefined,
                  }}
                >
                  {label}
                </button>
              );
            })}

            {/* External Links from Admin */}
            {externalLinks.map((ext) => (
              <a
                key={ext.id}
                id={`nav-ext-link-${ext.id}`}
                href={ext.url}
                target={ext.abrir_nueva_pestana ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-stone-700 hover:text-stone-950 hover:bg-stone-100/80 transition-colors flex items-center gap-1 whitespace-nowrap"
              >
                <span>{ext.texto_menu}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60" />
              </a>
            ))}
          </nav>

          {/* Right Action Tools: Language, Book Now, Live Badge & Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live streaming indicator pill if active */}
            {isLiveActive && (
              <button
                id="header-live-indicator"
                onClick={() => onNavigate('inicio')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold text-white bg-red-600 animate-pulse shadow-sm"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <Radio className="w-3.5 h-3.5" />
                <span>{t('live_badge')}</span>
              </button>
            )}

            {/* Language Switcher */}
            <div id="language-switcher" className="flex items-center bg-stone-100 p-0.5 rounded-lg border border-stone-200">
              <button
                id="btn-lang-es"
                onClick={() => setLanguage('es')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  language === 'es'
                    ? 'bg-white shadow-xs text-stone-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                ES
              </button>
              <button
                id="btn-lang-en"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white shadow-xs text-stone-900'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                EN
              </button>
            </div>

            {/* Book Now Button */}
            <button
              id="header-book-btn"
              onClick={() => {
                onNavigate('inicio');
                setTimeout(() => {
                  const formEl = document.getElementById('booking-section');
                  if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-95 cursor-pointer whitespace-nowrap"
              style={{ backgroundColor: theme.secondaryColor }}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>{t('nav_book_now')}</span>
            </button>

            {/* Admin Portal Button - Puertita Icon */}
            <button
              id="header-admin-btn"
              onClick={handleAdminClick}
              title={isAuthenticated ? 'Panel Administrativo (Sesión activa)' : 'Acceso Administrador (Panel)'}
              aria-label="Acceso Administrador"
              className={`p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isAuthenticated
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-xs'
                  : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:text-stone-900'
              }`}
            >
              <DoorOpen className="w-4 h-4" />
              <span className="hidden lg:inline">{t('nav_admin')}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="header-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 cursor-pointer"
              aria-label="Abrir menú de navegación"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-menu" className="xl:hidden mt-4 pt-3 pb-4 border-t border-stone-200 space-y-1">
            {navItems.map((item) => {
              const isActive = currentActive === item.slug;
              const label = language === 'en' ? item.titulo_en || item.titulo_es : item.titulo_es;

              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.slug}`}
                  onClick={() => {
                    onNavigate(item.slug);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-between ${
                    isActive
                      ? 'text-white'
                      : 'text-stone-700 hover:bg-stone-100'
                  }`}
                  style={{
                    backgroundColor: isActive ? theme.primaryColor : undefined,
                  }}
                >
                  <span>{label}</span>
                </button>
              );
            })}

            {/* External Links */}
            {externalLinks.map((ext) => (
              <a
                key={ext.id}
                href={ext.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-700 hover:bg-stone-100 flex items-center justify-between"
              >
                <span>{ext.texto_menu}</span>
                <ExternalLink className="w-4 h-4 text-stone-400" />
              </a>
            ))}

            {/* Mobile Admin Link with Door Icon */}
            <button
              id="mobile-admin-btn"
              onClick={() => {
                setMobileMenuOpen(false);
                handleAdminClick();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100 flex items-center justify-between"
            >
              <span className="flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-stone-500" />
                <span>{t('nav_admin')}</span>
              </span>
              {isAuthenticated && (
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">Activo</span>
              )}
            </button>

            {/* Mobile Booking CTA */}
            <div className="pt-3 px-2">
              <button
                id="mobile-book-btn"
                onClick={() => {
                  onNavigate('inicio');
                  setMobileMenuOpen(false);
                  setTimeout(() => {
                    const formEl = document.getElementById('booking-section');
                    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CalendarCheck className="w-5 h-5" />
                <span>{t('nav_book_now')}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
