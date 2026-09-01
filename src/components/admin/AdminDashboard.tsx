import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Logo } from '../layout/Logo';
import { LeadFunnelDashboardTab } from './LeadFunnelDashboardTab';
import { ReservationsTab } from './ReservationsTab';
import { LeadsTab } from './LeadsTab';
import { ContentManagerTab } from './ContentManagerTab';
import { SettingsTab } from './SettingsTab';
import { YouTubeLiveTab } from './YouTubeLiveTab';
import { GoogleReviewsTab } from './GoogleReviewsTab';
import { InstagramTab } from './InstagramTab';
import { PackagesTab } from './PackagesTab';
import { DailyCapacityCalendarTab } from './DailyCapacityCalendarTab';
import { OutgoingEmailTab } from './OutgoingEmailTab';
import { CountryDemographicsTab } from './CountryDemographicsTab';
import { SecurityCenterTab } from './SecurityCenterTab';
import { ExecutiveOverviewTab } from './ExecutiveOverviewTab';
import { BannerManagerTab } from './BannerManagerTab';
import { WhatsAppTraceabilityTab } from './WhatsAppTraceabilityTab';
import {
  LogOut,
  Settings,
  CalendarCheck,
  Users,
  FileEdit,
  Radio,
  Star,
  Instagram,
  Package,
  TrendingUp,
  Clock,
  Send,
  CheckCircle2,
  DollarSign,
  ExternalLink,
  ShieldCheck,
  CalendarDays,
  Mail,
  Globe,
  Menu,
  X,
  LayoutDashboard,
  Layers,
  MessageSquare,
} from 'lucide-react';

interface AdminDashboardProps {
  onExitToSite: () => void;
}

