package com.energiapp.dao;

import com.energiapp.dto.CitaDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CitaDAO {

    private final DataSource dataSource;

    public CitaDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean agendarCita(CitaDTO cita) throws SQLException {
        String sql = "INSERT INTO citas (empresa_id, id_usuario, id_casa, tipo_servicio, id_factura, " +
                     "articulo_danado, descripcion_danio, fecha, hora, estado, tecnico_asignado, notas) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, cita.getEmpresaId());
            stmt.setInt(2, cita.getIdUsuario());
            stmt.setInt(3, cita.getIdCasa());
            stmt.setString(4, cita.getTipoServicio());

            if (cita.getIdFactura() != null) stmt.setInt(5, cita.getIdFactura()); else stmt.setNull(5, Types.INTEGER);
            if (cita.getArticuloDanado() != null) stmt.setString(6, cita.getArticuloDanado()); else stmt.setNull(6, Types.VARCHAR);
            if (cita.getDescripcionDanio() != null) stmt.setString(7, cita.getDescripcionDanio()); else stmt.setNull(7, Types.VARCHAR);

            stmt.setDate(8, Date.valueOf(cita.getFecha()));
            stmt.setTime(9, Time.valueOf(cita.getHora()));
            stmt.setString(10, cita.getEstado() != null ? cita.getEstado() : "PENDIENTE");

            if (cita.getTecnicoAsignado() != null) stmt.setString(11, cita.getTecnicoAsignado()); else stmt.setNull(11, Types.VARCHAR);
            if (cita.getNotas() != null) stmt.setString(12, cita.getNotas()); else stmt.setNull(12, Types.VARCHAR);

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        cita.setIdCita(rs.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public List<CitaDTO> obtenerCitasPorUsuario(int idUsuario) throws SQLException {
        List<CitaDTO> lista = new ArrayList<>();
        String sql = "SELECT * FROM citas WHERE id_usuario = ? ORDER BY fecha DESC, hora DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    CitaDTO dto = new CitaDTO();
                    dto.setIdCita(rs.getInt("id_cita"));
                    dto.setEmpresaId(rs.getInt("empresa_id"));
                    dto.setIdUsuario(rs.getInt("id_usuario"));
                    dto.setIdCasa(rs.getInt("id_casa"));
                    dto.setTipoServicio(rs.getString("tipo_servicio"));

                    int idFactura = rs.getInt("id_factura");
                    if (!rs.wasNull()) dto.setIdFactura(idFactura);

                    dto.setArticuloDanado(rs.getString("articulo_danado"));
                    dto.setDescripcionDanio(rs.getString("descripcion_danio"));
                    dto.setFecha(rs.getDate("fecha").toLocalDate());
                    dto.setHora(rs.getTime("hora").toLocalTime());
                    dto.setEstado(rs.getString("estado"));
                    dto.setTecnicoAsignado(rs.getString("tecnico_asignado"));
                    dto.setNotas(rs.getString("notas"));
                    dto.setFechaCreacion(rs.getTimestamp("fecha_creacion").toLocalDateTime());

                    lista.add(dto);
                }
            }
        }
        return lista;
    }
}