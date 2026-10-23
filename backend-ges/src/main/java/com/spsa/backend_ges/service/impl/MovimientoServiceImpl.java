package com.spsa.backend_ges.service.impl;

import com.spsa.backend_ges.dto.KardexReporteDto;
import com.spsa.backend_ges.dto.MovimientoRequestDto;
import com.spsa.backend_ges.dto.MovimientoResponseDto;
import com.spsa.backend_ges.entity.*;
import com.spsa.backend_ges.exception.BadRequestException;
import com.spsa.backend_ges.exception.ResourceNotFoundException;
import com.spsa.backend_ges.repository.*;
import com.spsa.backend_ges.service.MovimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MovimientoServiceImpl implements MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final ProveedorRepository proveedorRepository;
    private final ConductorRepository conductorRepository;
    private final VehiculoRepository vehiculoRepository;
    private final UsuarioRepository usuarioRepository;
    private final UnidadLogisticaRepository unidadLogisticaRepository;
    private final TurnoRepository turnoRepository;

    @Override
    @Transactional
    public MovimientoResponseDto registrar(MovimientoRequestDto dto, String username) {
        // 1. Validar existencia del Vehículo por placa
        Vehiculo vehiculo = vehiculoRepository.findByPlaca(dto.getPlaca())
                .orElseThrow(() -> new BadRequestException("El vehículo con placa '" + dto.getPlaca() + "' no se encuentra registrado"));

        if (Boolean.FALSE.equals(vehiculo.getActivo())) {
            throw new BadRequestException("El vehículo con placa '" + dto.getPlaca() + "' está inactivo");
        }

        // 2. Validar existencia del Conductor por DNI
        Conductor conductor = conductorRepository.findByDni(dto.getDniConductor())
                .orElseThrow(() -> new BadRequestException("El conductor con DNI '" + dto.getDniConductor() + "' no se encuentra registrado"));

        if (Boolean.FALSE.equals(conductor.getActivo())) {
            throw new BadRequestException("El conductor '" + conductor.getNombres() + " " + conductor.getApellidos() + "' está inactivo");
        }

        // 3. Validar existencia del Proveedor por RUC
        Proveedor proveedor = proveedorRepository.findByRuc(dto.getRucProveedor())
                .orElseThrow(() -> new BadRequestException("El proveedor con RUC '" + dto.getRucProveedor() + "' no se encuentra registrado"));

        if (Boolean.FALSE.equals(proveedor.getActivo())) {
            throw new BadRequestException("El proveedor '" + proveedor.getRazonSocial() + "' se encuentra inactivo");
        }

        // 4. Obtener el Usuario autenticado que registra el movimiento
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado en el sistema: " + username));

        // 5. Validar pesos
        BigDecimal pesoNeto = BigDecimal.ZERO;
        if (dto.getPesoBruto() != null && dto.getPesoTara() != null) {
            if (dto.getPesoBruto().compareTo(dto.getPesoTara()) < 0) {
                throw new BadRequestException("El peso bruto no puede ser inferior al peso tara");
            }
            pesoNeto = dto.getPesoBruto().subtract(dto.getPesoTara());
        }

        // 6. Unidad Logística y Turno opcionales
        UnidadLogistica unidadLogistica = null;
        if (dto.getCodigoUnidadLogistica() != null && !dto.getCodigoUnidadLogistica().isBlank()) {
            unidadLogistica = unidadLogisticaRepository.findByCodigo(dto.getCodigoUnidadLogistica()).orElse(null);
        }

        Turno turno = null;
        if (dto.getNombreTurno() != null && !dto.getNombreTurno().isBlank()) {
            turno = turnoRepository.findByNombre(dto.getNombreTurno()).orElse(null);
        }

        // 7. Construir y persistir el Movimiento
        Movimiento movimiento = Movimiento.builder()
                .tipoMovimiento(dto.getTipoMovimiento().toUpperCase())
                .fechaHora(LocalDateTime.now())
                .pesoBruto(dto.getPesoBruto())
                .pesoTara(dto.getPesoTara())
                .pesoNeto(pesoNeto)
                .estado("REGISTRADO")
                .observaciones(dto.getObservaciones())
                .proveedor(proveedor)
                .conductor(conductor)
                .vehiculo(vehiculo)
                .usuario(usuario)
                .unidadLogistica(unidadLogistica)
                .turno(turno)
                .build();

        Movimiento guardado = movimientoRepository.save(movimiento);
        return mapToResponseDto(guardado);
    }

    @Override
    @Transactional(readOnly = true)
    public KardexReporteDto obtenerKardex(Long idProveedor, LocalDate fechaInicio, LocalDate fechaFin) {
        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + idProveedor));

        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);

        List<Movimiento> movimientos = movimientoRepository.findKardexByProveedorAndRangoFechas(idProveedor, inicio, fin);

        BigDecimal totalIngresos = BigDecimal.ZERO;
        BigDecimal totalSalidas = BigDecimal.ZERO;

        for (Movimiento m : movimientos) {
            BigDecimal peso = m.getPesoNeto() != null ? m.getPesoNeto() : BigDecimal.ZERO;
            if ("INGRESO".equalsIgnoreCase(m.getTipoMovimiento())) {
                totalIngresos = totalIngresos.add(peso);
            } else if ("SALIDA".equalsIgnoreCase(m.getTipoMovimiento())) {
                totalSalidas = totalSalidas.add(peso);
            }
        }

        BigDecimal saldoNeto = totalIngresos.subtract(totalSalidas);

        List<MovimientoResponseDto> movimientosDto = movimientos.stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());

        return KardexReporteDto.builder()
                .idProveedor(proveedor.getIdProveedor())
                .ruc(proveedor.getRuc())
                .razonSocial(proveedor.getRazonSocial())
                .fechaInicio(fechaInicio)
                .fechaFin(fechaFin)
                .totalIngresosKg(totalIngresos)
                .totalSalidasKg(totalSalidas)
                .saldoNetoKg(saldoNeto)
                .movimientos(movimientosDto)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimientoResponseDto> listarMovimientos() {
        return movimientoRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovimientoResponseDto obtenerPorId(Long id) {
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento no encontrado con ID: " + id));
        return mapToResponseDto(movimiento);
    }

    private MovimientoResponseDto mapToResponseDto(Movimiento m) {
        return MovimientoResponseDto.builder()
                .idMovimiento(m.getIdMovimiento())
                .tipoMovimiento(m.getTipoMovimiento())
                .fechaHora(m.getFechaHora())
                .pesoBruto(m.getPesoBruto())
                .pesoTara(m.getPesoTara())
                .pesoNeto(m.getPesoNeto())
                .estado(m.getEstado())
                .observaciones(m.getObservaciones())
                .placaVehiculo(m.getVehiculo() != null ? m.getVehiculo().getPlaca() : null)
                .marcaVehiculo(m.getVehiculo() != null ? m.getVehiculo().getMarca() : null)
                .dniConductor(m.getConductor() != null ? m.getConductor().getDni() : null)
                .nombreConductor(m.getConductor() != null ? (m.getConductor().getNombres() + " " + m.getConductor().getApellidos()) : null)
                .idProveedor(m.getProveedor() != null ? m.getProveedor().getIdProveedor() : null)
                .rucProveedor(m.getProveedor() != null ? m.getProveedor().getRuc() : null)
                .razonSocialProveedor(m.getProveedor() != null ? m.getProveedor().getRazonSocial() : null)
                .unidadLogistica(m.getUnidadLogistica() != null ? m.getUnidadLogistica().getNombre() : null)
                .turno(m.getTurno() != null ? m.getTurno().getNombre() : null)
                .usuarioRegistro(m.getUsuario() != null ? m.getUsuario().getUsername() : null)
                .build();
    }
}