type AdminTab =
  | 'overview'
  | 'funnel'
  | 'reservations'
  | 'whatsapp'
  | 'calendar-capacity'
  | 'demographics'
  | 'email'
  | 'leads'
  | 'banner'
  | 'content'
  | 'packages'
  | 'google'
  | 'instagram'
  | 'youtube'
  | 'security'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExitToSite }) => {
  const { user, logout } = useAuth();
  const { theme, config } = useTheme();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalReservas: 0,
    pendientes: 0,
    pagoEnviado: 0,
    confirmadas: 0,
    totalLeads: 0,
    ingresosAprox: 0,
  });

  useEffect(() => {
    const loadOverview = async () => {
      try {
        const reservations = await api.getAdminReservations();
        const leads = await api.getAdminClients();

        const pendientes = reservations.filter(r => r.estado === 'pendiente').length;
        const pagoEnviado = reservations.filter(r => r.estado === 'pago_enviado').length;
        const confirmadas = reservations.filter(r => r.estado === 'confirmada').length;
        const ingresosAprox = reservations
          .filter(r => r.estado === 'confirmada')
          .reduce((sum, r) => sum + (r.monto_total || 0), 0);

        setStats({
          totalReservas: reservations.length,
          pendientes,
          pagoEnviado,
          confirmadas,
          totalLeads: leads.length,
          ingresosAprox,
        });
      } catch (err) {
        console.error('Error cargando métricas:', err);
      }
    };
    loadOverview();
  }, [activeTab]);

  const navGroups = [
    {
      groupTitle: 'PANEL PRINCIPAL & CONTROL',
      items: [
        { id: 'overview', label: 'Dashboard Ejecutivo 360°', icon: LayoutDashboard, highlight: true },
        { id: 'funnel', label: 'Embudo de Ventas & Leads', icon: TrendingUp },
      ],
    },
    {
      groupTitle: 'VENTAS & CONVERSIÓN',
      items: [
        { id: 'reservations', label: 'Reservas & Pagos', icon: CalendarCheck, badge: stats.pendientes > 0 ? stats.pendientes : undefined },
        { id: 'calendar-capacity', label: 'Cupos Diarios & Calendario', icon: CalendarDays },
        { id: 'demographics', label: 'Demografía & Pauta por País', icon: Globe },
        { id: 'leads', label: 'Directorio de Clientes', icon: Users },
      ],
    },
    {
      groupTitle: 'COMUNICACIÓN & PASARELAS',
      items: [
        { id: 'whatsapp', label: 'Trazabilidad & WhatsApp', icon: MessageSquare, badgeText: 'Enlace Directo' },
        { id: 'email', label: 'Pasarela de Correo (SMTP)', icon: Mail },
        { id: 'instagram', label: 'Instagram Graph API Feed', icon: Instagram },
        { id: 'google', label: 'Reseñas de Google Places', icon: Star },
        { id: 'youtube', label: 'Transmisión YouTube Live', icon: Radio },
      ],
    },
    {
      groupTitle: 'CONTENIDOS & MULTIMEDIA',
      items: [
        { id: 'banner', label: 'Banner & Carrusel Hero', icon: Layers, highlight: true },
        { id: 'content', label: 'Editor de Contenidos (CMS)', icon: FileEdit },
        { id: 'packages', label: 'Tours & Paquetes San Blas', icon: Package },
      ],
    },
    {
      groupTitle: 'SISTEMA & SEGURIDAD',
      items: [
        { id: 'security', label: 'Centro de Seguridad & Logs', icon: ShieldCheck, badgeText: 'Activo' },
        { id: 'settings', label: 'Ajustes, Tipografía & MySQL', icon: Settings },
      ],
    },
  ];

  return (
    <div id="admin-root" className="admin-portal-scope min-h-screen bg-stone-100 flex flex-col md:flex-row text-base">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-[#123C4B] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg bg-white/10 text-white cursor-pointer"
          >
            {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <Logo isLight className="h-7" />
        </div>
        <button
          onClick={onExitToSite}
          className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-bold text-teal-300 flex items-center gap-1 cursor-pointer"
        >
          <span>Ver Web</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Left Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-30 h-screen w-72 bg-[#123C4B] text-white flex flex-col justify-between border-r border-stone-800 transition-transform duration-300 shadow-xl ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & Quick Site Link */}
        <div className="p-5 border-b border-stone-700/80">
          <div className="flex items-center justify-between">
            <Logo isLight className="h-8" />
            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold border border-teal-400/30">
              Admin
            </span>
          </div>

          <button
            onClick={onExitToSite}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-teal-200 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/10"
          >
            <span>Ir a la Portada Pública</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sidebar Menu Options Grouped */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <div className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-teal-300/60 mb-2">
                {group.groupTitle}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as AdminTab);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md font-extrabold'
                        : 'text-stone-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-amber-300' : 'text-teal-400'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-stone-900">
                        {item.badge}
                      </span>
                    )}

                    {item.badgeText && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                        {item.badgeText}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Info & Logout Footer */}
        <div className="p-4 border-t border-stone-700/80 bg-[#0E2E3A] flex items-center justify-between">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-xs font-bold text-white truncate">{user?.nombre || 'Administrador'}</span>
            <span className="text-[11px] text-teal-300 truncate">{user?.correo}</span>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors cursor-pointer"
            title="Cerrar Sesión Segura"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* Quick KPI Banner (Visible on all tabs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-stone-500 block">Pendientes</span>
              <span className="text-xl font-black text-amber-700">{stats.pendientes}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-700">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-stone-500 block">Pago Enviado</span>
              <span className="text-xl font-black text-sky-700">{stats.pagoEnviado}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-stone-500 block">Confirmadas</span>
              <span className="text-xl font-black text-emerald-700">{stats.confirmadas}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase text-stone-500 block">Total Pagado</span>
              <span className="text-xl font-black text-purple-800">${stats.ingresosAprox}</span>
            </div>
          </div>
        </div>

        {/* Tab View Component */}
        <div className="animate-fadeIn">
          {activeTab === 'overview' && (
            <ExecutiveOverviewTab
              onNavigate={(tab) => setActiveTab(tab as AdminTab)}
            />
          )}
          {activeTab === 'funnel' && <LeadFunnelDashboardTab />}
          {activeTab === 'reservations' && <ReservationsTab />}
          {activeTab === 'whatsapp' && <WhatsAppTraceabilityTab />}
          {activeTab === 'calendar-capacity' && <DailyCapacityCalendarTab />}
          {activeTab === 'demographics' && <CountryDemographicsTab />}
          {activeTab === 'email' && <OutgoingEmailTab />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'banner' && <BannerManagerTab />}
          {activeTab === 'content' && <ContentManagerTab />}
          {activeTab === 'packages' && <PackagesTab />}
          {activeTab === 'instagram' && <InstagramTab />}
          {activeTab === 'google' && <GoogleReviewsTab />}
          {activeTab === 'youtube' && <YouTubeLiveTab />}
          {activeTab === 'security' && <SecurityCenterTab />}
          {activeTab === 'settings' && <SettingsTab />}
        </div>
      </main>
    </div>
  );
};
