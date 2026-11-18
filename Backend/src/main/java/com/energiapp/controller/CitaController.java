package com.energiapp.controller;

import com.energiapp.dao.CitaDAO;
import com.energiapp.dto.CitaDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/citas")
@CrossOrigin(origins = "*")
public class CitaController {

    private final CitaDAO citaDAO;
    private final DataSource dataSource;

    public CitaController(CitaDAO citaDAO, DataSource dataSource) {
        this.citaDAO = citaDAO;
        this.dataSource = dataSource;
    }

    @GetMapping("/usuario/{idUsuario}")
    public ResponseEntity<?> listarPorUsuario(@PathVariable int idUsuario) {
        try {
            List<CitaDTO> citas = citaDAO.obtenerCitasPorUsuario(idUsuario);
            return ResponseEntity.ok(citas);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al obtener citas: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> agendar(@RequestBody CitaDTO cita) {
        try {
            if (cita.getEmpresaId() == null || cita.getEmpresaId() <= 0) {
                cita.setEmpresaId(obtenerEmpresaPorDefecto());
            }
            if (cita.getEstado() == null || cita.getEstado().isBlank()) {
                cita.setEstado("PENDIENTE");
            }

            boolean guardada = citaDAO.agendarCita(cita);
            if (guardada) {
                return ResponseEntity.status(HttpStatus.CREATED).body(cita);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "No se pudo agendar la cita"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al agendar cita: " + e.getMessage()));
        }
    }

   private int obtenerEmpresaPorDefecto() {
        String sql = "SELECT id_empresa FROM empresas ORDER BY id_empresa ASC LIMIT 1";
        try (Connection conn = dataSource.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                return rs.getInt("id_empresa");
            }
        } catch (Exception ignored) {
        }
        return 1;
    }
}