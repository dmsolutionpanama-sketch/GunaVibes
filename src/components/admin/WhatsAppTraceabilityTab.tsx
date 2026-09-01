import React, { useState, useEffect } from 'react';
import { WhatsAppLog, WhatsAppTemplate, Reservation } from '../../types';
import { api } from '../../services/api';
import { COUNTRIES_DATA, findCountryByNameOrCode, CountryInfo } from '../../data/countries';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Plus,
  Edit3,
  Search,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Phone,
  User,
  Calendar,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
} from 'lucide-react';

export const WhatsAppTraceabilityTab: React.FC = () => {
  const [logs, setLogs] = useState<WhatsAppLog[]>([]);
  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'logs' | 'templates' | 'composer'>('logs');

  // Search & Filter in Logs
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Template Editing State
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [savingTemplate, setSavingTemplate] = useState(false);
  const [templateSuccess, setTemplateSuccess] = useState(false);

  // Quick Composer State
  const [composerCountry, setComposerCountry] = useState<CountryInfo>(COUNTRIES_DATA[0]);
  const [composerPhone, setComposerPhone] = useState('');
  const [composerName, setComposerName] = useState('');
  const [composerSelectedTpl, setComposerSelectedTpl] = useState<string>('reserva_recibida');
  const [composerBody, setComposerBody] = useState('');
  const [composerReservaId, setComposerReservaId] = useState<number | ''>('');
  const [copySuccess, setCopySuccess] = useState<number | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, tplsData, resData] = await Promise.all([
        api.getWhatsAppLogs(),
        api.getWhatsAppTemplates(),
        api.getAdminReservations(),
      ]);
      setLogs(logsData || []);
      setTemplates(tplsData || []);
      setReservations(resData || []);

      if (tplsData && tplsData.length > 0 && !selectedTemplate) {
        setSelectedTemplate(tplsData[0]);
        setEditingTemplate(tplsData[0]);
        setComposerBody(tplsData[0].cuerpo);
      }
    } catch (err) {
      console.error('Error loading WhatsApp traceability data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update composer text when template selection changes
  const handleComposerTemplateChange = (tplId: string) => {
    setComposerSelectedTpl(tplId);
    const found = templates.find((t) => t.id === tplId);
    if (!found) return;

    let body = found.cuerpo;
    // Replace if reservation selected
    if (composerReservaId) {
      const res = reservations.find((r) => r.id === Number(composerReservaId));
      if (res) {
        body = body
          .replace(/{cliente_nombre}/g, res.nombre_completo)
          .replace(/{fecha_viaje}/g, res.fecha_viaje)
          .replace(/{pax}/g, String(res.cantidad_personas))
          .replace(/{monto}/g, res.monto_total ? `$${res.monto_total} USD` : '$280 USD')
          .replace(/{link_pago}/g, 'https://yappy.banistmo.com/pay/gunavibes-sanblas')
          .replace(/{destino}/g, res.destino || 'San Blas, Gunayala');
      }
    } else {
      body = body
        .replace(/{cliente_nombre}/g, composerName || '[Nombre del Cliente]')
        .replace(/{fecha_viaje}/g, 'próximamente')
        .replace(/{pax}/g, '2')
        .replace(/{monto}/g, '$280 USD')
        .replace(/{link_pago}/g, 'https://yappy.banistmo.com/pay/gunavibes-sanblas')
        .replace(/{destino}/g, 'San Blas');
    }
    setComposerBody(body);
  };

  const handleSelectReservationForComposer = (resIdStr: string) => {
    if (!resIdStr) {
      setComposerReservaId('');
      return;
    }
    const id = parseInt(resIdStr, 10);
    setComposerReservaId(id);
    const res = reservations.find((r) => r.id === id);
    if (res) {
      setComposerName(res.nombre_completo);
      // Try finding country
      const c = findCountryByNameOrCode(res.pais_procedencia || 'PA');
      setComposerCountry(c);
      // Clean phone
      const raw = res.telefono.replace(c.dialCode, '').trim();
      setComposerPhone(raw || res.telefono);
      // Re-trigger template variables
      handleComposerTemplateChange(composerSelectedTpl);
    }
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    setSavingTemplate(true);
    try {
      const saved = await api.saveWhatsAppTemplate(editingTemplate);
      setTemplateSuccess(true);
      setTimeout(() => setTemplateSuccess(false), 2000);
      await loadData();
      setSelectedTemplate(saved);
    } catch (err: any) {
      alert(err.message || 'Error guardando plantilla');
    } finally {
      setSavingTemplate(false);
    }
  };

  const handleDispatchQuickMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullPhone = `${composerCountry.dialCode} ${composerPhone.trim()}`.trim();
    if (!composerName || !composerPhone || !composerBody) {
      alert('Por favor completa el nombre, teléfono y cuerpo del mensaje.');
      return;
    }

    const cleanDigits = fullPhone.replace(/[^\d]/g, '');
    const directLink = `https://api.whatsapp.com/send?phone=${cleanDigits}&text=${encodeURIComponent(composerBody)}`;

    try {
      const log = await api.createWhatsAppLog({
        reserva_id: composerReservaId ? Number(composerReservaId) : null,
        destinatario_nombre: composerName,
        destinatario_telefono: fullPhone,
        pais_codigo: composerCountry.code,
        tipo_evento: composerSelectedTpl as any,
        plantilla_id: composerSelectedTpl,
        mensaje_cuerpo: composerBody,
        estado_envio: 'enviado',
        enlace_directo_wa: directLink,
      });

      // Open WhatsApp Web or App
      window.open(directLink, '_blank');

      // Refresh logs
      await loadData();
      setActiveView('logs');
    } catch (err: any) {
      alert(err.message || 'Error al registrar y despachar WhatsApp');
    }
  };

  const handleMarkLogSent = async (log: WhatsAppLog) => {
    try {
      await api.updateWhatsAppLogStatus(log.id, 'enviado');
      window.open(log.enlace_directo_wa, '_blank');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Error actualizando estado');
    }
  };

  const copyToClipboard = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Filter logs
  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.destinatario_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.destinatario_telefono.includes(searchTerm) ||
      (l.mensaje_cuerpo && l.mensaje_cuerpo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || l.estado_envio === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-stone-900">
                Trazabilidad & Notificaciones WhatsApp
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                Direct Gateway Activo
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Trazabilidad en tiempo real, plantillas dinámicas y conexión con llamadas y WhatsApp por código de país.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
          <button
            onClick={() => setActiveView('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'logs'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Trazabilidad ({logs.length})</span>
          </button>

          <button
            onClick={() => setActiveView('templates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'templates'
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Plantillas ({templates.length})</span>
          </button>

          <button
            onClick={() => setActiveView('composer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeView === 'composer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Despachador Rápido</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: TRACEABILITY LOGS */}
      {activeView === 'logs' && (
        <div className="space-y-4">
          {/* Filters and Search */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, teléfono o mensaje..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
              >
                <option value="all">Todos los estados</option>
                <option value="preparado">Preparados / Pendientes</option>
                <option value="enviado">Enviados</option>
                <option value="entregado">Entregados</option>
              </select>

              <button
                onClick={loadData}
                className="p-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-600 cursor-pointer"
                title="Refrescar trazabilidad"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4"># Log</th>
                    <th className="py-3.5 px-4">Fecha & Hora</th>
                    <th className="py-3.5 px-4">Destinatario</th>
                    <th className="py-3.5 px-4">Tipo de Evento</th>
                    <th className="py-3.5 px-4">Cuerpo del Mensaje</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        Cargando trazabilidad de WhatsApp...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-stone-400">
                        No hay registros de WhatsApp que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const country = findCountryByNameOrCode(log.pais_codigo || 'PA');
                      return (
                        <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                            #{log.id}
                            {log.reserva_id && (
                              <span className="block text-[10px] text-teal-700 font-sans">
                                Res #{log.reserva_id}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-stone-600">
                            <div>{new Date(log.creado_en).toLocaleDateString()}</div>
                            <div className="text-[10px] text-stone-400">
                              {new Date(log.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-stone-900">
                            <div className="flex items-center gap-1.5">
                              <span>{country.flag}</span>
                              <span>{log.destinatario_nombre}</span>
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono font-normal flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{log.destinatario_telefono}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 border border-stone-200 inline-block">
                              {log.tipo_evento.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-stone-700 line-clamp-2 text-[11px] leading-relaxed">
                              {log.mensaje_cuerpo}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            {log.estado_envio === 'enviado' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Enviado
                              </span>
                            ) : log.estado_envio === 'preparado' ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 w-fit">
                                <Clock className="w-3 h-3" /> Preparado
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> Entregado
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-2">
                            <button
                              onClick={() => copyToClipboard(log.mensaje_cuerpo, log.id)}
                              className="p-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 cursor-pointer"
                              title="Copiar texto"
                            >
                              {copySuccess === log.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => handleMarkLogSent(log)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Abrir en WhatsApp"
                            >
                              <Send className="w-3 h-3" />
                              <span>{log.estado_envio === 'enviado' ? 'Reenviar' : 'Despachar'}</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TEMPLATE MANAGER */}
      {activeView === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Templates list */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-600 mb-2">
              Plantillas Configuradas ({templates.length})
            </h3>
            <div className="space-y-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplate(tpl);
                    setEditingTemplate({ ...tpl });
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedTemplate?.id === tpl.id
                      ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400'
                      : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-xs">{tpl.nombre}</h4>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {tpl.categoria}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1 line-clamp-2">{tpl.cuerpo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Template Editor */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
            {editingTemplate ? (
              <form onSubmit={handleSaveTemplate} className="space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-stone-900">
                      Editar Plantilla: {editingTemplate.nombre}
                    </h3>
                    <p className="text-xs text-stone-500">ID del Sistema: {editingTemplate.id}</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Auto-reemplazo activo
                  </span>
                </div>

                {templateSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>¡Plantilla guardada y actualizada con éxito en el servidor!</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                      Nombre de la Plantilla
                    </label>
                    <input
                      type="text"
                      value={editingTemplate.nombre}
                      onChange={(e) =>
                        setEditingTemplate({ ...editingTemplate, nombre: e.target.value })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                      Categoría Operativa
                    </label>
                    <select
                      value={editingTemplate.categoria}
                      onChange={(e) =>
                        setEditingTemplate({
                          ...editingTemplate,
                          categoria: e.target.value as any,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-semibold"
                    >
                      <option value="reserva">Reserva & Confirmación</option>
                      <option value="pago">Pasarela & Link de Pago</option>
                      <option value="recordatorio">Recordatorio & Logística</option>
                      <option value="clima">Condiciones de Clima</option>
                      <option value="bienvenida">Bienvenida</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                </div>

                {/* Available dynamic variables */}
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Variables Dinámicas Disponibles (Haz clic para insertar)</span>
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {editingTemplate.variables_disponibles.map((v) => (
                      <button
                        type="button"
                        key={v}
                        onClick={() => {
                          setEditingTemplate({
                            ...editingTemplate,
                            cuerpo: editingTemplate.cuerpo + ' ' + v,
                          });
                        }}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-mono font-bold text-stone-700 border border-stone-200 transition-colors cursor-pointer"
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text Body */}
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                    Cuerpo del Mensaje WhatsApp
                  </label>
                  <textarea
                    rows={8}
                    value={editingTemplate.cuerpo}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, cuerpo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs font-sans leading-relaxed bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    Consejo: Puedes usar formato de WhatsApp como *negrita*, _cursiva_ o emojis 🌴⛵.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingTemplate}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{savingTemplate ? 'Guardando...' : 'Guardar Cambios de Plantilla'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-20 text-center text-stone-400">
                Selecciona una plantilla de la izquierda para editarla.
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 3: QUICK COMPOSER */}
      {activeView === 'composer' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-600" />
              <span>Despachador Rápido de WhatsApp con Trazabilidad</span>
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              Envía un mensaje personalizado a cualquier cliente o vincula automáticamente los datos de una reserva existente.
            </p>
          </div>

          <form onSubmit={handleDispatchQuickMessage} className="space-y-5">
            {/* Link to existing reservation */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Vincular a Reserva Existente (Opcional - Rellena datos automáticamente)
              </label>
              <select
                value={composerReservaId}
                onChange={(e) => handleSelectReservationForComposer(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
              >
                <option value="">-- Sin vincular / Cliente directo --</option>
                {reservations.map((r) => (
                  <option key={r.id} value={r.id}>
                    Reserva #{r.id} • {r.nombre_completo} ({r.fecha_viaje}) - {r.telefono}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Recipient Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Nombre del Destinatario *
                </label>
                <input
                  type="text"
                  required
                  value={composerName}
                  onChange={(e) => setComposerName(e.target.value)}
                  placeholder="Ej. Carlos Mendoza"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50"
                />
              </div>

              {/* Template selector */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Plantilla Base
                </label>
                <select
                  value={composerSelectedTpl}
                  onChange={(e) => handleComposerTemplateChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                  <option value="mensaje_personalizado">Mensaje Personalizado Libre</option>
                </select>
              </div>
            </div>

            {/* Country & Phone input with Country Dial code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  País de Destino
                </label>
                <select
                  value={composerCountry.name}
                  onChange={(e) => setComposerCountry(findCountryByNameOrCode(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-stone-50 font-medium"
                >
                  {COUNTRIES_DATA.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1 flex items-center justify-between">
                  <span>Teléfono / WhatsApp *</span>
                  <span className="text-emerald-700 font-mono text-[11px]">
                    {composerCountry.flag} {composerCountry.dialCode}
                  </span>
                </label>
                <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50 overflow-hidden">
                  <div className="px-3 py-2.5 bg-stone-100 border-r border-stone-300 text-xs font-bold text-stone-700">
                    {composerCountry.dialCode}
                  </div>
                  <input
                    type="tel"
                    required
                    value={composerPhone}
                    onChange={(e) => setComposerPhone(e.target.value)}
                    placeholder="6000-0000"
                    className="w-full px-3.5 py-2.5 bg-transparent text-xs text-stone-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                Mensaje a Enviar
              </label>
              <textarea
                rows={6}
                required
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs font-sans leading-relaxed bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Se registrará automáticamente en el log de auditoría.</span>
              </div>

              <button
                type="submit"
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Abrir y Despachar en WhatsApp</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
