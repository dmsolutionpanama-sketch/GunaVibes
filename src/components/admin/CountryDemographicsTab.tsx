import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CountryDemographicsResponse, CountryDemographicsFilter } from '../../types';
import {
  Globe,
  Calendar,
  Search,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Megaphone,
  Download,
  Filter,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  BarChart3,
  Award,
  Compass,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

export const CountryDemographicsTab: React.FC = () => {
  const [data, setData] = useState<CountryDemographicsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [tipoFiltro, setTipoFiltro] = useState<'todo' | 'dia' | 'mes' | 'ano' | 'personalizado'>('todo');
  const [selectedFecha, setSelectedFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedMes, setSelectedMes] = useState<number>(new Date().getMonth() + 1);
  const [selectedAno, setSelectedAno] = useState<number>(new Date().getFullYear());
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadDemographics = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: CountryDemographicsFilter = {
        tipoFiltro,
        fecha: tipoFiltro === 'dia' ? selectedFecha : undefined,
        mes: tipoFiltro === 'mes' ? selectedMes : undefined,
        ano: tipoFiltro === 'mes' || tipoFiltro === 'ano' ? selectedAno : undefined,
        fechaInicio: tipoFiltro === 'personalizado' ? fechaInicio : undefined,
        fechaFin: tipoFiltro === 'personalizado' ? fechaFin : undefined,
      };

      const res = await api.getCountryDemographics(filter);
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas por país');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDemographics();
  }, [tipoFiltro, selectedFecha, selectedMes, selectedAno, fechaInicio, fechaFin]);

  const filteredCountries = data?.rankingPaises.filter(c =>
    c.pais.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 text-base">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 mb-2">
            <Globe className="w-4 h-4 text-[#0E9AA7]" />
            <span>Inteligencia de Mercado & Origen Geográfico de Turistas</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-heading text-stone-900">
            Demografía por País de Procedencia & Gestión de Pauta
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-1 max-w-4xl leading-relaxed">
            Monitorea el país de origen declarado en cada reserva e interacción de viaje por día, mes, año o rango de fechas. Optimiza la inversión en anuncios (Google Ads & Meta) dirigidos con precisión a los países con mayor volumen y tasa de conversión.
          </p>
        </div>

        <button
          onClick={loadDemographics}
          disabled={loading}
          className="p-3 rounded-2xl border border-stone-200 hover:bg-stone-50 text-stone-700 transition-all cursor-pointer self-start md:self-auto shadow-xs flex items-center gap-2 text-sm font-bold"
          title="Refrescar datos"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0E9AA7]' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Filter Toolbar with Calendar & Time Scope */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Scope selector buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase text-stone-500 mr-1 flex items-center gap-1">
              <Filter className="w-4 h-4" />
              <span>Ver por:</span>
            </span>

            <button
              onClick={() => setTipoFiltro('todo')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipoFiltro === 'todo'
                  ? 'bg-[#0E9AA7] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Histórico Global
            </button>

            <button
              onClick={() => setTipoFiltro('dia')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipoFiltro === 'dia'
                  ? 'bg-[#0E9AA7] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Por Día
            </button>

            <button
              onClick={() => setTipoFiltro('mes')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipoFiltro === 'mes'
                  ? 'bg-[#0E9AA7] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Por Mes
            </button>

            <button
              onClick={() => setTipoFiltro('ano')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipoFiltro === 'ano'
                  ? 'bg-[#0E9AA7] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Por Año
            </button>

            <button
              onClick={() => setTipoFiltro('personalizado')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                tipoFiltro === 'personalizado'
                  ? 'bg-[#0E9AA7] text-white shadow-sm'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Rango de Fechas
            </button>
          </div>

          {/* Search by Country Name */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar país en el ranking..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>
        </div>

        {/* Conditional Date Pickers based on Scope */}
        {tipoFiltro === 'dia' && (
          <div className="pt-3 border-t border-stone-100 flex items-center gap-3 animate-fadeIn">
            <Calendar className="w-4 h-4 text-[#0E9AA7]" />
            <label className="text-xs sm:text-sm font-bold text-stone-700">Selecciona el día a consultar:</label>
            <input
              type="date"
              value={selectedFecha}
              onChange={(e) => setSelectedFecha(e.target.value)}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            />
          </div>
        )}

        {tipoFiltro === 'mes' && (
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3 animate-fadeIn">
            <Calendar className="w-4 h-4 text-[#0E9AA7]" />
            <label className="text-xs sm:text-sm font-bold text-stone-700">Mes y Año:</label>
            <select
              value={selectedMes}
              onChange={(e) => setSelectedMes(Number(e.target.value))}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            >
              {[
                { m: 1, n: 'Enero' }, { m: 2, n: 'Febrero' }, { m: 3, n: 'Marzo' },
                { m: 4, n: 'Abril' }, { m: 5, n: 'Mayo' }, { m: 6, n: 'Junio' },
                { m: 7, n: 'Julio' }, { m: 8, n: 'Agosto' }, { m: 9, n: 'Septiembre' },
                { m: 10, n: 'Octubre' }, { m: 11, n: 'Noviembre' }, { m: 12, n: 'Diciembre' },
              ].map(x => (
                <option key={x.m} value={x.m}>{x.n}</option>
              ))}
            </select>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(Number(e.target.value))}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {tipoFiltro === 'ano' && (
          <div className="pt-3 border-t border-stone-100 flex items-center gap-3 animate-fadeIn">
            <Calendar className="w-4 h-4 text-[#0E9AA7]" />
            <label className="text-xs sm:text-sm font-bold text-stone-700">Año:</label>
            <select
              value={selectedAno}
              onChange={(e) => setSelectedAno(Number(e.target.value))}
              className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
            >
              {[2024, 2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        )}

        {tipoFiltro === 'personalizado' && (
          <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center gap-3 animate-fadeIn">
            <Calendar className="w-4 h-4 text-[#0E9AA7]" />
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-bold text-stone-700">Desde:</label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm font-bold text-stone-700">Hasta:</label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="px-3.5 py-1.5 text-xs sm:text-sm rounded-xl border border-stone-300 bg-white font-bold text-stone-900"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">País Líder</span>
            <div className="p-2.5 rounded-xl bg-teal-50 text-[#0E9AA7]">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-stone-900">{data?.resumen.paisLider || 'Panamá'}</div>
          <div className="text-xs text-stone-500 mt-1">{data?.resumen.totalPaises || 0} países registrados</div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Pasajeros (PAX)</span>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-900">{data?.resumen.totalViajeros || 0}</div>
          <div className="text-xs text-stone-500 mt-1">Personas transportadas</div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Intenciones / Leads</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-800">{data?.resumen.leadsTotales || 0}</div>
          <div className="text-xs text-stone-500 mt-1">Interacciones de viaje</div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">Ingresos Totales</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800">${data?.resumen.ingresosTotales || 0}</div>
          <div className="text-xs text-stone-500 mt-1">Mayor ticket: {data?.resumen.paisMayorTicket}</div>
        </div>
      </div>

      {/* Main Country Ranking & Demographics Table */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-[#0E9AA7]" />
            <div>
              <h3 className="text-lg sm:text-xl font-black text-stone-900">
                Desglose de Reservas, Pasajeros y Conversión por País
              </h3>
              <p className="text-xs sm:text-sm text-stone-500">
                Período consultado: <span className="font-bold text-stone-800">{data?.periodo.etiqueta || 'Histórico'}</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {filteredCountries.length} {filteredCountries.length === 1 ? 'país detectado' : 'países detectados'}
          </span>
        </div>

        {filteredCountries.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-sm">
            No se encontraron registros de países para los filtros seleccionados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500 font-extrabold uppercase tracking-wider bg-stone-50/70 text-xs">
                  <th className="py-3.5 px-4 rounded-l-xl">País de Procedencia</th>
                  <th className="py-3.5 px-4 text-center">Reservas</th>
                  <th className="py-3.5 px-4 text-center">% del Total</th>
                  <th className="py-3.5 px-4 text-center">Pasajeros (PAX)</th>
                  <th className="py-3.5 px-4 text-center">Intención / Leads</th>
                  <th className="py-3.5 px-4 text-center">Tasa Conversión</th>
                  <th className="py-3.5 px-4 text-right rounded-r-xl">Ingresos Pagados</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCountries.map((c, idx) => {
                  const isTop = idx < 3;
                  return (
                    <tr key={c.pais} className="hover:bg-stone-50/80 transition-colors font-medium">
                      <td className="py-4 px-4 font-bold text-stone-900 flex items-center gap-3">
                        <span className="text-2xl">{c.bandera_emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-stone-900 font-extrabold">{c.pais}</span>
                            {isTop && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase">
                                Top {idx + 1}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-stone-400 font-mono">{c.codigo_pais} • Idioma: {c.idioma_principal.toUpperCase()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-stone-800 text-base">
                        {c.totalReservas}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-2 font-bold text-stone-700">
                          <span>{c.porcentajeDelTotal}%</span>
                          <div className="w-14 bg-stone-100 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-[#0E9AA7] h-full rounded-full"
                              style={{ width: `${Math.min(100, c.porcentajeDelTotal)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-stone-800 text-base">
                        {c.totalPersonas}
                      </td>
                      <td className="py-4 px-4 text-center font-semibold text-stone-600">
                        {c.leadsInteres}
                      </td>
                      <td className="py-4 px-4 text-center font-black text-emerald-700">
                        {c.tasaConversion}%
                      </td>
                      <td className="py-4 px-4 text-right font-black text-stone-900 text-base">
                        ${c.montoTotalPagado} USD
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Advertising & Marketing Strategies by Country (Pauta Publicitaria) */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
          <div className="p-3 rounded-2xl bg-amber-50 text-amber-700">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-stone-900">
              Estrategia de Pauta Digital y Publicidad Sugerida por Mercado
            </h3>
            <p className="text-xs sm:text-sm text-stone-500">
              Segmentación accionable en Google Ads & Meta Ads basada en la procedencia real de tus clientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data?.paisesTopPublicidad.map((tip, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl border border-stone-200 bg-stone-50/60 flex flex-col justify-between space-y-4 hover:border-teal-300 transition-all shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-black text-stone-900 text-base flex items-center gap-2">
                    <span>{tip.pais}</span>
                  </h4>
                  <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                    {tip.retornoEstimado}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-stone-700 font-medium mb-4 leading-relaxed">
                  {tip.recomendacion}
                </p>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-white border border-stone-200/90 text-xs text-stone-700">
                    <span className="font-bold text-stone-900 block uppercase tracking-wider text-[10px] text-teal-800 mb-0.5">
                      Canal Óptimo:
                    </span>
                    <p className="font-semibold">{tip.canalOptimo}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-stone-200/90 text-xs text-stone-700">
                    <span className="font-bold text-stone-900 block uppercase tracking-wider text-[10px] text-teal-800 mb-0.5">
                      Público Objetivo:
                    </span>
                    <p>{tip.publicoObjetivo}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-stone-200">
                <span className="text-stone-500 font-medium">Prioridad de Campaña:</span>
                <span className="font-black text-emerald-700 uppercase tracking-wider">
                  🔥 Alta Rentabilidad
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
