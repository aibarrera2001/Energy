package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Usuario;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {

    public void guardar(Usuario usuario) {
        String sql = "INSERT INTO usuarios (nombre, apellido, telefono, correo, contrasena) "
                   + "VALUES (?, ?, ?, ?, ?) RETURNING id_usuario";
        Connection conn = ConexionDB.conectar();
        if (conn == null) {
            System.err.println("ERROR: No hay conexion a Supabase");
            return;
        }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, usuario.getNombre());
            ps.setString(2, usuario.getApellido());
            ps.setString(3, usuario.getTelefono());
            ps.setString(4, usuario.getCorreo());
            ps.setString(5, usuario.getContrasena());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                usuario.setIdUsuario(rs.getInt("id_usuario"));
                System.out.println("Usuario guardado con ID: " + usuario.getIdUsuario());
            }
        } catch (Exception e) {
            System.err.println("Error al guardar usuario: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public Usuario buscarPorCorreo(String correo) {
        String sql = "SELECT * FROM usuarios WHERE correo = ?";
        Connection conn = ConexionDB.conectar();
        if (conn == null) return null;
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscarPorCorreo: " + e.getMessage());
        }
        return null;
    }

    public Usuario buscarPorId(int id) {
        String sql = "SELECT * FROM usuarios WHERE id_usuario = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscarPorId: " + e.getMessage());
        }
        return null;
    }

    public List<Usuario> listarTodos() {
        List<Usuario> lista = new ArrayList<>();
        String sql = "SELECT * FROM usuarios";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar usuarios: " + e.getMessage());
        }
        return lista;
    }

    public boolean actualizar(Usuario u) {
        String sql = "UPDATE usuarios SET nombre=?, apellido=?, telefono=?, correo=?, contrasena=? WHERE id_usuario=?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, u.getNombre());
            ps.setString(2, u.getApellido());
            ps.setString(3, u.getTelefono());
            ps.setString(4, u.getCorreo());
            ps.setString(5, u.getContrasena());
            ps.setInt(6, u.getIdUsuario());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error actualizar usuario: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int id) {
        String sql = "DELETE FROM usuarios WHERE id_usuario = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error eliminar usuario: " + e.getMessage());
            return false;
        }
    }

    private Usuario mapear(ResultSet rs) throws SQLException {
        return new Usuario(
            rs.getInt("id_usuario"),
            rs.getString("nombre"),
            rs.getString("apellido"),
            rs.getString("telefono"),
            rs.getString("correo"),
            rs.getString("contrasena")
        );
    }
}