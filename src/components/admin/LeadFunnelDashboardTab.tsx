import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeadFunnelMetrics, RegisteredClient, Reservation, LeadFunnelStage, PackageSanBlas } from '../../types';
import { NewLeadModal } from './NewLeadModal';
import { LeadDetailModal } from './LeadDetailModal';
import {
  TrendingUp,
  Users,
  MessageCircle,
  FileCheck,
  Send,
  CheckCircle2,
  Clock,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  Phone,
  Mail,
  Calendar,
  Globe,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Edit3,
  Plus,
  Zap,
} from 'lucide-react';

export const LeadFunnelDashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<LeadFunnelMetrics | null>(null);
  const [clients, setClients] = useState<RegisteredClient[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [packages, setPackages] = useState<PackageSanBlas[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<RegisteredClient | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const loadFunnelData = async () => {
    setLoading(true);
    try {
      const [data, pkgList] = await Promise.all([
        api.getFunnelMetrics(),
        api.getPackages(),
      ]);
      setMetrics(data.metrics);
      setClients(data.clients || []);
      setReservations(data.reservations || []);
      setPackages(pkgList || []);
    } catch (err) {
      console.error('Error cargando embudo de leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunnelData();
  }, []);

  const handleLeadCreated = (newLead: RegisteredClient) => {
    setClients((prev) => [newLead, ...prev]);
    setNotification(`¡Lead "${newLead.nombre_completo}" registrado internamente con éxito!`);
    loadFunnelData();
    setTimeout(() => setNotification(null), 4000);
  };

  const handleLeadUpdated = (updatedLead: RegisteredClient) => {
    setClients((prev) => prev.map((c) => (c.id === updatedLead.id ? updatedLead : c)));
    if (selectedLeadForDetail?.id === updatedLead.id) {
      setSelectedLeadForDetail(updatedLead);
    }
    loadFunnelData();
  };

  const handleLeadDeleted = (leadId: number) => {
    setClients((prev) => prev.filter((c) => c.id !== leadId));
    setSelectedLeadForDetail(null);
    setNotification('Lead eliminado del registro.');
    loadFunnelData();
    setTimeout(() => setNotification(null), 3000);
  };

  const getStageBadge = (stage?: LeadFunnelStage) => {
    switch (stage) {
      case 'intencion_registrada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">1. Intención Registrada</span>;
      case 'en_conversacion':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">2. En Conversación</span>;
      case 'cotizacion_enviada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">3. Cotización Enviada</span>;
      case 'pago_enviado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">4. Link Pago Enviado</span>;
      case 'pago_completado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">5. Pago Completado ✓</span>;
      case 'cancelado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">Cancelado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">1. Intención Registrada</span>;
    }
  };

  const getOriginBadge = (origin?: string) => {
    switch (origin) {
      case 'whatsapp':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">WhatsApp</span>;
      case 'instagram':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200">Instagram</span>;
      case 'llamada':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Llamada</span>;
      case 'facebook':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Facebook</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700">Web / Form</span>;
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesStage = selectedStage === 'all' || (c.estado_embudo || 'intencion_registrada') === selectedStage;
    const matchesOrigin = selectedOrigin === 'all' || (c.origen_captacion || 'web_formulario') === selectedOrigin;
    const matchesSearch =
      c.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.telefono.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.pais_procedencia || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.paquete_interes || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesOrigin && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Header & New Lead Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100 mb-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
            <span>Gestor de Prospectos & Ciclo de Conversión</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-stone-900">
            Embudo de Ventas & Control Total de Leads
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Registra prospectos internos, monitorea tiempos de respuesta, registra llamadas o WhatsApps y conviértelos a reservas oficiales con un solo clic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewLeadOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#E8622C] to-[#F2B705] hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Nuevo Lead Interno</span>
          </button>

          <button
            onClick={loadFunnelData}
            disabled={loading}
            title="Recargar datos"
            className="p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Funnel Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interacciones */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Total Leads Registrados</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold font-heading text-stone-900">{clients.length}</span>
            <span className="text-xs text-amber-600 font-semibold block mt-1">
              {clients.filter(c => c.origen_captacion === 'whatsapp').length} por WhatsApp • {clients.filter(c => c.origen_captacion === 'instagram').length} Instagram
            </span>
          </div>
        </div>

        {/* Tiempo Promedio de Respuesta */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Tiempo de Respuesta</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold font-heading text-teal-700">8.5 min</span>
            <span className="text-xs text-teal-600 font-semibold block mt-1">Velocidad alta en cotizaciones</span>
          </div>
        </div>

        {/* Links de Pago Enviados */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Links de Pago Enviados</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-extrabold font-heading text-purple-700">
              {clients.filter(c => c.estado_embudo === 'pago_enviado').length}
            </span>
            <span className="text-xs text-purple-600 font-semibold block mt-1">Yappy / Transferencia Banistmo</span>
          </div>
        </div>

        {/* Pagos Completados & Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Leads Convertidos ✓</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-heading text-emerald-700">
                {clients.filter(c => c.estado_embudo === 'pago_completado' || c.estado_embudo === 'pago_enviado').length}
              </span>
              <span className="text-xs font-bold text-emerald-600">
                ({clients.length > 0 ? Math.round((clients.filter(c => c.estado_embudo === 'pago_completado' || c.estado_embudo === 'pago_enviado').length / clients.length) * 100) : 0}%)
              </span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">
              Listos para abordaje a San Blas
            </span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Funnel Flow */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold font-heading text-stone-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600" />
          <span>Fases del Embudo de Conversión Comercial</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Phase 1 */}
          <button
            onClick={() => setSelectedStage('intencion_registrada')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStage === 'intencion_registrada'
                ? 'bg-amber-100/70 border-amber-400 shadow-sm ring-2 ring-amber-400/50'
                : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-amber-800">1. INTENCIÓN</span>
              <span className="text-xs font-black text-amber-700 bg-amber-200 px-2 py-0.5 rounded-md font-mono">
                {clients.filter(c => !c.estado_embudo || c.estado_embudo === 'intencion_registrada').length}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">Prospectos recién recibidos</p>
          </button>

          {/* Phase 2 */}
          <button
            onClick={() => setSelectedStage('en_conversacion')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStage === 'en_conversacion'
                ? 'bg-sky-100/70 border-sky-400 shadow-sm ring-2 ring-sky-400/50'
                : 'bg-sky-50/50 border-sky-200 hover:bg-sky-100/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-sky-800">2. CONVERSACIÓN</span>
              <span className="text-xs font-black text-sky-700 bg-sky-200 px-2 py-0.5 rounded-md font-mono">
                {clients.filter(c => c.estado_embudo === 'en_conversacion').length}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">Atención activa WhatsApp / Tel</p>
          </button>

          {/* Phase 3 */}
          <button
            onClick={() => setSelectedStage('cotizacion_enviada')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStage === 'cotizacion_enviada'
                ? 'bg-indigo-100/70 border-indigo-400 shadow-sm ring-2 ring-indigo-400/50'
                : 'bg-indigo-50/50 border-indigo-200 hover:bg-indigo-100/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-indigo-800">3. COTIZACIÓN</span>
              <span className="text-xs font-black text-indigo-700 bg-indigo-200 px-2 py-0.5 rounded-md font-mono">
                {clients.filter(c => c.estado_embudo === 'cotizacion_enviada').length}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">Itinerario y precio formal</p>
          </button>

          {/* Phase 4 */}
          <button
            onClick={() => setSelectedStage('pago_enviado')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStage === 'pago_enviado'
                ? 'bg-purple-100/70 border-purple-400 shadow-sm ring-2 ring-purple-400/50'
                : 'bg-purple-50/50 border-purple-200 hover:bg-purple-100/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-purple-800">4. LINK PAGO</span>
              <span className="text-xs font-black text-purple-700 bg-purple-200 px-2 py-0.5 rounded-md font-mono">
                {clients.filter(c => c.estado_embudo === 'pago_enviado').length}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">Enlace Yappy / Cuenta enviado</p>
          </button>

          {/* Phase 5 */}
          <button
            onClick={() => setSelectedStage('pago_completado')}
            className={`p-4 rounded-2xl text-left border transition-all cursor-pointer ${
              selectedStage === 'pago_completado'
                ? 'bg-emerald-100/70 border-emerald-400 shadow-sm ring-2 ring-emerald-400/50'
                : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-800">5. GANADO ✓</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded-md font-mono">
                {clients.filter(c => c.estado_embudo === 'pago_completado').length}
              </span>
            </div>
            <p className="text-[11px] text-stone-600 leading-tight">Reserva oficial confirmada</p>
          </button>
        </div>
      </div>

      {/* Leads Table & Direct Management */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden space-y-0">
        
        {/* Table Filter Controls */}
        <div className="p-5 border-b border-stone-200 bg-stone-50/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, país o tour..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Origin filter */}
            <select
              value={selectedOrigin}
              onChange={(e) => setSelectedOrigin(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Todos los Orígenes</option>
              <option value="whatsapp">📱 WhatsApp</option>
              <option value="llamada">📞 Llamada</option>
              <option value="instagram">📸 Instagram</option>
              <option value="facebook">📘 Facebook</option>
              <option value="web_formulario">🌐 Web</option>
            </select>

            {/* Stage filter */}
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Todas las Etapas ({clients.length})</option>
              <option value="intencion_registrada">1. Intención Registrada</option>
              <option value="en_conversacion">2. En Conversación</option>
              <option value="cotizacion_enviada">3. Cotización Enviada</option>
              <option value="pago_enviado">4. Link Pago Enviado</option>
              <option value="pago_completado">5. Ganado / Completado</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-[11px] font-extrabold uppercase text-stone-600 tracking-wider">
                <th className="py-3.5 px-4">Lead / Contacto</th>
                <th className="py-3.5 px-4">Canal Origen</th>
                <th className="py-3.5 px-4">Interés & Cotización</th>
                <th className="py-3.5 px-4">Etapa del Embudo</th>
                <th className="py-3.5 px-4">Última Interacción</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 italic">
                    No se encontraron leads registrados con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const cleanPhone = client.telefono.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hola ${client.nombre_completo}, te saludamos de Guna Vibes San Blas. Seguimos atentos para coordinar tu viaje a las islas.`
                  )}`;

                  return (
                    <tr
                      key={client.id}
                      onClick={() => setSelectedLeadForDetail(client)}
                      className="hover:bg-stone-50 transition-colors cursor-pointer group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-900 text-sm group-hover:text-teal-700 transition-colors">
                          {client.nombre_completo}
                        </div>
                        <div className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
                          <span>{client.correo}</span>
                          <span>•</span>
                          <span>{client.telefono}</span>
                          <span>•</span>
                          <span className="font-semibold text-stone-600">{client.pais_procedencia || 'Panamá'}</span>
                        </div>
                      </td>

                      {/* Origin */}
                      <td className="py-3.5 px-4">
                        {getOriginBadge(client.origen_captacion)}
                      </td>

                      {/* Travel Intent */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-stone-800 truncate max-w-xs" title={client.paquete_interes}>
                          {client.paquete_interes || 'Tour / Pasadía San Blas'}
                        </div>
                        <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                          <span>Pax: {client.cantidad_personas || 1}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-emerald-700">${client.monto_estimado || 0} USD</span>
                        </div>
                      </td>

                      {/* Stage Badge */}
                      <td className="py-3.5 px-4">
                        {getStageBadge(client.estado_embudo)}
                      </td>

                      {/* Notes / Last contact */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="truncate text-stone-600" title={client.notas_interaccion}>
                          {client.notas_interaccion || 'Lead registrado sin observaciones.'}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-0.5 font-mono">
                          {client.ultimo_contacto ? new Date(client.ultimo_contacto).toLocaleDateString() : 'Hoy'}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Abrir WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => setSelectedLeadForDetail(client)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Control & Bitácora</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Lead Modal */}
      <NewLeadModal
        isOpen={isNewLeadOpen}
        onClose={() => setIsNewLeadOpen(false)}
        onLeadCreated={handleLeadCreated}
        packages={packages}
      />

      {/* Lead Detail & Lifecycle Drawer Modal */}
      <LeadDetailModal
        lead={selectedLeadForDetail}
        isOpen={!!selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
        onLeadUpdated={handleLeadUpdated}
        onLeadDeleted={handleLeadDeleted}
      />

    </div>
  );
};
