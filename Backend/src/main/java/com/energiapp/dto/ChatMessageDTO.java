package com.energiapp.dto;

import java.time.LocalDateTime;

public class ChatMessageDTO {

    private Integer idMensaje;
    private Integer idUsuario;
    private Integer empresaId;
    private String mensajeUsuario;
    private String respuestaBot;
    private LocalDateTime fechaEnvio;

    public ChatMessageDTO() {}

    public ChatMessageDTO(Integer idUsuario, Integer empresaId, String mensajeUsuario, String respuestaBot) {
        this.idUsuario = idUsuario;
        this.empresaId = empresaId;
        this.mensajeUsuario = mensajeUsuario;
        this.respuestaBot = respuestaBot;
    }

    // Getters y Setters
    public Integer getIdMensaje() { return idMensaje; }
    public void setIdMensaje(Integer idMensaje) { this.idMensaje = idMensaje; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public Integer getEmpresaId() { return empresaId; }
    public void setEmpresaId(Integer empresaId) { this.empresaId = empresaId; }

    public String getMensajeUsuario() { return mensajeUsuario; }
    public void setMensajeUsuario(String mensajeUsuario) { this.mensajeUsuario = mensajeUsuario; }

    public String getRespuestaBot() { return respuestaBot; }
    public void setRespuestaBot(String respuestaBot) { this.respuestaBot = respuestaBot; }

    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
}