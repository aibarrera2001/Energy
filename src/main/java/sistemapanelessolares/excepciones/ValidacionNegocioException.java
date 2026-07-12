package sistemapanelessolares.excepciones;

/** Se violó una regla de negocio (dato inválido, duplicado, estado no permitido, etc.). */
public class ValidacionNegocioException extends SistemaSolarException {
    public ValidacionNegocioException(String mensaje) {
        super(mensaje);
    }
}