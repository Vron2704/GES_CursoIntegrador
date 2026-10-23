package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.CorteDeuda;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorteDeudaRepository extends JpaRepository<CorteDeuda, Long> {
    Optional<CorteDeuda> findByProveedor_IdProveedorAndPeriodo(Long idProveedor, String periodo);
    List<CorteDeuda> findByPeriodo(String periodo);
    Boolean existsByProveedor_IdProveedorAndPeriodo(Long idProveedor, String periodo);
}
