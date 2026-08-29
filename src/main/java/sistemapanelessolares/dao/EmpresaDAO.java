package sistemapanelessolares.dao;

import sistemapanelessolares.dominio.Empresa;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class EmpresaDAO {

    public int guardar(Empresa empresa) {
        String sql = "INSERT INTO empresas (nombre, nit, ciudad, direccion, telefono, email, estado, region, descripcion_aportes, diferenciadores, correo_admin, contrasena_admin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id_empresa";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, empresa.getNombre());
            ps.setString(2, empresa.getNit());
            ps.setString(3, empresa.getCiudad());
            ps.setString(4, empresa.getDireccion());
            ps.setString(5, empresa.getTelefono());
            ps.setString(6, empresa.getEmail());
            ps.setString(7, empresa.getEstado());
            ps.setString(8, empresa.getRegion());
            ps.setString(9, empresa.getDescripcionAportes());
            ps.setString(10, empresa.getDiferenciadores());
            ps.setString(11, empresa.getCorreoAdmin());
            ps.setString(12, empresa.getContrasenaAdmin());

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                empresa.setIdEmpresa(rs.getInt("id_empresa"));
                return empresa.getIdEmpresa();
            }
        } catch (Exception e) {
            System.err.println("Error al guardar la empresa: " + e.getMessage());
        }

        return 0;
    }

    public Empresa buscarPorId(int idEmpresa) {
        String sql = "SELECT * FROM empresas WHERE id_empresa = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idEmpresa);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapear(rs);
            }
        } catch (Exception e) {
            System.err.println("Error al buscar empresa: " + e.getMessage());
        }

        return null;
    }

    public List<Empresa> listarTodas() {
        List<Empresa> empresas = new ArrayList<>();
        String sql = "SELECT * FROM empresas ORDER BY nombre";

        try (Connection conn = ConexionDB.conectar();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                empresas.add(mapear(rs));
            }
        } catch (Exception e) {
            System.err.println("Error al listar empresas: " + e.getMessage());
        }

        return empresas;
    }

    public boolean actualizar(Empresa empresa) {
        String sql = "UPDATE empresas SET nombre = ?, nit = ?, ciudad = ?, direccion = ?, telefono = ?, email = ?, estado = ?, region = ?, descripcion_aportes = ?, diferenciadores = ?, correo_admin = ?, contrasena_admin = ? WHERE id_empresa = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, empresa.getNombre());
            ps.setString(2, empresa.getNit());
            ps.setString(3, empresa.getCiudad());
            ps.setString(4, empresa.getDireccion());
            ps.setString(5, empresa.getTelefono());
            ps.setString(6, empresa.getEmail());
            ps.setString(7, empresa.getEstado());
            ps.setString(8, empresa.getRegion());
            ps.setString(9, empresa.getDescripcionAportes());
            ps.setString(10, empresa.getDiferenciadores());
            ps.setString(11, empresa.getCorreoAdmin());
            ps.setString(12, empresa.getContrasenaAdmin());
            ps.setInt(13, empresa.getIdEmpresa());

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al actualizar la empresa: " + e.getMessage());
            return false;
        }
    }

    public boolean eliminar(int idEmpresa) {
        String sql = "DELETE FROM empresas WHERE id_empresa = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idEmpresa);
            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al eliminar la empresa: " + e.getMessage());
            return false;
        }
    }

    // ===== MÉTODOS PARA INVENTARIO DE PANELES =====

    public boolean agregarPanelInventario(int empresaId, String nombrePanel, int cantidad, double precio) {
        String sql = "INSERT INTO inventario_empresa (empresa_id, nombre_panel, cantidad, precio_empresa) VALUES (?, ?, ?, ?) ON CONFLICT (empresa_id, nombre_panel) DO UPDATE SET cantidad = ?, precio_empresa = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, empresaId);
            ps.setString(2, nombrePanel);
            ps.setInt(3, cantidad);
            ps.setDouble(4, precio);
            ps.setInt(5, cantidad);
            ps.setDouble(6, precio);

            return ps.executeUpdate() > 0;
        } catch (Exception e) {
            System.err.println("Error al agregar panel al inventario: " + e.getMessage());
            return false;
        }
    }

    public boolean buscarPorCorreoAdmin(String correoAdmin) {
        String sql = "SELECT COUNT(*) as existe FROM empresas WHERE correo_admin = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correoAdmin);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt("existe") > 0;
            }
        } catch (Exception e) {
            System.err.println("Error al buscar por correo admin: " + e.getMessage());
        }

        return false;
    }

    public Empresa buscarPorCorreoAdminCompleto(String correoAdmin) {
        String sql = "SELECT * FROM empresas WHERE correo_admin = ?";

        try (Connection conn = ConexionDB.conectar();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correoAdmin);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return mapear(rs);
            }
        } catch (Exception e) {
            System.err.println("Error al buscar empresa por correo admin: " + e.getMessage());
        }

        return null;
    }

    private Empresa mapear(ResultSet rs) throws SQLException {
        Empresa empresa = new Empresa(
                rs.getInt("id_empresa"),
                rs.getString("nombre"),
                rs.getString("nit"),
                rs.getString("ciudad"),
                rs.getString("direccion"),
                rs.getString("telefono"),
                rs.getString("email"),
                rs.getString("estado")
        );
        
        // Mapear los nuevos campos
        empresa.setRegion(rs.getString("region"));
        empresa.setDescripcionAportes(rs.getString("descripcion_aportes"));
        empresa.setDiferenciadores(rs.getString("diferenciadores"));
        empresa.setCorreoAdmin(rs.getString("correo_admin"));
        empresa.setContrasenaAdmin(rs.getString("contrasena_admin"));
        
        return empresa;
    }
}
