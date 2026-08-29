package sistemapanelessolares.logica;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import sistemapanelessolares.dao.CitaDAO;
import sistemapanelessolares.dominio.Cita;
import sistemapanelessolares.excepciones.ConflictoDisponibilidadException;
import sistemapanelessolares.excepciones.PersistenciaException;
import sistemapanelessolares.excepciones.RecursoNoEncontradoException;
import sistemapanelessolares.validadores.Validadorcita;

/**
 * Orquesta la agenda de citas: aplica las reglas de negocio (Validadorcita)
 * y persiste cada operación a través de CitaDAO. La base de datos es la
 * fuente de verdad; este gestor ya no mantiene una lista en memoria.
 */
public class GestorCitas {

    private final CitaDAO citaDAO;

    public GestorCitas() {
        this.citaDAO = new CitaDAO();
    }

    public GestorCitas(CitaDAO citaDAO) {
        this.citaDAO = citaDAO;
    }

    // ----------------------------------------------------------------
    //  Agendamiento
    // ----------------------------------------------------------------

    /**
     * @throws ConflictoDisponibilidadException si el horario ya está ocupado
     * @throws PersistenciaException si la base de datos no confirma el guardado
     */
    public Cita agendarCita(Cita cita) {
        Validadorcita.validarCita(cita);
        if (citaDAO.horarioOcupado(cita.getFecha(), cita.getHora())) {
            throw new ConflictoDisponibilidadException(
                "Ya existe una cita agendada para " + cita.getFecha() + " a las " + cita.getHora() + ".");
        }
        citaDAO.guardar(cita);
        if (cita.getIdCita() == 0) {
            throw new PersistenciaException("No se pudo guardar la cita en la base de datos.");
        }
        return cita;
    }

    public boolean horarioDisponible(LocalDate fecha, LocalTime hora) {
        return !citaDAO.horarioOcupado(fecha, hora);
    }

    // ----------------------------------------------------------------
    //  Cambios de estado
    // ----------------------------------------------------------------

    public Cita confirmarCita(int idCita, String tecnicoAsignado) {
        Cita cita = obtenerOFallar(idCita);
        cita.confirmar(tecnicoAsignado);
        citaDAO.actualizarEstado(cita);
        return cita;
    }

    public Cita cancelarCita(int idCita, String motivo) {
        Cita cita = obtenerOFallar(idCita);
        cita.cancelar(motivo);
        citaDAO.actualizarEstado(cita);
        return cita;
    }

    public Cita completarCita(int idCita) {
        Cita cita = obtenerOFallar(idCita);
        cita.completar();
        citaDAO.actualizarEstado(cita);
        return cita;
    }

    /**
     * @throws ConflictoDisponibilidadException si el nuevo horario ya está ocupado
     */
    public Cita reprogramarCita(int idCita, LocalDate nuevaFecha, LocalTime nuevaHora) {
        Cita cita = obtenerOFallar(idCita);
        if (citaDAO.horarioOcupado(nuevaFecha, nuevaHora)) {
            throw new ConflictoDisponibilidadException("El nuevo horario ya está ocupado.");
        }
        cita.reprogramar(nuevaFecha, nuevaHora);
        citaDAO.actualizarEstado(cita);
        return cita;
    }

    /**
     * @throws RecursoNoEncontradoException si no existe una cita con ese id
     */
    private Cita obtenerOFallar(int idCita) {
        Cita cita = citaDAO.buscarPorId(idCita);
        if (cita == null) {
            throw new RecursoNoEncontradoException("No existe ninguna cita con id " + idCita + ".");
        }
        return cita;
    }

    // ----------------------------------------------------------------
    //  Consultas
    // ----------------------------------------------------------------

    public Cita buscarPorId(int idCita) { return citaDAO.buscarPorId(idCita); }

    public List<Cita> listarTodas() { return citaDAO.listarTodas(); }

    public List<Cita> listarPorUsuario(int idUsuario) { return citaDAO.listarPorUsuario(idUsuario); }

    public List<Cita> listarPorFecha(LocalDate fecha) { return citaDAO.listarPorFecha(fecha); }

    public List<Cita> listarPendientes() { return citaDAO.listarPendientes(); }
}