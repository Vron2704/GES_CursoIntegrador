import { createClient } from '@supabase/supabase-js';
import { KardexRecord } from '../data/kardexHistoricalData';
import { MovimientoModel } from '../types';
import { sanitizeNumeroGuia } from '../utils/correlativo';

export const SUPABASE_URL = 'https://uibhqhamcytrvntslxka.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYmhxaGFtY3l0cnZudHNseGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMxNzE2MDcsImV4cCI6MjEwODc0NzYwN30.UQOp49iXlInTR6J4hiZiMyXx6Z0s5um6wA9mDDsN674';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface DbStatus {
  isConnected: boolean;
  totalRecords: number;
  latencyMs: number;
  lastChecked: Date;
  error?: string;
}

// Convert DB row from public.kardex_movimientos to MovimientoModel
export const mapDbRowToMovimiento = (row: any): MovimientoModel => {
  const isSalida = (row.cant_salida > 0 || !!row.guia_salida) && !row.cant_ingreso;
  const isSalidaWithIngreso = (row.cant_salida > 0 || !!row.guia_salida) && row.cant_ingreso > 0;

  return {
    idMovimiento: Number(row.id_movimiento),
    tipoMovimiento: isSalida ? 'SALIDA' : 'INGRESO',
    fechaHora: row.fecha_ingreso
      ? `${row.fecha_ingreso}T${row.hora_ingreso || '12:00:00'}`
      : new Date().toISOString(),
    hora: row.hora_ingreso || row.hora_salida || '12:00:00',
    uull: row.uull || 'JABA NEGRA',
    stock: row.stock ?? 0,
    guiaIngreso: row.guia_ingreso || undefined,
    cantIngreso: Number(row.cant_ingreso) || 0,
    cantRechazo: Number(row.cant_rechazo) || 0,
    decomisoNoConforme: Number(row.decomiso_no_conforme) || 0,
    decomisoSobreStock: Number(row.decomiso_sobre_stock) || 0,
    alquiler: Number(row.alquiler) || 0,
    devolucion: Number(row.devolucion) || 0,
    guiaSalida: sanitizeNumeroGuia(row.guia_salida),
    cantSalida: Number(row.cant_salida) || 0,
    observaciones:
      row.observacion ||
      (isSalida
        ? `Despacho de ${row.cant_salida} ${row.uull}`
        : `Ingreso de ${row.cant_ingreso} ${row.uull}`),
    placaVehiculo: row.placa || (row.id_movimiento % 2 === 0 ? 'ALT-798' : 'BXR-715'),
    dniConductor: row.licencia_dni || '10115063',
    nombreConductor: 'CONDUCTOR LOGÍSTICO SPSA',
    licenciaConductor: row.licencia_dni || '10115063',
    rucProveedor: row.ruc,
    razonSocialProveedor: row.razon_social,
    unidadLogistica: '918-Spsa Cd Acopio',
    turno: row.turno_ingreso || row.turno_salida || '1-MAÑANA',
    usuarioRegistro: 'op_logistica',
    numeroGuiaAsociada: sanitizeNumeroGuia(row.guia_salida) || row.guia_ingreso || undefined,
    estado: isSalidaWithIngreso
      ? 'COMPLETADO'
      : isSalida
      ? 'COMPLETADO'
      : (row.estado_unidad === 'PENDIENTE_SALIDA' ? 'PENDIENTE_SALIDA' : 'EN_ESPERA'),
    pesoBruto: Number(row.cant_ingreso) || 0,
    pesoTara: 0,
    pesoNeto: Number(row.cant_salida) || Number(row.cant_ingreso) || 0,
  };
};

export class SupabaseService {
  // Test connection and latency
  async checkConnection(): Promise<DbStatus> {
    const start = performance.now();
    try {
      const { count, error } = await supabase
        .from('kardex_movimientos')
        .select('*', { count: 'exact', head: true });

      const latencyMs = Math.round(performance.now() - start);

      if (error) {
        return {
          isConnected: false,
          totalRecords: 0,
          latencyMs,
          lastChecked: new Date(),
          error: error.message,
        };
      }

      return {
        isConnected: true,
        totalRecords: count || 0,
        latencyMs,
        lastChecked: new Date(),
      };
    } catch (err: any) {
      return {
        isConnected: false,
        totalRecords: 0,
        latencyMs: Math.round(performance.now() - start),
        lastChecked: new Date(),
        error: err.message || 'Error de conexión',
      };
    }
  }

