package com.energiapp.dto;

public class ClienteCasaDTO {
    private int idUsuario;
    private String nombreCliente;
    private String correoCliente;
    private String telefonoCliente;
    private int idCasa;
    private String tipoPropiedad;
    private String direccionCasa;
    private String ciudadCasa;
    private double consumoMensualKwh;

    // Getters y Setters
    public int getIdUsuario() { return idUsuario; }
    public void setIdUsuario(int idUsuario) { this.idUsuario = idUsuario; }
    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }
    public String getCorreoCliente() { return correoCliente; }
    public void setCorreoCliente(String correoCliente) { this.correoCliente = correoCliente; }
    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }
    public int getIdCasa() { return idCasa; }
    public void setIdCasa(int idCasa) { this.idCasa = idCasa; }
    public String getTipoPropiedad() { return tipoPropiedad; }
    public void setTipoPropiedad(String tipoPropiedad) { this.tipoPropiedad = tipoPropiedad; }
    public String getDireccionCasa() { return direccionCasa; }
    public void setDireccionCasa(String direccionCasa) { this.direccionCasa = direccionCasa; }
    public String getCiudadCasa() { return ciudadCasa; }
    public void setCiudadCasa(String ciudadCasa) { this.ciudadCasa = ciudadCasa; }
    public double getConsumoMensualKwh() { return consumoMensualKwh; }
    public void setConsumoMensualKwh(double consumoMensualKwh) { this.consumoMensualKwh = consumoMensualKwh; }
}