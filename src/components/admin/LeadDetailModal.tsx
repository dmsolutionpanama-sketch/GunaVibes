import React, { useState } from 'react';
import { api } from '../../services/api';
import { RegisteredClient, LeadFunnelStage, Reservation } from '../../types';
import {
  X,
  User,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  MessageCircle,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  ArrowRight,
  Shield,
  Loader2,
  Trash2,
  Edit2,
  Save,
  Check,
  Zap,
} from 'lucide-react';

interface LeadDetailModalProps {
  lead: RegisteredClient | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: (lead: RegisteredClient) => void;
  onLeadDeleted: (leadId: number) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  lead,
  isOpen,
  onClose,
  onLeadUpdated,
  onLeadDeleted,
}) => {
  if (!isOpen || !lead) return null;

  const [activeTab, setActiveTab] = useState<'timeline' | 'edit' | 'convert'>('timeline');
  const [newNote, setNewNote] = useState('');
  const [newNoteType, setNewNoteType] = useState<'nota' | 'llamada' | 'whatsapp' | 'cotizacion'>('nota');
  const [savingNote, setSavingNote] = useState(false);
  
  // Edit state
  const [editNombre, setEditNombre] = useState(lead.nombre_completo);
  const [editTelefono, setEditTelefono] = useState(lead.telefono);
  const [editCorreo, setEditCorreo] = useState(lead.correo);
  const [editPais, setEditPais] = useState(lead.pais_procedencia || 'Panamá');
  const [editMonto, setEditMonto] = useState(lead.monto_estimado || 0);
  const [editPax, setEditPax] = useState(lead.cantidad_personas || 1);
  const [editFecha, setEditFecha] = useState(lead.fecha_tentativa || '');
  const [savingEdit, setSavingEdit] = useState(false);

  // Conversion state
  const [converting, setConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState<Reservation | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  const handleStageChange = async (stage: LeadFunnelStage) => {
    try {
      const updated = await api.updateLeadFunnelStage(lead.id, stage, `Etapa cambiada a: ${stage}`);
      onLeadUpdated(updated);
      setNotification(`Etapa actualizada a "${stage}"`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al cambiar etapa');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSavingNote(true);
    try {
      const updated = await api.addLeadNote(lead.id, newNote.trim(), newNoteType);
      onLeadUpdated(updated);
      setNewNote('');
      setNotification('Interacción añadida a la bitácora');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al registrar nota');
    } finally {
      setSavingNote(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const updated = await api.updateAdminLead(lead.id, {
        nombre_completo: editNombre.trim(),
        telefono: editTelefono.trim(),
        correo: editCorreo.trim(),
        pais_procedencia: editPais.trim(),
        monto_estimado: Number(editMonto),
        cantidad_personas: Number(editPax),
        fecha_tentativa: editFecha,
      });
      onLeadUpdated(updated);
      setActiveTab('timeline');
      setNotification('Información del lead actualizada');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar cambios');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleConvertLead = async () => {
    if (!confirm(`¿Convertir al lead "${lead.nombre_completo}" en Reserva Oficial en el sistema?`)) return;

    setConverting(true);
    try {
      const result = await api.convertLeadToReservation(lead.id, {
        fecha_viaje: lead.fecha_tentativa || new Date().toISOString().split('T')[0],
        cantidad_personas: lead.cantidad_personas || 1,
        monto_total: lead.monto_estimado || 150,
      });

      if (result.success) {
        setConversionSuccess(result.reserva);
        onLeadUpdated(result.lead);
        setNotification(`¡Lead convertido en Reserva Oficial #${result.reserva.id}!`);
      }
    } catch (err: any) {
      alert(err.message || 'Error al convertir lead');
    } finally {
      setConverting(false);
    }
  };

  const handleDeleteLead = async () => {
    if (!confirm(`¿Eliminar definitivamente el lead "${lead.nombre_completo}" del registro?`)) return;
    try {
      await api.deleteAdminLead(lead.id);
      onLeadDeleted(lead.id);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar lead');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-3xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#123C4B] via-[#0E2E3A] to-[#0A222B] p-6 text-white flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-white/20 text-teal-200 font-bold">
                Lead #{lead.id}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-bold border border-amber-400/30 uppercase">
                Origen: {lead.origen_captacion || 'WhatsApp'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold font-heading">
              {lead.nombre_completo}
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300 pt-1">
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-teal-400" />
                {lead.telefono}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-teal-400" />
                {lead.correo}
              </span>
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                {lead.pais_procedencia || 'Panamá'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {notification && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between px-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notification}</span>
            </div>
          </div>
        )}

        {/* Pipeline Stage Quick Switcher */}
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-bold uppercase text-stone-500 mr-1">Fase Embudo:</span>
            
            <button
              onClick={() => handleStageChange('intencion_registrada')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                (lead.estado_embudo || 'intencion_registrada') === 'intencion_registrada'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              1. Intención
            </button>

            <button
              onClick={() => handleStageChange('en_conversacion')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lead.estado_embudo === 'en_conversacion'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              2. En Conversación
            </button>

            <button
              onClick={() => handleStageChange('cotizacion_enviada')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lead.estado_embudo === 'cotizacion_enviada'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              3. Cotización Enviada
            </button>

            <button
              onClick={() => handleStageChange('pago_enviado')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lead.estado_embudo === 'pago_enviado'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              4. Link Pago Enviado
            </button>

            <button
              onClick={() => handleStageChange('pago_completado')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                lead.estado_embudo === 'pago_completado'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
              }`}
            >
              5. Ganado ✓
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-stone-200 px-6 flex items-center justify-between">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`py-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'timeline'
                  ? 'border-[#0E9AA7] text-[#0E9AA7]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Bitácora de Interacción ({lead.historial_notas?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-3 text-xs font-bold border-b-2 cursor-pointer transition-all ${
                activeTab === 'edit'
                  ? 'border-[#0E9AA7] text-[#0E9AA7]'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              Editar Datos del Prospecto
            </button>
          </div>

          <button
            onClick={handleConvertLead}
            disabled={converting}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {converting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5 text-amber-300" />}
            <span>Convertir a Reserva Oficial</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 max-h-[60vh] overflow-y-auto text-xs space-y-6">
          
          {/* TAB 1: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Interés</span>
                  <span className="font-bold text-stone-900 truncate block mt-0.5" title={lead.paquete_interes}>
                    {lead.paquete_interes || 'Pasadía General'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Fecha Tentativa</span>
                  <span className="font-bold text-stone-900 block mt-0.5">
                    {lead.fecha_tentativa || 'Sin definir'}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Personas (Pax)</span>
                  <span className="font-bold text-stone-900 block mt-0.5">
                    {lead.cantidad_personas || 1} personas
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/80">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">Monto Estimado</span>
                  <span className="font-bold font-mono text-stone-900 block mt-0.5">
                    ${lead.monto_estimado || 0} USD
                  </span>
                </div>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-700 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-[#0E9AA7]" />
                    <span>Añadir Registro a la Bitácora de Interacción</span>
                  </label>
                  <select
                    value={newNoteType}
                    onChange={(e) => setNewNoteType(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg border border-stone-300 text-xs font-bold bg-white"
                  >
                    <option value="nota">📝 Nota Interna</option>
                    <option value="whatsapp">📱 Mensaje WhatsApp</option>
                    <option value="llamada">📞 Llamada Telefónica</option>
                    <option value="cotizacion">📄 Cotización Formal</option>
                  </select>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Escribe los detalles de la conversación, acuerdos, dudas o seguimiento con el cliente..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:ring-2 focus:ring-[#0E9AA7]"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingNote}
                    className="px-4 py-2 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    <span>Registrar Interacción</span>
                  </button>
                </div>
              </form>

              {/* Interaction History List */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-800 uppercase tracking-wider text-xs flex items-center gap-2">
                  <span>Historial Cronológico de Interacciones</span>
                  <span className="font-mono text-stone-400">({lead.historial_notas?.length || 0})</span>
                </h4>

                {(!lead.historial_notas || lead.historial_notas.length === 0) ? (
                  <p className="text-stone-400 italic py-3 text-center bg-stone-50 rounded-xl">
                    No hay notas registradas en este lead aún.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {lead.historial_notas.map((n) => (
                      <div
                        key={n.id}
                        className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{n.autor}</span>
                            <span className="px-2 py-0.5 rounded-md bg-stone-100 font-bold uppercase text-[10px] text-stone-600">
                              {n.tipo}
                            </span>
                          </div>
                          <span className="text-stone-400 font-mono">
                            {new Date(n.fecha).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-stone-700 leading-relaxed pt-0.5">{n.nota}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: EDIT LEAD */}
          {activeTab === 'edit' && (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Teléfono / WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={editTelefono}
                    onChange={(e) => setEditTelefono(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    required
                    value={editCorreo}
                    onChange={(e) => setEditCorreo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">País</label>
                  <input
                    type="text"
                    value={editPais}
                    onChange={(e) => setEditPais(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Fecha Tentativa</label>
                  <input
                    type="date"
                    value={editFecha}
                    onChange={(e) => setEditFecha(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Pax (Personas)</label>
                  <input
                    type="number"
                    min={1}
                    value={editPax}
                    onChange={(e) => setEditPax(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Monto Estimado ($ USD)</label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editMonto}
                    onChange={(e) => setEditMonto(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={handleDeleteLead}
                  className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar Lead</span>
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 rounded-xl bg-[#0E9AA7] hover:bg-[#0C828D] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-sm"
                >
                  {savingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Registrado el {new Date(lead.creado_en).toLocaleString()}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
