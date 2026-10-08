package com.energiapp.dto;

public class ReporteFinancieroDTO {
    private int mes;
    private int anio;
    private String tipoServicio;
    private int cantidadServicios;
    private double totalIngresos;

    public ReporteFinancieroDTO() {}

    public ReporteFinancieroDTO(int mes, int anio, String tipoServicio, int cantidadServicios, double totalIngresos) {
        this.mes = mes;
        this.anio = anio;
        this.tipoServicio = tipoServicio;
        this.cantidadServicios = cantidadServicios;
        this.totalIngresos = totalIngresos;
    }

    public int getMes() { return mes; }
    public void setMes(int mes) { this.mes = mes; }

    public int getAnio() { return anio; }
    public void setAnio(int anio) { this.anio = anio; }

    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }

    public int getCantidadServicios() { return cantidadServicios; }
    public void setCantidadServicios(int cantidadServicios) { this.cantidadServicios = cantidadServicios; }

    public double getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(double totalIngresos) { this.totalIngresos = totalIngresos; }
}