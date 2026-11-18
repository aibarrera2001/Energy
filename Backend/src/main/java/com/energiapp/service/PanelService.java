package com.energiapp.service;

import com.energiapp.dao.PanelDAO;
import com.energiapp.dto.RecomendacionPanelDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Service
public class PanelService {

    private final PanelDAO panelDAO;

    public PanelService(PanelDAO panelDAO) {
        this.panelDAO = panelDAO;
    }

    private double obtenerHspPorCiudad(String ciudad) {
        if (ciudad == null) return 5.0;
        switch (ciudad.trim().toLowerCase()) {
            case "valledupar":
            case "riohacha":
                return 5.5;
            case "barranquilla":
            case "santa marta":
            case "cartagena":
                return 5.3;
            case "montería":
            case "monteria":
            case "sincelejo":
                return 5.0;
            default:
                return 4.8;
        }
    }

    public List<RecomendacionPanelDTO> recomendarParaCasa(int idCasa) throws SQLException {
        Map<String, Object> casa = panelDAO.obtenerDatosCasa(idCasa);
        if (casa == null) {
            throw new IllegalArgumentException("La propiedad seleccionada no existe.");
        }

        double consumoMensual = (double) casa.get("consumoMensual");
        String ciudad = (String) casa.get("ciudad");
        double hsp = obtenerHspPorCiudad(ciudad);
        double factorRendimiento = 0.80;

        double consumoDiarioKwh = consumoMensual / 30.0;
        double potenciaRequeridaW = (consumoDiarioKwh / (hsp * factorRendimiento)) * 1000.0;

        var catalogo = panelDAO.listarCatalogoPaneles();
        var recomendaciones = new ArrayList<RecomendacionPanelDTO>();

        for (RecomendacionPanelDTO dto : catalogo) {
            double potenciaW = dto.getPotenciaW();
            if (potenciaW <= 0) continue;

            int cantidad = (int) Math.ceil(potenciaRequeridaW / potenciaW);
            if (cantidad < 1) cantidad = 1;

            double precioUnitario = dto.getInversionEstimada();
            double costoInstalacion = dto.getPotenciaTotalKw();
            double inversionTotal = (cantidad * precioUnitario) + costoInstalacion;

            double potenciaTotalKw = (cantidad * potenciaW) / 1000.0;
            double generacionMensual = potenciaTotalKw * hsp * 30.0 * factorRendimiento;
            double cobertura = (generacionMensual / consumoMensual) * 100.0;

            dto.setCantidadPaneles(cantidad);
            dto.setPotenciaTotalKw(Math.round(potenciaTotalKw * 100.0) / 100.0);
            dto.setGeneracionMensualKwh(Math.round(generacionMensual * 10.0) / 10.0);
            dto.setPorcentajeCobertura(Math.round(cobertura * 10.0) / 10.0);
            dto.setInversionEstimada(inversionTotal);
            recomendaciones.add(dto);
        }

        recomendaciones.sort(Comparator.comparingDouble(RecomendacionPanelDTO::getInversionEstimada));
        if (!recomendaciones.isEmpty()) {
            recomendaciones.get(0).setRecomendado(true);
        }

        return recomendaciones;
    }
}