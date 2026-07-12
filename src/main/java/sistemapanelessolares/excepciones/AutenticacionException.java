package sistemapanelessolares.excepciones;

/** Credenciales inválidas o fallo al iniciar sesión. */
public class AutenticacionException extends SistemaSolarException {
    public AutenticacionException(String mensaje) {
        super(mensaje);
    }
}