package com.energiapp.dao;

import com.energiapp.dto.CasaDTO;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class CasaDAO {

    private final DataSource dataSource;

    public CasaDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public boolean guardarCasa(CasaDTO casa) throws SQLException {
        String sql = "INSERT INTO casas (id_usuario, tipo_propiedad, direccion, ciudad, latitud, longitud, " +
                     "area_terraza_techo_m2, area_balcon_m2, area_disponible_m2, consumo_mensual, " +
                     "imagen_ubicacion_url, modelo_3d_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            
            stmt.setInt(1, casa.getIdUsuario());
            stmt.setString(2, casa.getTipoPropiedad());
            stmt.setString(3, casa.getDireccion());
            stmt.setString(4, casa.getCiudad());
            stmt.setDouble(5, casa.getLatitud());
            stmt.setDouble(6, casa.getLongitud());

            if (casa.getAreaTerrazaTechoM2() != null) stmt.setDouble(7, casa.getAreaTerrazaTechoM2()); else stmt.setNull(7, Types.DOUBLE);
            if (casa.getAreaBalconM2() != null) stmt.setDouble(8, casa.getAreaBalconM2()); else stmt.setNull(8, Types.DOUBLE);
            if (casa.getAreaDisponibleM2() != null) stmt.setDouble(9, casa.getAreaDisponibleM2()); else stmt.setNull(9, Types.DOUBLE);

            stmt.setDouble(10, casa.getConsumoMensual());
            stmt.setString(11, casa.getImagenUbicacionUrl());
            stmt.setString(12, casa.getModelo3dUrl());

            int affectedRows = stmt.executeUpdate();
            if (affectedRows > 0) {
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) casa.setIdCasa(rs.getInt(1));
                }
                return true;
            }
        }
        return false;
    }

    public List<CasaDTO> obtenerCasasPorUsuario(int idUsuario) throws SQLException {
        List<CasaDTO> casas = new ArrayList<>();
        String sql = "SELECT * FROM casas WHERE id_usuario = ? ORDER BY id_casa DESC";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    CasaDTO casa = new CasaDTO();
                    casa.setIdCasa(rs.getInt("id_casa"));
                    casa.setIdUsuario(rs.getInt("id_usuario"));
                    casa.setTipoPropiedad(rs.getString("tipo_propiedad"));
                    casa.setDireccion(rs.getString("direccion"));
                    casa.setCiudad(rs.getString("ciudad"));
                    casa.setLatitud(rs.getDouble("latitud"));
                    casa.setLongitud(rs.getDouble("longitud"));
                    casa.setConsumoMensual(rs.getDouble("consumo_mensual"));
                    casas.add(casa);
                }
            }
        }
        return casas;
    }

    public CasaDTO obtenerCasaPorId(int idCasa) throws SQLException {
        String sql = "SELECT * FROM casas WHERE id_casa = ?";

        try (Connection connection = dataSource.getConnection();
             PreparedStatement stmt = connection.prepareStatement(sql)) {
            stmt.setInt(1, idCasa);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    CasaDTO casa = new CasaDTO();
                    casa.setIdCasa(rs.getInt("id_casa"));
                    casa.setIdUsuario(rs.getInt("id_usuario"));
                    casa.setTipoPropiedad(rs.getString("tipo_propiedad"));
                    casa.setDireccion(rs.getString("direccion"));
                    casa.setCiudad(rs.getString("ciudad"));
                    casa.setLatitud(rs.getDouble("latitud"));
                    casa.setLongitud(rs.getDouble("longitud"));
                    casa.setAreaTerrazaTechoM2(rs.getDouble("area_terraza_techo_m2"));
                    casa.setAreaBalconM2(rs.getDouble("area_balcon_m2"));
                    casa.setAreaDisponibleM2(rs.getDouble("area_disponible_m2"));
                    casa.setConsumoMensual(rs.getDouble("consumo_mensual"));
                    casa.setImagenUbicacionUrl(rs.getString("imagen_ubicacion_url"));
                    casa.setModelo3dUrl(rs.getString("modelo_3d_url"));
                    return casa;
                }
            }
        }

        return null;
    }
}