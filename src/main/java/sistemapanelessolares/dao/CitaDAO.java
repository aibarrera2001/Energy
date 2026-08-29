package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Cita;
import sistemapanelessolares.dominio.PanelSolar;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class CitaDAO {

    private final CasaDAO casaDAO = new CasaDAO();
    private final PanelSolarDAO panelSolarDAO = new PanelSolarDAO();

    public void guardar(Cita cita) {
        String sql = "INSERT INTO citas (empresa_id, id_usuario, nombre_cliente, id_casa, id_panel, fecha, hora, tipo_servicio, estado, "
                   + "direccion_visita, notas, tecnico_asignado, fecha_creacion) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_cita";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion a la base de datos"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, cita.getEmpresaId() > 0 ? cita.getEmpresaId() : 1);
            ps.setInt(2, 0);
            ps.setString(3, cita.getNombreCliente() != null ? cita.getNombreCliente() : "Cliente");
            if (cita.getCasa() != null) ps.setInt(4, cita.getCasa().getIdCasa()); else ps.setNull(4, Types.INTEGER);
            if (cita.getPanelSolar() != null) ps.setInt(5, cita.getPanelSolar().getId()); else ps.setNull(5, Types.INTEGER);
            ps.setDate(6, Date.valueOf(cita.getFecha()));
            ps.setTime(7, Time.valueOf(cita.getHora()));
            ps.setString(8, cita.getTipoServicio());
            ps.setString(9, cita.getEstado());
            ps.setString(10, cita.getDireccionVisita());
            ps.setString(11, cita.getNotas());
            ps.setString(12, cita.getTecnicoAsignado());
            ps.setTimestamp(13, Timestamp.valueOf(cita.getFechaCreacion()));
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                cita.setIdCita(rs.getInt("id_cita"));
            }
        } catch (Exception e) {
            System.err.println("Error al guardar cita: " + e.getMessage());
        }
    }

    public boolean actualizarEstado(Cita cita) {
        String sql = "UPDATE citas SET fecha=?, hora=?, estado=?, tecnico_asignado=?, motivo_cancelacion=? WHERE id_cita=?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(cita.getFecha()));
            ps.setTime(2, Time.valueOf(cita.getHora()));
            ps.setString(3, cita.getEstado());
            ps.setString(4, cita.getTecnicoAsignado());
            ps.setString(5, cita.getMotivoCancelacion());
            ps.setInt(6, cita.getIdCita());
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error actualizar cita: " + e.getMessage());
            return false;
        }
    }

    public Cita buscarPorId(int idCita) {
        String sql = "SELECT * FROM citas WHERE id_cita = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCita);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscarPorId cita: " + e.getMessage());
        }
        return null;
    }

    public List<Cita> listarPorUsuario(int idUsuario) {
        List<Cita> lista = new ArrayList<>();
        String sql = "SELECT * FROM citas WHERE id_usuario = ? ORDER BY fecha, hora";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar citas por usuario: " + e.getMessage());
        }
        return lista;
    }

    public List<Cita> listarPorFecha(LocalDate fecha) {
        List<Cita> lista = new ArrayList<>();
        String sql = "SELECT * FROM citas WHERE fecha = ? AND estado <> 'CANCELADA' ORDER BY hora";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(fecha));
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar citas por fecha: " + e.getMessage());
        }
        return lista;
    }

    public List<Cita> listarPendientes() {
        List<Cita> lista = new ArrayList<>();
        String sql = "SELECT * FROM citas WHERE estado IN ('PENDIENTE','CONFIRMADA') ORDER BY fecha, hora";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar citas pendientes: " + e.getMessage());
        }
        return lista;
    }

    public List<Cita> listarTodas() {
        List<Cita> lista = new ArrayList<>();
        String sql = "SELECT * FROM citas ORDER BY fecha, hora";
        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar citas: " + e.getMessage());
        }
        return lista;
    }

    public boolean horarioOcupado(LocalDate fecha, LocalTime hora) {
        String sql = "SELECT COUNT(*) FROM citas WHERE fecha = ? AND hora = ? AND estado <> 'CANCELADA'";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDate(1, Date.valueOf(fecha));
            ps.setTime(2, Time.valueOf(hora));
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return rs.getInt(1) > 0;
        } catch (Exception e) {
            System.err.println("Error verificar horario ocupado: " + e.getMessage());
        }
        return false;
    }

    public boolean eliminar(int idCita) {
        String sql = "DELETE FROM citas WHERE id_cita = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCita);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error eliminar cita: " + e.getMessage());
            return false;
        }
    }

    private Cita mapear(ResultSet rs) throws SQLException {
        int idCasaRaw = rs.getInt("id_casa");
        Casa casa = rs.wasNull() ? null : casaDAO.buscarPorId(idCasaRaw);

        int idPanelRaw = rs.getInt("id_panel");
        PanelSolar panel = rs.wasNull() ? null : panelSolarDAO.buscarPorId(idPanelRaw);

        Timestamp ts = rs.getTimestamp("fecha_creacion");
        LocalDateTime fechaCreacion = (ts != null) ? ts.toLocalDateTime() : LocalDateTime.now();

        Cita cita = new Cita(
            rs.getInt("id_cita"),
            rs.getString("nombre_cliente") != null ? rs.getString("nombre_cliente") : "Cliente",
            casa,
            panel,
            rs.getDate("fecha").toLocalDate(),
            rs.getTime("hora").toLocalTime(),
            rs.getString("tipo_servicio"),
            rs.getString("estado"),
            rs.getString("direccion_visita"),
            rs.getString("notas"),
            rs.getString("tecnico_asignado"),
            fechaCreacion
        );
        cita.setEmpresaId(rs.getInt("empresa_id"));
        cita.setMotivoCancelacion(rs.getString("motivo_cancelacion"));
        return cita;
    }
}