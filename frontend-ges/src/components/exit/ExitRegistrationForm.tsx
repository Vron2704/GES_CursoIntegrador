import React, { useState, useEffect, useMemo } from 'react';
import {
  LogOut,
  Truck,
  Building2,
  FileCheck2,
  Plus,
  Trash2,
  CheckCircle2,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { VehicleYardSelector } from './VehicleYardSelector';
import { MovimientoModel, DetalleGuiaItem } from '../../types';
import {
  lookupSkuByCode,
  lookupSkuByName,
  lookupSupplierByRuc,
  UULL_CATALOG,
} from '../../data/catalogData';
import { generarConsignasGuia } from '../../utils/correlativo';

export const ExitRegistrationForm: React.FC = () => {
  const {
    unidadesEnPatio,
    registrarSalidaYGenerarGuia,
    obtenerSiguienteCorrelativoGuia,
    calcularStockProveedor,
    setActiveTab,
  } = useApp();

  const [selectedUnidad, setSelectedUnidad] = useState<MovimientoModel | null>(
    unidadesEnPatio.length > 0 ? unidadesEnPatio[0] : null
  );

  useEffect(() => {
    if (selectedUnidad && !unidadesEnPatio.some((u) => u.idMovimiento === selectedUnidad.idMovimiento)) {
      setSelectedUnidad(unidadesEnPatio[0] || null);
    } else if (!selectedUnidad && unidadesEnPatio.length > 0) {
      setSelectedUnidad(unidadesEnPatio[0]);
    }
  }, [unidadesEnPatio]);

  // Operational Variables & Consignas
  const [cantSalida, setCantSalida] = useState<number>(selectedUnidad?.cantIngreso || 150);
  const [alquiler, setAlquiler] = useState<number>(0);
  const [devolucion, setDevolucion] = useState<number>(selectedUnidad?.cantIngreso || 150);
  const [cantRechazo, setCantRechazo] = useState<number>(0);
  const [decomisoNoConforme, setDecomisoNoConforme] = useState<number>(0);
  const [decomisoSobreStock, setDecomisoSobreStock] = useState<number>(0);

  // Sync with selected unit
  useEffect(() => {
    if (selectedUnidad) {
      const cant = selectedUnidad.cantIngreso || 105;
      setCantSalida(cant);
      setDevolucion(cant);
      setAlquiler(0);
      setCantRechazo(selectedUnidad.cantRechazo || 0);
      setDecomisoNoConforme(selectedUnidad.decomisoNoConforme || 0);
      setDecomisoSobreStock(selectedUnidad.decomisoSobreStock || 0);
    }
  }, [selectedUnidad]);

  // Next series correlative
  const proximoCorrelativo = useMemo(() => {
    return obtenerSiguienteCorrelativoGuia();
  }, [obtenerSiguienteCorrelativoGuia]);

  // Transfer Info
  const [puntoLlegada, setPuntoLlegada] = useState(
    'Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador'
  );
  const [ubigeoLlegada, setUbigeoLlegada] = useState('150142');
  const [departamentoLlegada, setDepartamentoLlegada] = useState('LIMA');
  const [provinciaLlegada, setProvinciaLlegada] = useState('LIMA');
  const [distritoLlegada, setDistritoLlegada] = useState('VILLA EL SALVADOR');

  const [motivoTraslado, setMotivoTraslado] = useState('OTROS');
  const [modalidadTransporte, setModalidadTransporte] = useState<'TRANSPORTE_PRIVADO' | 'TRANSPORTE_PUBLICO'>(
    'TRANSPORTE_PRIVADO'
  );

  const [observaciones, setObservaciones] = useState('INGRESO POR RECEPCION');

  // Supplier current stock and projected balance
  const stockProveedor = useMemo(() => {
    if (!selectedUnidad) return null;
    return calcularStockProveedor(selectedUnidad.rucProveedor);
  }, [selectedUnidad, calcularStockProveedor]);

  const stockProyectado = useMemo(() => {
    if (!stockProveedor) return 0;
    return stockProveedor.stockActual + alquiler - devolucion - decomisoSobreStock;
  }, [stockProveedor, alquiler, devolucion, decomisoSobreStock]);

  // Live Consignas preview generated for the referral guide description column
  const consignasEnVivo = useMemo(() => {
    return generarConsignasGuia({
      cantIngreso: selectedUnidad?.cantIngreso ?? cantSalida,
      alquiler,
      devolucion,
      cantRechazo,
      decomisoNoConforme,
      decomisoSobreStock,
      uullNombre: selectedUnidad?.uull || 'JABA NEGRA',
      observaciones,
    });
  }, [
    selectedUnidad,
    cantSalida,
    alquiler,
    devolucion,
    cantRechazo,
    decomisoNoConforme,
    decomisoSobreStock,
    observaciones,
  ]);

  // Items table
  const [items, setItems] = useState<DetalleGuiaItem[]>([
    {
      idDetalle: 1,
      codigoProducto: '90100126',
      descripcionProducto: 'JABA NEGRA',
      cantidad: 150,
      unidadMedida: 'NIU',
      pesoKg: 0,
    },
  ]);

  const [newItemCode, setNewItemCode] = useState('90100126');
  const [newItemDesc, setNewItemDesc] = useState('JABA NEGRA');
  const [newItemCant, setNewItemCant] = useState(50);
  const [newItemUnidad, setNewItemUnidad] = useState('NIU');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-complete SKU in new item
  const handleNewItemCodeChange = (code: string) => {
    setNewItemCode(code);
    const found = lookupSkuByCode(code);
    if (found) {
      setNewItemDesc(found.nombre);
      setNewItemUnidad(found.unidadMedida);
    }
  };

  const handleSelectQuickSku = (skuCode: string) => {
    const found = lookupSkuByCode(skuCode);
    if (found) {
      setNewItemCode(found.sku);
      setNewItemDesc(found.nombre);
      setNewItemUnidad(found.unidadMedida);
    }
  };

  // Synchronize item quantity with cantSalida if single item
  useEffect(() => {
    if (items.length === 1 && selectedUnidad) {
      const uullNombre = selectedUnidad.uull || 'JABA NEGRA';
      const foundSku = lookupSkuByName(uullNombre)?.sku || '90100126';
      setItems([
        {
          idDetalle: 1,
          codigoProducto: foundSku,
          descripcionProducto: uullNombre,
          cantidad: cantSalida,
          unidadMedida: 'NIU',
          pesoKg: 0,
        },
      ]);
      setObservaciones(`${cantSalida} INGRESO POR RECEPCION`);
    }
  }, [cantSalida, selectedUnidad]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemCode || !newItemDesc || newItemCant <= 0) return;

    const newItem: DetalleGuiaItem = {
      idDetalle: Date.now(),
      codigoProducto: newItemCode.toUpperCase().trim(),
      descripcionProducto: newItemDesc.toUpperCase().trim(),
      cantidad: newItemCant,
      unidadMedida: newItemUnidad,
      pesoKg: 0,
    };

    const updated = [...items, newItem];
    setItems(updated);
    setCantSalida(updated.reduce((sum, item) => sum + item.cantidad, 0));
    setNewItemCode('');
    setNewItemDesc('');
    setNewItemCant(50);
  };

  const handleRemoveItem = (id?: number) => {
    if (!id || items.length <= 1) return;
    const filtered = items.filter((item) => item.idDetalle !== id);
    setItems(filtered);
    setCantSalida(filtered.reduce((sum, item) => sum + item.cantidad, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUnidad) {
      alert('Por favor seleccione una unidad en espera para dar salida.');
      return;
    }

    if (items.length === 0 || cantSalida <= 0) {
      alert('Debe incluir al menos un ítem con cantidad válida para emitir la Guía de Remisión.');
      return;
    }

    try {
      setIsSubmitting(true);
      await registrarSalidaYGenerarGuia({
        idMovimientoIngreso: selectedUnidad.idMovimiento,
        cantSalida,
        alquiler,
        devolucion,
        cantRechazo,
        decomisoNoConforme,
        decomisoSobreStock,
        puntoLlegada,
        ubigeoLlegada,
        departamentoLlegada,
        provinciaLlegada,
        distritoLlegada,
        motivoTraslado,
        modalidadTransporte,
        detalles: items,
        observaciones,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase tracking-wider">
            <span>Despacho de Unidades Logísticas</span>
            <span>&bull;</span>
            <span className="text-slate-500">Salida & Despacho de UULL</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Despacho & Emisión de Guía de Salida
          </h1>
          <p className="text-xs text-slate-500">
            Despache la unidad logística, ajuste alquiler o devolución y emita la Guía Oficial SPSA con correlativo consecutivo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 text-white font-mono text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#00a651] animate-pulse" />
            <span>Guía: {proximoCorrelativo}</span>
          </div>
        </div>
      </div>

      {/* Step 1: Units awaiting exit */}
      <VehicleYardSelector
        unidadesEnPatio={unidadesEnPatio}
        selectedId={selectedUnidad?.idMovimiento || null}
        onSelect={(unidad) => setSelectedUnidad(unidad)}
        onGoToEntry={() => setActiveTab('registro-ingreso')}
      />

      {/* Form Section */}
      {selectedUnidad ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column: Unit, Variables & Account (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Unit Card */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-blue-600" />
                    Unidad Seleccionada en Espera
                  </span>
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedUnidad.placaVehiculo}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Proveedor:</span>
                    <strong className="text-slate-900 truncate max-w-[200px]" title={selectedUnidad.razonSocialProveedor}>
                      {selectedUnidad.razonSocialProveedor}
                    </strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">RUC Proveedor:</span>
                    <strong className="font-mono text-slate-800">{selectedUnidad.rucProveedor}</strong>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Conductor:</span>
                    <span className="text-slate-900 font-semibold">{selectedUnidad.nombreConductor}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Guía de Ingreso:</span>
                    <span className="font-mono font-bold text-slate-800">{selectedUnidad.guiaIngreso || '-'}</span>
                  </div>
                </div>

                {/* Account & Operational Variables */}
                {stockProveedor && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-1.5">
                      <span className="font-bold text-slate-700">Cuenta Corriente Proveedor:</span>
                      <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {stockProveedor.stockActual} jabas
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <label className="block text-slate-600 font-bold mb-1">
                          Alquiler:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={alquiler}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value));
                            setAlquiler(val);
                            const base = selectedUnidad?.cantIngreso || 0;
                            setCantSalida(base + val);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-mono font-bold text-blue-700 text-center"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-600 font-bold mb-1">
                          Devolución:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={devolucion}
                          onChange={(e) => setDevolucion(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-mono font-bold text-emerald-700 text-center"
                        />
                      </div>
                    </div>

                    {/* Operational Variables: Calidad & Decomisos */}
                    <div className="grid grid-cols-3 gap-2 text-[10.5px] pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-amber-800 font-bold mb-1">
                          Rechazo Calidad:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={cantRechazo}
                          onChange={(e) => setCantRechazo(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1 rounded border border-amber-300 font-mono font-bold text-amber-900 text-center bg-amber-50"
                        />
                      </div>

                      <div>
                        <label className="block text-rose-800 font-bold mb-1">
                          Decomiso Sin Logo:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={decomisoNoConforme}
                          onChange={(e) => setDecomisoNoConforme(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1 rounded border border-rose-300 font-mono font-bold text-rose-900 text-center bg-rose-50"
                        />
                      </div>

                      <div>
                        <label className="block text-purple-800 font-bold mb-1">
                          Decomiso Sobre-Stock:
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={decomisoSobreStock}
                          onChange={(e) => setDecomisoSobreStock(Math.max(0, Number(e.target.value)))}
                          className="w-full px-2 py-1 rounded border border-purple-300 font-mono font-bold text-purple-900 text-center bg-purple-50"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 text-[11px]">
                      <span className="text-slate-600 font-medium">Saldo Proyectado Proveedor:</span>
                      <span className="font-mono font-black bg-emerald-100 text-emerald-950 px-2 py-0.5 rounded">
                        {stockProyectado} jabas
                      </span>
                    </div>

                    {/* Previsualización en Vivo de Consignas Oficiales SPSA */}
                    <div className="mt-3 bg-white rounded-lg border-2 border-[#00a651] p-3 text-xs shadow-xs space-y-2">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-1.5">
                        <span className="font-extrabold text-[#00a651] uppercase text-[10px] tracking-wide flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#00a651] animate-ping" />
                          Consignas en Guía SPSA
                        </span>
                        <span className="font-mono text-[9px] bg-emerald-50 text-[#00a651] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                          {proximoCorrelativo}
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[11px]">
                        {consignasEnVivo.map((c, i) => (
                          c.texto === '-' ? (
                            <div key={i} className="text-slate-400 font-black pl-8 py-0.5">
                              -
                            </div>
                          ) : (
                            <div key={i} className="flex items-center gap-3">
                              <span className="w-8 text-right font-black text-black">
                                {c.cantidad}
                              </span>
                              <span className="font-extrabold text-black uppercase tracking-tight text-[10.5px]">
                                {c.texto}
                              </span>
                            </div>
                          )
                        ))}
                      </div>

                      <div className="text-[9.5px] text-slate-500 pt-1 border-t border-slate-100 italic">
                        * Toda consigna registrada se imprimirá en el cuerpo de la guía de remisión conforme a la plantilla SPSA.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Destination Point & Reason */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Building2 className="w-4 h-4 text-[#00a651]" />
                  Destino & Traslado
                </span>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Motivo de Traslado</label>
                    <select
                      value={motivoTraslado}
                      onChange={(e) => setMotivoTraslado(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-semibold text-slate-900 focus:outline-hidden"
                    >
                      <option value="OTROS">OTROS</option>
                      <option value="DEVOLUCION DE UULL">DEVOLUCION DE UULL</option>
                      <option value="TRASLADO ENTRE ESTABLECIMIENTOS DE LA MISMA EMPRESA">
                        TRASLADO ENTRE ESTABLECIMIENTOS
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Dirección de Destino</label>
                    <input
                      type="text"
                      value={puntoLlegada}
                      onChange={(e) => setPuntoLlegada(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-slate-900 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Items Table & Emission (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Items in Guide */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#00a651]" />
                    Ítems de la Guía Oficial SPSA
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00a651]">
                    Serie: {proximoCorrelativo}
                  </span>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[9.5px]">
                        <th className="py-2 px-3">SKU</th>
                        <th className="py-2 px-3">Descripción UULL</th>
                        <th className="py-2 px-3 text-center">Cantidad</th>
                        <th className="py-2 px-3 text-center">Unidad</th>
                        <th className="py-2 px-3 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item) => (
                        <tr key={item.idDetalle} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-slate-900">
                            {item.codigoProducto}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-800">
                            {item.descripcionProducto}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-black text-[#00a651]">
                            {item.cantidad}
                          </td>
                          <td className="py-2 px-3 text-center text-slate-500 font-mono">
                            {item.unidadMedida || 'NIU'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.idDetalle)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-slate-900 font-bold text-xs bg-slate-50">
                        <td colSpan={2} className="py-2 px-3 text-slate-800">
                          TOTAL UULL A DESPACHAR:
                        </td>
                        <td className="py-2 px-3 text-center font-black text-slate-950 font-mono text-sm">
                          {cantSalida}
                        </td>
                        <td colSpan={2} className="py-2 px-3 text-right text-slate-500 text-[10px]">
                          Control exclusivo de UULL
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Add Another Item Form with Auto-fill SKU */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5 text-[#00a651]" />
                      Agregar otra UULL por SKU:
                    </span>
                    <div className="flex gap-1">
                      {UULL_CATALOG.slice(0, 4).map((c) => (
                        <button
                          key={c.sku}
                          type="button"
                          onClick={() => handleSelectQuickSku(c.sku)}
                          className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[9.5px] font-mono hover:bg-slate-100"
                        >
                          {c.sku}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-3">
                      <input
                        type="text"
                        placeholder="SKU Producto"
                        value={newItemCode}
                        onChange={(e) => handleNewItemCodeChange(e.target.value)}
                        list="sku-quick-list"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold"
                      />
                      <datalist id="sku-quick-list">
                        {UULL_CATALOG.map((item) => (
                          <option key={item.sku} value={item.sku}>
                            {item.sku} - {item.nombre}
                          </option>
                        ))}
                      </datalist>
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        placeholder="Descripción UULL"
                        value={newItemDesc}
                        onChange={(e) => setNewItemDesc(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-semibold"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Cant."
                        value={newItemCant}
                        onChange={(e) => setNewItemCant(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 font-mono font-bold text-center"
                      />
                    </div>
                    <div className="col-span-2">
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded"
                      >
                        + Añadir
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#00a651] hover:bg-[#008f45] active:scale-98 text-white font-black text-sm transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Emitiendo Guía...'
                    : `Emitir Guía ${proximoCorrelativo} & Despachar`}
                </span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500 space-y-2">
          <Package className="w-8 h-8 text-slate-300 mx-auto" />
          <div className="text-sm font-bold text-slate-800">
            No hay unidades logísticas pendientes de salida en este momento
          </div>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Cuando un camión descargue jabas con mercadería en el área de UULL, aparecerá aquí para generar su salida o procesar su devolución automática pasado las 4 AM.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('registro-ingreso')}
            className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a651] text-white font-bold text-xs"
          >
            <span>Ir a Registro de Ingreso</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
