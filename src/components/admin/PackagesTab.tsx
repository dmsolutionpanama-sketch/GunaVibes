import React, { useState, useEffect } from 'react';
import { PackageItem, ServiceType } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  DollarSign,
  Users,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

export const PackagesTab: React.FC = () => {
  const { theme } = useTheme();

  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);
  const [saving, setSaving] = useState(false);

  // Form
  const [nombreEs, setNombreEs] = useState('');
  const [nombreEn, setNombreEn] = useState('');
  const [tipo, setTipo] = useState<ServiceType>('tour');
  const [precio, setPrecio] = useState<number>(100);
  const [cupoMax, setCupoMax] = useState<number>(14);
  const [descEs, setDescEs] = useState('');
  const [descEn, setDescEn] = useState('');
  const [incEs, setIncEs] = useState('');
  const [incEn, setIncEn] = useState('');
  const [noIncEs, setNoIncEs] = useState('');
  const [noIncEn, setNoIncEn] = useState('');
  const [activo, setActivo] = useState(true);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const list = await api.getPackages();
      setPackages(list);
    } catch (e) {
      console.error('Error cargando paquetes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const openCreate = () => {
    setEditingPkg(null);
    setNombreEs('');
    setNombreEn('');
    setTipo('tour');
    setPrecio(100);
    setCupoMax(14);
    setDescEs('');
    setDescEn('');
    setIncEs('');
    setIncEn('');
    setNoIncEs('');
    setNoIncEn('');
    setActivo(true);
    setModalOpen(true);
  };

  const openEdit = (pkg: PackageItem) => {
    setEditingPkg(pkg);
    setNombreEs(pkg.nombre_es);
    setNombreEn(pkg.nombre_en || '');
    setTipo(pkg.tipo);
    setPrecio(pkg.precio);
    setCupoMax(pkg.cupo_maximo_dia || 14);
    setDescEs(pkg.descripcion_es);
    setDescEn(pkg.descripcion_en || '');
    setIncEs(pkg.incluye_es || '');
    setIncEn(pkg.incluye_en || '');
    setNoIncEs(pkg.no_incluye_es || '');
    setNoIncEn(pkg.no_incluye_en || '');
    setActivo(pkg.activo);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        nombre_es: nombreEs,
        nombre_en: nombreEn,
        tipo,
        precio: Number(precio),
        cupo_maximo_dia: Number(cupoMax),
        descripcion_es: descEs,
        descripcion_en: descEn,
        incluye_es: incEs,
        incluye_en: incEn,
        no_incluye_es: noIncEs,
        no_incluye_en: noIncEn,
        activo,
        orden: editingPkg ? editingPkg.orden : packages.length + 1,
      };

      if (editingPkg) {
        await api.updatePackage(editingPkg.id, payload);
      } else {
        await api.createPackage(payload);
      }

      setModalOpen(false);
      await loadPackages();
    } catch (err: any) {
      alert(err.message || 'Error guardando paquete');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar este paquete?')) return;
    try {
      await api.deletePackage(id);
      await loadPackages();
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-200 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-stone-900">
            Catálogo de Paquetes y Traslados
          </h3>
          <p className="text-xs text-stone-500">
            Gestiona los servicios ofrecidos, precios en USD y cupos diarios.
          </p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
          style={{ backgroundColor: theme.primaryColor }}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Paquete</span>
        </button>
      </div>

      {/* Grid of Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-stone-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
            Cargando paquetes...
          </div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border ${
                pkg.activo ? 'border-stone-200' : 'border-rose-200 opacity-60 bg-stone-50'
              } flex flex-col justify-between space-y-4`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {pkg.tipo.replace('_', ' ')}
                  </span>
                  <span className="text-lg font-black text-stone-900">
                    ${pkg.precio} USD
                  </span>
                </div>

                <h4 className="font-bold text-base text-stone-900 leading-snug">
                  {pkg.nombre_es}
                </h4>
                {pkg.nombre_en && (
                  <p className="text-xs text-stone-400 font-medium">{pkg.nombre_en}</p>
                )}

                <p className="text-xs text-stone-600 line-clamp-3">
                  {pkg.descripcion_es}
                </p>

                <div className="text-[11px] text-stone-500 pt-2 flex items-center justify-between">
                  <span>Cupo máx: <strong>{pkg.cupo_maximo_dia || 14} pax/día</strong></span>
                  <span className={`font-bold ${pkg.activo ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {pkg.activo ? '● Activo' : '○ Inactivo'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => openEdit(pkg)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => handleDelete(pkg.id)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                  title="Eliminar paquete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-stone-200 space-y-5 max-h-[90vh] overflow-y-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-stone-200 pb-4">
              <h3 className="text-lg font-bold text-stone-900">
                {editingPkg ? 'Editar Paquete' : 'Crear Nuevo Paquete'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nombre (Español) *</label>
                  <input
                    type="text"
                    required
                    value={nombreEs}
                    onChange={(e) => setNombreEs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nombre (Inglés)</label>
                  <input
                    type="text"
                    value={nombreEn}
                    onChange={(e) => setNombreEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tipo de Servicio *</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as ServiceType)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                  >
                    <option value="traslado">Traslado 4x4 / Lancha</option>
                    <option value="tour">Tour de Islas</option>
                    <option value="todo_incluido">Todo Incluido</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Precio ($ USD) *</label>
                    <input
                      type="number"
                      step="1"
                      required
                      value={precio}
                      onChange={(e) => setPrecio(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Cupo Máx/Día</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cupoMax}
                      onChange={(e) => setCupoMax(parseInt(e.target.value, 10) || 14)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm focus:ring-2 focus:ring-[#0E9AA7]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Descripción (Español) *</label>
                  <textarea
                    rows={2}
                    required
                    value={descEs}
                    onChange={(e) => setDescEs(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Descripción (Inglés)</label>
                  <textarea
                    rows={2}
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">¿Qué incluye? (Español)</label>
                  <input
                    type="text"
                    value={incEs}
                    onChange={(e) => setIncEs(e.target.value)}
                    placeholder="Traslado ida y vuelta, lancha, entrada, almuerzo..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">¿Qué incluye? (Inglés)</label>
                  <input
                    type="text"
                    value={incEn}
                    onChange={(e) => setIncEn(e.target.value)}
                    placeholder="Roundtrip 4x4, boat, taxes, island lunch..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">No incluye (Español)</label>
                  <input
                    type="text"
                    value={noIncEs}
                    onChange={(e) => setNoIncEs(e.target.value)}
                    placeholder="Impuesto comarcal ($20 extranjeros), bebidas alcohólicas..."
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs focus:ring-2 focus:ring-[#0E9AA7]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="chk-pkg-activo"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600"
                />
                <label htmlFor="chk-pkg-activo" className="text-xs font-bold text-stone-700 cursor-pointer">
                  Paquete activo y visible para reservas públicas
                </label>
              </div>

              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Guardar Paquete</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
