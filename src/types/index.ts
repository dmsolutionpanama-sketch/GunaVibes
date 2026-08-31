export type ServiceType = 'traslado' | 'tour' | 'todo_incluido';
export type ReservationStatus = 'pendiente' | 'pago_enviado' | 'confirmada' | 'cancelada';
export type LeadFunnelStage =
  | 'intencion_registrada'
  | 'en_conversacion'
  | 'cotizacion_enviada'
  | 'pago_enviado'
  | 'pago_completado'
  | 'cancelado';
export type Language = 'es' | 'en';
export type MediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';

export interface AdminUser {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  two_factor_activo: boolean;
  ultimo_login?: string;
  ultimo_login_ip?: string;
  creado_en: string;
}

export interface AuditLog {
  id: number;
  admin_id?: number | null;
  admin_nombre?: string;
  accion: string;
  detalle: string;
  ip: string;
  creado_en: string;
}

export interface ExternalMenuLink {
  id: number;
  texto_menu: string;
  url: string;
  abrir_nueva_pestana: boolean;
  orden: number;
  visible: boolean;
  creado_en?: string;
}

export interface MenuSection {
  id: number;
  slug: string;
  titulo_es: string;
  titulo_en: string;
  orden: number;
  visible: boolean;
}

export interface SectionContent {
  id: number;
  seccion_id: number;
  seccion_slug?: string;
  idioma: Language;
  titulo: string;
  subtitulo: string;
  cuerpo_html: string;
  video_youtube_url?: string;
  actualizado_en?: string;
}

export interface BannerSlide {
  id: number;
  idioma: Language;
  titulo: string;
  subtitulo: string;
  texto: string;
  imagen_fallback: string;
  video_youtube_url: string;
  boton_texto: string;
  boton_url?: string;
  orden: number;
  activo: boolean;
  fotos_galeria?: string[];
  mostrar_logo?: boolean;
}

export interface Photo {
  id: number;
  seccion_id?: number | null;
  paquete_id?: number | null;
  url_imagen: string;
  alt_text: string;
  orden: number;
  destacada: boolean;
  creado_en?: string;
}

export interface VideoItem {
  id: number;
  seccion_id?: number | null;
  paquete_id?: number | null;
  titulo: string;
  video_youtube_url: string;
  orden: number;
  creado_en?: string;
}

export interface MediaAsset {
  id: number;
  categoria: 'banners' | 'galeria' | 'videos' | 'historico';
  nombre_original: string;
  nombre_servidor: string;
  ruta_publica: string;
  tipo_mime: string;
  tamano_bytes: number;
  ancho?: number;
  alto?: number;
  es_video: boolean;
  duracion_segundos?: number;
  activo: boolean;
  creado_por?: number | null;
  creado_en: string;
}

export interface PackageItem {
  id: number;
  nombre_es: string;
  nombre_en: string;
  tipo: ServiceType;
  descripcion_es: string;
  descripcion_en: string;
  incluye_es: string;
  incluye_en: string;
  no_incluye_es: string;
  no_incluye_en: string;
  precio: number;
  cupo_maximo_dia: number | null;
  activo: boolean;
  fotos?: Photo[];
  video_youtube_url?: string;
  creado_en?: string;
}

export interface Testimonial {
  id: number;
  nombre_cliente: string;
  texto: string;
  calificacion: number;
  foto_url?: string;
  visible: boolean;
  origen?: string;
  creado_en?: string;
}

export interface Reservation {
  id: number;
  nombre_completo: string;
  correo: string;
  telefono: string;
  pais_procedencia: string; // País de procedencia obligatorio
  paquete_id?: number | null;
  paquete_nombre?: string;
  tipo_servicio: ServiceType;
  fecha_viaje: string; // YYYY-MM-DD
  cantidad_personas: number;
  origen?: string;
  destino?: string;
  comentarios?: string;
  idioma_preferido: Language;
  estado: ReservationStatus;
  monto_total?: number | null;
  estado_embudo?: LeadFunnelStage;
  tiempo_respuesta_min?: number;
  notas_interaccion?: string;
  creado_en: string;
  actualizado_en?: string;
  historial_correos?: PaymentEmailLog[];
}

export interface DailyCalendarCapacity {
  id?: number;
  fecha: string; // YYYY-MM-DD
  cupos_totales: number; // Cantidad personalizada de cupos para este día
  bloqueado: boolean; // Si la fecha está 100% bloqueada/cerrada
  motivo_bloqueo?: string; // Ej: "Vehículo 4x4 en taller", "Mantenimiento lancha", "Alerta marítima"
  personas_reservadas?: number;
  cupos_disponibles?: number;
  actualizado_en?: string;
}

