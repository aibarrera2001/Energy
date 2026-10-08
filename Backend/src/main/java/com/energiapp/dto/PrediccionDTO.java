package com.energiapp.dto;

import java.time.LocalDateTime;

public class PrediccionDTO {
    private Integer idPrediccion;
    private Integer idUsuario;
    private Integer idCasa;
    private Integer empresaId;
    private Integer idPanel;
    private Integer cantidadPaneles;
    private Integer panelesRecomendados;

    // Consumo y Cobertura
    private double consumoMensualKwh;
    private double porcentajeCoberturaConsumo;

    // Resultados de Open-Meteo
    private double latitud;
    private double longitud;
    private double radiacionDiariaKwh;

    // Estimaciones calculadas
    private double generacionEstimadaKwhMes;
    private double ahorroEstimadoCopMes;
    private double co2EvitadoTonAnio;
    private LocalDateTime fechaCalculo;

    // Desglose de Costos de Instalación (BOS + Materiales)
    private double costoPanelesCop;
    private double costoInversorCop;
    private double costoBateriasCop;
    private double costoCableadoEstructuraCop;
    private double costoTotalInstalacionCop;
    private double tiempoRetornoAnios;

    // Getters y Setters
    public Integer getIdPrediccion() { return idPrediccion; }
    public void setIdPrediccion(Integer idPrediccion) { this.idPrediccion = idPrediccion; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public Integer getIdCasa() { return idCasa; }
    public void setIdCasa(Integer idCasa) { this.idCasa = idCasa; }

    public Integer getEmpresaId() { return empresaId; }
    public void setEmpresaId(Integer empresaId) { this.empresaId = empresaId; }

    public Integer getIdPanel() { return idPanel; }
    public void setIdPanel(Integer idPanel) { this.idPanel = idPanel; }

    public Integer getCantidadPaneles() { return cantidadPaneles; }
    public void setCantidadPaneles(Integer cantidadPaneles) { this.cantidadPaneles = cantidadPaneles; }

    public Integer getPanelesRecomendados() { return panelesRecomendados; }
    public void setPanelesRecomendados(Integer panelesRecomendados) { this.panelesRecomendados = panelesRecomendados; }

    public double getConsumoMensualKwh() { return consumoMensualKwh; }
    public void setConsumoMensualKwh(double consumoMensualKwh) { this.consumoMensualKwh = consumoMensualKwh; }

    public double getPorcentajeCoberturaConsumo() { return porcentajeCoberturaConsumo; }
    public void setPorcentajeCoberturaConsumo(double porcentajeCoberturaConsumo) { this.porcentajeCoberturaConsumo = porcentajeCoberturaConsumo; }

    public double getLatitud() { return latitud; }
    public void setLatitud(double latitud) { this.latitud = latitud; }

    public double getLongitud() { return longitud; }
    public void setLongitud(double longitud) { this.longitud = longitud; }

    public double getRadiacionDiariaKwh() { return radiacionDiariaKwh; }
    public void setRadiacionDiariaKwh(double radiacionDiariaKwh) { this.radiacionDiariaKwh = radiacionDiariaKwh; }

    public double getGeneracionEstimadaKwhMes() { return generacionEstimadaKwhMes; }
    public void setGeneracionEstimadaKwhMes(double generacionEstimadaKwhMes) { this.generacionEstimadaKwhMes = generacionEstimadaKwhMes; }

    public double getAhorroEstimadoCopMes() { return ahorroEstimadoCopMes; }
    public void setAhorroEstimadoCopMes(double ahorroEstimadoCopMes) { this.ahorroEstimadoCopMes = ahorroEstimadoCopMes; }

    public double getCo2EvitadoTonAnio() { return co2EvitadoTonAnio; }
    public void setCo2EvitadoTonAnio(double co2EvitadoTonAnio) { this.co2EvitadoTonAnio = co2EvitadoTonAnio; }

    public LocalDateTime getFechaCalculo() { return fechaCalculo; }
    public void setFechaCalculo(LocalDateTime fechaCalculo) { this.fechaCalculo = fechaCalculo; }

    public double getCostoPanelesCop() { return costoPanelesCop; }
    public void setCostoPanelesCop(double costoPanelesCop) { this.costoPanelesCop = costoPanelesCop; }

    public double getCostoInversorCop() { return costoInversorCop; }
    public void setCostoInversorCop(double costoInversorCop) { this.costoInversorCop = costoInversorCop; }

    public double getCostoBateriasCop() { return costoBateriasCop; }
    public void setCostoBateriasCop(double costoBateriasCop) { this.costoBateriasCop = costoBateriasCop; }

    public double getCostoCableadoEstructuraCop() { return costoCableadoEstructuraCop; }
    public void setCostoCableadoEstructuraCop(double costoCableadoEstructuraCop) { this.costoCableadoEstructuraCop = costoCableadoEstructuraCop; }

    public double getCostoTotalInstalacionCop() { return costoTotalInstalacionCop; }
    public void setCostoTotalInstalacionCop(double costoTotalInstalacionCop) { this.costoTotalInstalacionCop = costoTotalInstalacionCop; }

    public double getTiempoRetornoAnios() { return tiempoRetornoAnios; }
    public void setTiempoRetornoAnios(double tiempoRetornoAnios) { this.tiempoRetornoAnios = tiempoRetornoAnios; }
}