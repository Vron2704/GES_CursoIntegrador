package com.spsa.backend_ges.controller;

import com.spsa.backend_ges.dto.KardexReporteDto;
import com.spsa.backend_ges.dto.MovimientoRequestDto;
import com.spsa.backend_ges.dto.MovimientoResponseDto;
import com.spsa.backend_ges.service.MovimientoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
public class MovimientoController {

    private final MovimientoService movimientoService;

    @PostMapping
    public ResponseEntity<MovimientoResponseDto> registrarMovimiento(
            @Valid @RequestBody MovimientoRequestDto requestDto,
            Principal principal
    ) {
        String username = principal != null ? principal.getName() : "SISTEMA";
        MovimientoResponseDto nuevo = movimientoService.registrar(requestDto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @GetMapping("/kardex")
    public ResponseEntity<KardexReporteDto> obtenerKardex(
            @RequestParam("id_proveedor") Long idProveedor,
            @RequestParam("fecha_inicio") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam("fecha_fin") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin
    ) {
        KardexReporteDto kardex = movimientoService.obtenerKardex(idProveedor, fechaInicio, fechaFin);
        return ResponseEntity.ok(kardex);
    }

    @GetMapping
    public ResponseEntity<List<MovimientoResponseDto>> listar() {
        return ResponseEntity.ok(movimientoService.listarMovimientos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MovimientoResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.obtenerPorId(id));
    }
}
