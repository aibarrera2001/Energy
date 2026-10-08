package com.energiapp.service;

import com.energiapp.dao.FacturaDAO;
import com.energiapp.dto.FacturaDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class FacturaService {

    private final FacturaDAO facturaDAO;

    public FacturaService(FacturaDAO facturaDAO) {
        this.facturaDAO = facturaDAO;
    }

    public FacturaDTO generarFactura(FacturaDTO factura) throws Exception {
        if (factura.getIdUsuario() == null || factura.getIdCasa() == null || factura.getEmpresaId() == null) {
            throw new IllegalArgumentException("idUsuario, idCasa y empresaId son campos obligatorios.");
        }

        // Asignar 0.0 por defecto a los ítems si vienen nulos
        double paneles = factura.getPrecioPaneles() != null ? factura.getPrecioPaneles() : 0.0;
        double conversores = factura.getPrecioConversores() != null ? factura.getPrecioConversores() : 0.0;
        double baterias = factura.getPrecioBaterias() != null ? factura.getPrecioBaterias() : 0.0;
        double cables = factura.getPrecioCables() != null ? factura.getPrecioCables() : 0.0;
        double instalacion = factura.getCostoInstalacionServicios() != null ? factura.getCostoInstalacionServicios() : 0.0;

        factura.setPrecioPaneles(paneles);
        factura.setPrecioConversores(conversores);
        factura.setPrecioBaterias(baterias);
        factura.setPrecioCables(cables);
        factura.setCostoInstalacionServicios(instalacion);

        // Cálculo automático del monto total sumando los componentes
        double calculadoTotal = paneles + conversores + baterias + cables + instalacion;
        
        if (calculadoTotal <= 0) {
            throw new IllegalArgumentException("El monto total de la factura debe ser mayor a cero.");
        }

        factura.setMontoTotal(calculadoTotal);

        if (factura.getEstadoPago() == null) {
            factura.setEstadoPago("PENDIENTE");
        }

        boolean exito = facturaDAO.crearFactura(factura);
        if (!exito) {
            throw new SQLException("Error al intentar registrar la factura en la base de datos.");
        }

        return factura;
    }

    public List<FacturaDTO> obtenerFacturasPorUsuario(int idUsuario) throws SQLException {
        return facturaDAO.obtenerFacturasPorUsuario(idUsuario);
    }
}