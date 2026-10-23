package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_movimiento")
    private Long idMovimiento;

    @Column(name = "tipo_movimiento", nullable = false, length = 20)
    private String tipoMovimiento; // INGRESO, SALIDA

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "peso_bruto", precision = 10, scale = 2)
    private BigDecimal pesoBruto;

    @Column(name = "peso_tara", precision = 10, scale = 2)
    private BigDecimal pesoTara;

    @Column(name = "peso_neto", precision = 10, scale = 2)
    private BigDecimal pesoNeto;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "REGISTRADO"; // REGISTRADO, EN_PROCESO, COMPLETADO, ANULADO

    @Column(name = "observaciones", length = 500)
    private String observaciones;

    // Relaciones @ManyToOne especificadas
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_unidad_logistica")
    private UnidadLogistica unidadLogistica;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo", nullable = false)
    private Vehiculo vehiculo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conductor", nullable = false)
    private Conductor conductor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_turno")
    private Turno turno;

    @PrePersist
    protected void onCreate() {
        if (this.fechaHora == null) {
            this.fechaHora = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "REGISTRADO";
        }
        if (this.pesoBruto != null && this.pesoTara != null) {
            this.pesoNeto = this.pesoBruto.subtract(this.pesoTara);
        }
    }
}
