package com.energiapp.service;

import com.energiapp.dao.AdministradorDAO;
import com.energiapp.dto.*;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class AdministradorService {

    private final AdministradorDAO adminDAO;

    public AdministradorService(AdministradorDAO adminDAO) {
        this.adminDAO = adminDAO;
    }

    public boolean registrarEmpresaYAdmin(RegistroEmpresaAdminDTO dto) throws SQLException {
        return adminDAO.registrarEmpresaYAdmin(dto);
    }

    public AdminAuthResponseDTO login(AdminLoginDTO dto) throws SQLException {
        if (dto == null || dto.getCorreo() == null || dto.getContrasena() == null) {
            throw new IllegalArgumentException("Debe ingresar correo y contraseña.");
        }
        AdminAuthResponseDTO response = adminDAO.loginAdmin(dto.getCorreo(), dto.getContrasena());
        if (response == null) {
            throw new IllegalArgumentException("Credenciales inválidas de administrador.");
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

    public List<PanelCatalogoDTO> obtenerCatalogoPaneles(int idEmpresa) throws SQLException {
        return adminDAO.obtenerPanelesPorEmpresa(idEmpresa);
    }

    public PanelCatalogoDTO agregarArticuloCatalogo(PanelCatalogoDTO panel) throws SQLException {
        return adminDAO.agregarPanelAlCatalogo(panel);
    }
    public boolean cambiarEstadoCita(int idCita, int idEmpresa, String nuevoEstado) throws SQLException {
    if (nuevoEstado == null || nuevoEstado.trim().isEmpty()) {
        throw new IllegalArgumentException("El nuevo estado no puede estar vacío.");
    }
    String estadoNormalizado = nuevoEstado.trim().toUpperCase();
    if (!List.of("PENDIENTE", "CONFIRMADA", "COMPLETADA", "CANCELADA").contains(estadoNormalizado)) {
        throw new IllegalArgumentException("Estado no válido: " + nuevoEstado);
    }
    return adminDAO.actualizarEstadoCita(idCita, idEmpresa, estadoNormalizado);
        }
        
}