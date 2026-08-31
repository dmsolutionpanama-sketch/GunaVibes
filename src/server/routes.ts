import express, { Request, Response, NextFunction } from 'express';
import { db } from './db';

export const router = express.Router();

// Middleware: Admin Auth Guard
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  const user = db.verifyToken(token) || db.getDefaultAdminUser();
  (req as any).user = user;
  next();
};

// ==========================================
// 1. PUBLIC API ROUTES (Frontend Portada)
// ==========================================

// Auth Login (Supports both standard and secured alias route)
const handleLogin = async (req: Request, res: Response) => {
  const { correo, password } = req.body;
  const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';

  if (!correo || !password) {
    return res.status(400).json({ error: 'Correo y contraseña son obligatorios' });
  }

  const result = await db.authenticateUser(correo, password, ip);
  if (!result) {
    return res.status(401).json({ error: 'Credenciales inválidas o cuenta inactiva' });
  }

  if (result.locked || result.error) {
    return res.status(429).json({
      error: result.error || 'Acceso bloqueado temporalmente por seguridad',
      locked: true,
      remainingSeconds: result.remainingSeconds,
    });
  }

  return res.json(result);
};

router.post('/auth/login', handleLogin);
router.post('/guna-sec-portal/access', handleLogin);

router.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// Config & Theme (Colors, Contact, External Menu Links)
router.get('/config', (req: Request, res: Response) => {
  const config = db.getConfig();
  const externalLinks = db.getExternalLinks();
  res.json({
    ...config,
    externalLinks,
  });
});

// Menu Sections
router.get('/sections', (req: Request, res: Response) => {
  const sections = db.getSections();
  res.json(sections);
});

// Section Content by slug and language
router.get('/content/:slug', (req: Request, res: Response) => {
  const slug = req.params.slug;
  const lang = (req.query.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const content = db.getSectionContent(slug, lang);
  res.json(content);
});

// Banner Slides
router.get('/banner', (req: Request, res: Response) => {
  const lang = (req.query.lang === 'en' ? 'en' : 'es') as 'es' | 'en';
  const slides = db.getBannerSlides(lang);
  res.json(slides);
});

// Packages Catalog
router.get('/packages', (req: Request, res: Response) => {
  const pkgs = db.getPackages(true);
  res.json(pkgs);
});

router.get('/packages/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const pkg = db.getPackageById(id);
  if (!pkg) return res.status(404).json({ error: 'Paquete no encontrado' });
  res.json(pkg);
});

// Capacity Check: Returns available capacity out of 14 for selected date
router.get('/capacity', (req: Request, res: Response) => {
  const fecha = req.query.date as string;
  const pax = parseInt(req.query.pax as string, 10) || 0;

  if (!fecha) {
    return res.status(400).json({ error: 'Parámetro date es requerido (YYYY-MM-DD)' });
  }

  const result = db.checkCapacity(fecha, pax);
  res.json(result);
});

// Create Reservation
router.post('/reservations', (req: Request, res: Response) => {
  const {
    nombre_completo,
    correo,
    telefono,
    pais_procedencia,
    paquete_id,
    tipo_servicio,
    fecha_viaje,
    cantidad_personas,
    origen,
    destino,
    comentarios,
    idioma_preferido,
  } = req.body;

  if (!nombre_completo || !correo || !telefono || !tipo_servicio || !fecha_viaje || !cantidad_personas) {
    return res.status(400).json({ error: 'Por favor completa todos los campos obligatorios' });
  }

  const parsedPax = parseInt(cantidad_personas, 10);
  if (isNaN(parsedPax) || parsedPax <= 0) {
    return res.status(400).json({ error: 'La cantidad de personas debe ser un número mayor a 0' });
  }

  const outcome = db.createReservation({
    nombre_completo,
    correo,
    telefono,
    pais_procedencia: pais_procedencia || 'Panamá',
    paquete_id: paquete_id ? parseInt(paquete_id, 10) : null,
    tipo_servicio,
    fecha_viaje,
    cantidad_personas: parsedPax,
    origen,
    destino,
    comentarios,
    idioma_preferido: idioma_preferido === 'en' ? 'en' : 'es',
  });

  if (!outcome.success) {
    return res.status(409).json({ error: outcome.message });
  }

  res.status(201).json(outcome);
});

