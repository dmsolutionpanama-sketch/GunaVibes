import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Filter,
  Terminal,
  KeyRound,
  Server,
  Zap,
} from 'lucide-react';

export const SecurityCenterTab: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const loadSecurityData = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminAuditLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error cargando logs de seguridad:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSecurityData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.accion.toLowerCase().includes(filterAction.toLowerCase());
    const matchesSearch =
      log.detalle.toLowerCase().includes(search.toLowerCase()) ||
      log.ip.toLowerCase().includes(search.toLowerCase()) ||
      log.accion.toLowerCase().includes(search.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionBadge = (accion: string) => {
    if (accion.includes('login_exitoso')) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">Login Exitoso</span>;
    }
    if (accion.includes('login_fallido')) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">Login Fallido</span>;
    }
    if (accion.includes('bloqueo_fuerza_bruta') || accion.includes('ataque_bloqueado')) {
      return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-900 border border-red-300">Amenaza Bloqueada</span>;
    }
    return <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">{accion}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Centro de Ciberseguridad & Protección Antihack</span>
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Monitoreo activo de defensas: Rate limiting contra fuerza bruta, trampas Honeypot, URLs ocultas y registro de auditoría.
          </p>
        </div>
        <button
          onClick={loadSecurityData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Telemetría</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Protection Shield */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-500">Estado del Sistema</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-emerald-800">Protegido & Seguro</span>
            <span className="text-xs text-emerald-600 font-semibold block mt-1">0 brechas detectadas</span>
          </div>
        </div>

        {/* Rate Limiting */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-500">Anti Fuerza Bruta</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <Lock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-stone-900">5 intentos / 15 min</span>
            <span className="text-xs text-stone-500 font-semibold block mt-1">Bloqueo temporal automático</span>
          </div>
        </div>

        {/* Honeypot Traps */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-500">Trampas Honeypot</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <EyeOff className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-stone-900">10 Rutas Trampa</span>
            <span className="text-xs text-amber-600 font-semibold block mt-1">wp-admin, .env, xmlrpc...</span>
          </div>
        </div>

        {/* HTTP Headers */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-stone-500">Cabeceras de Blindaje</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black text-purple-900">HSTS + NoSniff + XSS</span>
            <span className="text-xs text-purple-600 font-semibold block mt-1">Headers de grado bancario</span>
          </div>
        </div>
      </div>

      {/* Security Architecture Highlights */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <h3 className="text-base font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-teal-600" />
          <span>Políticas de Seguridad Implementadas</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Protección en Autenticación</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Passwords hasheados con algoritmo Bcrypt (Salt rounds 10), tokens JWT con expiración estricta y protección contra ataques de repetición.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Ocultación & URLs Trampa</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Rutas comunes escaneadas por bots son interceptadas de inmediato, registrando la IP del atacante con código 403 sin revelar arquitectura interna.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-stone-900">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Sanitización & Cabeceras X-Frame</span>
            </div>
            <p className="text-stone-600 leading-relaxed">
              Protección nativa contra Cross-Site Scripting (XSS), Clickjacking (SAMEORIGIN) y bloqueo de sniffing de MIME types.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar en registro de auditoría e IP..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-bold text-stone-600">Filtrar evento:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 bg-white border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
            >
              <option value="all">Todos los eventos</option>
              <option value="login_exitoso">Login Exitoso</option>
              <option value="login_fallido">Login Fallido</option>
              <option value="bloqueo">Bloqueo Fuerza Bruta</option>
              <option value="ataque_bloqueado">Trampa Honeypot</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100/70 border-b border-stone-200 text-[11px] font-extrabold uppercase text-stone-600 tracking-wider">
                <th className="py-3.5 px-4">Fecha & Hora</th>
                <th className="py-3.5 px-4">Tipo de Evento</th>
                <th className="py-3.5 px-4">Detalle de la Operación</th>
                <th className="py-3.5 px-4">IP de Origen</th>
                <th className="py-3.5 px-4">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700 font-medium">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500 font-medium">
                    No hay eventos de seguridad registrados con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                      {new Date(log.creado_en).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">{getActionBadge(log.accion)}</td>
                    <td className="py-3.5 px-4 max-w-md">{log.detalle}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-stone-600">{log.ip}</td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-stone-500">
                      {log.admin_nombre || 'Sistema / Visitante'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
