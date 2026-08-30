import React, { useState, useEffect } from 'react';
import { RegisteredClient } from '../../types';
import { api } from '../../services/api';
import {
  Users,
  Mail,
  Phone,
  Globe,
  Radio,
  CheckCircle2,
  Copy,
  Loader2,
} from 'lucide-react';

export const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<RegisteredClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      try {
        const data = await api.getAdminClients();
        setLeads(data);
      } catch (e) {
        console.error('Error cargando leads:', e);
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, []);

  const handleCopyEmails = () => {
    const emailList = leads.map(l => l.correo).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0E9AA7]" />
            <h3 className="text-base font-bold text-stone-900">
              Clientes Registrados y Suscriptores de Alertas ({leads.length})
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Usuarios que solicitaron notificaciones de YouTube Live y promociones de pasadías.
          </p>
        </div>

        <button
          onClick={handleCopyEmails}
          className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>{copied ? '¡Copiados al portapapeles!' : 'Copiar Todos los Correos'}</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">País</th>
                <th className="py-3.5 px-4">Idioma</th>
                <th className="py-3.5 px-4">Alertas En Vivo</th>
                <th className="py-3.5 px-4">Fecha Registro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando suscriptores...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    No hay clientes registrados aún.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-400">#{lead.id}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900">{lead.nombre_completo}</td>
                    <td className="py-3.5 px-4 text-stone-700 font-medium">{lead.correo}</td>
                    <td className="py-3.5 px-4 text-stone-500">{lead.telefono || '—'}</td>
                    <td className="py-3.5 px-4 text-stone-700">{lead.pais_procedencia || 'Panamá'}</td>
                    <td className="py-3.5 px-4 uppercase font-semibold text-stone-500">{lead.idioma_preferido}</td>
                    <td className="py-3.5 px-4">
                      {lead.acepta_notificaciones ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Activo
                        </span>
                      ) : (
                        <span className="text-stone-400 text-[11px]">Baja</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px]">
                      {new Date(lead.creado_en).toLocaleDateString()}
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
