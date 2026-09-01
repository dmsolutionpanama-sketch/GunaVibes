import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import {
  Globe,
  BarChart3,
  Calendar,
  Star,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Save,
  Loader2,
  RefreshCw,
  Code2,
  Copy,
  Layers,
  Settings,
  HelpCircle,
} from 'lucide-react';

export const GoogleEcosystemTab: React.FC = () => {
  const { config, theme, refreshConfig } = useTheme();

  // Google Analytics & Tag Manager state
  const [gaId, setGaId] = useState(config?.google_analytics_id || '');
  const [gaActive, setGaActive] = useState(config?.google_analytics_activo !== false);
  const [gaTrackReservations, setGaTrackReservations] = useState(config?.google_analytics_track_reservations !== false);
  const [gtmId, setGtmId] = useState(config?.google_tag_manager_id || '');
  const [gtmActive, setGtmActive] = useState(config?.google_tag_manager_activo !== false);
  const [gSearchConsole, setGSearchConsole] = useState(config?.google_search_console_tag || '');
  const [gSiteVerification, setGSiteVerification] = useState(config?.google_site_verification || '');

  // Google Places & Calendar state
  const [googlePlaceId, setGooglePlaceId] = useState(config?.google_place_id || 'ChIJ_yZ4W8aFrY8RFY9j3YF98nA');
  const [googlePlacesApiKey, setGooglePlacesApiKey] = useState(config?.google_places_api_key || '');
  const [googleMapsKey, setGoogleMapsKey] = useState(config?.google_maps_api_key || '');

  const [saving, setSaving] = useState(false);
  const [testingGa, setTestingGa] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setGaId(config.google_analytics_id || '');
      setGaActive(config.google_analytics_activo !== false);
      setGaTrackReservations(config.google_analytics_track_reservations !== false);
      setGtmId(config.google_tag_manager_id || '');
      setGtmActive(config.google_tag_manager_activo !== false);
      setGSearchConsole(config.google_search_console_tag || '');
      setGSiteVerification(config.google_site_verification || '');
      setGooglePlaceId(config.google_place_id || 'ChIJ_yZ4W8aFrY8RFY9j3YF98nA');
      setGooglePlacesApiKey(config.google_places_api_key || '');
      setGoogleMapsKey(config.google_maps_api_key || '');
    }
  }, [config]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 4500);
  };

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSaveGoogleSuite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateAdminConfig({
        google_analytics_id: gaId.trim(),
        google_analytics_activo: gaActive,
        google_analytics_track_reservations: gaTrackReservations,
        google_tag_manager_id: gtmId.trim(),
        google_tag_manager_activo: gtmActive,
        google_search_console_tag: gSearchConsole.trim(),
        google_site_verification: gSiteVerification.trim(),
        google_place_id: googlePlaceId.trim(),
        google_places_api_key: googlePlacesApiKey.trim(),
        google_maps_api_key: googleMapsKey.trim(),
      });

      if (refreshConfig) await refreshConfig();
      showSuccess('¡Configuración de Herramientas de Google y Google Analytics guardada exitosamente!');
    } catch (err: any) {
      showError(err.message || 'Error al guardar la configuración de Google');
    } finally {
      setSaving(false);
    }
  };

  const handleTestGaEvent = () => {
    setTestingGa(true);
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'test_admin_diagnostics', {
          event_category: 'admin_test',
          event_label: 'Guna Vibes San Blas Test Event',
          value: 1,
        });
      }
      setTimeout(() => {
        setTestingGa(false);
        showSuccess('Evento de prueba enviado a la capa de datos de Google Analytics');
      }, 700);
    } catch (err) {
      setTestingGa(false);
      showError('No se pudo enviar el evento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="font-bold">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 text-xs sm:text-sm flex items-center gap-3 shadow-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span className="font-bold">{errorMessage}</span>
        </div>
      )}

      {/* HEADER CARD */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md flex-shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-stone-900 font-heading flex items-center gap-2">
              <span>Suite de Herramientas de Google & Analytics</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Oficial
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Conexión centralizada con Google Analytics 4, Tag Manager, Search Console, Calendar y Places API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleTestGaEvent}
            disabled={testingGa}
            className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-extrabold border border-blue-200 flex items-center gap-2 transition-all cursor-pointer"
          >
            {testingGa ? <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> : <Zap className="w-4 h-4 text-blue-600" />}
            <span>Probar Disparo GA4</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSaveGoogleSuite} className="space-y-6">
        {/* SECTION 1: GOOGLE ANALYTICS 4 & TAG MANAGER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  1. Google Analytics 4 (GA4) & Google Tag Manager (GTM)
                </h3>
                <p className="text-xs text-stone-500">
                  Rastrea visitantes en tiempo real, origen geográfico, conversiones de reservas y valor de carritos.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500">Estado:</span>
              <span
                className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                  gaId.trim()
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-stone-100 text-stone-600 border border-stone-200'
                }`}
              >
                {gaId.trim() ? 'Conectado (gtag.js)' : 'Pendiente ID'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GA4 Measurement ID */}
            <div className="space-y-3 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  ID de Medición de Google Analytics 4
                </label>
                <button
                  type="button"
                  onClick={() => setGaActive(!gaActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    gaActive ? 'bg-blue-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      gaActive ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={gaId}
                  onChange={(e) => setGaId(e.target.value)}
                  placeholder="Ej: G-XXXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Encuéntralo en tu panel de Google Analytics → Administración → Flujos de datos (Data Streams).
              </p>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={gaTrackReservations}
                    onChange={(e) => setGaTrackReservations(e.target.checked)}
                    className="rounded text-blue-600 accent-blue-600 cursor-pointer"
                  />
                  <span>Rastrear eventos de compra y reservas automáticamente ('purchase', 'generate_lead')</span>
                </label>
              </div>
            </div>

            {/* Google Tag Manager Container ID */}
            <div className="space-y-3 p-5 rounded-2xl bg-stone-50 border border-stone-200">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-stone-700">
                  ID de Google Tag Manager (GTM)
                </label>
                <button
                  type="button"
                  onClick={() => setGtmActive(!gtmActive)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors cursor-pointer ${
                    gtmActive ? 'bg-blue-600' : 'bg-stone-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      gtmActive ? 'translate-x-4.5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={gtmId}
                  onChange={(e) => setGtmId(e.target.value)}
                  placeholder="Ej: GTM-XXXXXXX"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-stone-500">
                Permite insertar píxeles de Meta, TikTok, Hotjar y Google Ads sin modificar código.
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: GOOGLE SEARCH CONSOLE & VERIFICACIÓN SEO */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                2. Google Search Console & Indexación Web (SEO)
              </h3>
              <p className="text-xs text-stone-500">
                Verifica la propiedad de gunavibes.com ante Google para aparecer en los primeros resultados de búsqueda.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Código de Verificación HTML / Meta Tag de Search Console:
              </label>
              <input
                type="text"
                value={gSearchConsole}
                onChange={(e) => setGSearchConsole(e.target.value)}
                placeholder="Ej: google-site-verification=abc123XYZ..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0E9AA7]"
              />
              <p className="text-[11px] text-stone-400">
                Se inyectará automáticamente en la etiqueta &lt;head&gt; de todo el sitio.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Token de Verificación Adicional / Google Site Verification:
              </label>
              <input
                type="text"
                value={gSiteVerification}
                onChange={(e) => setGSiteVerification(e.target.value)}
                placeholder="Token alfanumérico o código de verificación"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: GOOGLE PLACES, MAPS & RESEÑAS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
          <div className="flex items-center gap-2.5 border-b border-stone-100 pb-4">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200">
              <Star className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900">
                3. Google Places API & Reseñas de Perfil de Negocio
              </h3>
              <p className="text-xs text-stone-500">
                Muestra la insignia oficial de confianza con 4.9 estrellas y testimonios de clientes verificados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Google Place ID de la Ficha de Negocio:
              </label>
              <input
                type="text"
                value={googlePlaceId}
                onChange={(e) => setGooglePlaceId(e.target.value)}
                placeholder="ChIJ_yZ4W8aFrY8RFY9j3YF98nA"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-700">
                Google Places API Key (Opcional si usa sincronización de caché):
              </label>
              <input
                type="password"
                value={googlePlacesApiKey}
                onChange={(e) => setGooglePlacesApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-white text-xs sm:text-sm font-mono focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>
          </div>
        </div>

        {/* SAVE SUBMIT BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 rounded-2xl bg-[#0E9AA7] hover:bg-[#0c8793] text-white font-extrabold text-sm shadow-lg flex items-center gap-2 transition-all hover:scale-102 cursor-pointer"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Guardar Todas las Herramientas de Google</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
