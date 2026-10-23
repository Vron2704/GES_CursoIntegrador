package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.GuiaRemision;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GuiaRemisionRepository extends JpaRepository<GuiaRemision, Long> {
    Optional<GuiaRemision> findByNumeroGuia(String numeroGuia);
    Boolean existsByNumeroGuia(String numeroGuia);
}