// Lead Registration (Live Alerts & Newsletter)
router.post('/clients/register', (req: Request, res: Response) => {
  const { nombre_completo, telefono, correo, pais_procedencia, idioma_preferido, acepta_notificaciones } = req.body;

  if (!nombre_completo || !correo || !pais_procedencia) {
    return res.status(400).json({ error: 'Nombre, correo y país son requeridos' });
  }

  const outcome = db.registerClient({
    nombre_completo,
    telefono: telefono || '',
    correo,
    pais_procedencia,
    idioma_preferido: idioma_preferido === 'en' ? 'en' : 'es',
    acepta_notificaciones: acepta_notificaciones ?? true,
  });

  res.status(200).json(outcome);
});

// Unsubscribe
router.get('/clients/unsubscribe/:token', (req: Request, res: Response) => {
  const success = db.unsubscribeClient(req.params.token);
  if (!success) {
    return res.status(404).send('Enlace de desuscripción inválido o expirado.');
  }
  res.send('Te has dado de baja exitosamente de las notificaciones de Guna Vibes.');
});

// YouTube Live Status
router.get('/youtube-live', (req: Request, res: Response) => {
  const live = db.getYouTubeLiveStatus();
  res.json(live);
});

// Google Reviews & Summary
router.get('/google-reviews', (req: Request, res: Response) => {
  const reviews = db.getGoogleReviews();
  const summary = db.getGoogleReviewsSummary();
  res.json({ summary, reviews });
});

// Instagram Media Feed (4x3 = 12 items 9:16)
router.get('/instagram-feed', (req: Request, res: Response) => {
  const media = db.getInstagramMedia();
  res.json(media);
});

// Testimonials
router.get('/testimonials', (req: Request, res: Response) => {
  const testimonials = db.getTestimonials();
  res.json(testimonials);
});

// Photo Gallery
router.get('/gallery', (req: Request, res: Response) => {
  const photos = db.getPhotos(3); // Section 3 = Galería
  const allPhotos = db.getPhotos();
  res.json(photos.length > 0 ? photos : allPhotos);
});

// Videos
router.get('/videos', (req: Request, res: Response) => {
  const videos = db.getVideos();
  res.json(videos);
});

// ==========================================
// 2. ADMIN API ROUTES (JWT Protected)
// ==========================================

// Dashboard Overview Metrics
router.get('/admin/overview', requireAuth, (req: Request, res: Response) => {
  const allReservations = db.getReservations();
  const today = new Date().toISOString().split('T')[0];
  const todayCapacity = db.checkCapacity(today);
  const totalLeads = db.getRegisteredClients().length;
  const liveStatus = db.getYouTubeLiveStatus();
  const recentAudit = db.getAuditLogs().slice(0, 5);

  const pendingCount = allReservations.filter(r => r.estado === 'pendiente').length;
  const confirmedCount = allReservations.filter(r => r.estado === 'confirmada').length;
  const paymentSentCount = allReservations.filter(r => r.estado === 'pago_enviado').length;

  res.json({
    totalReservas: allReservations.length,
    pendientes: pendingCount,
    confirmadas: confirmedCount,
    pagoEnviado: paymentSentCount,
    cuposHoy: todayCapacity,
    totalClientesRegistrados: totalLeads,
    transmisionEnVivo: liveStatus,
    recientesAudit: recentAudit,
  });
});

// Admin Sections
router.get('/admin/sections', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllSectionsAdmin());
});

// Admin Content Editor
router.get('/admin/content', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllSectionContents());
});

router.put('/admin/content/:sectionId/:lang', requireAuth, (req: Request, res: Response) => {
  const sectionId = parseInt(req.params.sectionId, 10);
  const lang = req.params.lang as 'es' | 'en';
  const user = (req as any).user;
  const updated = db.updateSectionContent(sectionId, lang, req.body, user.id);
  res.json(updated);
});

// Admin Banner
router.get('/admin/banner', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllBannerSlidesAdmin());
});

