package com.energiapp.controller;

import com.energiapp.dao.UsuarioDAO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class UsuarioController {

    private final UsuarioDAO usuarioDAO;

    public UsuarioController(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        // Soporta tanto 'email' como 'correo' provenientes del JSON del frontend
        String email = credentials.get("email") != null ? credentials.get("email") : credentials.get("correo");
        String password = credentials.get("password") != null ? credentials.get("password") : credentials.get("contrasena");

        try {
            Map<String, Object> usuario = usuarioDAO.validarLogin(email, password);

            if (usuario != null) {
                return ResponseEntity.ok(usuario);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("message", "Credenciales incorrectas");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        } catch (Exception e) {
            e.printStackTrace(); // Imprime el error exacto en la terminal de Java
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error interno en base de datos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}