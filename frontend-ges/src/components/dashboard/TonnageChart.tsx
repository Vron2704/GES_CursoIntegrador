import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { WEEKLY_TONNAGE_DATA } from '../../data/mockData';
import { Package } from 'lucide-react';

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md">
        <div className="font-bold border-b border-slate-800 pb-1 mb-2 text-slate-300">
          Día: {label}
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4 text-emerald-400">
            <span>UULL Ingreso:</span>
            <span className="font-mono font-bold">{(payload[0]?.value || 0).toLocaleString('es-PE')} und</span>
          </div>
          <div className="flex justify-between gap-4 text-blue-400">
            <span>UULL Salida:</span>
            <span className="font-mono font-bold">{(payload[1]?.value || 0).toLocaleString('es-PE')} und</span>
          </div>
          <div className="flex justify-between gap-4 text-amber-400 pt-1 border-t border-slate-800">
            <span>Rotación Neta:</span>
            <span className="font-mono font-bold">{(payload[2]?.value || 0).toLocaleString('es-PE')} und</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const TonnageChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-4 h-4 text-[#00a651]" />
            Flujo Semanal de Unidades Logísticas (UULL)
          </h3>
          <p className="text-xs text-slate-500">
            Rotación diaria de jabas y pallets recibidos y despachados en muelle
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-400"></span>
            <span className="text-slate-600 font-medium">UULL Ingreso</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-400"></span>
            <span className="text-slate-600 font-medium">UULL Salida</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={WEEKLY_TONNAGE_DATA}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="fecha"
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1' }}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="uullIngreso"
              name="UULL Ingreso"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Bar
              dataKey="uullSalida"
              name="UULL Salida"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
              barSize={18}
            />
            <Line
              type="monotone"
              dataKey="saldoNeto"
              name="Saldo Neto"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#f59e0b' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
