import React, { useState } from 'react';
import { Search, Printer } from 'lucide-react';
import { GuiaRemisionModel } from '../../types';

interface ReferralGuideListProps {
  guias: GuiaRemisionModel[];
  selectedGuia: GuiaRemisionModel | null;
  onSelectGuia: (guia: GuiaRemisionModel) => void;
}

export const ReferralGuideList: React.FC<ReferralGuideListProps> = ({
  guias,
  selectedGuia,
  onSelectGuia,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');

  const filtered = guias.filter((g) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      g.numeroGuia.toLowerCase().includes(term) ||
      g.proveedor.razonSocial.toLowerCase().includes(term) ||
      g.proveedor.ruc.includes(term) ||
      g.vehiculo.placa.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'TODOS' || g.estado === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Catálogo Histórico de Guías de Remisión Emitidas
          </h3>
          <p className="text-xs text-slate-500">
            Total {guias.length} comprobantes electrónicos registrados en el sistema
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por Guía, RUC, Placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 w-48 sm:w-64 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="TODOS">Todos</option>
            <option value="EMITIDA">Emitida</option>
            <option value="EN_TRANSITO">En Tránsito</option>
            <option value="ENTREGADA">Entregada</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">N° Guía</th>
              <th className="py-2.5 px-3">Fecha Emisión</th>
              <th className="py-2.5 px-3">Proveedor / Transportista</th>
              <th className="py-2.5 px-3">Placa</th>
              <th className="py-2.5 px-3">Destino</th>
              <th className="py-2.5 px-3 text-right">Peso Neto Total</th>
              <th className="py-2.5 px-3 text-center">Estado</th>
              <th className="py-2.5 px-3 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((g) => {
              const isSelected = selectedGuia?.idGuia === g.idGuia;
              const fecha = new Date(g.fechaEmision).toLocaleDateString('es-PE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <tr
                  key={g.idGuia}
                  className={`transition-colors ${
                    isSelected ? 'bg-emerald-50/70 font-semibold' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {g.numeroGuia}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{fecha}</td>
                  <td className="py-2.5 px-3 max-w-[200px] truncate" title={g.proveedor.razonSocial}>
                    <div className="font-bold text-slate-900 truncate">{g.proveedor.razonSocial}</div>
                    <div className="text-[10px] text-slate-400 font-mono">RUC: {g.proveedor.ruc}</div>
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold">{g.vehiculo.placa}</td>
                  <td className="py-2.5 px-3 max-w-[180px] truncate text-slate-600" title={g.puntoLlegada.direccion}>
                    {g.puntoLlegada.distrito} - {g.puntoLlegada.provincia}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                    {g.pesoTotalKg?.toLocaleString('es-PE')} kg
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        g.estado === 'EMITIDA'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : g.estado === 'EN_TRANSITO'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {g.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onSelectGuia(g)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 mx-auto ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Printer className="w-3 h-3" />
                      <span>{isSelected ? 'Viendo' : 'Ver Guía'}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
