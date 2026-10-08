package com.energiapp.controller;

import com.energiapp.dto.ChatMessageDTO;
import com.energiapp.service.ChatbotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:5173") // Habilita CORS para React/Vite
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<?> enviarMensaje(@RequestBody ChatMessageDTO mensajeDTO) {
        try {
            ChatMessageDTO respuesta = chatbotService.procesarMensaje(mensajeDTO);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error procesando el mensaje: " + e.getMessage());
        }
    }

    @GetMapping("/historial/{idUsuario}/{empresaId}")
    public ResponseEntity<?> obtenerHistorial(@PathVariable int idUsuario, @PathVariable int empresaId) {
        try {
            List<ChatMessageDTO> historial = chatbotService.obtenerHistorial(idUsuario, empresaId);
            return ResponseEntity.ok(historial);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar el historial del chat: " + e.getMessage());
        }
    }
}