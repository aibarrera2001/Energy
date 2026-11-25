package com.energiapp.controller;

import com.energiapp.dto.RecomendacionPanelDTO;
import com.energiapp.service.PanelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/paneles")

public class PanelController {

    private final PanelService panelService;

    public PanelController(PanelService panelService) {
        this.panelService = panelService;
    }

    @GetMapping("/recomendar/{idCasa}")
    public ResponseEntity<?> recomendar(@PathVariable int idCasa) {
        try {
            List<RecomendacionPanelDTO> opciones = panelService.recomendarParaCasa(idCasa);
            return ResponseEntity.ok(opciones);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error calculando recomendación solar: " + e.getMessage()));
        }
    }
}