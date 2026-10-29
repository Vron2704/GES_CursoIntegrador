import React from 'react';
import { Truck, AlertCircle, Package, Clock } from 'lucide-react';
import { MovimientoModel } from '../../types';

interface VehicleYardSelectorProps {
  unidadesEnPatio: MovimientoModel[];
  selectedId: number | null;
  onSelect: (movimiento: MovimientoModel) => void;
  onGoToEntry?: () => void;
}

export const VehicleYardSelector: React.FC<VehicleYardSelectorProps> = ({
  unidadesEnPatio,
  selectedId,
  onSelect,
  onGoToEntry,
}) => {
  if (unidadesEnPatio.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            No hay unidades en espera para despacho actualmente
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Primero debe registrar el ingreso de un camión y sus unidades logísticas.
          </p>
        </div>
        {onGoToEntry && (
          <button
            type="button"
            onClick={onGoToEntry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00a651] hover:bg-[#008f45] text-white font-bold text-xs shadow-xs transition-all"
          >
            <span>+ Registrar Ingreso de Camión</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Seleccionar Unidad en Espera para Despacho / Salida ({unidadesEnPatio.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Paso 1 de 2</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {unidadesEnPatio.map((unidad) => {
          const isSelected = selectedId === unidad.idMovimiento;

          return (
            <div
              key={unidad.idMovimiento}
              onClick={() => onSelect(unidad)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                  {unidad.placaVehiculo}
                </span>
                <span className="text-[10px] font-bold text-[#00a651] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  En Espera
                </span>
              </div>

              <div className="text-xs font-bold text-slate-900 truncate" title={unidad.razonSocialProveedor}>
                {unidad.razonSocialProveedor}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1 text-slate-600 font-medium">
                  <Package className="w-3.5 h-3.5 text-[#00a651]" />
                  <span>{unidad.uull || 'JABA NEGRA'}:</span>
                </div>
                <span className="font-mono font-black text-slate-900">
                  {(unidad.cantIngreso || 105).toLocaleString('es-PE')} und
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
