import React, { useState, useEffect } from 'react';
import { SectionContent } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { BannerManagerTab } from './BannerManagerTab';
import {
  FileText,
  Save,
  Globe,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  Sparkles,
} from 'lucide-react';

const SECTIONS = [
  { slug: 'inicio', label: 'Inicio (Hero & General)' },
  { slug: 'sobre-nosotros', label: 'Sobre Nosotros (Historia & Cultura)' },
  { slug: 'paquetes', label: 'Paquetes Turísticos' },
  { slug: 'traslados', label: 'Traslados 4x4 y Lanchas' },
  { slug: 'recomendaciones', label: 'Recomendaciones (Google Reviews)' },
  { slug: 'politicas', label: 'Políticas de Reserva y Devolución' },
  { slug: 'contacto', label: 'Contacto y Ubicación' },
];

export const ContentManagerTab: React.FC = () => {
  const { theme } = useTheme();

  const [activeSubTab, setActiveSubTab] = useState<'banner' | 'sections'>('banner');
  const [selectedSlug, setSelectedSlug] = useState('sobre-nosotros');
  const [activeLang, setActiveLang] = useState<'es' | 'en'>('es');
  const [content, setContent] = useState<SectionContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form Fields
  const [titulo, setTitulo] = useState('');
  const [subtitulo, setSubtitulo] = useState('');
  const [cuerpoHtml, setCuerpoHtml] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  const loadContent = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const data = await api.getSectionContent(selectedSlug, activeLang);
      setContent(data);
      if (data) {
        setTitulo(data.titulo || '');
        setSubtitulo(data.subtitulo || '');
        setCuerpoHtml(data.cuerpo_html || '');
        setVideoUrl(data.video_youtube_url || '');
      } else {
        setTitulo('');
        setSubtitulo('');
        setCuerpoHtml('');
        setVideoUrl('');
      }
    } catch (err) {
      console.error('Error cargando contenido CMS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'sections') {
      loadContent();
    }
  }, [selectedSlug, activeLang, activeSubTab]);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMessage(null);
    try {
      await api.saveSectionContent(selectedSlug, {
        idioma: activeLang,
        titulo: titulo || selectedSlug,
        subtitulo,
        cuerpo_html: cuerpoHtml,
        video_youtube_url: videoUrl,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al guardar contenido');
      setTimeout(() => setErrorMessage(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Mode Switcher (Banner Hero vs Sections CMS) */}
      <div className="bg-white p-3 rounded-2xl shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('banner')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'banner'
                ? 'bg-[#123C4B] text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Layers className="w-4 h-4 text-teal-300" />
            <span>Banner Principal & Carrusel de Fotos (Hero)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('sections')}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'sections'
                ? 'bg-[#123C4B] text-white shadow-md'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Contenido de Secciones Informativas (CMS)</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-stone-400 hidden sm:inline-block">
          {activeSubTab === 'banner' ? 'Ajusta fotos, altura, videos y logo' : 'Edita textos descriptivos de la web'}
        </span>
      </div>

      {/* Render Banner Manager if selected */}
      {activeSubTab === 'banner' && <BannerManagerTab />}

      {/* Render CMS Sections Editor if selected */}
      {activeSubTab === 'sections' && (
        <div className="space-y-6">
          {/* Top Selector Bar */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
            {/* Section Select */}
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#0E9AA7]" />
              <div>
                <label className="block text-[11px] font-bold uppercase text-stone-500 mb-0.5">
                  Sección a editar
                </label>
                <select
                  value={selectedSlug}
                  onChange={(e) => setSelectedSlug(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50 cursor-pointer"
                >
                  {SECTIONS.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Language Tabs */}
            <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveLang('es')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLang === 'es' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇪🇸 Español
              </button>
              <button
                type="button"
                onClick={() => setActiveLang('en')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeLang === 'en' ? 'bg-white shadow-sm text-stone-900' : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>

          {/* Editor Form */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
            {loading ? (
              <div className="py-12 text-center text-stone-400">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                Cargando contenido de la sección...
              </div>
            ) : (
              <form onSubmit={handleSave} className="space-y-5">
                {success && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>¡Cambios guardados con éxito! Los visitantes verán esta actualización de inmediato.</span>
                  </div>
                )}

                {errorMessage && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Título Principal ({activeLang.toUpperCase()}) (Opcional)
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej. Sobre Nosotros - Historia y Cultura Guna"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Subtítulo / Bajada ({activeLang.toUpperCase()})
                  </label>
                  <input
                    type="text"
                    value={subtitulo}
                    onChange={(e) => setSubtitulo(e.target.value)}
                    placeholder="Ej. Operador turístico 100% nativo de la comarca Gunayala"
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                {/* YouTube Video URL */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-red-600" />
                    <span>URL de Video de YouTube (Opcional - Se incrustará en la sección)</span>
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... o https://youtu.be/..."
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Acepta cualquier formato estándar de YouTube; el sistema lo transformará automáticamente a formato embed responsivo.
                  </p>
                </div>

                {/* Rich HTML Body */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center justify-between">
                    <span>Cuerpo / Texto Enriquecido HTML ({activeLang.toUpperCase()})</span>
                    <span className="text-[10px] text-stone-400 font-normal">Soporta etiquetas &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;</span>
                  </label>
                  <textarea
                    rows={12}
                    value={cuerpoHtml}
                    onChange={(e) => setCuerpoHtml(e.target.value)}
                    placeholder="<p>Escribe aquí el contenido descriptivo...</p>"
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-3 border-t border-stone-200 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar Sección en {activeLang === 'es' ? 'Español' : 'Inglés'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
