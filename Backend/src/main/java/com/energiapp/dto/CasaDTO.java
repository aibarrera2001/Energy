package com.energiapp.dto;

public class CasaDTO {

    private Integer idCasa;
    private Integer idUsuario;
    private String tipoPropiedad; // CASA | APARTAMENTO | EDIFICIO | FINCA
    private String direccion;
    private String ciudad;
    private double latitud;
    private double longitud;

    // Métricas de superficie (m2)
    private Double areaTerrazaTechoM2; // Para Casa y Apartamento
    private Double areaBalconM2;       // Para Edificio
    private Double areaDisponibleM2;   // Para Finca

    private double consumoMensual;
    private String imagenUbicacionUrl;
    private String modelo3dUrl;

    // Constructores
    public CasaDTO() {}

    // Getters y Setters
    public Integer getIdCasa() { return idCasa; }
    public void setIdCasa(Integer idCasa) { this.idCasa = idCasa; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getTipoPropiedad() { return tipoPropiedad; }
    public void setTipoPropiedad(String tipoPropiedad) { this.tipoPropiedad = tipoPropiedad; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

    public double getLatitud() { return latitud; }
    public void setLatitud(double latitud) { this.latitud = latitud; }

    public double getLongitud() { return longitud; }
    public void setLongitud(double longitud) { this.longitud = longitud; }

    public Double getAreaTerrazaTechoM2() { return areaTerrazaTechoM2; }
    public void setAreaTerrazaTechoM2(Double areaTerrazaTechoM2) { this.areaTerrazaTechoM2 = areaTerrazaTechoM2; }

    public Double getAreaBalconM2() { return areaBalconM2; }
    public void setAreaBalconM2(Double areaBalconM2) { this.areaBalconM2 = areaBalconM2; }

    public Double getAreaDisponibleM2() { return areaDisponibleM2; }
    public void setAreaDisponibleM2(Double areaDisponibleM2) { this.areaDisponibleM2 = areaDisponibleM2; }

    public double getConsumoMensual() { return consumoMensual; }
    public void setConsumoMensual(double consumoMensual) { this.consumoMensual = consumoMensual; }

    public String getImagenUbicacionUrl() { return imagenUbicacionUrl; }
    public void setImagenUbicacionUrl(String imagenUbicacionUrl) { this.imagenUbicacionUrl = imagenUbicacionUrl; }

    public String getModelo3dUrl() { return modelo3dUrl; }
    public void setModelo3dUrl(String modelo3dUrl) { this.modelo3dUrl = modelo3dUrl; }
}