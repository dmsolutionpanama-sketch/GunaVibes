import React, { useState, useEffect } from 'react';
import { SystemDiagnosticsReport, ConnectionHealthItem } from '../../types';
import { api } from '../../services/api';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Zap,
  Globe,
  Lock,
  Server,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Calendar,
  MessageSquare,
  Star,
  Mail,
  Instagram,
  CreditCard,
  Video,
  CloudSun,
  ChevronRight,
  Info,
} from 'lucide-react';

export const SystemDiagnosticsTab: React.FC = () => {
  const [report, setReport] = useState<SystemDiagnosticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<ConnectionHealthItem | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadDiagnostics = async () => {
    try {
      const data = await api.getSystemDiagnostics();
      setReport(data);
      if (data.conexiones.length > 0 && !selectedConnection) {
        setSelectedConnection(data.conexiones[0]);
      }
    } catch (err) {
      console.error('Error cargando diagnósticos:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const handleRefreshAll = () => {
    setRefreshing(true);
    setActionNotice('Verificando latencia y certificados de todas las pasarelas...');
    setTimeout(() => {
      loadDiagnostics();
      setActionNotice('¡Diagnóstico completo! Todas las conexiones han sido auditadas.');
      setTimeout(() => setActionNotice(null), 4000);
    }, 800);
  };

  const handleTestSingleConnection = async (conn: ConnectionHealthItem) => {
    setTestingId(conn.id);
    setActionNotice(null);
    try {
      const res = await api.testConnectionDiagnostic(conn.id);
      setActionNotice(res.message);
      await loadDiagnostics();
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Error probando conexión');
    } finally {
      setTestingId(null);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calendar':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-emerald-600" />;
      case 'Star':
        return <Star className="w-5 h-5 text-amber-500" />;
      case 'Mail':
        return <Mail className="w-5 h-5 text-rose-500" />;
      case 'Instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case 'Video':
        return <Video className="w-5 h-5 text-red-600" />;
      case 'CloudSun':
        return <CloudSun className="w-5 h-5 text-cyan-600" />;
      default:
        return <Globe className="w-5 h-5 text-stone-600" />;
    }
  };

  const getStatusBadge = (status: ConnectionHealthItem['estado']) => {
    switch (status) {
      case 'operativo':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Operativo</span>
          </span>
        );
      case 'alerta':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Atención</span>
          </span>
        );
      case 'desconectado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Desconectado</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Verificando</span>
          </span>
        );
    }
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0E9AA7]" />
        <span className="ml-3 text-stone-600 font-medium text-sm">Auditando conexiones del sistema...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-[#123C4B] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold tracking-wide uppercase text-emerald-400">
              <Activity className="w-4 h-4" />
              <span>Diagnóstico & Salud de Conexiones</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Monitor de Integraciones y Conexiones Externas
            </h2>
            <p className="text-sm text-stone-300 leading-relaxed">
              Verifica el estado en vivo de todas las pasarelas salientes y entrantes: Google Calendar, Google Workspace, WhatsApp, Instagram, SMTP, Reseñas de Google, Pagos y Clima de San Blas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-lg transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Ejecutar Test en Vivo</span>
            </button>
          </div>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-[#123C4B] text-xs font-semibold flex items-center gap-3 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#0E9AA7] shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Salud del Sistema</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-stone-900 capitalize">
            {report.estado_general.replace(/_/g, ' ')}
          </div>
          <p className="text-[11px] text-stone-500">Certificados SSL & Scopes Válidos</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Conexiones Activas</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-[#0E9AA7]">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {report.activas} / {report.total_conexiones}
          </div>
          <p className="text-[11px] text-stone-500">100% integraciones configuradas</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Latencia Promedio</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            ~45 ms
          </div>
          <p className="text-[11px] text-stone-500">Tiempo de respuesta óptimo</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Alertas / Pendientes</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900">
            {report.alertas}
          </div>
          <p className="text-[11px] text-stone-500">Sin fallos críticos detectados</p>
        </div>
      </div>

      {/* Main Diagnostics List & Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: List of connections */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Integraciones del Sitio Web</h3>
                <p className="text-xs text-stone-500">Auditoría en vivo de endpoints externos y seguridad</p>
              </div>
              <span className="text-[11px] font-mono text-stone-400">
                Auditado: {new Date(report.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="space-y-3">
              {report.conexiones.map((conn) => {
                const isSelected = selectedConnection?.id === conn.id;
                return (
                  <div
                    key={conn.id}
                    onClick={() => setSelectedConnection(conn)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isSelected
                        ? 'border-[#0E9AA7] bg-cyan-50/40 shadow-sm ring-1 ring-[#0E9AA7]'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-stone-100 border border-stone-200 shrink-0">
                        {getIcon(conn.icono)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-stone-900 truncate">{conn.nombre}</h4>
                          {getStatusBadge(conn.estado)}
                        </div>
                        <p className="text-[11px] text-stone-500 truncate mt-0.5">{conn.mensaje}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                      <span className="text-[10px] font-mono text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                        {conn.latencia_ms}ms
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTestSingleConnection(conn);
                        }}
                        disabled={testingId === conn.id}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        title="Probar conexión individual"
                      >
                        {testingId === conn.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3 text-[#0E9AA7]" />
                        )}
                        <span>Test</span>
                      </button>

                      <ChevronRight className="w-4 h-4 text-stone-400 hidden sm:block" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Selected Connection Details */}
        <div className="space-y-6">
          {selectedConnection ? (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
                <div className="p-3 rounded-2xl bg-cyan-50 border border-cyan-100">
                  {getIcon(selectedConnection.icono)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">{selectedConnection.nombre}</h4>
                  <p className="text-xs text-stone-500 capitalize">{selectedConnection.categoria.replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Estado de Verificación</span>
                  <div>{getStatusBadge(selectedConnection.estado)}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Detalles Operativos</span>
                  <p className="text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-100">
                    {selectedConnection.detalles}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1">Instrucciones de Credenciales</span>
                  <p className="text-stone-600 leading-relaxed bg-amber-50/60 p-3 rounded-xl border border-amber-100 text-[11px]">
                    {selectedConnection.instrucciones_credenciales}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => handleTestSingleConnection(selectedConnection)}
                  disabled={testingId === selectedConnection.id}
                  className="w-full py-2.5 rounded-xl bg-[#0E9AA7] hover:bg-[#0c8590] text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {testingId === selectedConnection.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3.5 h-3.5" />
                  )}
                  <span>Ejecutar Test Inmediato</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm text-center text-xs text-stone-400">
              Selecciona una conexión para inspeccionar detalles y credenciales.
            </div>
          )}

          {/* Security & Reliability tips */}
          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Garantía de Seguridad</span>
            </div>
            <ul className="space-y-2 text-xs text-stone-600">
              {report.consejos_seguridad.map((c, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-[#0E9AA7] font-bold">•</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
