package com.energiapp.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "http://localhost:5173")
public class UsuarioController {

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        if ("usuario@example.com".equals(email) && "123456".equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", 1);
            response.put("nombre", "Usuario Ejemplo");
            response.put("email", email);
            return ResponseEntity.ok(response);
        }

        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Credenciales incorrectas");
        return ResponseEntity.status(401).body(errorResponse);
    }
}