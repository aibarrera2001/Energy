package com.energiapp.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class PrediccionRequestDTO {

    @NotNull(message = "El idUsuario es obligatorio")
    private Integer idUsuario;

    private Integer idCasa;
    private String tipoPropiedad;
    private String direccionCasa;
    private double latitudCasa;
    private double longitudCasa;
    private Integer empresaId;

    @NotNull(message = "El idPanel es obligatorio")
    private Integer idPanel;

    private int cantidadPaneles;

    @Positive(message = "El consumo mensual debe ser mayor a 0")
    private double consumoMensualKwh;

    private boolean incluyeBaterias;
    private int diasAutonomia;

    // Getters y Setters
    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public Integer getIdCasa() { return idCasa; }
    public void setIdCasa(Integer idCasa) { this.idCasa = idCasa; }

    public String getTipoPropiedad() { return tipoPropiedad; }
    public void setTipoPropiedad(String tipoPropiedad) { this.tipoPropiedad = tipoPropiedad; }

    public String getDireccionCasa() { return direccionCasa; }
    public void setDireccionCasa(String direccionCasa) { this.direccionCasa = direccionCasa; }

    public double getLatitudCasa() { return latitudCasa; }
    public void setLatitudCasa(double latitudCasa) { this.latitudCasa = latitudCasa; }

    public double getLongitudCasa() { return longitudCasa; }
    public void setLongitudCasa(double longitudCasa) { this.longitudCasa = longitudCasa; }

    public Integer getEmpresaId() { return empresaId; }
    public void setEmpresaId(Integer empresaId) { this.empresaId = empresaId; }

    public Integer getIdPanel() { return idPanel; }
    public void setIdPanel(Integer idPanel) { this.idPanel = idPanel; }

    public int getCantidadPaneles() { return cantidadPaneles; }
    public void setCantidadPaneles(int cantidadPaneles) { this.cantidadPaneles = cantidadPaneles; }

    public double getConsumoMensualKwh() { return consumoMensualKwh; }
    public void setConsumoMensualKwh(double consumoMensualKwh) { this.consumoMensualKwh = consumoMensualKwh; }

    public boolean isIncluyeBaterias() { return incluyeBaterias; }
    public void setIncluyeBaterias(boolean incluyeBaterias) { this.incluyeBaterias = incluyeBaterias; }

    public int getDiasAutonomia() { return diasAutonomia; }
    public void setDiasAutonomia(int diasAutonomia) { this.diasAutonomia = diasAutonomia; }
}