package com.energiapp.dao;

import com.energiapp.dto.UsuarioDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;

@Repository
public class UsuarioDAO {

    private final DataSource dataSource;

    public UsuarioDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean registrarUsuario(UsuarioDTO usuario) throws SQLException {
        String sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena, ciudad) " +
                     "VALUES (?, ?, ?, ?, ?, ?) RETURNING id_usuario";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getApellido() != null ? usuario.getApellido() : "");
            ps.setString(3, usuario.getCorreo());
            ps.setString(4, usuario.getTelefono() != null ? usuario.getTelefono() : "");
            ps.setString(5, usuario.getContrasena());
            ps.setString(6, usuario.getCiudad() != null ? usuario.getCiudad() : "Valledupar");

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    usuario.setIdUsuario(rs.getInt("id_usuario"));
                    return true;
                }
            }
        }
        return false;
    }

    public UsuarioDTO loginUsuario(String correo, String contrasena) throws SQLException {
        String sql = "SELECT id_usuario, nombre, apellido, correo, telefono, ciudad " +
                     "FROM usuarios WHERE correo = ? AND contrasena = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {

            ps.setString(1, correo);
            ps.setString(2, contrasena);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    UsuarioDTO u = new UsuarioDTO();
                    u.setIdUsuario(rs.getInt("id_usuario"));
                    u.setNombre(rs.getString("nombre"));
                    u.setApellido(rs.getString("apellido"));
                    u.setCorreo(rs.getString("correo"));
                    u.setTelefono(rs.getString("telefono"));
                    u.setCiudad(rs.getString("ciudad"));
                    return u;
                }
            }
        }
        return null;
    }
}