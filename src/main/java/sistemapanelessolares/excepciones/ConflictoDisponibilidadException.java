package sistemapanelessolares.excepciones;
/** Conflicto de disponibilidad, p. ej. un horario de cita ya ocupado. */
public class ConflictoDisponibilidadException extends SistemaSolarException {
    public ConflictoDisponibilidadException(String mensaje) {
        super(mensaje);
    }
}