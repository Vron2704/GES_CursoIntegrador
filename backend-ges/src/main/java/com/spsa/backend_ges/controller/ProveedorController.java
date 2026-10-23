package com.spsa.backend_ges.controller;

import com.spsa.backend_ges.dto.ProveedorRequestDto;
import com.spsa.backend_ges.dto.ProveedorResponseDto;
import com.spsa.backend_ges.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    public ResponseEntity<List<ProveedorResponseDto>> listar(
            @RequestParam(name = "soloActivos", defaultValue = "false") boolean soloActivos
    ) {
        List<ProveedorResponseDto> resultado = soloActivos
                ? proveedorService.listarActivos()
                : proveedorService.listarTodos();
        return ResponseEntity.ok(resultado);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorResponseDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(proveedorService.obtenerPorId(id));
    }

    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<ProveedorResponseDto> obtenerPorRuc(@PathVariable String ruc) {
        return ResponseEntity.ok(proveedorService.obtenerPorRuc(ruc));
    }

    @PostMapping
    public ResponseEntity<ProveedorResponseDto> crear(@Valid @RequestBody ProveedorRequestDto requestDto) {
        ProveedorResponseDto nuevo = proveedorService.crear(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorResponseDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody ProveedorRequestDto requestDto
    ) {
        ProveedorResponseDto actualizado = proveedorService.actualizar(id, requestDto);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
