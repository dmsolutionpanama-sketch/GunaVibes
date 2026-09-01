import React, { useState, useEffect, useRef } from 'react';
import { BannerSlide, SiteConfig } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../layout/Logo';
import {
  Layers,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Edit2,
  MoveUp,
  MoveDown,
  Video,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Maximize2,
  Sparkles,
  Sliders,
  Play,
  RotateCw,
  HelpCircle,
  ExternalLink,
  Save,
} from 'lucide-react';

// Extract YouTube Video ID
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const cleanUrl = url.trim();
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = cleanUrl.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export const BannerManagerTab: React.FC = () => {
  const { config, theme, refreshConfig } = useTheme();

  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingConfig, setSavingConfig] = useState(false);
  const [savingSlide, setSavingSlide] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Active language view in admin (ES / EN)
  const [activeLang, setActiveLang] = useState<'es' | 'en'>('es');

  // Slide modal / editor state
  const [editingSlide, setEditingSlide] = useState<Partial<BannerSlide> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Height & Logo state directly bound to config
  const [bannerAltura, setBannerAltura] = useState<string>(config?.banner_altura || 'amplio');
  const [bannerAlturaCustom, setBannerAlturaCustom] = useState<number>(config?.banner_altura_custom || 820);
  const [bannerMostrarLogo, setBannerMostrarLogo] = useState<boolean>(config?.banner_mostrar_logo !== false);
  const [bannerLogoUrl, setBannerLogoUrl] = useState<string>(config?.banner_logo_url || '');
  const [bannerLogoTamano, setBannerLogoTamano] = useState<'normal' | 'grande' | 'extragrande'>(
    (config?.banner_logo_tamano as any) || 'grande'
  );
  const [bannerLogoPosicion, setBannerLogoPosicion] = useState<'arriba_titulo' | 'centrado' | 'flotante'>(
    (config?.banner_logo_posicion as any) || 'arriba_titulo'
  );
  const [bannerIntervalo, setBannerIntervalo] = useState<number>(config?.banner_intervalo_segundos || 6);
  const [bannerVideoGlobal, setBannerVideoGlobal] = useState<string>(config?.banner_video_youtube_url || '');

  // Banner Overlay & Gradient Transparency state
  const [bannerOverlayOpacidad, setBannerOverlayOpacidad] = useState<number>(
    config?.banner_overlay_opacidad !== undefined ? config.banner_overlay_opacidad : 55
  );
  const [bannerOverlayEstilo, setBannerOverlayEstilo] = useState<string>(
    config?.banner_overlay_estilo || 'cinematico_suave'
  );
  const [bannerOverlayBlur, setBannerOverlayBlur] = useState<number>(config?.banner_overlay_blur || 0);

  // Direct quick YouTube state
  const [quickYoutubeInput, setQuickYoutubeInput] = useState<string>(config?.banner_video_youtube_url || '');
  const [savingQuickVideo, setSavingQuickVideo] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const quickPhotoInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const loadBannerSlides = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminBannerSlides();
      setSlides(data);
    } catch (err: any) {
      console.warn('Cargando slides con fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBannerSlides();
  }, []);

  // Update local states when config loads
  useEffect(() => {
    if (config) {
      setBannerAltura(config.banner_altura || 'amplio');
      setBannerAlturaCustom(config.banner_altura_custom || 820);
      setBannerMostrarLogo(config.banner_mostrar_logo !== false);
      setBannerLogoUrl(config.banner_logo_url || '');
      setBannerLogoTamano((config.banner_logo_tamano as any) || 'grande');
      setBannerLogoPosicion((config.banner_logo_posicion as any) || 'arriba_titulo');
      setBannerIntervalo(config.banner_intervalo_segundos || 6);
      setBannerVideoGlobal(config.banner_video_youtube_url || '');
      setQuickYoutubeInput(config.banner_video_youtube_url || '');
    }
  }, [config]);

  // Handle Quick Save YouTube Video directly
  const handleQuickSaveYouTube = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingQuickVideo(true);
    try {
      const trimmedUrl = quickYoutubeInput.trim();
      setBannerVideoGlobal(trimmedUrl);

      await api.updateAdminConfig({
        banner_video_youtube_url: trimmedUrl,
        banner_altura: bannerAltura as any,
        banner_altura_custom: Number(bannerAlturaCustom),
        banner_mostrar_logo: bannerMostrarLogo,
        banner_logo_url: bannerLogoUrl,
        banner_logo_tamano: bannerLogoTamano,
        banner_logo_posicion: bannerLogoPosicion,
        banner_intervalo_segundos: Number(bannerIntervalo),
      });

      if (refreshConfig) await refreshConfig();
      showSuccess(trimmedUrl ? '¡Video de YouTube guardado y vinculado al Banner con éxito!' : 'Video del banner retirado con éxito.');
    } catch (err: any) {
      showError(err.message || 'Error al guardar video de YouTube');
    } finally {
      setSavingQuickVideo(false);
    }
  };

  // Handle saving general banner configuration
  const handleSaveBannerConfig = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSavingConfig(true);
    try {
      await api.updateAdminConfig({
        banner_altura: bannerAltura as any,
        banner_altura_custom: Number(bannerAlturaCustom),
        banner_mostrar_logo: bannerMostrarLogo,
        banner_logo_url: bannerLogoUrl,
        banner_logo_tamano: bannerLogoTamano,
        banner_logo_posicion: bannerLogoPosicion,
        banner_intervalo_segundos: Number(bannerIntervalo),
        banner_video_youtube_url: bannerVideoGlobal.trim(),
        banner_overlay_opacidad: Number(bannerOverlayOpacidad),
        banner_overlay_estilo: bannerOverlayEstilo,
        banner_overlay_blur: Number(bannerOverlayBlur),
      });

      if (refreshConfig) await refreshConfig();
      showSuccess('¡Configuración general del banner, degradado y logo guardada y aplicada con éxito!');
    } catch (err: any) {
      showError(err.message || 'Error al guardar configuración del banner');
    } finally {
      setSavingConfig(false);
    }
  };

  // Open editor for new slide
  const handleNewSlide = () => {
    setEditingSlide({
      idioma: activeLang,
      titulo: '',
      subtitulo: '',
      texto: '',
      imagen_fallback: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85',
      video_youtube_url: '',
      boton_texto: activeLang === 'en' ? 'Book Now' : 'Reservar ahora',
      orden: slides.filter((s) => s.idioma === activeLang).length + 1,
      activo: true,
      mostrar_logo: true,
    });
    setIsModalOpen(true);
  };

  // Quick Add Photo Direct from Computer without modal
  const handleQuickAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        try {
          const newSlideData: Partial<BannerSlide> = {
            idioma: activeLang,
            titulo: 'Gunayala (San Blas) Paradise',
            subtitulo: 'Experiencias y traslados directos al paraíso',
            texto: '',
            imagen_fallback: dataUrl,
            video_youtube_url: '',
            boton_texto: activeLang === 'en' ? 'Book Now' : 'Reservar ahora',
            orden: slides.filter((s) => s.idioma === activeLang).length + 1,
            activo: true,
            mostrar_logo: true,
          };
          await api.createAdminBannerSlide(newSlideData);
          await loadBannerSlides();
          showSuccess('¡Nueva foto agregada al carrusel con éxito!');
        } catch (err: any) {
          showError('Error al agregar foto: ' + (err.message || ''));
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Open editor for existing slide
  const handleEditSlide = (slide: BannerSlide) => {
    setEditingSlide({ ...slide });
    setIsModalOpen(true);
  };

  // Handle local image upload via FileReader inside modal
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result && editingSlide) {
        setEditingSlide({
          ...editingSlide,
          imagen_fallback: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle logo upload
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        setBannerLogoUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Save slide (Create or Update) - Absolutely NO mandatory fields
  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;

    setSavingSlide(true);

    try {
      // Auto-extract thumbnail if image is empty but YouTube link is provided
      let finalImage = editingSlide.imagen_fallback?.trim();
      const ytUrl = editingSlide.video_youtube_url?.trim() || '';

      if (!finalImage && ytUrl) {
        const ytId = extractYouTubeId(ytUrl);
        if (ytId) {
          finalImage = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
        }
      }

      if (!finalImage) {
        finalImage = 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1920&q=85';
      }

      const slideToSave: Partial<BannerSlide> = {
        ...editingSlide,
        titulo: editingSlide.titulo?.trim() || '',
        subtitulo: editingSlide.subtitulo?.trim() || '',
        texto: editingSlide.texto?.trim() || '',
        imagen_fallback: finalImage,
        video_youtube_url: ytUrl,
        boton_texto: editingSlide.boton_texto?.trim() || (activeLang === 'en' ? 'Book Now' : 'Reservar ahora'),
      };

      if (editingSlide.id) {
        await api.updateAdminBannerSlide(editingSlide.id, slideToSave);
      } else {
        await api.createAdminBannerSlide(slideToSave);
      }

      await loadBannerSlides();
      setIsModalOpen(false);
      setEditingSlide(null);
      showSuccess('¡Slide del banner guardado con éxito!');
    } catch (err: any) {
      showError(err.message || 'Error al guardar slide');
    } finally {
      setSavingSlide(false);
    }
  };

  // Delete slide
  const handleDeleteSlide = async (id: number) => {
    try {
      await api.deleteAdminBannerSlide(id);
      await loadBannerSlides();
      showSuccess('Slide eliminado del carrusel con éxito');
    } catch (err: any) {
      showError('Error al eliminar slide: ' + (err.message || ''));
    }
  };

  // Move slide up / down in order
  const handleMoveSlide = async (index: number, direction: 'up' | 'down') => {
    const currentLangSlides = slides.filter((s) => s.idioma === activeLang);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= currentLangSlides.length) return;

    const newLangSlides = [...currentLangSlides];
    const temp = newLangSlides[index];
    newLangSlides[index] = newLangSlides[targetIndex];
    newLangSlides[targetIndex] = temp;

    // Re-assign order numbers
    newLangSlides.forEach((s, idx) => {
      s.orden = idx + 1;
    });

    const otherLangSlides = slides.filter((s) => s.idioma !== activeLang);
    const combined = [...otherLangSlides, ...newLangSlides];

    setSlides(combined);

    try {
      await api.saveAdminBannerBatch(combined);
      showSuccess('Orden del carrusel actualizado');
    } catch (err) {
      console.error('Error al guardar nuevo orden:', err);
    }
  };

  // Filter slides for active language
  const currentLangSlides = slides.filter((s) => s.idioma === activeLang);
  const detectedQuickYtId = extractYouTubeId(quickYoutubeInput);

  return (
    <div className="space-y-6">
      {/* Toast notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#0E9AA7]/10 text-[#0E9AA7]">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-stone-900 font-heading">
                Gestión del Banner Principal & Carrusel (Hero)
              </h2>
              <p className="text-xs text-stone-500">
                Personaliza fotos, altura en pantalla, enlaces de video de YouTube y superposición de logo sobre el slide.
              </p>
            </div>
          </div>
        </div>

        {/* Language switcher */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            type="button"
            onClick={() => setActiveLang('es')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLang === 'es'
                ? 'bg-white shadow-sm text-stone-900 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>🇪🇸</span>
            <span>Español ({slides.filter((s) => s.idioma === 'es').length} fotos)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveLang('en')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeLang === 'en'
                ? 'bg-white shadow-sm text-stone-900 font-extrabold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>🇺🇸</span>
            <span>English ({slides.filter((s) => s.idioma === 'en').length} photos)</span>
          </button>
        </div>
      </div>

      {/* QUICK YOUTUBE VIDEO CARD (ULTRA SIMPLE & NO REQUIRED FIELDS) */}
      <div className="bg-gradient-to-br from-stone-900 via-[#102730] to-[#0A1D24] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-teal-900/40 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white font-heading flex items-center gap-2">
                <span>Video de YouTube en el Banner Principal</span>
                <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Directo
                </span>
              </h3>
              <p className="text-xs text-stone-300">
                Pega el enlace de YouTube que desees reproducir en el banner de fondo o modal. No requiere campos obligatorios.
              </p>
            </div>
          </div>

          {detectedQuickYtId && (
            <span className="text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Video ID detectado: {detectedQuickYtId}</span>
            </span>
          )}
        </div>

        <form onSubmit={handleQuickSaveYouTube} className="space-y-4 pt-1">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={quickYoutubeInput}
                onChange={(e) => setQuickYoutubeInput(e.target.value)}
                placeholder="Pega enlace: https://www.youtube.com/watch?v=... o https://youtu.be/..."
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-stone-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              {quickYoutubeInput && (
                <button
                  type="button"
                  onClick={() => setQuickYoutubeInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white text-xs font-bold px-2 py-1 cursor-pointer"
                  title="Limpiar"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={savingQuickVideo}
              className="px-6 py-3 rounded-2xl bg-[#0E9AA7] hover:bg-[#0c8793] text-white text-xs sm:text-sm font-extrabold shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102 flex-shrink-0"
            >
              {savingQuickVideo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Video en Banner</span>
                </>
              )}
            </button>
          </div>

          {/* Quick YouTube Preview Box */}
          {detectedQuickYtId ? (
            <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={`https://img.youtube.com/vi/${detectedQuickYtId}/hqdefault.jpg`}
                  alt="YouTube Preview"
                  className="w-24 h-16 object-cover rounded-xl border border-white/20"
                />
                <div>
                  <p className="text-xs font-bold text-white">Video Listo para Reproducción</p>
                  <p className="text-[11px] text-stone-400 font-mono">ID: {detectedQuickYtId}</p>
                  <a
                    href={`https://www.youtube.com/watch?v=${detectedQuickYtId}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-teal-300 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>Probar en YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setQuickYoutubeInput('');
                  setBannerVideoGlobal('');
                  api.updateAdminConfig({ banner_video_youtube_url: '' }).then(() => {
                    if (refreshConfig) refreshConfig();
                    showSuccess('Video retirado del banner.');
                  });
                }}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-red-500/20 text-stone-300 hover:text-red-300 text-xs font-bold transition-all cursor-pointer border border-white/10"
              >
                Quitar Video del Banner
              </button>
            </div>
          ) : quickYoutubeInput.trim() ? (
            <p className="text-xs text-amber-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Asegúrate de pegar un enlace válido de YouTube (ej. https://www.youtube.com/watch?v=...)</span>
            </p>
          ) : null}
        </form>
      </div>

      {/* SECTION 1: GLOBAL BANNER CONTROLS (HEIGHT, LOGO OVERLAY, ROTATION) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#E8622C]" />
            <h3 className="text-base font-bold text-stone-900">
              1. Altura, Logo y Ajustes del Banner
            </h3>
          </div>
          <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-3 py-1 rounded-full">
            Sin campos obligatorios
          </span>
        </div>

        <form onSubmit={handleSaveBannerConfig} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Control: ALTURA DEL BANNER */}
            <div className="space-y-3 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-[#0E9AA7]" />
                  <span>Altura del Banner en Pantalla</span>
                </span>
                <span className="text-[11px] font-bold text-[#0E9AA7] bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                  {bannerAltura === 'personalizado' ? `${bannerAlturaCustom}px` : bannerAltura.toUpperCase()}
                </span>
              </label>
              
              {/* Presets visual cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'compacto', label: 'Compacto', desc: '~600px' },
                  { id: 'estandar', label: 'Estándar', desc: '~720px' },
                  { id: 'amplio', label: 'Amplio', desc: '~860px (Recomendado)' },
                  { id: 'pantalla_completa', label: 'Pantalla Completa', desc: '100vh' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBannerAltura(item.id)}
                    className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      bannerAltura === item.id
                        ? 'border-[#0E9AA7] bg-teal-50/80 shadow-sm text-stone-900'
                        : 'border-stone-200 bg-white hover:border-stone-300 text-stone-600'
                    }`}
                  >
                    <span className="text-xs font-bold">{item.label}</span>
                    <span className="text-[10px] text-stone-400 mt-1">{item.desc}</span>
                  </button>
                ))}
              </div>

              {/* Custom Height Option */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5">
                  <label className="font-semibold cursor-pointer flex items-center gap-1.5">
                    <input
                      type="radio"
                      name="alturaType"
                      checked={bannerAltura === 'personalizado'}
                      onChange={() => setBannerAltura('personalizado')}
                      className="text-[#0E9AA7]"
                    />
                    <span>O ajustar altura personalizada exacta (px):</span>
                  </label>
                  {bannerAltura === 'personalizado' && (
                    <span className="font-extrabold text-[#0E9AA7] text-sm">{bannerAlturaCustom} px</span>
                  )}
                </div>
                {bannerAltura === 'personalizado' && (
                  <div className="space-y-1 bg-white p-3 rounded-xl border border-stone-200">
                    <input
                      type="range"
                      min={550}
                      max={1200}
                      step={10}
                      value={bannerAlturaCustom}
                      onChange={(e) => setBannerAlturaCustom(Number(e.target.value))}
                      className="w-full accent-[#0E9AA7] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                      <span>550 px (Mínimo)</span>
                      <span>850 px (Ideal Panorámico)</span>
                      <span>1200 px (Máximo)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Control: LOGO SOBRE EL SLIDE / VIDEO */}
            <div className="space-y-3 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F2B705]" />
                  <span>Logo Superpuesto sobre el Slide / Video</span>
                </label>
                
                {/* Switch On/Off */}
                <button
                  type="button"
                  onClick={() => setBannerMostrarLogo(!bannerMostrarLogo)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    bannerMostrarLogo ? 'bg-[#0E9AA7]' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      bannerMostrarLogo ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {bannerMostrarLogo ? (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-stone-200">
                  {/* Logo source */}
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Logo a mostrar en el Banner (Opcional):
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bannerLogoUrl}
                        onChange={(e) => setBannerLogoUrl(e.target.value)}
                        placeholder="Usa el logo oficial o pega URL de logo PNG/SVG transparente"
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                      />
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        accept="image/*"
                        onChange={handleLogoFileChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl border border-stone-300 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir</span>
                      </button>
                    </div>
                  </div>

                  {/* Logo Size & Position */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                        Tamaño del Logo:
                      </label>
                      <select
                        value={bannerLogoTamano}
                        onChange={(e) => setBannerLogoTamano(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-stone-50"
                      >
                        <option value="normal">Normal (Estándar)</option>
                        <option value="grande">Grande (Destacado)</option>
                        <option value="extragrande">Extra Grande</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase text-stone-500 mb-1">
                        Posición del Logo:
                      </label>
                      <select
                        value={bannerLogoPosicion}
                        onChange={(e) => setBannerLogoPosicion(e.target.value as any)}
                        className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs font-bold bg-stone-50"
                      >
                        <option value="arriba_titulo">Arriba del Título (Integrado)</option>
                        <option value="centrado">Centrado Superior</option>
                        <option value="flotante">Flotante Superior Izquierda</option>
                      </select>
                    </div>
                  </div>

                  {/* Preview Logo */}
                  <div className="p-3 bg-[#0a232c] rounded-xl flex items-center justify-center gap-3">
                    <span className="text-[10px] font-mono text-stone-400">Vista previa del logo:</span>
                    {bannerLogoUrl ? (
                      <img src={bannerLogoUrl} alt="Logo Preview" className="h-9 w-auto object-contain" />
                    ) : (
                      <Logo isLight={true} className="scale-90" />
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic bg-white p-3 rounded-xl border border-stone-200">
                  El logo superpuesto está desactivado para el banner (solo se mostrarán títulos y botones sobre las fotos/videos).
                </p>
              )}
            </div>

            {/* Control: ROTACIÓN AUTOMÁTICA & SEGUNDOS */}
            <div className="space-y-2 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700 flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-[#0E9AA7]" />
                <span>Velocidad de Rotación Automática del Carrusel</span>
              </label>
              <div className="flex items-center gap-3">
                <select
                  value={bannerIntervalo}
                  onChange={(e) => setBannerIntervalo(Number(e.target.value))}
                  className="px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white focus:ring-2 focus:ring-[#0E9AA7] cursor-pointer flex-1"
                >
                  <option value={4}>4 Segundos (Rápido)</option>
                  <option value={5}>5 Segundos (Dinámico)</option>
                  <option value={6}>6 Segundos (Recomendado)</option>
                  <option value={8}>8 Segundos (Relajado)</option>
                  <option value={10}>10 Segundos (Lento)</option>
                </select>
                <span className="text-xs text-stone-500 font-medium">por slide</span>
              </div>
              <p className="text-[11px] text-stone-400">
                El carrusel rota suavemente entre todas las fotos activas y se pausa automáticamente al colocar el cursor encima.
              </p>
            </div>

            {/* Control: DEGRADADO, TRANSPARENCIA Y CLARIDAD DEL VIDEO DEL CLIENTE */}
            <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-teal-50/70 to-stone-50 border border-teal-200 lg:col-span-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-800 flex items-center gap-2">
                  <Sliders className="w-4.5 h-4.5 text-[#0E9AA7]" />
                  <span>Degradado, Transparencia & Claridad del Video / Banner</span>
                  <span className="text-[10px] bg-teal-600 text-white font-bold px-2 py-0.5 rounded-md uppercase">
                    Ajustable
                  </span>
                </label>
                <span className="text-xs font-mono font-bold text-[#0E9AA7] bg-white px-2.5 py-1 rounded-lg border border-teal-200 shadow-xs">
                  Opacidad: {bannerOverlayOpacidad}% | Desenfoque: {bannerOverlayBlur}px
                </span>
              </div>

              <p className="text-xs text-stone-600">
                Ajusta la intensidad de la sombra o degradado para que se pueda leer el texto perfectamente y a la vez se aprecie con total nitidez el detalle y color del video subido.
              </p>

              {/* Grid of Styles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {[
                  {
                    id: 'cinematico_suave',
                    title: 'Cinemático Suave',
                    desc: 'Balanceado para leer textos con sombra sutil de fondo',
                  },
                  {
                    id: 'degradado_lateral',
                    title: 'Degradado Lateral Izquierdo',
                    desc: 'Oscuridad a la izquierda para el texto, video 100% libre a la derecha',
                  },
                  {
                    id: 'minimo_video_claro',
                    title: 'Mínimo / Video Ultra Claro',
                    desc: 'Máxima transparencia para apreciar el video del cliente en HD',
                  },
                  {
                    id: 'radial_vinyeta',
                    title: 'Radial / Viñeta',
                    desc: 'Bordes suaves oscurecidos, centro totalmente despejado',
                  },
                  {
                    id: 'degradado_inferior',
                    title: 'Degradado Inferior',
                    desc: 'Base inferior sombreada para botones y logos',
                  },
                  {
                    id: 'solido_translucido',
                    title: 'Translúcido Parejo',
                    desc: 'Capa suave y uniforme en toda la pantalla',
                  },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setBannerOverlayEstilo(st.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                      bannerOverlayEstilo === st.id
                        ? 'border-[#0E9AA7] bg-white shadow-md ring-2 ring-[#0E9AA7]/20 text-stone-900'
                        : 'border-stone-200 bg-white/70 hover:bg-white text-stone-600'
                    }`}
                  >
                    <span className="text-xs font-extrabold flex items-center justify-between">
                      <span>{st.title}</span>
                      {bannerOverlayEstilo === st.id && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0E9AA7]" />
                      )}
                    </span>
                    <span className="text-[11px] text-stone-500 mt-1">{st.desc}</span>
                  </button>
                ))}
              </div>

              {/* Sliders for Opacity and Blur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-xl border border-stone-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">Intensidad / Opacidad de la Sombra:</span>
                    <span className="font-mono font-extrabold text-[#0E9AA7]">{bannerOverlayOpacidad}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={bannerOverlayOpacidad}
                    onChange={(e) => setBannerOverlayOpacidad(Number(e.target.value))}
                    className="w-full accent-[#0E9AA7] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>0% (100% Transparente / Puro Video)</span>
                    <span>50% (Equilibrado)</span>
                    <span>100% (Oscuro)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-700">Filtro de Desenfoque / Blur de Fondo:</span>
                    <span className="font-mono font-extrabold text-[#0E9AA7]">{bannerOverlayBlur} px</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={bannerOverlayBlur}
                    onChange={(e) => setBannerOverlayBlur(Number(e.target.value))}
                    className="w-full accent-[#0E9AA7] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                    <span>0 px (Nítido / Sin desenfoque)</span>
                    <span>3 px (Suave)</span>
                    <span>10 px (Glass)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button for General Settings */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-3 rounded-2xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
              style={{ backgroundColor: theme.primaryColor || '#0E9AA7' }}
            >
              {savingConfig ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Guardar Ajustes de Banner, Degradado y Logo</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: SLIDES & PHOTO CAROUSEL LIST */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#0E9AA7]" />
              <span>2. Fotos y Slides del Carrusel ({activeLang === 'es' ? 'Español' : 'English'})</span>
            </h3>
            <p className="text-xs text-stone-500">
              Carga fotos desde tu computador o añade enlaces directos. Todo es opcional y flexible.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Upload from computer directly */}
            <input
              type="file"
              ref={quickPhotoInputRef}
              accept="image/*"
              onChange={handleQuickAddPhoto}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => quickPhotoInputRef.current?.click()}
              className="px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 flex items-center gap-2 cursor-pointer transition-all"
            >
              <Upload className="w-4 h-4 text-[#0E9AA7]" />
              <span>Subir Foto Rápida</span>
            </button>

            {/* Custom slide button */}
            <button
              type="button"
              onClick={handleNewSlide}
              className="px-5 py-2.5 rounded-2xl text-xs font-extrabold text-white shadow-md flex items-center gap-2 cursor-pointer hover:scale-105 transition-all"
              style={{ backgroundColor: theme.secondaryColor || '#E8622C' }}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Slide con Textos</span>
            </button>
          </div>
        </div>

        {/* Slides Grid / List */}
        {loading ? (
          <div className="py-12 text-center text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0E9AA7]" />
            <span>Cargando fotos del carrusel...</span>
          </div>
        ) : currentLangSlides.length === 0 ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-stone-700">No hay fotos registradas para este idioma</p>
            <p className="text-xs text-stone-500 mb-4">Haz clic en "Subir Foto Rápida" o "Nuevo Slide" para comenzar.</p>
            <button
              onClick={handleNewSlide}
              className="px-4 py-2 bg-[#0E9AA7] text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              + Agregar Primera Foto
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentLangSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                {/* Photo Header */}
                <div className="relative aspect-video w-full bg-stone-900 overflow-hidden group">
                  <img
                    src={slide.imagen_fallback || 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1000&q=80'}
                    alt={slide.titulo || 'Slide'}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-white font-mono text-[11px] font-bold border border-white/20">
                      Slide #{index + 1}
                    </span>
                    {slide.video_youtube_url && (
                      <span className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Video className="w-3 h-3" />
                        <span>Video YT</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                        slide.activo ? 'bg-emerald-600 text-white' : 'bg-stone-600 text-stone-200'
                      }`}
                    >
                      {slide.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </div>

                  {/* Quick Preview of logo overlay flag */}
                  {slide.mostrar_logo !== false && bannerMostrarLogo && (
                    <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-amber-300 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Logo Activo</span>
                    </div>
                  )}
                </div>

                {/* Content Details */}
                <div className="p-4 space-y-2 flex-1">
                  <h4 className="font-extrabold text-sm text-stone-900 leading-snug line-clamp-2">
                    {slide.titulo || '(Foto sin título - Visual pura)'}
                  </h4>
                  {slide.subtitulo && (
                    <p className="text-xs text-teal-800 font-semibold line-clamp-1">
                      {slide.subtitulo}
                    </p>
                  )}
                  {slide.video_youtube_url && (
                    <p className="text-[11px] text-red-600 font-mono truncate flex items-center gap-1">
                      <Video className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{slide.video_youtube_url}</span>
                    </p>
                  )}
                </div>

                {/* Action Bar */}
                <div className="p-3 bg-white border-t border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    {/* Order up / down */}
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveSlide(index, 'up')}
                      title="Mover arriba"
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === currentLangSlides.length - 1}
                      onClick={() => handleMoveSlide(index, 'down')}
                      title="Mover abajo"
                      className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 cursor-pointer"
                    >
                      <MoveDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditSlide(slide)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#0E9AA7]" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl cursor-pointer transition-colors"
                      title="Eliminar slide"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SLIDE CREATE / EDIT MODAL - ABSOLUTELY NO MANDATORY FIELDS */}
      {isModalOpen && editingSlide && (
        <div
          id="slide-editor-modal"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 bg-stone-900 text-white">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-5 h-5 text-[#0E9AA7]" />
                <div>
                  <h3 className="font-extrabold text-base font-heading">
                    {editingSlide.id ? `Editar Slide #${editingSlide.id}` : 'Cargar Nueva Foto / Video'}
                  </h3>
                  <span className="text-[10px] text-stone-400">Todos los campos son opcionales y fáciles de actualizar</span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white text-sm font-bold px-2 py-1 rounded cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveSlide} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase text-stone-700">
                  Foto de Fondo para el Slide (Opcional)
                </label>
                
                {/* Image Preview Box */}
                {editingSlide.imagen_fallback && (
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-300 shadow-inner">
                    <img
                      src={editingSlide.imagen_fallback}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono rounded">
                      Vista Previa
                    </span>
                  </div>
                )}

                {/* Upload Button + URL input */}
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto px-4 py-2.5 bg-[#0E9AA7] hover:bg-[#0c8793] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Cargar Foto desde mi Computador</span>
                  </button>

                  <span className="text-xs text-stone-400 font-bold">o pega URL:</span>

                  <input
                    type="text"
                    value={editingSlide.imagen_fallback || ''}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        imagen_fallback: e.target.value,
                      })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>
              </div>

              {/* YouTube Video Link for Slide */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-red-600" />
                  <span>Enlace de Video de YouTube (Opcional)</span>
                </label>
                <input
                  type="text"
                  value={editingSlide.video_youtube_url || ''}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      video_youtube_url: e.target.value,
                    })
                  }
                  placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Título Principal (Opcional)
                </label>
                <input
                  type="text"
                  value={editingSlide.titulo || ''}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      titulo: e.target.value,
                    })
                  }
                  placeholder="Ej. Descubre las 365 islas de San Blas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Subtítulo (Opcional)
                </label>
                <input
                  type="text"
                  value={editingSlide.subtitulo || ''}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      subtitulo: e.target.value,
                    })
                  }
                  placeholder="Ej. El paraíso caribeño te espera a solo unas horas"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Descripción / Texto Detallado (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={editingSlide.texto || ''}
                  onChange={(e) =>
                    setEditingSlide({
                      ...editingSlide,
                      texto: e.target.value,
                    })
                  }
                  placeholder="Traslados diarios 4x4 y tours todo incluido con guías nativos..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              {/* CTA Button Text & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Texto del Botón (Opcional)
                  </label>
                  <input
                    type="text"
                    value={editingSlide.boton_texto || ''}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        boton_texto: e.target.value,
                      })
                    }
                    placeholder="Reservar ahora"
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Idioma del Slide
                  </label>
                  <select
                    value={editingSlide.idioma || 'es'}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        idioma: e.target.value as any,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                  >
                    <option value="es">🇪🇸 Español</option>
                    <option value="en">🇺🇸 English</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlide.activo !== false}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        activo: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0E9AA7] rounded accent-[#0E9AA7]"
                  />
                  <span>Slide Activo en el carrusel</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingSlide.mostrar_logo !== false}
                    onChange={(e) =>
                      setEditingSlide({
                        ...editingSlide,
                        mostrar_logo: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#0E9AA7] rounded accent-[#0E9AA7]"
                  />
                  <span>Mostrar Logo en este slide</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-600 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={savingSlide}
                  className="px-6 py-2.5 rounded-xl bg-[#0E9AA7] hover:bg-[#0c8793] text-white text-xs font-extrabold shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  {savingSlide ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Guardar Slide</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
