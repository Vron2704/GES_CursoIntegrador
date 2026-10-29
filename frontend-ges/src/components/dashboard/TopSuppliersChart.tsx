import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { TOP_SUPPLIERS_DATA } from '../../data/mockData';
import { Package } from 'lucide-react';

export const TopSuppliersChart: React.FC = () => {
  const chartData = TOP_SUPPLIERS_DATA.map((s) => ({
    name: s.nombre.length > 18 ? s.nombre.slice(0, 18) + '...' : s.nombre,
    uull: s.totalUull,
    viajes: s.viajes,
  }));

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-[#00a651]" />
          Top Proveedores por Rotación de UULL
        </h3>
        <p className="text-xs text-slate-500">
          Unidades Logísticas recibidas en muelles de acopio este periodo
        </p>
      </div>

      <div className="h-56 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
          >
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              width={140}
              tick={{ fontSize: 10, fill: '#334155' }}
            />
            <Tooltip
              formatter={(value: any) => [`${Number(value).toLocaleString('es-PE')} UULL`, 'Cantidad']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                border: 'none',
                color: '#fff',
                fontSize: '11px',
              }}
            />
            <Bar dataKey="uull" fill="#00a651" radius={[0, 4, 4, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 text-right pt-2 border-t border-slate-100">
        Actualizado en tiempo real con datos del kardex logístico
      </div>
    </div>
  );
};
