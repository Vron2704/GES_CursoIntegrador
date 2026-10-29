# Sistema de Control de Acopio & Emisión de Guías de Remisión Electrónicas (SPSA Logística)

Frontend profesional desarrollado en **React 19**, **TypeScript**, **Tailwind CSS v4** y **Recharts**, diseñado específicamente para centros de acopio agroindustrial, garitas de control y emisión de Guías de Remisión Electrónicas (GRE - Remitente) conforme a la normativa SUNAT del Perú.

---

## 🚀 Características Principales

### 1. 📊 Dashboard Operativo en Tiempo Real
- **KPIs y Métricas Clave**:
  - Unidades activas en patio de descarga
  - Total de ingresos (unidades y toneladas brutas)
  - Total de salidas (unidades y toneladas netas)
  - Guías de Remisión Electrónicas emitidas hoy
- **Gráficos Dinámicos e Interactivos**:
  - **Flujo de Unidades por Franja Horaria**: Comparativa hora por hora (06:00 a 22:00) de ingresos vs salidas en balanzas.
  - **Balance Semanal de Tonelaje (Tn)**: Barras compuestas de peso bruto vs tara con línea de tendencia de peso neto.
  - **Distribución de Carga**: Gráfico donut por tipo de producto (Frutas, Hortalizas, Tubérculos, Granos).
  - **Top Proveedores**: Ranking de proveedores agrícolas por volumen acopiado.
- **Patio de Maniobras en Vivo**: Monitor de camiones en bahías con indicador de tiempo en planta (verde < 1h, ámbar 1-2h, rojo > 2h) y botón directo "Procesar Salida".
- **Feed de Últimas Operaciones**: Historial secuencial de pesajes en garita.

### 2. 📥 Registro de Ingreso (Garita 01 - Balanza de Entrada)
- **Simulador y Display de Balanza Digital**: Visor LED con telemetría de pesaje bruto, indicador de estabilidad (`STABLE / IN MOTION`), puesta a cero (tara) y simulación de pesos de flota.
- **Formulario Inteligente**:
  - Autocompletado de flotas frecuentes y datos técnicos del camión (marca, modelo, capacidad en kg).
  - Validación y autollenado de Conductor (DNI, Nombres y Apellidos, Nro de Licencia).
  - Proveedor / Remitente del acopio (RUC 11 dígitos con catálogo precargado).
  - Asignación de muelle / bahía de descarga.
- **Ticket de Pesaje Imprimible**: Genera instantáneamente el comprobante de pesaje de entrada con código de barras y datos del turno.

### 3. 📤 Registro de Salida & Emisión de Guía (Garita 02 - Balanza de Salida)
- **Selector Visual de Unidades en Patio**: Selección ágil del camión que terminó su descarga.
- **Captura de Balanza de Tara**:
  - Cálculo automático en tiempo real:
    $$\text{Peso Neto Real} = \text{Peso Bruto (Entrada)} - \text{Peso Tara (Salida)}$$
- **Datos Oficiales de Traslado**: Punto de llegada, ubigeo de destino, motivo de traslado SUNAT (Venta, Compra de acopio, Traslado entre almacenes), modalidad de transporte.
- **Tabla Dinámica de Bienes Transportados**: Gestión de ítems de la guía (código, descripción, unidad de medida SUNAT, cantidad de bultos y peso en KG).
- **Disparo de Emisión**: Al confirmar la salida, emite automáticamente la Guía de Remisión Electrónica con numeración correlativa `T725-XXXXXX` y redirige a la pantalla de impresión con animación de confeti.

### 4. 🖨️ Pantalla para Impresión de la Guía Generada
- **Formato Oficial SUNAT A4 (Guía de Remisión Electrónica - Remitente)**:
  - Cuadro RUC superior con borde reglamentario: R.U.C. 20100070970, GUÍA DE REMISIÓN ELECTRÓNICA - REMITENTE, N° `T725-XXXXXX`.
  - Encabezado institucional de **Supermercados Peruanos S.A.** (Centro de Acopio).
  - Datos de traslado, puntos de partida y llegada con códigos de ubigeo.
  - Datos del destinatario, proveedor/transportista y conductor (placa, DNI, licencia).
  - Detalle completo de mercadería transportada.
  - Certificación de pesaje balanza (Bruto, Tara, Neto certificado, total bultos).
  - Código QR generado con datos fiscales SUNAT, código de barras Code-128 y Hash CDR digital SHA-256.
- **Acciones y Herramientas**:
  - **🖨️ Imprimir Guía**: Adaptada con estilos `@media print` para formato A4 impecable sin barras de navegación ni fondos innecesarios.
  - **📥 Descargar PDF**: Diálogo directo de guardado en PDF de alta fidelidad.
  - **📄 Ver XML SUNAT**: Modal interactivo con el archivo UBL 2.1 estándar y opción de copiar al portapapeles.
  - **✉️ Enviar por Correo**: Notificación al transportista.
  - **Catálogo Histórico**: Búsqueda y filtrado de todas las guías emitidas por número, RUC, placa o estado.

### 5. 📋 Kardex & Historial de Auditoría
- Filtro avanzado por tipo de movimiento (Ingresos / Salidas) y proveedor.
- Resumen acumulado de tonelaje bruto, tara y neto.
- Exportación directa a **CSV / Excel** con todos los metadatos de auditoría.

---

## 🛠️ Tecnologías Empleadas

- **React 19**: Framework frontend de última generación.
- **TypeScript**: Tipado estricto de entidades y DTOs de acopio.
- **Vite 6 / 8**: Bundler ultrarrápido con HMR.
- **Tailwind CSS v4**: Motor de diseño moderno, limpio y responsivo.
- **Recharts**: Gráficos SVG para visualización de métricas y tendencias.
- **Lucide React**: Iconografía corporativa.
- **Canvas Confetti**: Feedback visual al emitir documentos fiscales.

---

## 💻 Instrucciones para Ejecutar

```bash
# 1. Ingresar al directorio del frontend
cd frontend-ges

# 2. Iniciar el servidor de desarrollo
npm run dev

# 3. Compilar para producción
npm run build

# 4. Previsualizar la compilación de producción
npm run preview
```

El servidor estará disponible por defecto en: `http://localhost:3000` (o `http://localhost:5173`).

---

## 🔗 Integración con Backend Spring Boot

El frontend incluye un cliente API `src/services/api.ts` con proxy configurado en `vite.config.ts` hacia `http://localhost:8080`:
- Si el backend Spring Boot (`backend-ges`) está encendido, el sistema consume directamente los endpoints `/api/movimientos`, `/api/proveedores` y `/api/auth/login`.
- Si el backend está apagado, el frontend activa de forma transparente su **Modo Autónomo Reactivo** con persistencia en `localStorage`, permitiendo realizar demostraciones, pruebas y registros sin interrupciones.
