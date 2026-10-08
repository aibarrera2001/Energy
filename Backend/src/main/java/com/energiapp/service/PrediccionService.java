package com.energiapp.service;

import com.energiapp.dao.CatalogoDAO;
import com.energiapp.dao.HistorialPrediccionDAO;
import com.energiapp.dto.PanelDTO;
import com.energiapp.dto.PrediccionDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class PrediccionService {

    private final OpenMeteoApiClient apiClient;
    private final HistorialPrediccionDAO prediccionDAO;
    private final CatalogoDAO catalogoDAO;

    // Factores estándar de física/ingeniería
    private static final double FACTOR_PERDIDAS_SISTEMA = 0.80; // 80% de eficiencia real
    private static final double METROS_CABLE_ESTANDAR = 25.0;   // Metros promedio por instalación
    private static final double TARIFA_ENERGIA_COP = 850.0;     // Tarifa media kWh
    private static final double FACTOR_CO2_KG_KWH = 0.126;

    public PrediccionService(OpenMeteoApiClient apiClient, 
                             HistorialPrediccionDAO prediccionDAO, 
                             CatalogoDAO catalogoDAO) {
        this.apiClient = apiClient;
        this.prediccionDAO = prediccionDAO;
        this.catalogoDAO = catalogoDAO;
    }

    public PrediccionDTO calcularYGuardarPrediccion(
            int idUsuario, int idCasa, String tipoPropiedad, String direccionCasa,
            double latitudCasa, double longitudCasa, int empresaId, int idPanel,
            int cantidadPanelesDeseada, double consumoMensualKwh,
            boolean incluyeBaterias, int diasAutonomia) throws Exception {

        double lat = latitudCasa;
        double lon = longitudCasa;

        // 1. Geolocalización
        if (!"FINCA".equalsIgnoreCase(tipoPropiedad)) {
            double[] coords = apiClient.obtenerCoordenadas(direccionCasa);
            lat = coords[0];
            lon = coords[1];
        }

        // 2. Consulta de radiación solar en Open-Meteo
        double radiacionDiaria = apiClient.obtenerRadiacionDiariaKwh(lat, lon);

        // 3. Consultar datos REALES del panel seleccionado desde la BD usando PanelDTO
        PanelDTO panelData = catalogoDAO.obtenerPanelPorId(idPanel);
        double potenciaPanelWatts = panelData.getPotenciaWatts();
        double precioPanel = panelData.getPrecio();
        double costoInstalacionPanel = panelData.getCostoInstalacion();

        // 4. Cálculo de generación y paneles recomendados
        double potenciaUnPanelKw = potenciaPanelWatts / 1000.0;
        double generacionUnPanelMesKwh = potenciaUnPanelKw * radiacionDiaria * 30 * FACTOR_PERDIDAS_SISTEMA;
        
        int panelesRecomendados = (int) Math.ceil(consumoMensualKwh / generacionUnPanelMesKwh);
        int panelesAUsar = (cantidadPanelesDeseada > 0) ? cantidadPanelesDeseada : panelesRecomendados;

        double potenciaTotalWatts = potenciaPanelWatts * panelesAUsar;
        double generacionMensualKwh = generacionUnPanelMesKwh * panelesAUsar;

        // =========================================================================
        // COSTEOS DESDE LAS TABLAS DE LA BASE DE DATOS
        // =========================================================================

        // A. Costo total de Paneles + su instalación (Tabla: paneles_solares)
        double costoPaneles = (precioPanel * panelesAUsar) + (costoInstalacionPanel * panelesAUsar);

        // B. Costo Conversor (Tabla: conversores)
        double costoConversor = catalogoDAO.obtenerPrecioConversorAdecuado(potenciaTotalWatts);

        // C. Costo Baterías (Tabla: baterias)
        double costoBaterias = 0.0;
        if (incluyeBaterias) {
            double consumoDiarioKwh = consumoMensualKwh / 30.0;
            int dias = (diasAutonomia > 0) ? diasAutonomia : 1;
            double capacidadBateriasKwhRequerida = consumoDiarioKwh * dias;
            costoBaterias = catalogoDAO.obtenerPrecioBateriaAdecuada(capacidadBateriasKwhRequerida);
        }

        // D. Costo Cableado (Tabla: cables)
        double corrienteAmperios = potenciaTotalWatts / 220.0;
        double precioMetroCable = catalogoDAO.obtenerPrecioMetroCableAdecuado(corrienteAmperios);
        double costoTotalCableado = precioMetroCable * METROS_CABLE_ESTANDAR;

        // E. Inversión Total y Ahorro
        double costoTotalInstalacion = costoPaneles + costoConversor + costoBaterias + costoTotalCableado;
        double ahorroCopMes = Math.min(generacionMensualKwh, consumoMensualKwh) * TARIFA_ENERGIA_COP;
        double tiempoRetornoAnios = (ahorroCopMes > 0) ? (costoTotalInstalacion / (ahorroCopMes * 12.0)) : 0.0;

        // F. Impacto ambiental
        double co2EvitadoTonAnio = (generacionMensualKwh * 12 * FACTOR_CO2_KG_KWH) / 1000.0;

        // 5. Construir y guardar DTO
        PrediccionDTO dto = new PrediccionDTO();
        dto.setIdUsuario(idUsuario);
        dto.setIdCasa(idCasa);
        dto.setEmpresaId(empresaId);
        dto.setIdPanel(idPanel);
        dto.setConsumoMensualKwh(consumoMensualKwh);
        dto.setPanelesRecomendados(panelesRecomendados);
        dto.setCantidadPaneles(panelesAUsar);
        dto.setLatitud(lat);
        dto.setLongitud(lon);
        dto.setRadiacionDiariaKwh(radiacionDiaria);
        dto.setGeneracionEstimadaKwhMes(generacionMensualKwh);
        
        dto.setCostoPanelesCop(costoPaneles);
        dto.setCostoInversorCop(costoConversor);
        dto.setCostoBateriasCop(costoBaterias);
        dto.setCostoCableadoEstructuraCop(costoTotalCableado);
        dto.setCostoTotalInstalacionCop(costoTotalInstalacion);
        
        dto.setAhorroEstimadoCopMes(ahorroCopMes);
        dto.setTiempoRetornoAnios(Math.round(tiempoRetornoAnios * 10.0) / 10.0);
        dto.setCo2EvitadoTonAnio(co2EvitadoTonAnio);

        prediccionDAO.guardarPrediccion(dto);
        return dto;
    }

    public List<PrediccionDTO> obtenerHistorialPorUsuario(int idUsuario) throws SQLException {
        return prediccionDAO.obtenerHistorialPorUsuario(idUsuario);
    }
}