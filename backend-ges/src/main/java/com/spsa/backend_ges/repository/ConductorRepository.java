package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.Conductor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConductorRepository extends JpaRepository<Conductor, Long> {
    Optional<Conductor> findByDni(String dni);
    Optional<Conductor> findByNumeroLicencia(String numeroLicencia);
    Boolean existsByDni(String dni);
}
