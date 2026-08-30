import React, { useEffect, useState } from 'react';
import { SectionContent } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  CalendarCheck,
  Play,
  FileText,
  Info,
} from 'lucide-react';

interface GenericContentViewProps {
  slug: string;
  onBookClick?: () => void;
}

export const GenericContentView: React.FC<GenericContentViewProps> = ({
  slug,
  onBookClick,
}) => {
  const { language } = useLanguage();
  const { theme, config } = useTheme();

  const [content, setContent] = useState<SectionContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Contact form specific state
  const [contactSent, setContactSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      try {
        const data = await api.getSectionContent(slug, language);
        setContent(data);
      } catch (err) {
        console.error('Error cargando contenido:', err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [slug, language]);

  // Convert regular YouTube URL to embed URL
  const getEmbedUrl = (url?: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|live\/))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : '';
  };

  const videoEmbed = getEmbedUrl(content?.video_youtube_url);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSent(true);
  };

  return (
    <div id={`content-view-${slug}`} className="py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      
      {/* Title & Subtitle */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300">
          <Info className="w-4 h-4 text-[#0E9AA7]" />
          <span>Guna Vibes • San Blas</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900 leading-tight">
          {content?.titulo || 'Guna Vibes'}
        </h1>
        {content?.subtitulo && (
          <p className="text-stone-600 text-sm sm:text-base">
            {content.subtitulo}
          </p>
        )}
      </div>

      {/* Embedded YouTube Video if present */}
      {videoEmbed && (
        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video border border-stone-300/80 bg-stone-950">
          <iframe
            className="w-full h-full"
            src={videoEmbed}
            title={content?.titulo || 'Video Guna Vibes'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {/* Rich Body Content */}
      {content?.cuerpo_html && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-stone-200/80">
          <div
            className="prose prose-stone max-w-none text-stone-700 text-sm sm:text-base leading-relaxed space-y-4 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:text-stone-900 [&>h3]:mt-6 [&>h3]:mb-2 [&>p]:mb-3 [&>ul]:list-disc [&>ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: content.cuerpo_html }}
          />

          {onBookClick && slug !== 'contacto' && (
            <div className="mt-8 pt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-stone-500">
                ¿Listo para tu aventura en San Blas?
              </p>
              <button
                onClick={onBookClick}
                className="px-6 py-3 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-sm cursor-pointer"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Reservar ahora</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Special Block for Contact View */}
      {slug === 'contacto' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {/* Contact Details Card */}
          <div className="bg-[#123C4B] text-white rounded-3xl p-8 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="text-xl font-bold font-heading text-white">
                {language === 'en' ? 'Direct Contact Channels' : 'Canales de Atención Directa'}
              </h3>
              <p className="text-stone-300 text-sm leading-relaxed">
                {language === 'en'
                  ? 'Our local team is ready to organize your transfers, custom trips, or coordinate airport pickups.'
                  : 'Nuestro equipo local está listo para coordinar tus traslados privados, pasadías o traslados desde el aeropuerto.'}
              </p>

              <div className="space-y-4 pt-2 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#F2B705] flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-semibold">Oficina y Salidas:</strong>
                    <span className="text-stone-300 text-xs">{config?.direccion || 'Calle Primera, casa 36, Tocumen. Panamá'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[#0E9AA7] flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">WhatsApp / Teléfono:</strong>
                    <a href={`tel:${config?.telefono_contacto || '+507 6369-1775'}`} className="text-stone-300 text-xs hover:text-white">
                      {config?.telefono_contacto || '+507 6369-1775'}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[#E8622C] flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-semibold">Correo Electrónico:</strong>
                    <a href={`mailto:${config?.correo_contacto || 'info@gunavibes.com'}`} className="text-stone-300 text-xs hover:text-white">
                      {config?.correo_contacto || 'info@gunavibes.com'}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp CTA */}
            <a
              href={`https://wa.me/${(config?.whatsapp || '50763691775').replace(/\D/g, '')}?text=Hola%20Guna%20Vibes,%20deseo%20información%20sobre%20traslados%20a%20San%20Blas`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl font-bold text-stone-900 bg-emerald-400 hover:bg-emerald-300 shadow-lg text-center flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Chatear por WhatsApp (+507 6369-1775)</span>
            </a>
          </div>

          {/* Quick Message Form */}
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-stone-200/80">
            <h3 className="text-xl font-bold font-heading text-stone-900 mb-2">
              {language === 'en' ? 'Send us a message' : 'Envíanos un mensaje'}
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              Responderemos a tu correo en menos de 2 horas.
            </p>

            {contactSent ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-base">¡Mensaje enviado con éxito!</h4>
                <p className="text-xs">Te responderemos a la brevedad posible.</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Mensaje / Consulta</label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
                    placeholder="Escribe tu consulta sobre traslados, fechas o paquetes..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-bold text-white shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:opacity-95"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Mensaje</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
