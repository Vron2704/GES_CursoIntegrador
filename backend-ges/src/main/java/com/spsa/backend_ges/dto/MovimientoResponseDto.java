package com.spsa.backend_ges.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoResponseDto {

    private Long idMovimiento;
    private String tipoMovimiento;
    private LocalDateTime fechaHora;
    private BigDecimal pesoBruto;
    private BigDecimal pesoTara;
    private BigDecimal pesoNeto;
    private String estado;
    private String observaciones;

    // Vehículo
    private String placaVehiculo;
    private String marcaVehiculo;

    // Conductor
    private String dniConductor;
    private String nombreConductor;

    // Proveedor
    private Long idProveedor;
    private String rucProveedor;
    private String razonSocialProveedor;

    // Operación
    private String unidadLogistica;
    private String turno;
    private String usuarioRegistro;
}