  // Fetch recent movements from DB (default 1000 records)
  async fetchKardex(limit = 1000): Promise<MovimientoModel[] | null> {
    try {
      const { data, error } = await supabase
        .from('kardex_movimientos')
        .select('*')
        .order('id_movimiento', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching kardex from Supabase:', error);
        return null;
      }

      return data.map(mapDbRowToMovimiento);
    } catch (err) {
      console.error('Exception fetching kardex from Supabase:', err);
      return null;
    }
  }

  // Insert a new INGRESO movement into public.kardex_movimientos
  async insertIngreso(params: {
    ruc: string;
    razonSocial: string;
    uull: string;
    stock: number;
    guiaIngreso: string;
    cantIngreso: number;
    cantRechazo?: number;
    decomisoNoConforme?: number;
    decomisoSobreStock?: number;
    placa: string;
    dniConductor: string;
    observacion?: string;
    turno?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const now = new Date();
      const fechaIngreso = now.toISOString().split('T')[0];
      const horaIngreso = now.toTimeString().split(' ')[0];

      const payload = {
        ruc: params.ruc,
        razon_social: params.razonSocial,
        uull: params.uull,
        stock: params.stock,
        guia_ingreso: params.guiaIngreso,
        fecha_ingreso: fechaIngreso,
        hora_ingreso: horaIngreso,
        turno_ingreso: params.turno || '1-MAÑANA',
        cant_ingreso: params.cantIngreso,
        cant_rechazo: params.cantRechazo || 0,
        decomiso_no_conforme: params.decomisoNoConforme || 0,
        decomiso_sobre_stock: params.decomisoSobreStock || 0,
        alquiler: 0,
        devolucion: 0,
        cant_salida: 0,
        placa: params.placa,
        licencia_dni: params.dniConductor,
        observacion: params.observacion || 'INGRESO POR RECEPCION',
        estado_unidad: 'PENDIENTE_SALIDA',
      };

      const { data, error } = await supabase
        .from('kardex_movimientos')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error inserting ingreso into Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('Exception inserting ingreso into Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  // Update existing ingreso and register SALIDA with referral guide
  async registrarSalida(params: {
    idMovimientoIngreso: number;
    numeroGuiaSalida: string;
    cantSalida: number;
    alquiler?: number;
    devolucion?: number;
    observacion?: string;
    turno?: string;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const now = new Date();
      const fechaSalida = now.toISOString().split('T')[0];
      const horaSalida = now.toTimeString().split(' ')[0];

      const updatePayload = {
        guia_salida: params.numeroGuiaSalida,
        fecha_salida: fechaSalida,
        hora_salida: horaSalida,
        turno_salida: params.turno || '1-MAÑANA',
        cant_salida: params.cantSalida,
        alquiler: params.alquiler || 0,
        devolucion: params.devolucion || 0,
        observacion: params.observacion || `Salida con Guía de Remisión ${params.numeroGuiaSalida}`,
        estado_unidad: 'COMPLETADO',
      };

      const { data, error } = await supabase
        .from('kardex_movimientos')
        .update(updatePayload)
        .eq('id_movimiento', params.idMovimientoIngreso)
        .select()
        .single();

      if (error) {
        console.error('Error updating salida in Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('Exception updating salida in Supabase:', err);
      return { success: false, error: err.message };
    }
  }

  // Register a new user directly into public.usuarios in Supabase
  async registerUser(params: {
    username: string;
    password: string;
    nombreCompleto: string;
    email: string;
    idRol?: number;
  }): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const cleanUser = params.username.trim().toLowerCase();
      const cleanEmail = params.email.trim().toLowerCase();

      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('username', cleanUser)
        .maybeSingle();

      if (existingUser) {
        return { success: false, error: 'El nombre de usuario ya está registrado en el sistema.' };
      }

      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (existingEmail) {
        return { success: false, error: 'El correo electrónico ya se encuentra registrado.' };
      }

      const payload = {
        username: cleanUser,
        password: params.password.trim(),
        nombre_completo: params.nombreCompleto.trim(),
        email: cleanEmail,
        activo: true,
        id_rol: params.idRol || 2,
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error('Error inserting user into Supabase:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err: any) {
      console.error('Exception registering user in Supabase:', err);
      return { success: false, error: err.message || 'Error al conectar con la base de datos' };
    }
  }

  // Authenticate user directly from public.usuarios table
  async authenticateUser(userOrEmail: string, pass: string): Promise<any | null> {
    try {
      const term = userOrEmail.trim().toLowerCase();
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .or(`username.eq.${term},email.eq.${term}`)
        .eq('activo', true)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      if (data.password === pass.trim()) {
        return data;
      }
      return null;
    } catch (err) {
      console.error('Exception authenticating user with Supabase:', err);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
