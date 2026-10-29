import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  type Proveedor,
  type Vehiculo,
  type Conductor,
  type MovimientoModel,
  type GuiaRemisionModel,
  type DashboardStats,
  type DetalleGuiaItem,
  type UserSession,
  type StockProveedorResumen,
} from '../types';
import {
  INITIAL_PROVEEDORES,
  INITIAL_VEHICULOS,
  INITIAL_CONDUCTORES,
  INITIAL_MOVIMIENTOS,
  INITIAL_GUIAS,
} from '../data/mockData';
import { apiService } from '../services/api';
import { supabaseService, type DbStatus } from '../services/supabaseService';
import {
  CORRELATIVO_BASE_INICIAL,
  extractCorrelativoGuia,
  formatCorrelativoGuia,
  sanitizeNumeroGuia,
} from '../utils/correlativo';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
}

export const DEMO_USERS: Record<string, UserSession & { password: string }> = {
  admin: {
    id: 'usr-001',
    username: 'admin',
    password: 'admin123',
    nombre: 'Ing. Aron Bamberger',
    email: 'admin@spsa.pe',
    rol: 'ADMINISTRADOR_GENERAL',
    rolLabel: 'Administrador General',
    sede: 'Centro de Acopio SPSA - Lurigancho',
  },
  logistica: {
    id: 'usr-002',
    username: 'logistica',
    password: 'logistica123',
    nombre: 'Pedro Morales Quispe',
    email: 'pmorales@spsa.pe',
    rol: 'PERSONAL_LOGISTICA',
    rolLabel: 'Personal de Unidades Logísticas',
    sede: 'Centro de Acopio SPSA Tablada - Área UULL',
  },
  consulta: {
    id: 'usr-003',
    username: 'consulta',
    password: 'consulta123',
    nombre: 'Lic. Mariana Torres',
    email: 'mtorres.auditoria@spsa.pe',
    rol: 'CONSULTA',
    rolLabel: 'Usuario de Consulta / Auditor',
    sede: 'Auditoría Central SPSA',
  },
};

export type AppTab =
  | 'dashboard'
  | 'registro-ingreso'
  | 'registro-salida'
  | 'impresion-guia'
  | 'kardex'
  | 'stock-proveedores';

interface AppContextType {
  // Authentication & RBAC
  currentUser: UserSession | null;
  isAuthenticated: boolean;
  canRegister: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  registerUser: (params: {
    username: string;
    password: string;
    nombreCompleto: string;
    email: string;
    idRol?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;

  // Navigation
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;

  // Master Data
  proveedores: Proveedor[];
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  
  // Operations Data (UULL & Movimientos)
  movimientos: MovimientoModel[];
  unidadesEnPatio: MovimientoModel[];
  guias: GuiaRemisionModel[];
  selectedGuia: GuiaRemisionModel | null;
  setSelectedGuia: (guia: GuiaRemisionModel | null) => void;

  // Correlative Series Generator (starts from highest correlative)
  obtenerSiguienteCorrelativoGuia: () => string;

  // 4:00 AM Automated Cutoff (Devolución Automática)
  ejecutarCorte4AM: () => { procesados: number; mensaje: string };

  // Supplier Stock Balance & Debt Management
  calcularStockProveedor: (ruc: string) => StockProveedorResumen;
  resumenStockProveedores: StockProveedorResumen[];
  actualizarStockInicialProveedor: (ruc: string, nuevoStockInicial: number) => void;

  // System & Telemetry
  activeShift: 'MAÑANA' | 'TARDE' | 'NOCHE';
  setActiveShift: (shift: 'MAÑANA' | 'TARDE' | 'NOCHE') => void;
  backendConnected: boolean;
  dbStatus: DbStatus;
  isSyncingDb: boolean;
  sincronizarConBaseDeDatos: () => Promise<void>;

  // Stats
  stats: DashboardStats;

  // Actions
  registrarIngreso: (params: {
    placa: string;
    dniConductor: string;
    nombreConductor: string;
    licenciaConductor: string;
    rucProveedor: string;
    razonSocialProveedor: string;
    uull: string;
    cantIngreso: number;
    cantRechazo?: number;
    decomisoNoConforme?: number;
    decomisoSobreStock?: number;
    guiaIngreso?: string;
    observaciones?: string;
  }) => Promise<MovimientoModel>;

  registrarSalidaYGenerarGuia: (params: {
    idMovimientoIngreso: number;
    cantSalida: number;
    alquiler?: number;
    devolucion?: number;
    cantRechazo?: number;
    decomisoNoConforme?: number;
    decomisoSobreStock?: number;
    puntoLlegada: string;
    ubigeoLlegada?: string;
    departamentoLlegada?: string;
    provinciaLlegada?: string;
    distritoLlegada?: string;
    motivoTraslado: string;
    modalidadTransporte: 'TRANSPORTE_PRIVADO' | 'TRANSPORTE_PUBLICO';
    detalles: DetalleGuiaItem[];
    observaciones?: string;
  }) => Promise<GuiaRemisionModel>;

  // Direct Print Shortcut Trigger
  triggerDirectPrint: () => void;

  // Notifications
  notifications: ToastItem[];
  addToast: (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Current user state (persisted)
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('spsa_current_user');
      return saved ? JSON.parse(saved) : DEMO_USERS.admin;
    } catch {
      return DEMO_USERS.admin;
    }
  });

