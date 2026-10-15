package com.energiapp.service;

import com.energiapp.dao.AdministradorDAO;
import com.energiapp.dto.*;

import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.*;

@Service
public class AdministradorService {

    private final AdministradorDAO adminDAO;

    public AdministradorService(AdministradorDAO adminDAO) {
        this.adminDAO = adminDAO;
    }

    public boolean registrarEmpresaYAdmin(RegistroEmpresaAdminDTO dto) throws SQLException {
        return adminDAO.registrarEmpresaYAdmin(dto);
    }

    public AdminAuthResponseDTO login(AdminLoginDTO dto) throws Exception {
        AdminAuthResponseDTO response = adminDAO.loginAdmin(dto.getCorreo(), dto.getContrasena());
        if (response == null) {
            throw new Exception("Credenciales inválidas de administrador.");
        }
        return response;
    }

    public List<CitaDTO> obtenerCitas(int idEmpresa) throws SQLException {
        return adminDAO.obtenerCitasPorEmpresa(idEmpresa);
    }

    public List<ClienteCasaDTO> obtenerClientesYCasas(int idEmpresa) throws SQLException {
        return adminDAO.obtenerClientesYCasasAtendidas(idEmpresa);
    }

    public List<ReporteFinancieroDTO> obtenerInformeFinanciero(int idEmpresa, int anio) throws SQLException {
        return adminDAO.obtenerInformeFinanciero(idEmpresa, anio);
    }

    public FacturaDTO generarFactura(FacturaDTO f) throws SQLException {
        return adminDAO.crearFactura(f);
    }

    public boolean eliminarArticuloCatalogo(int idPanel, int idEmpresa) throws SQLException {
        return adminDAO.eliminarPanelDelCatalogo(idPanel, idEmpresa);
    }

    // 8. Obtener lista de empresas registradas
    public List<Map<String, Object>> obtenerTodasLasEmpresas() throws Exception {
        // Cuando tengas el método en tu DAO puedes reemplazarlo por:
        // return adminDAO.obtenerEmpresas();

        List<Map<String, Object>> lista = new ArrayList<>();
        
        Map<String, Object> emp1 = new HashMap<>();
        emp1.put("idEmpresa", 1);
        emp1.put("nombre", "Solar Caribe SAS");
        emp1.put("nit", "900123456-1");
        emp1.put("ciudad", "Valledupar");
        lista.add(emp1);

        return lista;
    }
}