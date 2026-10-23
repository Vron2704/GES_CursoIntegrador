package com.spsa.backend_ges.service;

import com.spsa.backend_ges.dto.KardexReporteDto;
import com.spsa.backend_ges.dto.MovimientoRequestDto;
import com.spsa.backend_ges.dto.MovimientoResponseDto;

import java.time.LocalDate;
import java.util.List;

public interface MovimientoService {

    MovimientoResponseDto registrar(MovimientoRequestDto requestDto, String username);

    KardexReporteDto obtenerKardex(Long idProveedor, LocalDate fechaInicio, LocalDate fechaFin);

    List<MovimientoResponseDto> listarMovimientos();

    MovimientoResponseDto obtenerPorId(Long id);
}
