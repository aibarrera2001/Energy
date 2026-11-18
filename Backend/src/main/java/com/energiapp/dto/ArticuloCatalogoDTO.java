package com.energiapp.dto;

public class ArticuloCatalogoDTO {
    private int idArticulo;
    private String nombre;
    private String categoria;
    private double consumoKwhMes;

    // Getters y Setters
    public int getIdArticulo() { return idArticulo; }
    public void setIdArticulo(int idArticulo) { this.idArticulo = idArticulo; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public double getConsumoKwhMes() { return consumoKwhMes; }
    public void setConsumoKwhMes(double consumoKwhMes) { this.consumoKwhMes = consumoKwhMes; }
}