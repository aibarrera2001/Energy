package com.energiapp.controller;

import com.energiapp.dto.CasaDTO;
import com.energiapp.service.CasaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/casas")
@CrossOrigin(origins = "http://localhost:5173") // Habilita CORS para React/Vite
public class CasaController {

    private final CasaService casaService;

    public CasaController(CasaService casaService) {
        this.casaService = casaService;
    }

    /**
     * POST /api/casas
     * Registrar una nueva propiedad (CASA, APARTAMENTO, EDIFICIO, FINCA)
     */
    @PostMapping
    public ResponseEntity<?> registrarCasa(@RequestBody CasaDTO casaDTO) {
        try {
            CasaDTO creada = casaService.registrarCasa(casaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(creada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar la propiedad: " + e.getMessage());
        }
    }

    /**
     * GET /api/casas/usuario/{idUsuario}
     * Obtener todas las propiedades de un usuario
     */
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerCasasPorUsuario(@PathVariable int idUsuario) {
        try {
            List<CasaDTO> casas = casaService.obtenerCasasPorUsuario(idUsuario);
            return ResponseEntity.ok(casas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar las propiedades: " + e.getMessage());
        }
    }

    /**
     * GET /api/casas/{idCasa}
     * Obtener el detalle de una propiedad específica por ID
     */
    @GetMapping("/{idCasa}")
    public ResponseEntity<?> obtenerCasaPorId(@PathVariable int idCasa) {
        try {
            CasaDTO casa = casaService.obtenerCasaPorId(idCasa);
            if (casa != null) {
                return ResponseEntity.ok(casa);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Propiedad no encontrada.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al obtener la propiedad: " + e.getMessage());
        }
    }
}