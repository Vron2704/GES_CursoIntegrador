import { MovimientoModel, Proveedor } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('spsa_jwt_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('spsa_jwt_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('spsa_jwt_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/movimientos`, {
        method: 'GET',
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(2000),
      });
      return response.status !== 502 && response.status !== 504 && response.status !== 503;
    } catch {
      return false;
    }
  }

  async login(username: string, password: string): Promise<{ token: string; type: string } | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.setToken(data.token);
        return data;
      }
      return null;
    } catch {
      return null;
    }
  }

  async getMovimientos(): Promise<MovimientoModel[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/movimientos`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  async registrarMovimiento(payload: {
    tipoMovimiento: 'INGRESO' | 'SALIDA';
    placa: string;
    dniConductor: string;
    rucProveedor: string;
    codigoUnidadLogistica?: string;
    nombreTurno?: string;
    pesoBruto: number;
    pesoTara?: number;
    observaciones?: string;
  }): Promise<MovimientoModel | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/movimientos`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }

  async getProveedores(): Promise<Proveedor[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/proveedores`, {
        headers: this.getHeaders(),
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch {
      return null;
    }
  }
}

export const apiService = new ApiService();
