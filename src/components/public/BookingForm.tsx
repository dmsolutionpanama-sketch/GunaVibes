import React, { useState, useEffect } from 'react';
import { PackageItem, CapacityCheckResponse, ServiceType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Calendar,
  Users,
  MapPin,
  Compass,
  Mail,
  Phone,
  User,
  Globe,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';

const COMMON_COUNTRIES = [
  { name: 'Panamá', flag: '🇵🇦', code: 'PA' },
  { name: 'Estados Unidos', flag: '🇺🇸', code: 'US' },
  { name: 'Colombia', flag: '🇨🇴', code: 'CO' },
  { name: 'España', flag: '🇪🇸', code: 'ES' },
  { name: 'Alemania', flag: '🇩🇪', code: 'DE' },
  { name: 'Francia', flag: '🇫🇷', code: 'FR' },
  { name: 'Italia', flag: '🇮🇹', code: 'IT' },
  { name: 'Costa Rica', flag: '🇨🇷', code: 'CR' },
  { name: 'México', flag: '🇲🇽', code: 'MX' },
  { name: 'Canadá', flag: '🇨🇦', code: 'CA' },
  { name: 'Brasil', flag: '🇧🇷', code: 'BR' },
  { name: 'Reino Unido', flag: '🇬🇧', code: 'GB' },
  { name: 'Argentina', flag: '🇦🇷', code: 'AR' },
  { name: 'Chile', flag: '🇨🇱', code: 'CL' },
  { name: 'Perú', flag: '🇵🇪', code: 'PE' },
  { name: 'Suiza', flag: '🇨🇭', code: 'CH' },
  { name: 'Países Bajos', flag: '🇳🇱', code: 'NL' },
  { name: 'Australia', flag: '🇦🇺', code: 'AU' },
  { name: 'Otro', flag: '🌎', code: 'XX' },
];

interface BookingFormProps {
  packages: PackageItem[];
  selectedPackageId?: number | null;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  packages,
  selectedPackageId,
}) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  // Form State
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [paisProcedencia, setPaisProcedencia] = useState('Panamá');
  const [paqueteId, setPaqueteId] = useState<number | ''>(selectedPackageId || '');
  const [tipoServicio, setTipoServicio] = useState<ServiceType>('traslado');
  const [fechaViaje, setFechaViaje] = useState('');
  const [cantidadPersonas, setCantidadPersonas] = useState<number>(2);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [comentarios, setComentarios] = useState('');

  // Capacity checking state
  const [capacity, setCapacity] = useState<CapacityCheckResponse | null>(null);
  const [checkingCapacity, setCheckingCapacity] = useState(false);
  const [capacityError, setCapacityError] = useState<string | null>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Set default date to tomorrow
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    setFechaViaje(dateStr);
  }, []);

  // Update selected package if passed from props
  useEffect(() => {
    if (selectedPackageId) {
      setPaqueteId(selectedPackageId);
      const pkg = packages.find(p => p.id === selectedPackageId);
      if (pkg) {
        setTipoServicio(pkg.tipo);
      }
    }
  }, [selectedPackageId, packages]);

  // Query capacity on date or pax change
  useEffect(() => {
    if (!fechaViaje) return;

    let isMounted = true;
    const checkCap = async () => {
      setCheckingCapacity(true);
      setCapacityError(null);
      try {
        const data = await api.checkCapacity(fechaViaje, cantidadPersonas);
        if (isMounted) {
          setCapacity(data);
          if (!data.disponible) {
            setCapacityError(
              language === 'en'
                ? `Only ${data.cupos_disponibles} seats available for this date (requested: ${cantidadPersonas}). Daily limit: ${data.cupo_maximo}.`
                : `Solo quedan ${data.cupos_disponibles} cupos disponibles para esta fecha (solicitó: ${cantidadPersonas}). Límite diario: ${data.cupo_maximo}.`
            );
          }
        }
      } catch (err) {
        console.error('Error al verificar cupo:', err);
      } finally {
        if (isMounted) setCheckingCapacity(false);
      }
    };

    const timeout = setTimeout(checkCap, 250);
    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [fechaViaje, cantidadPersonas, language]);

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setPaqueteId('');
      return;
    }
    const id = parseInt(val, 10);
    setPaqueteId(id);
    const pkg = packages.find(p => p.id === id);
    if (pkg) {
      setTipoServicio(pkg.tipo);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    // Strict validation
    if (!nombre.trim() || !correo.trim() || !telefono.trim() || !fechaViaje) {
      setSubmitError(
        language === 'en'
          ? 'Please complete all required fields.'
          : 'Por favor completa todos los campos requeridos.'
      );
      return;
    }

    if (capacity && !capacity.disponible) {
      setSubmitError(
        language === 'en'
          ? `Requested seats (${cantidadPersonas}) exceed available capacity (${capacity.cupos_disponibles} of ${capacity.cupo_maximo}).`
          : `La cantidad de personas solicitada (${cantidadPersonas}) supera los cupos disponibles (${capacity.cupos_disponibles} de ${capacity.cupo_maximo}).`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createReservation({
        nombre_completo: nombre,
        correo,
        telefono,
        pais_procedencia: paisProcedencia,
        paquete_id: paqueteId ? Number(paqueteId) : null,
        tipo_servicio: tipoServicio,
        fecha_viaje: fechaViaje,
        cantidad_personas: cantidadPersonas,
        origen,
        destino,
        comentarios,
        idioma_preferido: language,
      });

      if (res.success) {
        setSubmitSuccess(res.message);
        // Reset inputs
        setNombre('');
        setCorreo('');
        setTelefono('');
        setPaisProcedencia('Panamá');
        setComentarios('');
        setOrigen('');
        setDestino('');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Error al procesar la reserva.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const remaining = capacity ? capacity.cupos_disponibles : 14;
  const maxCap = capacity ? capacity.cupo_maximo : 14;
  const occupancyPercent = capacity ? Math.round((capacity.personas_reservadas / capacity.cupo_maximo) * 100) : 0;

  return (
    <section id="booking-section" className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className="bg-white rounded-3xl shadow-xl border border-stone-200/80 p-6 sm:p-10 relative overflow-hidden"
        style={{ borderRadius: '24px' }}
      >
        {/* Top Decorative Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 mb-2">
              <ShieldCheck className="w-4 h-4 text-[#0E9AA7]" />
              <span>{t('hero_badge')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-stone-900">
              {t('booking_title')}
            </h2>
            <p className="text-sm text-stone-600 mt-1">
              {t('booking_subtitle')}
            </p>
          </div>

          {/* Daily Quota Live Indicator Card */}
          <div
            id="capacity-indicator-card"
            className={`p-4 rounded-2xl border transition-all flex flex-col items-center sm:items-end justify-center min-w-[200px] ${
              remaining === 0
                ? 'bg-red-50 border-red-200 text-red-900'
                : remaining < 5
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
              <span className={`w-2.5 h-2.5 rounded-full ${remaining === 0 ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
              <span>{checkingCapacity ? t('booking_checking_capacity') : 'Cupo diario'}</span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black">{remaining}</span>
              <span className="text-sm font-semibold opacity-70">/ {maxCap} cupos</span>
            </div>

            {/* Occupancy bar */}
            <div className="w-full bg-stone-200/80 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  remaining === 0 ? 'bg-red-500' : remaining < 5 ? 'bg-amber-500' : 'bg-[#0E9AA7]'
                }`}
                style={{ width: `${Math.min(100, occupancyPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {submitSuccess && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start gap-3 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-base">{t('booking_success_title')}</h4>
              <p className="text-sm mt-1">{submitSuccess}</p>
              <p className="text-xs text-emerald-700 mt-2 font-medium">
                {language === 'en'
                  ? 'We will review your date and send the payment link to your registered email.'
                  : 'Revisaremos tu fecha y te enviaremos el link de pago a tu correo registrado.'}
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {submitError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">No pudimos procesar la reserva</h4>
              <p className="text-xs mt-0.5">{submitError}</p>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_name')} *</span>
              </label>
              <input
                id="booking-input-name"
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_email')} *</span>
              </label>
              <input
                id="booking-input-email"
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="juan@ejemplo.com"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_phone')} *</span>
              </label>
              <input
                id="booking-input-phone"
                type="tel"
                required
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+507 6000-0000"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white transition-all"
              />
            </div>

            {/* Country of Origin (País de Procedencia) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-400" />
                <span>{language === 'en' ? 'Country of Origin *' : 'País de Procedencia *'}</span>
              </label>
              <select
                id="booking-select-country"
                required
                value={paisProcedencia}
                onChange={(e) => setPaisProcedencia(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] cursor-pointer"
              >
                {COMMON_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Service / Package Select */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_service')} *</span>
              </label>
              <select
                id="booking-select-service"
                value={paqueteId}
                onChange={handlePackageChange}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] cursor-pointer"
              >
                <option value="">{language === 'en' ? '-- Select a Package or Service --' : '-- Selecciona un Paquete o Servicio --'}</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {language === 'en' ? p.nombre_en || p.nombre_es : p.nombre_es} (${p.precio} USD)
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Date */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_date')} *</span>
              </label>
              <input
                id="booking-input-date"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={fechaViaje}
                onChange={(e) => setFechaViaje(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>

            {/* Number of Passengers */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_pax')} *</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="booking-input-pax"
                  type="number"
                  required
                  min={1}
                  max={maxCap}
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>
            </div>

            {/* Origin */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_origin')}</span>
              </label>
              <input
                id="booking-input-origin"
                type="text"
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                placeholder="Ej. Hotel RIU Plaza, Calle 50"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_destination')}</span>
              </label>
              <input
                id="booking-input-dest"
                type="text"
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                placeholder="Ej. Isla Perro Chico / Pelícano"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* Comments */}
            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
                <span>{t('booking_comments')}</span>
              </label>
              <input
                id="booking-input-comments"
                type="text"
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                placeholder="Dietas, equipaje especial, horario de vuelo..."
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>
          </div>

          {/* Quota Warning Message if requested > remaining */}
          {capacityError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{capacityError}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 text-center sm:text-left">
              🔒 Recibirás un correo de confirmación formal y el link de pago seguro (Yappy / Tarjeta / Transferencia).
            </p>

            <button
              id="booking-submit-btn"
              type="submit"
              disabled={isSubmitting || (capacity ? !capacity.disponible : false)}
              className={`w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isSubmitting || (capacity && !capacity.disponible)
                  ? 'opacity-60 cursor-not-allowed bg-stone-400'
                  : 'hover:scale-102 active:scale-98'
              }`}
              style={{
                backgroundColor: isSubmitting || (capacity && !capacity.disponible) ? undefined : theme.secondaryColor,
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Procesando reserva...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t('booking_submit')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};
