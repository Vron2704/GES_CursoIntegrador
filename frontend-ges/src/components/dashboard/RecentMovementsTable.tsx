import React from 'react';
import { ArrowDownRight, ArrowUpRight, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const RecentMovementsTable: React.FC = () => {
  const { movimientos, setActiveTab, setSelectedGuia, guias } = useApp();

  const ultimosMovimientos = movimientos.slice(0, 8);

  const handleVerGuia = (numeroGuia?: string) => {
    if (!numeroGuia) return;
    const g = guias.find((item) => item.numeroGuia === numeroGuia);
    if (g) {
      setSelectedGuia(g);
      setActiveTab('impresion-guia');
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Últimas Operaciones de Unidades Logísticas (UULL)
          </h3>
          <p className="text-xs text-slate-500">
            Registro secuencial de ingresos y salidas de jabas, pallets y bines
          </p>
        </div>
        <button
          onClick={() => setActiveTab('kardex')}
          className="text-xs font-bold text-[#00a651] hover:text-[#008f45] hover:underline"
        >
          Ver Historial Completo &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <th className="py-2.5 px-3">Tipo</th>
              <th className="py-2.5 px-3">Hora</th>
              <th className="py-2.5 px-3">Placa</th>
              <th className="py-2.5 px-3">Proveedor / Razón Social</th>
              <th className="py-2.5 px-3">UULL</th>
              <th className="py-2.5 px-3 text-right">Cant. Ingreso</th>
              <th className="py-2.5 px-3 text-right">Cant. Salida</th>
              <th className="py-2.5 px-3 text-center">Estado</th>
              <th className="py-2.5 px-3 text-center">Guía / Doc</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ultimosMovimientos.map((m) => {
              const isIngreso = m.tipoMovimiento === 'INGRESO' && m.cantIngreso > 0;
              const hora = m.hora || new Date(m.fechaHora).toLocaleTimeString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <tr
                  key={m.idMovimiento}
                  className="hover:bg-emerald-50/70 hover:shadow-xs transition-all duration-150 cursor-pointer group border-l-2 border-l-transparent hover:border-l-[#00a651]"
                >
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isIngreso
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isIngreso ? (
                        <>
                          <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                          INGRESO
                        </>
                      ) : (
                        <>
                          <ArrowUpRight className="w-3 h-3 text-blue-600" />
                          SALIDA
                        </>
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{hora}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-slate-900">
                      {m.placaVehiculo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 max-w-[180px] truncate" title={m.razonSocialProveedor}>
                    <div className="font-bold text-slate-800 truncate">{m.razonSocialProveedor}</div>
                    <div className="text-[10px] text-slate-400 font-mono">RUC: {m.rucProveedor}</div>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-700">
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                      {m.uull || 'JABA NEGRA'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                    {m.cantIngreso > 0 ? `${m.cantIngreso.toLocaleString('es-PE')} und` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-black text-blue-700">
                    {m.cantSalida > 0 ? `${m.cantSalida.toLocaleString('es-PE')} und` : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                      {m.estado || 'REGISTRADO'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {(m.guiaSalida || m.numeroGuiaAsociada) ? (
                      <button
                        onClick={() => handleVerGuia(m.guiaSalida || m.numeroGuiaAsociada)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#00a651] font-mono text-[10px] font-bold border border-emerald-200 transition-colors"
                        title="Ver e Imprimir Guía de Remisión"
                      >
                        <FileText className="w-3 h-3" />
                        {m.guiaSalida || m.numeroGuiaAsociada}
                      </button>
                    ) : m.guiaIngreso ? (
                      <span className="font-mono text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                        {m.guiaIngreso}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Ticket Ingreso</span>
                    )}
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
