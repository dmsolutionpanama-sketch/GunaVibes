import React, { useEffect, useState } from 'react';
import { Testimonial } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Star, MessageSquareQuote, MapPin, Quote } from 'lucide-react';

export const TestimonialsView: React.FC = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const list = await api.getTestimonials();
        setTestimonials(list);
      } catch (e) {
        console.error('Error cargando testimonios:', e);
      }
    };
    loadTestimonials();
  }, []);

  return (
    <div id="testimonials-view" className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300">
          <MessageSquareQuote className="w-4 h-4 text-amber-600" />
          <span>Experiencias Reales</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
          {language === 'en' ? 'What Our Guests Say' : 'Lo que Dicen Nuestros Clientes'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          {language === 'en'
            ? 'Read testimonials from travelers who trusted Guna Vibes for their San Blas journey.'
            : 'Conoce los testimonios de quienes han confiado en Guna Vibes para sus traslados y tours.'}
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id}
            id={`testimonial-card-${t.id}`}
            className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 flex flex-col justify-between space-y-6 relative overflow-hidden"
          >
            <Quote className="w-10 h-10 text-stone-200 absolute top-4 right-4 -rotate-12" />

            <div className="space-y-4 relative z-10">
              {/* Stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < t.calificacion
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-stone-200 text-stone-200'
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-stone-700 leading-relaxed italic">
                "{t.texto}"
              </p>
            </div>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
              <img
                src={t.foto_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={t.nombre_cliente}
                className="w-12 h-12 rounded-full object-cover border-2 border-teal-400"
              />
              <div>
                <h4 className="font-bold text-sm text-stone-900">{t.nombre_cliente}</h4>
                {t.origen && (
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0E9AA7]" />
                    <span>{t.origen}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
