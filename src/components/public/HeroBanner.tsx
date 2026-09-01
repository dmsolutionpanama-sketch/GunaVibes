import React, { useState, useEffect, useRef } from 'react';
import { BannerSlide, YouTubeLiveStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../layout/Logo';
import {
  Radio,
  CalendarCheck,
  Sparkles,
  Play,
  Pause,
  Shield,
  Sun,
  Compass,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  Waves,
  Eye,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';

interface HeroBannerProps {
  slides: BannerSlide[];
  liveStatus: YouTubeLiveStatus;
  onBookClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides = [],
  liveStatus,
  onBookClick,
}) => {
  const { language, t } = useLanguage();
  const { theme, config } = useTheme();

  // Active slide state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'COP'>('USD');
  const [selectedPax, setSelectedPax] = useState<number>(2);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Filter slides for active language or fallback
  const filteredSlides = slides.filter(
    (s) => s.activo !== false && (s.idioma === language || !s.idioma)
  );

  const activeSlides = filteredSlides.length > 0 ? filteredSlides : slides;

  // Fallback default slide if no slides exist
  const defaultSlide: BannerSlide = {
    id: 1,
    idioma: language,
    titulo:
      language === 'en'
        ? 'Discover the 365 Islands of San Blas with Guna Vibes'
        : 'Descubre las 365 islas de San Blas con Guna Vibes',
    subtitulo:
      language === 'en'
        ? 'All-inclusive Caribbean day tours and rustic overwater cabins'
        : 'El paraíso caribeño te espera a solo unas horas de Ciudad de Panamá',
    texto:
      language === 'en'
        ? 'Daily 4x4 transfers and authentic island tours guided by local native hosts. Limited to 14 guests per day.'
        : 'Traslados 4x4 diarios y tours todo incluido con guías nativos. Cupos limitados a 14 personas por día.',
    imagen_fallback:
      'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85',
    video_youtube_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    boton_texto: language === 'en' ? 'Book Now' : 'Reservar ahora',
    orden: 1,
    activo: true,
    mostrar_logo: true,
  };

  const currentSlide = activeSlides[currentIndex] || defaultSlide;

  // Autoplay carousel timer
  useEffect(() => {
    if (activeSlides.length <= 1 || isPaused) return;

    const intervalSeconds = Math.max(3, config?.banner_intervalo_segundos || 6);
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
    }, intervalSeconds * 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSlides.length, currentIndex, isPaused, config?.banner_intervalo_segundos]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeSlides.length);
  };

  // Rates for live currency estimator
  const rates: Record<'USD' | 'EUR' | 'COP', { symbol: string; rate: number; label: string }> = {
    USD: { symbol: '$', rate: 1.0, label: 'USD (Dólares)' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR (Euros)' },
    COP: { symbol: '$', rate: 4150, label: 'COP (Pesos Colombianos)' },
  };

  const basePricePerPerson = 75; // Precio referencial pasadía todo incluido

  // YouTube URL helper
  const getEmbedUrl = (url: string, autoplay = true, muted = true) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/);
    const videoId = match ? match[1] : '';
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`;
  };

  const isLive = liveStatus?.esta_en_vivo && liveStatus?.live_video_id;
  const currentVideoUrl = currentSlide?.video_youtube_url || config?.banner_video_youtube_url || '';
  const currentVideoId = isLive
    ? liveStatus.live_video_id
    : currentVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/)?.[1] || '';

  const liveEmbedUrl = isLive
    ? `https://www.youtube.com/embed/${liveStatus.live_video_id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&enablejsapi=1`
    : '';

  const hasVideoBackground = Boolean(currentVideoUrl && !isLive && currentVideoId);
  const standardVideoEmbed = hasVideoBackground ? getEmbedUrl(currentVideoUrl, true, isMuted) : '';

  const calculateFormattedPrice = () => {
    const raw = basePricePerPerson * selectedPax * rates[currency].rate;
    if (currency === 'COP') {
      return `${rates[currency].symbol} ${Math.round(raw).toLocaleString()} COP`;
    }
    return `${rates[currency].symbol}${Math.round(raw)} ${currency}`;
  };

  // Determine Banner Height from Config
  const bannerAltura = config?.banner_altura || 'amplio';
  let bannerHeightClass = 'min-h-[780px] lg:min-h-[840px] xl:min-h-[870px]';
  let customStyle: React.CSSProperties = {};

  if (bannerAltura === 'compacto') {
    bannerHeightClass = 'min-h-[580px] lg:min-h-[640px]';
  } else if (bannerAltura === 'estandar') {
    bannerHeightClass = 'min-h-[680px] lg:min-h-[750px]';
  } else if (bannerAltura === 'amplio') {
    bannerHeightClass = 'min-h-[820px] lg:min-h-[880px] xl:min-h-[920px]';
  } else if (bannerAltura === 'pantalla_completa') {
    bannerHeightClass = 'min-h-screen';
  } else if (bannerAltura === 'personalizado' && config?.banner_altura_custom) {
    bannerHeightClass = '';
    customStyle = { minHeight: `${config.banner_altura_custom}px` };
  }

  // Determine Logo Overlay settings
  const shouldShowLogo =
    config?.banner_mostrar_logo !== false &&
    currentSlide?.mostrar_logo !== false;

  const logoCustomUrl = config?.banner_logo_url || config?.logo_svg_url || '';
  const logoTamano = config?.banner_logo_tamano || 'grande';
  const logoPosicion = config?.banner_logo_posicion || 'arriba_titulo';

  return (
    <div
      id="hero-banner-section"
      className={`relative w-full ${bannerHeightClass} flex flex-col justify-between overflow-hidden shadow-2xl bg-stone-900 border-b border-stone-200/80 transition-all duration-500`}
      style={customStyle}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Slides Layer */}
      <div className="absolute inset-0 w-full h-full bg-stone-950 overflow-hidden">
        {isLive ? (
          <div className="w-full h-full relative">
            <iframe
              key={`live-frame-${isMuted}`}
              className="w-full h-full object-cover pointer-events-auto"
              src={liveEmbedUrl}
              title="YouTube Live Stream - Guna Vibes"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : hasVideoBackground ? (
          <div className="w-full h-full relative overflow-hidden pointer-events-none">
            <iframe
              key={`bg-video-${currentIndex}-${isMuted}`}
              className="absolute top-1/2 left-1/2 w-[160%] h-[160%] -translate-x-1/2 -translate-y-1/2 object-cover opacity-80 scale-105 transition-opacity duration-1000"
              src={standardVideoEmbed}
              title="Guna Vibes Video Background"
              allow="autoplay; muted"
            />
          </div>
        ) : (
          /* Multi-Photo Carousel Images with smooth crossfade */
          <div className="relative w-full h-full">
            {activeSlides.map((s, idx) => (
              <img
                key={`banner-slide-${s.id || idx}`}
                src={
                  s.imagen_fallback ||
                  'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85'
                }
                alt={s.titulo || 'Guna Vibes San Blas'}
                className={`absolute inset-0 w-full h-full object-cover object-center transform transition-all duration-1000 ease-out ${
                  idx === currentIndex
                    ? 'opacity-100 scale-105 filter brightness-95'
                    : 'opacity-0 scale-100 pointer-events-none'
                }`}
              />
            ))}
          </div>
        )}

        {/* Dynamic Adjustable Overlays for Customer Video Clarity & Maximum Text Legibility */}
        {(() => {
          const rawOpacity = config?.banner_overlay_opacidad !== undefined ? config.banner_overlay_opacidad : 60;
          const alpha = Math.max(0, Math.min(100, rawOpacity)) / 100;
          const overlayStyle = config?.banner_overlay_estilo || 'cinematico_suave';
          const overlayBlur = config?.banner_overlay_blur || 0;
          const blurStyle = overlayBlur > 0 ? { backdropFilter: `blur(${overlayBlur}px)` } : {};

          if (overlayStyle === 'degradado_lateral') {
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(to right, rgba(9, 34, 43, ${alpha}) 0%, rgba(12, 47, 60, ${alpha * 0.75}) 40%, rgba(18, 60, 75, ${alpha * 0.25}) 70%, transparent 100%)`,
                  ...blurStyle,
                }}
              />
            );
          }

          if (overlayStyle === 'degradado_inferior') {
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(to top, rgba(9, 34, 43, ${alpha}) 0%, rgba(9, 34, 43, ${alpha * 0.5}) 50%, transparent 100%)`,
                  ...blurStyle,
                }}
              />
            );
          }

          if (overlayStyle === 'radial_suave') {
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `radial-gradient(circle at center, transparent 30%, rgba(9, 34, 43, ${alpha}) 100%)`,
                  ...blurStyle,
                }}
              />
            );
          }

          if (overlayStyle === 'minimo_video_claro') {
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(to right, rgba(9, 34, 43, ${alpha * 0.6}) 0%, rgba(9, 34, 43, ${alpha * 0.25}) 50%, transparent 100%)`,
                  ...blurStyle,
                }}
              />
            );
          }

          if (overlayStyle === 'solido_ligero') {
            return (
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  backgroundColor: `rgba(9, 34, 43, ${alpha})`,
                  ...blurStyle,
                }}
              />
            );
          }

          // Default: cinematico_suave (Dual subtle gradient)
          return (
            <>
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(to right, rgba(9, 34, 43, ${alpha * 1.1}) 0%, rgba(12, 47, 60, ${alpha * 0.85}) 45%, rgba(18, 60, 75, ${alpha * 0.45}) 80%, transparent 100%)`,
                  ...blurStyle,
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none transition-all duration-500"
                style={{
                  background: `linear-gradient(to top, rgba(8, 27, 34, ${alpha * 0.9}) 0%, transparent 60%, rgba(0, 0, 0, ${alpha * 0.35}) 100%)`,
                }}
              />
            </>
          );
        })()}
      </div>

      {/* Top Floating Logo / Overlay Badge (when positioned at top-center or floating) */}
      {shouldShowLogo && logoPosicion === 'centrado' && (
        <div className="relative z-20 w-full max-w-7xl mx-auto pt-8 px-4 flex justify-center">
          <div className="bg-black/30 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-white/20 shadow-xl flex items-center gap-3 animate-fade-in">
            {logoCustomUrl ? (
              <img
                src={logoCustomUrl}
                alt="Guna Vibes"
                className={
                  logoTamano === 'extragrande'
                    ? 'h-16 w-auto'
                    : logoTamano === 'grande'
                    ? 'h-12 w-auto'
                    : 'h-9 w-auto'
                }
              />
            ) : (
              <Logo
                isLight={true}
                className={
                  logoTamano === 'extragrande'
                    ? 'scale-125 origin-center'
                    : logoTamano === 'grande'
                    ? 'scale-110 origin-center'
                    : ''
                }
              />
            )}
          </div>
        </div>
      )}

      {/* Main Hero Content Area */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-8 flex-1 flex flex-col justify-center items-center sm:items-start text-white text-center sm:text-left">
        
        {/* LOGO OVERLAY directly above headline (when position is 'arriba_titulo') */}
        {shouldShowLogo && logoPosicion === 'arriba_titulo' && (
          <div
            id="hero-banner-logo-overlay"
            className="mb-5 inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/25 shadow-lg transition-transform hover:scale-105 cursor-pointer"
            onClick={onBookClick}
          >
            {logoCustomUrl ? (
              <img
                src={logoCustomUrl}
                alt="Guna Vibes Logo"
                className={`object-contain drop-shadow-md ${
                  logoTamano === 'extragrande'
                    ? 'h-14 sm:h-16 max-w-[240px]'
                    : logoTamano === 'grande'
                    ? 'h-10 sm:h-12 max-w-[200px]'
                    : 'h-8 sm:h-9 max-w-[160px]'
                }`}
              />
            ) : (
              <Logo
                isLight={true}
                className={
                  logoTamano === 'extragrande'
                    ? 'scale-115'
                    : logoTamano === 'grande'
                    ? 'scale-105'
                    : ''
                }
              />
            )}
            <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-widest text-teal-200 pl-2 border-l border-white/30">
              San Blas Official Operator
            </span>
          </div>
        )}

        {/* Live Broadcast Badge or Carousel Slide Indicator */}
        {isLive ? (
          <div
            id="hero-live-badge"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-600 text-white font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md mb-4 border border-red-400/50 animate-pulse cursor-pointer"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <Radio className="w-4 h-4" />
            <span>
              {t('live_badge')}: {liveStatus.titulo_transmision || 'San Blas en Vivo Ahora'}
            </span>
            <Maximize2 className="w-3.5 h-3.5 ml-1 opacity-80" />
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 text-teal-200 text-xs sm:text-sm font-semibold backdrop-blur-md mb-4 border border-white/25 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {activeSlides.length > 1
                ? `Slide ${currentIndex + 1} de ${activeSlides.length} • `
                : ''}
              {t('hero_badge')}
            </span>
          </div>
        )}

        {/* Main Headline with responsive typography */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight sm:leading-[1.1] text-white max-w-4xl mb-4 drop-shadow-xl">
          {currentSlide.titulo}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl font-bold text-teal-100 max-w-3xl mb-4 leading-snug drop-shadow-md">
          {currentSlide.subtitulo}
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base text-stone-200 max-w-2xl mb-8 leading-relaxed font-normal drop-shadow-sm">
          {currentSlide.texto}
        </p>

        {/* Action Buttons & Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          {/* Primary CTA Book button */}
          <button
            id="hero-book-cta"
            onClick={onBookClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white shadow-2xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            style={{ backgroundColor: theme.secondaryColor || '#E8622C' }}
          >
            <CalendarCheck className="w-5 h-5" />
            <span>{currentSlide.boton_texto || t('nav_book_now')}</span>
          </button>

          {/* YouTube Video Modal Button if slide or banner has video */}
          {(currentVideoId || currentSlide.video_youtube_url || config?.banner_video_youtube_url) && (
            <button
              id="hero-watch-video-btn"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-102"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>
                {language === 'en' ? 'Watch Island Video' : 'Ver Video de San Blas'}
              </span>
            </button>
          )}

          {/* Audio Mute/Unmute toggle if background video is active */}
          {hasVideoBackground && (
            <button
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Activar sonido del video' : 'Silenciar video'}
              className="p-4 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 text-white cursor-pointer transition-colors"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-amber-300" />}
            </button>
          )}

          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-200 bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-md border border-white/20">
            <Shield className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>14 cupos máx. diarios • Guías nativos Gunayala</span>
          </div>
        </div>

        {/* Multi-Slide Navigation Arrows & Carousel Controls */}
        {activeSlides.length > 1 && (
          <div className="mt-8 flex items-center gap-4">
            {/* Prev Button */}
            <button
              id="banner-prev-slide-btn"
              onClick={handlePrev}
              aria-label="Slide anterior"
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Pagination Thumbnails / Dots */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
              {activeSlides.map((s, idx) => (
                <button
                  key={`dot-${s.id || idx}`}
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === currentIndex
                      ? 'w-8 bg-amber-400 shadow-sm'
                      : 'w-2.5 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              id="banner-next-slide-btn"
              onClick={handleNext}
              aria-label="Siguiente slide"
              className="p-2.5 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-md"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Autoplay Pause / Resume Indicator */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-stone-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors border border-white/15"
            >
              {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              <span>{isPaused ? 'Pausado' : 'Auto'}</span>
            </button>
          </div>
        )}
      </div>

      {/* ADICIONAL: Real-Time Gunayala Island Weather, Marine Status & Live Currency Estimator Ribbon */}
      <div className="relative z-10 w-full bg-[#071920]/95 backdrop-blur-lg border-t border-white/15 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-200">
          
          {/* Left: Weather & Marine Conditions */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 sm:gap-6">
            <div className="flex items-center gap-2 text-amber-300 font-semibold">
              <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>San Blas: 29°C Soleado</span>
            </div>
            <div className="flex items-center gap-2 text-teal-200 font-medium">
              <Waves className="w-4 h-4 text-teal-300" />
              <span>Mar Caribe: Calmo / Óptimo para lanchas</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-stone-300">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>Salidas diarias: 5:00 AM - 5:30 AM (Panamá Ciudad)</span>
            </div>
          </div>

          {/* Right: Quick Live Currency Tour Estimator */}
          <div className="flex items-center gap-3 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
            <div className="flex items-center gap-1 font-semibold text-stone-300">
              <Compass className="w-3.5 h-3.5 text-[#F2B705]" />
              <span>{language === 'en' ? 'Quick Rate:' : 'Tarifa Rápida:'}</span>
            </div>

            {/* Pax Selector */}
            <select
              value={selectedPax}
              onChange={(e) => setSelectedPax(Number(e.target.value))}
              aria-label="Cantidad de personas"
              className="bg-black/40 text-white rounded-lg px-2 py-1 text-xs border border-white/20 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value={1}>1 pax</option>
              <option value={2}>2 pax</option>
              <option value={4}>4 pax</option>
              <option value={6}>6 pax</option>
              <option value={10}>10 pax</option>
            </select>

            {/* Currency Selector */}
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              aria-label="Moneda de cotización"
              className="bg-black/40 text-amber-300 rounded-lg px-2 py-1 text-xs border border-white/20 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="COP">COP ($)</option>
            </select>

            {/* Calculated Price */}
            <span className="font-extrabold text-white text-xs sm:text-sm bg-teal-800/80 px-2.5 py-1 rounded-lg shadow-sm">
              {calculateFormattedPrice()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Fullscreen Video / YouTube Modal */}
      {isVideoModalOpen && (
        <div
          id="hero-video-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fade-in"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-stone-800 text-white border-b border-stone-700">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>
                  {isLive
                    ? liveStatus.titulo_transmision || 'Guna Vibes Live Stream'
                    : currentSlide.titulo || 'Guna Vibes - San Blas 365 Islas'}
                </span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-3 py-1.5 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs font-bold text-stone-200 cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>
            <div className="relative aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={
                  isLive
                    ? `https://www.youtube.com/embed/${liveStatus.live_video_id}?autoplay=1&controls=1`
                    : getEmbedUrl(
                        currentSlide.video_youtube_url ||
                          config?.banner_video_youtube_url ||
                          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                        true,
                        false
                      )
                }
                title="Guna Vibes Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
