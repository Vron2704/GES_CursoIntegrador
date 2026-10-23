package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.UnidadLogistica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnidadLogisticaRepository extends JpaRepository<UnidadLogistica, Long> {
    Optional<UnidadLogistica> findByCodigo(String codigo);
}
