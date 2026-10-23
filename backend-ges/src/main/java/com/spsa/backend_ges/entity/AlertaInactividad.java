package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "alertas_inactividad")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlertaInactividad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerta")
    private Long idAlerta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @Column(name = "fecha_alerta", nullable = false)
    private LocalDateTime fechaAlerta;

    @Column(name = "dias_inactividad", nullable = false)
    private Long diasInactividad;

    @Column(name = "ultima_fecha_movimiento")
    private LocalDateTime ultimaFechaMovimiento;

    @Column(name = "mensaje", nullable = false, length = 300)
    private String mensaje;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, REVISADO, DESCARTADO

    @PrePersist
    protected void onCreate() {
        if (this.fechaAlerta == null) {
            this.fechaAlerta = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "PENDIENTE";
        }
    }
}
