package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.AlertaInactividad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertaInactividadRepository extends JpaRepository<AlertaInactividad, Long> {

    List<AlertaInactividad> findByEstado(String estado);

    @Query("SELECT COUNT(a) > 0 FROM AlertaInactividad a WHERE a.proveedor.idProveedor = :idProveedor AND a.fechaAlerta >= :fechaDesde AND a.estado = 'PENDIENTE'")
    Boolean existsAlertaPendienteReciente(
            @Param("idProveedor") Long idProveedor,
            @Param("fechaDesde") LocalDateTime fechaDesde
    );
}
