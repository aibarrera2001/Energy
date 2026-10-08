package com.energiapp.dao;

import com.energiapp.dto.FacturaDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class FacturaDAO {

    private final DataSource dataSource;

    public FacturaDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean crearFactura(FacturaDTO factura) throws SQLException {
        String sql = "INSERT INTO facturas (id_usuario, id_casa, empresa_id, precio_paneles, " +
                     "precio_conversores, precio_baterias, precio_cables, costo_instalacion_servicios, " +
                     "monto_total, estado_pago) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            stmt.setInt(1, factura.getIdUsuario());
            stmt.setInt(2, factura.getIdCasa());
            stmt.setInt(3, factura.getEmpresaId());
            stmt.setDouble(4, factura.getPrecioPaneles() != null ? factura.getPrecioPaneles() : 0.0);
            stmt.setDouble(5, factura.getPrecioConversores() != null ? factura.getPrecioConversores() : 0.0);
            stmt.setDouble(6, factura.getPrecioBaterias() != null ? factura.getPrecioBaterias() : 0.0);
            stmt.setDouble(7, factura.getPrecioCables() != null ? factura.getPrecioCables() : 0.0);
            stmt.setDouble(8, factura.getCostoInstalacionServicios() != null ? factura.getCostoInstalacionServicios() : 0.0);
            stmt.setDouble(9, factura.getMontoTotal());
            stmt.setString(10, factura.getEstadoPago() != null ? factura.getEstadoPago() : "PENDIENTE");

            int rows = stmt.executeUpdate();
            if (rows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        factura.setIdFactura(rs.getInt(1));
                    }
                }
                return true;
            }
        }
        return false;
    }

    public List<FacturaDTO> obtenerFacturasPorUsuario(int idUsuario) throws SQLException {
        List<FacturaDTO> lista = new ArrayList<>();
        String sql = "SELECT * FROM facturas WHERE id_usuario = ? ORDER BY fecha_emision DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    FacturaDTO dto = new FacturaDTO();
                    dto.setIdFactura(rs.getInt("id_factura"));
                    dto.setIdUsuario(rs.getInt("id_usuario"));
                    dto.setIdCasa(rs.getInt("id_casa"));
                    dto.setEmpresaId(rs.getInt("empresa_id"));
                    dto.setPrecioPaneles(rs.getDouble("precio_paneles"));
                    dto.setPrecioConversores(rs.getDouble("precio_conversores"));
                    dto.setPrecioBaterias(rs.getDouble("precio_baterias"));
                    dto.setPrecioCables(rs.getDouble("precio_cables"));
                    dto.setCostoInstalacionServicios(rs.getDouble("costo_instalacion_servicios"));
                    dto.setMontoTotal(rs.getDouble("monto_total"));
                    dto.setEstadoPago(rs.getString("estado_pago"));
                    dto.setFechaEmision(rs.getTimestamp("fecha_emision").toLocalDateTime());

                    lista.add(dto);
                }
            }
        }
        return lista;
    }
}