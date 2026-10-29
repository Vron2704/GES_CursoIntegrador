import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { PRODUCT_DISTRIBUTION_DATA } from '../../data/mockData';
import { Package } from 'lucide-react';

export const ProductDistributionChart: React.FC = () => {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
          <Package className="w-4 h-4 text-[#00a651]" />
          Distribución por Tipo de UULL
        </h3>
        <p className="text-xs text-slate-500">
          Porcentaje de Unidades Logísticas clasificadas en recepción (jabas y pallets)
        </p>
      </div>

      <div className="h-52 w-full my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(value: any) => [`${value}% del total`, 'Participación']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '10px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Pie
              data={PRODUCT_DISTRIBUTION_DATA}
              dataKey="value"
              nameKey="name"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
            >
              {PRODUCT_DISTRIBUTION_DATA.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-100">
        {PRODUCT_DISTRIBUTION_DATA.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="text-slate-600 truncate">{item.name}</span>
            <span className="font-bold text-slate-900 ml-auto">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
