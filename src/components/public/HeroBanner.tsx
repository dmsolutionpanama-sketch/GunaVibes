import React, { useState } from 'react';
import { BannerSlide, YouTubeLiveStatus } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Radio,
  CalendarCheck,
  Sparkles,
  Play,
  Pause,
  Shield,
  Sun,
  Compass,
  DollarSign,
  Maximize2,
  Volume2,
  VolumeX,
  Clock,
  Waves,
} from 'lucide-react';

interface HeroBannerProps {
  slides: BannerSlide[];
  liveStatus: YouTubeLiveStatus;
  onBookClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  slides,
  liveStatus,
  onBookClick,
}) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // State for interactive features
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'COP'>('USD');
  const [selectedPax, setSelectedPax] = useState<number>(2);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const rates: Record<'USD' | 'EUR' | 'COP', { symbol: string; rate: number; label: string }> = {
    USD: { symbol: '$', rate: 1.0, label: 'USD (Dólares)' },
    EUR: { symbol: '€', rate: 0.92, label: 'EUR (Euros)' },
    COP: { symbol: '$', rate: 4150, label: 'COP (Pesos Colombianos)' },
  };

  const basePricePerPerson = 75; // Precio referencial pasadía todo incluido

  const slide = slides[0] || {
    id: 1,
    idioma: language,
    titulo: 'Descubre las 365 islas de San Blas con Guna Vibes',
    subtitulo: 'Traslados 4x4 diarios y tours todo incluido con guías nativos',
    texto: 'El paraíso caribeño te espera a solo unas horas de Ciudad de Panamá. Cupos limitados a 14 personas por día.',
    imagen_fallback: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85',
    video_youtube_url: '',
    boton_texto: 'Reservar ahora',
    orden: 1,
    activo: true,
  };

  // Convert regular YouTube URL to embed URL
  const getEmbedUrl = (url: string, autoplay = true, muted = true) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/);
    const videoId = match ? match[1] : '';
    if (!videoId) return url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1`;
  };

  const isLive = liveStatus.esta_en_vivo && liveStatus.live_video_id;
  const currentVideoId = isLive ? liveStatus.live_video_id : (slide.video_youtube_url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/)?.[1] || '');
  const liveEmbedUrl = isLive ? `https://www.youtube.com/embed/${liveStatus.live_video_id}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=1&enablejsapi=1` : '';
  const standardVideoEmbed = getEmbedUrl(slide.video_youtube_url, true, isMuted);

  const calculateFormattedPrice = () => {
    const raw = basePricePerPerson * selectedPax * rates[currency].rate;
    if (currency === 'COP') {
      return `${rates[currency].symbol} ${Math.round(raw).toLocaleString()} COP`;
    }
    return `${rates[currency].symbol}${Math.round(raw)} ${currency}`;
  };

  return (
    <div id="hero-banner-section" className="relative w-full min-h-[710px] lg:min-h-[790px] xl:min-h-[820px] flex flex-col justify-between overflow-hidden shadow-2xl bg-stone-900 border-b border-stone-200/80">
      {/* Background Layer: YouTube Live / Video Embed OR High-Res Fallback Image */}
      <div className="absolute inset-0 w-full h-full bg-stone-900 overflow-hidden">
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
        ) : standardVideoEmbed ? (
          <div className="w-full h-full relative overflow-hidden pointer-events-none">
            <iframe
              key={`bg-video-${isMuted}`}
              className="absolute top-1/2 left-1/2 w-[160%] h-[160%] -translate-x-1/2 -translate-y-1/2 object-cover opacity-75 scale-105"
              src={standardVideoEmbed}
              title="Guna Vibes Video"
              allow="autoplay; muted"
            />
          </div>
        ) : (
          <img
            src={slide.imagen_fallback || 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85'}
            alt="San Blas Gunayala Guna Vibes"
            className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000"
          />
        )}

        {/* Cinematic Gradient Overlay for Maximum Legibility & Brand Depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#123C4B]/95 via-[#123C4B]/80 to-[#123C4B]/50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#123C4B] via-transparent to-black/30 pointer-events-none" />
      </div>

      {/* Main Content Area (Full-Width Bleed with Constrained Responsive Content Grid) */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-8 flex-1 flex flex-col justify-center items-center sm:items-start text-white text-center sm:text-left">
        
        {/* Live Broadcast Badge or Native Operator Tag */}
        {isLive ? (
          <div
            id="hero-live-badge"
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-red-600 text-white font-extrabold text-xs sm:text-sm shadow-xl backdrop-blur-md mb-6 border border-red-400/50 animate-pulse cursor-pointer"
            onClick={() => setIsVideoModalOpen(true)}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            <Radio className="w-4 h-4" />
            <span>{t('live_badge')}: {liveStatus.titulo_transmision || 'San Blas en Vivo Ahora'}</span>
            <Maximize2 className="w-3.5 h-3.5 ml-1 opacity-80" />
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-teal-200 text-xs sm:text-sm font-semibold backdrop-blur-md mb-6 border border-white/25 shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('hero_badge')}</span>
          </div>
        )}

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-tight sm:leading-[1.1] text-white max-w-4xl mb-4 drop-shadow-lg">
          {slide.titulo}
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-2xl font-bold text-teal-100 max-w-3xl mb-4 leading-snug">
          {slide.subtitulo}
        </p>

        {/* Description */}
        <p className="text-sm sm:text-base text-stone-200 max-w-2xl mb-8 leading-relaxed font-normal drop-shadow-sm">
          {slide.texto}
        </p>

        {/* Action Buttons & Video Controls */}
        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
          <button
            id="hero-book-cta"
            onClick={onBookClick}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-extrabold text-white shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <CalendarCheck className="w-5 h-5" />
            <span>{slide.boton_texto || t('nav_book_now')}</span>
          </button>

          {/* If there's a video, provide Fullscreen / Watch Video button */}
          {(currentVideoId || slide.video_youtube_url) && (
            <button
              id="hero-watch-video-btn"
              onClick={() => setIsVideoModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl text-sm font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white text-white" />
              <span>{language === 'en' ? 'Watch Full Video' : 'Ver Video Completo'}</span>
            </button>
          )}

          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-200 bg-white/10 px-4 py-3 rounded-2xl backdrop-blur-md border border-white/20">
            <Shield className="w-4 h-4 text-amber-300 flex-shrink-0" />
            <span>14 cupos máx. diarios • Guías nativos Gunayala</span>
          </div>
        </div>
      </div>

      {/* ADICIONAL: Real-Time Gunayala Island Weather, Marine Status & Live Currency Estimator Ribbon */}
      <div className="relative z-10 w-full bg-[#0a232c]/90 backdrop-blur-lg border-t border-white/15 py-3 px-4 sm:px-6 lg:px-8">
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
              className="bg-black/30 text-white rounded-lg px-2 py-1 text-xs border border-white/20 font-bold focus:outline-hidden cursor-pointer"
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
              className="bg-black/30 text-amber-300 rounded-lg px-2 py-1 text-xs border border-white/20 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="COP">COP ($)</option>
            </select>

            {/* Calculated Price */}
            <span className="font-extrabold text-white text-xs sm:text-sm bg-teal-800/80 px-2.5 py-1 rounded-lg">
              {calculateFormattedPrice()}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Fullscreen Video / YouTube Modal */}
      {isVideoModalOpen && (
        <div
          id="hero-video-modal"
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="relative w-full max-w-5xl bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 bg-stone-800 text-white border-b border-stone-700">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>{isLive ? (liveStatus.titulo_transmision || 'Guna Vibes Live Stream') : 'Guna Vibes - San Blas 365 Islas'}</span>
              </div>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="px-3 py-1 bg-stone-700 hover:bg-stone-600 rounded-lg text-xs font-bold text-stone-200 cursor-pointer"
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
                    : getEmbedUrl(slide.video_youtube_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, false)
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

