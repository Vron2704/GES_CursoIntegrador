import React from 'react';
import {
  ShieldCheck,
  Server,
  LogOut,
  Shield,
  Truck,
  Eye,
  Clock,
  Package,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DigitalClock } from '../common/DigitalClock';
import logoSpsa from '../../assets/logo-spsa.png';

export const Navbar: React.FC = () => {
  const {
    activeShift,
    setActiveShift,
    backendConnected,
    dbStatus,
    isSyncingDb,
    sincronizarConBaseDeDatos,
    currentUser,
    logout,
    stats,
  } = useApp();

  const roleStyles = {
    ADMINISTRADOR_GENERAL: {
      badge: 'bg-purple-100 text-purple-800 border-purple-200',
      icon: <Shield className="w-3 h-3 text-purple-600" />,
    },
    PERSONAL_LOGISTICA: {
      badge: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: <Truck className="w-3 h-3 text-blue-600" />,
    },
    CONSULTA: {
      badge: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Eye className="w-3 h-3 text-amber-600" />,
    },
  };

  const currentRoleStyle = currentUser?.rol ? roleStyles[currentUser.rol] : roleStyles.ADMINISTRADOR_GENERAL;

  return (
    <header className="shrink-0 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-2.5 shadow-xs no-print">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: System title & Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <img
              src={logoSpsa}
              alt="Supermercados Peruanos SA"
              className="h-8 w-auto object-contain shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-extrabold text-slate-900 tracking-tight">
                  CENTRO DE ACOPIO SPSA
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-[#00a651] border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-[#00a651]" />
                  GRE SUNAT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Gestión de Unidades Logísticas
              </p>
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
            {/* Unidades en Espera */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-semibold text-slate-700">En Espera:</span>
              <span className="font-mono font-bold text-slate-900">
                {stats.unidadesEnPatio} vehículos
              </span>
            </div>

            {/* UULL En Rotación */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
              <Package className="w-3.5 h-3.5 text-[#00a651]" />
              <span className="font-semibold text-slate-700">UULL Hoy:</span>
              <span className="font-mono font-bold text-emerald-700">
                {stats.totalUullIngresoHoy.toLocaleString('es-PE')} und
              </span>
            </div>

            {/* Supabase / Backend Status */}
            <button
              type="button"
              onClick={() => sincronizarConBaseDeDatos()}
              disabled={isSyncingDb}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all cursor-pointer ${
                dbStatus.isConnected
                  ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
              title="Sincronizar datos con PostgreSQL"
            >
              <Server className={`w-3 h-3 ${dbStatus.isConnected ? 'text-[#00a651]' : 'text-amber-500'} ${isSyncingDb ? 'animate-spin' : ''}`} />
              <span className="text-[10.5px] font-bold">
                {isSyncingDb
                  ? 'Sincronizando...'
                  : dbStatus.isConnected
                  ? 'BD Conectada'
                  : 'Reconectar BD'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Side: Shift, Clock & User Session */}
        <div className="flex items-center gap-3">
          {/* Shift Selector */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <span className="px-1.5 font-bold text-slate-500 text-[10px] uppercase">
              Turno:
            </span>
            {(['MAÑANA', 'TARDE', 'NOCHE'] as const).map((shift) => (
              <button
                key={shift}
                onClick={() => setActiveShift(shift)}
                className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition-all ${
                  activeShift === shift
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {shift}
              </button>
            ))}
          </div>

          {/* Digital Clock */}
          <div className="hidden md:block">
            <DigitalClock />
          </div>

          {/* Current User & Role Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden lg:block text-right">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.nombre || 'Usuario Conectado'}
              </div>
              <div className="flex items-center justify-end gap-1 mt-0.5">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9.5px] font-bold border ${currentRoleStyle.badge}`}
                >
                  {currentRoleStyle.icon}
                  {currentUser?.rolLabel || 'Operador'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Cerrar Sesión"
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
