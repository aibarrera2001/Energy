package com.energiapp.service;

import com.energiapp.dao.ChatDAO;
import com.energiapp.dao.CitaDAO;
import com.energiapp.dao.FacturaDAO;
import com.energiapp.dao.HistorialPrediccionDAO;
import com.energiapp.dto.ChatMessageDTO;
import com.energiapp.dto.CitaDTO;
import com.energiapp.dto.FacturaDTO;
import com.energiapp.dto.PrediccionDTO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatbotService {

    private final ChatDAO chatDAO;
    private final HistorialPrediccionDAO prediccionDAO;
    private final CitaDAO citaDAO;
    private final FacturaDAO facturaDAO;

    public ChatbotService(ChatDAO chatDAO, HistorialPrediccionDAO prediccionDAO, CitaDAO citaDAO, FacturaDAO facturaDAO) {
        this.chatDAO = chatDAO;
        this.prediccionDAO = prediccionDAO;
        this.citaDAO = citaDAO;
        this.facturaDAO = facturaDAO;
    }

    public ChatMessageDTO procesarMensaje(ChatMessageDTO dto) throws Exception {
        if (dto.getIdUsuario() == null || dto.getEmpresaId() == null || dto.getMensajeUsuario() == null) {
            throw new IllegalArgumentException("El idUsuario, empresaId y mensajeUsuario son obligatorios.");
        }

        String texto = dto.getMensajeUsuario().toLowerCase();
        String respuesta;

        if (texto.contains("prediccion") || texto.contains("ahorro") || texto.contains("generacion")) {
            List<PrediccionDTO> predicciones = prediccionDAO.obtenerHistorialPorUsuario(dto.getIdUsuario());
            if (predicciones.isEmpty()) {
                respuesta = "No cuentas con predicciones registradas aún. Genera un cálculo en el módulo de predicciones para ver tus estimados.";
            } else {
                PrediccionDTO ult = predicciones.get(0);
                respuesta = String.format("Tu última predicción proyecta una generación de %.2f kWh/mes y un ahorro estimado de $%.2f COP mensuales.",
                        ult.getGeneracionEstimadaKwhMes(), ult.getAhorroEstimadoCopMes());
            }
        } else if (texto.contains("cita") || texto.contains("mantenimiento") || texto.contains("instalacion")) {
            List<CitaDTO> citas = citaDAO.obtenerCitasPorUsuario(dto.getIdUsuario());
            if (citas.isEmpty()) {
                respuesta = "No registras citas programadas. Puedes agendar una instalación o mantenimiento técnico desde la sección correspondiente.";
            } else {
                CitaDTO prox = citas.get(0);
                respuesta = String.format("Tienes una cita de tipo '%s' agendada para el %s a las %s. Estado: %s.",
                        prox.getTipoServicio(), prox.getFecha(), prox.getHora(), prox.getEstado());
            }
        } else if (texto.contains("factura") || texto.contains("pago") || texto.contains("monto")) {
            List<FacturaDTO> facturas = facturaDAO.obtenerFacturasPorUsuario(dto.getIdUsuario());
            if (facturas.isEmpty()) {
                respuesta = "No se encontraron facturas emitidas para tu usuario.";
            } else {
                FacturaDTO ultFact = facturas.get(0);
                respuesta = String.format("Tu factura más reciente tiene un monto total de $%.2f COP. Estado de pago: %s.",
                        ultFact.getMontoTotal(), ultFact.getEstadoPago());
            }
        } else {
            respuesta = "¡Hola! Soy el asistente inteligente de EnergiApp. Puedo ayudarte con información sobre tus predicciones de energía solar, el estado de tus citas técnicas o el valor de tus facturas. ¿Qué deseas consultar?";
        }

        dto.setRespuestaBot(respuesta);
        chatDAO.guardarMensaje(dto);

        return dto;
    }

    public List<ChatMessageDTO> obtenerHistorial(int idUsuario, int empresaId) throws Exception {
        return chatDAO.obtenerHistorial(idUsuario, empresaId);
    }
}