import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Truck,
  Building2,
  Package,
  FileCheck2,
  CheckCircle2,
  Search,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WeightTicketModal } from './WeightTicketModal';
import { MovimientoModel } from '../../types';
import {
  lookupSupplierByRuc,
  lookupSupplierByName,
  searchSuppliers,
  lookupSkuByCode,
  lookupSkuByName,
  UULL_CATALOG,
  SUPPLIERS_CATALOG,
  SupplierLookupItem,
} from '../../data/catalogData';

export const EntryRegistrationForm: React.FC = () => {
  const {
    proveedores,
    vehiculos,
    conductores,
    registrarIngreso,
    activeShift,
    calcularStockProveedor,
    setActiveTab,
  } = useApp();

  // 1. Proveedor
  const [rucProveedor, setRucProveedor] = useState('10065800425'); // Cabanillas por defecto
  const [razonSocialProveedor, setRazonSocialProveedor] = useState('CABANILLAS BUSTAMANTE LUIS MIGUEL');
  const [supplierIdentified, setSupplierIdentified] = useState(true);

  // Recomendaciones y autocompletado de Razón Social
  const [isRazonSocialDropdownOpen, setIsRazonSocialDropdownOpen] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const razonSocialContainerRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer clic fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        razonSocialContainerRef.current &&
        !razonSocialContainerRef.current.contains(event.target as Node)
      ) {
        setIsRazonSocialDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtrado de proveedores sugeridos en base a lo escrito en Razón Social
  const razonSocialSuggestions = useMemo(() => {
    const query = razonSocialProveedor.trim();
    if (!query) {
      // Mostrar proveedores iniciales o principales cuando el campo está vacío
      return SUPPLIERS_CATALOG.slice(0, 8);
    }
    return searchSuppliers(query, 12);
  }, [razonSocialProveedor]);

  // Manejo de cambio manual en Razón Social
  const handleRazonSocialChange = (val: string) => {
    setRazonSocialProveedor(val);
    setIsRazonSocialDropdownOpen(true);
    setSelectedSuggestionIndex(-1);

    const exact = lookupSupplierByName(val);
    if (exact) {
      setRucProveedor(exact.ruc);
      setSupplierIdentified(true);
    } else {
      // Si el RUC actual no corresponde a este texto, marcar como no verificado hasta que seleccione
      const currentSupplier = lookupSupplierByRuc(rucProveedor);
      if (currentSupplier && currentSupplier.razonSocial !== val) {
        setSupplierIdentified(false);
      }
    }
  };

  // Selección de un proveedor de la lista de recomendados
  const handleSelectSupplier = (supplier: SupplierLookupItem) => {
    setRazonSocialProveedor(supplier.razonSocial);
    setRucProveedor(supplier.ruc);
    setSupplierIdentified(true);
    setIsRazonSocialDropdownOpen(false);
    setSelectedSuggestionIndex(-1);
  };

  // Navegación por teclado dentro de los recomendados
  const handleRazonSocialKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRazonSocialDropdownOpen || razonSocialSuggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsRazonSocialDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < razonSocialSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev > 0 ? prev - 1 : razonSocialSuggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < razonSocialSuggestions.length) {
        e.preventDefault();
        handleSelectSupplier(razonSocialSuggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsRazonSocialDropdownOpen(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  // Limpiar campo de búsqueda
  const handleClearRazonSocial = () => {
    setRazonSocialProveedor('');
    setRucProveedor('');
    setSupplierIdentified(false);
    setIsRazonSocialDropdownOpen(true);
    setSelectedSuggestionIndex(-1);
  };

  // 2. SKU & Unidad Logística
  const [sku, setSku] = useState('90100126');
  const [uull, setUull] = useState('JABA NEGRA');
  const [cantIngreso, setCantIngreso] = useState<number>(150);
  const [guiaIngreso, setGuiaIngreso] = useState('EG07-00007945');

  // 3. Calidad & Decomisos
  const [cantRechazo, setCantRechazo] = useState<number>(0);
  const [decomisoNoConforme, setDecomisoNoConforme] = useState<number>(0);
  const [decomisoSobreStock, setDecomisoSobreStock] = useState<number>(0);

  // 4. Transporte & Conductor
  const [placa, setPlaca] = useState('ALT-798');
  const [marca, setMarca] = useState('MITSUBISHI FUSO CANTER');
  const [dniConductor, setDniConductor] = useState('10115063');
  const [nombreConductor, setNombreConductor] = useState('CONDUCTOR SPSA TRANSPORTE');
  const [licenciaConductor, setLicenciaConductor] = useState('10115063');

  const [observaciones, setObservaciones] = useState('INGRESO POR RECEPCION');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdMovimiento, setCreatedMovimiento] = useState<MovimientoModel | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Auto-completado de RUC -> Razón Social
  const handleRucChange = (val: string) => {
    setRucProveedor(val);
    const clean = val.trim();
    const found = lookupSupplierByRuc(clean) || proveedores.find((p) => p.ruc === clean);
    if (found) {
      setRazonSocialProveedor(found.razonSocial);
      setSupplierIdentified(true);
      setIsRazonSocialDropdownOpen(false);
    } else {
      setSupplierIdentified(false);
    }
  };

  // Auto-completado de SKU -> Unidad Logística
  const handleSkuChange = (val: string) => {
    setSku(val);
    const found = lookupSkuByCode(val);
    if (found) {
      setUull(found.nombre);
    }
  };

  // Selección rápida de UULL -> SKU
  const handleSelectUull = (nombre: string) => {
    setUull(nombre);
    const found = lookupSkuByName(nombre);
    if (found) {
      setSku(found.sku);
    }
  };

  // Auto-completado de Transporte
  const handlePlacaChange = (val: string) => {
    const clean = val.toUpperCase().trim();
    setPlaca(clean);
    const found = vehiculos.find((v) => v.placa === clean);
    if (found) {
      setMarca(`${found.marca} ${found.modelo}`);
    }
  };

  // Auto-completado de Conductor
  const handleDniChange = (val: string) => {
    setDniConductor(val);
    const found = conductores.find((c) => c.dni === val.trim());
    if (found) {
      setNombreConductor(`${found.nombres} ${found.apellidos}`);
      setLicenciaConductor(found.numeroLicencia);
    }
  };

  // Información de deuda / stock del proveedor en tiempo real
  const stockInfo = useMemo(() => {
    return calcularStockProveedor(rucProveedor);
  }, [calcularStockProveedor, rucProveedor]);

  // Detección de sobre-stock
  const excesoTeorico = useMemo(() => {
    if (!stockInfo) return 0;
    const diff = cantIngreso - stockInfo.stockActual;
    return diff > 0 ? diff : 0;
  }, [cantIngreso, stockInfo]);

  const handleAplicarDecomisoSobreStock = () => {
    setDecomisoSobreStock(excesoTeorico);
  };

  const netoIngreso = Math.max(0, cantIngreso - cantRechazo - decomisoNoConforme - decomisoSobreStock);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!placa || !dniConductor || !rucProveedor || cantIngreso <= 0) {
      alert('Por favor complete los datos obligatorios (RUC, SKU/Cantidad, Placa y Conductor).');
      return;
    }

    try {
      setIsSubmitting(true);
      const mov = await registrarIngreso({
        placa: placa.toUpperCase().trim(),
        dniConductor: dniConductor.trim(),
        nombreConductor: nombreConductor.trim(),
        licenciaConductor: licenciaConductor.trim(),
        rucProveedor: rucProveedor.trim(),
        razonSocialProveedor: razonSocialProveedor.trim(),
        uull,
        cantIngreso,
        cantRechazo,
        decomisoNoConforme,
        decomisoSobreStock,
        guiaIngreso: guiaIngreso.trim(),
        observaciones,
      });

      setCreatedMovimiento(mov);
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Page Title & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#00a651] uppercase tracking-wider">
            <span>Recepción de Unidades Logísticas</span>
            <span>&bull;</span>
            <span className="text-slate-500">Área de UULL</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Registro de Ingreso de UULL
          </h1>
          <p className="text-xs text-slate-500">
            Ingreso rápido de jabas y pallets. Inserte el RUC y el SKU para completar la información al instante.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Provider, SKU & Quality (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Card 1: Proveedor con auto-completado por RUC y Razón Social */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#00a651]" />
                1. Proveedor & Remitente de Carga
              </span>
              {supplierIdentified ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Proveedor Vinculado
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  Escriba Razón Social o RUC
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              {/* Razón Social con buscador y dropdown de recomendados */}
              <div className="sm:col-span-7 relative" ref={razonSocialContainerRef}>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">
                    Razón Social <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    Recomendados al escribir
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={razonSocialProveedor}
                    onChange={(e) => handleRazonSocialChange(e.target.value)}
                    onFocus={() => setIsRazonSocialDropdownOpen(true)}
                    onKeyDown={handleRazonSocialKeyDown}
                    placeholder="Escriba nombre o razón social..."
                    className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-[#00a651] focus:border-[#00a651] focus:outline-hidden text-xs transition-colors"
                    autoComplete="off"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  {razonSocialProveedor && (
                    <button
                      type="button"
                      onClick={handleClearRazonSocial}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 cursor-pointer"
                      title="Limpiar búsqueda"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown de recomendaciones flotante */}
                {isRazonSocialDropdownOpen && (
                  <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-slate-100">
                    <div className="px-3 py-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center sticky top-0 z-10 border-b border-slate-200">
                      <span>Proveedores recomendados</span>
                      <span className="text-slate-400 font-normal">Navegar y seleccionar</span>
                    </div>
                    {razonSocialSuggestions.length > 0 ? (
                      razonSocialSuggestions.map((item, idx) => {
                        const isSelected = idx === selectedSuggestionIndex;
                        const provStock = calcularStockProveedor(item.ruc);
                        return (
                          <button
                            key={`${item.ruc}-${idx}`}
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSupplier(item);
                            }}
                            onMouseEnter={() => setSelectedSuggestionIndex(idx)}
                            className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 text-emerald-950 font-bold'
                                : 'hover:bg-slate-50 text-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0 pr-2">
                              <Building2 className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00a651]' : 'text-slate-400'}`} />
                              <div className="truncate">
                                <div className="truncate font-semibold text-[12px]">{item.razonSocial}</div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                                    RUC {item.ruc}
                                  </span>
                                  {provStock && (
                                    <span className="text-slate-500">
                                      Stock: <strong className="text-slate-700 font-mono">{provStock.stockActual}</strong> uull
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#00a651] translate-x-0.5' : 'text-slate-300'}`} />
                          </button>
                        );
                      })
                    ) : (
                      <div className="p-3 text-xs text-slate-500 text-center">
                        No se encontraron proveedores que coincidan con "{razonSocialProveedor}".
                      </div>
                    )}
                  </div>
                )}

                {stockInfo && (
                  <span className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                    <span>Stock actual en posesión:</span>
                    <strong className="text-slate-900 font-mono">{stockInfo.stockActual} jabas</strong>
                  </span>
                )}
              </div>

              {/* RUC del Proveedor */}
              <div className="sm:col-span-5">
                <label className="block font-semibold text-slate-700 mb-1">
                  RUC del Proveedor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={rucProveedor}
                  onChange={(e) => handleRucChange(e.target.value)}
                  placeholder="Ingrese número de RUC..."
                  list="proveedores-ruc-list"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#00a651] focus:border-[#00a651] focus:outline-hidden text-xs"
                />
                <datalist id="proveedores-ruc-list">
                  {SUPPLIERS_CATALOG.map((s) => (
                    <option key={s.ruc} value={s.ruc}>
                      {s.ruc} - {s.razonSocial}
                    </option>
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Autocompleta razón social automáticamente
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: SKU & Unidad Logística */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#00a651]" />
                2. Unidad Logística y SKU
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Catálogo Oficial
              </span>
            </div>

            {/* Quick-select SKU Pills */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                Selección Rápida de SKU Frecuente:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {UULL_CATALOG.slice(0, 6).map((item) => (
                  <button
                    key={item.sku}
                    type="button"
                    onClick={() => {
                      setSku(item.sku);
                      setUull(item.nombre);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                      sku === item.sku
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-mono text-[10px] opacity-75 mr-1">{item.sku}</span>
                    <span>{item.nombre}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SKU and UULL Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs pt-1">
              <div className="sm:col-span-4">
                <label className="block font-semibold text-slate-700 mb-1">
                  SKU del Producto <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  placeholder="90100126"
                  list="sku-catalog-list"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
                <datalist id="sku-catalog-list">
                  {UULL_CATALOG.map((item) => (
                    <option key={item.sku} value={item.sku}>
                      {item.sku} - {item.nombre} - {item.categoria}
                    </option>
                  ))}
                </datalist>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Autocompleta la UULL
                </span>
              </div>

              <div className="sm:col-span-5">
                <label className="block font-semibold text-slate-700 mb-1">
                  Unidad Logística
                </label>
                <input
                  type="text"
                  required
                  value={uull}
                  onChange={(e) => handleSelectUull(e.target.value)}
                  placeholder="JABA NEGRA, PALLET EAN..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-slate-800 bg-slate-50 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">
                  Cantidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={cantIngreso}
                  onChange={(e) => setCantIngreso(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-center text-slate-900 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  N° Guía de Ingreso Proveedor
                </label>
                <input
                  type="text"
                  value={guiaIngreso}
                  onChange={(e) => setGuiaIngreso(e.target.value.toUpperCase())}
                  placeholder="EG07-00007945"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-800 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Observaciones de Recepción
                </label>
                <input
                  type="text"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="INGRESO POR RECEPCION"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Control de Calidad & Decomisos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-rose-600" />
                3. Evaluación de Calidad & Decomisos
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                Pasa por Calidad
              </span>
            </div>

            {/* Alerta de Sobre-stock si trae más de lo que adeuda */}
            {excesoTeorico > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-amber-900 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    El proveedor trae <strong>{cantIngreso}</strong> jabas, superando su stock teórico en{' '}
                    <strong>{excesoTeorico}</strong> unidades.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAplicarDecomisoSobreStock}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] rounded transition-colors shrink-0"
                >
                  Asignar Decomiso (+{excesoTeorico})
                </button>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1 text-[11px]">
                  Jabas Rechazadas:
                </label>
                <input
                  type="number"
                  min="0"
                  value={cantRechazo}
                  onChange={(e) => setCantRechazo(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-center"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">Observadas</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1 text-[11px]">
                  Decomiso Rotas:
                </label>
                <input
                  type="number"
                  min="0"
                  value={decomisoNoConforme}
                  onChange={(e) => setDecomisoNoConforme(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-center"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">No conformes</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1 text-[11px]">
                  Decomiso Sobre-Stock:
                </label>
                <input
                  type="number"
                  min="0"
                  value={decomisoSobreStock}
                  onChange={(e) => setDecomisoSobreStock(Math.max(0, Number(e.target.value)))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold text-center"
                />
                <span className="text-[9.5px] text-slate-400 block mt-0.5">Regula deuda</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <span className="text-slate-500 font-medium">Ingreso Neto Regularizado:</span>
              <span className="font-mono font-bold text-[#00a651] text-sm">
                {netoIngreso} unidades
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Transport, Driver & Dock (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card 4: Transporte y Conductor */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-blue-600" />
                4. Transporte & Conductor
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Turno {activeShift}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Placa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={placa}
                  onChange={(e) => handlePlacaChange(e.target.value)}
                  placeholder="ALT-798"
                  list="placas-list"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
                <datalist id="placas-list">
                  {vehiculos.map((v) => (
                    <option key={v.placa} value={v.placa}>
                      {v.placa} - {v.marca}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Marca / Modelo
                </label>
                <input
                  type="text"
                  value={marca}
                  onChange={(e) => setMarca(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-700 bg-slate-50 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  DNI Conductor <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={dniConductor}
                  onChange={(e) => handleDniChange(e.target.value)}
                  placeholder="10115063"
                  list="conductores-dni-list"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
                <datalist id="conductores-dni-list">
                  {conductores.map((c) => (
                    <option key={c.dni} value={c.dni}>
                      {c.dni} - {c.nombres} {c.apellidos}
                    </option>
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Licencia Conductor
                </label>
                <input
                  type="text"
                  value={licenciaConductor}
                  onChange={(e) => setLicenciaConductor(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono text-slate-700 bg-slate-50 focus:outline-hidden"
                />
              </div>

              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nombre Completo Conductor
                </label>
                <input
                  type="text"
                  required
                  value={nombreConductor}
                  onChange={(e) => setNombreConductor(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 uppercase focus:ring-2 focus:ring-[#00a651] focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[#00a651] hover:bg-[#008f45] active:scale-98 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isSubmitting
                ? 'Registrando Ingreso...'
                : 'Registrar Ingreso de UULL'}
            </span>
          </button>
        </div>
      </form>

      {/* Entry Receipt Modal */}
      {showModal && (
        <WeightTicketModal
          movimiento={createdMovimiento}
          onClose={() => setShowModal(false)}
          onPrint={() => window.print()}
          onProceedToExit={() => {
            setShowModal(false);
            setActiveTab('registro-salida');
          }}
        />
      )}
    </div>
  );
};
