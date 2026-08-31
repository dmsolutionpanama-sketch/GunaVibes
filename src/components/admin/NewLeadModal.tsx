import React, { useState } from 'react';
import { api } from '../../services/api';
import { RegisteredClient, PackageSanBlas, LeadOrigin, ServiceType, LeadFunnelStage } from '../../types';
import {
  Plus,
  X,
  User,
  Phone,
  Mail,
  Globe,
  Calendar,
  Users,
  DollarSign,
  Package,
  FileText,
  Loader2,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  Instagram,
  Facebook,
} from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadCreated: (lead: RegisteredClient) => void;
  packages: PackageSanBlas[];
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onLeadCreated,
  packages,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [pais, setPais] = useState('Panamá');
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [origen, setOrigen] = useState<LeadOrigin>('whatsapp');
  const [paqueteId, setPaqueteId] = useState<number | ''>(2);
  const [paqueteTexto, setPaqueteTexto] = useState('Pasadía Todo Incluido (Isla Perro Chico + Piscina Natural)');
  const [tipoServicio, setTipoServicio] = useState<ServiceType>('todo_incluido');
  const [fechaTentativa, setFechaTentativa] = useState(
    new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0]
  );
  const [cantidadPersonas, setCantidadPersonas] = useState<number>(2);
  const [montoEstimado, setMontoEstimado] = useState<number>(270);
  const [estadoEmbudo, setEstadoEmbudo] = useState<LeadFunnelStage>('intencion_registrada');
  const [notas, setNotas] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePackageChange = (idStr: string) => {
    if (!idStr) {
      setPaqueteId('');
      return;
    }
    const id = parseInt(idStr, 10);
    setPaqueteId(id);
    const pkg = packages.find((p) => p.id === id);
    if (pkg) {
      setPaqueteTexto(pkg.nombre_es);
      setTipoServicio(pkg.tipo_servicio);
      setMontoEstimado(pkg.precio * cantidadPersonas);
    }
  };

  const handlePaxChange = (pax: number) => {
    setCantidadPersonas(pax);
    const pkg = packages.find((p) => p.id === paqueteId);
    if (pkg) {
      setMontoEstimado(pkg.precio * pax);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreCompleto.trim() || !telefono.trim() || !correo.trim()) {
      setError('Por favor completa el nombre, teléfono y correo electrónico');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const created = await api.createAdminLead({
        nombre_completo: nombreCompleto.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        pais_procedencia: pais.trim() || 'Panamá',
        idioma_preferido: idioma,
        origen_captacion: origen,
        paquete_interes: paqueteTexto,
        paquete_id: typeof paqueteId === 'number' ? paqueteId : null,
        tipo_servicio_interes: tipoServicio,
        fecha_tentativa: fechaTentativa,
        cantidad_personas: Number(cantidadPersonas) || 1,
        monto_estimado: Number(montoEstimado) || 0,
        estado_embudo: estadoEmbudo,
        notas_interaccion: notas.trim(),
        acepta_notificaciones: true,
      });

      onLeadCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al registrar el lead en el backend');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#123C4B] to-[#0E2E3A] p-6 text-white flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-xs font-bold border border-teal-400/30">
              <User className="w-3.5 h-3.5" />
              <span>Registro Interno Backend</span>
            </div>
            <h3 className="text-xl font-bold font-heading">
              Registrar Nuevo Lead / Contacto Comercial
            </h3>
            <p className="text-xs text-stone-300">
              Ingresa prospectos recibidos por WhatsApp, llamadas, redes o eventos para controlar todo su ciclo de vida.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Contact info */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">
              1. Datos de Contacto del Prospecto
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={nombreCompleto}
                  onChange={(e) => setNombreCompleto(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+507 6000-0000"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Correo Electrónico *
                </label>
                <input
                  type="email"
                  required
                  placeholder="carlos@ejemplo.com"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  País de Procedencia
                </label>
                <input
                  type="text"
                  placeholder="Panamá, España, USA..."
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Origin & Funnel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">
              2. Canal de Captación & Etapa Inicial
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Canal de Origen *
                </label>
                <select
                  value={origen}
                  onChange={(e) => setOrigen(e.target.value as LeadOrigin)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  <option value="whatsapp">📱 WhatsApp Directo</option>
                  <option value="llamada">📞 Llamada Telefónica</option>
                  <option value="instagram">📸 Instagram DM / Story</option>
                  <option value="facebook">📘 Facebook Messenger</option>
                  <option value="web_formulario">🌐 Formulario Web</option>
                  <option value="correo_directo">✉️ Correo Directo</option>
                  <option value="recomendacion">🤝 Recomendación</option>
                  <option value="mostrador">🏢 Mostrador / Presencial</option>
                  <option value="otro">⚙️ Otro Canal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Etapa en el Embudo *
                </label>
                <select
                  value={estadoEmbudo}
                  onChange={(e) => setEstadoEmbudo(e.target.value as LeadFunnelStage)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  <option value="intencion_registrada">1. Intención Registrada</option>
                  <option value="en_conversacion">2. En Conversación Activa</option>
                  <option value="cotizacion_enviada">3. Cotización Enviada</option>
                  <option value="pago_enviado">4. Link Pago Enviado</option>
                  <option value="pago_completado">5. Ganado / Pagado</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Idioma de Preferencia
                </label>
                <select
                  value={idioma}
                  onChange={(e) => setIdioma(e.target.value as 'es' | 'en')}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  <option value="es">Español (ES)</option>
                  <option value="en">English (EN)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Package & Travel Interest */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">
              3. Interés de Viaje & Cotización Estimada
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Paquete o Tour de Interés
                </label>
                <select
                  value={paqueteId}
                  onChange={(e) => handlePackageChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-stone-50"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.nombre_es} (${pkg.precio}/pax)
                    </option>
                  ))}
                  <option value="">Personalizado / Otro</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Fecha Tentativa de Viaje
                </label>
                <input
                  type="date"
                  value={fechaTentativa}
                  onChange={(e) => setFechaTentativa(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Cantidad de Personas (Pax)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={cantidadPersonas}
                  onChange={(e) => handlePaxChange(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Monto Estimado ($ USD)
                </label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={montoEstimado}
                  onChange={(e) => setMontoEstimado(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Initial Interaction Notes */}
          <div className="space-y-2">
            <label className="block font-bold text-stone-700">
              Notas Iniciales de la Conversación / Requerimientos Especiales
            </label>
            <textarea
              rows={3}
              placeholder="Ej. Solicitó información para pasadía familiar de 6 personas. Requiere pick up en Bella Vista y menú vegetariano..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-[#E8622C] hover:bg-[#D45320] text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-102 active:scale-98"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>Guardar Lead en Backend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
