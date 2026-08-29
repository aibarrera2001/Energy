package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Mantenimiento;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MantenimientoDAO {

    private final CasaDAO casaDAO = new CasaDAO();

    public void guardar(Mantenimiento m) {
        String sql = "INSERT INTO mantenimientos (empresa_id, id_usuario, nombre_cliente, id_casa, tipo_mantenimiento, fecha_programada, "
                   + "fecha_realizada, estado, descripcion_trabajo, tecnico_asignado, costo, observaciones, "
                   + "fecha_proximo_mantenimiento) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_mantenimiento";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion a la base de datos"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, m.getEmpresaId() > 0 ? m.getEmpresaId() : 1);
            ps.setInt(2, 0);
            ps.setString(3, m.getNombreCliente() != null ? m.getNombreCliente() : "Cliente");
            ps.setInt(4, m.getCasa() != null ? m.getCasa().getIdCasa() : 0);
            ps.setString(5, m.getTipoMantenimiento());
            ps.setDate(6, Date.valueOf(m.getFechaProgramada()));
            if (m.getFechaRealizada() != null) ps.setDate(7, Date.valueOf(m.getFechaRealizada()));
            else ps.setNull(7, Types.DATE);
            ps.setString(8, m.getEstado());
            ps.setString(9, m.getDescripcionTrabajo());
            ps.setString(10, m.getTecnicoAsignado());
            ps.setDouble(11, m.getCosto());
            ps.setString(12, m.getObservaciones());
            if (m.getFechaProximoMantenimiento() != null) ps.setDate(13, Date.valueOf(m.getFechaProximoMantenimiento()));
            else ps.setNull(13, Types.DATE);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                m.setIdMantenimiento(rs.getInt("id_mantenimiento"));
            }
        } catch (Exception e) {
            System.err.println("Error guardar mantenimiento: " + e.getMessage());
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
        int idCasa = rs.getInt("id_casa");
        Casa casa = casaDAO.buscarPorId(idCasa);

        Date fechaRealizada = rs.getDate("fecha_realizada");
        Date fechaProximo = rs.getDate("fecha_proximo_mantenimiento");

        Mantenimiento m = new Mantenimiento(
            rs.getString("nombre_cliente") != null ? rs.getString("nombre_cliente") : "Cliente",
            casa,
            rs.getString("tipo_mantenimiento"),
            rs.getDate("fecha_programada").toLocalDate(),
            rs.getString("descripcion_trabajo")
        );
        m.setIdMantenimiento(rs.getInt("id_mantenimiento"));
        m.setEmpresaId(rs.getInt("empresa_id"));
        m.setFechaRealizada(fechaRealizada != null ? fechaRealizada.toLocalDate() : null);
        m.setEstado(rs.getString("estado"));
        m.setTecnicoAsignado(rs.getString("tecnico_asignado"));
        m.setCosto(rs.getDouble("costo"));
        m.setObservaciones(rs.getString("observaciones"));
        m.setFechaProximoMantenimiento(fechaProximo != null ? fechaProximo.toLocalDate() : null);
        return m;
    }
}