import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Logo } from '../layout/Logo';
import { DoorOpen, Mail, KeyRound, AlertCircle, Loader2, X } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login } = useAuth();
  const { theme } = useTheme();

  const [correo, setCorreo] = useState('admin@gunavibes.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(correo, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 relative animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="flex justify-center mb-3">
            <Logo className="h-10" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200">
            <DoorOpen className="w-3.5 h-3.5 text-[#0E9AA7]" />
            <span>Panel de Administración</span>
          </div>
          <h2 className="text-xl font-bold font-heading text-stone-900">
            Acceso Administrativo Seguro
          </h2>
          <p className="text-xs text-stone-500">
            Gestiona reservas, cupos, contenidos, reseñas de Google y colores.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="email"
                required
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="admin@gunavibes.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-3.5 text-stone-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0E9AA7]"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Reminder */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600 leading-relaxed">
            <strong>Credenciales de Demostración:</strong> <br />
            Email: <code className="text-teal-700 font-mono font-bold">admin@gunavibes.com</code> • Password: <code className="text-teal-700 font-mono font-bold">admin123</code>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <DoorOpen className="w-4 h-4" />
                <span>Ingresar al Panel de Control</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
