package com.energiapp.controller;

import com.energiapp.dto.PrediccionDTO;
import com.energiapp.dto.PrediccionRequestDTO;
import com.energiapp.service.PrediccionService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/predicciones")
@CrossOrigin(origins = "http://localhost:5173") // Habilita CORS para React/Vite
public class PrediccionController {

    private final PrediccionService prediccionService;

    public PrediccionController(PrediccionService prediccionService) {
        this.prediccionService = prediccionService;
    }

    @PostMapping("/calcular")
    public ResponseEntity<PrediccionDTO> calcularPrediccion(
            @Valid @RequestBody PrediccionRequestDTO request) throws Exception {

        PrediccionDTO resultado = prediccionService.calcularYGuardarPrediccion(
                request.getIdUsuario(),
                request.getIdCasa() != null ? request.getIdCasa() : 0,
                request.getTipoPropiedad(),
                request.getDireccionCasa(),
                request.getLatitudCasa(),
                request.getLongitudCasa(),
                request.getEmpresaId() != null ? request.getEmpresaId() : 0,
                request.getIdPanel(),
                request.getCantidadPaneles(),
                request.getConsumoMensualKwh(),
                request.isIncluyeBaterias(),
                request.getDiasAutonomia()
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<List<PrediccionDTO>> obtenerHistorial(
            @PathVariable int idUsuario) throws Exception {
        return ResponseEntity.ok(prediccionService.obtenerHistorialPorUsuario(idUsuario));
    }
}