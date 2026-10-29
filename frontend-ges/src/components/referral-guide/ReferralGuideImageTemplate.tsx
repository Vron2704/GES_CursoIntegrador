import React, { useState, useMemo } from 'react';
import { GuiaRemisionModel } from '../../types';
import logoSpsa from '../../assets/logo-spsa.png';
import { generarConsignasGuia } from '../../utils/correlativo';

interface ReferralGuideImageTemplateProps {
  guia: GuiaRemisionModel;
}

export const ReferralGuideImageTemplate: React.FC<ReferralGuideImageTemplateProps> = ({ guia }) => {
  // Toggle between 'ELECTRONICA' and 'MANUAL' (defaults to ELECTRONICA as requested by user)
  const [esElectronica, setEsElectronica] = useState(true);

  // Extract values with fallbacks matching the exact image
  const numeroGuia = guia.numeroGuia || 'T725-00587814';
  
  const fechaEmisionDate = guia.fechaEmision ? new Date(guia.fechaEmision) : new Date();
  const fechaFormatted = fechaEmisionDate.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const horaFormatted = fechaEmisionDate.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const primerDetalle = guia.detalles && guia.detalles.length > 0 ? guia.detalles[0] : {
    cantidad: 105,
    unidadMedida: '',
    codigoProducto: '90100126',
    descripcionProducto: 'JABA NEGRA',
    pesoKg: 105,
  };

  const totalCantidad = guia.detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 105;
  const totalItems = guia.detalles?.length || 1;
  const rucDestinatario = guia.destinatario?.ruc || guia.proveedor?.ruc || '20608588273';
  const razonSocialDestinatario = guia.destinatario?.razonSocial || guia.proveedor?.razonSocial || 'CORPORACION AGRICOLA DE FRUTAS Y VEGETALES SOCIEDAD ANONIMA C';

  // Consignas operativas visibles en la guía (Alquiler, Devolución, Rechazos, Decomisos, Ingreso)
  const consignas = useMemo(() => {
    if (guia.consignas && guia.consignas.length > 0) {
      return guia.consignas;
    }
    return generarConsignasGuia({
      cantIngreso: guia.cantIngreso,
      alquiler: guia.alquiler,
      devolucion: guia.devolucion,
      cantRechazo: guia.cantRechazo,
      decomisoNoConforme: guia.decomisoNoConforme,
      decomisoSobreStock: guia.decomisoSobreStock,
      uullNombre: primerDetalle.descripcionProducto,
      observaciones: guia.observaciones,
    });
  }, [guia, primerDetalle]);

  const direccionPartida = guia.puntoPartida?.direccion || 'Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador';
  const ubigeoPartida = guia.puntoPartida?.ubigeo || '150142';
  const direccionLlegada = guia.puntoLlegada?.direccion || 'Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador';
  const ubigeoLlegada = guia.puntoLlegada?.ubigeo || '150142';

  const placaVehiculo = guia.vehiculo?.placa || 'ALT-798';
  const licenciaConductor = guia.conductor?.numeroLicencia || '10115063';
  const modalidadTexto = guia.modalidadTransporte === 'TRANSPORTE_PUBLICO' ? 'Transporte público' : 'Transporte privado';

  return (
    <div className="bg-white text-black font-sans p-6 sm:p-10 max-w-[210mm] min-h-[297mm] mx-auto rounded-lg shadow-xl border border-slate-300 print-container print:border-none print:shadow-none print:p-0 print:m-0 text-[11px] leading-tight select-text relative">
      
      {/* Selector de modo Electrónica vs Manual en pantalla (Oculto en impresión) */}
      <div className="no-print absolute top-3 right-3 flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px]">
        <span className="font-bold text-slate-500 pl-1">Modalidad:</span>
        <button
          type="button"
          onClick={() => setEsElectronica(true)}
          className={`px-2 py-0.5 rounded font-bold transition-all ${
            esElectronica
              ? 'bg-[#00a651] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Electrónica (GRE)
        </button>
        <button
          type="button"
          onClick={() => setEsElectronica(false)}
          className={`px-2 py-0.5 rounded font-bold transition-all ${
            !esElectronica
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manual
        </button>
      </div>

      {/* 1. TOP HEADER: LOGO OFICIAL SPSA, OFICINA PRINCIPAL & RUC BOX */}
      <div className="grid grid-cols-12 gap-4 items-start">
        {/* Left Side: Logo & Addresses */}
        <div className="col-span-8 space-y-2">
          {/* Official Logo Image provided by user */}
          <div className="flex items-center">
            <img
              src={logoSpsa}
              alt="Supermercados Peruanos SA"
              className="h-14 sm:h-16 w-auto object-contain"
            />
          </div>

          {/* Oficina Principal */}
          <div className="pt-2 text-[10px] space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-black">Oficina Principal</span>
              <span className="text-black font-semibold mr-16">{fechaFormatted}</span>
            </div>
            <div className="text-slate-800 text-[9.5px]">
              Calle Morelli 181 2° Piso - Lima - Lima - San Borja
            </div>
          </div>

          {/* Local */}
          <div className="pt-1 text-[10px] space-y-0.5">
            <span className="font-bold text-black block">Local</span>
            <div className="text-slate-800 text-[9.5px]">
              Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador
            </div>
            <div className="text-slate-800 text-[9.5px] font-semibold">
              918-Spsa Cd Acopio
            </div>
          </div>
        </div>

        {/* Right Side: Official Green RUC Document Box */}
        <div className="col-span-4 border-2 border-[#00a651] rounded-2xl p-4 text-center bg-white flex flex-col justify-between min-h-[140px] shadow-xs">
          <div className="text-[12px] font-black text-[#00a651] tracking-wide">
            RUC 20100070970
          </div>

          <div className="my-1">
            <div className="text-[13px] font-black text-[#00a651] tracking-tight leading-snug uppercase">
              {esElectronica ? 'GUIA DE REMISION ELECTRONICA' : 'GUIA DE REMISION MANUAL'}
            </div>
            <div className="text-[13px] font-black text-[#00a651] tracking-tight uppercase">
              REMITENTE
            </div>
          </div>

          <div className="text-[17px] font-black text-black tracking-wider pt-2 font-mono">
            {numeroGuia}
          </div>
        </div>
      </div>

      {/* 2. RECIPIENT HEADER & BOX */}
      <div className="mt-4">
        {/* Header line outside the box */}
        <div className="flex items-center justify-between text-[10px] font-extrabold text-[#00a651] px-1 mb-1">
          <span className="tracking-wider">DATOS DEL DESTINATARIO</span>
          <span className="font-bold text-black">
            FECHA DE EMISION: <span className="font-mono text-black font-extrabold">{fechaFormatted} {horaFormatted}</span>
          </span>
          <div className="text-right leading-tight">
            <div>NRO. ORDEN:</div>
            <div>NRO. CARGA:</div>
          </div>
        </div>

        {/* Box with Green Border */}
        <div className="border-2 border-[#00a651] rounded-xl p-2.5 text-[10px] space-y-1.5 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#00a651]">NRO. DOCUMENTO:</span>
              <span className="font-bold text-black">RUC</span>
              <span className="font-mono font-bold text-black tracking-wider">{rucDestinatario}</span>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <span className="font-bold text-[#00a651]">COD. LOCAL:</span>
              <span className="font-bold text-black uppercase">PROVEEDOR</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-1 pr-2">
              <span className="font-bold text-[#00a651] shrink-0">RAZON SOCIAL / SEÑOR:</span>
              <span className="font-bold text-black uppercase truncate" title={razonSocialDestinatario}>
                {razonSocialDestinatario}
              </span>
            </div>
            <div className="shrink-0 font-bold text-[#00a651]">
              TELEF CLT E:
            </div>
          </div>
        </div>
      </div>

      {/* 3. ITEMS TABLE (Official SPSA Template layout matching physical guide) */}
      <div className="mt-4">
        {/* Table Header Row with Green Border & Rounded Capsule */}
        <div className="border-2 border-[#00a651] rounded-xl flex items-stretch text-center font-bold text-[#00a651] text-[10px] uppercase tracking-wider py-1.5 bg-white shadow-2xs">
          <div className="w-[12%] flex items-center justify-center border-r border-[#00a651] font-extrabold">CANTIDAD</div>
          <div className="w-[10%] flex items-center justify-center border-r border-[#00a651] font-extrabold">UNIDAD MEDIDA</div>
          <div className="w-[12%] flex items-center justify-center border-r border-[#00a651] font-extrabold">CÓDIGO</div>
          <div className="w-[48%] flex items-center justify-center border-r border-[#00a651] font-extrabold">DESCRIPCION</div>
          <div className="w-[18%] flex items-center justify-center font-extrabold">CÓDIGO DE BARRAS</div>
        </div>

        {/* Table Body Box with Green Rounded Outer Border - NO internal vertical divider borders */}
        <div className="mt-2 border-2 border-[#00a651] rounded-xl min-h-[380px] bg-white flex flex-col justify-between overflow-hidden shadow-2xs">
          <div className="flex flex-1 items-stretch text-[10.5px]">
            {/* Col 1: CANTIDAD */}
            <div className="w-[12%] text-center pt-3 space-y-4 font-bold text-black shrink-0">
              <div className="text-[16px] font-black">{primerDetalle.cantidad}</div>
              <div className="text-slate-400 font-bold text-[14px]">-</div>
              <div className="text-slate-400 font-bold text-[14px]">-</div>
              {guia.detalles && guia.detalles.length > 1 && guia.detalles.slice(1).map((d, i) => (
                <div key={i} className="text-[13px] font-bold">{d.cantidad}</div>
              ))}
            </div>

            {/* Col 2: UNIDAD MEDIDA */}
            <div className="w-[10%] text-center pt-3 space-y-4 font-bold text-black shrink-0">
              <div>{primerDetalle.unidadMedida || ''}</div>
              <div className="text-transparent">-</div>
              <div className="text-transparent">-</div>
            </div>

            {/* Col 3: CÓDIGO */}
            <div className="w-[12%] text-center pt-3 space-y-4 font-medium text-black shrink-0">
              <div className="font-mono text-[11px] font-bold">{primerDetalle.codigoProducto || '90100126'}</div>
              <div className="text-transparent">-</div>
              <div className="text-transparent">-</div>
              {guia.detalles && guia.detalles.length > 1 && guia.detalles.slice(1).map((d, i) => (
                <div key={i} className="font-mono text-[11px]">{d.codigoProducto}</div>
              ))}
            </div>

            {/* Col 4: DESCRIPCION (With institutional pastel green stripe & vertical consignas list) */}
            <div className="w-[48%] flex items-stretch">
              {/* Vertical Light Green Stripe Column */}
              <div className="w-32 sm:w-36 bg-[#bbf7d0] h-full pt-3 px-3 text-left font-black text-black text-[11.5px] tracking-tight uppercase shrink-0">
                <div>{primerDetalle.descripcionProducto || 'JABA NEGRA'}</div>
                {guia.detalles && guia.detalles.length > 1 && guia.detalles.slice(1).map((d, i) => (
                  <div key={i} className="mt-4">{d.descripcionProducto}</div>
                ))}
              </div>

              {/* Vertical Consignas Breakdown (Aligned cleanly) */}
              <div className="flex-1 pt-3 pl-5 pr-2 text-left font-bold text-black space-y-3">
                {consignas.map((c, idx) => {
                  if (c.texto === '-') {
                    return (
                      <div key={idx} className="text-slate-400 font-black pl-8 text-[13px] py-0.5">
                        -
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="w-9 text-right font-mono font-black text-[13px] text-black shrink-0">
                        {c.cantidad}
                      </span>
                      <span className="font-black text-black uppercase tracking-tight text-[11.5px]">
                        {c.texto}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Col 5: CÓDIGO DE BARRAS & QR SUNAT */}
            <div className="w-[18%] text-center pt-3 px-2 flex flex-col items-center justify-between pb-3 shrink-0">
              <div className="w-full">
                {/* Barcode Code-128 */}
                <div className="inline-block p-1 bg-slate-50 rounded border border-slate-200">
                  <div className="font-mono text-[11px] font-black tracking-widest text-slate-900 scale-x-90">
                    |||| || |||| ||| |||
                  </div>
                  <div className="text-[7.5px] font-mono text-slate-500 font-bold">
                    *{primerDetalle.codigoProducto || '90100126'}*
                  </div>
                </div>
              </div>

              {/* Si es Guía Electrónica, renderizar QR Oficial SUNAT en el espacio del código de barras */}
              {esElectronica && (
                <div className="mt-4 p-1.5 border border-slate-300 rounded-md bg-white text-center">
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
                  <div className="text-[7px] font-mono text-slate-500 mt-0.5 font-bold">
                    GRE SUNAT
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Bottom Totals Row */}
          <div className="border-t-2 border-[#00a651] flex items-center justify-between py-1.5 px-4 text-[9.5px] font-extrabold text-[#00a651] uppercase tracking-wider bg-white">
            <div className="flex items-center gap-2">
              <span>TOT. ITEMS</span>
              <span className="font-black text-black">{totalItems}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>TOT. CANT</span>
              <span className="font-black text-black">{totalCantidad}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>PESO BRUTO</span>
              <span className="font-bold text-black min-w-[30px]">
                {/* No weight consideration - managed by another area */}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. DATOS RELACIONADOS CON EL TRASLADO DE LOS BIENES */}
      <div className="mt-4 text-[10px] space-y-1">
        <div className="font-black text-[#00a651] text-[10.5px] uppercase tracking-wider">
          DATOS RELACIONADOS CON EL TRASLADO DE LOS BIENES
        </div>

        <div className="flex items-center gap-3">
          <span className="font-bold text-[#00a651]">Motivo de traslado</span>
          <span className="font-bold text-black uppercase">{guia.motivoTraslado || 'OTROS'}</span>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <span className="font-bold text-[#00a651] block">Dirección de punto de partida</span>
            <span className="font-medium text-black">{direccionPartida}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#00a651] block">Ubigeo punto de partida</span>
            <span className="font-mono font-bold text-black">{ubigeoPartida}</span>
          </div>
        </div>

        <div className="flex items-start justify-between pt-0.5">
          <div>
            <span className="font-bold text-[#00a651] block">Dirección de llegada</span>
            <span className="font-medium text-black">{direccionLlegada}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-[#00a651] block">Ubigeo punto de llegada</span>
            <span className="font-mono font-bold text-black">{ubigeoLlegada}</span>
          </div>
        </div>
      </div>

      {/* 5. REFERENCIA & TRANSPORT TABLE */}
      <div className="mt-3">
        <div className="text-[10px] font-bold text-[#00a651] italic mb-0.5">
          Referencia
        </div>

        {/* Transport Table with Green Borders */}
        <div className="border border-[#00a651] rounded-sm overflow-hidden text-[9px] text-center bg-white">
          {/* Header Row */}
          <div className="grid grid-cols-12 border-b border-[#00a651] py-1 text-[#00a651] font-bold leading-tight">
            <div className="col-span-1 border-r border-[#00a651] flex items-center justify-center">
              Tramo
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center">
              Modalidad Traslado
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center">
              Fecha Inicio Traslado
            </div>
            <div className="col-span-3 border-r border-[#00a651] flex items-center justify-center px-1">
              Nombres y apellidos o razón social del transportista
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center px-1">
              Tipo y nro. doc. Conductor
            </div>
            <div className="col-span-2 flex items-center justify-center px-1">
              Nro. placa vehículo transporte
            </div>
          </div>

          {/* Value Row */}
          <div className="grid grid-cols-12 py-2 text-black font-semibold text-[9.5px]">
            <div className="col-span-1 border-r border-[#00a651] flex items-center justify-center">
              1
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center">
              {modalidadTexto}
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center font-mono">
              {fechaFormatted}
            </div>
            <div className="col-span-3 border-r border-[#00a651] flex items-center justify-center font-bold uppercase px-1">
              TRASNPORTE IGUAL A DESTINO
            </div>
            <div className="col-span-2 border-r border-[#00a651] flex items-center justify-center font-mono font-bold uppercase px-1">
              LICENCIA: {licenciaConductor}
            </div>
            <div className="col-span-2 flex items-center justify-center font-mono font-bold uppercase">
              {placaVehiculo}
            </div>
          </div>
        </div>
      </div>

      {/* 6. INFORMACIÓN ADICIONAL & DATOS ELECTRÓNICOS SUNAT */}
      <div className="mt-4 pt-1 text-[10px] space-y-1">
        <div className="font-black text-[#00a651] text-[10.5px] uppercase tracking-wider">
          INFORMACIÓN ADICIONAL
        </div>

        <div className="grid grid-cols-2 gap-4 text-[9.5px]">
          <div>
            <span className="font-bold text-[#00a651] block">Nro. Documento Relacionado</span>
            <span className="text-slate-600 block min-h-[14px]"></span>
            {esElectronica && (
              <div className="mt-2 text-[8.5px] text-slate-500 font-mono">
                <span className="font-bold text-slate-700">Firma Digital:</span> {guia.hashCdr || 'Vq8Kl2B8y9Uu4t1gJ7sF0xZa2Q=='}
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div>
              <span className="font-bold text-[#00a651] block">Nro. Guía Remisión Baja</span>
              <span className="text-slate-600 block min-h-[12px]"></span>
            </div>
            <div>
              <span className="font-bold text-[#00a651] block">Tipo Doc. Guía Baja</span>
              <span className="text-slate-600 block min-h-[12px]"></span>
            </div>
            {esElectronica && (
              <div className="text-[8px] text-slate-500 pt-1 leading-tight">
                Representación impresa de la <strong>Guía de Remisión Electrónica Remitente</strong>, emitida según normativa SUNAT.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
