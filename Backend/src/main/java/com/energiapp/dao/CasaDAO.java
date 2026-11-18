package com.energiapp.dao;

import com.energiapp.dto.ArticuloCatalogoDTO;
import com.energiapp.dto.CasaDTO;
import com.energiapp.dto.ItemCuestionarioDTO;
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

    // 1. Obtener catálogo para pintar el cuestionario en React
    public List<ArticuloCatalogoDTO> obtenerCatalogoArticulos() throws SQLException {
        List<ArticuloCatalogoDTO> lista = new ArrayList<>();
        String sql = "SELECT id_articulo, nombre, categoria, consumo_kwh_mes FROM catalogo_articulos ORDER BY categoria, nombre";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            while (rs.next()) {
                ArticuloCatalogoDTO art = new ArticuloCatalogoDTO();
                art.setIdArticulo(rs.getInt("id_articulo"));
                art.setNombre(rs.getString("nombre"));
                art.setCategoria(rs.getString("categoria"));
                art.setConsumoKwhMes(rs.getDouble("consumo_kwh_mes"));
                lista.add(art);
            }
        }
        return lista;
    }

    // 2. Guardar casa aplicando la regla de negocio de casa nueva vs consumo conocido
    public boolean guardarCasa(CasaDTO casa) throws SQLException {
        String sqlCasa = "INSERT INTO casas (id_usuario, tipo_propiedad, direccion, ciudad, latitud, longitud, " +
                         "area_terraza_techo_m2, area_balcon_m2, area_disponible_m2, consumo_mensual, " +
                         "imagen_ubicacion_url, modelo_3d_url, es_casa_nueva) " +
                         "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_casa";

        String sqlBuscarKwh = "SELECT consumo_kwh_mes FROM catalogo_articulos WHERE id_articulo = ?";
        String sqlInsertDetalle = "INSERT INTO casa_articulos (id_casa, id_articulo, cantidad, subtotal_kwh_mes) VALUES (?, ?, ?, ?)";
        String sqlActualizarConsumo = "UPDATE casas SET consumo_mensual = ? WHERE id_casa = ?";

        try (Connection connection = dataSource.getConnection()) {
            connection.setAutoCommit(false);
            try {
                boolean requiereCuestionario = casa.isEsCasaNueva() || casa.getConsumoMensual() <= 0;
                double consumoInicial = requiereCuestionario ? 0.0 : casa.getConsumoMensual();

                int idCasaGenerado = 0;
                try (PreparedStatement stmt = connection.prepareStatement(sqlCasa)) {
                    stmt.setInt(1, casa.getIdUsuario());
                    stmt.setString(2, casa.getTipoPropiedad());
                    stmt.setString(3, casa.getDireccion());
                    stmt.setString(4, casa.getCiudad());
                    stmt.setDouble(5, casa.getLatitud());
                    stmt.setDouble(6, casa.getLongitud());

                    if (casa.getAreaTerrazaTechoM2() != null) stmt.setDouble(7, casa.getAreaTerrazaTechoM2()); else stmt.setNull(7, Types.DOUBLE);
                    if (casa.getAreaBalconM2() != null) stmt.setDouble(8, casa.getAreaBalconM2()); else stmt.setNull(8, Types.DOUBLE);
                    if (casa.getAreaDisponibleM2() != null) stmt.setDouble(9, casa.getAreaDisponibleM2()); else stmt.setNull(9, Types.DOUBLE);

                    stmt.setDouble(10, consumoInicial);
                    stmt.setString(11, casa.getImagenUbicacionUrl());
                    stmt.setString(12, casa.getModelo3dUrl());
                    stmt.setBoolean(13, requiereCuestionario);

                    try (ResultSet rs = stmt.executeQuery()) {
                        if (rs.next()) {
                            idCasaGenerado = rs.getInt("id_casa");
                            casa.setIdCasa(idCasaGenerado);
                        }
                    }
                }

                // Si la casa es nueva, calcular sumatoria de artículos y guardar el detalle
                if (requiereCuestionario) {
                    if (casa.getArticulosCuestionario() == null || casa.getArticulosCuestionario().isEmpty()) {
                        throw new SQLException("Una casa nueva sin recibo debe incluir al menos un artículo en el cuestionario.");
                    }

                    double consumoTotalCalculado = 0.0;

                    try (PreparedStatement psBuscar = connection.prepareStatement(sqlBuscarKwh);
                         PreparedStatement psDetalle = connection.prepareStatement(sqlInsertDetalle)) {

                        for (ItemCuestionarioDTO item : casa.getArticulosCuestionario()) {
                            if (item.getCantidad() <= 0) continue;

                            psBuscar.setInt(1, item.getIdArticulo());
                            try (ResultSet rsArt = psBuscar.executeQuery()) {
                                if (!rsArt.next()) {
                                    throw new SQLException("El artículo con ID " + item.getIdArticulo() + " no existe en el catálogo.");
                                }
                                double kwhUnitario = rsArt.getDouble("consumo_kwh_mes");
                                double subtotal = kwhUnitario * item.getCantidad();
                                consumoTotalCalculado += subtotal;

                                psDetalle.setInt(1, idCasaGenerado);
                                psDetalle.setInt(2, item.getIdArticulo());
                                psDetalle.setInt(3, item.getCantidad());
                                psDetalle.setDouble(4, subtotal);
                                psDetalle.addBatch();
                            }
                        }
                        psDetalle.executeBatch();
                    }

                    // Actualizar la casa con la sumatoria final en kWh/mes
                    try (PreparedStatement psUpd = connection.prepareStatement(sqlActualizarConsumo)) {
                        psUpd.setDouble(1, consumoTotalCalculado);
                        psUpd.setInt(2, idCasaGenerado);
                        psUpd.executeUpdate();
                    }
                    casa.setConsumoMensual(consumoTotalCalculado);
                }

                connection.commit();
                return true;
            } catch (Exception e) {
                connection.rollback();
                throw e;
            }
        }
    }

    // 3. Obtener todas las propiedades registradas de un usuario
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
                    casa.setEsCasaNueva(rs.getBoolean("es_casa_nueva"));
                    casas.add(casa);
                }
            }
        }
        return casas;
    }

    // 4. Obtener el detalle completo de una propiedad por su ID
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
                    casa.setEsCasaNueva(rs.getBoolean("es_casa_nueva"));
                    return casa;
                }
            }
        }

        return null;
    }
}