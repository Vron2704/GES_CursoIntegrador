import React from 'react';
import { Truck, Clock, AlertTriangle, ArrowRight, Package, CheckCircle2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ActiveYardMonitor: React.FC = () => {
  const { unidadesEnPatio, setActiveTab, canRegister } = useApp();

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-[#00a651] border border-emerald-200">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              Unidades en Espera de Despacho (UULL)
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-[#00a651]">
                {unidadesEnPatio.length} unidades activas
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Vehículos en planta pendientes de retiro o devolución de unidades logísticas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canRegister && (
            <button
              onClick={() => setActiveTab('registro-salida')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <span>Despachar Salida</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {unidadesEnPatio.length === 0 ? (
        <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-[#00a651] mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-700">Sin Unidades en Espera</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Actualmente no hay unidades pendientes de retiro o devolución de unidades logísticas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {unidadesEnPatio.slice(0, 6).map((unidad) => {
            const ingresoTime = new Date(unidad.fechaHora).getTime();
            const now = Date.now();
            const mins = Math.max(5, Math.floor((now - ingresoTime) / (1000 * 60)));

            const isHighDelay = mins > 120;
            const isMediumDelay = mins > 60 && mins <= 120;

            const timeBadgeColor = isHighDelay
              ? 'bg-rose-100 text-rose-800 border-rose-300'
              : isMediumDelay
              ? 'bg-amber-100 text-amber-800 border-amber-300'
              : 'bg-emerald-100 text-emerald-800 border-emerald-300';

            return (
              <div
                key={unidad.idMovimiento}
                className="p-4 rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/60 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md tracking-wider">
                      {unidad.placaVehiculo}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${timeBadgeColor}`}
                    >
                      {isHighDelay && <AlertTriangle className="w-3 h-3 text-rose-600 animate-bounce" />}
                      <Clock className="w-3 h-3" />
                      {mins} min
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-800 line-clamp-1 mb-0.5">
                    {unidad.razonSocialProveedor}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mb-2">
                    RUC: {unidad.rucProveedor}
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-600 border-t border-slate-100 pt-2 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Guía de Ingreso:</span>
                      <span className="font-bold text-slate-800 font-mono">
                        {unidad.guiaIngreso || '-'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Estado:</span>
                      <span className="font-bold text-[#00a651] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">
                        PENDIENTE SALIDA
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Carga UULL:</span>
                      <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
                        <Package className="w-3 h-3 text-[#00a651]" />
                        {unidad.uull || 'JABA NEGRA'}: {(unidad.cantIngreso || 105).toLocaleString('es-PE')} und
                      </span>
                    </div>
                  </div>
                </div>

                {canRegister ? (
                  <button
                    onClick={() => setActiveTab('registro-salida')}
                    className="w-full mt-1 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-blue-400" />
                    <span>Dar Salida & Emitir Guía</span>
                  </button>
                ) : (
                  <div className="w-full mt-1 py-1.5 px-3 rounded-xl bg-slate-100 text-slate-600 text-[11px] font-bold flex items-center justify-center gap-1.5 border border-slate-200">
                    <span>En Proceso de Despacho</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
