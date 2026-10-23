package com.spsa.backend_ges.config;

import com.spsa.backend_ges.entity.*;
import com.spsa.backend_ges.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalTime;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProveedorRepository proveedorRepository;
    private final ConductorRepository conductorRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UnidadLogisticaRepository unidadLogisticaRepository;
    private final TurnoRepository turnoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Iniciando verificación y carga de datos iniciales...");

        // 1. Roles
        Rol rolAdmin = rolRepository.findByNombre("ADMIN").orElseGet(() ->
                rolRepository.save(Rol.builder()
                        .nombre("ADMIN")
                        .descripcion("Administrador general del sistema")
                        .build())
        );

        rolRepository.findByNombre("OPERADOR").orElseGet(() ->
                rolRepository.save(Rol.builder()
                        .nombre("OPERADOR")
                        .descripcion("Operador de garita y balanza")
                        .build())
        );

        // 2. Usuario Administrador
        if (!usuarioRepository.existsByUsername("admin")) {
            Usuario admin = Usuario.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombreCompleto("Administrador del Sistema")
                    .email("admin@acopio.com")
                    .activo(true)
                    .rol(rolAdmin)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario inicial creado: admin / admin123");
        }

        // 3. Vehículo inicial de prueba
        if (!vehiculoRepository.existsByPlaca("ABC-123")) {
            Vehiculo vehiculo = Vehiculo.builder()
                    .placa("ABC-123")
                    .marca("Volvo")
                    .modelo("FH16")
                    .capacidadCargaKg(new BigDecimal("30000.00"))
                    .activo(true)
                    .build();
            vehiculoRepository.save(vehiculo);
            log.info("Vehículo inicial creado: ABC-123");
        }

        // 4. Conductor inicial de prueba
        if (!conductorRepository.existsByDni("12345678")) {
            Conductor conductor = Conductor.builder()
                    .dni("12345678")
                    .nombres("Juan Carlos")
                    .apellidos("Pérez Gomez")
                    .numeroLicencia("Q12345678")
                    .telefono("987654321")
                    .activo(true)
                    .build();
            conductorRepository.save(conductor);
            log.info("Conductor inicial creado: Juan Carlos Pérez");
        }

        // 5. Proveedor inicial de prueba
        if (!proveedorRepository.existsByRuc("20123456789")) {
            Proveedor proveedor = Proveedor.builder()
                    .ruc("20123456789")
                    .razonSocial("Agroindustrias del Norte S.A.C.")
                    .direccion("Carretera Central Km 15, Huánuco")
                    .telefono("062-512345")
                    .correo("contacto@agronorte.com")
                    .activo(true)
                    .build();
            proveedorRepository.save(proveedor);
            log.info("Proveedor inicial creado: Agroindustrias del Norte S.A.C.");
        }

        // 6. Unidad Logística y Turno
        if (unidadLogisticaRepository.findByCodigo("ALM-01").isEmpty()) {
            unidadLogisticaRepository.save(UnidadLogistica.builder()
                    .codigo("ALM-01")
                    .nombre("Almacén Principal de Acopio")
                    .tipo("Acopio Granos")
                    .activo(true)
                    .build());
        }

        if (turnoRepository.findByNombre("Mañana").isEmpty()) {
            turnoRepository.save(Turno.builder()
                    .nombre("Mañana")
                    .horaInicio(LocalTime.of(7, 0))
                    .horaFin(LocalTime.of(15, 0))
                    .activo(true)
                    .build());
        }

        log.info("Carga de datos iniciales finalizada correctamente.");
    }
}
