import React from 'react';
import { X, Printer, CheckCircle, Package, ArrowRight, Plus } from 'lucide-react';
import { MovimientoModel } from '../../types';
import logoSpsa from '../../assets/logo-spsa.png';

interface EntryTicketModalProps {
  movimiento: MovimientoModel | null;
  onClose: () => void;
  onPrint: () => void;
  onProceedToExit?: () => void;
}

export const EntryTicketModal: React.FC<EntryTicketModalProps> = React.memo(({
  movimiento,
  onClose,
  onPrint,
  onProceedToExit,
}) => {
  if (!movimiento) return null;

  const fechaFormateada = new Date(movimiento.fechaHora).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in no-print">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#00a651]" />
            <h3 className="text-sm font-bold tracking-tight">
              Constancia de Ingreso de UULL - Acopio SPSA
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Ticket Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center font-mono text-xs text-slate-800 space-y-3">
            <div className="border-b border-dashed border-slate-300 pb-3 flex flex-col items-center">
              <img
                src={logoSpsa}
                alt="Supermercados Peruanos SA"
                className="h-9 w-auto object-contain mb-1.5"
              />
              <div className="font-sans font-black text-xs tracking-tight text-slate-900">
                SUPERMERCADOS PERUANOS S.A.
              </div>
              <div className="text-[10px] text-slate-500">R.U.C. 20100070970</div>
              <div className="text-[10px] text-slate-500">
                Centro de Acopio Tablada - Villa El Salvador (918-Spsa Cd Acopio)
              </div>
              <div className="mt-2 text-xs font-bold bg-emerald-50 text-[#00a651] py-1 px-3 rounded w-full border border-emerald-200">
                INGRESO DE UNIDADES LOGÍSTICAS N° REC-00{movimiento.idMovimiento.toString().slice(-5)}
              </div>
            </div>

            <div className="text-left space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Fecha/Hora:</span>
                <span className="font-bold">{fechaFormateada}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Área / Zona:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Zona UULL Acopio
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Turno:</span>
                <span className="font-bold">{movimiento.turno}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operador:</span>
                <span className="font-bold">{movimiento.usuarioRegistro}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 my-1"></div>
              <div className="flex justify-between">
                <span className="text-slate-500">Placa Vehicular:</span>
                <span className="font-bold text-sm bg-slate-900 text-white px-2 py-0.5 rounded">
                  {movimiento.placaVehiculo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Conductor:</span>
                <span className="font-bold">{movimiento.nombreConductor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">DNI / Licencia:</span>
                <span>{movimiento.dniConductor} / {movimiento.licenciaConductor || '-'}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 my-1"></div>
              <div className="flex justify-between">
                <span className="text-slate-500">Proveedor:</span>
                <span className="font-bold truncate max-w-[170px]" title={movimiento.razonSocialProveedor}>
                  {movimiento.razonSocialProveedor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RUC:</span>
                <span>{movimiento.rucProveedor}</span>
              </div>
              {movimiento.guiaIngreso && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Guía Ingreso Prov:</span>
                  <span className="font-mono font-bold text-slate-900">{movimiento.guiaIngreso}</span>
                </div>
              )}
            </div>

            {/* UULL Display Box */}
            <div className="my-3 p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950 text-white text-center">
              <div className="text-[10px] text-emerald-400 font-sans uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                <Package className="w-3.5 h-3.5" />
                UNIDAD LOGÍSTICA (UULL)
              </div>
              <div className="text-xl font-black text-white mt-0.5">
                {movimiento.uull || 'JABA NEGRA'}
              </div>
              <div className="text-3xl font-black text-[#00a651] tracking-tight mt-1">
                {movimiento.cantIngreso.toLocaleString('es-PE')} <span className="text-sm text-slate-300 font-semibold">UND</span>
              </div>
              <div className="text-[9.5px] text-slate-300 mt-1">
                Gestión directa de UULL &bull; Exclusivo área logística acopio
              </div>
            </div>

            {/* Barcode representation */}
            <div className="pt-2 text-center">
              <div className="inline-block px-4 py-1.5 bg-slate-100 rounded tracking-widest text-slate-900 font-mono text-[13px] border border-slate-200">
                ||| | ||||| || |||| ||| ||||||| | ||
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                *REC{movimiento.idMovimiento}*
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions - Simplified Workflow */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-slate-400" />
              <span>Registrar Siguiente Ingreso</span>
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Imprimir</span>
            </button>
          </div>

          {onProceedToExit && (
            <button
              type="button"
              onClick={onProceedToExit}
              className="px-4 py-2 rounded-xl bg-[#00a651] hover:bg-[#008f45] active:scale-98 text-white text-xs font-black transition-all shadow-sm flex items-center gap-2"
            >
              <span>Proceder a Salida / Despacho</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

export const WeightTicketModal = EntryTicketModal;
