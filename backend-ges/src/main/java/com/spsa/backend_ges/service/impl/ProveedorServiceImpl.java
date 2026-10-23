package com.spsa.backend_ges.service.impl;

import com.spsa.backend_ges.dto.ProveedorRequestDto;
import com.spsa.backend_ges.dto.ProveedorResponseDto;
import com.spsa.backend_ges.entity.Proveedor;
import com.spsa.backend_ges.exception.BadRequestException;
import com.spsa.backend_ges.exception.ResourceNotFoundException;
import com.spsa.backend_ges.repository.ProveedorRepository;
import com.spsa.backend_ges.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDto> listarTodos() {
        return proveedorRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDto> listarActivos() {
        return proveedorRepository.findByActivoTrue().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDto obtenerPorId(Long id) {
        Proveedor proveedor = buscarPorId(id);
        return mapToResponseDto(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDto obtenerPorRuc(String ruc) {
        Proveedor proveedor = proveedorRepository.findByRuc(ruc)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con RUC: " + ruc));
        return mapToResponseDto(proveedor);
    }

    @Override
    @Transactional
    public ProveedorResponseDto crear(ProveedorRequestDto requestDto) {
        if (proveedorRepository.existsByRuc(requestDto.getRuc())) {
            throw new BadRequestException("Ya existe un proveedor registrado con el RUC: " + requestDto.getRuc());
        }

        Proveedor proveedor = Proveedor.builder()
                .ruc(requestDto.getRuc())
                .razonSocial(requestDto.getRazonSocial())
                .direccion(requestDto.getDireccion())
                .telefono(requestDto.getTelefono())
                .correo(requestDto.getCorreo())
                .activo(requestDto.getActivo() != null ? requestDto.getActivo() : true)
                .build();

        Proveedor guardado = proveedorRepository.save(proveedor);
        return mapToResponseDto(guardado);
    }

    @Override
    @Transactional
    public ProveedorResponseDto actualizar(Long id, ProveedorRequestDto requestDto) {
        Proveedor proveedor = buscarPorId(id);

        proveedorRepository.findByRuc(requestDto.getRuc()).ifPresent(existente -> {
            if (!existente.getIdProveedor().equals(id)) {
                throw new BadRequestException("El RUC " + requestDto.getRuc() + " ya está asignado a otro proveedor");
            }
        });

        proveedor.setRuc(requestDto.getRuc());
        proveedor.setRazonSocial(requestDto.getRazonSocial());
        proveedor.setDireccion(requestDto.getDireccion());
        proveedor.setTelefono(requestDto.getTelefono());
        proveedor.setCorreo(requestDto.getCorreo());
        if (requestDto.getActivo() != null) {
            proveedor.setActivo(requestDto.getActivo());
        }

        Proveedor actualizado = proveedorRepository.save(proveedor);
        return mapToResponseDto(actualizado);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        Proveedor proveedor = buscarPorId(id);
        // Borrado lógico para preservar integridad histórica de movimientos y guías
        proveedor.setActivo(false);
        proveedorRepository.save(proveedor);
    }

    private Proveedor buscarPorId(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
    }

    private ProveedorResponseDto mapToResponseDto(Proveedor entity) {
        return ProveedorResponseDto.builder()
                .idProveedor(entity.getIdProveedor())
                .ruc(entity.getRuc())
                .razonSocial(entity.getRazonSocial())
                .direccion(entity.getDireccion())
                .telefono(entity.getTelefono())
                .correo(entity.getCorreo())
                .activo(entity.getActivo())
                .fechaRegistro(entity.getFechaRegistro())
                .build();
    }
}
