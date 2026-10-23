package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.Turno;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Long> {
    Optional<Turno> findByNombre(String nombre);
}
