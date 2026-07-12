package sistemapanelessolares.dominio;

import java.time.LocalDate;

/**
 * Representa el mantenimiento (preventivo o correctivo) de los
 * paneles solares ya instalados en una propiedad.
 */
public class Mantenimiento {

    private int idMantenimiento;
    private Usuario usuario;
    private Casa casa;
    private String tipoMantenimiento;      // "PREVENTIVO" | "CORRECTIVO"
    private LocalDate fechaProgramada;
    private LocalDate fechaRealizada;      // null hasta que se ejecute
    private String estado;                 // "PROGRAMADO" | "EN_PROCESO" | "COMPLETADO" | "CANCELADO"
    private String descripcionTrabajo;
    private String tecnicoAsignado;
    private double costo;
    private String observaciones;
    private LocalDate fechaProximoMantenimiento;

    private static final int MESES_ENTRE_MANTENIMIENTOS = 6;

    // CONSTRUCTOR 1 (Sin ID): para programar un nuevo mantenimiento
    public Mantenimiento(Usuario usuario, Casa casa, String tipoMantenimiento,
                          LocalDate fechaProgramada, String descripcionTrabajo) {
        this.usuario = usuario;
        this.casa = casa;
        this.tipoMantenimiento = tipoMantenimiento;
        this.fechaProgramada = fechaProgramada;
        this.descripcionTrabajo = descripcionTrabajo;
        this.estado = "PROGRAMADO";
    }

    // CONSTRUCTOR 2 (Con ID): utilizado al recuperar desde la base de datos
    public Mantenimiento(int idMantenimiento, Usuario usuario, Casa casa, String tipoMantenimiento,
                          LocalDate fechaProgramada, LocalDate fechaRealizada, String estado,
                          String descripcionTrabajo, String tecnicoAsignado, double costo,
                          String observaciones) {
        this.idMantenimiento = idMantenimiento;
        this.usuario = usuario;
        this.casa = casa;
        this.tipoMantenimiento = tipoMantenimiento;
        this.fechaProgramada = fechaProgramada;
        this.fechaRealizada = fechaRealizada;
        this.estado = estado;
        this.descripcionTrabajo = descripcionTrabajo;
        this.tecnicoAsignado = tecnicoAsignado;
        this.costo = costo;
        this.observaciones = observaciones;
    }

    // ----------------------------------------------------------------
    //  Comportamiento
    // ----------------------------------------------------------------

    /** Marca el mantenimiento como completado y calcula la fecha sugerida del próximo. */
    public void marcarComoRealizado(String tecnicoAsignado, double costo, String observaciones) {
        this.estado = "COMPLETADO";
        this.fechaRealizada = LocalDate.now();
        this.tecnicoAsignado = tecnicoAsignado;
        this.costo = costo;
        this.observaciones = observaciones;
        this.fechaProximoMantenimiento = this.fechaRealizada.plusMonths(MESES_ENTRE_MANTENIMIENTOS);
    }

    public void cancelar(String motivo) {
        this.estado = "CANCELADO";
        this.observaciones = motivo;
    }

    public boolean estaVencido() {
        return estado.equals("PROGRAMADO") && fechaProgramada != null
                && fechaProgramada.isBefore(LocalDate.now());
    }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getIdMantenimiento() { return idMantenimiento; }
    public void setIdMantenimiento(int idMantenimiento) { this.idMantenimiento = idMantenimiento; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Casa getCasa() { return casa; }
    public void setCasa(Casa casa) { this.casa = casa; }

    public String getTipoMantenimiento() { return tipoMantenimiento; }
    public void setTipoMantenimiento(String tipoMantenimiento) { this.tipoMantenimiento = tipoMantenimiento; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public LocalDate getFechaRealizada() { return fechaRealizada; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDescripcionTrabajo() { return descripcionTrabajo; }
    public void setDescripcionTrabajo(String descripcionTrabajo) { this.descripcionTrabajo = descripcionTrabajo; }

    public String getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(String tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public double getCosto() { return costo; }
    public void setCosto(double costo) { this.costo = costo; }

    public String getObservaciones() { return observaciones; }
    public void setObservaciones(String observaciones) { this.observaciones = observaciones; }

    public LocalDate getFechaProximoMantenimiento() { return fechaProximoMantenimiento; }
    public void setFechaProximoMantenimiento(LocalDate fechaProximoMantenimiento) { this.fechaProximoMantenimiento = fechaProximoMantenimiento; }

    @Override
    public String toString() {
        return "Mantenimiento{" +
                "id=" + idMantenimiento +
                ", tipo='" + tipoMantenimiento + '\'' +
                ", programado=" + fechaProgramada +
                ", estado='" + estado + '\'' +
                ", casa=" + (casa != null ? casa.getDireccion() : "N/A") +
                ", proximoMantenimiento=" + fechaProximoMantenimiento +
                '}';
    }
}