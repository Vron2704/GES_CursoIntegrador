import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Clock,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Sliders,
  FileText,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StockProveedorResumen } from '../../types';

export const SupplierStockView: React.FC = () => {
  const {
    resumenStockProveedores,
    movimientos,
    actualizarStockInicialProveedor,
    ejecutarCorte4AM,
    setActiveTab,
    canRegister,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRuc, setSelectedRuc] = useState<string>('10065800425'); // Cabanillas by default
  const [estadoFilter, setEstadoFilter] = useState<string>('TODOS');

  // Modal for editing Corte Inicial (Debt cut-off)
  const [showEditCutModal, setShowEditCutModal] = useState(false);
  const [editInitialStock, setEditInitialStock] = useState<number>(100);

  // Filtered providers
  const filteredProveedores = useMemo(() => {
    return resumenStockProveedores.filter((p) => {
      const matchSearch =
        p.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ruc.includes(searchTerm);

      const matchEstado =
        estadoFilter === 'TODOS' || p.estadoDeuda === estadoFilter;

      return matchSearch && matchEstado;
    });
  }, [resumenStockProveedores, searchTerm, estadoFilter]);

  // Selected provider details
  const selectedProveedor = useMemo(() => {
    return (
      resumenStockProveedores.find((p) => p.ruc === selectedRuc) ||
      resumenStockProveedores[0] ||
      null
    );
  }, [resumenStockProveedores, selectedRuc]);

  // Movements of selected provider
  const movimientosProveedor = useMemo(() => {
    if (!selectedProveedor) return [];
    return movimientos
      .filter((m) => m.rucProveedor === selectedProveedor.ruc)
      .slice(0, 50);
  }, [movimientos, selectedProveedor]);

  // Totals for top cards
  const statsTotales = useMemo(() => {
    const totalProveedores = resumenStockProveedores.length;
    const totalStockEnCampo = resumenStockProveedores.reduce((acc, p) => acc + Math.max(0, p.stockActual), 0);
    const totalAlquiler = resumenStockProveedores.reduce((acc, p) => acc + p.totalAlquiler, 0);
    const totalDecomisos = resumenStockProveedores.reduce(
      (acc, p) => acc + p.totalDecomisoSobreStock + p.totalDecomisoNoConforme,
      0
    );

    return { totalProveedores, totalStockEnCampo, totalAlquiler, totalDecomisos };
  }, [resumenStockProveedores]);

  const handleOpenEditCut = () => {
    if (!selectedProveedor) return;
    setEditInitialStock(selectedProveedor.stockInicial);
    setShowEditCutModal(true);
  };

  const handleSaveEditCut = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProveedor) return;
    actualizarStockInicialProveedor(selectedProveedor.ruc, Number(editInitialStock));
    setShowEditCutModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#00a651] uppercase tracking-widest mb-1">
            <Boxes className="w-4 h-4 text-[#00a651]" />
            Área de Unidades Logísticas &bull; Control de Saldos & Alquiler
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Control de Stock & Deuda de Jabas por Proveedor
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestión del corte de deuda mensual, alquileres por demanda, devoluciones, calidad y decomisos sobre-stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canRegister && (
            <button
              type="button"
              onClick={() => ejecutarCorte4AM()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-all shadow-xs"
              title="Convierte unidades pendientes pasadas de las 4 AM en devolución automática"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Ejecutar Corte 4:00 AM</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab('registro-salida')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-xs"
          >
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
            <span>Generar Guía de Salida</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Proveedores Activos</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono mt-1">
            {statsTotales.totalProveedores}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">En registro de acopio</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-600 uppercase">Jabas en Campo</span>
            <Boxes className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono mt-1">
            {statsTotales.totalStockEnCampo.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-blue-600/80 mt-0.5">Saldo en poder de proveedores</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase">Alquiler Acumulado</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
            {statsTotales.totalAlquiler.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-emerald-600/80 mt-0.5">Alquiler para demanda de cosecha</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-600 uppercase">Decomisos & Rechazos</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-700 font-mono mt-1">
            {statsTotales.totalDecomisos.toLocaleString('es-PE')} <span className="text-xs">und</span>
          </div>
          <div className="text-[10px] text-rose-600/80 mt-0.5">Sobre-stock y no conformes</div>
        </div>
      </div>

      {/* Main Grid: Supplier List (Left 4 cols) & Supplier Detail Card + Movements (Right 8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Supplier Directory & Quick Search */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-[#00a651]" />
              Proveedores UULL
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredProveedores.length}
            </span>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por RUC o Razón Social..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-[10px] font-bold">
            {['TODOS', 'STOCK_ALTO', 'REGULAR', 'AL_DIA', 'SOBREGIRADO'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setEstadoFilter(st)}
                className={`px-2 py-1 rounded-lg shrink-0 transition-all ${
                  estadoFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Supplier List */}
          <div className="divide-y divide-slate-100 max-h-[560px] overflow-y-auto pr-1">
            {filteredProveedores.map((p) => {
              const isSelected = selectedRuc === p.ruc;
              return (
                <button
                  key={p.ruc}
                  type="button"
                  onClick={() => setSelectedRuc(p.ruc)}
                  className={`w-full text-left py-2.5 px-2 rounded-xl transition-all my-0.5 ${
                    isSelected
                      ? 'bg-emerald-50 border border-emerald-300 shadow-xs'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">
                      {p.razonSocial}
                    </span>
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        p.stockActual > 250
                          ? 'bg-amber-100 text-amber-800'
                          : p.stockActual < 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stockActual} und
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span className="font-mono">RUC: {p.ruc}</span>
                    <span>Corte: {p.stockInicial}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Supplier Account Balance & Operations */}
        <div className="lg:col-span-8 space-y-5">
          {selectedProveedor ? (
            <>
              {/* Account Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900">
                        {selectedProveedor.razonSocial}
                      </h2>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                        RUC: {selectedProveedor.ruc}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cuenta corriente de unidades logísticas
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {canRegister && (
                      <button
                        type="button"
                        onClick={handleOpenEditCut}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all"
                      >
                        <Sliders className="w-3.5 h-3.5 text-[#00a651]" />
                        <span>Ajustar Corte de Mes</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Stock Balance Formula Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  {/* 1. Corte inicial */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">
                      Corte Inicial
                    </span>
                    <span className="text-lg font-black text-slate-800 font-mono">
                      {selectedProveedor.stockInicial}
                    </span>
                    <span className="text-[9px] text-slate-400 block">Deuda mes</span>
                  </div>

                  {/* 2. Salidas / Alquiler (+) */}
                  <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                    <span className="text-[10px] font-bold text-blue-700 uppercase block">
                      (+) Salidas / Alquiler
                    </span>
                    <span className="text-lg font-black text-blue-800 font-mono">
                      {selectedProveedor.totalSalida + selectedProveedor.totalAlquiler}
                    </span>
                    <span className="text-[9px] text-blue-600 block">
                      Alq: {selectedProveedor.totalAlquiler}
                    </span>
                  </div>

                  {/* 3. Ingresos / Devolución (-) */}
                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      (-) Retornos / Ingreso
                    </span>
                    <span className="text-lg font-black text-emerald-800 font-mono">
                      {selectedProveedor.totalIngreso + selectedProveedor.totalDevolucion}
                    </span>
                    <span className="text-[9px] text-emerald-600 block">
                      Dev: {selectedProveedor.totalDevolucion}
                    </span>
                  </div>

                  {/* 4. Decomisos & Rechazo (-) */}
                  <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                    <span className="text-[10px] font-bold text-rose-700 uppercase block">
                      (-) Decomisos
                    </span>
                    <span className="text-lg font-black text-rose-800 font-mono">
                      {selectedProveedor.totalDecomisoSobreStock + selectedProveedor.totalDecomisoNoConforme}
                    </span>
                    <span className="text-[9px] text-rose-600 block">
                      Exceso: {selectedProveedor.totalDecomisoSobreStock}
                    </span>
                  </div>

                  {/* 5. Stock Actual Saldo */}
                  <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase block">
                      Stock en Poder
                    </span>
                    <span className="text-lg font-black text-white font-mono">
                      {selectedProveedor.stockActual}
                    </span>
                    <span className="text-[9px] text-slate-300 block">Saldo Actual</span>
                  </div>
                </div>

                {/* Practical Example Note for User */}
                <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00a651] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">
                      Caso Operativo del Área de Unidades Logísticas:
                    </span>{' '}
                    Si el proveedor tiene a corte <span className="font-mono font-bold">{selectedProveedor.stockInicial} jabas</span> y necesita traer <span className="font-mono font-bold">{selectedProveedor.stockInicial + 50} jabas</span> de mandarina/fruta, solicita un alquiler de <span className="font-mono font-bold">50 jabas</span> al área de UULL. Las jabas rotas o sobre-stock detectadas por Calidad se decomisan y regulan automáticamente la deuda.
                  </div>
                </div>
              </div>

              {/* Historical Movements Table of Selected Provider */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#00a651]" />
                    <h3 className="text-sm font-black text-slate-800">
                      Historial de Movimientos de {selectedProveedor.razonSocial.split(' ')[0]}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {movimientosProveedor.length} transacciones
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Fecha / Hora</th>
                        <th className="py-2.5 px-2">Tipo</th>
                        <th className="py-2.5 px-2">Guía Ingreso</th>
                        <th className="py-2.5 px-2 text-right">Cant Ing.</th>
                        <th className="py-2.5 px-2 text-right">Decomiso</th>
                        <th className="py-2.5 px-2">Guía Salida</th>
                        <th className="py-2.5 px-2 text-right">Cant Sal.</th>
                        <th className="py-2.5 px-3">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movimientosProveedor.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-400">
                            No hay movimientos registrados para este proveedor.
                          </td>
                        </tr>
                      ) : (
                        movimientosProveedor.map((m) => (
                          <tr key={m.idMovimiento} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 font-mono text-[11px] text-slate-600">
                              {m.fechaHora.split('T')[0]} {m.hora?.slice(0, 5)}
                            </td>
                            <td className="py-2 px-2">
                              <span
                                className={`inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded ${
                                  m.tipoMovimiento === 'INGRESO'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-blue-50 text-blue-700'
                                }`}
                              >
                                {m.tipoMovimiento === 'INGRESO' ? (
                                  <ArrowDownLeft className="w-2.5 h-2.5" />
                                ) : (
                                  <ArrowUpRight className="w-2.5 h-2.5" />
                                )}
                                {m.tipoMovimiento}
                              </span>
                            </td>
                            <td className="py-2 px-2 font-mono text-[11px] text-slate-700">
                              {m.guiaIngreso || '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-emerald-700">
                              {m.cantIngreso > 0 ? `+${m.cantIngreso}` : '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-rose-600">
                              {(m.decomisoSobreStock || 0) + (m.decomisoNoConforme || 0) > 0
                                ? `-${(m.decomisoSobreStock || 0) + (m.decomisoNoConforme || 0)}`
                                : '-'}
                            </td>
                            <td className="py-2 px-2 font-mono text-[11px] text-blue-800 font-bold">
                              {m.guiaSalida || '-'}
                            </td>
                            <td className="py-2 px-2 text-right font-mono font-bold text-blue-700">
                              {m.cantSalida > 0 ? `-${m.cantSalida}` : '-'}
                            </td>
                            <td className="py-2 px-3">
                              <span
                                className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                                  m.estado === 'PENDIENTE_SALIDA'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : m.estado === 'DEVOLUCION_AUTOMATICA'
                                    ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {m.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
              Seleccione un proveedor del panel izquierdo para consultar su saldo y movimientos.
            </div>
          )}
        </div>
      </div>

      {/* Modal to edit initial cut (Corte de deuda mensual) */}
      {showEditCutModal && selectedProveedor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#00a651]" />
                <h3 className="text-base font-black text-slate-900">Ajustar Corte de Deuda Inicial</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditCutModal(false)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditCut} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block">{selectedProveedor.razonSocial}</span>
                <span className="text-slate-500 font-mono">RUC: {selectedProveedor.ruc}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Saldo Inicial de Jabas al Inicio del Mes (Corte de Deuda):
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={editInitialStock}
                  onChange={(e) => setEditInitialStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-lg text-slate-900 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                  required
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Este valor representa las unidades que el proveedor ya tenía en su almacén al momento del corte mensual.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditCutModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a651] hover:bg-[#008f45] text-white font-black text-xs shadow-xs"
                >
                  Guardar Ajuste
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
