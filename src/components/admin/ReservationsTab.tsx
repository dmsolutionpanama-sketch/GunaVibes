import React, { useState, useEffect } from 'react';
import { Reservation, ReservationStatus, WhatsAppLog, WhatsAppTemplate } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { COUNTRIES_DATA, findCountryByNameOrCode } from '../../data/countries';
import {
  Calendar,
  Search,
  Filter,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  CreditCard,
  XCircle,
  Users,
  Mail,
  Phone,
  MapPin,
  Compass,
  DollarSign,
  Loader2,
  X,
  History,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Globe,
} from 'lucide-react';

export const ReservationsTab: React.FC = () => {
  const { theme } = useTheme();

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Selected reservation for Detail View
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);

  // Selected reservation for "Enviar link de pago"
  const [paymentModalRes, setPaymentModalRes] = useState<Reservation | null>(null);
  const [paymentLink, setPaymentLink] = useState('https://yappy.banistmo.com/pay/gunavibes-res');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [sendingPayment, setSendingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // WhatsApp Messaging & Traceability Modal State
  const [whatsAppModalRes, setWhatsAppModalRes] = useState<Reservation | null>(null);
  const [waTemplates, setWaTemplates] = useState<WhatsAppTemplate[]>([]);
  const [selectedWaTplId, setSelectedWaTplId] = useState<string>('reserva_recibida');
  const [waMessageBody, setWaMessageBody] = useState<string>('');
  const [waLogsForRes, setWaLogsForRes] = useState<WhatsAppLog[]>([]);
  const [loadingWaLogs, setLoadingWaLogs] = useState(false);
  const [dispatchingWa, setDispatchingWa] = useState(false);
  const [waSuccess, setWaSuccess] = useState(false);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const [data, tpls] = await Promise.all([
        api.getAdminReservations(statusFilter, dateFilter),
        api.getWhatsAppTemplates(),
      ]);
      setReservations(data);
      setWaTemplates(tpls || []);
    } catch (err) {
      console.error('Error cargando reservas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, [statusFilter, dateFilter]);

  const openWhatsAppModal = async (res: Reservation) => {
    setWhatsAppModalRes(res);
    setWaSuccess(false);
    setLoadingWaLogs(true);

    try {
      const logs = await api.getWhatsAppLogs(res.id);
      setWaLogsForRes(logs || []);
    } catch (e) {
      console.warn('Error cargando logs de WhatsApp:', e);
    } finally {
      setLoadingWaLogs(false);
    }

    // Prepare template text
    applyWaTemplate('reserva_recibida', res, waTemplates);
  };

  const applyWaTemplate = (tplId: string, res: Reservation, templatesList: WhatsAppTemplate[]) => {
    setSelectedWaTplId(tplId);
    const tpl = templatesList.find((t) => t.id === tplId);
    if (!tpl) return;

    const amountStr = res.monto_total ? `$${res.monto_total} USD` : '$280 USD';
    const payLink = 'https://yappy.banistmo.com/pay/gunavibes-sanblas';
    const destination = res.destino || 'San Blas, Gunayala';

    const compiled = tpl.cuerpo
      .replace(/{cliente_nombre}/g, res.nombre_completo)
      .replace(/{fecha_viaje}/g, res.fecha_viaje)
      .replace(/{pax}/g, String(res.cantidad_personas))
      .replace(/{monto}/g, amountStr)
      .replace(/{link_pago}/g, payLink)
      .replace(/{destino}/g, destination);

    setWaMessageBody(compiled);
  };

  const handleDispatchWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatsAppModalRes || !waMessageBody) return;

    setDispatchingWa(true);
    const cleanPhone = whatsAppModalRes.telefono.replace(/[^\d+]/g, '');
    const rawWaPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
    const directLink = `https://api.whatsapp.com/send?phone=${rawWaPhone}&text=${encodeURIComponent(waMessageBody)}`;

    try {
      await api.createWhatsAppLog({
        reserva_id: whatsAppModalRes.id,
        destinatario_nombre: whatsAppModalRes.nombre_completo,
        destinatario_telefono: whatsAppModalRes.telefono,
        pais_codigo: whatsAppModalRes.pais_procedencia || 'PA',
        tipo_evento: selectedWaTplId as any,
        plantilla_id: selectedWaTplId,
        mensaje_cuerpo: waMessageBody,
        estado_envio: 'enviado',
        enlace_directo_wa: directLink,
      });

      setWaSuccess(true);
      window.open(directLink, '_blank');

      // Refresh logs for this reservation
      const refreshedLogs = await api.getWhatsAppLogs(whatsAppModalRes.id);
      setWaLogsForRes(refreshedLogs);
    } catch (err: any) {
      alert(err.message || 'Error despachando WhatsApp');
    } finally {
      setDispatchingWa(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: ReservationStatus) => {
    try {
      await api.updateReservationStatus(id, newStatus);
      await loadReservations();
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes({ ...selectedRes, estado: newStatus });
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    }
  };

  const openPaymentModal = (res: Reservation) => {
    setPaymentModalRes(res);
    setPaymentAmount(res.monto_total ? String(res.monto_total) : '');
    const isEn = res.idioma_preferido === 'en';
    const amountStr = res.monto_total ? `$${res.monto_total} USD` : 'a definir';

    // Autogenerate editable template
    const template = isEn
      ? `Hello ${res.nombre_completo},\n\nThank you for choosing Guna Vibes for your trip to San Blas on ${res.fecha_viaje} (${res.cantidad_personas} guest(s)).\n\nTo confirm and guarantee your reserved seats, please complete your payment using the secure link below:\n\nPayment Link: [LINK]\nTotal Amount: ${amountStr}\n\nPlease reply to this email or WhatsApp (+507 6369-1775) once completed.\n\nWarm regards,\nGuna Vibes Team`
      : `Hola ${res.nombre_completo},\n\nGracias por elegir a Guna Vibes para tu viaje a Gunayala (San Blas) el ${res.fecha_viaje} (${res.cantidad_personas} persona(s)).\n\nPara confirmar y garantizar tus cupos, por favor realiza el pago mediante el siguiente enlace seguro:\n\nLink de Pago: [LINK]\nMonto Total: ${amountStr}\n\nPor favor confírmanos por este medio o al WhatsApp (+507 6369-1775) una vez realizado.\n\nAtentamente,\nEquipo Guna Vibes`;

    setPaymentMessage(template);
    setPaymentSuccess(false);
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalRes || !paymentLink) return;

    setSendingPayment(true);
    try {
      const finalMsg = paymentMessage.replace('[LINK]', paymentLink);
      await api.sendPaymentLink(
        paymentModalRes.id,
        paymentLink,
        finalMsg,
        paymentAmount ? parseFloat(paymentAmount) : null
      );
      setPaymentSuccess(true);
      setTimeout(async () => {
        setPaymentModalRes(null);
        setPaymentSuccess(false);
        await loadReservations();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Error al despachar link de pago');
    } finally {
      setSendingPayment(false);
    }
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'pendiente':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>;
      case 'pago_enviado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 flex items-center gap-1"><Send className="w-3 h-3" /> Pago Enviado</span>;
      case 'confirmada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Confirmada</span>;
      case 'cancelada':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Cancelada</span>;
    }
  };

  // Compute daily occupancy for selected date filter or today
  const targetDate = dateFilter || new Date().toISOString().split('T')[0];
  const dateReservations = reservations.filter(r => r.fecha_viaje === targetDate && r.estado !== 'cancelada');
  const dateOccupied = dateReservations.reduce((sum, r) => sum + r.cantidad_personas, 0);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Daily Capacity Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Filters */}
        <div className="lg:col-span-3 bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold bg-stone-50"
              >
                <option value="all">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="pago_enviado">Pago Enviado</option>
                <option value="confirmada">Confirmadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-stone-500 mb-1">Fecha de Viaje</label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-stone-300 text-xs bg-stone-50"
              />
            </div>

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="mt-5 text-xs text-rose-600 font-bold hover:underline"
              >
                Limpiar fecha
              </button>
            )}
          </div>

          <div className="text-right">
            <span className="text-xs text-stone-400 font-medium">Total Mostradas:</span>
            <span className="text-xl font-black text-stone-900 ml-1.5">{reservations.length}</span>
          </div>
        </div>

        {/* Daily Capacity Widget */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-500">Cupos {targetDate}</span>
            <span className="text-xs font-bold text-teal-700">{dateOccupied}/14</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-2.5 my-2">
            <div
              className={`h-2.5 rounded-full transition-all ${
                dateOccupied >= 14 ? 'bg-red-500' : dateOccupied > 10 ? 'bg-amber-500' : 'bg-[#0E9AA7]'
              }`}
              style={{ width: `${Math.min(100, (dateOccupied / 14) * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-500">
            {14 - dateOccupied} cupos libres para el {targetDate}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Fecha Viaje</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Contacto</th>
                <th className="py-3.5 px-4">Pax</th>
                <th className="py-3.5 px-4">Servicio</th>
                <th className="py-3.5 px-4">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando reservas...
                  </td>
                </tr>
              ) : reservations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No se encontraron reservas con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                reservations.map((res) => (
                  <tr key={res.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-500">
                      #{res.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">
                      {res.fecha_viaje}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {res.nombre_completo}
                      <span className="block text-[10px] text-stone-400 font-normal">
                        Idioma: {res.idioma_preferido.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      <div>{res.correo}</div>
                      <div className="text-[11px] text-stone-400">{res.telefono}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-stone-800">
                      <span className="inline-flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
                        <Users className="w-3 h-3 text-[#0E9AA7]" />
                        {res.cantidad_personas}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800 block">
                        {res.paquete_nombre || res.tipo_servicio.replace('_', ' ').toUpperCase()}
                      </span>
                      {res.monto_total && (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ${res.monto_total} USD
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(res.estado)}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                      {/* WhatsApp Direct & Traceability button */}
                      <button
                        onClick={() => openWhatsAppModal(res)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                        title="Gestionar Trazabilidad y Notificación WhatsApp"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>

                      {/* Send Payment Link button */}
                      <button
                        onClick={() => openPaymentModal(res)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 transition-colors cursor-pointer inline-flex items-center gap-1 text-[11px]"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-[#0E9AA7]" />
                        <span>Link Pago</span>
                      </button>

                      {/* Google Calendar Link */}
                      {res.google_calendar_html_link && (
                        <a
                          href={res.google_calendar_html_link}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-[#0E9AA7] border border-cyan-200 transition-colors inline-flex items-center"
                          title="Abrir evento en Google Calendar"
                        >
                          <Calendar className="w-4 h-4" />
                        </a>
                      )}

                      {/* Detail view */}
                      <button
                        onClick={() => setSelectedRes(res)}
                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer inline-flex items-center"
                        title="Ver detalles completos"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Enviar Link de Pago */}
      {paymentModalRes && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-stone-200 space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-[#0E9AA7]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Enviar Link de Pago
                  </h3>
                  <p className="text-xs text-stone-500">
                    Reserva #{paymentModalRes.id} • {paymentModalRes.nombre_completo}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPaymentModalRes(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">¡Link de Pago Enviado y Registrado!</h4>
                <p className="text-xs text-emerald-700">
                  La reserva se actualizó automáticamente a estado "Pago Enviado".
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendPayment} className="space-y-4">
                {/* Destination email confirmation */}
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs flex items-center justify-between">
                  <span className="text-stone-500">Destinatario:</span>
                  <span className="font-bold text-stone-900">{paymentModalRes.correo}</span>
                </div>

                {/* Amount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Monto a cobrar (USD)
                    </label>
                    <div className="relative">
                      <DollarSign className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Ej. 150.00"
                        className="w-full pl-8 pr-3 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                      Fecha de Viaje
                    </label>
                    <input
                      type="text"
                      disabled
                      value={paymentModalRes.fecha_viaje}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-stone-600 text-sm"
                    />
                  </div>
                </div>

                {/* Payment Link URL */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Enlace de Pago (Yappy / PayPal / Stripe / Link de cobro) *
                  </label>
                  <input
                    type="url"
                    required
                    value={paymentLink}
                    onChange={(e) => setPaymentLink(e.target.value)}
                    placeholder="https://yappy.banistmo.com/pay/... o https://buy.stripe.com/..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                {/* Message preview */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                    Cuerpo del Correo (Plantilla editable)
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={paymentMessage}
                    onChange={(e) => setPaymentMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                  <p className="text-[11px] text-stone-400 mt-1">
                    El texto <code>[LINK]</code> será reemplazado por la URL de pago configurada arriba.
                  </p>
                </div>

                {/* Submit button */}
                <div className="pt-3 border-t border-stone-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentModalRes(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    disabled={sendingPayment}
                    className="px-6 py-2 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    {sendingPayment ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Despachar Correo con Link</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Detalle de Reserva */}
      {selectedRes && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-6 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  Detalles de la Reserva #{selectedRes.id}
                </h3>
                <p className="text-xs text-stone-500">
                  Creada el {new Date(selectedRes.creado_en).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedRes(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between flex-wrap gap-4">
              <div>
                <span className="text-xs text-stone-500 font-bold uppercase block mb-1">Estado Actual:</span>
                {getStatusBadge(selectedRes.estado)}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500 font-bold uppercase">Cambiar a:</span>
                <select
                  value={selectedRes.estado}
                  onChange={(e) => handleStatusChange(selectedRes.id, e.target.value as ReservationStatus)}
                  className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="pago_enviado">Pago Enviado</option>
                  <option value="confirmada">Confirmada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>

            {/* 2-Columns Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Nombre Completo:</strong>
                <span className="font-bold text-stone-900 text-sm">{selectedRes.nombre_completo}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Correo Electrónico:</strong>
                <span className="font-bold text-stone-900">{selectedRes.correo}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Teléfono / WhatsApp:</strong>
                <span className="font-bold text-stone-900">{selectedRes.telefono}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Cantidad de Personas:</strong>
                <span className="font-bold text-stone-900 text-sm">{selectedRes.cantidad_personas} pax</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Fecha del Viaje:</strong>
                <span className="font-bold text-teal-800 text-sm">{selectedRes.fecha_viaje}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Monto Total:</strong>
                <span className="font-bold text-emerald-700 text-sm">${selectedRes.monto_total || '0'} USD</span>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Origen / Punto de Pick-up:</strong>
                <span className="font-semibold text-stone-800">{selectedRes.origen || 'No especificado'}</span>
              </div>

              <div className="sm:col-span-2 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80">
                <strong className="text-stone-500 block mb-1">Destino / Isla deseada:</strong>
                <span className="font-semibold text-stone-800">{selectedRes.destino || 'No especificado'}</span>
              </div>

              {selectedRes.comentarios && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 text-stone-800">
                  <strong className="text-amber-900 block mb-1">Comentarios del Cliente:</strong>
                  <p>{selectedRes.comentarios}</p>
                </div>
              )}

              {/* Google Calendar Box */}
              <div className="sm:col-span-2 p-3.5 rounded-xl bg-cyan-50/70 border border-cyan-200 text-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[#123C4B] font-bold text-xs">
                    <Calendar className="w-4 h-4 text-[#0E9AA7]" />
                    <span>Sincronización con Google Calendar</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    {selectedRes.google_calendar_event_id
                      ? `Evento agendado (${selectedRes.google_calendar_event_id})`
                      : 'Listo para sincronizar'}
                  </p>
                </div>

                {selectedRes.google_calendar_html_link && (
                  <a
                    href={selectedRes.google_calendar_html_link}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-[#0E9AA7] text-white font-bold text-xs hover:bg-[#0c8590] inline-flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Abrir en Calendar</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Email Dispatch History Log */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-[#0E9AA7]" />
                <span>Historial de Envíos de Pago ({selectedRes.historial_correos?.length || 0})</span>
              </h4>

              {selectedRes.historial_correos && selectedRes.historial_correos.length > 0 ? (
                <div className="space-y-2">
                  {selectedRes.historial_correos.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-stone-500">
                        <span>Enviado: {new Date(log.enviado_en).toLocaleString()}</span>
                        <span className="font-bold text-emerald-700">${log.monto} USD</span>
                      </div>
                      <div className="text-stone-800 font-mono text-[11px] truncate">
                        Link: <a href={log.link_pago} target="_blank" rel="noreferrer" className="text-teal-700 underline">{log.link_pago}</a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Aún no se han enviado links de pago registrados para esta reserva.
                </p>
              )}
            </div>

            {/* Action footer */}
            <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  const r = selectedRes;
                  setSelectedRes(null);
                  openWhatsAppModal(r);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md flex items-center gap-2 text-xs cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp & Trazabilidad</span>
              </button>

              <button
                onClick={() => {
                  const r = selectedRes;
                  setSelectedRes(null);
                  openPaymentModal(r);
                }}
                className="px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                <CreditCard className="w-4 h-4" />
                <span>Enviar Link de Pago Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WhatsApp Messaging & Traceability */}
      {whatsAppModalRes && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-5 animate-fadeIn max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-stone-900">
                      Mensajes & Trazabilidad de WhatsApp
                    </h3>
                    <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                      Reserva #{whatsAppModalRes.id}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {whatsAppModalRes.nombre_completo} • {whatsAppModalRes.pais_procedencia || 'Panamá'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setWhatsAppModalRes(null)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient summary badge */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#0E9AA7]" />
                <span className="font-semibold text-stone-700">País:</span>
                <span className="font-bold text-stone-900">{whatsAppModalRes.pais_procedencia || 'Panamá'}</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-stone-700">Teléfono:</span>
                <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {whatsAppModalRes.telefono}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-stone-700">Viaje:</span>
                <span className="font-bold text-stone-900">{whatsAppModalRes.fecha_viaje} ({whatsAppModalRes.cantidad_personas} pax)</span>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5 flex items-center justify-between">
                <span>Seleccionar Plantilla Oficial de Guna Vibes</span>
                <span className="text-[10px] text-stone-400 font-normal">Reemplaza variables automáticamente</span>
              </label>
              <select
                value={selectedWaTplId}
                onChange={(e) => applyWaTemplate(e.target.value, whatsAppModalRes, waTemplates)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none shadow-sm"
              >
                {waTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Message Body preview / edit */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1 flex items-center justify-between">
                <span>Mensaje a Despachar (Editable)</span>
                <span className="text-[11px] text-stone-400 font-mono">
                  {waMessageBody.length} caracteres
                </span>
              </label>
              <textarea
                rows={6}
                value={waMessageBody}
                onChange={(e) => setWaMessageBody(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs font-sans leading-relaxed bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-inner"
              />
            </div>

            {/* Dispatch Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-stone-200">
              <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Al hacer clic se abrirá WhatsApp y se registrará la trazabilidad.</span>
              </div>

              <button
                onClick={handleDispatchWhatsApp}
                disabled={dispatchingWa || !waMessageBody.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {dispatchingWa ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registrando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Abrir y Despachar en WhatsApp</span>
                  </>
                )}
              </button>
            </div>

            {/* Historical WhatsApp Traceability for this Reservation */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <History className="w-4 h-4 text-emerald-600" />
                <span>Trazabilidad de Mensajes Enviados a esta Reserva ({waLogsForRes.length})</span>
              </h4>

              {loadingWaLogs ? (
                <p className="text-xs text-stone-400">Cargando trazabilidad...</p>
              ) : waLogsForRes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {waLogsForRes.map((log) => (
                    <div key={log.id} className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-stone-500">
                        <span className="font-semibold text-stone-800">{log.tipo_evento.replace(/_/g, ' ')}</span>
                        <span>{new Date(log.creado_en).toLocaleString()}</span>
                      </div>
                      <p className="text-stone-700 text-[11px] leading-relaxed bg-white p-2 rounded-lg border border-stone-100">
                        {log.mensaje_cuerpo}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-stone-400 font-mono">Estado: {log.estado_envio}</span>
                        <a
                          href={log.enlace_directo_wa}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold inline-flex items-center gap-1"
                        >
                          <span>Reenviar enlace</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic">
                  Aún no hay mensajes previos registrados para esta reserva.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
