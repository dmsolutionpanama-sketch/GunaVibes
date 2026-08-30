import React, { useEffect, useState } from 'react';
import { GoogleReview, GoogleReviewsSummary } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Star,
  ExternalLink,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  ThumbsUp,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

export const RecommendationsView: React.FC = () => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  const [summary, setSummary] = useState<GoogleReviewsSummary | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await api.getGoogleReviews();
        setSummary(data.summary);
        setReviews(data.reviews);
      } catch (err) {
        console.error('Error cargando reseñas de Google:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  const rating = summary?.puntaje_promedio || 4.8;
  const count = summary?.total_resenas || 132;
  const googleProfileUrl = summary?.perfil_google_url || 'https://maps.google.com/?q=Guna+Vibes+San+Blas+Panama';
  const writeReviewUrl = summary?.link_escribir_resena || 'https://g.page/r/gunavibes/review';

  return (
    <div id="recommendations-view" className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      
      {/* Top Hero Section */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-900 bg-teal-100/80 border border-teal-300">
          <Sparkles className="w-4 h-4 text-[#0E9AA7]" />
          <span>Google Business Profile</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
          {language === 'en' ? 'Guest Recommendations & Google Reviews' : 'Recomendaciones y Reseñas en Google'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl mx-auto">
          {language === 'en'
            ? 'Real feedback from travelers who have explored the islands of Gunayala (San Blas) with Guna Vibes.'
            : 'Opiniones auténticas de viajeros de todo el mundo que han vivido la experiencia de San Blas con nosotros.'}
        </p>
      </div>

      {/* Booking-style Scoreboard Banner */}
      <div
        id="google-scoreboard-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 flex flex-col lg:flex-row items-center justify-between gap-8"
      >
        {/* Left: Big Score & Stars */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          {/* Big Number Pill */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl text-white flex flex-col items-center justify-center shadow-lg flex-shrink-0"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <span className="text-3xl sm:text-4xl font-black">{rating}</span>
            <span className="text-[11px] uppercase tracking-wider font-bold opacity-80">de 5.0</span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-center sm:justify-start gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-amber-200 text-amber-300'
                  }`}
                />
              ))}
            </div>
            <h3 className="text-xl font-bold text-stone-900">
              {rating >= 4.7 ? 'Excelente • Top Calificado' : 'Muy Bueno'}
            </h3>
            <p className="text-sm text-stone-500 font-medium flex items-center justify-center sm:justify-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('google_total_reviews', { count })}</span>
            </p>
          </div>
        </div>

        {/* Middle: Breakdown indicators */}
        <div className="w-full lg:w-4/12 space-y-2 border-t lg:border-t-0 lg:border-l border-stone-200 pt-4 lg:pt-0 lg:pl-6 text-xs font-semibold text-stone-700">
          <div className="flex items-center justify-between">
            <span>Puntualidad 4x4 y lanchas</span>
            <span className="font-bold text-[#0E9AA7]">4.9</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-[#0E9AA7] h-1.5 rounded-full w-[98%]" />
          </div>

          <div className="flex items-center justify-between">
            <span>Atención de guías nativos</span>
            <span className="font-bold text-[#0E9AA7]">5.0</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-[#0E9AA7] h-1.5 rounded-full w-[100%]" />
          </div>

          <div className="flex items-center justify-between">
            <span>Belleza de playas e islas</span>
            <span className="font-bold text-[#0E9AA7]">5.0</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-1.5">
            <div className="bg-[#0E9AA7] h-1.5 rounded-full w-[100%]" />
          </div>
        </div>

        {/* Right: CTA Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
          <a
            id="btn-write-google-review"
            href={writeReviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <Edit3 className="w-4 h-4" />
            <span>{t('google_write_review')}</span>
          </a>

          <a
            id="btn-view-all-google-reviews"
            href={googleProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 rounded-xl font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <span>{t('google_view_all')}</span>
            <ExternalLink className="w-4 h-4 text-stone-500" />
          </a>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#0E9AA7]" />
          <span>{language === 'en' ? 'Latest Verified Reviews' : 'Últimas Reseñas Verificadas'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              id={`google-review-card-${rev.id}`}
              className="bg-white rounded-2xl p-6 shadow-md border border-stone-200/80 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-3">
                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={rev.autor_foto_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={rev.autor_nombre}
                    className="w-11 h-11 rounded-full object-cover border-2 border-teal-200"
                  />
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 leading-tight">
                      {rev.autor_nombre}
                    </h4>
                    <p className="text-xs text-stone-400">{rev.fecha_relativa}</p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < rev.calificacion
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-stone-200 text-stone-200'
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed italic">
                  "{rev.texto}"
                </p>
              </div>

              {/* Verified Tag */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Reseña en Google Maps</span>
                </span>
                <ThumbsUp className="w-3.5 h-3.5 opacity-60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
