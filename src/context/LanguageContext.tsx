import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  [key: string]: {
    es: string;
    en: string;
  };
}

export const translations: Translations = {
  // Navigation & Header
  nav_home: { es: 'Inicio', en: 'Home' },
  nav_about: { es: 'Sobre nosotros', en: 'About us' },
  nav_gallery: { es: 'Galería de Fotos', en: 'Photo Gallery' },
  nav_packages: { es: 'Paquetes', en: 'Packages' },
  nav_testimonials: { es: 'Testimonios', en: 'Testimonials' },
  nav_recommendations: { es: 'Recomendaciones', en: 'Recommendations' },
  nav_policies: { es: 'Políticas de Devolución', en: 'Return Policy' },
  nav_contact: { es: 'Contacto', en: 'Contact' },
  nav_book_now: { es: 'Reservar ahora', en: 'Book Now' },
  nav_admin: { es: 'Panel Admin', en: 'Admin Panel' },
  nav_admin_logout: { es: 'Cerrar Sesión', en: 'Log Out' },

  // Live stream badge
  live_badge: { es: 'EN VIVO', en: 'LIVE NOW' },
  live_broadcasting: { es: 'Transmitiendo en vivo desde San Blas', en: 'Broadcasting live from San Blas' },
  live_watch: { es: 'Ver transmisión', en: 'Watch live stream' },

  // Hero & Booking form
  hero_cta: { es: 'Reservar tu experiencia', en: 'Book your experience' },
  hero_badge: { es: 'Operadores nativos de Gunayala', en: 'Native Gunayala tour operators' },
  booking_title: { es: 'Reserva tu cupo a San Blas', en: 'Book your trip to San Blas' },
  booking_subtitle: { es: 'Máximo 14 pasajeros por día para garantizar tu confort', en: 'Maximum 14 travelers per day to ensure personal comfort' },
  booking_name: { es: 'Nombre completo', en: 'Full name' },
  booking_email: { es: 'Correo electrónico', en: 'Email address' },
  booking_phone: { es: 'Teléfono / WhatsApp', en: 'Phone / WhatsApp' },
  booking_service: { es: 'Tipo de servicio', en: 'Service type' },
  booking_date: { es: 'Fecha de viaje', en: 'Travel date' },
  booking_pax: { es: 'Cantidad de personas', en: 'Number of guests' },
  booking_origin: { es: 'Origen (Hotel o Aeropuerto)', en: 'Pick-up Location (Hotel or Airport)' },
  booking_destination: { es: 'Destino / Isla deseada', en: 'Destination / Desired Island' },
  booking_comments: { es: 'Comentarios o requerimientos especiales', en: 'Special requests or notes' },
  booking_submit: { es: 'Solicitar reserva ahora', en: 'Request Booking Now' },
  booking_checking_capacity: { es: 'Consultando cupo disponible...', en: 'Checking seat availability...' },
  booking_seats_left: { es: 'Cupos disponibles: {available} de {max}', en: 'Available seats: {available} of {max}' },
  booking_no_seats: { es: 'Agotado para esta fecha', en: 'Sold out for this date' },
  booking_success_title: { es: '¡Solicitud enviada con éxito!', en: 'Booking request sent successfully!' },
  booking_success_desc: { es: 'Hemos registrado tu reserva. Te enviaremos un correo de confirmación y el enlace seguro de pago para confirmar tu espacio.', en: 'We have received your request. We will email your confirmation and secure payment link shortly.' },

  // Lead capture / Live Alerts form
  lead_title: { es: '¡No te pierdas nuestras transmisiones en vivo!', en: 'Never miss our live island broadcasts!' },
  lead_subtitle: { es: 'Regístrate para recibir un aviso en tu correo cuando estemos transmitiendo desde las islas y enterarte de promociones exclusivas.', en: 'Sign up to get instant alerts whenever we go live from San Blas islands and receive exclusive offers.' },
  lead_country: { es: 'País de procedencia', en: 'Country of origin' },
  lead_accept_checkbox: { es: 'Quiero recibir avisos cuando Guna Vibes transmita en vivo y novedades por correo', en: 'I want to receive alerts when Guna Vibes goes live and news via email' },
  lead_button: { es: 'Suscribirme a avisos', en: 'Subscribe to Alerts' },
  lead_success: { es: '¡Gracias por unirte a la comunidad Guna Vibes!', en: 'Thank you for joining the Guna Vibes community!' },

  // Google Reviews & Footer trust badge
  google_badge_text: { es: 'Calificación en Google', en: 'Google Reviews Rating' },
  google_total_reviews: { es: 'Basado en {count} reseñas reales en Google', en: 'Based on {count} verified Google reviews' },
  google_view_all: { es: 'Ver todas las reseñas en Google', en: 'View all Google reviews' },
  google_write_review: { es: 'Escribe tu reseña en Google', en: 'Write a Google review' },
  google_trust_footer: { es: 'Excelente reputación turística', en: 'Top-rated Caribbean operator' },

  // Instagram section
  insta_title: { es: 'Síguenos en Instagram', en: 'Follow us on Instagram' },
  insta_subtitle: { es: 'Momentos reales capturados a diario en las aguas turquesas de San Blas', en: 'Daily real moments captured in the crystal turquoise waters of San Blas' },
  insta_button: { es: 'Ver perfil @gunavibes', en: 'View profile @gunavibes' },

  // Packages
  pkg_price_from: { es: 'Por persona', en: 'Per person' },
  pkg_includes: { es: '¿Qué incluye?', en: 'What is included?' },
  pkg_not_includes: { es: 'No incluye:', en: 'Not included:' },
  pkg_select_btn: { es: 'Reservar este paquete', en: 'Book this package' },
  pkg_filter_all: { es: 'Todos los servicios', en: 'All services' },
  pkg_filter_transfer: { es: 'Traslados', en: 'Transfers' },
  pkg_filter_tours: { es: 'Tours', en: 'Tours' },
  pkg_filter_all_inclusive: { es: 'Todo Incluido', en: 'All-Inclusive' },

  // Contact
  contact_title: { es: 'Contáctanos', en: 'Contact Us' },
  contact_whatsapp_btn: { es: 'Escríbenos al WhatsApp', en: 'Message us on WhatsApp' },
  contact_address: { es: 'Oficina y salidas', en: 'Office & Departures' },
  contact_phone: { es: 'Teléfono', en: 'Phone' },
  contact_email: { es: 'Correo electrónico', en: 'Email' },

  // Footer
  footer_desc: { es: 'Operador turístico local autorizado en Gunayala (San Blas), Panamá. Traslados seguros en 4x4 y tours a islas vírgenes con guías nativos.', en: 'Authorized local tour operator in Gunayala (San Blas), Panama. Safe 4x4 transfers and island tours with native guides.' },
  footer_quick_links: { es: 'Enlaces rápidos', en: 'Quick Links' },
  footer_rights: { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('guna_lang');
    return saved === 'en' ? 'en' : 'es';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('guna_lang', lang);
  };

  const t = (key: string, variables?: Record<string, string | number>): string => {
    const entry = translations[key];
    let text = entry ? entry[language] || entry.es || key : key;

    if (variables) {
      Object.keys(variables).forEach(k => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(variables[k]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  return ctx;
};
