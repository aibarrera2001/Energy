package com.energiapp.dao;

import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;
import java.util.Map;

@Repository
public class UsuarioDAO {

    private final DataSource dataSource;

    public UsuarioDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Map<String, Object> validarLogin(String email, String password) throws Exception {
        String sql = "SELECT id_usuario, nombre, apellido, correo FROM usuarios WHERE TRIM(correo) = TRIM(?) AND contrasena = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, email);
            stmt.setString(2, password);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    Map<String, Object> usuario = new HashMap<>();
                    usuario.put("id", rs.getObject("id_usuario"));
                    usuario.put("nombre", rs.getString("nombre") + " " + rs.getString("apellido"));
                    usuario.put("email", rs.getString("correo"));
                    return usuario;
                }
            }
        }
        return null;
    }
}