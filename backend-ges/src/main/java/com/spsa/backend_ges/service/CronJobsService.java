package com.spsa.backend_ges.service;

import com.spsa.backend_ges.entity.AlertaInactividad;
import com.spsa.backend_ges.entity.CorteDeuda;
import com.spsa.backend_ges.entity.Movimiento;
import com.spsa.backend_ges.entity.Proveedor;
import com.spsa.backend_ges.repository.AlertaInactividadRepository;
import com.spsa.backend_ges.repository.CorteDeudaRepository;
import com.spsa.backend_ges.repository.MovimientoRepository;
import com.spsa.backend_ges.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class CronJobsService {

    private final ProveedorRepository proveedorRepository;
    private final MovimientoRepository movimientoRepository;
    private final AlertaInactividadRepository alertaInactividadRepository;
    private final CorteDeudaRepository corteDeudaRepository;

    /**
     * CRON 1: Ejecutado todos los días a medianoche (00:00:00).
     * Evalúa si los proveedores activos llevan más de 30 días sin registrar Movimientos.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void verificarProveedoresInactivos() {
        log.info("Iniciando tarea programada: Verificación de inactividad de proveedores (>30 días)...");
        LocalDateTime ahora = LocalDateTime.now();
        List<Proveedor> proveedoresActivos = proveedorRepository.findByActivoTrue();

        int alertasGeneradas = 0;

        for (Proveedor proveedor : proveedoresActivos) {
            Optional<LocalDateTime> ultimaFechaOpt = movimientoRepository
                    .findUltimaFechaMovimientoByProveedorId(proveedor.getIdProveedor());

            LocalDateTime fechaReferencia = ultimaFechaOpt.orElse(proveedor.getFechaRegistro());

            if (fechaReferencia != null) {
                long diasSinMovimientos = ChronoUnit.DAYS.between(fechaReferencia, ahora);

                if (diasSinMovimientos > 30) {
                    // Evitar duplicar alertas pendientes en las últimas 24 horas
                    Boolean yaTieneAlertaReciente = alertaInactividadRepository
                            .existsAlertaPendienteReciente(proveedor.getIdProveedor(), ahora.minusHours(24));

                    if (Boolean.FALSE.equals(yaTieneAlertaReciente)) {
                        AlertaInactividad alerta = AlertaInactividad.builder()
                                .proveedor(proveedor)
                                .fechaAlerta(ahora)
                                .diasInactividad(diasSinMovimientos)
                                .ultimaFechaMovimiento(ultimaFechaOpt.orElse(null))
                                .mensaje(String.format("El proveedor %s (RUC: %s) registra %d días continuos sin movimientos de acopio.",
                                        proveedor.getRazonSocial(), proveedor.getRuc(), diasSinMovimientos))
                                .estado("PENDIENTE")
                                .build();

                        alertaInactividadRepository.save(alerta);
                        alertasGeneradas++;
                        log.warn("Alerta de inactividad creada para proveedor ID {}: {} días inactivo",
                                proveedor.getIdProveedor(), diasSinMovimientos);
                    }
                }
            }
        }

        log.info("Tarea de verificación de inactividad finalizada. Alertas generadas: {}", alertasGeneradas);
    }

    /**
     * CRON 2: Ejecutado el primer día de cada mes a medianoche (00:00:00 del día 1).
     * Genera el cálculo mensual en la tabla 'CorteDeuda' para el mes calendario anterior.
     */
    @Scheduled(cron = "0 0 0 1 * *")
    @Transactional
    public void generarCorteDeudaMensual() {
        YearMonth mesAnterior = YearMonth.now().minusMonths(1);
        procesarCorteDeudaParaPeriodo(mesAnterior);
    }

    @Transactional
    public void procesarCorteDeudaParaPeriodo(YearMonth periodo) {
        String periodoStr = periodo.toString(); // Formato YYYY-MM
        log.info("Iniciando tarea programada: Generación de Corte de Deuda para el periodo {}...", periodoStr);

        LocalDateTime inicioMes = periodo.atDay(1).atStartOfDay();
        LocalDateTime finMes = periodo.atEndOfMonth().atTime(LocalTime.MAX);
        LocalDate fechaCorte = LocalDate.now();

        List<Proveedor> proveedoresActivos = proveedorRepository.findByActivoTrue();
        BigDecimal tarifaPorKg = new BigDecimal("0.0500"); // Tarifa referencial de acopio: 0.05 PEN/kg
        int cortesGenerados = 0;

        for (Proveedor proveedor : proveedoresActivos) {
            // Verificar si el corte del periodo ya fue procesado para este proveedor
            if (Boolean.TRUE.equals(corteDeudaRepository.existsByProveedor_IdProveedorAndPeriodo(proveedor.getIdProveedor(), periodoStr))) {
                continue;
            }

            List<Movimiento> movimientosMes = movimientoRepository
                    .findKardexByProveedorAndRangoFechas(proveedor.getIdProveedor(), inicioMes, finMes);

            BigDecimal totalKilos = movimientosMes.stream()
                    .filter(m -> "INGRESO".equalsIgnoreCase(m.getTipoMovimiento()))
                    .map(m -> m.getPesoNeto() != null ? m.getPesoNeto() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal montoTotalServicio = totalKilos.multiply(tarifaPorKg);
            BigDecimal montoDeuda = montoTotalServicio; // Saldo deudor generado para el periodo

            CorteDeuda corte = CorteDeuda.builder()
                    .proveedor(proveedor)
                    .periodo(periodoStr)
                    .fechaCorte(fechaCorte)
                    .totalKilosAcopiados(totalKilos)
                    .tarifaPorKilo(tarifaPorKg)
                    .montoTotalServicio(montoTotalServicio)
                    .montoDeuda(montoDeuda)
                    .estado("CALCULADO")
                    .build();

            corteDeudaRepository.save(corte);
            cortesGenerados++;
        }

        log.info("Generación de corte de deuda finalizada para el periodo {}. Registros creados: {}",
                periodoStr, cortesGenerados);
    }
}
