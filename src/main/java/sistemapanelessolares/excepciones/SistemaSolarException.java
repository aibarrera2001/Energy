package sistemapanelessolares.excepciones;

/**
 * Excepción base de todo el sistema EnergiApp. No se usa directamente:
 * cada capa lanza una de sus subclases específicas (ver este mismo paquete).
 * Es unchecked (extiende RuntimeException) para no ensuciar las firmas de
 * los métodos de logica con "throws" en cadena.
 */
public class SistemaSolarException extends RuntimeException {
    public SistemaSolarException(String mensaje) {
        super(mensaje);
    }

    public SistemaSolarException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}