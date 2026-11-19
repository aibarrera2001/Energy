package com.energiapp.controller;

import com.energiapp.dto.ArticuloCatalogoDTO;
import com.energiapp.dto.CasaDTO;
import com.energiapp.service.CasaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/casas")
@CrossOrigin(originPatterns = "*")
public class CasaController {

    private final CasaService casaService;

    public CasaController(CasaService casaService) {
        this.casaService = casaService;
    }

    // 1. Obtener el catálogo de electrodomésticos/artículos para el cuestionario de casas nuevas
    @GetMapping("/catalogo-articulos")
    public ResponseEntity<?> obtenerCatalogoArticulos() {
        try {
            List<ArticuloCatalogoDTO> catalogo = casaService.obtenerCatalogoArticulos();
            return ResponseEntity.ok(catalogo);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar el catálogo de artículos: " + e.getMessage());
        }
    }

    // 2. Registrar una propiedad (con consumo directo o calculado por cuestionario)
    @PostMapping
    public ResponseEntity<?> registrarCasa(@RequestBody CasaDTO casaDTO) {
        try {
            CasaDTO casaRegistrada = casaService.registrarCasa(casaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(casaRegistrada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar la propiedad: " + e.getMessage());
        }
    }

    // 3. Listar todas las propiedades de un usuario
    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerCasasPorUsuario(@PathVariable int idUsuario) {
        try {
            List<CasaDTO> casas = casaService.obtenerCasasPorUsuario(idUsuario);
            return ResponseEntity.ok(casas);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar las propiedades del usuario: " + e.getMessage());
        }
    }

    // 4. Obtener el detalle de una propiedad específica por su ID
    @GetMapping("/{idCasa}")
    public ResponseEntity<?> obtenerCasaPorId(@PathVariable int idCasa) {
        try {
            CasaDTO casa = casaService.obtenerCasaPorId(idCasa);
            if (casa == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("No se encontró la propiedad con ID: " + idCasa);
            }
            return ResponseEntity.ok(casa);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar la propiedad: " + e.getMessage());
        }
    }
}