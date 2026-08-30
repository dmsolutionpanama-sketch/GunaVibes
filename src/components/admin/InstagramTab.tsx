import React, { useState, useEffect } from 'react';
import { InstagramMedia } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Instagram,
  RefreshCw,
  Key,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Layers,
  Play,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

export const InstagramTab: React.FC = () => {
  const { theme } = useTheme();

  const [posts, setPosts] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const [accessToken, setAccessToken] = useState('');
  const [accountId, setAccountId] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('gunavibes');
  const [savingSettings, setSavingSettings] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await api.getInstagramFeed();
      setPosts(data);
      const conf = await api.getAdminConfig();
      if (conf.instagram_access_token) setAccessToken(conf.instagram_access_token);
      if (conf.instagram_business_account_id) setAccountId(conf.instagram_business_account_id);
      if (conf.redes_sociales?.instagram) {
        const h = conf.redes_sociales.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '').replace(/^@/, '');
        if (h) setInstagramHandle(h);
      }
    } catch (e) {
      console.error('Error cargando Instagram:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await api.saveInstagramCredentials(accessToken, accountId);
      await api.updateInstagramHandle(instagramHandle);
      setSyncSuccess(true);
      setSyncMessage('Credenciales y usuario @' + instagramHandle + ' guardados exitosamente');
      setTimeout(() => {
        setSyncSuccess(false);
        setSyncMessage(null);
      }, 4000);
    } catch (err: any) {
      alert(err.message || 'Error guardando credenciales');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    setSyncMessage(null);
    try {
      const outcome = await api.syncInstagramWithToken(accessToken, accountId);
      setSyncSuccess(true);
      setSyncMessage(outcome.message || 'Feed sincronizado exitosamente con la API de Instagram');
      await loadFeed();
      setTimeout(() => {
        setSyncSuccess(false);
        setSyncMessage(null);
      }, 5000);
    } catch (err: any) {
      alert(err.message || 'Error al sincronizar feed');
    } finally {
      setSyncing(false);
    }
  };

  const cleanHandle = instagramHandle.replace(/^@/, '').trim() || 'gunavibes';
  const profileUrl = `https://www.instagram.com/${cleanHandle}`;

  return (
    <div className="space-y-6">
      
      {/* Header & Sync */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Instagram className="w-5 h-5 text-pink-600" />
            <h3 className="text-xl font-extrabold text-stone-900">
              Integración Oficial de Instagram Feed & Perfil Público
            </h3>
          </div>
          <p className="text-xs text-stone-500">
            Conecta tu cuenta de Instagram mediante @usuario y Graph API. Tus clientes podrán ver tus publicaciones en formato 9:16 e interactuar con el botón directo a tu perfil.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 rounded-xl border border-pink-200 text-pink-700 bg-pink-50 hover:bg-pink-100 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <span>Ver perfil @{cleanHandle}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center gap-2 text-xs cursor-pointer"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Sincronizando...' : 'Sincronizar Feed'}</span>
          </button>
        </div>
      </div>

      {syncSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{syncMessage || '¡Feed de Instagram actualizado con las últimas 12 publicaciones!'}</span>
        </div>
      )}

      {/* Settings form */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
          Configuración del Usuario & Credenciales de Instagram Graph API
        </h4>
        <p className="text-xs text-stone-500">
          Introduce tu @usuario de Instagram y tus credenciales de Meta/Instagram API para sincronizar publicaciones reales.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 flex items-center justify-between">
              <span>Usuario de Instagram (@)</span>
              <span className="text-[10px] text-pink-600 font-extrabold">Enlace público</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-bold text-xs">@</span>
              <input
                type="text"
                placeholder="gunayalaexplorer"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value.replace(/^@/, ''))}
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Instagram Business User ID
            </label>
            <input
              type="text"
              placeholder="Ej: 17841400012345678"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Long-Lived Access Token (Graph API)
            </label>
            <input
              type="password"
              placeholder="Ej: EAA..."
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono bg-stone-50/50 focus:bg-white focus:ring-2 focus:ring-[#0E9AA7]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Encriptación segura de credenciales en servidor Guna Yala Explorer</span>
          </div>
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#123C4B] hover:bg-[#0E2E3A] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{savingSettings ? 'Guardando...' : 'Guardar Datos de Instagram'}</span>
          </button>
        </div>
      </div>

      {/* Feed Live Preview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
            Vista Previa del Feed (12 elementos en cuadrícula 4x3)
          </h4>
          <a
            href={profileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-pink-600 font-bold hover:underline flex items-center gap-1"
          >
            <span>@{cleanHandle}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {posts.map((p) => (
            <div key={p.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 group">
              <img src={p.media_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-1.5 right-1.5 p-1 rounded bg-black/60 text-white text-[10px]">
                {p.tipo_media === 'VIDEO' ? <Play className="w-3 h-3 fill-white" /> : <ImageIcon className="w-3 h-3" />}
              </div>
              <div className="absolute inset-0 bg-black/75 p-2 flex flex-col justify-end text-[10px] text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="line-clamp-3">{p.caption}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
