package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "guias_remision")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuiaRemision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_guia")
    private Long idGuia;

    @Column(name = "numero_guia", nullable = false, unique = true, length = 50)
    private String numeroGuia;

    @Column(name = "fecha_emision", nullable = false)
    private LocalDateTime fechaEmision;

    @Column(name = "punto_partida", nullable = false, length = 250)
    private String puntoPartida;

    @Column(name = "punto_llegada", nullable = false, length = 250)
    private String puntoLlegada;

    @Column(name = "peso_total_kg", precision = 10, scale = 2)
    private BigDecimal pesoTotalKg;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "EMITIDA";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_movimiento")
    private Movimiento movimiento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_conductor")
    private Conductor conductor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_vehiculo")
    private Vehiculo vehiculo;

    @OneToMany(mappedBy = "guiaRemision", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleGuia> detalles = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (this.fechaEmision == null) {
            this.fechaEmision = LocalDateTime.now();
        }
        if (this.estado == null) {
            this.estado = "EMITIDA";
        }
    }
}
