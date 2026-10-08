package com.energiapp.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class CitaDTO {
    private Integer idCita;
    private Integer empresaId;
    private Integer idUsuario;
    private Integer idCasa;
    private String tipoServicio; // 'INSTALACION' | 'MANTENIMIENTO' | 'ARREGLO'
    private Integer idFactura;
    private String articuloDanado; // 'PANEL' | 'CABLE' | 'INVERSOR' | 'BATERIA'
    private String descripcionDanio;
    private LocalDate fecha;
    private LocalTime hora;
    private String estado; // 'PENDIENTE' | 'EN_PROCESO' | 'FINALIZADA' | 'CANCELADA'
    private String tecnicoAsignado;
    private String notas;
    private LocalDateTime fechaCreacion;

    // Datos relacionales complementarios para vista del Administrador
    private String nombreCliente;
    private String telefonoCliente;
    private String direccionCasa;
    private String tipoPropiedad;

    // Getters y Setters
    public Integer getIdCita() { return idCita; }
    public void setIdCita(Integer idCita) { this.idCita = idCita; }

    public Integer getEmpresaId() { return empresaId; }
    public void setEmpresaId(Integer empresaId) { this.empresaId = empresaId; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public Integer getIdCasa() { return idCasa; }
    public void setIdCasa(Integer idCasa) { this.idCasa = idCasa; }

    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }

    public Integer getIdFactura() { return idFactura; }
    public void setIdFactura(Integer idFactura) { this.idFactura = idFactura; }

    public String getArticuloDanado() { return articuloDanado; }
    public void setArticuloDanado(String articuloDanado) { this.articuloDanado = articuloDanado; }

    public String getDescripcionDanio() { return descripcionDanio; }
    public void setDescripcionDanio(String descripcionDanio) { this.descripcionDanio = descripcionDanio; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(String tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public String getNombreCliente() { return nombreCliente; }
    public void setNombreCliente(String nombreCliente) { this.nombreCliente = nombreCliente; }

    public String getTelefonoCliente() { return telefonoCliente; }
    public void setTelefonoCliente(String telefonoCliente) { this.telefonoCliente = telefonoCliente; }

    public String getDireccionCasa() { return direccionCasa; }
    public void setDireccionCasa(String direccionCasa) { this.direccionCasa = direccionCasa; }

    public String getTipoPropiedad() { return tipoPropiedad; }
    public void setTipoPropiedad(String tipoPropiedad) { this.tipoPropiedad = tipoPropiedad; }
}