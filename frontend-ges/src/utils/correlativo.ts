/**
 * Utilidades para el manejo de correlativos oficiales de Guías de Remisión SPSA
 * Serie oficial: T725
 * Formato oficial: T725-XXXXXXXX (8 dígitos correlativos con relleno de ceros)
 * Correlativo base inicial: T725-00587814 (587814)
 */

export const CORRELATIVO_BASE_INICIAL = 587814; // T725-00587814

/**
 * Extrae de forma segura el número correlativo entero de una guía de remisión de serie T725.
 * Ignora series ajenas (como guías de ingreso de terceros EG07...) y limpia posibles valores corruptos.
 */
export const extractCorrelativoGuia = (guiaStr?: string | null): number | null => {
  if (!guiaStr) return null;
  const trimmed = guiaStr.trim();
  
  // Buscar coincidencia estricta con la serie T725
  const match = trimmed.match(/^T725-(\d+)$/i);
  if (!match) return null;

  const rawDigits = match[1];
  // Si viene con cifras concatenadas repetidas (ej. 725725... longitud > 8), se extraen los últimos 6 dígitos
  const cleanDigits = rawDigits.length > 8 ? rawDigits.slice(-6) : rawDigits;
  const num = parseInt(cleanDigits, 10);
  
  // Validar rango lógico para evitar valores fuera de escala
  if (!isNaN(num) && num >= 500000 && num < 10000000) {
    return num;
  }
  return null;
};

/**
 * Formatea un número correlativo entero al estándar oficial SUNAT SPSA: T725-00587814
 */
export const formatCorrelativoGuia = (num: number): string => {
  return `T725-${String(num).padStart(8, '0')}`;
};

/**
 * Normaliza y sanea cualquier cadena de guía para asegurar formato T725-XXXXXXXX de 8 dígitos.
 */
export const sanitizeNumeroGuia = (guiaStr?: string | null): string | undefined => {
  if (!guiaStr) return undefined;
  const num = extractCorrelativoGuia(guiaStr);
  if (num !== null) {
    return formatCorrelativoGuia(num);
  }
  return guiaStr;
};

export interface ConsignaGuiaParam {
  cantIngreso?: number;
  alquiler?: number;
  devolucion?: number;
  cantRechazo?: number;
  decomisoNoConforme?: number;
  decomisoSobreStock?: number;
  uullNombre?: string;
  observaciones?: string;
}

/**
 * Genera la lista de consignas que deben imprimirse de forma visible en la columna de descripción
 * de la Guía de Remisión según el formato oficial de Supermercados Peruanos SA.
 */
export const generarConsignasGuia = (params: ConsignaGuiaParam) => {
  const list: { cantidad: number; texto: string }[] = [];
  const uull = params.uullNombre || 'JABA NEGRA';

  // 1. INGRESO POR RECEPCION
  if (params.cantIngreso && params.cantIngreso > 0) {
    list.push({ cantidad: params.cantIngreso, texto: 'INGRESO POR RECEPCION' });
  }

  // 2. ALQUILER (por demanda de mercadería)
  if (params.alquiler && params.alquiler > 0) {
    list.push({ cantidad: params.alquiler, texto: 'ALQUILER' });
  }

  // 3. DEVOLUCION (retorno de UULL)
  if (params.devolucion && params.devolucion > 0) {
    list.push({ cantidad: params.devolucion, texto: 'DEVOLUCION' });
  }

  // 4. RECHAZO (jabas rechazadas por calidad)
  if (params.cantRechazo && params.cantRechazo > 0) {
    list.push({ cantidad: params.cantRechazo, texto: `RECHAZO (${uull})` });
  }

  // 5. DECOMISOS (separador si hay decomisos)
  const hasDecomisos =
    (params.decomisoNoConforme && params.decomisoNoConforme > 0) ||
    (params.decomisoSobreStock && params.decomisoSobreStock > 0);

  if (hasDecomisos && list.length > 0) {
    list.push({ cantidad: 0, texto: '-' });
  }

  // 6. DECOMISO (SIN LOGO)
  if (params.decomisoNoConforme && params.decomisoNoConforme > 0) {
    list.push({ cantidad: params.decomisoNoConforme, texto: 'DECOMISO (SIN LOGO)' });
  }

  // 7. DECOMISO (SOBRE STOCK)
  if (params.decomisoSobreStock && params.decomisoSobreStock > 0) {
    list.push({ cantidad: params.decomisoSobreStock, texto: 'DECOMISO (SOBRE STOCK)' });
  }

  // Fallback si no hay consignas específicas
  if (list.length === 0) {
    list.push({
      cantidad: params.cantIngreso || 105,
      texto: params.observaciones || 'INGRESO POR RECEPCION',
    });
  }

  return list;
};
