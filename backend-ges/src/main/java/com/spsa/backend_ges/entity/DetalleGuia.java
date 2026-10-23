package com.spsa.backend_ges.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "detalles_guia")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleGuia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle")
    private Long idDetalle;

    @Column(name = "codigo_producto", length = 30)
    private String codigoProducto;

    @Column(name = "descripcion_producto", nullable = false, length = 200)
    private String descripcionProducto;

    @Column(name = "cantidad", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidad;

    @Column(name = "unidad_medida", nullable = false, length = 10)
    private String unidadMedida;

    @Column(name = "peso_kg", precision = 10, scale = 2)
    private BigDecimal pesoKg;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_guia", nullable = false)
    private GuiaRemision guiaRemision;
}
