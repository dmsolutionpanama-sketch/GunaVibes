import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroBanner } from './components/public/HeroBanner';
import { BookingForm } from './components/public/BookingForm';
import { LeadCaptureForm } from './components/public/LeadCaptureForm';
import { PackagesView } from './components/public/PackagesView';
import { RecommendationsView } from './components/public/RecommendationsView';
import { InstagramWidget } from './components/public/InstagramWidget';
import { GalleryView } from './components/public/GalleryView';
import { TestimonialsView } from './components/public/TestimonialsView';
import { GenericContentView } from './components/public/GenericContentView';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { api } from './services/api';
import {
  BannerSlide,
  YouTubeLiveStatus,
  PackageItem,
} from './types';
import {
  MessageCircle,
  Phone,
  ShieldCheck,
  CalendarCheck,
  Compass,
  Star,
  Users,
  X,
  Radio,
  ArrowRight,
} from 'lucide-react';

function MainApp() {
  const { language, t } = useLanguage();
  const { theme, config } = useTheme();
  const { isAuthenticated } = useAuth();

  // Navigation State
  const [currentSection, setCurrentSection] = useState<string>('inicio');

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);

  // Live Data States
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [liveStatus, setLiveStatus] = useState<YouTubeLiveStatus>({ esta_en_vivo: false });
  const [packages, setPackages] = useState<PackageItem[]>([]);

  // Load initial public data
  useEffect(() => {
    const loadPublicData = async () => {
      try {
        const [slidesData, liveData, pkgData] = await Promise.all([
          api.getBannerSlides(language),
          api.getYouTubeLiveStatus(),
          api.getPackages(),
        ]);
        setSlides(slidesData);
        setLiveStatus(liveData);
        setPackages(pkgData);
      } catch (err) {
        console.warn('Error cargando datos públicos:', err);
      }
    };
    loadPublicData();
  }, [language]);

  // Google Analytics & Google Tag Manager Dynamic Script Injection
  useEffect(() => {
    if (!config) return;

    // 1. Google Analytics 4 (gtag.js)
    const gaId = config.google_analytics_id?.trim();
    if (gaId && config.google_analytics_activo !== false && !document.getElementById('ga4-script')) {
      const script = document.createElement('script');
      script.id = 'ga4-script';
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      const initScript = document.createElement('script');
      initScript.id = 'ga4-init';
      initScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}', { 'send_page_view': true });
      `;
      document.head.appendChild(initScript);
    }

    // 2. Google Tag Manager (GTM)
    const gtmId = config.google_tag_manager_id?.trim();
    if (gtmId && config.google_tag_manager_activo !== false && !document.getElementById('gtm-script')) {
      const gtmScript = document.createElement('script');
      gtmScript.id = 'gtm-script';
      gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'dataLayer','${gtmId}');`;
      document.head.appendChild(gtmScript);
    }

    // 3. Google Site Verification / Search Console meta tag
    const verification = config.google_search_console_tag?.trim() || config.google_site_verification?.trim();
    if (verification && !document.querySelector('meta[name="google-site-verification"]')) {
      const meta = document.createElement('meta');
      meta.name = 'google-site-verification';
      meta.content = verification.replace(/^.*content=["']([^"']+)["'].*$/, '$1');
      document.head.appendChild(meta);
    }
  }, [config]);

  // Handle opening booking with pre-selected package
  const handleSelectPackage = (pkgId: number) => {
    setSelectedPackageId(pkgId);
    setIsBookingModalOpen(true);
  };

  const handleOpenGeneralBooking = () => {
    setSelectedPackageId(null);
    setIsBookingModalOpen(true);
  };

  // If user requested admin section
  if (currentSection === 'admin') {
    if (!isAuthenticated) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ backgroundColor: theme.bgColor }}>
          <AdminLoginModal
            isOpen={true}
            onClose={() => setCurrentSection('inicio')}
            onSuccess={() => setCurrentSection('admin')}
          />
        </div>
      );
    }
    return <AdminDashboard onExitToSite={() => setCurrentSection('inicio')} />;
  }

  const whatsappNumber = (config?.whatsapp || '50763691775').replace(/\D/g, '');

  return (
    <div
      id="app-root-container"
      className="min-h-screen flex flex-col font-sans transition-colors duration-300"
      style={{
        backgroundColor: theme.bgColor || '#F5EFE6',
        color: theme.textColor || '#123C4B',
      }}
    >
      {/* Live Stream Top Notification Toast if YouTube Live is Active */}
      {liveStatus.esta_en_vivo && (
        <div
          id="top-live-stream-bar"
          onClick={() => setCurrentSection('inicio')}
          className="bg-red-600 text-white text-xs sm:text-sm font-bold py-2.5 px-4 text-center cursor-pointer shadow-md flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <Radio className="w-4 h-4 animate-pulse" />
          <span>
            {language === 'en' ? '🔴 LIVE NOW:' : '🔴 ESTAMOS EN VIVO:'} {liveStatus.titulo_transmision || 'San Blas en Tiempo Real'} — ¡Haz clic para ver la transmisión!
          </span>
        </div>
      )}

      {/* Main Header */}
      <Header
        activeSection={currentSection}
        currentView={currentSection}
        onNavigate={(slug) => {
          setCurrentSection(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenAdmin={() => {
          if (isAuthenticated) {
            setCurrentSection('admin');
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        isLiveActive={liveStatus.esta_en_vivo}
      />

      {/* Main Views Container */}
      <main className="flex-1">
        
        {/* VIEW: INICIO (HOME) */}
        {currentSection === 'inicio' && (
          <div className="space-y-12 pb-12">
            {/* Hero Banner with YouTube Live & Fallback Image */}
            <HeroBanner
              slides={slides}
              liveStatus={liveStatus}
              onBookClick={handleOpenGeneralBooking}
            />

            {/* Value Props / Trust Highlights */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-teal-50 text-[#0E9AA7]">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Operador 100% Nativo</h4>
                    <p className="text-xs text-stone-500">Guías originarios de Gunayala</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-orange-50 text-[#E8622C]">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Máx. 14 Cupos Diarios</h4>
                    <p className="text-xs text-stone-500">Experiencias exclusivas y sin prisa</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-50 text-[#F2B705]">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">⭐ 4.8 en Google Reviews</h4>
                    <p className="text-xs text-stone-500">+132 reseñas verificadas</p>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900">Salidas Diarias 4x4</h4>
                    <p className="text-xs text-stone-500">Pick-up directo en tu hotel</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Real-Time Capacity Checked Booking Form */}
            <BookingForm
              packages={packages}
              selectedPackageId={selectedPackageId}
            />

            {/* Packages Highlight */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
                    {language === 'en' ? 'Featured Experiences' : 'Tours y Pasadías Destacados'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    {language === 'en' ? 'All packages include native boat, safety gear, and island permits.' : 'Todos los paquetes incluyen transporte marítimo nativo, chalecos y permisos.'}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentSection('paquetes')}
                  className="text-xs sm:text-sm font-bold text-[#0E9AA7] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{language === 'en' ? 'See all' : 'Ver todos'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {packages.slice(0, 3).map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-white rounded-3xl p-6 shadow-md border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-xl transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-teal-800 uppercase mb-2">
                        <span>{pkg.tipo.replace('_', ' ')}</span>
                        <span className="text-lg font-black text-stone-900">${pkg.precio} USD</span>
                      </div>
                      <h3 className="font-bold text-lg text-stone-900 leading-snug mb-2">
                        {language === 'en' ? pkg.nombre_en || pkg.nombre_es : pkg.nombre_es}
                      </h3>
                      <p className="text-xs text-stone-600 line-clamp-3">
                        {language === 'en' ? pkg.descripcion_en || pkg.descripcion_es : pkg.descripcion_es}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectPackage(pkg.id)}
                      className="w-full py-2.5 rounded-xl font-bold text-white text-xs shadow-md transition-transform hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      <CalendarCheck className="w-4 h-4" />
                      <span>{t('pkg_select_btn')}</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Instagram Live Feed (4x3 / 12 items / 9:16) */}
            <InstagramWidget />

            {/* Lead Capture for Live Alerts */}
            <LeadCaptureForm />
          </div>
        )}

        {/* VIEW: SOBRE NOSOTROS */}
        {currentSection === 'sobre-nosotros' && (
          <GenericContentView slug="sobre-nosotros" onBookClick={handleOpenGeneralBooking} />
        )}

        {/* VIEW: PAQUETES */}
        {currentSection === 'paquetes' && (
          <PackagesView
            packages={packages}
            onSelectPackage={handleSelectPackage}
          />
        )}

        {/* VIEW: TRASLADOS */}
        {currentSection === 'traslados' && (
          <GenericContentView slug="traslados" onBookClick={handleOpenGeneralBooking} />
        )}

        {/* VIEW: GALERÍA */}
        {currentSection === 'galeria' && <GalleryView />}

        {/* VIEW: TESTIMONIOS */}
        {currentSection === 'testimonios' && <TestimonialsView />}

        {/* VIEW: RECOMENDACIONES (GOOGLE REVIEWS SCOREBOARD) */}
        {currentSection === 'recomendaciones' && <RecommendationsView />}

        {/* VIEW: POLÍTICAS DE DEVOLUCIÓN */}
        {currentSection === 'politicas' && (
          <GenericContentView slug="politicas" onBookClick={handleOpenGeneralBooking} />
        )}

        {/* VIEW: CONTACTO */}
        {currentSection === 'contacto' && (
          <GenericContentView slug="contacto" onBookClick={handleOpenGeneralBooking} />
        )}
      </main>

      {/* Main Footer with Google trust badge and contacts */}
      <Footer
        onNavigate={(slug) => {
          setCurrentSection(slug);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* FLOATING WHATSAPP BUTTON */}
      <a
        id="floating-whatsapp-btn"
        href={`https://wa.me/${whatsappNumber}?text=Hola%20Guna%20Vibes,%20deseo%20consultar%20disponibilidad%20para%20un%20viaje%20a%20San%20Blas`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
        title="Chatear por WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white text-emerald-500" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-bold font-sans">
          WhatsApp Directo
        </span>
      </a>

      {/* BOOKING MODAL POPUP (Triggerable from any "Reservar" CTA) */}
      {isBookingModalOpen && (
        <div
          id="global-booking-modal"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="relative max-w-4xl w-full my-8">
            <button
              onClick={() => setIsBookingModalOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer shadow-md"
            >
              <X className="w-5 h-5" />
            </button>
            <BookingForm
              packages={packages}
              selectedPackageId={selectedPackageId}
            />
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setCurrentSection('admin');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