export type EmailProviderType = 'google_workspace' | 'smtp_private' | 'sendgrid' | 'mailgun' | 'amazon_ses';

export interface EmailConfig {
  provider: EmailProviderType;
  smtp_host: string;
  smtp_port: number;
  smtp_secure: boolean;
  smtp_user: string;
  smtp_pass: string;
  smtp_from_name: string;
  smtp_from_email: string;
  smtp_reply_to?: string;
  google_client_id?: string;
  google_client_secret?: string;
  google_refresh_token?: string;
  google_user_email?: string;
  google_app_password?: string;
  api_key?: string;
  api_domain?: string;
  firma_personalizada?: string;
  pie_legal?: string;
  estado_conexion?: 'conectado' | 'desconectado' | 'no_configurado' | 'error';
  ultimo_envio_prueba?: string;
}

export interface CountryStatItem {
  pais: string;
  codigo_pais?: string;
  bandera_emoji?: string;
  totalReservas: number;
  totalPersonas: number;
  montoTotalPagado: number;
  montoTotalCotizado: number;
  leadsInteres: number;
  tasaConversion: number; // %
  porcentajeDelTotal: number; // %
  sugerenciaPauta: string;
  idioma_principal: 'es' | 'en';
}

export interface CountryDemographicsFilter {
  tipoFiltro: 'dia' | 'mes' | 'ano' | 'todo' | 'personalizado';
  fecha?: string; // YYYY-MM-DD para búsqueda por día
  mes?: number; // 1-12
  ano?: number; // 2026, 2025, etc.
  fechaInicio?: string;
  fechaFin?: string;
}

export interface CountryDemographicsResponse {
  periodo: {
    tipo: string;
    etiqueta: string;
    fecha?: string;
    mes?: number;
    ano?: number;
    fechaInicio?: string;
    fechaFin?: string;
  };
  resumen: {
    totalPaises: number;
    paisLider: string;
    totalViajeros: number;
    ingresosTotales: number;
    leadsTotales: number;
    paisMayorTicket: string;
  };
  rankingPaises: CountryStatItem[];
  paisesTopPublicidad: {
    pais: string;
    recomendacion: string;
    retornoEstimado: string;
    canalOptimo: string;
    publicoObjetivo: string;
  }[];
}

export type LeadOrigin =
  | 'whatsapp'
  | 'llamada'
  | 'instagram'
  | 'facebook'
  | 'web_formulario'
  | 'recomendacion'
  | 'correo_directo'
  | 'mostrador'
  | 'otro';

export interface LeadInteractionNote {
  id: number;
  fecha: string;
  autor: string;
  autor_id?: number | null;
  nota: string;
  tipo: 'nota' | 'llamada' | 'whatsapp' | 'cotizacion' | 'reunion' | 'instagram' | 'facebook' | 'otro';
}

export type PackageSanBlas = PackageItem;

export interface RegisteredClient {
  id: number;
  nombre_completo: string;
  telefono: string;
  correo: string;
  pais_procedencia: string;
  idioma_preferido: Language;
  acepta_notificaciones: boolean;
  token_baja: string;
  // Complete lead lifecycle & internal registration fields:
  origen_captacion?: LeadOrigin;
  fecha_tentativa?: string;
  cantidad_personas?: number;
  paquete_interes?: string;
  paquete_id?: number | null;
  tipo_servicio_interes?: ServiceType;
  estado_embudo?: LeadFunnelStage;
  tiempo_respuesta_min?: number;
  notas_interaccion?: string;
  monto_estimado?: number;
  historial_notas?: LeadInteractionNote[];
  ultimo_contacto?: string;
  creado_en: string;
  actualizado_en?: string;
  creado_por_admin_id?: number;
  creado_por_nombre?: string;
}

export interface LeadFunnelMetrics {
  totalInteracciones: number;
  leadsIntencionViaje: number;
  enConversacion: number;
  cotizacionesEnviadas: number;
  linksPagoEnviados: number;
  pagosCompletados: number;
  tasaConversionGlobal: number;
  tiempoPromedioRespuestaMin: number;
  ingresosTotalesPagados: number;
  volumenProyectado: number;
}

export interface YouTubeLiveStatus {
  id?: number;
  live_video_id: string;
  esta_en_vivo: boolean;
  titulo_transmision: string;
  notificado: boolean;
  detectado_en?: string;
  finalizado_en?: string;
  actualizado_en?: string;
}

