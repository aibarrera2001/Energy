package com.energiapp.dto;

public class PanelDTO {
    private double potenciaWatts;
    private double precio;
    private double costoInstalacion;

    public PanelDTO() {}

    public PanelDTO(double potenciaWatts, double precio, double costoInstalacion) {
        this.potenciaWatts = potenciaWatts;
        this.precio = precio;
        this.costoInstalacion = costoInstalacion;
    }

    public double getPotenciaWatts() { return potenciaWatts; }
    public void setPotenciaWatts(double potenciaWatts) { this.potenciaWatts = potenciaWatts; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public double getCostoInstalacion() { return costoInstalacion; }
    public void setCostoInstalacion(double costoInstalacion) { this.costoInstalacion = costoInstalacion; }
}