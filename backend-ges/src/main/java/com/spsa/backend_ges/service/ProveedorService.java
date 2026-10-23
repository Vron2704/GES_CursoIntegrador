package com.spsa.backend_ges.service;

import com.spsa.backend_ges.dto.ProveedorRequestDto;
import com.spsa.backend_ges.dto.ProveedorResponseDto;

import java.util.List;

public interface ProveedorService {

    List<ProveedorResponseDto> listarTodos();

    List<ProveedorResponseDto> listarActivos();

    ProveedorResponseDto obtenerPorId(Long id);

    ProveedorResponseDto obtenerPorRuc(String ruc);

    ProveedorResponseDto crear(ProveedorRequestDto requestDto);

    ProveedorResponseDto actualizar(Long id, ProveedorRequestDto requestDto);

    void eliminar(Long id);
}
