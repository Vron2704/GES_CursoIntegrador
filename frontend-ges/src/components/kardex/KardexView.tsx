import React, { useState } from 'react';
import {
  History,
  Search,
  Download,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  Package,
  Layers,
  RotateCw,
  Database,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const KardexView: React.FC = () => {
  const {
    movimientos,
    proveedores,
    setSelectedGuia,
    guias,
    setActiveTab,
    dbStatus,
    isSyncingDb,
    sincronizarConBaseDeDatos,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFilter, setTipoFilter] = useState<'TODOS' | 'INGRESO' | 'SALIDA'>('TODOS');
  const [proveedorFilter, setProveedorFilter] = useState<string>('TODOS');
  const [uullFilter, setUullFilter] = useState<string>('TODOS');

  // Filter logic
  const filtered = movimientos.filter((m) => {
    const matchesSearch =
      m.placaVehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.razonSocialProveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.rucProveedor.includes(searchTerm) ||
      m.nombreConductor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.guiaIngreso && m.guiaIngreso.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.guiaSalida && m.guiaSalida.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.numeroGuiaAsociada && m.numeroGuiaAsociada.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (m.uull && m.uull.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTipo = tipoFilter === 'TODOS' || m.tipoMovimiento === tipoFilter;
    const matchesProveedor = proveedorFilter === 'TODOS' || m.rucProveedor === proveedorFilter;
    const matchesUull = uullFilter === 'TODOS' || m.uull === uullFilter;

    return matchesSearch && matchesTipo && matchesProveedor && matchesUull;
  });

  // Calculate totals of UULL
  const totalUullIngreso = filtered.reduce((acc, curr) => acc + (curr.cantIngreso || 0), 0);
  const totalUullSalida = filtered.reduce((acc, curr) => acc + (curr.cantSalida || 0), 0);
  const stockNeto = totalUullIngreso - totalUullSalida;

  const handleExportCsv = () => {
    const headers = [
      'ID_Movimiento',
      'Tipo',
      'Fecha_Hora',
      'RUC_Proveedor',
      'Razon_Social',
      'UULL',
      'Guia_Ingreso',
      'Cant_Ingreso',
      'Cant_Rechazo',
      'Decomiso_No_Conforme',
      'Decomiso_Sobre_Stock',
      'Alquiler',
      'Devolucion',
      'Guia_Salida',
      'Cant_Salida',
      'Stock',
      'Placa',
      'Conductor_DNI',
      'Observaciones',
    ];

    const rows = filtered.map((m) => [
      m.idMovimiento,
      m.tipoMovimiento,
      m.fechaHora,
      m.rucProveedor,
      `"${m.razonSocialProveedor.replace(/"/g, '""')}"`,
      `"${m.uull}"`,
      m.guiaIngreso || '',
      m.cantIngreso || 0,
      m.cantRechazo || 0,
      m.decomisoNoConforme || 0,
      m.decomisoSobreStock || 0,
      m.alquiler || 0,
      m.devolucion || 0,
      m.guiaSalida || m.numeroGuiaAsociada || '',
      m.cantSalida || 0,
      m.stock ?? 0,
      m.placaVehiculo,
      m.dniConductor,
      `"${(m.observaciones || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kardex_uull_historico_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewGuia = (numeroGuia?: string) => {
    if (!numeroGuia) return;
    const g = guias.find((item) => item.numeroGuia === numeroGuia);
    if (g) {
      setSelectedGuia(g);
      setActiveTab('impresion-guia');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
            <History className="w-4 h-4 text-[#00a651]" />
            Auditoría de Kardex & Historial de Unidades Logísticas
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kardex Histórico de Proveedores & UULL
          </h2>
          <p className="text-xs text-slate-500">
            Registro cronológico de guías de ingreso, guías de salida, calidad y balance de stock de unidades logísticas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sincronizarConBaseDeDatos()}
            disabled={isSyncingDb}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-xs cursor-pointer"
            title="Sincronizar con base de datos"
          >
            <RotateCw className={`w-3.5 h-3.5 text-[#00a651] ${isSyncingDb ? 'animate-spin' : ''}`} />
            <span>{isSyncingDb ? 'Sincronizando...' : 'Actualizar BD'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar Excel</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip (UULL Totals) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Layers className="w-3 h-3 text-slate-400" /> Total Registros
          </span>
          <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
            {filtered.length.toLocaleString('es-PE')}
          </div>
          <div className="text-[10px] text-slate-400">Movimientos auditados</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
            <ArrowDownRight className="w-3 h-3 text-emerald-500" /> Cant. UULL Ingreso
          </span>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-0.5">
            {totalUullIngreso.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-emerald-600 font-medium">Recepción acumulada</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3 text-blue-500" /> Cant. UULL Salida
          </span>
          <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">
            {totalUullSalida.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-blue-600 font-medium">Despacho acumulado</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase flex items-center gap-1">
            <Package className="w-3 h-3 text-amber-500" /> Saldo Stock UULL
          </span>
          <div className="text-2xl font-black text-amber-600 font-mono mt-0.5">
            {stockNeto.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-amber-700 font-medium">En rotación continua</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por placa, RUC, proveedor, guía de ingreso (EG07...), guía de salida (T725...) o UULL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#00a651]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo filter */}
          <select
            value={tipoFilter}
            onChange={(e) => setTipoFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="TODOS">Todos los Tipos</option>
            <option value="INGRESO">Solo Ingresos</option>
            <option value="SALIDA">Solo Salidas</option>
          </select>

          {/* UULL filter */}
          <select
            value={uullFilter}
            onChange={(e) => setUullFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="TODOS">Todas las UULL</option>
            <option value="JABA NEGRA">JABA NEGRA</option>
            <option value="PALLET EAN">PALLET EAN</option>
            <option value="JABA VERDE">JABA VERDE</option>
            <option value="JABA ROJA">JABA ROJA</option>
            <option value="ROLL TAINER">ROLL TAINER</option>
          </select>

          {/* Proveedor filter */}
          <select
            value={proveedorFilter}
            onChange={(e) => setProveedorFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white max-w-[200px]"
          >
            <option value="TODOS">Todos los Proveedores</option>
            {proveedores.map((p) => (
              <option key={p.ruc} value={p.ruc}>
                {p.razonSocial.slice(0, 25)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase text-[9.5px]">
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Fecha & Turno</th>
                <th className="py-2.5 px-3">Proveedor / RUC</th>
                <th className="py-2.5 px-3">UULL</th>
                <th className="py-2.5 px-3 text-center">Guía Ingreso</th>
                <th className="py-2.5 px-3 text-right">Cant. Ingreso</th>
                <th className="py-2.5 px-3 text-right">Decomisos / Calidad</th>
                <th className="py-2.5 px-3 text-center">Guía Salida</th>
                <th className="py-2.5 px-3 text-right">Cant. Salida</th>
                <th className="py-2.5 px-3 text-center">Estado</th>
                <th className="py-2.5 px-3">Placa</th>
                <th className="py-2.5 px-3 text-right">Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 100).map((m) => {
                const isIngreso = m.tipoMovimiento === 'INGRESO' && m.cantIngreso > 0;
                const fecha = new Date(m.fechaHora).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                return (
                  <tr
                    key={m.idMovimiento}
                    className="hover:bg-emerald-50/70 hover:shadow-xs transition-all duration-150 cursor-pointer group border-l-2 border-l-transparent hover:border-l-[#00a651]"
                  >
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${
                          isIngreso
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {isIngreso ? (
                          <>
                            <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                            ING
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-blue-600" />
                            SAL
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600 text-[11px]">
                      <div>{fecha}</div>
                      <div className="text-[9.5px] text-slate-400">{m.turno || '1-MAÑANA'}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[200px] truncate" title={m.razonSocialProveedor}>
                      <div className="font-bold text-slate-900 truncate">{m.razonSocialProveedor}</div>
                      <div className="text-[10px] text-slate-400 font-mono">RUC: {m.rucProveedor}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-slate-800 text-[11px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {m.uull || 'JABA NEGRA'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                      {m.guiaIngreso || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700 text-xs">
                      {m.cantIngreso > 0 ? m.cantIngreso.toLocaleString('es-PE') : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-rose-600 text-xs font-semibold">
                      {((m.decomisoSobreStock || 0) + (m.decomisoNoConforme || 0) + (m.cantRechazo || 0)) > 0
                        ? `-${(m.decomisoSobreStock || 0) + (m.decomisoNoConforme || 0) + (m.cantRechazo || 0)}`
                        : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {(m.guiaSalida || m.numeroGuiaAsociada) ? (
                        <button
                          type="button"
                          onClick={() => handleViewGuia(m.guiaSalida || m.numeroGuiaAsociada)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-[#00a651] font-mono text-[10px] font-bold border border-emerald-200 transition-colors"
                        >
                          <FileText className="w-3 h-3" />
                          {m.guiaSalida || m.numeroGuiaAsociada}
                        </button>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black text-blue-700 text-xs">
                      {m.cantSalida > 0 ? m.cantSalida.toLocaleString('es-PE') : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                        {m.estado || 'REGISTRADO'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      {m.placaVehiculo}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                      {m.stock !== undefined ? m.stock : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length > 100 && (
          <div className="p-3 text-center text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
            Mostrando los primeros 100 de {filtered.length} movimientos. Use los filtros superiores o exporte a CSV para ver todos.
          </div>
        )}
      </div>
    </div>
  );
};
