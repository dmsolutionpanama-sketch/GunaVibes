import React, { useEffect, useState } from 'react';
import { InstagramMedia } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Instagram,
  Play,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  Heart,
} from 'lucide-react';

export const InstagramWidget: React.FC = () => {
  const { language, t } = useLanguage();
  const { theme, config } = useTheme();

  const [posts, setPosts] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);

  const instagramHandle = config?.redes_sociales?.instagram
    ? config.redes_sociales.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').replace(/^@/, '')
    : 'gunavibes';

  const profileUrl = `https://www.instagram.com/${instagramHandle}`;

  useEffect(() => {
    const fetchInstagram = async () => {
      try {
        const data = await api.getInstagramFeed();
        setPosts(data);
      } catch (err) {
        console.warn('Error cargando Instagram feed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstagram();
  }, []);

  return (
    <section id="instagram-feed-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Title & Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-pink-700 bg-pink-50 border border-pink-200 mb-2">
            <Instagram className="w-3.5 h-3.5" />
            <span>@{instagramHandle} • Instagram Feed</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
            {t('insta_title')}
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            {t('insta_subtitle')}
          </p>
        </div>

        <a
          id="btn-instagram-follow"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-white shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap self-start sm:self-auto"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          }}
        >
          <Instagram className="w-4 h-4" />
          <span>{t('insta_button')}</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>

      {/* 4 Columns x 3 Rows = 12 Posts Grid in 9:16 Aspect Ratio */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {posts.map((post) => {
          return (
            <a
              key={post.id}
              id={`instagram-post-${post.id}`}
              href={post.permalink || profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 bg-stone-900 border border-stone-200"
            >
              {/* Media Preview cropped with object-fit: cover */}
              <img
                src={post.media_url}
                alt={post.caption || `Instagram @${instagramHandle}`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Media Type Badge (Top Right) */}
              <div className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-white shadow-md">
                {post.tipo_media === 'VIDEO' ? (
                  <Play className="w-3.5 h-3.5 fill-white" />
                ) : post.tipo_media === 'CAROUSEL_ALBUM' ? (
                  <Layers className="w-3.5 h-3.5" />
                ) : (
                  <ImageIcon className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Hover Dark Overlay with Caption & Instagram Icon */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                <div className="flex items-center gap-1.5 text-pink-400 text-xs font-bold mb-1">
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Ver en Instagram</span>
                </div>
                <p className="text-xs text-stone-200 line-clamp-3 leading-relaxed">
                  {post.caption}
                </p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                  <span className="flex items-center gap-1 text-pink-300 font-semibold">
                    <Heart className="w-3 h-3 fill-pink-400" />
                    <span>@{instagramHandle}</span>
                  </span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Prominent "Ver Más en Instagram" Action Button */}
      <div className="mt-8 flex justify-center">
        <a
          id="btn-instagram-see-more"
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl font-extrabold text-sm text-white shadow-lg transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{
            background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
          }}
        >
          <Instagram className="w-5 h-5" />
          <span>Ver más publicaciones en @{instagramHandle}</span>
          <ExternalLink className="w-4 h-4 opacity-90" />
        </a>
      </div>
    </section>
  );
};
