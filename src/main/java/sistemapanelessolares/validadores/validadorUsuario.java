package sistemapanelessolares.validadores;

import java.util.regex.Pattern;

public class validadorUsuario { // Cambiado a Mayúscula (Convención Java)

    // Expresión regular estándar y robusta para correos electrónicos reales
    private static final String EMAIL_PATTERN = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$";
    
    // Expresión regular para permitir solo letras y espacios (evita números o símbolos en nombres)
    private static final String SOLO_LETRAS = "^[A-Za-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$";

    // Ocultamos el constructor porque es una clase de utilidades (métodos estáticos)
    private validadorUsuario() {
        throw new IllegalStateException("Clase de utilidad - No instanciar");
    }

    public static void validarNombre(String nombre) throws IllegalArgumentException {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío.");
        }
        if (!nombre.matches(SOLO_LETRAS)) {
            throw new IllegalArgumentException("El nombre solo puede contener letras y espacios.");
        }
    }

    public static void validarApellido(String apellido) throws IllegalArgumentException {
        if (apellido == null || apellido.trim().isEmpty()) {
            throw new IllegalArgumentException("El apellido no puede estar vacío.");
        }
        if (!apellido.matches(SOLO_LETRAS)) {
            throw new IllegalArgumentException("El apellido solo puede contener letras y espacios.");
        }
    }

    public static void validarTelefono(String telefono) throws IllegalArgumentException {
        if (telefono == null || telefono.trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono no puede estar vacío.");
        }
        // Valida que tenga entre 7 y 15 dígitos (estándar telefónico)
        if (!telefono.matches("\\d{7,15}")) {
            throw new IllegalArgumentException("El teléfono debe contener entre 7 y 15 dígitos numéricos.");
        }
    }

    public static void validarCorreo(String correo) throws IllegalArgumentException {
        if (correo == null || correo.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo electrónico no puede estar vacío.");
        }
        if (!Pattern.matches(EMAIL_PATTERN, correo.trim())) {
            throw new IllegalArgumentException("El formato del correo electrónico es inválido (ejemplo: usuario@dominio.com).");
        }
    }

    public static void validarContrasena(String contrasena) throws IllegalArgumentException {
        if (contrasena == null || contrasena.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
        }
        if (contrasena.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede componerse solo de espacios en blanco.");
        }
    }
}