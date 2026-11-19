package com.energiapp.dao;

import com.energiapp.dto.UsuarioDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@Repository
public class UsuarioDAO {

    private final DataSource dataSource;

    public UsuarioDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean registrarUsuario(UsuarioDTO usuario) throws SQLException {
        String[] partes = usuario.getNombre() != null ? usuario.getNombre().trim().split("\\s+", 2) : new String[]{""};
        String primerNombre = partes[0];
        String apellido = partes.length > 1 ? partes[1] : "-";

        String sql = "INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, primerNombre);
            ps.setString(2, apellido);
            ps.setString(3, usuario.getCorreo());
            ps.setString(4, usuario.getContrasena());
            ps.setString(5, usuario.getRol() != null ? usuario.getRol() : "USER");
            return ps.executeUpdate() > 0;
        }
    }

    public boolean registrarUsuario(String nombre, String apellido, String correo, String telefono, String ciudad, String contrasena, String rol) throws SQLException {
        String sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena, ciudad, rol) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, nombre);
            ps.setString(2, apellido);
            ps.setString(3, correo);
            ps.setString(4, telefono);
            ps.setString(5, contrasena);
            ps.setString(6, ciudad);
            ps.setString(7, rol != null ? rol : "USER");
            return ps.executeUpdate() > 0;
        }
    }

    public UsuarioDTO loginUsuario(String correo, String contrasena) throws SQLException {
        String sql = "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = ? AND contrasena = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ps.setString(2, contrasena);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    UsuarioDTO dto = new UsuarioDTO();
                    dto.setIdUsuario(rs.getInt("id_usuario"));
                    dto.setNombre(rs.getString("nombre"));
                    dto.setCorreo(rs.getString("correo"));
                    dto.setRol(rs.getString("rol"));
                    return dto;
                }
            }
        }
        return null;
    }

    public Map<String, Object> validarLogin(String email, String password) throws SQLException {
        String sql = "SELECT id_usuario, nombre, correo, rol FROM usuarios WHERE correo = ? AND contrasena = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            ps.setString(2, password);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> user = new HashMap<>();
                    user.put("idUsuario", rs.getInt("id_usuario"));
                    user.put("usuarioId", rs.getInt("id_usuario"));
                    user.put("nombre", rs.getString("nombre"));
                    user.put("nombreUsuario", rs.getString("nombre"));
                    user.put("correo", rs.getString("correo"));
                    user.put("rol", rs.getString("rol"));
                    return user;
                }
            }
        }
        return null;
    }
}