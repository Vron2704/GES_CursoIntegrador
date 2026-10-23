package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.Movimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MovimientoRepository extends JpaRepository<Movimiento, Long> {

    @Query("SELECT m FROM Movimiento m WHERE m.proveedor.idProveedor = :idProveedor AND m.fechaHora BETWEEN :fechaInicio AND :fechaFin ORDER BY m.fechaHora ASC")
    List<Movimiento> findKardexByProveedorAndRangoFechas(
            @Param("idProveedor") Long idProveedor,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    @Query("SELECT MAX(m.fechaHora) FROM Movimiento m WHERE m.proveedor.idProveedor = :idProveedor")
    Optional<LocalDateTime> findUltimaFechaMovimientoByProveedorId(@Param("idProveedor") Long idProveedor);
}
