package sistemapanelessolares.dto;

/**
 * DTO para respuestas JSON de la API
 */
public class RespuestaDTO {
    private boolean exito;
    private String mensaje;
    private Object datos;

    public RespuestaDTO() {
    }

    public RespuestaDTO(boolean exito, String mensaje) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.datos = null;
    }

    public RespuestaDTO(boolean exito, String mensaje, Object datos) {
        this.exito = exito;
        this.mensaje = mensaje;
        this.datos = datos;
    }

    public boolean isExito() {
        return exito;
    }

    public void setExito(boolean exito) {
        this.exito = exito;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public Object getDatos() {
        return datos;
    }

    public void setDatos(Object datos) {
        this.datos = datos;
    }
}
