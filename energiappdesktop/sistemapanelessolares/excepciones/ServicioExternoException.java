package sistemapanelessolares.excepciones;

/** Error al comunicarse con un servicio externo (p. ej. la API del chat de IA). */
public class ServicioExternoException extends SistemaSolarException {
    public ServicioExternoException(String mensaje) {
        super(mensaje);
    }

    public ServicioExternoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
    }
}