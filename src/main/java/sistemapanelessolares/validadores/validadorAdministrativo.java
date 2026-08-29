package sistemapanelessolares.validadores;

import sistemapanelessolares.dominio.Administrativo;

public class validadorAdministrativo {

    public static void validarNombre(String nombre) throws IllegalArgumentException {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new IllegalArgumentException("El nombre no puede estar vacío.");
        }
    }

    public static void validarApellido(String apellido) throws IllegalArgumentException {
        if (apellido == null || apellido.trim().isEmpty()) {
            throw new IllegalArgumentException("El apellido no puede estar vacío.");
        }
    }

    public static void validarTelefono(String telefono) throws IllegalArgumentException {
        if (telefono == null || telefono.trim().isEmpty()) {
            throw new IllegalArgumentException("El teléfono no puede estar vacío.");
        }
    }

    public static void validarCorreo(String correo) throws IllegalArgumentException {
        if (correo == null || correo.trim().isEmpty()) {
            throw new IllegalArgumentException("El correo no puede estar vacío.");
        }
        if (!correo.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("El correo electrónico es inválido.");
        }
    }

    public static void validarContrasena(String contrasena) throws IllegalArgumentException {
        if (contrasena == null || contrasena.trim().isEmpty()) {
            throw new IllegalArgumentException("La contraseña no puede estar vacía.");
        }
        if (contrasena.length() < 6) {
            throw new IllegalArgumentException("La contraseña debe tener al menos 6 caracteres.");
        }
    }

    public static void validarRol(String rol) throws IllegalArgumentException {
        if (rol == null || rol.trim().isEmpty()) {
            throw new IllegalArgumentException("El rol no puede estar vacío.");
        }
    }

    public static void validarCodigo(String codigo) throws IllegalArgumentException {
        if (codigo == null || codigo.trim().isEmpty()) {
            throw new IllegalArgumentException("El código no puede estar vacío.");
        }
    }

    public static boolean validarRegistro(Administrativo admin) throws IllegalArgumentException {
        validarNombre(admin.getNombre());
        validarApellido(admin.getApellido());
        validarTelefono(admin.getTelefono());
        validarCorreo(admin.getCorreo());
        validarContrasena(admin.getContrasena());
        validarRol(admin.getRol());
        validarCodigo(admin.getCodigo());

        return true;
    }
}