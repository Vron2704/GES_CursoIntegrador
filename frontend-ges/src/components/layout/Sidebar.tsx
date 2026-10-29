import React from 'react';
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Printer,
  History,
  Building2,
  Radio,
  Lock,
  Boxes,
  type LucideIcon,
} from 'lucide-react';
import { useApp, AppTab } from '../../context/AppContext';

interface NavItem {
  id: AppTab;
  label: string;
  icon: LucideIcon;
  badge: string | null;
  badgeColor?: string;
  desc: string;
  requiresRegisterPermission?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    unidadesEnPatio,
    currentUser,
    canRegister,
  } = useApp();

  const navItems: NavItem[] = [
    {
      id: 'registro-ingreso',
      label: 'Recepción e Ingreso',
      icon: canRegister ? LogIn : Lock,
      badge: canRegister ? 'UULL' : 'Restringido',
      badgeColor: canRegister
        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
        : 'bg-amber-950 text-amber-400 border-amber-800',
      desc: canRegister ? 'Registro de jabas y pallets' : 'Acceso Restringido',
      requiresRegisterPermission: true,
    },
    {
      id: 'registro-salida',
      label: 'Despacho y Salida',
      icon: canRegister ? LogOut : Lock,
      badge: canRegister && unidadesEnPatio.length > 0 ? `${unidadesEnPatio.length} pendientes` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300 font-bold',
      desc: canRegister ? 'Emisión de guía de remisión' : 'Acceso Restringido',
      requiresRegisterPermission: true,
    },
    {
      id: 'impresion-guia',
      label: 'Guía de Remisión',
      icon: Printer,
      badge: 'Oficial',
      badgeColor: 'bg-emerald-100 text-[#00a651] border-emerald-300 font-bold',
      desc: 'Plantilla oficial de impresión',
    },
    {
      id: 'stock-proveedores',
      label: 'Cuentas y Alquiler',
      icon: Boxes,
      badge: null,
      desc: 'Balance y stock por proveedor',
    },
    {
      id: 'kardex',
      label: 'Kardex Histórico',
      icon: History,
      badge: null,
      desc: 'Historial de movimientos',
    },
    {
      id: 'dashboard',
      label: 'Panel General',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Indicadores de patio y UULL',
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 h-full max-h-full overflow-y-auto select-none no-print">
      {/* Navigation Links */}
      <div className="p-3 space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Módulos de Gestión de Acopio
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isLocked = item.requiresRegisterPermission && !canRegister;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? 'bg-[#00a651] text-white font-semibold shadow-lg shadow-emerald-900/30 ring-1 ring-emerald-400/30'
                  : isLocked
                  ? 'text-slate-400 hover:bg-slate-800/60 opacity-80'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive
                      ? 'text-white'
                      : isLocked
                      ? 'text-amber-500'
                      : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-xs truncate flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {isLocked && <Lock className="w-3 h-3 text-amber-400 shrink-0" />}
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    isActive
                      ? 'bg-emerald-800/70 text-white border-emerald-500'
                      : item.badgeColor || 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* UULL status mini widget */}
      <div className="p-3 m-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 font-bold">
            <Boxes className="w-3.5 h-3.5 text-[#00a651]" />
            UULL en Espera
          </span>
          <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-0.5 rounded-md text-emerald-400 border border-emerald-500/30">
            {unidadesEnPatio.length} unidades
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          Control exclusivo de jabas, pallets y bines para acopio de proveedores.
        </p>
      </div>

      {/* Facility & User Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-[11px] font-bold text-slate-200 truncate">
              {currentUser?.sede || 'Centro de Acopio SPSA Tablada'}
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
              {currentUser?.rolLabel || 'Personal Logístico'}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
