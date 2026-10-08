package com.energiapp.dao;

import com.energiapp.dto.PrediccionDTO;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import javax.sql.DataSource;
import org.springframework.stereotype.Repository;

@Repository
public class HistorialPrediccionDAO {

    private final DataSource dataSource;

    public HistorialPrediccionDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean guardarPrediccion(PrediccionDTO p) throws SQLException {
        String sql = "INSERT INTO historial_predicciones " +
                     "(id_usuario, id_casa, empresa_id, id_panel, cantidad_paneles, radiacion_diaria_kwh, " +
                     "generacion_estimada_kwh_mes, ahorro_estimado_cop_mes, co2_evitado_ton_anio) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            stmt.setInt(1, p.getIdUsuario());
            stmt.setInt(2, p.getIdCasa());
            stmt.setInt(3, p.getEmpresaId());
            stmt.setInt(4, p.getIdPanel());
            stmt.setInt(5, p.getCantidadPaneles());
            stmt.setDouble(6, p.getRadiacionDiariaKwh());
            stmt.setDouble(7, p.getGeneracionEstimadaKwhMes());
            stmt.setDouble(8, p.getAhorroEstimadoCopMes());
            stmt.setDouble(9, p.getCo2EvitadoTonAnio());

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        p.setIdPrediccion(rs.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public List<PrediccionDTO> obtenerHistorialPorUsuario(int idUsuario) throws SQLException {
        List<PrediccionDTO> lista = new ArrayList<>();
        String sql = "SELECT * FROM historial_predicciones WHERE id_usuario = ? ORDER BY fecha_calculo DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    PrediccionDTO p = new PrediccionDTO();
                    p.setIdPrediccion(rs.getInt("id_prediccion"));
                    p.setIdUsuario(rs.getInt("id_usuario"));
                    p.setIdCasa(rs.getInt("id_casa"));
                    p.setEmpresaId(rs.getInt("empresa_id"));
                    p.setIdPanel(rs.getInt("id_panel"));
                    p.setCantidadPaneles(rs.getInt("cantidad_paneles"));
                    p.setRadiacionDiariaKwh(rs.getDouble("radiacion_diaria_kwh"));
                    p.setGeneracionEstimadaKwhMes(rs.getDouble("generacion_estimada_kwh_mes"));
                    p.setAhorroEstimadoCopMes(rs.getDouble("ahorro_estimado_cop_mes"));
                    p.setCo2EvitadoTonAnio(rs.getDouble("co2_evitado_ton_anio"));
                    p.setFechaCalculo(rs.getTimestamp("fecha_calculo").toLocalDateTime());
                    lista.add(p);
                }
            }
        }
        return lista;
    }
}