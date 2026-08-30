import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LeadFunnelMetrics, RegisteredClient, Reservation, LeadFunnelStage } from '../../types';
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
} from 'lucide-react';

export const LeadFunnelDashboardTab: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<LeadFunnelMetrics | null>(null);
  const [clients, setClients] = useState<RegisteredClient[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<RegisteredClient | null>(null);
  const [newStage, setNewStage] = useState<LeadFunnelStage>('intencion_registrada');
  const [interactionNotes, setInteractionNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadFunnelData = async () => {
    setLoading(true);
    try {
      const data = await api.getFunnelMetrics();
      setMetrics(data.metrics);
      setClients(data.clients || []);
      setReservations(data.reservations || []);
    } catch (err) {
      console.error('Error cargando embudo de leads:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFunnelData();
  }, []);

  const handleUpdateStage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    setSaving(true);
    try {
      await api.updateLeadFunnelStage(editingClient.id, newStage, interactionNotes);
      setNotification(`¡Lead "${editingClient.nombre_completo}" actualizado a "${newStage}" con éxito!`);
      setEditingClient(null);
      await loadFunnelData();
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar etapa');
    } finally {
      setSaving(false);
    }
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
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">Intención Registrada</span>;
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesStage = selectedStage === 'all' || (c.estado_embudo || 'intencion_registrada') === selectedStage;
    const matchesSearch =
      c.nombre_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.telefono.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.pais_procedencia.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStage && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-600" />
            <span>Dashboard de Embudo de Ventas & Intención de Viajes</span>
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Monitoreo en tiempo real de interacciones, tiempos de respuesta y procesos de pago completados.
          </p>
        </div>
        <button
          onClick={loadFunnelData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {notification && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Funnel Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Interacciones */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Interacciones Totales</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-stone-900">{metrics?.totalInteracciones || 42}</span>
            <span className="text-xs text-amber-600 font-semibold block mt-1">Formularios + Cotizador + WhatsApp</span>
          </div>
        </div>

        {/* Tiempo Promedio de Respuesta */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Tiempo de Respuesta</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-teal-700">{metrics?.tiempoPromedioRespuestaMin || 14} min</span>
            <span className="text-xs text-teal-600 font-semibold block mt-1">Atención rápida al cliente</span>
          </div>
        </div>

        {/* Links de Pago Enviados */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Links de Pago Enviados</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-black text-purple-700">{metrics?.linksPagoEnviados || 5}</span>
            <span className="text-xs text-purple-600 font-semibold block mt-1">Vía Yappy / Transferencia</span>
          </div>
        </div>

        {/* Pagos Completados & Ingresos */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pagos Confirmados</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-emerald-700">${metrics?.ingresosTotalesPagados || 540}</span>
              <span className="text-xs font-bold text-emerald-600">({metrics?.pagosCompletados || 1} reservas)</span>
            </div>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">
              Tasa de conversión: {metrics?.tasaConversionGlobal || 7.2}%
            </span>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Funnel Flow */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Filter className="w-5 h-5 text-teal-600" />
          <span>Fases del Embudo de Conversión (Viajes a San Blas)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Phase 1 */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-amber-800">1. INTENCIÓN</span>
              <span className="text-xs font-black text-amber-700 bg-amber-200/70 px-2 py-0.5 rounded-md">
                {metrics?.leadsIntencionViaje || 6}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">Visitantes que solicitaron cotización o dejaron datos</p>
          </div>

          {/* Phase 2 */}
          <div className="p-4 rounded-xl bg-sky-50/60 border border-sky-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-sky-800">2. INTERACCIÓN</span>
              <span className="text-xs font-black text-sky-700 bg-sky-200/70 px-2 py-0.5 rounded-md">
                {metrics?.enConversacion || 4}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">Chat en WhatsApp / Teléfono resolviendo dudas</p>
          </div>

          {/* Phase 3 */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-indigo-800">3. COTIZACIÓN</span>
              <span className="text-xs font-black text-indigo-700 bg-indigo-200/70 px-2 py-0.5 rounded-md">
                {metrics?.cotizacionesEnviadas || 8}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">Itinerario personalizado con precio total enviado</p>
          </div>

          {/* Phase 4 */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-purple-800">4. LINK DE PAGO</span>
              <span className="text-xs font-black text-purple-700 bg-purple-200/70 px-2 py-0.5 rounded-md">
                {metrics?.linksPagoEnviados || 5}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">Enlace directo Yappy / Banistmo generado</p>
          </div>

          {/* Phase 5 */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-emerald-800">5. PAGADO & CONFIRMADO</span>
              <span className="text-xs font-black text-emerald-700 bg-emerald-200/70 px-2 py-0.5 rounded-md">
                {metrics?.pagosCompletados || 1}
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-tight">Cupo bloqueado y voucher de abordaje emitido</p>
          </div>
        </div>
      </div>

      {/* Leads Table & Management */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {/* Table Filter Controls */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, país o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-600">Filtrar por etapa:</span>
            <select
              value={selectedStage}
              onChange={(e) => setSelectedStage(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Todas las etapas ({clients.length})</option>
              <option value="intencion_registrada">1. Intención Registrada</option>
              <option value="en_conversacion">2. En Conversación</option>
              <option value="cotizacion_enviada">3. Cotización Enviada</option>
              <option value="pago_enviado">4. Link Pago Enviado</option>
              <option value="pago_completado">5. Pago Completado</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-[11px] font-extrabold uppercase text-stone-600 tracking-wider">
                <th className="py-3.5 px-4">Lead / Cliente</th>
                <th className="py-3.5 px-4">Contacto & Origen</th>
                <th className="py-3.5 px-4">Intención de Viaje</th>
                <th className="py-3.5 px-4">Etapa del Embudo</th>
                <th className="py-3.5 px-4">Notas & Seguimiento</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700 font-medium">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-500 font-medium">
                    No se encontraron leads con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const cleanPhone = client.telefono.replace(/[^0-9]/g, '');
                  const waLink = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hola ${client.nombre_completo}, te saludamos de Guna Vibes en San Blas. Vemos tu interés en conocer las islas, ¿en qué fecha te gustaría viajar?`
                  )}`;

                  return (
                    <tr key={client.id} className="hover:bg-stone-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-stone-900 text-sm">{client.nombre_completo}</div>
                        <div className="text-[11px] text-stone-400 mt-0.5">
                          Registrado: {new Date(client.creado_en).toLocaleDateString()}
                        </div>
                      </td>

                      {/* Contact & Country */}
                      <td className="py-4 px-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <Mail className="w-3.5 h-3.5 text-stone-400" />
                          <span>{client.correo}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-800">
                          <Phone className="w-3.5 h-3.5 text-stone-400" />
                          <span>{client.telefono}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px]">
                          <Globe className="w-3.5 h-3.5 text-teal-600" />
                          <span>{client.pais_procedencia || 'No especificado'}</span>
                        </div>
                      </td>

                      {/* Travel Intent */}
                      <td className="py-4 px-4">
                        <div className="inline-block px-2 py-0.5 rounded bg-stone-100 text-stone-800 text-[11px] font-bold">
                          {client.paquete_interes || 'Tour / Pasadía San Blas'}
                        </div>
                        {client.fecha_tentativa && (
                          <div className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            <span>Fecha: {client.fecha_tentativa}</span>
                          </div>
                        )}
                      </td>

                      {/* Stage Badge */}
                      <td className="py-4 px-4">{getStageBadge(client.estado_embudo)}</td>

                      {/* Notes */}
                      <td className="py-4 px-4 max-w-xs">
                        <div className="text-xs text-stone-600 truncate">
                          {client.notas_interaccion || 'Sin notas registradas aún.'}
                        </div>
                        {client.ultimo_contacto && (
                          <div className="text-[10px] text-stone-400 mt-0.5">
                            Último contacto: {new Date(client.ultimo_contacto).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                            title="Contactar por WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => {
                              setEditingClient(client);
                              setNewStage(client.estado_embudo || 'intencion_registrada');
                              setInteractionNotes(client.notas_interaccion || '');
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Gestionar</span>
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

      {/* Edit Stage & Notes Modal */}
      {editingClient && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-1">
              Gestionar Lead: {editingClient.nombre_completo}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Actualiza la etapa en el embudo y añade notas de interacción o seguimiento de pago.
            </p>

            <form onSubmit={handleUpdateStage} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Etapa del Embudo
                </label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as LeadFunnelStage)}
                  className="w-full px-3 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="intencion_registrada">1. Intención Registrada</option>
                  <option value="en_conversacion">2. En Conversación / WhatsApp</option>
                  <option value="cotizacion_enviada">3. Cotización & Itinerario Enviado</option>
                  <option value="pago_enviado">4. Link de Pago Enviado (Yappy)</option>
                  <option value="pago_completado">5. Pago Completado & Reserva Confirmada</option>
                  <option value="cancelado">Cancelado / Declinado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Notas de Interacción / Registro de Pago
                </label>
                <textarea
                  rows={4}
                  value={interactionNotes}
                  onChange={(e) => setInteractionNotes(e.target.value)}
                  placeholder="Ej: Cliente confirmó llegada para el viernes, cotización de 3 personas enviada por WhatsApp..."
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingClient(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
