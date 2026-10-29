const fs = require("fs");
const https = require("https");

const token = process.env.SUPABASE_ACCESS_TOKEN || "";
const projectRef = "uibhqhamcytrvntslxka";

function executeSql(query) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query });
    const req = https.request(
      {
        hostname: "api.supabase.com",
        path: `/v1/projects/${projectRef}/database/query`,
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              resolve(data);
            }
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log("=== 1. CREANDO TABLA kardex_movimientos CON RAMPAS Y AUXILIARES ===");
  const ddl = `
    CREATE TABLE IF NOT EXISTS kardex_movimientos (
        id_movimiento INT PRIMARY KEY,
        ruc VARCHAR(15) NOT NULL REFERENCES proveedores(ruc),
        razon_social VARCHAR(255) NOT NULL,
        uull VARCHAR(50) NOT NULL,
        stock INT NOT NULL DEFAULT 0,
        guia_ingreso VARCHAR(100),
        fecha_ingreso DATE,
        hora_ingreso TIME,
        turno_ingreso VARCHAR(20),
        cant_ingreso INT NOT NULL DEFAULT 0,
        cant_rechazo INT NOT NULL DEFAULT 0,
        decomiso_no_conforme INT NOT NULL DEFAULT 0,
        decomiso_sobre_stock INT NOT NULL DEFAULT 0,
        alquiler INT NOT NULL DEFAULT 0,
        devolucion INT NOT NULL DEFAULT 0,
        guia_salida VARCHAR(100),
        fecha_salida DATE,
        hora_salida TIME,
        turno_salida VARCHAR(20),
        placa VARCHAR(20),
        licencia_dni VARCHAR(20),
        cant_salida INT NOT NULL DEFAULT 0,
        observacion TEXT,
        mov_stock INT NOT NULL DEFAULT 0,
        tolerancia VARCHAR(50),
        validacion VARCHAR(50),
        rampa INT,
        auxiliar_llamada VARCHAR(100),
        estado_unidad VARCHAR(50) DEFAULT 'EN_ESPERA'
    );
    CREATE INDEX IF NOT EXISTS idx_kardex_ruc ON kardex_movimientos(ruc);
    CREATE INDEX IF NOT EXISTS idx_kardex_fecha_ingreso ON kardex_movimientos(fecha_ingreso);
    CREATE INDEX IF NOT EXISTS idx_kardex_guia_salida ON kardex_movimientos(guia_salida);
    CREATE INDEX IF NOT EXISTS idx_kardex_guia_ingreso ON kardex_movimientos(guia_ingreso);
    CREATE INDEX IF NOT EXISTS idx_kardex_placa ON kardex_movimientos(placa);
    CREATE INDEX IF NOT EXISTS idx_kardex_rampa ON kardex_movimientos(rampa);
  `;
  await executeSql(ddl);
  console.log("Tabla creada e indexada correctamente.");

  // Check if table already has rows
  const countCheck = await executeSql("SELECT count(*) FROM kardex_movimientos;");
  const existingCount = parseInt(countCheck[0].count, 10);
  console.log(`Filas existentes en kardex_movimientos: ${existingCount}`);

  if (existingCount >= 8600) {
    console.log("Los datos ya están insertados en la base de datos.");
    return;
  }

  console.log("=== 2. LEYENDO SCRIPT SQL SEED ===");
  const sqlPath = "C:/Users/fabri/.gemini/antigravity/brain/8201cbd9-06cb-4ebf-99ab-4f3719df2d8d/.user_uploaded/media_1793218308437_a2c0bc21.sql";
  const content = fs.readFileSync(sqlPath, "utf8");

  // Extract all statements
  const statements = content
    .split(/;\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.startsWith("INSERT INTO kardex_movimientos"));

  console.log(`Total bloques INSERT a ejecutar: ${statements.length}`);

  for (let i = 0; i < statements.length; i++) {
    process.stdout.write(`Insertando bloque ${i + 1}/${statements.length}... `);
    await executeSql(statements[i]);
    console.log("OK");
  }

  // Update rampas with realistic distribution (rampa 1 a 27) for units with placa
  console.log("=== 3. ASIGNANDO RAMPAS 1 A 27 Y AUXILIARES A HISTORICO ===");
  await executeSql(`
    UPDATE kardex_movimientos
    SET rampa = (id_movimiento % 27) + 1,
        auxiliar_llamada = CASE (id_movimiento % 4)
          WHEN 0 THEN 'Carlos Mendoza (Aux. Rampa 1-7)'
          WHEN 1 THEN 'Jorge Huamán (Aux. Rampa 8-14)'
          WHEN 2 THEN 'Miguel Quispe (Aux. Rampa 15-21)'
          ELSE 'Roberto Flores (Aux. Rampa 22-27)'
        END,
        estado_unidad = CASE
          WHEN cant_salida > 0 THEN 'DESPACHADO'
          ELSE 'EN_RAMPA'
        END
    WHERE placa IS NOT NULL;
  `);

  const finalCount = await executeSql("SELECT count(*) FROM kardex_movimientos;");
  console.log(`Finalizado. Total registros en kardex_movimientos: ${finalCount[0].count}`);
}

main().catch((err) => {
  console.error("Error en ejecución:", err);
  process.exit(1);
});
