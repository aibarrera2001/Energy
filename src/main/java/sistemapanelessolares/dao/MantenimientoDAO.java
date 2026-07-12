package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Mantenimiento;
import sistemapanelessolares.dominio.Usuario;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MantenimientoDAO {

    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final CasaDAO casaDAO = new CasaDAO();

    public void guardar(Mantenimiento m) {
        String sql = "INSERT INTO mantenimientos (id_usuario, id_casa, tipo_mantenimiento, fecha_programada, "
                   + "fecha_realizada, estado, descripcion_trabajo, tecnico_asignado, costo, observaciones, "
                   + "fecha_proximo_mantenimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_mantenimiento";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion a Supabase"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, m.getUsuario().getIdUsuario());
            ps.setInt(2, m.getCasa().getIdCasa());
            ps.setString(3, m.getTipoMantenimiento());
            ps.setDate(4, Date.valueOf(m.getFechaProgramada()));
            if (m.getFechaRealizada() != null) ps.setDate(5, Date.valueOf(m.getFechaRealizada()));
            else ps.setNull(5, Types.DATE);
            ps.setString(6, m.getEstado());
            ps.setString(7, m.getDescripcionTrabajo());
            ps.setString(8, m.getTecnicoAsignado());
            ps.setDouble(9, m.getCosto());
            ps.setString(10, m.getObservaciones());
            if (m.getFechaProximoMantenimiento() != null) ps.setDate(11, Date.valueOf(m.getFechaProximoMantenimiento()));
            else ps.setNull(11, Types.DATE);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                m.setIdMantenimiento(rs.getInt("id_mantenimiento"));
                System.out.println("Mantenimiento guardado con ID: " + m.getIdMantenimiento());
            }
        } catch (Exception e) {
            System.err.println("Error guardar mantenimiento: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean actualizar(Mantenimiento m) {
        String sql = "UPDATE mantenimientos SET fecha_programada=?, fecha_realizada=?, estado=?, "
                   + "descripcion_trabajo=?, tecnico_asignado=?, costo=?, observaciones=?, fecha_proximo_mantenimiento=? "
                   + "WHERE id_mantenimiento=?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(m.getFechaProgramada()));
            if (m.getFechaRealizada() != null) ps.setDate(2, Date.valueOf(m.getFechaRealizada()));
            else ps.setNull(2, Types.DATE);
            ps.setString(3, m.getEstado());
            ps.setString(4, m.getDescripcionTrabajo());
            ps.setString(5, m.getTecnicoAsignado());
            ps.setDouble(6, m.getCosto());
            ps.setString(7, m.getObservaciones());
            if (m.getFechaProximoMantenimiento() != null) ps.setDate(8, Date.valueOf(m.getFechaProximoMantenimiento()));
            else ps.setNull(8, Types.DATE);
            ps.setInt(9, m.getIdMantenimiento());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error actualizar mantenimiento: " + e.getMessage());
            return false;
        }
    }

    public Mantenimiento buscarPorId(int id) {
        String sql = "SELECT * FROM mantenimientos WHERE id_mantenimiento = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscarPorId mantenimiento: " + e.getMessage());
        }
        return null;
    }

    public List<Mantenimiento> listarPorUsuario(int idUsuario) {
        List<Mantenimiento> lista = new ArrayList<>();
        String sql = "SELECT * FROM mantenimientos WHERE id_usuario = ? ORDER BY fecha_programada";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar mantenimientos por usuario: " + e.getMessage());
        }
        return lista;
    }

    public List<Mantenimiento> listarPorCasa(int idCasa) {
        List<Mantenimiento> lista = new ArrayList<>();
        String sql = "SELECT * FROM mantenimientos WHERE id_casa = ? ORDER BY fecha_programada";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCasa);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar mantenimientos por casa: " + e.getMessage());
        }
        return lista;
    }

    public List<Mantenimiento> listarPendientes() {
        List<Mantenimiento> lista = new ArrayList<>();
        String sql = "SELECT * FROM mantenimientos WHERE estado = 'PROGRAMADO' ORDER BY fecha_programada";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar mantenimientos pendientes: " + e.getMessage());
        }
        return lista;
    }

    public List<Mantenimiento> listarVencidos() {
        List<Mantenimiento> lista = new ArrayList<>();
        String sql = "SELECT * FROM mantenimientos WHERE estado = 'PROGRAMADO' AND fecha_programada < CURRENT_DATE ORDER BY fecha_programada";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar mantenimientos vencidos: " + e.getMessage());
        }
        return lista;
    }

    public boolean eliminar(int id) {
        String sql = "DELETE FROM mantenimientos WHERE id_mantenimiento = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error eliminar mantenimiento: " + e.getMessage());
            return false;
        }
    }

    private Mantenimiento mapear(ResultSet rs) throws SQLException {
        int idUsuario = rs.getInt("id_usuario");
        Usuario usuario = usuarioDAO.buscarPorId(idUsuario);
        int idCasa = rs.getInt("id_casa");
        Casa casa = casaDAO.buscarPorId(idCasa);

        Date fechaRealizada = rs.getDate("fecha_realizada");
        Date fechaProximo = rs.getDate("fecha_proximo_mantenimiento");

        Mantenimiento m = new Mantenimiento(
            rs.getInt("id_mantenimiento"),
            usuario,
            casa,
            rs.getString("tipo_mantenimiento"),
            rs.getDate("fecha_programada").toLocalDate(),
            fechaRealizada != null ? fechaRealizada.toLocalDate() : null,
            rs.getString("estado"),
            rs.getString("descripcion_trabajo"),
            rs.getString("tecnico_asignado"),
            rs.getDouble("costo"),
            rs.getString("observaciones")
        );
        m.setFechaProximoMantenimiento(fechaProximo != null ? fechaProximo.toLocalDate() : null);
        return m;
    }
}