import React, { useState, useEffect } from 'react';
import { Photo } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Image as ImageIcon, X, Maximize2 } from 'lucide-react';

export const GalleryView: React.FC = () => {
  const { language } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const list = await api.getGallery();
        setPhotos(list);
      } catch (e) {
        console.error('Error cargando galería:', e);
      }
    };
    fetchGallery();
  }, []);

  return (
    <div id="gallery-view" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100/80 border border-teal-300">
          <ImageIcon className="w-4 h-4 text-[#0E9AA7]" />
          <span>San Blas en Fotos</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
          {language === 'en' ? 'Photo Gallery of Gunayala' : 'Galería de Fotos de Gunayala'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          {language === 'en'
            ? 'A visual glimpse into our daily transfers, untouched sandbars, and the azure Caribbean sea.'
            : 'Un vistazo visual a nuestros traslados diarios, bancos de arena blanca y aguas turquesas del Caribe.'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {photos.map((photo) => (
          <div
            key={photo.id}
            id={`gallery-item-${photo.id}`}
            onClick={() => setSelectedPhoto(photo)}
            className="group relative h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer bg-stone-900 border border-stone-200"
          >
            <img
              src={photo.url_imagen}
              alt={photo.alt_text || 'San Blas Gunayala'}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end text-white">
              <p className="text-xs font-semibold text-stone-200 line-clamp-2">
                {photo.alt_text}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-teal-300 font-bold">
                <span>Ampliar foto</span>
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          id="gallery-lightbox-modal"
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-stone-950 rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedPhoto.url_imagen}
              alt={selectedPhoto.alt_text}
              className="w-full max-h-[75vh] object-contain mx-auto"
            />
            {selectedPhoto.alt_text && (
              <div className="p-4 bg-stone-900 text-stone-200 text-sm text-center">
                {selectedPhoto.alt_text}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
