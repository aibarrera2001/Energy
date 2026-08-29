package sistemapanelessolares.excepciones;

/** Error al leer o escribir en la base de datos (o cualquier almacenamiento). */
public class PersistenciaException extends SistemaSolarException {
    public PersistenciaException(String mensaje) {
        super(mensaje);
    }

    public PersistenciaException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}