import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  Palette,
  Settings,
  Phone,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Users,
  Shield,
  Link,
  Plus,
  Trash2,
  Sparkles,
  History,
  RotateCcw,
  Loader2,
} from 'lucide-react';

const PRESET_THEMES = [
  {
    name: 'Guna Vibes Crema Original',
    bgColor: '#F5EFE6',
    primaryColor: '#0E9AA7',
    secondaryColor: '#E8622C',
    accentColor: '#F2B705',
    textColor: '#123C4B',
  },
  {
    name: 'Caribe Arena Suave',
    bgColor: '#FAF6EE',
    primaryColor: '#00838F',
    secondaryColor: '#FF6F00',
    accentColor: '#FFD54F',
    textColor: '#004D40',
  },
  {
    name: 'Marfil Cálido & Sol',
    bgColor: '#FCF9F2',
    primaryColor: '#0288D1',
    secondaryColor: '#D84315',
    accentColor: '#FBC02D',
    textColor: '#263238',
  },
  {
    name: 'Blanco Moderno Puro',
    bgColor: '#FFFFFF',
    primaryColor: '#0E9AA7',
    secondaryColor: '#E8622C',
    accentColor: '#F2B705',
    textColor: '#1E293B',
  },
];

export const SettingsTab: React.FC = () => {
  const { theme, config, updateTheme, updateConfig } = useTheme();

  // Color state
  const [bgColor, setBgColor] = useState(theme.bgColor || '#F5EFE6');
  const [primaryColor, setPrimaryColor] = useState(theme.primaryColor || '#0E9AA7');
  const [secondaryColor, setSecondaryColor] = useState(theme.secondaryColor || '#E8622C');
  const [accentColor, setAccentColor] = useState(theme.accentColor || '#F2B705');
  const [textColor, setTextColor] = useState(theme.textColor || '#123C4B');

  // General settings state
  const [nombreEmpresa, setNombreEmpresa] = useState(config?.nombre_empresa || 'Guna Vibes');
  const [cupoMaximo, setCupoMaximo] = useState(config?.cupo_maximo_dia || 14);
  const [telefono, setTelefono] = useState(config?.telefono_contacto || '+507 6369-1775');
  const [correo, setCorreo] = useState(config?.correo_contacto || 'info@gunavibes.com');
  const [whatsapp, setWhatsapp] = useState(config?.whatsapp || '+507 6369-1775');
  const [direccion, setDireccion] = useState(config?.direccion || 'Calle Primera, casa 36, Urb. Nueva Barriada, Tocumen. Panamá');

  // External links
  const [externalLinks, setExternalLinks] = useState(config?.enlaces_externos_menu || []);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (config) {
      setNombreEmpresa(config.nombre_empresa);
      setCupoMaximo(config.cupo_maximo_dia);
      setTelefono(config.telefono_contacto);
      setCorreo(config.correo_contacto);
      setWhatsapp(config.whatsapp);
      setDireccion(config.direccion);
      setExternalLinks(config.enlaces_externos_menu || []);
    }
  }, [config]);

  useEffect(() => {
    if (theme) {
      setBgColor(theme.bgColor);
      setPrimaryColor(theme.primaryColor);
      setSecondaryColor(theme.secondaryColor);
      setAccentColor(theme.accentColor);
      setTextColor(theme.textColor);
    }
  }, [theme]);

  // Load audit logs
  useEffect(() => {
    const fetchLogs = async () => {
      setLoadingLogs(true);
      try {
        const logs = await api.getAuditLogs();
        setAuditLogs(logs);
      } catch (err) {
        console.error('Error cargando bitácora de auditoría:', err);
      } finally {
        setLoadingLogs(false);
      }
    };
    fetchLogs();
  }, []);

  const handleApplyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setBgColor(preset.bgColor);
    setPrimaryColor(preset.primaryColor);
    setSecondaryColor(preset.secondaryColor);
    setAccentColor(preset.accentColor);
    setTextColor(preset.textColor);
    // Instant live preview
    updateTheme({
      bgColor: preset.bgColor,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      accentColor: preset.accentColor,
      textColor: preset.textColor,
    });
  };

  const handleLiveColorChange = (type: string, value: string) => {
    if (type === 'bg') {
      setBgColor(value);
      updateTheme({ bgColor: value });
    } else if (type === 'primary') {
      setPrimaryColor(value);
      updateTheme({ primaryColor: value });
    } else if (type === 'secondary') {
      setSecondaryColor(value);
      updateTheme({ secondaryColor: value });
    } else if (type === 'accent') {
      setAccentColor(value);
      updateTheme({ accentColor: value });
    } else if (type === 'text') {
      setTextColor(value);
      updateTheme({ textColor: value });
    }
  };

  const handleAddExternalLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    setExternalLinks([...externalLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }]);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveExternalLink = (index: number) => {
    setExternalLinks(externalLinks.filter((_, i) => i !== index));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update theme in backend
      await updateTheme({
        bgColor,
        primaryColor,
        secondaryColor,
        accentColor,
        textColor,
      });

      // 2. Update general config in backend
      await updateConfig({
        nombre_empresa: nombreEmpresa,
        cupo_maximo_dia: Number(cupoMaximo),
        telefono_contacto: telefono,
        correo_contacto: correo,
        whatsapp,
        direccion,
        enlaces_externos_menu: externalLinks,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // Refresh logs
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
    } catch (err: any) {
      alert(err.message || 'Error guardando ajustes en el backend');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* SUCCESS BANNER */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-semibold flex items-center gap-2 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>
            ¡Configuración y tema guardados en el Backend con éxito! Los cambios se aplican a todos los usuarios.
          </span>
        </div>
      )}

      {/* 1. THEME & COLOR PALETTE EDITOR (BACKEND-CONTROLLED FRONTEND COLOR) */}
      <div
        id="backend-theme-editor-card"
        className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-amber-900 bg-amber-100/80 mb-1">
              <Palette className="w-3.5 h-3.5 text-amber-700" />
              <span>Personalización Visual Centralizada</span>
            </div>
            <h3 className="text-xl font-bold font-heading text-stone-900">
              Color del Fondo y Paleta Visual (Control desde el Backend)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Por requerimiento: Fondo color crema (#F5EFE6) modificable en tiempo real desde el backend.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-400 font-medium">Previsualización en vivo:</span>
            <div
              className="w-8 h-8 rounded-full border-2 border-stone-400 shadow-inner"
              style={{ backgroundColor: bgColor }}
              title={`Fondo: ${bgColor}`}
            />
          </div>
        </div>

        {/* Quick Palette Presets */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
            Paletas Rápidas Predefinidas
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_THEMES.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className="p-3 rounded-2xl border border-stone-200 hover:border-teal-500 hover:shadow-md transition-all text-left space-y-2 bg-stone-50/50 cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{preset.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.bgColor }} title="Fondo" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.primaryColor }} title="Primario" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.secondaryColor }} title="Secundario" />
                  <div className="w-5 h-5 rounded-full border border-stone-300 shadow-sm" style={{ backgroundColor: preset.accentColor }} title="Acento" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Individual Color Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          
          {/* Background Color (Crema) */}
          <div className="p-4 rounded-2xl bg-amber-50/40 border-2 border-amber-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-900">
              Color de Fondo (Web) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={bgColor}
                onChange={(e) => handleLiveColorChange('bg', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={bgColor}
                onChange={(e) => handleLiveColorChange('bg', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-amber-800 font-medium">Default: #F5EFE6 (Crema)</p>
          </div>

          {/* Primary Color (Turquoise) */}
          <div className="p-4 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-900">
              Color Primario (Turquesa)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => handleLiveColorChange('primary', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => handleLiveColorChange('primary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-teal-700">Navbar, Iconos, Botones</p>
          </div>

          {/* Secondary Color (Coral) */}
          <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-orange-900">
              Color Secundario (Coral)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => handleLiveColorChange('secondary', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => handleLiveColorChange('secondary', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-orange-700">Botón de Reserva, CTAs</p>
          </div>

          {/* Accent Color (Yellow) */}
          <div className="p-4 rounded-2xl bg-yellow-50/40 border border-yellow-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-yellow-900">
              Color de Acento (Amarillo)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleLiveColorChange('accent', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => handleLiveColorChange('accent', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-yellow-700">Estrellas, Badges</p>
          </div>

          {/* Text Color (Navy) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-900">
              Color Texto Principal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => handleLiveColorChange('text', e.target.value)}
                className="w-10 h-10 rounded-xl border border-stone-300 cursor-pointer p-0.5"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => handleLiveColorChange('text', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs font-mono font-bold uppercase"
              />
            </div>
            <p className="text-[10px] text-slate-600">Footer, Encabezados</p>
          </div>
        </div>
      </div>

      {/* 2. GENERAL SETTINGS & CAPACITY LIMIT */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-6">
        <h3 className="text-xl font-bold font-heading text-stone-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#0E9AA7]" />
          <span>Información de la Empresa y Cupos Diarios</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Company Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Nombre de la Empresa
            </label>
            <input
              type="text"
              value={nombreEmpresa}
              onChange={(e) => setNombreEmpresa(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Daily Quota Limit */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0E9AA7]" />
              <span>Límite de Cupos Diarios (Default: 14) *</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              required
              value={cupoMaximo}
              onChange={(e) => setCupoMaximo(parseInt(e.target.value, 10) || 14)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:ring-2 focus:ring-[#0E9AA7]"
            />
            <p className="text-[11px] text-stone-400 mt-1">El motor de reservas bloqueará solicitudes que excedan este número por fecha.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Teléfono de Contacto
            </label>
            <input
              type="text"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Correo Electrónico de Contacto
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Número de WhatsApp
            </label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Dirección Física
            </label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>
        </div>
      </div>

      {/* 3. EXTERNAL MENU LINKS (ADD LINKS TO TOP HEADER) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
        <h3 className="text-lg font-bold font-heading text-stone-900 flex items-center gap-2">
          <Link className="w-5 h-5 text-[#0E9AA7]" />
          <span>Enlaces Externos Personalizados en el Menú Superior</span>
        </h3>
        <p className="text-xs text-stone-500">
          Permite agregar accesos directos a carpetas internas, sistemas de gestión o páginas de interés.
        </p>

        {/* Links list */}
        <div className="space-y-2">
          {externalLinks.map((link, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs">
              <div>
                <strong className="text-stone-900 font-semibold">{link.label}</strong>
                <span className="text-stone-400 font-mono ml-2 truncate max-w-xs">{link.url}</span>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveExternalLink(idx)}
                className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Add link form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <input
            type="text"
            placeholder="Título (Ej. Recursos Internos)"
            value={newLinkLabel}
            onChange={(e) => setNewLinkLabel(e.target.value)}
            className="w-full sm:w-1/3 px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
          />
          <input
            type="url"
            placeholder="URL (https://...)"
            value={newLinkUrl}
            onChange={(e) => setNewLinkUrl(e.target.value)}
            className="w-full sm:w-1/2 px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
          />
          <button
            type="button"
            onClick={handleAddExternalLink}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar</span>
          </button>
        </div>
      </div>

      {/* SAVE ALL BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-8 py-4 rounded-2xl font-bold text-white shadow-xl flex items-center gap-2.5 text-sm cursor-pointer hover:scale-102 active:scale-98 transition-all"
          style={{ backgroundColor: secondaryColor }}
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Guardar Todos los Ajustes y Colores en Backend</span>
        </button>
      </div>

      {/* 4. AUDIT LOGS (BITÁCORA DE ACCIONES) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <h4 className="text-sm font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
            <History className="w-4 h-4 text-[#0E9AA7]" />
            <span>Bitácora de Auditoría del Sistema ({auditLogs.length})</span>
          </h4>
          <span className="text-[11px] text-stone-400">Registra inicios de sesión, cambios de estado y envíos</span>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto divide-y divide-stone-100 text-xs">
          {loadingLogs ? (
            <p className="text-stone-400 italic py-4">Cargando registros...</p>
          ) : auditLogs.length === 0 ? (
            <p className="text-stone-400 italic py-4">No hay registros de auditoría aún.</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="pt-2 flex items-center justify-between text-stone-600">
                <div className="space-x-2">
                  <span className="font-bold text-stone-900 font-mono text-[11px] bg-stone-100 px-1.5 py-0.5 rounded">
                    {log.accion}
                  </span>
                  <span>{log.detalles}</span>
                </div>
                <div className="text-[11px] text-stone-400">
                  {new Date(log.creado_en).toLocaleString()} • {log.ip}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