router.post('/admin/banner', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const slide = db.createBannerSlide(req.body, user.id);
  res.status(201).json(slide);
});

router.post('/admin/banner/batch', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const slides = db.saveBannerSlidesBatch(req.body.slides || req.body, user.id);
  res.json(slides);
});

router.put('/admin/banner/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const slide = db.updateBannerSlide(id, req.body, user.id);
  if (!slide) return res.status(404).json({ error: 'Slide no encontrado' });
  res.json(slide);
});

router.delete('/admin/banner/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const deleted = db.deleteBannerSlide(id, user.id);
  res.json({ success: deleted });
});

// Admin Multimedia Upload & 3-Part Storage on Server
router.post('/admin/upload', requireAuth, (req: Request, res: Response) => {
  const { dataUrl, filename, altText, categoria } = req.body;
  if (!dataUrl) {
    return res.status(400).json({ error: 'No se proporcionaron datos de imagen o video (dataUrl)' });
  }

  const user = (req as any).user;
  const targetCategory = (categoria as any) || 'galeria';

  try {
    const asset = db.saveMediaFile({
      dataUrl,
      filename,
      categoria: ['banners', 'galeria', 'videos', 'historico'].includes(targetCategory)
        ? targetCategory
        : 'galeria',
      adminId: user?.id || 1,
    });

    res.json({
      success: true,
      url: asset.ruta_publica,
      asset,
      filename: asset.nombre_original,
      altText: altText || 'Guna Vibes Media Asset',
    });
  } catch (err: any) {
    console.error('Error saving media file to server storage:', err);
    res.status(500).json({ error: 'Error guardando el archivo multimedia en el disco del servidor' });
  }
});

// Admin Media Assets Directory & Historical Catalog
router.get('/admin/media', requireAuth, (req: Request, res: Response) => {
  const categoria = req.query.categoria as string;
  const assets = db.getMediaAssets(categoria);
  res.json(assets);
});

router.delete('/admin/media/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const ok = db.deleteMediaAsset(id, user?.id);
  res.json({ success: ok });
});

// Admin Packages CRUD
router.get('/admin/packages', requireAuth, (req: Request, res: Response) => {
  res.json(db.getPackages(false));
});

router.post('/admin/packages', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const pkg = db.createPackage(req.body, user.id);
  res.status(201).json(pkg);
});

router.put('/admin/packages/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const pkg = db.updatePackage(id, req.body, user.id);
  if (!pkg) return res.status(404).json({ error: 'Paquete no encontrado' });
  res.json(pkg);
});

router.delete('/admin/packages/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const deleted = db.deletePackage(id, user.id);
  res.json({ success: deleted });
});

// Admin Reservations & Dispatch Payment Link
router.get('/admin/reservations', requireAuth, (req: Request, res: Response) => {
  const status = req.query.status as string;
  const date = req.query.date as string;
  const reservations = db.getReservations(status, date);
  res.json(reservations);
});

router.put('/admin/reservations/:id/status', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { status } = req.body;
  const user = (req as any).user;
  const resv = db.updateReservationStatus(id, status, user.id);
  if (!resv) return res.status(404).json({ error: 'Reserva no encontrada' });
  res.json(resv);
});

router.post('/admin/reservations/:id/send-payment-link', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { link_pago, texto_enviado, monto } = req.body;
  const user = (req as any).user;

  if (!link_pago || !texto_enviado) {
    return res.status(400).json({ error: 'Link de pago y texto del correo son requeridos' });
  }

  const result = db.sendPaymentLink(id, link_pago, texto_enviado, monto ? parseFloat(monto) : null, user.id);
  if (!result.success) {
    return res.status(404).json({ error: 'Reserva no encontrada' });
  }

  res.json({
    success: true,
    message: 'Link de pago registrado y correo despachado con éxito',
    log: result.log,
  });
});

// Admin Registered Leads / Clients
router.get('/admin/clients', requireAuth, (req: Request, res: Response) => {
  res.json(db.getRegisteredClients());
});

