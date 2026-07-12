package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Apartamento;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.CasaUnifamiliar;
import sistemapanelessolares.dominio.Edificio;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * DAO de la tabla "casas". Usa la columna "tipo_propiedad" como discriminador
 * para reconstruir el subtipo correcto (CasaUnifamiliar, Apartamento, Edificio
 * o la Casa genérica original) al leer desde la base de datos.
 */
public class CasaDAO {

    // ----------------------------------------------------------------
    //  Guardar (una variante por tipo de propiedad)
    // ----------------------------------------------------------------

    /** Mantiene compatibilidad con el código existente: guarda una Casa genérica. */
    public void guardar(Casa casa, int idUsuario) {
        String sql = "INSERT INTO casas (direccion, ciudad, consumo_mensual, latitud, longitud, id_usuario, tipo_propiedad) "
                   + "VALUES (?, ?, ?, ?, ?, ?, 'CASA') RETURNING id_casa";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, casa.getDireccion());
            ps.setString(2, casa.getCiudad());
            ps.setDouble(3, casa.getConsumoMensualKWh());
            ps.setDouble(4, casa.getLatitud());
            ps.setDouble(5, casa.getLongitud());
            ps.setInt(6, idUsuario);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                casa.setIdCasa(rs.getInt("id_casa"));
                System.out.println("Casa guardada con ID: " + casa.getIdCasa());
            }
        } catch (Exception e) {
            System.err.println("Error guardar casa: " + e.getMessage());
        }
    }

    public void guardarCasaUnifamiliar(CasaUnifamiliar casa, int idUsuario) {
        String sql = "INSERT INTO casas (direccion, ciudad, consumo_mensual, latitud, longitud, id_usuario, "
                   + "tipo_propiedad, numero_pisos, area_techo_m2, tipo_techo, orientacion_techo, "
                   + "pendiente_techo_grados, imagen_ubicacion_url, modelo_3d_url) "
                   + "VALUES (?, ?, ?, ?, ?, ?, 'CASA_UNIFAMILIAR', ?, ?, ?, ?, ?, ?, ?) RETURNING id_casa";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, casa.getDireccion());
            ps.setString(2, casa.getCiudad());
            ps.setDouble(3, casa.getConsumoMensualKWh());
            ps.setDouble(4, casa.getLatitud());
            ps.setDouble(5, casa.getLongitud());
            ps.setInt(6, idUsuario);
            ps.setInt(7, casa.getNumeroPisos());
            ps.setDouble(8, casa.getAreaTechoM2());
            ps.setString(9, casa.getTipoTecho());
            ps.setString(10, casa.getOrientacionTecho());
            ps.setDouble(11, casa.getPendienteTechoGrados());
            ps.setString(12, casa.getImagenTechoUrl());
            ps.setString(13, casa.getModelo3DUrl());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                casa.setIdCasa(rs.getInt("id_casa"));
                System.out.println("Casa unifamiliar guardada con ID: " + casa.getIdCasa());
            }
        } catch (Exception e) {
            System.err.println("Error guardar casa unifamiliar: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void guardarApartamento(Apartamento apto, int idUsuario) {
        String sql = "INSERT INTO casas (direccion, ciudad, consumo_mensual, latitud, longitud, id_usuario, "
                   + "tipo_propiedad, piso, nombre_edificio, tiene_balcon_terraza, area_balcon_m2, "
                   + "orientacion_balcon, area_azotea_asignada_m2, imagen_ubicacion_url, modelo_3d_url) "
                   + "VALUES (?, ?, ?, ?, ?, ?, 'APARTAMENTO', ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_casa";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, apto.getDireccion());
            ps.setString(2, apto.getCiudad());
            ps.setDouble(3, apto.getConsumoMensualKWh());
            ps.setDouble(4, apto.getLatitud());
            ps.setDouble(5, apto.getLongitud());
            ps.setInt(6, idUsuario);
            ps.setInt(7, apto.getPiso());
            ps.setString(8, apto.getNombreEdificio());
            ps.setBoolean(9, apto.isTieneBalconTerraza());
            ps.setDouble(10, apto.getAreaBalconM2());
            ps.setString(11, apto.getOrientacionBalcon());
            ps.setDouble(12, apto.getAreaAzoteaAsignadaM2());
            ps.setString(13, apto.getImagenBalconUrl());
            ps.setString(14, apto.getModelo3DUrl());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                apto.setIdCasa(rs.getInt("id_casa"));
                System.out.println("Apartamento guardado con ID: " + apto.getIdCasa());
            }
        } catch (Exception e) {
            System.err.println("Error guardar apartamento: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public void guardarEdificio(Edificio edificio, int idUsuario) {
        String sql = "INSERT INTO casas (direccion, ciudad, consumo_mensual, latitud, longitud, id_usuario, "
                   + "tipo_propiedad, numero_pisos, numero_apartamentos, area_azotea_total_m2, "
                   + "azotea_disponible_paneles, administrador_nombre, administrador_telefono, "
                   + "imagen_ubicacion_url, modelo_3d_url) "
                   + "VALUES (?, ?, ?, ?, ?, ?, 'EDIFICIO', ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_casa";
        Connection conn = ConexionDB.conectar();
        if (conn == null) { System.err.println("ERROR: Sin conexion"); return; }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, edificio.getDireccion());
            ps.setString(2, edificio.getCiudad());
            ps.setDouble(3, edificio.getConsumoMensualKWh());
            ps.setDouble(4, edificio.getLatitud());
            ps.setDouble(5, edificio.getLongitud());
            ps.setInt(6, idUsuario);
            ps.setInt(7, edificio.getNumeroPisos());
            ps.setInt(8, edificio.getNumeroApartamentos());
            ps.setDouble(9, edificio.getAreaAzoteaTotalM2());
            ps.setBoolean(10, edificio.isAzoteaDisponibleParaPaneles());
            ps.setString(11, edificio.getAdministradorNombre());
            ps.setString(12, edificio.getAdministradorTelefono());
            ps.setString(13, edificio.getImagenAzoteaUrl());
            ps.setString(14, edificio.getModelo3DUrl());
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                edificio.setIdCasa(rs.getInt("id_casa"));
                System.out.println("Edificio guardado con ID: " + edificio.getIdCasa());
            }
        } catch (Exception e) {
            System.err.println("Error guardar edificio: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /** Actualiza únicamente la imagen digital y/o el modelo 3D de una propiedad ya guardada. */
    public boolean actualizarImagenModelo3D(int idCasa, String imagenUrl, String modelo3DUrl) {
        String sql = "UPDATE casas SET imagen_ubicacion_url = ?, modelo_3d_url = ? WHERE id_casa = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, imagenUrl);
            ps.setString(2, modelo3DUrl);
            ps.setInt(3, idCasa);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error actualizar imagen/modelo3D de la casa: " + e.getMessage());
            return false;
        }
    }

    // ----------------------------------------------------------------
    //  Consultas
    // ----------------------------------------------------------------

    public Casa buscarPorId(int idCasa) {
        String sql = "SELECT * FROM casas WHERE id_casa = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCasa);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscarPorId casa: " + e.getMessage());
        }
        return null;
    }

    public List<Casa> listarPorUsuario(int idUsuario) {
        List<Casa> lista = new ArrayList<>();
        String sql = "SELECT * FROM casas WHERE id_usuario = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idUsuario);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar casas: " + e.getMessage());
        }
        return lista;
    }

    public boolean eliminar(int idCasa) {
        String sql = "DELETE FROM casas WHERE id_casa = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idCasa);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error eliminar casa: " + e.getMessage());
            return false;
        }
    }

    // ----------------------------------------------------------------
    //  Mapeo polimórfico (según tipo_propiedad)
    // ----------------------------------------------------------------

    private Casa mapear(ResultSet rs) throws SQLException {
        String tipo = rs.getString("tipo_propiedad");
        if (tipo == null) tipo = "CASA";

        switch (tipo) {
            case "CASA_UNIFAMILIAR": return mapearCasaUnifamiliar(rs);
            case "APARTAMENTO":      return mapearApartamento(rs);
            case "EDIFICIO":         return mapearEdificio(rs);
            default:                 return mapearCasaGenerica(rs);
        }
    }

    private Casa mapearCasaGenerica(ResultSet rs) throws SQLException {
        return new Casa(
            rs.getInt("id_casa"),
            rs.getString("direccion"),
            rs.getString("ciudad"),
            rs.getDouble("consumo_mensual"),
            rs.getDouble("latitud"),
            rs.getDouble("longitud")
        );
    }

    private CasaUnifamiliar mapearCasaUnifamiliar(ResultSet rs) throws SQLException {
        CasaUnifamiliar c = new CasaUnifamiliar(
            rs.getInt("id_casa"),
            rs.getString("direccion"),
            rs.getString("ciudad"),
            rs.getDouble("consumo_mensual"),
            rs.getDouble("latitud"),
            rs.getDouble("longitud"),
            rs.getInt("numero_pisos"),
            rs.getDouble("area_techo_m2"),
            rs.getString("tipo_techo"),
            rs.getString("orientacion_techo"),
            rs.getDouble("pendiente_techo_grados")
        );
        c.setImagenTechoUrl(rs.getString("imagen_ubicacion_url"));
        c.setModelo3DUrl(rs.getString("modelo_3d_url"));
        return c;
    }

    private Apartamento mapearApartamento(ResultSet rs) throws SQLException {
        Apartamento a = new Apartamento(
            rs.getInt("id_casa"),
            rs.getString("direccion"),
            rs.getString("ciudad"),
            rs.getDouble("consumo_mensual"),
            rs.getDouble("latitud"),
            rs.getDouble("longitud"),
            rs.getInt("piso"),
            rs.getString("nombre_edificio"),
            rs.getBoolean("tiene_balcon_terraza"),
            rs.getDouble("area_balcon_m2"),
            rs.getString("orientacion_balcon")
        );
        a.setAreaAzoteaAsignadaM2(rs.getDouble("area_azotea_asignada_m2"));
        a.setImagenBalconUrl(rs.getString("imagen_ubicacion_url"));
        a.setModelo3DUrl(rs.getString("modelo_3d_url"));
        return a;
    }

    private Edificio mapearEdificio(ResultSet rs) throws SQLException {
        Edificio e = new Edificio(
            rs.getInt("id_casa"),
            rs.getString("direccion"),
            rs.getString("ciudad"),
            rs.getDouble("consumo_mensual"),
            rs.getDouble("latitud"),
            rs.getDouble("longitud"),
            rs.getInt("numero_pisos"),
            rs.getInt("numero_apartamentos"),
            rs.getDouble("area_azotea_total_m2"),
            rs.getBoolean("azotea_disponible_paneles")
        );
        e.setAdministradorNombre(rs.getString("administrador_nombre"));
        e.setAdministradorTelefono(rs.getString("administrador_telefono"));
        e.setImagenAzoteaUrl(rs.getString("imagen_ubicacion_url"));
        e.setModelo3DUrl(rs.getString("modelo_3d_url"));
        return e;
    }
}