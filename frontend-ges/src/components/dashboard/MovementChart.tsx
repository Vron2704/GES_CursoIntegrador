import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { HOURLY_FLOW_DATA } from '../../data/mockData';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const ingresos = payload.find((p) => p.dataKey === 'ingresos')?.value || 0;
    const salidas = payload.find((p) => p.dataKey === 'salidas')?.value || 0;
    const tnIngreso = payload.find((p) => p.dataKey === 'ingresos')?.payload.tnIngreso || 0;
    const tnSalida = payload.find((p) => p.dataKey === 'salidas')?.payload.tnSalida || 0;

    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
        <div className="font-bold border-b border-slate-800 pb-1 mb-2 text-slate-300">
          Hora: {label} hrs
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span className="flex items-center gap-1 font-semibold">
              <ArrowDownRight className="w-3.5 h-3.5" /> Ingresos:
            </span>
            <span className="font-mono font-bold">{ingresos} camiones ({tnIngreso} Tn)</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-blue-400">
            <span className="flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" /> Salidas:
            </span>
            <span className="font-mono font-bold">{salidas} camiones ({tnSalida} Tn)</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const MovementChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Flujo Operativo de Unidades (Ingresos vs Salidas)
          </h3>
          <p className="text-xs text-slate-500">
            Cantidad de camiones pesados por franja horaria en Balanza 01 y 02
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500"></span>
            <span className="font-semibold text-slate-700">Ingresos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-500"></span>
            <span className="font-semibold text-slate-700">Salidas</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={HOURLY_FLOW_DATA}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="hora"
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="ingresos"
              name="Ingresos"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
            <Bar
              dataKey="salidas"
              name="Salidas"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              maxBarSize={20}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