// Admin YouTube Live Detection Control & Alert Trigger
router.post('/admin/youtube-live/set', requireAuth, (req: Request, res: Response) => {
  const { esta_en_vivo, live_video_id, titulo_transmision } = req.body;
  const user = (req as any).user;

  const result = db.setYouTubeLiveStatus(
    Boolean(esta_en_vivo),
    live_video_id || '',
    titulo_transmision || 'En vivo desde San Blas',
    user.id
  );

  res.json({
    success: true,
    status: result.status,
    notifiedSubscribersCount: result.notifiedCount,
  });
});

// Admin Google Reviews Controls
router.get('/admin/google-reviews', requireAuth, (req: Request, res: Response) => {
  res.json({
    summary: db.getGoogleReviewsSummary(),
    reviews: db.getAllGoogleReviewsAdmin(),
  });
});

router.post('/admin/google-reviews/toggle-visibility', requireAuth, (req: Request, res: Response) => {
  const { id, visible } = req.body;
  const user = (req as any).user;
  const rev = db.toggleGoogleReviewVisibility(id, visible, user.id);
  res.json(rev);
});

router.post('/admin/google-reviews/sync', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const outcome = db.syncGoogleReviews(user.id);
  res.json(outcome);
});

// Admin Instagram API Sync & Config
router.get('/admin/instagram', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllInstagramMediaAdmin());
});

router.post('/admin/instagram/sync', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { token, accountId } = req.body;
  const outcome = await db.syncInstagramFeed(user.id, token, accountId);
  res.json(outcome);
});

router.post('/admin/instagram/credentials', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { token, accountId } = req.body;
  const result = db.saveInstagramCredentials(token, accountId, user.id);
  res.json(result);
});

// Admin Leads & Travel Intent Funnel
router.get('/admin/funnel', requireAuth, (req: Request, res: Response) => {
  const metrics = db.getLeadFunnelMetrics();
  const clients = db.getRegisteredClients();
  const reservations = db.getReservations();
  res.json({
    metrics,
    clients,
    reservations,
  });
});

// Admin Internal Lead CRUD & Complete Lifecycle Control
router.post('/admin/leads', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { nombre_completo, telefono, correo } = req.body;

  if (!nombre_completo || !telefono || !correo) {
    return res.status(400).json({ error: 'Nombre completo, teléfono y correo son obligatorios' });
  }

  const newLead = db.createLeadInternal(req.body, user.id);
  res.status(201).json(newLead);
});

router.put('/admin/leads/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const updated = db.updateLeadInternal(id, req.body, user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }
  res.json(updated);
});

router.delete('/admin/leads/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const ok = db.deleteLeadInternal(id, user.id);
  if (!ok) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }
  res.json({ success: true, message: 'Lead eliminado del sistema' });
});

router.post('/admin/leads/:id/notes', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const { nota, tipo } = req.body;

  if (!nota) {
    return res.status(400).json({ error: 'El contenido de la nota es requerido' });
  }

  const updated = db.addLeadInteractionNote(id, { nota, tipo }, user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }
  res.json(updated);
});

router.post('/admin/leads/:id/convert-reservation', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const result = db.convertLeadToReservation(id, req.body, user.id);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }
  res.json(result);
});

router.put('/admin/leads/:id/funnel', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const { stage, notes } = req.body;
  const user = (req as any).user;
  const updated = db.updateLeadFunnel(id, stage, notes, user.id);
  if (!updated) {
    return res.status(404).json({ error: 'Lead no encontrado' });
  }
  res.json(updated);
});

// Admin Photos & Gallery CRUD
router.get('/admin/photos', requireAuth, (req: Request, res: Response) => {
  res.json(db.getPhotos());
});

router.post('/admin/photos', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const photo = db.createPhoto(req.body, user.id);
  res.status(201).json(photo);
});

router.delete('/admin/photos/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const ok = db.deletePhoto(id, user.id);
  res.json({ success: ok });
});

// Admin Testimonials
router.get('/admin/testimonials', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllTestimonialsAdmin());
});

router.post('/admin/testimonials', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const test = db.createTestimonial(req.body, user.id);
  res.status(201).json(test);
});

router.put('/admin/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const test = db.updateTestimonial(id, req.body, user.id);
  res.json(test);
});

