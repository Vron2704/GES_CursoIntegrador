package com.spsa.backend_ges.repository;

import com.spsa.backend_ges.entity.Vehiculo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    Optional<Vehiculo> findByPlaca(String placa);
    Boolean existsByPlaca(String placa);
}