export interface PaymentEmailLog {
  id: number;
  reserva_id: number;
  link_pago: string;
  texto_enviado: string;
  monto?: number | null;
  enviado_por?: number | null;
  enviado_por_nombre?: string;
  enviado_en: string;
}

export interface GoogleReview {
  id: number;
  autor_nombre: string;
  autor_foto_url: string;
  calificacion: number;
  texto: string;
  fecha_relativa: string;
  autor_perfil_url: string;
  visible: boolean;
  sincronizado_en?: string;
}

export interface GoogleReviewsSummary {
  id?: number;
  puntaje_promedio: number;
  total_resenas: number;
  perfil_google_url: string;
  link_escribir_resena: string;
  place_id?: string;
  api_key?: string;
  ultima_sincronizacion?: string;
  actualizado_en?: string;
}

export interface InstagramMedia {
  id: number;
  instagram_media_id: string;
  tipo_media: MediaType;
  media_url: string;
  permalink: string;
  caption: string;
  publicado_en: string;
  orden: number;
  visible: boolean;
  sincronizado_en?: string;
}

export interface ThemeConfig {
  bgColor: string; // Default cream: #F5EFE6
  cardBgColor: string; // Default white: #FFFFFF
  primaryColor: string; // Turquoise: #0E9AA7
  secondaryColor: string; // Coral: #E8622C
  accentColor: string; // Yellow: #F2B705
  textColor: string; // Deep navy: #123C4B
  headerDarkBg: string; // #123C4B
  borderRadius: string; // 'rounded-xl' | 'rounded-2xl' | 'rounded-lg'
  // Typography configuration:
  fontFamilyFrontendHeading?: string; // 'Outfit', 'Plus Jakarta Sans', etc.
  fontFamilyFrontendBody?: string; // 'Plus Jakarta Sans', 'Inter', etc.
  fontSizeFrontendBase?: string; // '14px' | '15px' | '16px' | '17px' | '18px'
  fontFamilyBackend?: string; // 'Plus Jakarta Sans', 'Inter', etc.
  fontSizeBackendBase?: string; // '13px' | '14px' | '15px' | '16px'
}

export interface UserPersonalTypography {
  fontFamily: string;
  fontSize: string;
  overrideSystem: boolean;
}

export interface SiteConfig {
  nombre_empresa?: string;
  cupo_maximo_dia?: number;
  cupo_maximo_diario?: number;
  telefono_contacto: string;
  correo_contacto: string;
  direccion: string;
  whatsapp: string;
  enlaces_externos_menu?: ExternalMenuLink[];
  google_place_id: string;
  google_places_api_key: string;
  google_reviews_ultima_sincronizacion?: string;
  logo_svg_url: string;
  // Banner & Slider Configuration
  banner_altura?: 'compacto' | 'estandar' | 'amplio' | 'pantalla_completa' | 'personalizado' | string;
  banner_altura_custom?: number; // Altura en pixeles cuando es personalizado (ej. 750 a 1100)
  banner_mostrar_logo?: boolean; // Opción para mostrar el logo sobre el slide / video
  banner_logo_url?: string; // Logo opcional para el banner (si está vacío, usa el logo institucional)
  banner_logo_tamano?: 'normal' | 'grande' | 'extragrande';
  banner_logo_posicion?: 'arriba_titulo' | 'centrado' | 'flotante';
  banner_autoplay?: boolean;
  banner_intervalo_segundos?: number; // Segundos entre cada slide (ej. 5)
  banner_transicion?: 'fade' | 'slide';
  banner_video_youtube_url?: string;
  instagram_username?: string;
  instagram_access_token: string;
  instagram_business_account_id: string;
  youtube_channel_id: string;
  youtube_api_key: string;
  smtp_host?: string;
  smtp_port?: string;
  smtp_user?: string;
  smtp_pass?: string;
  smtp_from?: string;
  email_config?: EmailConfig;
  two_factor_enabled?: boolean;
  redes_sociales?: {
    instagram?: string;
    facebook?: string;
    whatsapp?: string;
    youtube?: string;
  };
  theme: ThemeConfig;
}

export interface CapacityCheckResponse {
  fecha: string;
  cupo_maximo: number;
  personas_reservadas: number;
  cupos_disponibles: number;
  disponible: boolean;
  bloqueado?: boolean;
  motivo_bloqueo?: string;
}
