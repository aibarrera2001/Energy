package sistemapanelessolares.logica;

import sistemapanelessolares.dao.UsuarioDAO;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.excepciones.ValidacionNegocioException;
import sistemapanelessolares.excepciones.AutenticacionException;
import sistemapanelessolares.utils.EncriptadorContrasena;

public class AutenticacionUsuarioService {

    private UsuarioDAO usuarioDAO;

    public AutenticacionUsuarioService() {
        this.usuarioDAO = new UsuarioDAO();
    }

    /**
     * Registra un nuevo usuario con validaciones
     */
    public int registrarUsuario(Usuario usuario) throws ValidacionNegocioException {
        // Validaciones
        validarDatos(usuario);
        validarContrasena(usuario.getContrasena());
        validarCorreoUnico(usuario.getCorreo());

        // Encriptar contraseña antes de guardar
        String contrasenaEncriptada = EncriptadorContrasena.encriptar(usuario.getContrasena());
        usuario.setContrasena(contrasenaEncriptada);

        // Guardar usuario
        int usuarioId = usuarioDAO.guardar(usuario);

        if (usuarioId == 0) {
            throw new ValidacionNegocioException("No se pudo registrar el usuario. Intente de nuevo.");
        }

        return usuarioId;
    }

    /**
     * Autentica un usuario (login)
     */
    public Usuario autenticar(String correo, String contrasena) throws AutenticacionException {
        if (correo == null || correo.isEmpty()) {
            throw new AutenticacionException("El correo es obligatorio.");
        }

        if (contrasena == null || contrasena.isEmpty()) {
            throw new AutenticacionException("La contraseña es obligatoria.");
        }

        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);

        if (usuario == null) {
            throw new AutenticacionException("Usuario no encontrado.");
        }

        // Verificar contraseña usando BCrypt
        if (!EncriptadorContrasena.verificar(contrasena, usuario.getContrasena())) {
            throw new AutenticacionException("Contraseña incorrecta.");
        }

        if (!"ACTIVO".equals(usuario.getEstado())) {
            throw new AutenticacionException("El usuario no está activo.");
        }

        // Actualizar último login
        usuarioDAO.actualizarUltimoLogin(usuario.getIdUsuario());

        return usuario;
    }

    /**
     * Valida los datos básicos del usuario
     */
    private void validarDatos(Usuario usuario) throws ValidacionNegocioException {
        if (usuario.getNombre() == null || usuario.getNombre().trim().isEmpty()) {
            throw new ValidacionNegocioException("El nombre es obligatorio.");
        }

        if (usuario.getApellido() == null || usuario.getApellido().trim().isEmpty()) {
            throw new ValidacionNegocioException("El apellido es obligatorio.");
        }

        if (usuario.getCorreo() == null || usuario.getCorreo().trim().isEmpty()) {
            throw new ValidacionNegocioException("El correo es obligatorio.");
        }

        if (!usuario.getCorreo().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ValidacionNegocioException("El formato del correo no es válido.");
        }

        if (usuario.getCiudad() == null || usuario.getCiudad().trim().isEmpty()) {
            throw new ValidacionNegocioException("La ciudad es obligatoria.");
        }
    }

    /**
     * Valida los requisitos de contraseña
     */
    private void validarContrasena(String contrasena) throws ValidacionNegocioException {
        if (contrasena == null || contrasena.trim().isEmpty()) {
            throw new ValidacionNegocioException("La contraseña es obligatoria.");
        }

        if (contrasena.length() < 8) {
            throw new ValidacionNegocioException("La contraseña debe tener mínimo 8 caracteres.");
        }

        if (!contrasena.matches(".*[A-Z].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos una letra mayúscula.");
        }

        if (!contrasena.matches(".*[a-z].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos una letra minúscula.");
        }

        if (!contrasena.matches(".*[0-9].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos un número.");
        }
    }

    /**
     * Verifica que el correo sea único
     */
    private void validarCorreoUnico(String correo) throws ValidacionNegocioException {
        if (usuarioDAO.existeCorreo(correo)) {
            throw new ValidacionNegocioException("El correo ya está registrado.");
        }
    }
}
