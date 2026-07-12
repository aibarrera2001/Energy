package sistemapanelessolares.validadores;

import sistemapanelessolares.dominio.Administrativo;

public class validadorAdministrativo {

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
        // 1. Validar campos de Persona y contacto heredados/asociados
        validadorUsuario.validarNombre(admin.getNombre());
        validadorUsuario.validarApellido(admin.getApellido());
        validadorUsuario.validarTelefono(admin.getTelefono());

        // 2. Validar nuevos campos obligatorios (Correo y Contraseña)
        validadorUsuario.validarCorreo(admin.getCorreo());
        validadorUsuario.validarContrasena(admin.getContrasena());

        // 3. Validar campos específicos de Administrativo
        validarRol(admin.getRol());
        validarCodigo(admin.getCodigo());

        return true;
    }
}