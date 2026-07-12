package sistemapanelessolares.dominio;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

/**
 * Representa una cita/visita técnica agendada por un usuario:
 * instalación de paneles, mantenimiento, inspección o cotización en sitio.
 */
public class Cita {

    private int idCita;
    private Usuario usuario;
    private Casa casa;
    private PanelSolar panelSolar;       // Puede ser null si aún no hay panel elegido (ej. inspección)
    private LocalDate fecha;
    private LocalTime hora;
    private String tipoServicio;         // "INSTALACION" | "MANTENIMIENTO" | "INSPECCION" | "COTIZACION"
    private String estado;               // "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "COMPLETADA" | "REPROGRAMADA"
    private String direccionVisita;
    private String notas;
    private String tecnicoAsignado;
    private String motivoCancelacion;
    private final LocalDateTime fechaCreacion;

    // CONSTRUCTOR 1 (Sin ID): para agendar una nueva cita
    public Cita(Usuario usuario, Casa casa, PanelSolar panelSolar, LocalDate fecha,
                LocalTime hora, String tipoServicio, String notas) {
        this.usuario = usuario;
        this.casa = casa;
        this.panelSolar = panelSolar;
        this.fecha = fecha;
        this.hora = hora;
        this.tipoServicio = tipoServicio;
        this.notas = notas;
        this.estado = "PENDIENTE";
        this.direccionVisita = (casa != null) ? casa.getDireccion() : null;
        this.fechaCreacion = LocalDateTime.now();
    }

    // CONSTRUCTOR 2 (Con ID): para reconstruir la cita desde la base de datos
    public Cita(int idCita, Usuario usuario, Casa casa, PanelSolar panelSolar, LocalDate fecha,
                LocalTime hora, String tipoServicio, String estado, String direccionVisita,
                String notas, String tecnicoAsignado, LocalDateTime fechaCreacion) {
        this.idCita = idCita;
        this.usuario = usuario;
        this.casa = casa;
        this.panelSolar = panelSolar;
        this.fecha = fecha;
        this.hora = hora;
        this.tipoServicio = tipoServicio;
        this.estado = estado;
        this.direccionVisita = direccionVisita;
        this.notas = notas;
        this.tecnicoAsignado = tecnicoAsignado;
        this.fechaCreacion = (fechaCreacion != null) ? fechaCreacion : LocalDateTime.now();
    }

    // ----------------------------------------------------------------
    //  Acciones sobre el ciclo de vida de la cita
    // ----------------------------------------------------------------

    public void confirmar(String tecnicoAsignado) {
        this.estado = "CONFIRMADA";
        this.tecnicoAsignado = tecnicoAsignado;
    }

    public void cancelar(String motivo) {
        this.estado = "CANCELADA";
        this.motivoCancelacion = motivo;
    }

    public void completar() {
        this.estado = "COMPLETADA";
    }

    public void reprogramar(LocalDate nuevaFecha, LocalTime nuevaHora) {
        this.fecha = nuevaFecha;
        this.hora = nuevaHora;
        this.estado = "REPROGRAMADA";
    }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getIdCita() { return idCita; }
    public void setIdCita(int idCita) { this.idCita = idCita; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Casa getCasa() { return casa; }
    public void setCasa(Casa casa) { this.casa = casa; }

    public PanelSolar getPanelSolar() { return panelSolar; }
    public void setPanelSolar(PanelSolar panelSolar) { this.panelSolar = panelSolar; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public LocalTime getHora() { return hora; }
    public void setHora(LocalTime hora) { this.hora = hora; }

    public String getTipoServicio() { return tipoServicio; }
    public void setTipoServicio(String tipoServicio) { this.tipoServicio = tipoServicio; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

    public String getDireccionVisita() { return direccionVisita; }
    public void setDireccionVisita(String direccionVisita) { this.direccionVisita = direccionVisita; }

    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }

    public String getTecnicoAsignado() { return tecnicoAsignado; }
    public void setTecnicoAsignado(String tecnicoAsignado) { this.tecnicoAsignado = tecnicoAsignado; }

    public String getMotivoCancelacion() { return motivoCancelacion; }
    public void setMotivoCancelacion(String motivoCancelacion) { this.motivoCancelacion = motivoCancelacion; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }

    @Override
    public String toString() {
        return "Cita{" +
                "id=" + idCita +
                ", usuario='" + (usuario != null ? usuario.getNombre() : "N/A") + '\'' +
                ", tipoServicio='" + tipoServicio + '\'' +
                ", fecha=" + fecha +
                ", hora=" + hora +
                ", estado='" + estado + '\'' +
                ", direccion='" + direccionVisita + '\'' +
                ", tecnico='" + tecnicoAsignado + '\'' +
                '}';
    }
}