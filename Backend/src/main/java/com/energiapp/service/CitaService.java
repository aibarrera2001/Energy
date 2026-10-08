package com.energiapp.service;

import com.energiapp.dao.CitaDAO;
import com.energiapp.dto.CitaDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

@Service
public class CitaService {

    private final CitaDAO citaDAO;

    public CitaService(CitaDAO citaDAO) {
        this.citaDAO = citaDAO;
    }

    public CitaDTO agendarCita(CitaDTO cita) throws Exception {
        if (cita.getFecha() == null || cita.getFecha().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha de la cita debe ser posterior a hoy.");
        }

        if (cita.getHora() == null) {
            throw new IllegalArgumentException("La hora de la cita es obligatoria.");
        }

        if (cita.getTipoServicio() == null) {
            throw new IllegalArgumentException("El tipo de servicio es obligatorio.");
        }

        String servicio = cita.getTipoServicio().toUpperCase();
        if ("INSTALACION".equals(servicio) && cita.getIdFactura() == null) {
            throw new IllegalArgumentException("El servicio de Instalación requiere vincular un id_factura.");
        }

        if ("ARREGLO".equals(servicio) && (cita.getArticuloDanado() == null || cita.getArticuloDanado().trim().isEmpty())) {
            throw new IllegalArgumentException("El servicio de Arreglo debe especificar el artículo dañado (PANEL, CABLE, INVERSOR, BATERIA).");
        }

        cita.setTipoServicio(servicio);
        if (cita.getEstado() == null) {
            cita.setEstado("PENDIENTE");
        }

        boolean exito = citaDAO.agendarCita(cita);
        if (!exito) {
            throw new SQLException("No se pudo guardar la cita en la base de datos.");
        }

        return cita;
    }

    public List<CitaDTO> obtenerCitasPorUsuario(int idUsuario) throws SQLException {
        return citaDAO.obtenerCitasPorUsuario(idUsuario);
    }
}