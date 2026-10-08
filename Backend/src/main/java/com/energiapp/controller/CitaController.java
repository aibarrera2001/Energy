package com.energiapp.controller;

import com.energiapp.dto.CitaDTO;
import com.energiapp.service.CitaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "http://localhost:5173") // Habilita CORS para React/Vite
public class CitaController {

    private final CitaService citaService;

    public CitaController(CitaService citaService) {
        this.citaService = citaService;
    }

    @PostMapping
    public ResponseEntity<?> agendarCita(@RequestBody CitaDTO citaDTO) {
        try {
            CitaDTO agendada = citaService.agendarCita(citaDTO);
            return ResponseEntity.status(HttpStatus.CREATED).body(agendada);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al agendar la cita: " + e.getMessage());
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> obtenerCitasPorUsuario(@PathVariable int idUsuario) {
        try {
            List<CitaDTO> citas = citaService.obtenerCitasPorUsuario(idUsuario);
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar las citas: " + e.getMessage());
        }
    }
}