package com.spsa.backend_ges.security;

import com.spsa.backend_ges.entity.Usuario;
import com.spsa.backend_ges.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado con username: " + username));

        if (Boolean.FALSE.equals(usuario.getActivo())) {
            throw new UsernameNotFoundException("El usuario se encuentra inactivo en el sistema");
        }

        String roleName = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";
        if (!roleName.startsWith("ROLE_")) {
            roleName = "ROLE_" + roleName;
        }

        List<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority(roleName));

        return new User(
                usuario.getUsername(),
                usuario.getPassword(),
                authorities
        );
    }
}
