package com.spsa.backend_ges.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorResponseDto {

    private Long idProveedor;
    private String ruc;
    private String razonSocial;
    private String direccion;
    private String telefono;
    private String correo;
    private Boolean activo;
    private LocalDateTime fechaRegistro;
}
