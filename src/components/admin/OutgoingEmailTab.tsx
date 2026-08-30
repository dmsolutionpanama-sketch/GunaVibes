import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { EmailConfig } from '../../types';
import {
  Mail,
  Send,
  ShieldCheck,
  Server,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Save,
  Lock,
  FileText,
  HelpCircle,
  Zap,
} from 'lucide-react';

export const OutgoingEmailTab: React.FC = () => {
  const [config, setConfig] = useState<EmailConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Test form state
  const [testEmail, setTestEmail] = useState('');
  const [testSubject, setTestSubject] = useState('Prueba de Conexión SMTP - Guna Yala Explorer');
  const [testBody, setTestBody] = useState('Este es un correo de prueba para verificar la pasarela de salida y envío de links de pago.');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<any | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getEmailConfig();
      setConfig(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar configuración de correo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const updated = await api.updateEmailConfig(config);
      setConfig(updated);
      setSuccessMsg('Configuración de correo saliente guardada exitosamente.');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      setErrorMsg('Ingresa un correo destinatario para la prueba');
      return;
    }

    setTesting(true);
    setTestResult(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.testSendEmail({
        toEmail: testEmail,
        subject: testSubject,
        textBody: testBody,
      });
      setTestResult(res);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar correo de prueba');
    } finally {
      setTesting(false);
    }
  };

  const handleSelectPreset = (preset: 'google' | 'hostinger' | 'sendgrid' | 'custom') => {
    if (!config) return;

    if (preset === 'google') {
      setConfig({
        ...config,
        proveedor: 'google_workspace',
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_secure: false,
        remitente_nombre: config.remitente_nombre || 'Guna Yala Explorer - Reservas Oficiales',
      });
    } else if (preset === 'hostinger') {
      setConfig({
        ...config,
        proveedor: 'servidor_privado_smtp',
        smtp_host: 'smtp.hostinger.com',
        smtp_port: 465,
        smtp_secure: true,
      });
    } else if (preset === 'sendgrid') {
      setConfig({
        ...config,
        proveedor: 'sendgrid_api',
        smtp_host: 'smtp.sendgrid.net',
        smtp_port: 587,
        smtp_secure: false,
      });
    } else {
      setConfig({
        ...config,
        proveedor: 'servidor_privado_smtp',
        smtp_host: 'mail.tudominio.com',
        smtp_port: 587,
        smtp_secure: false,
      });
    }
  };

  if (loading && !config) {
    return (
      <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center">
        <RefreshCw className="w-8 h-8 text-[#0E9AA7] animate-spin mx-auto mb-3" />
        <p className="text-sm font-bold text-stone-600">Cargando pasarela de correo saliente...</p>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 mb-2">
            <Mail className="w-4 h-4 text-[#0E9AA7]" />
            <span>Pasarela SMTP & Notificaciones Transaccionales</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-stone-900">
            Servidor de Correo Saliente (Google & Servidores Privados)
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            Configura las credenciales de correo electrónico para el envío automático de confirmaciones, links de cobro seguros de Yappy / Tarjeta, vouchers de viaje y notificaciones a clientes. Soporta Google Workspace (Gmail App Passwords), servidores SMTP privados (cPanel, Hostinger, VPS) o APIs transaccionales.
          </p>
        </div>

        <button
          onClick={loadConfig}
          disabled={loading}
          className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-all cursor-pointer self-start md:self-auto"
          title="Refrescar configuración"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0E9AA7]' : ''}`} />
        </button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 flex items-center gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Provider Quick Presets */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
        <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500 block mb-3">
          Plantillas Rápidas de Configuración
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleSelectPreset('google')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              config.proveedor === 'google_workspace'
                ? 'border-[#0E9AA7] bg-teal-50/50 ring-2 ring-[#0E9AA7]/30'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-xs font-black text-stone-900 block">Google Workspace / Gmail</span>
            <span className="text-[11px] text-stone-500">smtp.gmail.com:587</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('hostinger')}
            className="p-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-left transition-all cursor-pointer"
          >
            <span className="text-xs font-black text-stone-900 block">Hostinger / cPanel</span>
            <span className="text-[11px] text-stone-500">smtp.hostinger.com:465</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('sendgrid')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              config.proveedor === 'sendgrid_api'
                ? 'border-[#0E9AA7] bg-teal-50/50 ring-2 ring-[#0E9AA7]/30'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-xs font-black text-stone-900 block">SendGrid / Mailgun</span>
            <span className="text-[11px] text-stone-500">smtp.sendgrid.net:587</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPreset('custom')}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              config.proveedor === 'servidor_privado_smtp'
                ? 'border-[#0E9AA7] bg-teal-50/50 ring-2 ring-[#0E9AA7]/30'
                : 'border-stone-200 hover:bg-stone-50'
            }`}
          >
            <span className="text-xs font-black text-stone-900 block">Servidor Privado SMTP</span>
            <span className="text-[11px] text-stone-500">Host propio / VPS</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Server Settings (Left 2 cols) & Live Test Sender (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Settings */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Server className="w-5 h-5 text-[#0E9AA7]" />
            <h3 className="text-lg font-black text-stone-900">Parámetros de Conexión SMTP</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Host */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Servidor SMTP (Host) *
              </label>
              <input
                type="text"
                required
                value={config.smtp_host}
                onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* Port */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Puerto SMTP *
              </label>
              <input
                type="number"
                required
                value={config.smtp_port}
                onChange={(e) => setConfig({ ...config, smtp_port: Number(e.target.value) })}
                placeholder="587 ó 465"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* User */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Usuario / Correo Autenticación *
              </label>
              <input
                type="text"
                required
                value={config.smtp_user}
                onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
                placeholder="reservas@gunayalaexplorer.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5 flex items-center justify-between">
                <span>Contraseña / App Password *</span>
                <span className="text-[10px] text-stone-400">Protegido por hash</span>
              </label>
              <input
                type="password"
                required
                value={config.smtp_pass}
                onChange={(e) => setConfig({ ...config, smtp_pass: e.target.value })}
                placeholder="••••••••••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white font-mono"
              />
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Nombre del Remitente
              </label>
              <input
                type="text"
                value={config.remitente_nombre}
                onChange={(e) => setConfig({ ...config, remitente_nombre: e.target.value })}
                placeholder="Guna Yala Explorer - Reservas Oficiales"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* From Email */}
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Correo Remitente (From)
              </label>
              <input
                type="email"
                value={config.remitente_correo}
                onChange={(e) => setConfig({ ...config, remitente_correo: e.target.value })}
                placeholder="reservas@gunayalaexplorer.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* Reply-To */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Responder a (Reply-To)
              </label>
              <input
                type="email"
                value={config.reply_to || ''}
                onChange={(e) => setConfig({ ...config, reply_to: e.target.value })}
                placeholder="info@gunayalaexplorer.com"
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>

            {/* TLS Switch */}
            <div className="sm:col-span-2 p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-teal-700" />
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Conexión Segura SSL / TLS
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Activar para puerto 465 (SSL directo). Desactivar para puerto 587 con STARTTLS.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                id="smtp-secure"
                checked={config.smtp_secure}
                onChange={(e) => setConfig({ ...config, smtp_secure: e.target.checked })}
                className="w-5 h-5 text-[#0E9AA7] rounded cursor-pointer"
              />
            </div>

            {/* Signature & Disclaimer */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1.5">
                Firma Automática al Pie de Correo
              </label>
              <textarea
                rows={3}
                value={config.firma_pie_pagina || ''}
                onChange={(e) => setConfig({ ...config, firma_pie_pagina: e.target.value })}
                placeholder="Guna Yala Explorer - Turismo Comunitario Sostenible..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 rounded-xl bg-[#0E9AA7] hover:bg-[#0c828d] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Configuración SMTP'}</span>
            </button>
          </div>
        </form>

        {/* Live Test Sender & Connection Status */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-stone-900">Probar Envío en Vivo</h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Live Gateway
              </span>
            </div>

            <p className="text-xs text-stone-600 mb-4">
              Envía un correo de prueba instantáneo para comprobar que las credenciales SMTP, puertos y certificados TLS están funcionando al 100%.
            </p>

            <form onSubmit={handleTestSend} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Correo Destinatario de Prueba *
                </label>
                <input
                  type="email"
                  required
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="tu_correo@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  value={testSubject}
                  onChange={(e) => setTestSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Mensaje
                </label>
                <textarea
                  rows={3}
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
                />
              </div>

              <button
                type="submit"
                disabled={testing}
                className="w-full py-3 rounded-xl bg-stone-900 hover:bg-black text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-amber-400" />
                <span>{testing ? 'Verificando y enviando...' : 'Enviar Correo de Prueba'}</span>
              </button>
            </form>

            {testResult && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resultado: {testResult.message}</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  <span>ID de Mensaje: </span>
                  <span className="font-mono">{testResult.log?.id_mensaje || 'OK-200'}</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  <span>Fecha: </span>
                  <span>{new Date(testResult.log?.fecha_envio).toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200 text-[11px] text-stone-600 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-stone-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Google Workspace:</strong> Recuerda activar "Contraseñas de aplicaciones" en tu cuenta de Google si tienes activada la verificación en dos pasos.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
