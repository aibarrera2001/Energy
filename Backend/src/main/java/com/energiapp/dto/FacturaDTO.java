package com.energiapp.dto;

import java.time.LocalDateTime;

public class FacturaDTO {
    private Integer idFactura;
    private Integer idUsuario;
    private Integer idCasa;
    private Integer empresaId;
    
    // Nausar ti Double wrapper tapno ma-handle ti null safety
    private Double precioPaneles;
    private Double precioConversores;
    private Double precioBaterias;
    private Double precioCables;
    private Double costoInstalacionServicios;
    private Double montoTotal;
    
    private String estadoPago;
    private LocalDateTime fechaEmision;

    // Getters y Setters
    public Integer getIdFactura() { return idFactura; }
    public void setIdFactura(Integer idFactura) { this.idFactura = idFactura; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public Integer getIdCasa() { return idCasa; }
    public void setIdCasa(Integer idCasa) { this.idCasa = idCasa; }

    public Integer getEmpresaId() { return empresaId; }
    public void setEmpresaId(Integer empresaId) { this.empresaId = empresaId; }

    public Double getPrecioPaneles() { return precioPaneles; }
    public void setPrecioPaneles(Double precioPaneles) { this.precioPaneles = precioPaneles; }

    public Double getPrecioConversores() { return precioConversores; }
    public void setPrecioConversores(Double precioConversores) { this.precioConversores = precioConversores; }

    public Double getPrecioBaterias() { return precioBaterias; }
    public void setPrecioBaterias(Double precioBaterias) { this.precioBaterias = precioBaterias; }

    public Double getPrecioCables() { return precioCables; }
    public void setPrecioCables(Double precioCables) { this.precioCables = precioCables; }

    public Double getCostoInstalacionServicios() { return costoInstalacionServicios; }
    public void setCostoInstalacionServicios(Double costoInstalacionServicios) { this.costoInstalacionServicios = costoInstalacionServicios; }

    public Double getMontoTotal() { return montoTotal; }
    public void setMontoTotal(Double montoTotal) { this.montoTotal = montoTotal; }

    public String getEstadoPago() { return estadoPago; }
    public void setEstadoPago(String estadoPago) { this.estadoPago = estadoPago; }

    public LocalDateTime getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; }
}