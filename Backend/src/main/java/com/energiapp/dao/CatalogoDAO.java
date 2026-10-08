package com.energiapp.dao;

import com.energiapp.dto.PanelDTO;
import org.springframework.stereotype.Repository;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@Repository
public class CatalogoDAO {

    private final DataSource dataSource;

    public CatalogoDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 1. Obtener panel por ID
    public PanelDTO obtenerPanelPorId(int idPanel) throws SQLException {
        String sql = "SELECT potencia_w, precio, costo_instalacion FROM paneles_solares WHERE id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanel);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return new PanelDTO(
                        rs.getDouble("potencia_w"),
                        rs.getDouble("precio"),
                        rs.getDouble("costo_instalacion")
                    );
                }
            }
        }
        throw new SQLException("No se encontró el panel con ID: " + idPanel);
    }

    // 2. Buscar conversor que soporte la potencia requerida (Watts)
    public double obtenerPrecioConversorAdecuado(double potenciaRequeridaW) throws SQLException {
        String sql = "SELECT precio FROM conversores WHERE capacidad_conversion >= ? ORDER BY capacidad_conversion ASC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, potenciaRequeridaW);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("precio");
                }
            }
        }
        // Si no hay un conversor tan grande, toma el de mayor capacidad disponible
        String sqlMax = "SELECT precio FROM conversores ORDER BY capacidad_conversion DESC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlMax);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getDouble("precio");
        }
        return 0.0;
    }

    // 3. Buscar batería por capacidad necesaria (kWh o Ah)
    public double obtenerPrecioBateriaAdecuada(double capacidadRequeridaKwh) throws SQLException {
        String sql = "SELECT precio, capacidad_carga FROM baterias WHERE capacidad_carga > 0 ORDER BY capacidad_carga DESC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                double precioUnidad = rs.getDouble("precio");
                double capacidadUnidad = rs.getDouble("capacidad_carga");
                int cantidadBaterias = (int) Math.ceil(capacidadRequeridaKwh / capacidadUnidad);
                return precioUnidad * cantidadBaterias;
            }
        }
        return 0.0;
    }

    // 4. Buscar cable según los Amperios requeridos
    public double obtenerPrecioMetroCableAdecuado(double amperiosRequeridos) throws SQLException {
        String sql = "SELECT precio FROM cables WHERE capacidad_transporte_energia >= ? ORDER BY capacidad_transporte_energia ASC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setDouble(1, amperiosRequeridos);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getDouble("precio");
                }
            }
        }
        // Fallback al cable con mayor capacidad
        String sqlMax = "SELECT precio FROM cables ORDER BY capacidad_transporte_energia DESC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sqlMax);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) return rs.getDouble("precio");
        }
        return 0.0;
    }
}