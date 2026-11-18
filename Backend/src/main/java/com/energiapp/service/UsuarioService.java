package com.energiapp.service;

import com.energiapp.dao.UsuarioDAO;
import com.energiapp.dto.UsuarioDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;

@Service
public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    public UsuarioDTO registrarUsuario(UsuarioDTO usuario) throws SQLException {
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre es obligatorio.");
        }
        if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
            throw new IllegalArgumentException("El correo es obligatorio.");
        }
        if (usuario.getContrasena() == null || usuario.getContrasena().trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña es obligatoria.");
        }

        boolean registrado = usuarioDAO.registrarUsuario(usuario);
        if (!registrado) {
            throw new SQLException("No se pudo registrar el usuario en la base de datos.");
        }
        usuario.setContrasena(null); // No devolver la contraseña al frontend
        return usuario;
    }

    public UsuarioDTO login(String correo, String contrasena) throws SQLException {
        if (correo == null || contrasena == null) {
            throw new IllegalArgumentException("Debe ingresar correo y contraseña.");
        }
        return usuarioDAO.loginUsuario(correo, contrasena);
    }
}