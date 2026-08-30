import React, { useState, useEffect } from 'react';
import { GoogleReview, GoogleReviewsSummary } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Star,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const GoogleReviewsTab: React.FC = () => {
  const { theme } = useTheme();

  const [summary, setSummary] = useState<GoogleReviewsSummary | null>(null);
  const [reviews, setReviews] = useState<GoogleReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Settings
  const [placeId, setPlaceId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getGoogleReviews();
      setSummary(data.summary);
      setReviews(data.reviews);
      if (data.summary) {
        setPlaceId(data.summary.place_id || '');
        setApiKey(data.summary.api_key || '');
      }
    } catch (e) {
      console.error('Error cargando reseñas Google:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      const res = await api.syncGoogleReviews();
      setSyncSuccess(true);
      await loadData();
      setTimeout(() => setSyncSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al sincronizar con Google API');
    } finally {
      setSyncing(false);
    }
  };

  const handleToggleVisibility = async (id: number) => {
    try {
      await api.toggleGoogleReviewVisibility(id);
      setReviews(reviews.map(r => r.id === id ? { ...r, visible: !r.visible } : r));
    } catch (err) {
      console.error('Error cambiando visibilidad:', err);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.saveGoogleReviewsSettings(placeId, apiKey);
      alert('Configuración de Google API guardada');
    } catch (err: any) {
      alert(err.message || 'Error guardando configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Sync Trigger */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl font-black text-stone-900">⭐ {summary?.puntaje_promedio || 4.8} / 5.0</span>
            <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-md">
              {summary?.total_resenas || 132} reseñas en Google
            </span>
          </div>
          <p className="text-xs text-stone-500">
            Última sincronización con Google Places API: {summary?.ultima_sincronizacion ? new Date(summary.ultima_sincronizacion).toLocaleString() : 'Reciente'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando con Google...' : 'Sincronizar Reseñas Ahora'}</span>
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>¡Reseñas sincronizadas y actualizadas exitosamente con Google Places API!</span>
        </div>
      )}

      {/* Google API Settings Accordion */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
          Configuración de Google Places API
        </h4>
        <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Google Place ID
            </label>
            <input
              type="text"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJ09v-7U..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Google API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Guardar Credenciales de API
            </button>
          </div>
        </form>
      </div>

      {/* Reviews Moderation Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Moderación de Reseñas para la Web ({reviews.length})
          </h4>
          <span className="text-[11px] text-stone-500">
            Puedes ocultar o mostrar reseñas individuales en la página pública
          </span>
        </div>

        <div className="divide-y divide-stone-100">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                rev.visible ? 'hover:bg-stone-50' : 'bg-stone-100/60 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3">
                <img
                  src={rev.autor_foto_url}
                  alt={rev.autor_nombre}
                  className="w-10 h-10 rounded-full object-cover border border-stone-200"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-stone-900">{rev.autor_nombre}</span>
                    <span className="text-[11px] text-stone-400">{rev.fecha_relativa}</span>
                    <div className="flex items-center text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.calificacion ? 'fill-amber-400' : 'fill-stone-200 text-stone-200'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-stone-700 italic">"{rev.texto}"</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => handleToggleVisibility(rev.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    rev.visible
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                  }`}
                >
                  {rev.visible ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Oculta</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
