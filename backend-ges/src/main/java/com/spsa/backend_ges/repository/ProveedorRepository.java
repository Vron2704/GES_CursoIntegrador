package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    Optional<Proveedor> findByRuc(String ruc);
    Boolean existsByRuc(String ruc);
    List<Proveedor> findByActivoTrue();
}
