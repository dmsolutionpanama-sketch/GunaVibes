import React, { useState, useEffect } from 'react';
import { YouTubeLiveStatus } from '../../types';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Radio,
  Video,
  Send,
  BellRing,
  CheckCircle2,
  AlertCircle,
  Play,
  Users,
  Loader2,
} from 'lucide-react';

export const YouTubeLiveTab: React.FC = () => {
  const { theme } = useTheme();

  const [liveStatus, setLiveStatus] = useState<YouTubeLiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState('UC_gunavibes_official');
  const [apiKey, setApiKey] = useState('AIzaSy...');

  // Broadcast toggle simulation
  const [isLive, setIsLive] = useState(false);
  const [videoId, setVideoId] = useState('jfKfPfyJRdk');
  const [title, setTitle] = useState('San Blas en Vivo desde Isla Perro Chico');
  const [notifying, setNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState<string | null>(null);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getYouTubeLiveStatus();
      setLiveStatus(data);
      setIsLive(data.esta_en_vivo);
      if (data.live_video_id) setVideoId(data.live_video_id);
      if (data.titulo_transmision) setTitle(data.titulo_transmision);
    } catch (e) {
      console.error('Error cargando estado de YouTube Live:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const handleToggleLive = async () => {
    setNotifying(true);
    setNotifySuccess(null);
    try {
      const newLiveState = !isLive;
      const res = await api.triggerTestLiveBroadcast(
        newLiveState,
        newLiveState ? videoId : undefined,
        newLiveState ? title : undefined
      );
      setIsLive(newLiveState);
      setNotifySuccess(res.message);
      await loadStatus();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de transmisión');
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Current Status Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                isLive
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-stone-100 text-stone-600'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>{isLive ? '🔴 TRANSMISIÓN EN VIVO ACTIVA' : '⚪ FUERA DE LÍNEA'}</span>
            </span>
          </div>

          <h3 className="text-lg font-bold text-stone-900">
            {isLive ? title : 'No hay transmisión activa en este momento'}
          </h3>
          <p className="text-xs text-stone-500">
            {isLive
              ? `El banner principal de la web muestra el video en vivo automáticamente y se alertó a los clientes.`
              : 'Cuando inicies transmisión en YouTube, el sistema lo detectará automáticamente cada 5 minutos.'}
          </p>
        </div>

        {/* Action button */}
        <button
          onClick={handleToggleLive}
          disabled={notifying}
          className={`px-6 py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center gap-2 text-xs transition-all cursor-pointer ${
            isLive ? 'bg-stone-800 hover:bg-stone-900' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          {notifying ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Radio className="w-4 h-4" />
          )}
          <span>{isLive ? 'Finalizar Transmisión' : 'Iniciar / Simular Transmisión En Vivo'}</span>
        </button>
      </div>

      {notifySuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{notifySuccess}</span>
        </div>
      )}

      {/* Broadcast Details Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 flex items-center gap-2">
          <Video className="w-4 h-4 text-red-600" />
          <span>Parámetros de la Transmisión de YouTube</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              YouTube Video ID (o URL del stream)
            </label>
            <input
              type="text"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Ej. jfKfPfyJRdk o https://youtube.com/live/..."
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Título de la Transmisión
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Atardecer en San Blas en Vivo"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs"
            />
          </div>
        </div>

        {/* Live embed preview */}
        {videoId && (
          <div className="pt-3">
            <label className="block text-xs font-bold text-stone-500 uppercase mb-2">
              Vista Previa del Embed de YouTube
            </label>
            <div className="aspect-video max-w-lg rounded-xl overflow-hidden shadow border border-stone-300 bg-black">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${videoId.replace(/.*(?:v=|live\/|youtu\.be\/)/, '')}`}
                title="Preview"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
