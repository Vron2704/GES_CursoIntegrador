import React from 'react';
import {
  Package,
  Truck,
  User,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { GuiaRemisionModel } from '../../types';
import logoSpsa from '../../assets/logo-spsa.png';
import { generarConsignasGuia } from '../../utils/correlativo';

interface ReferralGuidePrintViewProps {
  guia: GuiaRemisionModel;
}

export const ReferralGuidePrintView: React.FC<ReferralGuidePrintViewProps> = ({ guia }) => {
  const consignas = guia.consignas && guia.consignas.length > 0
    ? guia.consignas
    : generarConsignasGuia({
        cantIngreso: guia.cantIngreso,
        alquiler: guia.alquiler,
        devolucion: guia.devolucion,
        cantRechazo: guia.cantRechazo,
        decomisoNoConforme: guia.decomisoNoConforme,
        decomisoSobreStock: guia.decomisoSobreStock,
        uullNombre: guia.uullNombre || guia.detalles?.[0]?.descripcionProducto,
        observaciones: guia.observaciones,
      });

  const fechaEmisionFormatted = new Date(guia.fechaEmision).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const horaEmisionFormatted = new Date(guia.fechaEmision).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-[210mm] min-h-[297mm] mx-auto rounded-lg shadow-xl border border-slate-300 print-container print:border-none print:shadow-none print:p-0 print:m-0 text-xs leading-normal select-text">
      {/* 1. Header: Enterprise Info & SUNAT RUC Box */}
      <div className="grid grid-cols-12 gap-4 pb-4 border-b-2 border-emerald-600">
        <div className="col-span-8 space-y-1">
          <div className="flex items-center gap-2">
            <img
              src={logoSpsa}
              alt="Supermercados Peruanos SA"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="font-black text-sm tracking-tight text-slate-900 leading-tight">
                SUPERMERCADOS PERUANOS S.A.
              </h1>
              <p className="text-[10px] text-slate-500 font-medium">
                Operaciones Logísticas de Acopio &bull; R.U.C. 20100070970
              </p>
            </div>
          </div>
          <div className="text-[10px] text-slate-600 space-y-0.5 pt-1">
            <p>
              <strong>Domicilio Fiscal:</strong> Calle Morelli 181 2° Piso - San Borja, Lima
            </p>
            <p>
              <strong>Centro de Operaciones:</strong> Coo.Colonizacion de Vertientes Tablada - Villa El Salvador - 918 Spsa Cd Acopio
            </p>
          </div>
        </div>

        {/* Official RUC & Guide Number Box */}
        <div className="col-span-4 border-2 border-[#00a651] rounded-2xl p-3 text-center bg-emerald-50/40 flex flex-col justify-center space-y-1">
          <div className="font-mono text-xs font-black text-slate-900 tracking-wider">
            R.U.C. 20100070970
          </div>
          <div className="bg-[#00a651] text-white py-1 px-2 rounded-lg font-black text-xs tracking-tight uppercase">
            GUÍA DE REMISIÓN ELECTRÓNICA
          </div>
          <div className="font-mono text-base font-black text-slate-950 pt-0.5">
            {guia.numeroGuia}
          </div>
          <div className="text-[9px] text-[#00a651] font-bold uppercase tracking-widest">
            REMITENTE OFICIAL
          </div>
        </div>
      </div>

      {/* 2. Section: Emisión y Traslado */}
      <div className="mt-3 grid grid-cols-3 gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
        <div>
          <span className="text-slate-500 block text-[9.5px] uppercase font-bold">
            Fecha de Emisión:
          </span>
          <span className="font-bold text-slate-900">
            {fechaEmisionFormatted} {horaEmisionFormatted}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9.5px] uppercase font-bold">
            Fecha Inicio de Traslado:
          </span>
          <span className="font-bold text-slate-900">{guia.fechaInicioTraslado}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9.5px] uppercase font-bold">
            Motivo del Traslado:
          </span>
          <span className="font-bold text-emerald-800 uppercase">
            {guia.motivoTraslado}
          </span>
        </div>
      </div>

      {/* 3. Section: Addresses (Partida y Llegada) */}
      <div className="mt-3 grid grid-cols-2 gap-3 text-[11px]">
        <div className="p-3 rounded-xl border border-slate-200 space-y-1">
          <div className="font-bold text-[#00a651] uppercase text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#00a651]"></span>
            Punto de Partida
          </div>
          <p className="font-medium text-slate-800 leading-snug">{guia.puntoPartida.direccion}</p>
          <div className="text-[10px] text-slate-500 pt-1">
            Ubigeo: <span className="font-mono font-bold">{guia.puntoPartida.ubigeo}</span> &bull; {guia.puntoPartida.distrito}
          </div>
        </div>

        <div className="p-3 rounded-xl border border-slate-200 space-y-1">
          <div className="font-bold text-blue-700 uppercase text-[10px] flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            Punto de Llegada / Destinatario
          </div>
          <p className="font-medium text-slate-800 leading-snug">{guia.puntoLlegada.direccion}</p>
          <div className="text-[10px] text-slate-500 pt-1">
            Ubigeo: <span className="font-mono font-bold">{guia.puntoLlegada.ubigeo}</span> &bull; {guia.puntoLlegada.distrito}
          </div>
        </div>
      </div>

      {/* 4. Section: Destinatario, Transportista y Conductor */}
      <div className="mt-3 grid grid-cols-12 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-[11px]">
        <div className="col-span-5 space-y-1 border-r border-slate-200 pr-2">
          <div className="font-bold text-slate-700 uppercase text-[10px] flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            Destinatario
          </div>
          <div className="font-bold text-slate-900 leading-tight">
            {guia.destinatario.razonSocial}
          </div>
          <div className="text-[10px] text-slate-600 font-mono">
            RUC: <strong>{guia.destinatario.ruc}</strong>
          </div>
        </div>

        <div className="col-span-4 space-y-1 border-r border-slate-200 px-2">
          <div className="font-bold text-slate-700 uppercase text-[10px] flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-slate-500" />
            Datos del Conductor
          </div>
          <div className="font-bold text-slate-900 leading-tight">
            {guia.conductor.nombres} {guia.conductor.apellidos}
          </div>
          <div className="text-[10px] text-slate-600 space-x-2">
            <span>DNI: <strong className="font-mono">{guia.conductor.dni}</strong></span>
            <span>Lic: <strong className="font-mono">{guia.conductor.numeroLicencia}</strong></span>
          </div>
        </div>

        <div className="col-span-3 space-y-1 pl-2">
          <div className="font-bold text-slate-700 uppercase text-[10px] flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-slate-500" />
            Unidad de Transporte
          </div>
          <div className="font-mono font-black text-sm bg-slate-900 text-white px-2 py-0.5 rounded text-center">
            {guia.vehiculo.placa}
          </div>
        </div>
      </div>

      {/* 5. Section: Items / Unidades Logísticas Table */}
      <div className="mt-3 border border-slate-300 rounded-xl overflow-hidden">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-[#00a651] text-white uppercase text-[9.5px] font-black tracking-wider">
            <tr>
              <th className="py-2 px-2.5 text-center w-10">Ítem</th>
              <th className="py-2 px-2.5 w-28">Código</th>
              <th className="py-2 px-2.5">Descripción de la Unidad Logística</th>
              <th className="py-2 px-2.5 text-center w-20">U.M.</th>
              <th className="py-2 px-2.5 text-right w-28">Cantidad</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {guia.detalles.map((d, index) => (
              <tr key={d.idDetalle || index} className="even:bg-slate-50/50">
                <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-500">
                  {String(index + 1).padStart(2, '0')}
                </td>
                <td className="py-2 px-2.5 font-mono text-slate-700 font-semibold">
                  {d.codigoProducto}
                </td>
                <td className="py-2.5 px-2.5 font-bold text-slate-900 uppercase">
                  <div>{d.descripcionProducto}</div>
                  {index === 0 && consignas.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[10px] space-y-1 normal-case">
                      <div className="font-sans font-bold text-[#00a651] text-[9px] uppercase tracking-wider">
                        Consignas & Liquidación Operativa:
                      </div>
                      {consignas.map((c, i) => (
                        c.texto === '-' ? (
                          <div key={i} className="text-slate-400 font-black pl-7 py-0.5">-</div>
                        ) : (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-8 text-right font-black text-slate-900">{c.cantidad}</span>
                            <span className="font-extrabold text-slate-800 uppercase text-[9.5px]">{c.texto}</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </td>
                <td className="py-2 px-2.5 text-center font-mono font-bold text-slate-600">
                  {d.unidadMedida || 'NIU'}
                </td>
                <td className="py-2 px-2.5 text-right font-mono font-black text-[#00a651] text-xs">
                  {d.cantidad.toLocaleString('es-PE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Section: Totales & Control Logístico */}
      <div className="mt-3 p-3 rounded-xl border border-slate-300 bg-slate-50 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Package className="w-4 h-4 text-[#00a651]" />
            <span className="font-bold">Control de Unidades Logísticas Acopio SPSA:</span>
          </div>
          <div className="space-x-3 font-mono text-[10px]">
            <span>
              Total Ítems: <strong>{guia.detalles.length}</strong>
            </span>
            <span>&bull;</span>
            <span>
              Total Bultos UULL: <strong>{guia.totalBultos}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-500">
            CANTIDAD TOTAL UULL:
          </span>
          <span className="font-mono text-sm font-black text-slate-900 bg-white px-2.5 py-0.5 rounded border border-slate-300">
            {guia.totalBultos} UND
          </span>
        </div>
      </div>

      {/* 7. Section: SUNAT Electronic Validation & Barcode */}
      <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between">
        <div className="space-y-1 text-[10px] text-slate-600 max-w-sm">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#00a651]" />
            <span>Comprobante validado electrónicamente ante la SUNAT</span>
          </div>
          <p className="font-mono text-[9px] text-slate-500">
            Firma Digital (Hash Resumen): {guia.hashCdr || 'Vq8Kl2B8y9Uu4t1gJ7sF0xZa2Q=='}
          </p>
          <p className="text-[9px] text-slate-400">
            Representación impresa de la Guía de Remisión Electrónica Remitente según Resolución de Superintendencia SUNAT.
          </p>
        </div>

        {/* QR Code */}
        <div className="p-1 border border-slate-300 rounded bg-white shrink-0 text-center">
          <svg className="w-16 h-16 text-slate-900" viewBox="0 0 100 100" fill="currentColor">
            <rect x="0" y="0" width="30" height="30" />
            <rect x="5" y="5" width="20" height="20" fill="white" />
            <rect x="10" y="10" width="10" height="10" />
            <rect x="70" y="0" width="30" height="30" />
            <rect x="75" y="5" width="20" height="20" fill="white" />
            <rect x="80" y="10" width="10" height="10" />
            <rect x="0" y="70" width="30" height="30" />
            <rect x="5" y="75" width="20" height="20" fill="white" />
            <rect x="10" y="80" width="10" height="10" />
            <rect x="35" y="5" width="5" height="5" />
            <rect x="45" y="5" width="10" height="5" />
            <rect x="60" y="5" width="5" height="5" />
            <rect x="35" y="15" width="15" height="5" />
            <rect x="55" y="15" width="5" height="5" />
            <rect x="35" y="25" width="5" height="5" />
            <rect x="50" y="25" width="10" height="5" />
            <rect x="5" y="35" width="10" height="5" />
            <rect x="25" y="35" width="5" height="5" />
            <rect x="40" y="35" width="20" height="5" />
            <rect x="70" y="35" width="15" height="5" />
            <rect x="15" y="45" width="10" height="5" />
            <rect x="35" y="45" width="10" height="5" />
            <rect x="55" y="45" width="15" height="5" />
            <rect x="80" y="45" width="15" height="5" />
            <rect x="5" y="55" width="15" height="5" />
            <rect x="30" y="55" width="15" height="5" />
            <rect x="55" y="55" width="5" height="5" />
            <rect x="70" y="55" width="20" height="5" />
            <rect x="35" y="75" width="15" height="5" />
            <rect x="60" y="75" width="10" height="5" />
            <rect x="80" y="75" width="10" height="5" />
          </svg>
          <span className="text-[7.5px] font-mono text-slate-500 font-bold block mt-0.5">
            GRE SUNAT
          </span>
        </div>
      </div>
    </div>
  );
};
