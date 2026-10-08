package com.energiapp.dao;

import com.energiapp.dto.*;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class AdministradorDAO {

    private final DataSource dataSource;

    public AdministradorDAO(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    // 1. Registro dual: Crea Empresa y luego el Administrador vinculado
    public boolean registrarEmpresaYAdmin(RegistroEmpresaAdminDTO dto) throws SQLException {
        String sqlEmpresa = "INSERT INTO empresas (nombre, nit, ciudad, direccion, telefono, email) VALUES (?, ?, ?, ?, ?, ?) RETURNING id_empresa";
        String sqlAdmin = "INSERT INTO administrativos (empresa_id, nombre, apellido, telefono, correo, contrasena) VALUES (?, ?, ?, ?, ?, ?)";

        try (Connection conn = dataSource.getConnection()) {
            conn.setAutoCommit(false);
            try {
                int idEmpresa = 0;
                try (PreparedStatement psE = conn.prepareStatement(sqlEmpresa)) {
                    psE.setString(1, dto.getNombreEmpresa());
                    psE.setString(2, dto.getNit());
                    psE.setString(3, dto.getCiudadEmpresa());
                    psE.setString(4, dto.getDireccionEmpresa());
                    psE.setString(5, dto.getTelefonoEmpresa());
                    psE.setString(6, dto.getEmailEmpresa());
                    try (ResultSet rs = psE.executeQuery()) {
                        if (rs.next()) idEmpresa = rs.getInt("id_empresa");
                    }
                }

                try (PreparedStatement psA = conn.prepareStatement(sqlAdmin)) {
                    psA.setInt(1, idEmpresa);
                    psA.setString(2, dto.getNombreAdmin());
                    psA.setString(3, dto.getApellidoAdmin());
                    psA.setString(4, dto.getTelefonoAdmin());
                    psA.setString(5, dto.getCorreoAdmin());
                    psA.setString(6, dto.getContrasenaAdmin());
                    psA.executeUpdate();
                }

                conn.commit();
                return true;
            } catch (Exception e) {
                conn.rollback();
                throw e;
            }
        }
    }

    // 2. Login traendo datos del Admin y su Empresa
    public AdminAuthResponseDTO loginAdmin(String correo, String contrasena) throws SQLException {
        String sql = "SELECT a.id, a.nombre as admin_nombre, a.correo, a.rol, " +
                     "e.id_empresa, e.nombre as empresa_nombre, e.nit, e.ciudad, e.direccion, e.telefono, e.email " +
                     "FROM administrativos a " +
                     "JOIN empresas e ON a.empresa_id = e.id_empresa " +
                     "WHERE a.correo = ? AND a.contrasena = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, correo);
            ps.setString(2, contrasena);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    AdminAuthResponseDTO dto = new AdminAuthResponseDTO();
                    dto.setIdAdmin(rs.getInt("id"));
                    dto.setNombreAdmin(rs.getString("admin_nombre"));
                    dto.setCorreoAdmin(rs.getString("correo"));
                    dto.setRol(rs.getString("rol"));
                    dto.setIdEmpresa(rs.getInt("id_empresa"));
                    dto.setNombreEmpresa(rs.getString("empresa_nombre"));
                    dto.setNitEmpresa(rs.getString("nit"));
                    dto.setCiudadEmpresa(rs.getString("ciudad"));
                    dto.setDireccionEmpresa(rs.getString("direccion"));
                    dto.setTelefonoEmpresa(rs.getString("telefono"));
                    dto.setEmailEmpresa(rs.getString("email"));
                    return dto;
                }
            }
        }
        return null;
    }

    // 3. Consultar Citas agendadas para la empresa
    public List<CitaDTO> obtenerCitasPorEmpresa(int idEmpresa) throws SQLException {
        List<CitaDTO> citas = new ArrayList<>();
        String sql = "SELECT c.id_cita, c.empresa_id, c.id_usuario, c.id_casa, c.tipo_servicio, " +
                     "c.id_factura, c.articulo_danado, c.descripcion_danio, c.fecha, c.hora, " +
                     "c.estado, c.tecnico_asignado, c.notas, c.fecha_creacion, " +
                     "u.nombre || ' ' || u.apellido as nombre_cliente, u.telefono as telefono_cliente, " +
                     "ca.direccion, ca.tipo_propiedad " +
                     "FROM citas c " +
                     "JOIN usuarios u ON c.id_usuario = u.id_usuario " +
                     "JOIN casas ca ON c.id_casa = ca.id_casa " +
                     "WHERE c.empresa_id = ? ORDER BY c.fecha DESC, c.hora DESC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idEmpresa);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    CitaDTO c = new CitaDTO();
                    c.setIdCita(rs.getInt("id_cita"));
                    c.setEmpresaId(rs.getInt("empresa_id"));
                    c.setIdUsuario(rs.getInt("id_usuario"));
                    c.setIdCasa(rs.getInt("id_casa"));
                    c.setTipoServicio(rs.getString("tipo_servicio"));

                    int idFactura = rs.getInt("id_factura");
                    c.setIdFactura(rs.wasNull() ? null : idFactura);

                    c.setArticuloDanado(rs.getString("articulo_danado"));
                    c.setDescripcionDanio(rs.getString("descripcion_danio"));
                    c.setFecha(rs.getDate("fecha").toLocalDate());
                    c.setHora(rs.getTime("hora").toLocalTime());
                    c.setEstado(rs.getString("estado"));
                    c.setTecnicoAsignado(rs.getString("tecnico_asignado"));
                    c.setNotas(rs.getString("notas"));
                    c.setFechaCreacion(rs.getTimestamp("fecha_creacion").toLocalDateTime());

                    c.setNombreCliente(rs.getString("nombre_cliente"));
                    c.setTelefonoCliente(rs.getString("telefono_cliente"));
                    c.setDireccionCasa(rs.getString("direccion"));
                    c.setTipoPropiedad(rs.getString("tipo_propiedad"));

                    citas.add(c);
                }
            }
        }
        return citas;
    }

    // 4. Clientes y Casas atendidas por la empresa
    public List<ClienteCasaDTO> obtenerClientesYCasasAtendidas(int idEmpresa) throws SQLException {
        List<ClienteCasaDTO> lista = new ArrayList<>();
        String sql = "SELECT DISTINCT u.id_usuario, u.nombre || ' ' || u.apellido as cliente, u.correo, u.telefono, " +
                     "ca.id_casa, ca.tipo_propiedad, ca.direccion, ca.ciudad, ca.consumo_mensual " +
                     "FROM facturas f " +
                     "JOIN usuarios u ON f.id_usuario = u.id_usuario " +
                     "JOIN casas ca ON f.id_casa = ca.id_casa " +
                     "WHERE f.empresa_id = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idEmpresa);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ClienteCasaDTO dto = new ClienteCasaDTO();
                    dto.setIdUsuario(rs.getInt("id_usuario"));
                    dto.setNombreCliente(rs.getString("cliente"));
                    dto.setCorreoCliente(rs.getString("correo"));
                    dto.setTelefonoCliente(rs.getString("telefono"));
                    dto.setIdCasa(rs.getInt("id_casa"));
                    dto.setTipoPropiedad(rs.getString("tipo_propiedad"));
                    dto.setDireccionCasa(rs.getString("direccion"));
                    dto.setCiudadCasa(rs.getString("ciudad"));
                    dto.setConsumoMensualKwh(rs.getDouble("consumo_mensual"));
                    lista.add(dto);
                }
            }
        }
        return lista;
    }

    // 5. Informe Económico Mensual/Anual de Mantenimientos e Instalaciones
    public List<ReporteFinancieroDTO> obtenerInformeFinanciero(int idEmpresa, int anio) throws SQLException {
        List<ReporteFinancieroDTO> reporte = new ArrayList<>();
        String sql = "SELECT EXTRACT(MONTH FROM fecha_servicio) as mes, tipo_servicio, " +
                     "COUNT(*) as cantidad, SUM(monto_cobrado) as total " +
                     "FROM registros_servicios " +
                     "WHERE empresa_id = ? AND EXTRACT(YEAR FROM fecha_servicio) = ? " +
                     "GROUP BY mes, tipo_servicio ORDER BY mes ASC";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idEmpresa);
            ps.setInt(2, anio);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    ReporteFinancieroDTO r = new ReporteFinancieroDTO();
                    r.setMes(rs.getInt("mes"));
                    r.setAnio(anio);
                    r.setTipoServicio(rs.getString("tipo_servicio"));
                    r.setCantidadServicios(rs.getInt("cantidad"));
                    r.setTotalIngresos(rs.getDouble("total"));
                    reporte.add(r);
                }
            }
        }
        return reporte;
    }

    // 6. Generación de Factura Personalizada
    public FacturaDTO crearFactura(FacturaDTO f) throws SQLException {
        String sql = "INSERT INTO facturas (id_usuario, id_casa, empresa_id, precio_paneles, precio_conversores, " +
                     "precio_baterias, precio_cables, costo_instalacion_servicios, monto_total, estado_pago) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDIENTE') RETURNING id_factura, fecha_emision";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, f.getIdUsuario());
            ps.setInt(2, f.getIdCasa());
            ps.setInt(3, f.getEmpresaId());
            ps.setDouble(4, f.getPrecioPaneles());
            ps.setDouble(5, f.getPrecioConversores());
            ps.setDouble(6, f.getPrecioBaterias());
            ps.setDouble(7, f.getPrecioCables());
            ps.setDouble(8, f.getCostoInstalacionServicios());
            ps.setDouble(9, f.getMontoTotal());

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    f.setIdFactura(rs.getInt("id_factura"));
                    f.setFechaEmision(rs.getTimestamp("fecha_emision").toLocalDateTime());
                }
            }
        }
        return f;
    }

    // 7. Eliminar artículo del catálogo de paneles
    public boolean eliminarPanelDelCatalogo(int idPanel, int idEmpresa) throws SQLException {
        String sql = "DELETE FROM paneles_solares WHERE id = ? AND empresa_id = ?";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, idPanel);
            ps.setInt(2, idEmpresa);
            return ps.executeUpdate() > 0;
        }
    }
}