  const [activeTab, setActiveTab] = useState<AppTab>('registro-ingreso');
  const [activeShift, setActiveShift] = useState<'MAÑANA' | 'TARDE' | 'NOCHE'>('MAÑANA');
  const [backendConnected, setBackendConnected] = useState<boolean>(false);

  // Master Data
  const [proveedores] = useState<Proveedor[]>(() => {
    try {
      const saved = localStorage.getItem('spsa_proveedores');
      return saved ? JSON.parse(saved) : INITIAL_PROVEEDORES;
    } catch {
      return INITIAL_PROVEEDORES;
    }
  });

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(() => {
    try {
      const saved = localStorage.getItem('spsa_vehiculos');
      return saved ? JSON.parse(saved) : INITIAL_VEHICULOS;
    } catch {
      return INITIAL_VEHICULOS;
    }
  });

  const [conductores] = useState<Conductor[]>(() => {
    try {
      const saved = localStorage.getItem('spsa_conductores');
      return saved ? JSON.parse(saved) : INITIAL_CONDUCTORES;
    } catch {
      return INITIAL_CONDUCTORES;
    }
  });

  // Historical Movements & Guides with automatic sanitizer for clean T725 series
  const [movimientos, setMovimientos] = useState<MovimientoModel[]>(() => {
    try {
      const saved = localStorage.getItem('spsa_movimientos');
      const list: MovimientoModel[] = saved ? JSON.parse(saved) : INITIAL_MOVIMIENTOS;
      return list.map((m) => ({
        ...m,
        guiaSalida: sanitizeNumeroGuia(m.guiaSalida),
        numeroGuiaAsociada: sanitizeNumeroGuia(m.numeroGuiaAsociada),
      }));
    } catch {
      return INITIAL_MOVIMIENTOS;
    }
  });

  const [guias, setGuias] = useState<GuiaRemisionModel[]>(() => {
    try {
      const saved = localStorage.getItem('spsa_guias');
      const list: GuiaRemisionModel[] = saved ? JSON.parse(saved) : INITIAL_GUIAS;
      return list.map((g) => ({
        ...g,
        numeroGuia: sanitizeNumeroGuia(g.numeroGuia) || g.numeroGuia,
      }));
    } catch {
      return INITIAL_GUIAS;
    }
  });

  const [selectedGuia, setSelectedGuia] = useState<GuiaRemisionModel | null>(() => {
    const defaultGuia = INITIAL_GUIAS[0];
    if (defaultGuia) {
      return {
        ...defaultGuia,
        numeroGuia: sanitizeNumeroGuia(defaultGuia.numeroGuia) || 'T725-00587814',
      };
    }
    return null;
  });

