import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { RegisteredClient, Reservation, PackageSanBlas, AuditLog, SiteConfig } from '../../types';
import {
  TrendingUp,
  Users,
  CalendarCheck,
  DollarSign,
  Clock,
  Sparkles,
  Phone,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Plus,
  Shield,
  FileCode,
  Copy,
  Radio,
  Star,
  Instagram,
  RefreshCw,
  Eye,
  Activity,
  Layers,
} from 'lucide-react';

interface ExecutiveOverviewTabProps {
  onNavigateTab: (tabId: string) => void;
  onOpenNewLeadModal: () => void;
}

export const ExecutiveOverviewTab: React.FC<ExecutiveOverviewTabProps> = ({
  onNavigateTab,
  onOpenNewLeadModal,
}) => {
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<RegisteredClient[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<PackageSanBlas[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  const loadAllBackendData = async () => {
    setLoading(true);
    try {
      const [resList, clientList, pkgList, logs, cfg] = await Promise.all([
        api.getAdminReservations(),
        api.getAdminClients(),
        api.getPackages(),
        api.getAuditLogs(),
        api.getConfig(),
      ]);
      setReservations(resList || []);
      setClients(clientList || []);
      setPackages(pkgList || []);
      setAuditLogs(logs || []);
      setConfig(cfg || null);
    } catch (err) {
      console.error('Error cargando datos del backend:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllBackendData();
  }, []);

  // Calculate high-level integrated business metrics
  const totalReservas = reservations.length;
  const reservasConfirmadas = reservations.filter((r) => r.estado === 'confirmada');
  const reservasPendientes = reservations.filter((r) => r.estado === 'pendiente' || r.estado === 'pago_enviado');
  
  const ingresosConfirmados = reservasConfirmadas.reduce((sum, r) => sum + (r.monto_total || 0), 0);
  const ingresosProyectados = reservations.reduce((sum, r) => sum + (r.monto_total || 0), 0);

  const totalLeads = clients.length;
  const leadsEnPipeline = clients.filter(
    (c) => c.estado_embudo !== 'cancelado' && c.estado_embudo !== 'pago_completado'
  ).length;

  const leadsConvertidos = clients.filter((c) => c.estado_embudo === 'pago_completado' || c.estado_embudo === 'pago_enviado').length;
  const conversionRate = totalLeads > 0 ? Math.round((leadsConvertidos / totalLeads) * 100) : 0;

  // Origin breakdown
  const originCounts: Record<string, number> = {
    whatsapp: 0,
    instagram: 0,
    llamada: 0,
    web_formulario: 0,
    otros: 0,
  };

  clients.forEach((c) => {
    const origin = c.origen_captacion || 'web_formulario';
    if (origin in originCounts) {
      originCounts[origin] += 1;
    } else {
      originCounts.otros += 1;
    }
  });

  // Funnel stages breakdown
  const stagesCount = {
    intencion: clients.filter((c) => !c.estado_embudo || c.estado_embudo === 'intencion_registrada').length,
    conversacion: clients.filter((c) => c.estado_embudo === 'en_conversacion').length,
    cotizacion: clients.filter((c) => c.estado_embudo === 'cotizacion_enviada').length,
    pago_enviado: clients.filter((c) => c.estado_embudo === 'pago_enviado').length,
    ganado: clients.filter((c) => c.estado_embudo === 'pago_completado').length,
  };

  // Upcoming tours
  const sortedReservations = [...reservations].sort(
    (a, b) => new Date(a.fecha_viaje).getTime() - new Date(b.fecha_viaje).getTime()
  );
  const upcomingTours = sortedReservations.slice(0, 5);

  const handleCopyQuickSQL = () => {
    const sqlSnippet = `-- Guna Vibes Database Setup Script
CREATE DATABASE IF NOT EXISTS gunavibes_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gunavibes_db;

-- Tabla de Usuarios Administradores
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol ENUM('superadmin', 'admin', 'operador') DEFAULT 'admin',
  activo BOOLEAN DEFAULT TRUE,
  ultimo_ingreso DATETIME,
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Clientes y Leads con ciclo de vida completo
CREATE TABLE IF NOT EXISTS registered_clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(180) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  pais_procedencia VARCHAR(100) DEFAULT 'Panamá',
  idioma_preferido ENUM('es', 'en') DEFAULT 'es',
  origen_captacion ENUM('whatsapp','llamada','instagram','facebook','web_formulario','recomendacion','correo_directo','mostrador','otro') DEFAULT 'whatsapp',
  paquete_interes VARCHAR(255),
  paquete_id INT NULL,
  tipo_servicio_interes VARCHAR(50),
  fecha_tentativa DATE NULL,
  cantidad_personas INT DEFAULT 1,
  monto_estimado DECIMAL(10,2) DEFAULT 0.00,
  estado_embudo ENUM('intencion_registrada','en_conversacion','cotizacion_enviada','pago_enviado','pago_completado','cancelado') DEFAULT 'intencion_registrada',
  tiempo_respuesta_min INT DEFAULT 5,
  notas_interaccion TEXT,
  ultimo_contacto DATETIME,
  acepta_notificaciones BOOLEAN DEFAULT TRUE,
  token_baja VARCHAR(100),
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre_completo VARCHAR(180) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  pais_procedencia VARCHAR(100),
  paquete_id INT,
  paquete_nombre VARCHAR(255),
  tipo_servicio VARCHAR(50),
  fecha_viaje DATE NOT NULL,
  cantidad_personas INT NOT NULL,
  origen VARCHAR(255),
  destino VARCHAR(255),
  comentarios TEXT,
  monto_total DECIMAL(10,2) NOT NULL,
  estado ENUM('pendiente','pago_enviado','confirmada','completada','cancelada') DEFAULT 'pendiente',
  idioma_preferido ENUM('es','en') DEFAULT 'es',
  creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;`;

    navigator.clipboard.writeText(sqlSnippet);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 1. TOP HEADER & EXECUTIVE ACTIONS */}
      <div className="bg-gradient-to-r from-[#123C4B] via-[#0E2E3A] to-[#0A222B] rounded-3xl p-6 sm:p-8 text-white shadow-lg border border-teal-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
            <Activity className="w-3.5 h-3.5 text-teal-300 animate-pulse" />
            <span>Centro de Mando Integral 360°</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight">
            Dashboard Ejecutivo de Gestión
          </h2>
          <p className="text-sm text-stone-300 max-w-2xl leading-relaxed">
            Consolidado en tiempo real de leads captados, reservas confirmadas, cupos diarios de transporte, interacciones comerciales y control de base de datos.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewLeadModal}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E8622C] to-[#F2B705] hover:brightness-110 text-white font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Lead Interno</span>
          </button>

          <button
            onClick={() => onNavigateTab('settings')}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-teal-300" />
            <span>Ajustes & Script MySQL</span>
          </button>

          <button
            onClick={loadAllBackendData}
            title="Refrescar datos"
            disabled={loading}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. 360° KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Reservas & Ingresos Confirmados */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-teal-400 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Ingresos Confirmados
            </span>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 font-heading">
              ${ingresosConfirmados.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className="font-bold text-emerald-600">{reservasConfirmadas.length} reservas</span>
              <span>• Proyectado: ${ingresosProyectados.toFixed(0)}</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('reservations')}
            className="text-xs font-bold text-[#0E9AA7] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Ver Reservas & Pagos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Leads Activos en Pipeline */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-teal-400 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Leads en Seguimiento
            </span>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 font-heading">
              {leadsEnPipeline} <span className="text-sm font-normal text-stone-400">/ {totalLeads}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className="font-bold text-amber-600">{conversionRate}% conversión</span>
              <span>• {totalLeads - leadsEnPipeline} cerrados</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('funnel')}
            className="text-xs font-bold text-[#0E9AA7] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Ver Embudo de Ventas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Cupos Diarios & Capacidad */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-teal-400 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Cupos Máximos / Día
            </span>
            <div className="p-3 rounded-2xl bg-sky-50 text-sky-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 font-heading">
              {config?.cupo_maximo_dia || 14} <span className="text-sm font-normal text-stone-400">pax/día</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className="font-bold text-sky-600">Transporte 4x4 + Lancha</span>
              <span>• Protegido</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('calendar-capacity')}
            className="text-xs font-bold text-[#0E9AA7] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Ver Calendario de Cupos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tiempo Medio de Respuesta Comercial */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 hover:border-teal-400 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Tiempo de Respuesta
            </span>
            <div className="p-3 rounded-2xl bg-purple-50 text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-stone-900 font-heading">
              8.5 <span className="text-sm font-normal text-stone-400">min</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
              <span className="font-bold text-purple-600">Alta agilidad</span>
              <span>• WhatsApp & Web</span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('leads')}
            className="text-xs font-bold text-[#0E9AA7] hover:underline flex items-center gap-1 pt-1"
          >
            <span>Directorio de Clientes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. PIPELINE DE LEADS & DISTRIBUCIÓN DE ORIGEN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Pipeline Visual Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-stone-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0E9AA7]" />
                <span>Estado del Embudo Comercial (Pipeline de Leads)</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Progresión de clientes potenciales desde el primer contacto hasta el pago completado.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
              {totalLeads} Leads Registrados
            </span>
          </div>

          {/* Pipeline Stage Bars */}
          <div className="space-y-3.5 pt-1">
            
            {/* Stage 1: Intención */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  1. Intención Registrada / Nuevos
                </span>
                <span className="text-stone-900 font-mono font-bold">
                  {stagesCount.intencion} leads ({totalLeads > 0 ? Math.round((stagesCount.intencion / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${totalLeads > 0 ? (stagesCount.intencion / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 2: En conversación */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                  2. En Conversación Activa (WhatsApp / Llamada)
                </span>
                <span className="text-stone-900 font-mono font-bold">
                  {stagesCount.conversacion} leads ({totalLeads > 0 ? Math.round((stagesCount.conversacion / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-500 rounded-full"
                  style={{ width: `${totalLeads > 0 ? (stagesCount.conversacion / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 3: Cotización Enviada */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  3. Cotización Formal Enviada
                </span>
                <span className="text-stone-900 font-mono font-bold">
                  {stagesCount.cotizacion} leads ({totalLeads > 0 ? Math.round((stagesCount.cotizacion / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${totalLeads > 0 ? (stagesCount.cotizacion / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 4: Link de Pago Enviado */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                  4. Link de Pago Generado / Pendiente Abono
                </span>
                <span className="text-stone-900 font-mono font-bold">
                  {stagesCount.pago_enviado} leads ({totalLeads > 0 ? Math.round((stagesCount.pago_enviado / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${totalLeads > 0 ? (stagesCount.pago_enviado / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Stage 5: Pago Completado / Ganado */}
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1.5">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  5. Ganado & Reserva Oficial Confirmada ✓
                </span>
                <span className="text-stone-900 font-mono font-bold">
                  {stagesCount.ganado} leads ({totalLeads > 0 ? Math.round((stagesCount.ganado / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
                  style={{ width: `${totalLeads > 0 ? (stagesCount.ganado / totalLeads) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
            <span>Control total de cada etapa desde el backend</span>
            <button
              onClick={() => onNavigateTab('funnel')}
              className="text-[#0E9AA7] font-bold hover:underline"
            >
              Abrir Tablero Kanban & Gestor →
            </button>
          </div>
        </div>

        {/* Origin Breakdown & Quick Stats */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 space-y-5 flex flex-col justify-between">
          <div>
            <div className="border-b border-stone-100 pb-4">
              <h3 className="text-base font-bold font-heading text-stone-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#E8622C]" />
                <span>Canales de Captación de Leads</span>
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Origen de los contactos registrados en el sistema.
              </p>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="flex items-center gap-2 font-medium text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> WhatsApp Directo
                </span>
                <span className="font-mono font-bold text-stone-900">{originCounts.whatsapp} leads</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="flex items-center gap-2 font-medium text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> Instagram DM / Ads
                </span>
                <span className="font-mono font-bold text-stone-900">{originCounts.instagram} leads</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="flex items-center gap-2 font-medium text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Formulario Web Público
                </span>
                <span className="font-mono font-bold text-stone-900">{originCounts.web_formulario} leads</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                <span className="flex items-center gap-2 font-medium text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Llamadas Telefónicas
                </span>
                <span className="font-mono font-bold text-stone-900">{originCounts.llamada} leads</span>
              </div>
            </div>
          </div>

          {/* Quick SQL Card */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-amber-700" />
                Script MySQL para Creación de BD
              </span>
              <button
                onClick={handleCopyQuickSQL}
                className="px-2.5 py-1 rounded-lg bg-amber-200/70 hover:bg-amber-300 text-amber-900 text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer"
              >
                {sqlCopied ? <CheckCircle2 className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                <span>{sqlCopied ? '¡Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Genera la estructura DDL para importar en phpMyAdmin, MySQL Workbench o tu servidor en 1 clic.
            </p>
          </div>
        </div>
      </div>

      {/* 4. PRÓXIMOS VIAJES & ACTIVIDAD RECIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Próximas Salidas & Reservas */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold font-heading text-stone-900 flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-[#0E9AA7]" />
              <span>Próximas Salidas Agendadas ({upcomingTours.length})</span>
            </h3>
            <button
              onClick={() => onNavigateTab('reservations')}
              className="text-xs font-bold text-[#0E9AA7] hover:underline"
            >
              Ver todas →
            </button>
          </div>

          <div className="space-y-2.5">
            {upcomingTours.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">
                No hay viajes programados próximamente.
              </p>
            ) : (
              upcomingTours.map((res) => (
                <div
                  key={res.id}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900">{res.nombre_completo}</div>
                    <div className="text-stone-500 font-medium">
                      {res.paquete_nombre} • {res.cantidad_personas} pax
                    </div>
                    <div className="text-[11px] text-stone-400">
                      Fecha: {res.fecha_viaje} • {res.pais_procedencia || 'Panamá'}
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="font-mono font-bold text-stone-900">${res.monto_total}</div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold block ${
                        res.estado === 'confirmada'
                          ? 'bg-emerald-100 text-emerald-800'
                          : res.estado === 'pago_enviado'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {res.estado === 'confirmada'
                        ? 'Confirmada'
                        : res.estado === 'pago_enviado'
                        ? 'Link Enviado'
                        : 'Pendiente'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bitácora de Auditoría y Acciones del Backend */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-stone-200 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-base font-bold font-heading text-stone-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#0E9AA7]" />
              <span>Bitácora de Auditoría en Tiempo Real</span>
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">Últimas acciones</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto divide-y divide-stone-100 text-xs">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-stone-400 italic py-4 text-center">
                No hay registros de auditoría aún.
              </p>
            ) : (
              auditLogs.slice(0, 6).map((log) => (
                <div key={log.id} className="pt-2.5 pb-1 flex items-start justify-between gap-3 text-stone-600">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] font-bold bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded">
                        {log.accion}
                      </span>
                    </div>
                    <p className="text-stone-700 leading-snug">{log.detalles}</p>
                  </div>
                  <div className="text-[10px] text-stone-400 font-mono whitespace-nowrap text-right">
                    {new Date(log.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
