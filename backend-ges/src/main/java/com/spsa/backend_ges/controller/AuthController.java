package com.spsa.backend_ges.controller;

import com.spsa.backend_ges.dto.AuthResponseDto;
import com.spsa.backend_ges.dto.LoginRequestDto;
import com.spsa.backend_ges.entity.Usuario;
import com.spsa.backend_ges.repository.UsuarioRepository;
import com.spsa.backend_ges.security.CustomUserDetailsService;
import com.spsa.backend_ges.security.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );
        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("mensaje", "Credenciales incorrectas: usuario o contraseña inválidos"));
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getUsername());
        final Usuario usuario = usuarioRepository.findByUsername(loginRequest.getUsername())
                .orElseThrow();

        Map<String, Object> claims = new HashMap<>();
        String roleName = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";
        claims.put("rol", roleName);
        claims.put("nombreCompleto", usuario.getNombreCompleto());
        claims.put("idUsuario", usuario.getIdUsuario());

        final String token = jwtUtil.generateToken(usuario.getUsername(), claims);

        AuthResponseDto response = AuthResponseDto.builder()
                .token(token)
                .type("Bearer")
                .username(usuario.getUsername())
                .rol(roleName)
                .nombreCompleto(usuario.getNombreCompleto())
                .build();

        return ResponseEntity.ok(response);
    }
}
