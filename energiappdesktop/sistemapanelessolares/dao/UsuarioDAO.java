package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Usuario;

import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    /**
     * Guarda un nuevo usuario en la base de datos
     */
    public int guardar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nombre, apellido, correo, telefono, contrasena, ciudad, estado) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id_usuario";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getApellido());
            ps.setString(3, usuario.getCorreo());
            ps.setString(4, usuario.getTelefono());
            ps.setString(5, usuario.getContrasena());
            ps.setString(6, usuario.getCiudad());
            ps.setString(7, usuario.getEstado());

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                usuario.setIdUsuario(rs.getInt("id_usuario"));
                return usuario.getIdUsuario();
            }
        } catch (Exception e) {
            System.err.println("Error al guardar el usuario: " + e.getMessage());
        }

        return 0;
    }

    /**
     * Busca un usuario por su ID
     */
    public Usuario buscarPorId(int idUsuario) {
        String sql = "SELECT * FROM usuarios WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapear(rs);
            }
        } catch (Exception e) {
            System.err.println("Error al buscar usuario: " + e.getMessage());
        }

        return null;
    }

    /**
     * Busca un usuario por su correo
     */
    public Usuario buscarPorCorreo(String correo) {
        String sql = "SELECT * FROM usuarios WHERE correo = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapear(rs);
            }
        } catch (Exception e) {
            System.err.println("Error al buscar usuario por correo: " + e.getMessage());
        }

        return null;
    }

    /**
     * Verifica si un correo ya existe
     */
    public boolean existeCorreo(String correo) {
        String sql = "SELECT COUNT(*) as existe FROM usuarios WHERE correo = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("existe") > 0;
            }
        } catch (Exception e) {
            System.err.println("Error al verificar correo: " + e.getMessage());
        }

        return false;
    }

    /**
     * Lista todos los usuarios
     */
    public List<Usuario> listarTodos() {
        List<Usuario> usuarios = new ArrayList<>();
        String sql = "SELECT * FROM usuarios ORDER BY nombre";

        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                usuarios.add(mapear(rs));
            }
        } catch (Exception e) {
            System.err.println("Error al listar usuarios: " + e.getMessage());
        }

        return usuarios;
    }

    /**
     * Actualiza los datos de un usuario
     */
    public boolean actualizar(Usuario usuario) {
        String sql = "UPDATE usuarios SET nombre = ?, apellido = ?, telefono = ?, ciudad = ?, estado = ? WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getApellido());
            ps.setString(3, usuario.getTelefono());
            ps.setString(4, usuario.getCiudad());
            ps.setString(5, usuario.getEstado());
            ps.setInt(6, usuario.getIdUsuario());

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            return false;
        }
    }

    /**
     * Actualiza la contraseña de un usuario
     */
    public boolean actualizarContrasena(int idUsuario, String nuevaContrasena) {
        String sql = "UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, nuevaContrasena);
            ps.setInt(2, idUsuario);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al actualizar contraseña: " + e.getMessage());
            return false;
        }
    }

    /**
     * Actualiza el último login del usuario
     */
    public boolean actualizarUltimoLogin(int idUsuario) {
        String sql = "UPDATE usuarios SET ultimo_login = NOW() WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al actualizar último login: " + e.getMessage());
            return false;
        }
    }

    /**
     * Desactiva un usuario
     */
    public boolean desactivar(int idUsuario) {
        String sql = "UPDATE usuarios SET estado = 'INACTIVO' WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al desactivar usuario: " + e.getMessage());
            return false;
        }
    }

    /**
     * Elimina un usuario
     */
    public boolean eliminar(int idUsuario) {
        String sql = "DELETE FROM usuarios WHERE id_usuario = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al eliminar usuario: " + e.getMessage());
            return false;
        }
    }

    /**
     * Mapea un ResultSet a un objeto Usuario
     */
    private Usuario mapear(ResultSet rs) throws SQLException {
        Usuario usuario = new Usuario(
                rs.getInt("id_usuario"),
                rs.getString("nombre"),
                rs.getString("apellido"),
                rs.getString("correo"),
                rs.getString("telefono"),
                rs.getString("contrasena"),
                rs.getString("ciudad"),
                rs.getString("estado")
        );

        // Mapear timestamps
        Timestamp fechaReg = rs.getTimestamp("fecha_registro");
        if (fechaReg != null) {
            usuario.setFechaRegistro(fechaReg.toLocalDateTime());
        }

        Timestamp ultimoLog = rs.getTimestamp("ultimo_login");
        if (ultimoLog != null) {
            usuario.setUltimoLogin(ultimoLog.toLocalDateTime());
        }

        return usuario;
    }
}
