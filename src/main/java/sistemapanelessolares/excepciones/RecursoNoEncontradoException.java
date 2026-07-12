package sistemapanelessolares.excepciones;

/** Un recurso esperado (usuario, casa, panel, cita, mantenimiento...) no existe. */
public class RecursoNoEncontradoException extends SistemaSolarException {
    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }
}