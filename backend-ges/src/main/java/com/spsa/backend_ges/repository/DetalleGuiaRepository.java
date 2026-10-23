package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.DetalleGuia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DetalleGuiaRepository extends JpaRepository<DetalleGuia, Long> {
    List<DetalleGuia> findByGuiaRemision_IdGuia(Long idGuia);
}
