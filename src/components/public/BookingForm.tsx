import React, { useState, useEffect } from 'react';
import { PackageItem, CapacityCheckResponse, ServiceType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { COUNTRIES_DATA, findCountryByNameOrCode, CountryInfo } from '../../data/countries';
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
  Sparkles,
} from 'lucide-react';

interface BookingFormProps {
  packages: PackageItem[];
  selectedPackageId?: number | null;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  packages,
  selectedPackageId,
}) => {
  const { language, t } = useLanguage();
  const { theme, config } = useTheme();

  // Admin dynamic default capacity
  const defaultDailyLimit = config?.cupo_maximo_dia || 14;

  // Selected Country object
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo>(COUNTRIES_DATA[0]); // Panama by default
  const [localPhoneNumber, setLocalPhoneNumber] = useState('');

  // Form State
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
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

  // Handle Country selection change: update country object & preserve local phone digits
  const handleCountryChange = (countryNameOrCode: string) => {
    const found = findCountryByNameOrCode(countryNameOrCode);
    setSelectedCountry(found);
    setPaisProcedencia(found.name);
  };

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

  // Dynamic max capacity calculated from backend configuration or daily calendar overrides
  const maxCap = capacity ? capacity.cupo_maximo : defaultDailyLimit;
  const remaining = capacity ? capacity.cupos_disponibles : maxCap;
  const occupancyPercent = capacity ? Math.round((capacity.personas_reservadas / maxCap) * 100) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(null);

    // Build full formatted telephone with international country code
    const fullPhone = `${selectedCountry.dialCode} ${localPhoneNumber.trim()}`.trim();

    // Strict validation
    if (!nombre.trim() || !correo.trim() || !localPhoneNumber.trim() || !fechaViaje) {
      setSubmitError(
        language === 'en'
          ? 'Please complete all required fields (Name, Email, Telephone, Country, Date and Guests).'
          : 'Por favor completa todos los campos requeridos (Nombre, Correo, Teléfono con código de país, Fecha y Pasajeros).'
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
        telefono: fullPhone,
        pais_procedencia: paisProcedencia,
        paquete_id: paqueteId ? Number(paqueteId) : null,
        tipo_servicio: tipoServicio || 'traslado',
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
        setLocalPhoneNumber('');
        setPaisProcedencia('Panamá');
        setSelectedCountry(COUNTRIES_DATA[0]);
        setComentarios('');
        setOrigen('');
        setDestino('');
      } else {
        setSubmitError(res.message || 'Error al procesar la reserva.');
      }
    } catch (err: any) {
      console.error('Error submitting reservation:', err);
      setSubmitError(err.message || 'Error al procesar la reserva en el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {language === 'en'
                ? `Capacity of up to ${maxCap} guests per day to ensure personal comfort and safety in San Blas.`
                : `Capacidad de hasta ${maxCap} pasajeros por día para garantizar tu confort, atención personalizada y seguridad en San Blas.`}
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
              <span>{checkingCapacity ? t('booking_checking_capacity') : (language === 'en' ? 'Daily Capacity' : 'Cupo Diario')}</span>
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black">{remaining}</span>
              <span className="text-sm font-semibold opacity-70">/ {maxCap} {language === 'en' ? 'spots' : 'cupos'}</span>
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
                  ? 'We have sent your confirmation details and a WhatsApp notification will be prepared for instant contact.'
                  : 'Hemos recibido tus datos correctamente y nuestro equipo se comunicará contigo vía WhatsApp y correo con los detalles de confirmación y pago.'}
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

        {/* Form Body with strict ordering: Name -> Email -> Country -> Phone (with Dial Code) -> Service -> Date -> Pax -> Origin -> Dest -> Comments */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            
            {/* 1. Full Name */}
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

            {/* 2. Email */}
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

            {/* 3. Country of Origin (País de Procedencia) - Placed BEFORE telephone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#0E9AA7]" />
                <span>{language === 'en' ? 'Country of Origin *' : 'País de Procedencia *'}</span>
              </label>
              <div className="relative">
                <select
                  id="booking-select-country"
                  required
                  value={paisProcedencia}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] cursor-pointer shadow-sm"
                >
                  {COUNTRIES_DATA.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.flag} {language === 'en' ? c.nameEn : c.name} ({c.dialCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 4. Telephone / WhatsApp - Placed IMMEDIATELY AFTER Country of Origin with dynamic Country Dial Code */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('booking_phone')} (WhatsApp) *</span>
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {selectedCountry.flag} {selectedCountry.dialCode}
                </span>
              </label>

              <div className="flex items-center rounded-xl border border-stone-300 bg-stone-50/50 overflow-hidden focus-within:ring-2 focus-within:ring-[#0E9AA7] focus-within:bg-white focus-within:border-transparent transition-all shadow-sm">
                {/* Dial code badge container */}
                <div className="flex items-center gap-1 px-3 py-3 bg-stone-100/90 border-r border-stone-200 text-stone-800 text-sm font-bold flex-shrink-0 select-none">
                  <span className="text-base">{selectedCountry.flag}</span>
                  <span className="font-mono text-xs">{selectedCountry.dialCode}</span>
                </div>

                {/* Local Phone Input */}
                <input
                  id="booking-input-phone"
                  type="tel"
                  required
                  value={localPhoneNumber}
                  onChange={(e) => setLocalPhoneNumber(e.target.value)}
                  placeholder={selectedCountry.placeholder || '6000-0000'}
                  className="w-full px-3.5 py-3 bg-transparent text-stone-900 text-sm focus:outline-none placeholder-stone-400 font-medium"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1 flex items-center gap-1">
                <span>💬 Recibirás asistencia y confirmación rápida vía WhatsApp.</span>
              </p>
            </div>

            {/* 5. Service / Package Select */}
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

            {/* 6. Travel Date */}
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

            {/* 7. Number of Passengers (Quantity limit configured by Admin) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-stone-400" />
                  <span>{t('booking_pax')} *</span>
                </span>
                <span className="text-[10px] text-stone-500 font-bold">
                  Máx: {maxCap}
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="booking-input-pax"
                  type="number"
                  required
                  min={1}
                  max={maxCap}
                  value={cantidadPersonas}
                  onChange={(e) => setCantidadPersonas(Math.max(1, Math.min(maxCap, parseInt(e.target.value, 10) || 1)))}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
                />
              </div>
              {capacityError && (
                <p className="text-[11px] text-rose-600 font-medium mt-1">{capacityError}</p>
              )}
            </div>

            {/* 8. Origin */}
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
                placeholder="Ej. Hotel RIU Plaza, Ciudad de Panamá"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* 9. Destination */}
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
                placeholder="Ej. Isla Perro Grande / Cabaña sobre el agua"
                className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>
          </div>

          {/* 10. Comments & Special Requests */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
              <span>{t('booking_comments')}</span>
            </label>
            <textarea
              id="booking-input-comments"
              rows={2}
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="¿Restricciones alimenticias, niños, equipaje especial o dudas sobre el cruce de frontera comarcal?"
              className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Garantía de cupo directo con capitanes gunas locales certificados.</span>
            </div>

            <button
              id="booking-submit-button"
              type="submit"
              disabled={isSubmitting || checkingCapacity || (capacity ? !capacity.disponible : false)}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold text-base shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: theme.secondaryColor || '#E8622C' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{language === 'en' ? 'Processing Booking...' : 'Procesando Reserva...'}</span>
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
