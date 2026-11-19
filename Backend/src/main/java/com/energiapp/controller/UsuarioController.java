package com.energiapp.controller;

import com.energiapp.dao.UsuarioDAO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(originPatterns = "*")
public class UsuarioController {

    private final UsuarioDAO usuarioDAO;

    public UsuarioController(UsuarioDAO usuarioDAO) {
        this.usuarioDAO = usuarioDAO;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody Map<String, Object> body) {
        Map<String, String> response = new HashMap<>();

        try {
            String nombreCompleto = body.get("nombre") != null ? String.valueOf(body.get("nombre")).trim() : "";
            String correo = body.get("correo") != null ? String.valueOf(body.get("correo")).trim() : "";
            String telefono = body.get("telefono") != null ? String.valueOf(body.get("telefono")).trim() : "";
            String ciudad = body.get("ciudad") != null ? String.valueOf(body.get("ciudad")).trim() : "Valledupar";
            String password = body.get("password") != null
                    ? String.valueOf(body.get("password"))
                    : (body.get("contrasena") != null ? String.valueOf(body.get("contrasena")) : "");
            String rol = body.get("rol") != null ? String.valueOf(body.get("rol")).trim() : "USER";

            if (nombreCompleto.isEmpty() || correo.isEmpty() || password.isEmpty()) {
                response.put("mensaje", "Todos los campos obligatorios deben estar completos.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

            String[] partes = nombreCompleto.split("\\s+", 2);
            String primerNombre = partes[0];
            String apellido = partes.length > 1 ? partes[1] : "-";

            boolean creado = usuarioDAO.registrarUsuario(
                    primerNombre,
                    apellido,
                    correo,
                    telefono,
                    ciudad,
                    password,
                    rol
            );

            if (creado) {
                response.put("mensaje", "Usuario registrado correctamente.");
                return ResponseEntity.status(HttpStatus.CREATED).body(response);
            } else {
                response.put("mensaje", "No se pudo registrar el usuario.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }

        } catch (SQLException e) {
            e.printStackTrace();
            if ("23505".equals(e.getSQLState())) {
                response.put("mensaje", "El correo ya se encuentra registrado en el sistema.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            response.put("mensaje", "Error en base de datos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("mensaje", "Error interno al registrar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email") != null ? credentials.get("email") : credentials.get("correo");
        String password = credentials.get("password") != null ? credentials.get("password") : credentials.get("contrasena");

        try {
            Map<String, Object> usuario = usuarioDAO.validarLogin(email, password);

            if (usuario != null) {
                return ResponseEntity.ok(usuario);
            } else {
                Map<String, String> errorResponse = new HashMap<>();
                errorResponse.put("mensaje", "Credenciales incorrectas");
                errorResponse.put("message", "Credenciales incorrectas");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("mensaje", "Error interno en base de datos: " + e.getMessage());
            errorResponse.put("message", "Error interno en base de datos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}