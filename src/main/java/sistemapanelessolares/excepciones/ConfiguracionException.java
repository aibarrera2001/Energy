package sistemapanelessolares.excepciones;

/** Falta o es inválida una configuración requerida (variable de entorno, clave de API, etc.). */
public class ConfiguracionException extends SistemaSolarException {
    public ConfiguracionException(String mensaje) {
        super(mensaje);
    }
}