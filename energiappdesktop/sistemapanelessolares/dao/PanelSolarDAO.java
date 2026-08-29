package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.PanelSolar;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class PanelSolarDAO {

    public List<PanelSolar> listarTodos() {
        return listarTodos(1);
    }

    public List<PanelSolar> listarTodos(int empresaId) {
        List<PanelSolar> lista = new ArrayList<>();
        String sql = "SELECT * FROM paneles_solares";
        if (empresaId > 0 && existeColumna("paneles_solares", "empresa_id")) {
            sql += " WHERE empresa_id = ?";
        }
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            if (empresaId > 0 && existeColumna("paneles_solares", "empresa_id")) {
                ps.setInt(1, empresaId);
            }
            ResultSet rs = ps.executeQuery();
            while (rs.next()) lista.add(mapear(rs));
        } catch (Exception e) {
            System.err.println("Error listar paneles: " + e.getMessage());
        }
        return lista;
    }

    public PanelSolar buscarPorId(int id) {
        String sql = "SELECT * FROM paneles_solares WHERE id = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapear(rs);
        } catch (Exception e) {
            System.err.println("Error buscar panel: " + e.getMessage());
        }
        return null;
    }

    public void guardar(PanelSolar panel) {
        String sql = "INSERT INTO paneles_solares (empresa_id, nombre, tipo, potencia_w, eficiencia, costo_unidad, costo_instalacion, garantia_anios, descripcion) "
                   + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        Connection conn = ConexionDB.conectar();
        if (conn == null) {
            System.err.println("ERROR: No hay conexion a Supabase");
            return;
        }
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, panel.getEmpresaId() > 0 ? panel.getEmpresaId() : 1);
            ps.setString(2, panel.getNombre());
            ps.setString(3, panel.getTipo());
            ps.setDouble(4, panel.getPotenciaWatts());
            ps.setDouble(5, panel.getEficiencia());
            ps.setDouble(6, panel.getCostoUnidad());
            ps.setDouble(7, panel.getCostoInstalacion());
            ps.setString(8, panel.getGarantiaAnios());
            ps.setString(9, panel.getDescripcion());
            ps.executeUpdate();
            System.out.println("Panel guardado correctamente.");
        } catch (Exception e) {
            System.err.println("Error guardar panel: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public boolean eliminar(int id) {
        String sql = "DELETE FROM paneles_solares WHERE id = ?";
        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error eliminar panel: " + e.getMessage());
            return false;
        }
    }

    private PanelSolar mapear(ResultSet rs) throws SQLException {
        PanelSolar panel = new PanelSolar(
            rs.getInt("id"),
            rs.getString("nombre"),
            rs.getString("tipo"),
            rs.getDouble("potencia_w"),
            rs.getDouble("eficiencia"),
            rs.getDouble("costo_unidad"),
            rs.getDouble("costo_instalacion"),
            rs.getString("garantia_anios"),
            rs.getString("descripcion")
        );
        if (existeColumna(rs, "empresa_id")) {
            panel.setEmpresaId(rs.getInt("empresa_id"));
        }
        return panel;
    }

    private boolean existeColumna(String tabla, String columna) {
        try (Connection conn = ConexionDB.conectar();
             ResultSet rs = conn.getMetaData().getColumns(null, null, tabla, columna)) {
            return rs.next();
        } catch (Exception e) {
            return false;
        }
    }

    private boolean existeColumna(ResultSet rs, String columna) {
        try {
            for (int i = 1; i <= rs.getMetaData().getColumnCount(); i++) {
                if (rs.getMetaData().getColumnName(i).equalsIgnoreCase(columna)) {
                    return true;
                }
            }
        } catch (SQLException ignored) {
            // Ignorado.
        }
        return false;
    }
}