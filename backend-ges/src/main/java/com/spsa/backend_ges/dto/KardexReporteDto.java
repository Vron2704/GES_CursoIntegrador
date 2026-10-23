package com.spsa.backend_ges.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KardexReporteDto {

    private Long idProveedor;
    private String ruc;
    private String razonSocial;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private BigDecimal totalIngresosKg;
    private BigDecimal totalSalidasKg;
    private BigDecimal saldoNetoKg;
    private List<MovimientoResponseDto> movimientos;
}
