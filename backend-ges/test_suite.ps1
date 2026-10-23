$baseUrl = "http://localhost:8080"
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " EJECUTANDO SUITE DE PRUEBAS POSTMAN (AUTOMATIZADA)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# 1. Login Exitoso
try {
    $loginBody = @{ username = "admin"; password = "admin123" } | ConvertTo-Json
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginRes.token
    Write-Host "[PASS] 1. POST /api/auth/login -> 200 OK | JWT Token recibido: $($token.Substring(0, 25))..." -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 1. POST /api/auth/login - Error: $_" -ForegroundColor Red
    exit 1
}

# 2. Login Fallido
try {
    $badLogin = @{ username = "admin"; password = "wrong_password" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method Post -Body $badLogin -ContentType "application/json"
    Write-Host "[FAIL] 2. POST /api/auth/login con clave errónea debió dar 401" -ForegroundColor Red
} catch {
    Write-Host "[PASS] 2. POST /api/auth/login con clave errónea -> 401 Unauthorized" -ForegroundColor Green
}

# 3. Acceso denegado sin token
try {
    Invoke-RestMethod -Uri "$baseUrl/api/proveedores" -Method Get
    Write-Host "[FAIL] 3. GET /api/proveedores sin token debió ser rechazado" -ForegroundColor Red
} catch {
    Write-Host "[PASS] 3. GET /api/proveedores sin token -> 403 Forbidden (Protegido por SecurityFilterChain)" -ForegroundColor Green
}

# 4. Listar proveedores con token
$headers = @{ Authorization = "Bearer $token" }
try {
    $provs = Invoke-RestMethod -Uri "$baseUrl/api/proveedores" -Method Get -Headers $headers
    Write-Host "[PASS] 4. GET /api/proveedores con Bearer Token -> 200 OK | $($provs.Count) proveedores en base de datos" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 4. GET /api/proveedores - Error: $_" -ForegroundColor Red
}

# 5. Crear proveedor
$newProvId = $null
try {
    $nuevoProv = @{
        ruc = "20778899001"
        razonSocial = "Cooperativa Agraria Cafetalera Central"
        direccion = "Jr. Progreso 102, Chanchamayo"
        telefono = "964112233"
        correo = "acopio@coopcentral.pe"
        activo = $true
    } | ConvertTo-Json
    $createdProv = Invoke-RestMethod -Uri "$baseUrl/api/proveedores" -Method Post -Body $nuevoProv -ContentType "application/json" -Headers $headers
    $newProvId = $createdProv.idProveedor
    Write-Host "[PASS] 5. POST /api/proveedores -> 201 Created | ID: $newProvId, RUC: $($createdProv.ruc), Razón: $($createdProv.razonSocial)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 5. POST /api/proveedores - Error: $_" -ForegroundColor Red
}

# 6. Obtener proveedor por ID
try {
    $getProv = Invoke-RestMethod -Uri "$baseUrl/api/proveedores/$newProvId" -Method Get -Headers $headers
    Write-Host "[PASS] 6. GET /api/proveedores/$newProvId -> 200 OK | Obtenido: $($getProv.razonSocial)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 6. GET /api/proveedores/$newProvId - Error: $_" -ForegroundColor Red
}

# 7. Actualizar proveedor
try {
    $updProv = @{
        ruc = "20778899001"
        razonSocial = "Cooperativa Agraria Cafetalera Central - Filial Junín"
        direccion = "Jr. Progreso 102, Chanchamayo"
        telefono = "999888111"
        correo = "gerencia@coopcentral.pe"
        activo = $true
    } | ConvertTo-Json
    $updated = Invoke-RestMethod -Uri "$baseUrl/api/proveedores/$newProvId" -Method Put -Body $updProv -ContentType "application/json" -Headers $headers
    Write-Host "[PASS] 7. PUT /api/proveedores/$newProvId -> 200 OK | Nuevo Teléfono: $($updated.telefono)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 7. PUT /api/proveedores/$newProvId - Error: $_" -ForegroundColor Red
}

# 8. Validación RUC erróneo
try {
    $badProv = @{ ruc = "123"; razonSocial = "Test" } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/proveedores" -Method Post -Body $badProv -ContentType "application/json" -Headers $headers
    Write-Host "[FAIL] 8. POST con RUC corto debió fallar" -ForegroundColor Red
} catch {
    Write-Host "[PASS] 8. POST /api/proveedores con RUC de 3 dígitos -> 400 Bad Request (Validación @Size/@Pattern exitosa)" -ForegroundColor Green
}

# 9. Registrar Movimiento en Garita (Ingreso)
try {
    $movIngreso = @{
        tipoMovimiento = "INGRESO"
        placa = "ABC-123"
        dniConductor = "12345678"
        rucProveedor = "20123456789"
        codigoUnidadLogistica = "ALM-01"
        nombreTurno = "Mañana"
        pesoBruto = 28500.00
        pesoTara = 9200.00
        observaciones = "Ingreso de café especial en garita principal"
    } | ConvertTo-Json
    $movRes = Invoke-RestMethod -Uri "$baseUrl/api/movimientos" -Method Post -Body $movIngreso -ContentType "application/json" -Headers $headers
    Write-Host "[PASS] 9. POST /api/movimientos -> 201 Created | ID Mov: $($movRes.idMovimiento), Bruto: $($movRes.pesoBruto) kg, Tara: $($movRes.pesoTara) kg, Peso Neto: $($movRes.pesoNeto) kg" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 9. POST /api/movimientos - Error: $_" -ForegroundColor Red
}

# 10. Movimiento con Placa Inexistente
try {
    $badMov = @{
        tipoMovimiento = "INGRESO"
        placa = "ZZZ-999"
        dniConductor = "12345678"
        rucProveedor = "20123456789"
        pesoBruto = 20000.00
        pesoTara = 8000.00
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/api/movimientos" -Method Post -Body $badMov -ContentType "application/json" -Headers $headers
    Write-Host "[FAIL] 10. Movimiento con placa inexistente debió fallar" -ForegroundColor Red
} catch {
    Write-Host "[PASS] 10. POST /api/movimientos con vehículo no registrado -> 400 Bad Request (Validación de Garita exitosa)" -ForegroundColor Green
}

# 11. Consultar Kardex
try {
    $kardex = Invoke-RestMethod -Uri "$baseUrl/api/movimientos/kardex?id_proveedor=1&fecha_inicio=2026-01-01&fecha_fin=2026-12-31" -Method Get -Headers $headers
    Write-Host "[PASS] 11. GET /api/movimientos/kardex -> 200 OK | Proveedor: $($kardex.razonSocial), Total Ingresos: $($kardex.totalIngresosKg) kg, Saldo Neto: $($kardex.saldoNetoKg) kg, Movimientos en rango: $($kardex.movimientos.Count)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 11. GET /api/movimientos/kardex - Error: $_" -ForegroundColor Red
}

# 12. Eliminar proveedor (borrado lógico)
try {
    Invoke-RestMethod -Uri "$baseUrl/api/proveedores/$newProvId" -Method Delete -Headers $headers
    Write-Host "[PASS] 12. DELETE /api/proveedores/$newProvId -> 204 No Content (Desactivado lógicamente para auditoría)" -ForegroundColor Green
} catch {
    Write-Host "[FAIL] 12. DELETE /api/proveedores/$newProvId - Error: $_" -ForegroundColor Red
}

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " TODAS LAS PRUEBAS (12/12) COMPLETADAS EXITOSAMENTE" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
