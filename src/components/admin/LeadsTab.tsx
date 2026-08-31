import React, { useState, useEffect } from 'react';
import { RegisteredClient, PackageSanBlas } from '../../types';
import { api } from '../../services/api';
import { NewLeadModal } from './NewLeadModal';
import { LeadDetailModal } from './LeadDetailModal';
import {
  Users,
  Mail,
  Phone,
  Globe,
  Radio,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Search,
  Filter,
  MessageCircle,
  Edit3,
} from 'lucide-react';

export const LeadsTab: React.FC = () => {
  const [leads, setLeads] = useState<RegisteredClient[]>([]);
  const [packages, setPackages] = useState<PackageSanBlas[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<RegisteredClient | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clientData, pkgData] = await Promise.all([
        api.getAdminClients(),
        api.getPackages(),
      ]);
      setLeads(clientData || []);
      setPackages(pkgData || []);
    } catch (e) {
      console.error('Error cargando leads:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCopyEmails = () => {
    const emailList = leads.map(l => l.correo).join(', ');
    navigator.clipboard.writeText(emailList);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLeads = leads.filter(
    (l) =>
      l.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
      l.correo.toLowerCase().includes(search.toLowerCase()) ||
      l.telefono.toLowerCase().includes(search.toLowerCase()) ||
      (l.pais_procedencia || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#0E9AA7]" />
            <h3 className="text-lg font-bold font-heading text-stone-900">
              Directorio de Clientes & Prospectos ({leads.length})
            </h3>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Base de datos completa de clientes registrados, prospectos de pauta y suscriptores.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#E8622C] hover:bg-[#D45320] text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm hover:scale-102 active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrar Lead Interno</span>
          </button>

          <button
            onClick={handleCopyEmails}
            className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? '¡Copiados al portapapeles!' : 'Copiar Todos los Correos'}</span>
          </button>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden space-y-0">
        
        {/* Search */}
        <div className="p-4 border-b border-stone-200 bg-stone-50/70">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente por nombre, correo, país o teléfono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100/80 border-b border-stone-200 text-stone-600 font-extrabold uppercase text-[11px] tracking-wider">
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Nombre Completo</th>
                <th className="py-3.5 px-4">Correo Electrónico</th>
                <th className="py-3.5 px-4">Teléfono</th>
                <th className="py-3.5 px-4">País</th>
                <th className="py-3.5 px-4">Canal Origen</th>
                <th className="py-3.5 px-4">Fase Embudo</th>
                <th className="py-3.5 px-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Cargando directorio de clientes...
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-stone-400 italic">
                    No se encontraron clientes registrados.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="hover:bg-stone-50 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-400">#{lead.id}</td>
                    <td className="py-3.5 px-4 font-bold text-stone-900 group-hover:text-teal-700">
                      {lead.nombre_completo}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700">{lead.correo}</td>
                    <td className="py-3.5 px-4 text-stone-500">{lead.telefono || '—'}</td>
                    <td className="py-3.5 px-4 text-stone-700">{lead.pais_procedencia || 'Panamá'}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-100 text-stone-700 uppercase">
                        {lead.origen_captacion || 'Web'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                        {lead.estado_embudo || 'Intención'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedLead(lead)}
                        className="px-3 py-1 rounded-xl bg-stone-100 hover:bg-[#123C4B] hover:text-white text-stone-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ml-auto"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Ficha</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <NewLeadModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onLeadCreated={(newLead) => {
          setLeads((prev) => [newLead, ...prev]);
        }}
        packages={packages}
      />

      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onLeadUpdated={(up) => {
          setLeads((prev) => prev.map((l) => (l.id === up.id ? up : l)));
          setSelectedLead(up);
        }}
        onLeadDeleted={(id) => {
          setLeads((prev) => prev.filter((l) => l.id !== id));
          setSelectedLead(null);
        }}
      />

    </div>
  );
};
