package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "cortes_deuda")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CorteDeuda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_corte")
    private Long idCorte;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @Column(name = "periodo", nullable = false, length = 7) // Formato YYYY-MM
    private String periodo;

    @Column(name = "fecha_corte", nullable = false)
    private LocalDate fechaCorte;

    @Column(name = "total_kilos_acopiados", precision = 12, scale = 2)
    private BigDecimal totalKilosAcopiados;

    @Column(name = "tarifa_por_kilo", precision = 10, scale = 4)
    private BigDecimal tarifaPorKilo;

    @Column(name = "monto_total_servicio", precision = 12, scale = 2)
    private BigDecimal montoTotalServicio;

    @Column(name = "monto_deuda", precision = 12, scale = 2)
    private BigDecimal montoDeuda;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "CALCULADO"; // CALCULADO, FACTURADO, PAGADO

    @Column(name = "fecha_generacion", updatable = false)
    private LocalDateTime fechaGeneracion;

    @PrePersist
    protected void onCreate() {
        if (this.fechaGeneracion == null) {
            this.fechaGeneracion = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "CALCULADO";
        }
    }
}
