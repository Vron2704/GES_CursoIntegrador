import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  FileCheck2,
  PlusCircle,
  LogOut,
  FileText,
  History,
  Clock,
  Boxes,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StatCard } from './StatCard';
import { MovementChart } from './MovementChart';
import { TonnageChart } from './TonnageChart';
import { ProductDistributionChart } from './ProductDistributionChart';
import { TopSuppliersChart } from './TopSuppliersChart';
import { ActiveYardMonitor } from './ActiveYardMonitor';
import { RecentMovementsTable } from './RecentMovementsTable';

export const DashboardView: React.FC = () => {
  const { stats, setActiveTab, canRegister, currentUser } = useApp();

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
        {/* Subtle decorative background element */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-[#00a651]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#00a651] text-white uppercase tracking-widest flex items-center gap-1.5">
              <Boxes className="w-3 h-3" />
              Gestión de Unidades Logísticas
            </span>
            <span className="text-xs text-slate-400">
              | Perfil: {currentUser?.rolLabel || 'Operador'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Monitoreo Operativo de UULL & Guías de Remisión
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Supervisión integral de jabas, pallets y bines, control de stock por proveedor y emisión directa de Guías Oficiales SPSA.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          {canRegister ? (
            <>
              <button
                onClick={() => setActiveTab('registro-ingreso')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008f45] text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Registrar Ingreso UULL</span>
              </button>

              <button
                onClick={() => setActiveTab('registro-salida')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs border border-slate-700 transition-all active:scale-95"
              >
                <LogOut className="w-4 h-4 text-blue-400" />
                <span>Dar Salida</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('impresion-guia')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00a651] hover:bg-[#008f45] text-white font-black text-xs transition-all shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <FileText className="w-4 h-4" />
                <span>Ver Guías de Remisión</span>
              </button>

              <button
                onClick={() => setActiveTab('kardex')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all backdrop-blur-sm active:scale-95"
              >
                <History className="w-4 h-4 text-emerald-400" />
                <span>Consultar Kardex</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* KPI Cards Row (100% UULL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unidades en Espera"
          value={stats.unidadesEnPatio}
          unit="Vehículos"
          subtitle="Pendientes de salida / despacho"
          trend={{ value: 'En planta', isPositive: true }}
          icon={Clock}
          colorScheme="amber"
          onClick={canRegister ? () => setActiveTab('registro-salida') : () => setActiveTab('kardex')}
        />

        <StatCard
          title="UULL Ingresadas Hoy"
          value={stats.totalUullIngresoHoy.toLocaleString('es-PE')}
          unit="Unidades"
          subtitle={`${stats.ingresosHoy} camiones recibidos en acopio`}
          trend={{ value: '+12% vs ayer', isPositive: true }}
          icon={ArrowDownRight}
          colorScheme="emerald"
          onClick={canRegister ? () => setActiveTab('registro-ingreso') : () => setActiveTab('kardex')}
        />

        <StatCard
          title="UULL Despachadas Hoy"
          value={stats.totalUullSalidaHoy.toLocaleString('es-PE')}
          unit="Unidades"
          subtitle={`${stats.salidasHoy} unidades despachadas`}
          trend={{ value: 'Al día', isPositive: true }}
          icon={ArrowUpRight}
          colorScheme="blue"
          onClick={canRegister ? () => setActiveTab('registro-salida') : () => setActiveTab('kardex')}
        />

        <StatCard
          title="Guías Emitidas Hoy"
          value={stats.guiasEmitidasHoy}
          unit="GRE SUNAT"
          subtitle="Formato Oficial SPSA"
          trend={{ value: '100% Validadas', isPositive: true }}
          icon={FileCheck2}
          colorScheme="purple"
          onClick={() => setActiveTab('impresion-guia')}
        />
      </div>

      {/* Main Charts: Movements Hourly & Weekly UULL Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MovementChart />
        <TonnageChart />
      </div>

      {/* Live Yard Section */}
      <ActiveYardMonitor />

      {/* Bottom Distribution & Top Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductDistributionChart />
        <TopSuppliersChart />
      </div>

      {/* Recent Movements Table */}
      <RecentMovementsTable />
    </div>
  );
};
