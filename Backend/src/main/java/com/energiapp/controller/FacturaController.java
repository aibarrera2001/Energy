package com.energiapp.controller;

import com.energiapp.dto.FacturaDTO;
import com.energiapp.service.FacturaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@CrossOrigin(origins = "http://localhost:5173") // Habilita CORS para React/Vite
public class FacturaController {

    private final FacturaService facturaService;

    public FacturaController(FacturaService facturaService) {
        this.facturaService = facturaService;
    }

    @PostMapping
    public ResponseEntity<?> generarFactura(@RequestBody FacturaDTO facturaDTO) {
        try {
            FacturaDTO nuevaFactura = facturaService.generarFactura(facturaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(nuevaFactura);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al generar la factura: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerFacturasPorUsuario(@PathVariable int idUsuario) {
        try {
            List<FacturaDTO> facturas = facturaService.obtenerFacturasPorUsuario(idUsuario);
            return ResponseEntity.ok(facturas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar las facturas: " + e.getMessage());
        }
    }
}