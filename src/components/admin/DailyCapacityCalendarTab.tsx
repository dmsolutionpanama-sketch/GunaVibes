import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DailyCalendarCapacity } from '../../types';
import {
  Calendar as CalendarIcon,
  Users,
  ShieldAlert,
  Save,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Info,
  Car,
  Clock,
  Layers,
} from 'lucide-react';

export const DailyCapacityCalendarTab: React.FC = () => {
  const [capacities, setCapacities] = useState<DailyCalendarCapacity[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Month navigation
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Selected date for quick edit form
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [cuposInput, setCuposInput] = useState<number>(14);
  const [bloqueadoInput, setBloqueadoInput] = useState<boolean>(false);
  const [motivoInput, setMotivoInput] = useState<string>('');

  // Bulk modal / range selection
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStart, setBulkStart] = useState('');
  const [bulkEnd, setBulkEnd] = useState('');
  const [bulkCupos, setBulkCupos] = useState<number>(14);
  const [bulkBloqueado, setBulkBloqueado] = useState(false);
  const [bulkMotivo, setBulkMotivo] = useState('');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const data = await api.getCalendarCapacities(monthPrefix);
      setCapacities(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cargar cupos del calendario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [monthPrefix]);

  // When selected date changes, populate input form
  useEffect(() => {
    const override = capacities.find(c => c.fecha === selectedDate);
    if (override) {
      setCuposInput(override.cupos_totales);
      setBloqueadoInput(override.bloqueado);
      setMotivoInput(override.motivo_bloqueo || '');
    } else {
      setCuposInput(14); // Default 2 vehicles x 7 pax
      setBloqueadoInput(false);
      setMotivoInput('');
    }
  }, [selectedDate, capacities]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api.setCalendarCapacity({
        fecha: selectedDate,
        cupos_totales: Number(cuposInput),
        bloqueado: bloqueadoInput,
        motivo_bloqueo: motivoInput.trim(),
      });
      setSuccessMsg(`Cupo ajustado exitosamente para el día ${selectedDate}`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al guardar cupo');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = async (fecha: string) => {
    if (!confirm(`¿Restaurar cupo por defecto (14 personas) para el día ${fecha}?`)) return;
    setSaving(true);
    try {
      await api.deleteCalendarCapacity(fecha);
      setSuccessMsg(`Fecha ${fecha} restaurada a los valores predeterminados.`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al restaurar');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyBulk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStart || !bulkEnd) {
      setErrorMsg('Selecciona fecha inicio y fecha fin para la edición masiva');
      return;
    }
    if (bulkStart > bulkEnd) {
      setErrorMsg('La fecha inicio no puede ser posterior a la fecha fin');
      return;
    }

    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const datesList: string[] = [];
    const cur = new Date(bulkStart + 'T00:00:00');
    const end = new Date(bulkEnd + 'T00:00:00');

    while (cur <= end) {
      datesList.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    try {
      const res = await api.bulkSetCalendarCapacity({
        fechas: datesList,
        cupos_totales: Number(bulkCupos),
        bloqueado: bulkBloqueado,
        motivo_bloqueo: bulkMotivo,
      });
      setSuccessMsg(`¡Edición masiva aplicada exitosamente a ${res.count} días!`);
      setBulkMode(false);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en guardado masivo');
    } finally {
      setSaving(false);
    }
  };

  // Calendar matrix calculations
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const calendarDays: Array<{ day: number; dateStr: string; isCurrentMonth: boolean }> = [];

  // Empty slots before 1st day
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push({ day: 0, dateStr: '', isCurrentMonth: false });
  }

  // Days of current month
  for (let d = 1; d <= daysInMonth; d++) {
    const dayStr = String(d).padStart(2, '0');
    const monthStr = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    calendarDays.push({ day: d, dateStr, isCurrentMonth: true });
  }

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 mb-2">
            <Car className="w-4 h-4 text-[#0E9AA7]" />
            <span>Gestión de Flota & Disponibilidad Diaria</span>
          </div>
          <h2 className="text-2xl font-black font-heading text-stone-900">
            Control de Cupos Diarios & Calendario Operativo
          </h2>
          <p className="text-sm text-stone-600 mt-1 max-w-3xl">
            Ajusta los cupos disponibles por día en tiempo real. Si un vehículo 4x4 entra en mantenimiento, una lancha rápida se avería, o hay un cierre comarcal de congreso Guna, puedes reducir el cupo o bloquear la fecha inmediatamente para evitar sobreventas en la web pública.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-800 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-[#0E9AA7]" />
            <span>{bulkMode ? 'Cerrar Edición Masiva' : 'Ajuste Masivo de Rango'}</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition-all cursor-pointer"
            title="Refrescar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#0E9AA7]' : ''}`} />
          </button>
        </div>
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

      {/* Bulk Form (Conditional) */}
      {bulkMode && (
        <div className="bg-amber-50/70 border-2 border-amber-300 rounded-3xl p-6 shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-5 h-5 text-amber-700" />
            <h3 className="text-base font-extrabold text-amber-950">Ajuste Masivo de Cupos por Rango de Fechas</h3>
          </div>
          <form onSubmit={handleApplyBulk} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Fecha Inicio</label>
              <input
                type="date"
                required
                value={bulkStart}
                onChange={(e) => setBulkStart(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Fecha Fin</label>
              <input
                type="date"
                required
                value={bulkEnd}
                onChange={(e) => setBulkEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Cupos Totales / Día</label>
              <input
                type="number"
                min={0}
                max={50}
                required
                value={bulkCupos}
                onChange={(e) => setBulkCupos(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold uppercase text-stone-700 mb-1">Motivo / Causa del Ajuste</label>
              <input
                type="text"
                placeholder="Ej. Temporada de vientos / Congreso comarcal"
                value={bulkMotivo}
                onChange={(e) => setBulkMotivo(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-stone-300 bg-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="bulk-bloqueado"
                checked={bulkBloqueado}
                onChange={(e) => setBulkBloqueado(e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded cursor-pointer"
              />
              <label htmlFor="bulk-bloqueado" className="text-xs font-bold text-stone-800 cursor-pointer">
                Bloquear fechas (0 cupos)
              </label>
            </div>
            <div className="lg:col-span-4 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setBulkMode(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Aplicando...' : 'Aplicar a Todas las Fechas del Rango'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Calendar View (Left 2 cols) & Date Inspector/Editor (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid View */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          {/* Calendar Header Navigation */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-[#0E9AA7]" />
              <h3 className="text-lg font-black text-stone-900">
                {monthNames[month]} {year}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-all cursor-pointer"
                title="Mes anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-800 cursor-pointer"
              >
                Hoy
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl border border-stone-200 hover:bg-stone-100 text-stone-700 transition-all cursor-pointer"
                title="Mes siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-extrabold uppercase tracking-wider text-stone-500 py-1">
            <span>Dom</span>
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Sáb</span>
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.isCurrentMonth) {
                return (
                  <div
                    key={idx}
                    className="min-h-[85px] p-2 rounded-2xl bg-stone-50/50 border border-dashed border-stone-200/60 opacity-40"
                  />
                );
              }

              const override = capacities.find(c => c.fecha === cell.dateStr);
              const isSelected = selectedDate === cell.dateStr;
              const isBlocked = override ? override.bloqueado : false;
              const totalCupos = override ? override.cupos_totales : 14;
              const reserved = override?.personas_reservadas ?? 0;
              const available = isBlocked ? 0 : Math.max(0, totalCupos - reserved);
              const isModified = Boolean(override);

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedDate(cell.dateStr)}
                  className={`min-h-[85px] p-2.5 rounded-2xl text-left border transition-all flex flex-col justify-between cursor-pointer relative group ${
                    isSelected
                      ? 'border-[#0E9AA7] ring-2 ring-[#0E9AA7]/40 bg-teal-50/40 shadow-sm'
                      : isBlocked
                      ? 'bg-rose-50/60 border-rose-200 hover:border-rose-400'
                      : isModified
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
                      : 'bg-white border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-black ${isSelected ? 'text-[#0E9AA7]' : 'text-stone-800'}`}>
                      {cell.day}
                    </span>
                    {isBlocked ? (
                      <Lock className="w-3.5 h-3.5 text-rose-600" />
                    ) : isModified ? (
                      <span className="w-2 h-2 rounded-full bg-amber-500" title="Cupo modificado" />
                    ) : null}
                  </div>

                  <div className="mt-1">
                    {isBlocked ? (
                      <span className="text-[10px] font-bold text-rose-700 block leading-tight">
                        Bloqueado
                      </span>
                    ) : (
                      <div className="text-[11px]">
                        <span className="font-extrabold text-stone-900">{available}</span>
                        <span className="text-[10px] text-stone-500">/{totalCupos} cupos</span>
                      </div>
                    )}

                    {reserved > 0 && (
                      <span className="text-[9px] font-semibold text-teal-800 bg-teal-100/80 px-1 py-0.2 rounded mt-0.5 inline-block">
                        {reserved} reserv.
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 pt-3 border-t border-stone-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-white border border-stone-300" />
              <span>Por defecto (14 cupos)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-50 border border-amber-300" />
              <span>Ajustado manualmente</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-rose-50 border border-rose-300" />
              <span>Día bloqueado (0 cupos)</span>
            </div>
          </div>
        </div>

        {/* Selected Date Inspector & Quick Editor */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                  Fecha Seleccionada
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-0.5">
                  {selectedDate}
                </h3>
              </div>
              <div className="p-2.5 rounded-2xl bg-teal-50 text-[#0E9AA7]">
                <CalendarIcon className="w-5 h-5" />
              </div>
            </div>

            {/* Form to edit cupo for selected date */}
            <form onSubmit={handleSaveSingle} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1 flex items-center justify-between">
                  <span>Capacidad de Cupos (Personas)</span>
                  <span className="text-[10px] text-stone-400">Normal: 14 pax (2 vehículos 4x4)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={50}
                    required
                    value={cuposInput}
                    onChange={(e) => setCuposInput(Number(e.target.value))}
                    disabled={bloqueadoInput}
                    className="w-full px-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white disabled:opacity-50"
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCuposInput(7)}
                      disabled={bloqueadoInput}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
                      title="1 vehículo 4x4 (7 pax)"
                    >
                      7 pax
                    </button>
                    <button
                      type="button"
                      onClick={() => setCuposInput(14)}
                      disabled={bloqueadoInput}
                      className="px-2.5 py-1.5 rounded-lg border border-stone-200 bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-700 cursor-pointer"
                      title="2 vehículos 4x4 (14 pax)"
                    >
                      14 pax
                    </button>
                  </div>
                </div>
              </div>

              {/* Blocked switch */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {bloqueadoInput ? (
                    <Lock className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Unlock className="w-5 h-5 text-emerald-600" />
                  )}
                  <div>
                    <span className="text-xs font-extrabold text-stone-900 block">
                      {bloqueadoInput ? 'Día Cerrado / Bloqueado' : 'Día Abierto a Reservas'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      {bloqueadoInput ? 'No permitirá nuevas reservas públicas' : 'Disponible para reserva web'}
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  id="toggle-bloqueado"
                  checked={bloqueadoInput}
                  onChange={(e) => {
                    setBloqueadoInput(e.target.checked);
                    if (e.target.checked) setCuposInput(0);
                    else if (cuposInput === 0) setCuposInput(14);
                  }}
                  className="w-5 h-5 text-[#0E9AA7] rounded cursor-pointer"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-xs font-bold uppercase text-stone-700 mb-1">
                  Motivo o Nota Interna / Causa
                </label>
                <textarea
                  rows={3}
                  value={motivoInput}
                  onChange={(e) => setMotivoInput(e.target.value)}
                  placeholder="Ej. Un vehículo 4x4 en taller mecánico / Cierre de puerto por oleaje fuerte..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-stone-900 text-xs focus:outline-none focus:ring-2 focus:ring-[#0E9AA7] focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-[#0E9AA7] hover:bg-[#0c828d] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Guardando...' : 'Guardar Ajuste para este Día'}</span>
                </button>

                {capacities.some(c => c.fecha === selectedDate) && (
                  <button
                    type="button"
                    onClick={() => handleResetToDefault(selectedDate)}
                    disabled={saving}
                    className="w-full py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Restaurar a 14 cupos por defecto</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Quick Info footer */}
          <div className="mt-4 p-3 rounded-xl bg-teal-50/60 border border-teal-100 text-[11px] text-teal-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#0E9AA7] flex-shrink-0 mt-0.5" />
            <span>
              Cualquier cambio se sincroniza instantáneamente con el formulario de reservas de la página pública.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
