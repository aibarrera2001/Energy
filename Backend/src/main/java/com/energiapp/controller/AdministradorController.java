package com.energiapp.controller;

import com.energiapp.dto.*;
import com.energiapp.service.AdministradorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdministradorController {

    private final AdministradorService adminService;

    public AdministradorController(AdministradorService adminService) {
        this.adminService = adminService;
    }

    // 1. Registro de Empresa + Administrador
    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@RequestBody RegistroEmpresaAdminDTO dto) throws Exception {
        adminService.registrarEmpresaYAdmin(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body("Empresa y Administrador registrados correctamente.");
    }

    // 2. Login de Administrador (Retorna info de Admin + Empresa)
    @PostMapping("/login")
    public ResponseEntity<AdminAuthResponseDTO> login(@RequestBody AdminLoginDTO dto) throws Exception {
        return ResponseEntity.ok(adminService.login(dto));
    }

    // 3. Obtener Citas de la empresa
    @GetMapping("/empresa/{idEmpresa}/citas")
    public ResponseEntity<List<CitaDTO>> obtenerCitas(@PathVariable int idEmpresa) throws Exception {
        return ResponseEntity.ok(adminService.obtenerCitas(idEmpresa));
    }

    // 4. Clientes y Casas atendidas
    @GetMapping("/empresa/{idEmpresa}/clientes-casas")
    public ResponseEntity<List<ClienteCasaDTO>> obtenerClientesYCasas(@PathVariable int idEmpresa) throws Exception {
        return ResponseEntity.ok(adminService.obtenerClientesYCasas(idEmpresa));
    }

    // 5. Informe Económico de mantenimientos/instalaciones por año
    @GetMapping("/empresa/{idEmpresa}/informe-financiero/{anio}")
    public ResponseEntity<List<ReporteFinancieroDTO>> obtenerInformeFinanciero(
            @PathVariable int idEmpresa, 
            @PathVariable int anio) throws Exception {
        return ResponseEntity.ok(adminService.obtenerInformeFinanciero(idEmpresa, anio));
    }

    // 6. Generar Factura Personalizada
    @PostMapping("/factura")
    public ResponseEntity<FacturaDTO> generarFactura(@RequestBody FacturaDTO factura) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.generarFactura(factura));
    }

    // 7. Eliminar artículo del catálogo
    @DeleteMapping("/empresa/{idEmpresa}/catalogo/panel/{idPanel}")
    public ResponseEntity<String> eliminarPanel(
            @PathVariable int idEmpresa, 
            @PathVariable int idPanel) throws Exception {
        boolean eliminado = adminService.eliminarArticuloCatalogo(idPanel, idEmpresa);
        if (eliminado) {
            return ResponseEntity.ok("Artículo eliminado del catálogo correctamente.");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró el artículo o no pertenece a la empresa.");
    }
}