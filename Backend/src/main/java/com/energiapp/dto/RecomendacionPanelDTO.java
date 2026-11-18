package com.energiapp.dto;

public class RecomendacionPanelDTO {
    private int idPanel;
    private String nombrePanel;
    private String tipo;
    private double potenciaW;
    private double eficiencia;
    private String garantiaAnios;
    private String descripcion;

    // Resultados calculados por el motor de recomendación
    private int cantidadPaneles;
    private double potenciaTotalKw;
    private double generacionMensualKwh;
    private double porcentajeCobertura;
    private double inversionEstimada;
    private boolean recomendado;

    public int getIdPanel() { return idPanel; }
    public void setIdPanel(int idPanel) { this.idPanel = idPanel; }
    public String getNombrePanel() { return nombrePanel; }
    public void setNombrePanel(String nombrePanel) { this.nombrePanel = nombrePanel; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public double getPotenciaW() { return potenciaW; }
    public void setPotenciaW(double potenciaW) { this.potenciaW = potenciaW; }
    public double getEficiencia() { return eficiencia; }
    public void setEficiencia(double eficiencia) { this.eficiencia = eficiencia; }
    public String getGarantiaAnios() { return garantiaAnios; }
    public void setGarantiaAnios(String garantiaAnios) { this.garantiaAnios = garantiaAnios; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public int getCantidadPaneles() { return cantidadPaneles; }
    public void setCantidadPaneles(int cantidadPaneles) { this.cantidadPaneles = cantidadPaneles; }
    public double getPotenciaTotalKw() { return potenciaTotalKw; }
    public void setPotenciaTotalKw(double potenciaTotalKw) { this.potenciaTotalKw = potenciaTotalKw; }
    public double getGeneracionMensualKwh() { return generacionMensualKwh; }
    public void setGeneracionMensualKwh(double generacionMensualKwh) { this.generacionMensualKwh = generacionMensualKwh; }
    public double getPorcentajeCobertura() { return porcentajeCobertura; }
    public void setPorcentajeCobertura(double porcentajeCobertura) { this.porcentajeCobertura = porcentajeCobertura; }
    public double getInversionEstimada() { return inversionEstimada; }
    public void setInversionEstimada(double inversionEstimada) { this.inversionEstimada = inversionEstimada; }
    public boolean isRecomendado() { return recomendado; }
    public void setRecomendado(boolean recomendado) { this.recomendado = recomendado; }
}