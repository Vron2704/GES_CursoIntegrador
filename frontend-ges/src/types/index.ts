export type MovimientoTipo = 'INGRESO' | 'SALIDA';
export type MovimientoEstado =
  | 'REGISTRADO'
  | 'EN_ESPERA'
  | 'PENDIENTE_SALIDA'
  | 'DEVOLUCION_AUTOMATICA'
  | 'COMPLETADO'
  | 'ANULADO';
export type GuiaEstado = 'EMITIDA' | 'EN_TRANSITO' | 'ENTREGADA' | 'ANULADA';

export type UserRole = 'ADMINISTRADOR_GENERAL' | 'PERSONAL_LOGISTICA' | 'CONSULTA';

export interface UserSession {
  id: string;
  username: string;
  nombre: string;
  email: string;
  rol: UserRole;
  rolLabel: string;
  sede: string;
  token?: string;
}

export interface Proveedor {
  idProveedor?: number;
  ruc: string;
  razonSocial: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  activo?: boolean;
  stockInicialCorte?: number; // Saldo inicial a corte de mes
}

export interface StockProveedorResumen {
  ruc: string;
  razonSocial: string;
  stockInicial: number; // Corte inicial de mes (deuda de jabas)
  totalIngreso: number; // Jabas que entraron con mercadería
  totalSalida: number; // Jabas retiradas/despachadas
  totalAlquiler: number; // Jabas alquiladas para suplir demanda
  totalDevolucion: number; // Jabas devueltas
  totalDecomisoSobreStock: number; // Diferencia por encima del stock teórico
  totalDecomisoNoConforme: number; // Jabas rotas o no conformes
  totalRechazo: number; // Jabas rechazadas por Calidad
  devolucionesAutomaticas: number; // Casos pasados de las 4 AM sin salida
  stockActual: number; // Saldo de unidades en posesión del proveedor
  estadoDeuda: 'AL_DIA' | 'STOCK_ALTO' | 'SOBREGIRADO' | 'REGULAR';
  ultimoMovimiento?: string;
}

export interface Vehiculo {
  idVehiculo?: number;
  placa: string;
  marca: string;
  modelo: string;
  capacidadCargaKg?: number;
  activo: boolean;
}

export interface Conductor {
  idConductor?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  numeroLicencia: string;
  telefono: string;
  activo: boolean;
}

export interface ConsignaGuiaItem {
  cantidad: number;
  texto: string;
}

export interface DetalleGuiaItem {
  idDetalle?: number;
  codigoProducto: string;
  descripcionProducto: string;
  cantidad: number;
  unidadMedida: string; // NIU, BX, KGM, etc.
  pesoKg?: number;
}

export interface GuiaRemisionModel {
  idGuia: number;
  numeroGuia: string; // ej: T725-00587814
  fechaEmision: string;
  fechaInicioTraslado: string;
  motivoTraslado: string;
  modalidadTransporte: 'TRANSPORTE_PRIVADO' | 'TRANSPORTE_PUBLICO';
  puntoPartida: {
    direccion: string;
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
  };
  puntoLlegada: {
    direccion: string;
    ubigeo: string;
    departamento: string;
    provincia: string;
    distrito: string;
  };
  destinatario: {
    ruc: string;
    razonSocial: string;
  };
  proveedor: Proveedor;
  conductor: Conductor;
  vehiculo: Vehiculo;
  detalles: DetalleGuiaItem[];
  pesoBrutoKg?: number; // Opcional, para compatibilidad de impresión física
  pesoTaraKg?: number;
  pesoTotalKg?: number;
  totalBultos: number;
  estado: GuiaEstado;
  hashCdr?: string;
  observaciones?: string;
  guiaIngreso?: string;
  // Variables operativas y consignas visibles en la guía oficial
  cantIngreso?: number;
  alquiler?: number;
  devolucion?: number;
  cantRechazo?: number;
  decomisoNoConforme?: number;
  decomisoSobreStock?: number;
  uullNombre?: string;
  consignas?: ConsignaGuiaItem[];
}

export interface MovimientoModel {
  idMovimiento: number;
  tipoMovimiento: MovimientoTipo;
  fechaHora: string;
  hora?: string;
  uull: string; // JABA NEGRA, PALLET EAN, etc.
  stock?: number;
  guiaIngreso?: string;
  cantIngreso: number;
  cantRechazo?: number;
  decomisoNoConforme?: number;
  decomisoSobreStock?: number;
  alquiler?: number;
  devolucion?: number;
  guiaSalida?: string;
  cantSalida: number;
  observaciones: string;
  placaVehiculo: string;
  marcaVehiculo?: string;
  dniConductor: string;
  nombreConductor: string;
  licenciaConductor?: string;
  idProveedor?: number;
  rucProveedor: string;
  razonSocialProveedor: string;
  unidadLogistica: string;
  turno: string;
  usuarioRegistro: string;
  numeroGuiaAsociada?: string;
  tiempoEnPlantaMinutos?: number;
  estado: MovimientoEstado;
  // Campos de peso opcionales para retrocompatibilidad
  pesoBruto?: number;
  pesoTara?: number;
  pesoNeto?: number;
}

export interface DashboardStats {
  unidadesEnPatio: number;
  ingresosHoy: number;
  salidasHoy: number;
  totalUullIngresoHoy: number;
  totalUullSalidaHoy: number;
  guiasEmitidasHoy: number;
  tiempoPromedioPatioMinutos: number;
}
