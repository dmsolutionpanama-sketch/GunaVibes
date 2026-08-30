import {
  AdminUser,
  AuditLog,
  BannerSlide,
  CapacityCheckResponse,
  CountryDemographicsFilter,
  CountryDemographicsResponse,
  DailyCalendarCapacity,
  EmailConfig,
  ExternalMenuLink,
  GoogleReview,
  GoogleReviewsSummary,
  InstagramMedia,
  MenuSection,
  PackageItem,
  PaymentEmailLog,
  Photo,
  RegisteredClient,
  Reservation,
  SectionContent,
  SiteConfig,
  Testimonial,
  VideoItem,
  YouTubeLiveStatus,
} from '../types';

const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('guna_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Public
  async getConfig(): Promise<SiteConfig & { externalLinks: ExternalMenuLink[] }> {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Error al obtener la configuración');
    return res.json();
  },

  async getSections(): Promise<MenuSection[]> {
    const res = await fetch(`${API_BASE}/sections`);
    if (!res.ok) throw new Error('Error al obtener secciones');
    return res.json();
  },

  async getSectionContent(slug: string, lang: 'es' | 'en'): Promise<SectionContent> {
    const res = await fetch(`${API_BASE}/content/${slug}?lang=${lang}`);
    if (!res.ok) throw new Error('Error al obtener contenido');
    return res.json();
  },

  async saveSectionContent(slug: string, data: Partial<SectionContent>): Promise<SectionContent> {
    // Find section by slug or update directly
    const sections = await this.getSections();
    const section = sections.find(s => s.slug === slug);
    const sectionId = section ? section.id : 1;
    const lang = data.idioma || 'es';
    return this.updateAdminContent(sectionId, lang, data);
  },

  async getBanner(lang: 'es' | 'en'): Promise<BannerSlide[]> {
    const res = await fetch(`${API_BASE}/banner?lang=${lang}`);
    if (!res.ok) throw new Error('Error al obtener banner');
    return res.json();
  },

  async getBannerSlides(lang: 'es' | 'en'): Promise<BannerSlide[]> {
    return this.getBanner(lang);
  },

  async getPackages(): Promise<PackageItem[]> {
    const res = await fetch(`${API_BASE}/packages`);
    if (!res.ok) throw new Error('Error al obtener paquetes');
    return res.json();
  },

  async checkCapacity(date: string, pax = 0): Promise<CapacityCheckResponse> {
    const res = await fetch(`${API_BASE}/capacity?date=${encodeURIComponent(date)}&pax=${pax}`);
    if (!res.ok) throw new Error('Error al consultar cupo');
    return res.json();
  },

  async createReservation(data: any): Promise<{ success: boolean; message: string; reserva?: Reservation }> {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Error al enviar reserva');
    }
    return json;
  },

  async registerClient(data: any): Promise<{ success: boolean; message: string; client?: RegisteredClient }> {
    const res = await fetch(`${API_BASE}/clients/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al registrarse');
    return json;
  },

  async getYouTubeLive(): Promise<YouTubeLiveStatus> {
    const res = await fetch(`${API_BASE}/youtube-live`);
    if (!res.ok) throw new Error('Error al consultar estado de transmisión');
    return res.json();
  },

  async getYouTubeLiveStatus(): Promise<YouTubeLiveStatus> {
    return this.getYouTubeLive();
  },

  async getGoogleReviews(): Promise<{ summary: GoogleReviewsSummary; reviews: GoogleReview[] }> {
    const res = await fetch(`${API_BASE}/google-reviews`);
    if (!res.ok) throw new Error('Error al consultar reseñas de Google');
    return res.json();
  },

  async getInstagramFeed(): Promise<InstagramMedia[]> {
    const res = await fetch(`${API_BASE}/instagram-feed`);
    if (!res.ok) throw new Error('Error al consultar feed de Instagram');
    return res.json();
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const res = await fetch(`${API_BASE}/testimonials`);
    if (!res.ok) throw new Error('Error al obtener testimonios');
    return res.json();
  },

  async getGallery(): Promise<Photo[]> {
    const res = await fetch(`${API_BASE}/gallery`);
    if (!res.ok) throw new Error('Error al obtener galería');
    return res.json();
  },

  async getVideos(): Promise<VideoItem[]> {
    const res = await fetch(`${API_BASE}/videos`);
    if (!res.ok) throw new Error('Error al obtener videos');
    return res.json();
  },

  // Auth
  async login(correo: string, password: string): Promise<{ token: string; refreshToken: string; user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al iniciar sesión');
    return json;
  },

  async checkAuth(): Promise<{ user: AdminUser }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Sesión no válida');
    return res.json();
  },

  // Admin
  async getAdminOverview(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/overview`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al cargar métricas');
    return res.json();
  },

  async getAdminReservations(status = 'all', date = ''): Promise<Reservation[]> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (date) params.append('date', date);
    const res = await fetch(`${API_BASE}/admin/reservations?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al cargar reservas');
    return res.json();
  },

  async updateReservationStatus(id: number, status: string): Promise<Reservation> {
    const res = await fetch(`${API_BASE}/admin/reservations/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Error al actualizar estado');
    return res.json();
  },

  async sendPaymentLink(
    reservaId: number,
    link_pago: string,
    texto_enviado: string,
    monto?: number | null
  ): Promise<{ success: boolean; message: string; log: PaymentEmailLog }> {
    const res = await fetch(`${API_BASE}/admin/reservations/${reservaId}/send-payment-link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ link_pago, texto_enviado, monto }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al enviar link de pago');
    return json;
  },

  async getAdminContent(): Promise<SectionContent[]> {
    const res = await fetch(`${API_BASE}/admin/content`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener contenidos');
    return res.json();
  },

  async updateAdminContent(sectionId: number, lang: 'es' | 'en', data: Partial<SectionContent>): Promise<SectionContent> {
    const res = await fetch(`${API_BASE}/admin/content/${sectionId}/${lang}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar contenido');
    return res.json();
  },

  async getAdminPackages(): Promise<PackageItem[]> {
    const res = await fetch(`${API_BASE}/admin/packages`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener paquetes');
    return res.json();
  },

  async createPackage(data: any): Promise<PackageItem> {
    const res = await fetch(`${API_BASE}/admin/packages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear paquete');
    return res.json();
  },

  async updatePackage(id: number, data: any): Promise<PackageItem> {
    const res = await fetch(`${API_BASE}/admin/packages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar paquete');
    return res.json();
  },

  async deletePackage(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/packages/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al eliminar paquete');
    return true;
  },

  async getAdminClients(): Promise<RegisteredClient[]> {
    const res = await fetch(`${API_BASE}/admin/clients`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener clientes');
    return res.json();
  },

  async createAdminLead(data: {
    nombre_completo: string;
    telefono: string;
    correo: string;
    pais_procedencia?: string;
    idioma_preferido?: 'es' | 'en';
    origen_captacion?: string;
    paquete_interes?: string;
    paquete_id?: number | null;
    tipo_servicio_interes?: string;
    fecha_tentativa?: string;
    cantidad_personas?: number;
    monto_estimado?: number;
    estado_embudo?: string;
    notas_interaccion?: string;
    acepta_notificaciones?: boolean;
  }): Promise<RegisteredClient> {
    const res = await fetch(`${API_BASE}/admin/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al registrar lead interno');
    return json;
  },

  async updateAdminLead(id: number, data: Partial<RegisteredClient>): Promise<RegisteredClient> {
    const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar lead');
    return json;
  },

  async deleteAdminLead(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/leads/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al eliminar lead');
    return json;
  },

  async addLeadNote(id: number, nota: string, tipo: string = 'nota'): Promise<RegisteredClient> {
    const res = await fetch(`${API_BASE}/admin/leads/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ nota, tipo }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al añadir nota de interacción');
    return json;
  },

  async convertLeadToReservation(
    id: number,
    customData?: {
      fecha_viaje?: string;
      cantidad_personas?: number;
      paquete_id?: number;
      tipo_servicio?: string;
      monto_total?: number;
      origen?: string;
      destino?: string;
      comentarios?: string;
    }
  ): Promise<{ success: boolean; message: string; reserva: Reservation; lead: RegisteredClient }> {
    const res = await fetch(`${API_BASE}/admin/leads/${id}/convert-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(customData || {}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al convertir lead en reserva');
    return json;
  },

  async setYouTubeLive(esta_en_vivo: boolean, live_video_id?: string, titulo_transmision?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/youtube-live/set`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ esta_en_vivo, live_video_id, titulo_transmision }),
    });
    if (!res.ok) throw new Error('Error al configurar transmisión en vivo');
    return res.json();
  },

  async triggerTestLiveBroadcast(esta_en_vivo: boolean, video_id?: string, titulo?: string): Promise<any> {
    return this.setYouTubeLive(esta_en_vivo, video_id, titulo);
  },

  async getAdminGoogleReviews(): Promise<{ summary: GoogleReviewsSummary; reviews: GoogleReview[] }> {
    const res = await fetch(`${API_BASE}/admin/google-reviews`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener reseñas de Google');
    return res.json();
  },

  async toggleGoogleReviewVisibility(id: number, visible?: boolean): Promise<GoogleReview> {
    const res = await fetch(`${API_BASE}/admin/google-reviews/toggle-visibility`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ id, visible }),
    });
    if (!res.ok) throw new Error('Error al moderar reseña');
    return res.json();
  },

  async saveGoogleReviewsSettings(place_id: string, api_key: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({
        google_reviews: { place_id, api_key }
      }),
    });
    return res.json();
  },

  async syncGoogleReviews(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/google-reviews/sync`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al sincronizar Google Reviews');
    return res.json();
  },

  async getAdminInstagram(): Promise<InstagramMedia[]> {
    const res = await fetch(`${API_BASE}/admin/instagram`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener feed de Instagram');
    return res.json();
  },

  async syncInstagram(): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/instagram/sync`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al sincronizar Instagram');
    return res.json();
  },

  async getFunnelMetrics(): Promise<{
    metrics: import('../types').LeadFunnelMetrics;
    clients: RegisteredClient[];
    reservations: Reservation[];
  }> {
    const res = await fetch(`${API_BASE}/admin/funnel`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener métricas del embudo');
    return res.json();
  },

  async updateLeadFunnelStage(id: number, stage: string, notes?: string): Promise<RegisteredClient> {
    const res = await fetch(`${API_BASE}/admin/leads/${id}/funnel`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ stage, notes }),
    });
    if (!res.ok) throw new Error('Error al actualizar etapa del lead');
    return res.json();
  },

  async saveInstagramCredentials(token: string, accountId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/instagram/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ token, accountId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al guardar credenciales de Instagram');
    return json;
  },

  async syncInstagramWithToken(token?: string, accountId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/instagram/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ token, accountId }),
    });
    if (!res.ok) throw new Error('Error al sincronizar Instagram Graph API');
    return res.json();
  },

  async getAdminConfig(): Promise<SiteConfig> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener configuración');
    return res.json();
  },

  async updateAdminConfig(data: Partial<SiteConfig>): Promise<SiteConfig> {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar configuración');
    return res.json();
  },

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener logs de auditoría');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.getAdminAuditLogs();
  },

  async getAdminExternalLinks(): Promise<ExternalMenuLink[]> {
    const res = await fetch(`${API_BASE}/admin/external-links`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener enlaces externos');
    return res.json();
  },

  async createExternalLink(data: any): Promise<ExternalMenuLink> {
    const res = await fetch(`${API_BASE}/admin/external-links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al crear enlace');
    return res.json();
  },

  async updateExternalLink(id: number, data: any): Promise<ExternalMenuLink> {
    const res = await fetch(`${API_BASE}/admin/external-links/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error al actualizar enlace');
    return res.json();
  },

  async deleteExternalLink(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/admin/external-links/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al eliminar enlace');
    return true;
  },

  // Daily Calendar Capacity Overrides
  async getCalendarCapacities(month?: string): Promise<DailyCalendarCapacity[]> {
    const url = month ? `${API_BASE}/admin/calendar-capacity?month=${encodeURIComponent(month)}` : `${API_BASE}/admin/calendar-capacity`;
    const res = await fetch(url, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener cupos del calendario');
    return res.json();
  },

  async setCalendarCapacity(data: {
    fecha: string;
    cupos_totales: number;
    bloqueado: boolean;
    motivo_bloqueo?: string;
  }): Promise<DailyCalendarCapacity> {
    const res = await fetch(`${API_BASE}/admin/calendar-capacity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al guardar cupo');
    return json;
  },

  async deleteCalendarCapacity(fecha: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/admin/calendar-capacity/${encodeURIComponent(fecha)}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al restaurar cupo');
    return res.json();
  },

  async bulkSetCalendarCapacity(data: {
    fechas: string[];
    cupos_totales: number;
    bloqueado: boolean;
    motivo_bloqueo?: string;
  }): Promise<{ success: boolean; count: number }> {
    const res = await fetch(`${API_BASE}/admin/calendar-capacity/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al aplicar cupos masivos');
    return json;
  },

  // Outgoing Email / SMTP Settings & Live Test
  async getEmailConfig(): Promise<EmailConfig> {
    const res = await fetch(`${API_BASE}/admin/email-config`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al obtener configuración de correo');
    return res.json();
  },

  async updateEmailConfig(data: Partial<EmailConfig>): Promise<EmailConfig> {
    const res = await fetch(`${API_BASE}/admin/email-config`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar configuración de correo');
    return json;
  },

  async testSendEmail(data: { toEmail: string; subject?: string; textBody?: string }): Promise<{ success: boolean; message: string; log: any }> {
    const res = await fetch(`${API_BASE}/admin/email-config/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al enviar correo de prueba');
    return json;
  },

  // Instagram Handle
  async updateInstagramHandle(username: string): Promise<{ success: boolean; handle: string }> {
    const res = await fetch(`${API_BASE}/admin/instagram/handle`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ username }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar usuario de Instagram');
    return json;
  },

  // Country Demographics & Advertising Dashboard
  async getCountryDemographics(filter: CountryDemographicsFilter): Promise<CountryDemographicsResponse> {
    const params = new URLSearchParams();
    if (filter.tipoFiltro) params.append('tipo', filter.tipoFiltro);
    if (filter.fecha) params.append('fecha', filter.fecha);
    if (filter.mes !== undefined) params.append('mes', String(filter.mes));
    if (filter.ano !== undefined) params.append('ano', String(filter.ano));
    if (filter.fechaInicio) params.append('fechaInicio', filter.fechaInicio);
    if (filter.fechaFin) params.append('fechaFin', filter.fechaFin);

    const res = await fetch(`${API_BASE}/admin/demographics/countries?${params.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Error al cargar datos demográficos por país');
    return res.json();
  },
};
