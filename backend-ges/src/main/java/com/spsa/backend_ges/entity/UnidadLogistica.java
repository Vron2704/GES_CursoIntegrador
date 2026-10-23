package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "unidades_logisticas")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnidadLogistica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_unidad_logistica")
    private Long idUnidadLogistica;

    @Column(name = "codigo", nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "tipo", length = 50)
    private String tipo;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;

    @PrePersist
    protected void onCreate() {
        if (this.activo == null) {
            this.activo = true;
        }
    }
}