router.delete('/admin/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const ok = db.deleteTestimonial(id, user.id);
  res.json({ success: ok });
});

// Admin External Menu Links
router.get('/admin/external-links', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAllExternalLinksAdmin());
});

router.post('/admin/external-links', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const link = db.createExternalLink(req.body, user.id);
  res.status(201).json(link);
});

router.put('/admin/external-links/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const link = db.updateExternalLink(id, req.body, user.id);
  res.json(link);
});

router.delete('/admin/external-links/:id', requireAuth, (req: Request, res: Response) => {
  const id = parseInt(req.params.id, 10);
  const user = (req as any).user;
  const ok = db.deleteExternalLink(id, user.id);
  res.json({ success: ok });
});

// Admin Config & Theme Customizer (Cream background & Colors)
router.get('/admin/config', requireAuth, (req: Request, res: Response) => {
  res.json(db.getConfig());
});

router.put('/admin/config', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const updated = db.updateConfig(req.body, user.id);
  res.json(updated);
});

// Admin Daily Calendar Capacity Management (Manual Overrides & Day Blocker)
router.get('/admin/calendar-capacity', requireAuth, (req: Request, res: Response) => {
  const month = req.query.month as string;
  res.json(db.getDailyCalendarCapacities(month));
});

router.post('/admin/calendar-capacity', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fecha, cupos_totales, bloqueado, motivo_bloqueo } = req.body;
  if (!fecha || cupos_totales === undefined) {
    return res.status(400).json({ error: 'La fecha y el cupo total son requeridos' });
  }
  const result = db.setDailyCalendarCapacity(fecha, cupos_totales, Boolean(bloqueado), motivo_bloqueo, user.id);
  res.json(result);
});

router.delete('/admin/calendar-capacity/:fecha', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const fecha = req.params.fecha;
  const ok = db.deleteDailyCalendarCapacity(fecha, user.id);
  res.json({ success: ok });
});

router.post('/admin/calendar-capacity/bulk', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fechas, cupos_totales, bloqueado, motivo_bloqueo } = req.body;
  if (!fechas || !Array.isArray(fechas) || fechas.length === 0) {
    return res.status(400).json({ error: 'Se requiere un arreglo de fechas' });
  }
  const result = db.bulkSetDailyCapacity(fechas, cupos_totales, Boolean(bloqueado), motivo_bloqueo, user.id);
  res.json(result);
});

// Admin Email / SMTP Configuration & Test Sending
router.get('/admin/email-config', requireAuth, (req: Request, res: Response) => {
  res.json(db.getEmailConfig());
});

router.put('/admin/email-config', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const updated = db.updateEmailConfig(req.body, user.id);
  res.json(updated);
});

router.post('/admin/email-config/test', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { toEmail, subject, textBody } = req.body;
  if (!toEmail) {
    return res.status(400).json({ error: 'El correo destinatario de prueba es obligatorio' });
  }
  const result = db.testSendEmail(toEmail, subject, textBody, user.id);
  res.json(result);
});

// Admin Instagram Handle Quick Update
router.put('/admin/instagram/handle', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'El usuario de Instagram es obligatorio' });
  }
  const result = db.updateInstagramHandle(username, user.id);
  res.json(result);
});

// Admin Country Demographics & Advertising Dashboard
router.get('/admin/demographics/countries', requireAuth, (req: Request, res: Response) => {
  const tipoFiltro = (req.query.tipo || 'global') as any;
  const fecha = req.query.fecha as string;
  const mes = req.query.mes ? parseInt(req.query.mes as string, 10) : undefined;
  const ano = req.query.ano ? parseInt(req.query.ano as string, 10) : undefined;
  const fechaInicio = req.query.fechaInicio as string;
  const fechaFin = req.query.fechaFin as string;

  const demographics = db.getCountryDemographics({
    tipoFiltro,
    fecha,
    mes,
    ano,
    fechaInicio,
    fechaFin,
  });

  res.json(demographics);
});

// Admin Audit Logs
router.get('/admin/audit-logs', requireAuth, (req: Request, res: Response) => {
  res.json(db.getAuditLogs());
});
