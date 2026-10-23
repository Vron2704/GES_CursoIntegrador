package com.spsa.backend_ges.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MovimientoRequestDto {

    @NotBlank(message = "El tipo de movimiento es obligatorio (INGRESO o SALIDA)")
    @Pattern(regexp = "^(INGRESO|SALIDA)$", message = "El tipo de movimiento debe ser INGRESO o SALIDA")
    private String tipoMovimiento;

    @NotBlank(message = "La placa del vehículo es obligatoria")
    private String placa;

    @NotBlank(message = "El DNI del conductor es obligatorio")
    private String dniConductor;

    @NotBlank(message = "El RUC del proveedor es obligatorio")
    private String rucProveedor;

    private String codigoUnidadLogistica;

    private String nombreTurno;

    @DecimalMin(value = "0.0", inclusive = true, message = "El peso bruto no puede ser negativo")
    private BigDecimal pesoBruto;

    @DecimalMin(value = "0.0", inclusive = true, message = "El peso tara no puede ser negativo")
    private BigDecimal pesoTara;

    private String observaciones;
}
