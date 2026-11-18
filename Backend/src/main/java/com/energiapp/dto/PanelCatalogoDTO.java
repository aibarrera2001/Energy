package com.energiapp.dto;

public class PanelCatalogoDTO {
    private int id;
    private int empresaId;
    private String nombre;
    private String tipo;
    private double potenciaW;
    private double eficiencia;
    private double precio;
    private double costoInstalacion;
    private String garantiaAnios;
    private String descripcion;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getEmpresaId() { return empresaId; }
    public void setEmpresaId(int empresaId) { this.empresaId = empresaId; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public double getPotenciaW() { return potenciaW; }
    public void setPotenciaW(double potenciaW) { this.potenciaW = potenciaW; }

    public double getEficiencia() { return eficiencia; }
    public void setEficiencia(double eficiencia) { this.eficiencia = eficiencia; }

    public double getPrecio() { return precio; }
    public void setPrecio(double precio) { this.precio = precio; }

    public double getCostoInstalacion() { return costoInstalacion; }
    public void setCostoInstalacion(double costoInstalacion) { this.costoInstalacion = costoInstalacion; }

    public String getGarantiaAnios() { return garantiaAnios; }
    public void setGarantiaAnios(String garantiaAnios) { this.garantiaAnios = garantiaAnios; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}