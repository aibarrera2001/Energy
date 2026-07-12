package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.Cita;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.Usuario;
import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

public class CitaDAO {

    private final UsuarioDAO usuarioDAO = new UsuarioDAO();
    private final CasaDAO casaDAO = new CasaDAO();
    private final PanelSolarDAO panelSolarDAO = new PanelSolarDAO();

    public void guardar(Cita cita) {
        String sql = "INSERT INTO citas (id_usuario, id_casa, id_panel, fecha, hora, tipo_servicio, estado, "
                   + "direccion_visita, notas, tecnico_asignado, fecha_creacion) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_cita";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion a Supabase"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, cita.getUsuario().getIdUsuario());
            if (cita.getCasa() != null) ps.setInt(2, cita.getCasa().getIdCasa()); else ps.setNull(2, Types.INTEGER);
            if (cita.getPanelSolar() != null) ps.setInt(3, cita.getPanelSolar().getId()); else ps.setNull(3, Types.INTEGER);
            ps.setDate(4, Date.valueOf(cita.getFecha()));
            ps.setTime(5, Time.valueOf(cita.getHora()));
            ps.setString(6, cita.getTipoServicio());
            ps.setString(7, cita.getEstado());
            ps.setString(8, cita.getDireccionVisita());
            ps.setString(9, cita.getNotas());
            ps.setString(10, cita.getTecnicoAsignado());
            ps.setTimestamp(11, Timestamp.valueOf(cita.getFechaCreacion()));
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                cita.setIdCita(rs.getInt("id_cita"));
                System.out.println("Cita guardada con ID: " + cita.getIdCita());
            }
        } catch (Exception e) {
            System.err.println("Error al guardar cita: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /** Persiste cambios de fecha/hora/estado/técnico/motivo de cancelación. */
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

    /** Consulta directa a la BD para validar disponibilidad de horario (evita condiciones de carrera con caché en memoria). */
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
        int idUsuario = rs.getInt("id_usuario");
        Usuario usuario = usuarioDAO.buscarPorId(idUsuario);

        int idCasaRaw = rs.getInt("id_casa");
        Casa casa = rs.wasNull() ? null : casaDAO.buscarPorId(idCasaRaw);

        int idPanelRaw = rs.getInt("id_panel");
        PanelSolar panel = rs.wasNull() ? null : panelSolarDAO.buscarPorId(idPanelRaw);

        Timestamp ts = rs.getTimestamp("fecha_creacion");
        LocalDateTime fechaCreacion = (ts != null) ? ts.toLocalDateTime() : LocalDateTime.now();

        Cita cita = new Cita(
            rs.getInt("id_cita"),
            usuario,
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
        cita.setMotivoCancelacion(rs.getString("motivo_cancelacion"));
        return cita;
    }
}