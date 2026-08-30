import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Radio, Mail, User, Phone, Globe, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const COUNTRIES = [
  'Panamá', 'Estados Unidos', 'España', 'Colombia', 'Costa Rica',
  'México', 'Canadá', 'Argentina', 'Chile', 'Brasil',
  'Alemania', 'Francia', 'Italia', 'Reino Unido', 'Otro'
];

export const LeadCaptureForm: React.FC = () => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [pais, setPais] = useState('Panamá');
  const [acepta, setAcepta] = useState(true);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !correo.trim()) {
      setErrorMsg(language === 'en' ? 'Please fill your name and email.' : 'Por favor ingresa tu nombre y correo.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.registerClient({
        nombre_completo: nombre,
        correo,
        telefono,
        pais_procedencia: pais,
        idioma_preferido: language,
        acepta_notificaciones: acepta,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setNombre('');
        setCorreo('');
        setTelefono('');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="lead-capture-block" className="my-10 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#123C4B] to-[#0E9AA7] text-white shadow-xl max-w-5xl mx-auto border border-teal-600/30">
      <div className="flex flex-col lg:flex-row items-center gap-8">
        
        {/* Left Explanation */}
        <div className="lg:w-5/12 space-y-3 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/90 text-white text-xs font-bold uppercase tracking-wider animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>Alertas de "En Vivo"</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            {t('lead_title')}
          </h3>
          <p className="text-stone-200 text-sm leading-relaxed">
            {t('lead_subtitle')}
          </p>
          <p className="text-xs text-teal-200">
            ✉️ Podrás darte de baja en cualquier momento con un solo clic.
          </p>
        </div>

        {/* Right Form */}
        <div className="lg:w-7/12 w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
          {successMsg ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="text-lg font-bold text-white">{t('lead_success')}</h4>
              <p className="text-xs text-stone-200">{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/20 border border-red-400 text-red-100 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-300 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1">
                    {t('booking_name')} *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-3 text-stone-300" />
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Tu nombre"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-stone-300 text-sm focus:outline-none focus:bg-white/25"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1">
                    {t('booking_email')} *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-300" />
                    <input
                      type="email"
                      required
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="correo@ejemplo.com"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-stone-300 text-sm focus:outline-none focus:bg-white/25"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1">
                    {t('booking_phone')}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-3 text-stone-300" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+507 6000-0000"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white placeholder-stone-300 text-sm focus:outline-none focus:bg-white/25"
                    />
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-medium text-stone-200 mb-1">
                    {t('lead_country')} *
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-stone-300 pointer-events-none" />
                    <select
                      value={pais}
                      onChange={(e) => setPais(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#123C4B] border border-white/25 text-white text-sm focus:outline-none cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-[#123C4B] text-white">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Notification opt-in */}
              <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-teal-600 focus:ring-teal-500 bg-white/20 border-white/40"
                />
                <span className="text-xs text-stone-200 select-none">
                  {t('lead_accept_checkbox')}
                </span>
              </label>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-stone-900 bg-amber-400 hover:bg-amber-300 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-stone-900" />
                    <span>{t('lead_button')}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
