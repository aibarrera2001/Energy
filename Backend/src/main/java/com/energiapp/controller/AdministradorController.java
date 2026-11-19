package com.energiapp.controller;

import com.energiapp.dto.*;
import com.energiapp.service.AdministradorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(originPatterns = "*")
public class AdministradorController {

    private final AdministradorService adminService;

    public AdministradorController(AdministradorService adminService) {
        this.adminService = adminService;
    }

    // 1. Registro de Empresa + Administrador
    @PostMapping("/registro")
    public ResponseEntity<String> registrar(@RequestBody RegistroEmpresaAdminDTO dto) {
        try {
            adminService.registrarEmpresaYAdmin(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body("Empresa y Administrador registrados correctamente.");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar: " + e.getMessage());
        }
    }

    // 2. Login de Administrador (Retorna info de Admin + Empresa)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginDTO dto) {
        try {
            AdminAuthResponseDTO response = adminService.login(dto);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(e.getClass().getSimpleName() + ": " + e.getMessage());
        }
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

    // 8. Listar paneles del catálogo de la empresa
    @GetMapping("/empresa/{idEmpresa}/catalogo/paneles")
    public ResponseEntity<List<PanelCatalogoDTO>> listarPaneles(@PathVariable int idEmpresa) throws Exception {
        return ResponseEntity.ok(adminService.obtenerCatalogoPaneles(idEmpresa));
    }

    // 9. Agregar panel al catálogo de la empresa
    @PostMapping("/empresa/{idEmpresa}/catalogo/panel")
    public ResponseEntity<PanelCatalogoDTO> agregarPanel(
            @PathVariable int idEmpresa,
            @RequestBody PanelCatalogoDTO panel) throws Exception {
        panel.setEmpresaId(idEmpresa);
        return ResponseEntity.status(HttpStatus.CREATED).body(adminService.agregarArticuloCatalogo(panel));
    }


    // 10. Cambiar estado de una cita
@PutMapping("/empresa/{idEmpresa}/cita/{idCita}/estado")
public ResponseEntity<String> actualizarEstadoCita(
        @PathVariable int idEmpresa,
        @PathVariable int idCita,
        @RequestBody java.util.Map<String, String> body) {
    try {
        String nuevoEstado = body.get("estado");
        boolean actualizado = adminService.cambiarEstadoCita(idCita, idEmpresa, nuevoEstado);
        if (actualizado) {
            return ResponseEntity.ok("Estado de la cita actualizado a " + nuevoEstado.toUpperCase());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No se encontró la cita o no pertenece a esta empresa.");
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        e.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al actualizar estado: " + e.getMessage());
    }
}
}