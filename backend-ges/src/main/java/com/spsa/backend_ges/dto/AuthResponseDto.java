package com.spsa.backend_ges.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDto {

    private String token;
    @Builder.Default
    private String type = "Bearer";
    private String username;
    private String rol;
    private String nombreCompleto;
}
