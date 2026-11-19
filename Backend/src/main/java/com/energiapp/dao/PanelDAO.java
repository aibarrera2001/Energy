package com.energiapp.dao;

import com.energiapp.dto.RecomendacionPanelDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Repository
public class PanelDAO {

    private final DataSource dataSource;

    public PanelDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public Map<String, Object> obtenerDatosCasa(int idCasa) throws SQLException {
        String sql = "SELECT id_casa, ciudad, latitud, longitud, consumo_mensual, area_disponible_m2 FROM casas WHERE id_casa = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCasa);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    var casa = new HashMap<String, Object>();
                    casa.put("idCasa", rs.getInt("id_casa"));
                    casa.put("ciudad", rs.getString("ciudad"));
                    casa.put("latitud", rs.getObject("latitud") != null ? rs.getDouble("latitud") : 0.0);
                    casa.put("longitud", rs.getObject("longitud") != null ? rs.getDouble("longitud") : 0.0);
                    casa.put("consumoMensual", rs.getDouble("consumo_mensual"));
                    casa.put("areaDisponible", rs.getDouble("area_disponible_m2"));
                    return casa;
                }
            }
        }
        return null;
    }

    public List<RecomendacionPanelDTO> listarCatalogoPaneles() throws SQLException {
        String sql = "SELECT id, nombre, tipo, potencia_w, eficiencia, precio, costo_instalacion, garantia_anios, descripcion " +
                     "FROM paneles_solares ORDER BY potencia_w DESC";
        var lista = new ArrayList<RecomendacionPanelDTO>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) {
                RecomendacionPanelDTO p = new RecomendacionPanelDTO();
                p.setIdPanel(rs.getInt("id"));
                p.setNombrePanel(rs.getString("nombre"));
                p.setTipo(rs.getString("tipo"));
                p.setPotenciaW(rs.getDouble("potencia_w"));
                p.setEficiencia(rs.getDouble("eficiencia"));
                // Guardamos temporalmente el precio unitario y el costo de instalación
                p.setInversionEstimada(rs.getDouble("precio"));
                p.setPotenciaTotalKw(rs.getDouble("costo_instalacion"));
                p.setGarantiaAnios(rs.getString("garantia_anios"));
                p.setDescripcion(rs.getString("descripcion"));
                lista.add(p);
            }
        }
        return lista;
    }
}