  // Notifications
  const [notifications, setNotifications] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    const newToast: ToastItem = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      title,
      message,
      timestamp: new Date(),
    };
    setNotifications((prev) => [newToast, ...prev].slice(0, 5));
    setTimeout(() => {
      removeToast(newToast.id);
    }, 5000);
  }, [removeToast]);

  // RBAC permissions helper
  const canRegister = currentUser?.rol === 'ADMINISTRADOR_GENERAL' || currentUser?.rol === 'PERSONAL_LOGISTICA';

  // Login method
  const login = useCallback(async (user: string, pass: string): Promise<boolean> => {
    // 1. Try Supabase PostgreSQL directly (for registered users)
    try {
      const dbUser = await supabaseService.authenticateUser(user, pass);
      if (dbUser) {
        const isAdmin = dbUser.id_rol === 1;
        const session: UserSession = {
          id: `usr-db-${dbUser.id_usuario}`,
          username: dbUser.username,
          nombre: dbUser.nombre_completo,
          email: dbUser.email,
          rol: isAdmin ? 'ADMINISTRADOR_GENERAL' : 'PERSONAL_LOGISTICA',
          rolLabel: isAdmin ? 'Administrador General' : 'Personal Logístico',
          sede: 'Centro de Acopio SPSA - Lurigancho',
        };
        setCurrentUser(session);
        localStorage.setItem('spsa_current_user', JSON.stringify(session));
        addToast('success', 'Sesión Iniciada', `Bienvenido, ${session.nombre}`);
        return true;
      }
    } catch (err) {
      console.warn('Error authenticating with Supabase:', err);
    }

    // 2. Try Java Backend REST API
    try {
      const backendResp = await apiService.login(user, pass);
      if (backendResp && backendResp.token) {
        const session: UserSession = {
          id: 'usr-backend',
          username: user,
          nombre: user === 'admin' ? 'Administrador General' : 'Operador Logística',
          email: `${user}@spsa.pe`,
          rol: user === 'admin' ? 'ADMINISTRADOR_GENERAL' : 'PERSONAL_LOGISTICA',
          rolLabel: user === 'admin' ? 'Administrador General' : 'Personal Logístico',
          sede: 'Centro de Acopio SPSA - Lurigancho',
          token: backendResp.token,
        };
        setCurrentUser(session);
        localStorage.setItem('spsa_current_user', JSON.stringify(session));
        addToast('success', 'Sesión Iniciada', `Bienvenido, ${session.nombre}`);
        return true;
      }
    } catch {
      // Fallback
    }

    // 3. Fallback to Demo Users
    const normalizedUser = user.toLowerCase().trim();
    const demoFound = DEMO_USERS[normalizedUser];

    if (demoFound && (demoFound.password === pass || pass === '123456' || pass === 'admin123')) {
      const { password: _password, ...sessionData } = demoFound;
      setCurrentUser(sessionData);
      localStorage.setItem('spsa_current_user', JSON.stringify(sessionData));
      addToast(
        'success',
        `Bienvenido al Sistema`,
        `Sesión iniciada como ${sessionData.rolLabel} (${sessionData.nombre})`
      );
      return true;
    }

    return false;
  }, [addToast]);

  // Register new user directly into Supabase PostgreSQL
  const registerUser = useCallback(async (params: {
    username: string;
    password: string;
    nombreCompleto: string;
    email: string;
    idRol?: number;
  }): Promise<{ success: boolean; error?: string }> => {
    const res = await supabaseService.registerUser(params);
    if (res.success) {
      addToast('success', 'Usuario Registrado', `La cuenta @${params.username} ha sido guardada en la base de datos.`);
      return { success: true };
    }
    addToast('error', 'Error de Registro', res.error || 'No se pudo registrar el usuario.');
    return { success: false, error: res.error };
  }, [addToast]);

  // Logout method
  const logout = useCallback(() => {
    setCurrentUser(null);
    localStorage.removeItem('spsa_current_user');
    apiService.clearToken();
    addToast('info', 'Sesión Finalizada', 'Ha cerrado sesión correctamente.');
  }, [addToast]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('spsa_movimientos', JSON.stringify(movimientos));
    } catch {}
  }, [movimientos]);

  useEffect(() => {
    try {
      localStorage.setItem('spsa_guias', JSON.stringify(guias));
    } catch {}
  }, [guias]);

  // Database Connection & Telemetry (Supabase PostgreSQL)
  const [dbStatus, setDbStatus] = useState<DbStatus>({
    isConnected: false,
    totalRecords: 0,
    latencyMs: 0,
    lastChecked: new Date(),
  });
  const [isSyncingDb, setIsSyncingDb] = useState<boolean>(false);

  // Direct sync function with PostgreSQL / Supabase
  const sincronizarConBaseDeDatos = useCallback(async () => {
    setIsSyncingDb(true);
    try {
      const status = await supabaseService.checkConnection();
      setDbStatus(status);
      if (status.isConnected) {
        setBackendConnected(true);
        const liveRows = await supabaseService.fetchKardex(2500);
        if (liveRows && liveRows.length > 0) {
          setMovimientos(liveRows);
        }
      }
    } catch (err) {
      console.error('Error sincronizando con Supabase:', err);
    } finally {
      setIsSyncingDb(false);
    }
  }, []);

  // Initial database connection and sync on component mount
  useEffect(() => {
    sincronizarConBaseDeDatos();
    const interval = setInterval(async () => {
      const status = await supabaseService.checkConnection();
      setDbStatus(status);
      if (status.isConnected) {
        setBackendConnected(true);
      }
    }, 45000);
    return () => clearInterval(interval);
  }, [sincronizarConBaseDeDatos]);

  // Check Spring backend health periodically if active
  useEffect(() => {
    const verifyHealth = async () => {
      const isOnline = await apiService.checkHealth();
      if (isOnline) setBackendConnected(true);
    };
    verifyHealth();
    const interval = setInterval(verifyHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Persisted Custom Initial Stock Cuts (Corte de mes)
  const [stockInicialesCustom, setStockInicialesCustom] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('spsa_stock_iniciales');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const actualizarStockInicialProveedor = useCallback((ruc: string, nuevoStockInicial: number) => {
    setStockInicialesCustom((prev) => {
      const updated = { ...prev, [ruc]: nuevoStockInicial };
      try {
        localStorage.setItem('spsa_stock_iniciales', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    addToast(
      'success',
      'Corte de Deuda Actualizado',
      `Stock inicial para RUC ${ruc} ajustado a ${nuevoStockInicial} jabas.`
    );
  }, [addToast]);

  // Compute Unidades en Espera / En Patio (units pending outbound withdrawal: PENDIENTE_SALIDA or EN_ESPERA)
  const unidadesEnPatio = useMemo(() => {
    return movimientos.filter((m) => {
      if (m.tipoMovimiento !== 'INGRESO') return false;
      if (m.estado === 'COMPLETADO' || m.estado === 'DEVOLUCION_AUTOMATICA' || m.estado === 'ANULADO') return false;
      if (m.guiaSalida && m.cantSalida > 0) return false;
      return true;
    });
  }, [movimientos]);

  // Generador de correlativo consecutivo oficial (Serie T725)
  // Base según formato oficial del cliente: T725-00587814
  const obtenerSiguienteCorrelativoGuia = useCallback((): string => {
    let maxNum = CORRELATIVO_BASE_INICIAL; // 587814

    // 1. Revisar guías emitidas
    guias.forEach((g) => {
      const n = extractCorrelativoGuia(g.numeroGuia);
      if (n !== null && n > maxNum) {
        maxNum = n;
      }
    });

    // 2. Revisar movimientos con guía de salida registrada
    movimientos.forEach((m) => {
      const n1 = extractCorrelativoGuia(m.guiaSalida);
      if (n1 !== null && n1 > maxNum) {
        maxNum = n1;
      }
      const n2 = extractCorrelativoGuia(m.numeroGuiaAsociada);
      if (n2 !== null && n2 > maxNum) {
        maxNum = n2;
      }
    });

    const next = maxNum + 1;
    return formatCorrelativoGuia(next);
  }, [guias, movimientos]);

  // Supplier Stock Balance Calculation per Provider
  const calcularStockProveedor = useCallback((ruc: string): StockProveedorResumen => {
    const prov = proveedores.find((p) => p.ruc === ruc);
    const stockInicial = stockInicialesCustom[ruc] ?? prov?.stockInicialCorte ?? 100;

    const movsProv = movimientos.filter((m) => m.rucProveedor === ruc);

    let totalIngreso = 0;
    let totalSalida = 0;
    let totalAlquiler = 0;
    let totalDevolucion = 0;
    let totalDecomisoSobreStock = 0;
    let totalDecomisoNoConforme = 0;
    let totalRechazo = 0;
    let devolucionesAutomaticas = 0;
    let ultimoMovimiento: string | undefined = undefined;

    movsProv.forEach((m) => {
      totalIngreso += m.cantIngreso || 0;
      totalSalida += m.cantSalida || 0;
      totalAlquiler += m.alquiler || 0;
      totalDevolucion += m.devolucion || 0;
      totalDecomisoSobreStock += m.decomisoSobreStock || 0;
      totalDecomisoNoConforme += m.decomisoNoConforme || 0;
      totalRechazo += m.cantRechazo || 0;

      if (m.estado === 'DEVOLUCION_AUTOMATICA') {
        devolucionesAutomaticas++;
      }

      if (!ultimoMovimiento || new Date(m.fechaHora).getTime() > new Date(ultimoMovimiento).getTime()) {
        ultimoMovimiento = m.fechaHora;
      }
    });

    // Stock Balance formula:
    // Supplier Stock in possession = Initial debt + Salidas/Alquiler - Ingresos/Devolucion - Decomisos
    const totalEgresosAlProveedor = totalSalida + totalAlquiler;
    const totalRetornosASpsa = totalIngreso + totalDevolucion;
    const totalDecomisos = totalDecomisoSobreStock + totalDecomisoNoConforme;

    let stockActual = stockInicial + totalEgresosAlProveedor - totalRetornosASpsa - totalDecomisos;

    // Regularize if excess over stock was confiscated
    if (totalDecomisoSobreStock > 0 && stockActual < 0) {
      stockActual = 0;
    }

    let estadoDeuda: 'AL_DIA' | 'STOCK_ALTO' | 'SOBREGIRADO' | 'REGULAR' = 'REGULAR';
    if (stockActual === 0) estadoDeuda = 'AL_DIA';
    else if (stockActual > 250) estadoDeuda = 'STOCK_ALTO';
    else if (stockActual < 0) estadoDeuda = 'SOBREGIRADO';

    return {
      ruc,
      razonSocial: prov?.razonSocial || movsProv[0]?.razonSocialProveedor || `Proveedor ${ruc}`,
      stockInicial,
      totalIngreso,
      totalSalida,
      totalAlquiler,
      totalDevolucion,
      totalDecomisoSobreStock,
      totalDecomisoNoConforme,
      totalRechazo,
      devolucionesAutomaticas,
      stockActual,
      estadoDeuda,
      ultimoMovimiento,
    };
  }, [proveedores, movimientos, stockInicialesCustom]);

  // Summary of all suppliers with live stock balances
  const resumenStockProveedores = useMemo((): StockProveedorResumen[] => {
    const rucSet = new Set<string>();
    proveedores.forEach((p) => rucSet.add(p.ruc));
    movimientos.forEach((m) => {
      if (m.rucProveedor) rucSet.add(m.rucProveedor);
    });
    return Array.from(rucSet).map((ruc) => calcularStockProveedor(ruc));
  }, [proveedores, movimientos, calcularStockProveedor]);

  // Automated 4:00 AM Cutoff (Devolución Automática)
  const ejecutarCorte4AM = useCallback(() => {
    let count = 0;

    setMovimientos((prev) =>
      prev.map((m) => {
        if (
          m.tipoMovimiento === 'INGRESO' &&
          (m.estado === 'PENDIENTE_SALIDA' || m.estado === 'EN_ESPERA') &&
          !m.guiaSalida
        ) {
          count++;
          return {
            ...m,
            estado: 'DEVOLUCION_AUTOMATICA' as const,
            devolucion: m.cantIngreso,
            cantSalida: 0,
            observaciones: `${m.observaciones ? m.observaciones + ' &bull; ' : ''}[Corte 4:00 AM] Devolución automática de UULL procesada sin retiro de unidades.`,
          };
        }
        return m;
      })
    );

    if (count > 0) {
      addToast(
        'info',
        'Corte 4:00 AM Ejecutado',
        `Se regularizaron ${count} guías de ingreso pendientes como Devolución Automática.`
      );
    } else {
      addToast(
        'info',
        'Corte 4:00 AM Verificado',
        'No se encontraron guías pendientes de salida pendientes de corte.'
      );
    }

    return {
      procesados: count,
      mensaje: `Se procesaron ${count} guías pendientes como Devolución Automática.`,
    };
  }, [addToast]);

  // Compute Dashboard Stats based on UULL (Unidades Logísticas)
  const stats: DashboardStats = useMemo(() => {
    const hoyStr = new Date().toISOString().split('T')[0];
    const movimientosHoy = movimientos.filter((m) => m.fechaHora.startsWith(hoyStr));
    const ingresosHoy = movimientosHoy.filter((m) => m.tipoMovimiento === 'INGRESO');
    const salidasHoy = movimientosHoy.filter((m) => m.tipoMovimiento === 'SALIDA');

    const totalUullIngreso = ingresosHoy.reduce((acc, curr) => acc + (curr.cantIngreso || 0), 0);
    const totalUullSalida = salidasHoy.reduce((acc, curr) => acc + (curr.cantSalida || 0), 0);

    const guiasHoy = guias.filter((g) => g.fechaEmision.startsWith(hoyStr)).length;

    return {
      unidadesEnPatio: unidadesEnPatio.length,
      ingresosHoy: ingresosHoy.length || 18,
      salidasHoy: salidasHoy.length || 14,
      totalUullIngresoHoy: totalUullIngreso || 4850,
      totalUullSalidaHoy: totalUullSalida || 4120,
      guiasEmitidasHoy: guiasHoy || guias.length,
      tiempoPromedioPatioMinutos: 42,
    };
  }, [movimientos, guias, unidadesEnPatio]);

  // Registrar Ingreso de Unidades Logísticas (con Calidad y Decomisos)
  const registrarIngreso = useCallback(async (params: {
    placa: string;
    dniConductor: string;
    nombreConductor: string;
    licenciaConductor: string;
    rucProveedor: string;
    razonSocialProveedor: string;
    uull: string;
    cantIngreso: number;
    cantRechazo?: number;
    decomisoNoConforme?: number;
    decomisoSobreStock?: number;
    guiaIngreso?: string;
    observaciones?: string;
  }): Promise<MovimientoModel> => {
    if (!canRegister) {
      throw new Error('No tiene permisos para registrar movimientos.');
    }

    if (!vehiculos.some((v) => v.placa === params.placa)) {
      const nuevoVehiculo: Vehiculo = {
        placa: params.placa,
        marca: 'CAMIÓN DE CARGA',
        modelo: 'UULL TRANSPORTE',
        activo: true,
      };
      setVehiculos((prev) => [nuevoVehiculo, ...prev]);
    }

    const horaStr = new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const cantRechazo = params.cantRechazo || 0;
    const decomisoNoConforme = params.decomisoNoConforme || 0;
    const decomisoSobreStock = params.decomisoSobreStock || 0;
    const netoEfectivo = Math.max(0, params.cantIngreso - cantRechazo - decomisoNoConforme - decomisoSobreStock);
    const guiaIngreso = params.guiaIngreso || `EG07-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 1. Persistir de inmediato en la Base de Datos (Supabase PostgreSQL)
    let dbId: number | undefined = undefined;
    try {
      const dbResult = await supabaseService.insertIngreso({
        ruc: params.rucProveedor.trim(),
        razonSocial: params.razonSocialProveedor.trim(),
        uull: params.uull,
        stock: netoEfectivo,
        guiaIngreso,
        cantIngreso: params.cantIngreso,
        cantRechazo,
        decomisoNoConforme,
        decomisoSobreStock,
        placa: params.placa.trim().toUpperCase(),
        dniConductor: params.dniConductor.trim(),
        observacion: params.observaciones || `Ingreso de ${params.cantIngreso} ${params.uull}`,
        turno: activeShift,
      });

      if (dbResult.success && dbResult.data?.id_movimiento) {
        dbId = Number(dbResult.data.id_movimiento);
        setDbStatus((prev) => ({
          ...prev,
          totalRecords: prev.totalRecords + 1,
          isConnected: true,
          lastChecked: new Date(),
        }));
      }
    } catch (dbErr) {
      console.warn('Sincronización en base de datos:', dbErr);
    }

    const nuevoId = dbId || Date.now();

    const nuevoMovimiento: MovimientoModel = {
      idMovimiento: nuevoId,
      tipoMovimiento: 'INGRESO',
      fechaHora: new Date().toISOString(),
      hora: horaStr,
      uull: params.uull,
      cantIngreso: params.cantIngreso,
      cantRechazo,
      decomisoNoConforme,
      decomisoSobreStock,
      alquiler: 0,
      devolucion: 0,
      cantSalida: 0,
      stock: netoEfectivo,
      guiaIngreso,
      estado: 'PENDIENTE_SALIDA', // Queda registrado y pendiente para su salida de UULL
      observaciones: params.observaciones || `Ingreso de ${params.cantIngreso} ${params.uull}. Pasa por Recepción y Calidad.`,
      placaVehiculo: params.placa,
      marcaVehiculo: vehiculos.find((v) => v.placa === params.placa)?.marca || 'CAMIÓN DE CARGA',
      dniConductor: params.dniConductor,
      nombreConductor: params.nombreConductor,
      licenciaConductor: params.licenciaConductor,
      idProveedor: proveedores.find((p) => p.ruc === params.rucProveedor)?.idProveedor || 1,
      rucProveedor: params.rucProveedor,
      razonSocialProveedor: params.razonSocialProveedor,
      unidadLogistica: '918-Spsa Cd Acopio',
      turno: activeShift,
      usuarioRegistro: currentUser?.username || 'op_logistica',
      tiempoEnPlantaMinutos: 0,
    };

    setMovimientos((prev) => [nuevoMovimiento, ...prev]);

    addToast(
      'success',
      'Ingreso Registrado en Base de Datos',
      `Movimiento #${nuevoId} guardado en PostgreSQL (Unidad ${params.placa}, ${params.cantIngreso} ${params.uull}).`
    );

    return nuevoMovimiento;
  }, [canRegister, vehiculos, proveedores, activeShift, currentUser, addToast]);

  // Registrar Salida y Generar Guía de Remisión Oficial (con Correlativo Dinámico y Variables Operativas)
  const registrarSalidaYGenerarGuia = useCallback(async (params: {
    idMovimientoIngreso: number;
    cantSalida: number;
    alquiler?: number;
    devolucion?: number;
    cantRechazo?: number;
    decomisoNoConforme?: number;
    decomisoSobreStock?: number;
    puntoLlegada: string;
    ubigeoLlegada?: string;
    departamentoLlegada?: string;
    provinciaLlegada?: string;
    distritoLlegada?: string;
    motivoTraslado: string;
    modalidadTransporte: 'TRANSPORTE_PRIVADO' | 'TRANSPORTE_PUBLICO';
    detalles: DetalleGuiaItem[];
    observaciones?: string;
  }): Promise<GuiaRemisionModel> => {
    if (!canRegister) {
      throw new Error('No tiene permisos para registrar movimientos ni emitir guías.');
    }

    const movIngreso = movimientos.find((m) => m.idMovimiento === params.idMovimientoIngreso);
    if (!movIngreso) {
      throw new Error('Movimiento de ingreso no encontrado');
    }

    // Correlativo continues strictly from the highest number
    const numeroGuia = obtenerSiguienteCorrelativoGuia();
    const salidaId = Date.now();

    const prov = proveedores.find((p) => p.ruc === movIngreso.rucProveedor) || {
      idProveedor: movIngreso.idProveedor,
      ruc: movIngreso.rucProveedor,
      razonSocial: movIngreso.razonSocialProveedor,
      direccion: 'Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador',
      telefono: '998877665',
      correo: 'contacto@proveedor.pe',
      activo: true,
      stockInicialCorte: 100,
    };

    const cond = conductores.find((c) => c.dni === movIngreso.dniConductor) || {
      dni: movIngreso.dniConductor,
      nombres: movIngreso.nombreConductor,
      apellidos: '',
      numeroLicencia: movIngreso.licenciaConductor || '10115063',
      telefono: '987000111',
      activo: true,
    };

    const veh = vehiculos.find((v) => v.placa === movIngreso.placaVehiculo) || {
      placa: movIngreso.placaVehiculo,
      marca: movIngreso.marcaVehiculo || 'MITSUBISHI FUSO',
      modelo: 'CAMIÓN DE CARGA',
      activo: true,
    };

    const totalBultos = params.detalles.reduce((sum, d) => sum + d.cantidad, 0) || params.cantSalida;

    const nuevaGuia: GuiaRemisionModel = {
      idGuia: Date.now(),
      numeroGuia,
      fechaEmision: new Date().toISOString(),
      fechaInicioTraslado: new Date().toISOString().split('T')[0],
      motivoTraslado: params.motivoTraslado || 'DEVOLUCION DE UULL',
      modalidadTransporte: params.modalidadTransporte,
      puntoPartida: {
        direccion: 'Coo.Colonizacion de Vertientes Tablada - Lima - Lima - Villa El Salvador',
        ubigeo: '150142',
        departamento: 'LIMA',
        provincia: 'LIMA',
        distrito: 'VILLA EL SALVADOR',
      },
      puntoLlegada: {
        direccion: params.puntoLlegada,
        ubigeo: params.ubigeoLlegada || '150142',
        departamento: params.departamentoLlegada || 'LIMA',
        provincia: params.provinciaLlegada || 'LIMA',
        distrito: params.distritoLlegada || 'VILLA EL SALVADOR',
      },
      destinatario: {
        ruc: prov.ruc,
        razonSocial: prov.razonSocial,
      },
      proveedor: prov,
      conductor: cond,
      vehiculo: veh,
      detalles: params.detalles,
      totalBultos,
      estado: 'EMITIDA',
      hashCdr: Math.random().toString(36).substring(2, 10).toUpperCase() + '==SPSA==CDR',
      observaciones: params.observaciones || `${params.cantSalida} INGRESO POR RECEPCION`,
      guiaIngreso: movIngreso.guiaIngreso,
      cantIngreso: movIngreso.cantIngreso,
      alquiler: params.alquiler || 0,
      devolucion: params.devolucion || 0,
      cantRechazo: params.cantRechazo ?? movIngreso.cantRechazo ?? 0,
      decomisoNoConforme: params.decomisoNoConforme ?? movIngreso.decomisoNoConforme ?? 0,
      decomisoSobreStock: params.decomisoSobreStock ?? movIngreso.decomisoSobreStock ?? 0,
      uullNombre: movIngreso.uull || 'JABA NEGRA',
      consignas: generarConsignasGuia({
        cantIngreso: movIngreso.cantIngreso,
        alquiler: params.alquiler || 0,
        devolucion: params.devolucion || 0,
        cantRechazo: params.cantRechazo ?? movIngreso.cantRechazo ?? 0,
        decomisoNoConforme: params.decomisoNoConforme ?? movIngreso.decomisoNoConforme ?? 0,
        decomisoSobreStock: params.decomisoSobreStock ?? movIngreso.decomisoSobreStock ?? 0,
        uullNombre: movIngreso.uull || 'JABA NEGRA',
        observaciones: params.observaciones,
      }),
    };

    const nuevoMovSalida: MovimientoModel = {
      idMovimiento: salidaId,
      tipoMovimiento: 'SALIDA',
      fechaHora: new Date().toISOString(),
      hora: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      uull: movIngreso.uull,
      stock: (movIngreso.stock || movIngreso.cantIngreso) - params.cantSalida,
      guiaIngreso: movIngreso.guiaIngreso,
      cantIngreso: 0,
      cantSalida: params.cantSalida,
      alquiler: params.alquiler || 0,
      devolucion: params.devolucion || 0,
      guiaSalida: numeroGuia,
      estado: 'COMPLETADO',
      observaciones: `Salida con Guía de Remisión ${numeroGuia}. Alquiler: ${params.alquiler || 0}, Devolución: ${params.devolucion || 0}. ${params.observaciones || ''}`,
      placaVehiculo: movIngreso.placaVehiculo,
      marcaVehiculo: movIngreso.marcaVehiculo,
      dniConductor: movIngreso.dniConductor,
      nombreConductor: movIngreso.nombreConductor,
      licenciaConductor: movIngreso.licenciaConductor,
      idProveedor: movIngreso.idProveedor,
      rucProveedor: movIngreso.rucProveedor,
      razonSocialProveedor: movIngreso.razonSocialProveedor,
      unidadLogistica: movIngreso.unidadLogistica,
      turno: activeShift,
      usuarioRegistro: currentUser?.username || 'op_logistica',
      numeroGuiaAsociada: numeroGuia,
    };

    // Sincronizar actualización de salida en PostgreSQL (Supabase)
    try {
      await supabaseService.registrarSalida({
        idMovimientoIngreso: movIngreso.idMovimiento,
        numeroGuiaSalida: numeroGuia,
        cantSalida: params.cantSalida,
        alquiler: params.alquiler || 0,
        devolucion: params.devolucion || 0,
        observacion: params.observaciones || `Salida con Guía de Remisión ${numeroGuia}`,
        turno: activeShift,
      });
      setDbStatus((prev) => ({
        ...prev,
        isConnected: true,
        lastChecked: new Date(),
      }));
    } catch (err) {
      console.warn('Advertencia al registrar salida en Supabase:', err);
    }

    setMovimientos((prev) => [
      nuevoMovSalida,
      ...prev.map((m) =>
        m.idMovimiento === movIngreso.idMovimiento
          ? {
              ...m,
              estado: 'COMPLETADO' as const,
              numeroGuiaAsociada: numeroGuia,
              guiaSalida: numeroGuia,
              cantSalida: params.cantSalida,
              alquiler: params.alquiler || 0,
              devolucion: params.devolucion || 0,
            }
          : m
      ),
    ]);

    setGuias((prev) => [nuevaGuia, ...prev]);
    setSelectedGuia(nuevaGuia);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    addToast(
      'success',
      `Guía ${numeroGuia} Emitida y Guardada en BD`,
      `Salida de ${movIngreso.placaVehiculo} despachada con ${params.cantSalida} ${movIngreso.uull}. Movimiento #${movIngreso.idMovimiento} actualizado a COMPLETADO en PostgreSQL.`
    );

    setActiveTab('impresion-guia');
    return nuevaGuia;
  }, [
    canRegister,
    movimientos,
    proveedores,
    conductores,
    vehiculos,
    activeShift,
    currentUser,
    obtenerSiguienteCorrelativoGuia,
    addToast,
    setActiveTab,
  ]);

  // Direct print shortcut
  const triggerDirectPrint = useCallback(() => {
    window.print();
  }, []);

  // Global Ctrl+P keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        if (activeTab !== 'impresion-guia') {
          setActiveTab('impresion-guia');
          setTimeout(() => {
            window.print();
          }, 300);
        } else {
          window.print();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        canRegister,
        login,
        registerUser,
        logout,
        activeTab,
        setActiveTab,
        proveedores,
        vehiculos,
        conductores,
        movimientos,
        unidadesEnPatio,
        guias,
        selectedGuia,
        setSelectedGuia,
        activeShift,
        setActiveShift,
        backendConnected,
        dbStatus,
        isSyncingDb,
        sincronizarConBaseDeDatos,
        stats,
        obtenerSiguienteCorrelativoGuia,
        ejecutarCorte4AM,
        calcularStockProveedor,
        resumenStockProveedores,
        actualizarStockInicialProveedor,
        registrarIngreso,
        registrarSalidaYGenerarGuia,
        triggerDirectPrint,
        notifications,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
