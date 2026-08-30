import React, { useState } from 'react';
import { PackageItem, ServiceType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Compass,
  Users,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface PackagesViewProps {
  packages: PackageItem[];
  onSelectPackage: (packageId: number) => void;
}

export const PackagesView: React.FC<PackagesViewProps> = ({
  packages,
  onSelectPackage,
}) => {
  const { language, t } = useLanguage();
  const { theme } = useTheme();

  const [activeFilter, setActiveFilter] = useState<'all' | ServiceType>('all');

  const filtered = activeFilter === 'all'
    ? packages
    : packages.filter(p => p.tipo === activeFilter);

  const getServiceTypeBadge = (tipo: ServiceType) => {
    switch (tipo) {
      case 'traslado':
        return { label: language === 'en' ? 'Transfer 4x4' : 'Traslado 4x4', color: 'bg-sky-50 text-sky-800 border-sky-200' };
      case 'tour':
        return { label: language === 'en' ? 'Island Tour' : 'Tour de Islas', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'todo_incluido':
        return { label: language === 'en' ? 'All-Inclusive' : 'Todo Incluido', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
    }
  };

  return (
    <div id="packages-view" className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Title & Filter Tabs */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-100/80 border border-teal-300">
          <Compass className="w-4 h-4 text-[#0E9AA7]" />
          <span>Experiencias en San Blas</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-stone-900">
          {language === 'en' ? 'Our Tour Packages & Transfers' : 'Nuestros Paquetes y Traslados'}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base">
          {language === 'en'
            ? 'Transparent pricing with native Guna captains, safe 4x4 vehicles, and delicious island meals.'
            : 'Precios transparentes con capitanes nativos Guna, vehículos 4x4 autorizados y la mejor gastronomía caribeña.'}
        </p>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#123C4B] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {t('pkg_filter_all')}
          </button>
          <button
            onClick={() => setActiveFilter('traslado')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'traslado'
                ? 'bg-[#0E9AA7] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {t('pkg_filter_transfer')}
          </button>
          <button
            onClick={() => setActiveFilter('tour')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'tour'
                ? 'bg-[#E8622C] text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {t('pkg_filter_tours')}
          </button>
          <button
            onClick={() => setActiveFilter('todo_incluido')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeFilter === 'todo_incluido'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {t('pkg_filter_all_inclusive')}
          </button>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((pkg) => {
          const badge = getServiceTypeBadge(pkg.tipo);
          const name = language === 'en' ? pkg.nombre_en || pkg.nombre_es : pkg.nombre_es;
          const desc = language === 'en' ? pkg.descripcion_en || pkg.descripcion_es : pkg.descripcion_es;
          const inc = language === 'en' ? pkg.incluye_en || pkg.incluye_es : pkg.incluye_es;
          const noInc = language === 'en' ? pkg.no_incluye_en || pkg.no_incluye_es : pkg.no_incluye_es;

          return (
            <div
              key={pkg.id}
              id={`package-card-${pkg.id}`}
              className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80 flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all"
            >
              <div className="space-y-4">
                {/* Type & Price Row */}
                <div className="flex items-center justify-between gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
                    {badge.label}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900">
                      ${pkg.precio}
                    </span>
                    <span className="text-xs text-stone-500 font-semibold block">
                      USD / {t('pkg_price_from')}
                    </span>
                  </div>
                </div>

                {/* Package Name */}
                <h3 className="text-xl sm:text-2xl font-bold font-heading text-stone-900 leading-tight">
                  {name}
                </h3>

                {/* Description */}
                <p className="text-sm text-stone-600 leading-relaxed">
                  {desc}
                </p>

                {/* Included Checklist */}
                {inc && (
                  <div className="pt-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('pkg_includes')}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-3.5 rounded-xl border border-stone-200/60 leading-relaxed">
                      {inc}
                    </p>
                  </div>
                )}

                {/* Not Included */}
                {noInc && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-stone-400" />
                      <span>{t('pkg_not_includes')}</span>
                    </h4>
                    <p className="text-xs text-stone-500 leading-relaxed pl-5">
                      {noInc}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                  <Users className="w-4 h-4 text-[#0E9AA7]" />
                  <span>Máx. {pkg.cupo_maximo_dia || 14} cupos / día</span>
                </div>

                <button
                  id={`btn-select-package-${pkg.id}`}
                  onClick={() => onSelectPackage(pkg.id)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-white shadow-md transition-all hover:scale-102 flex items-center justify-center gap-2 text-sm cursor-pointer"
                  style={{ backgroundColor: theme.secondaryColor }}
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>{t('pkg_select_btn')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
