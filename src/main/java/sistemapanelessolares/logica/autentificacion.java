package sistemapanelessolares.logica;

import sistemapanelessolares.dao.UsuarioDAO;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.excepciones.AutenticacionException;

/**
 * Verifica credenciales de un Usuario contra la base de datos.
 *
 * Ya NO lee de consola (antes usaba Scanner + System.in/System.out): eso es
 * responsabilidad de la vista. La vista recolecta correo/contraseña y llama
 * a iniciarSesion(correo, contrasena); si fallan, se lanza AutenticacionException
 * en vez de imprimir un mensaje y devolver null.
 */
public class autentificacion {

    private final UsuarioDAO usuarioDAO;

    public autentificacion() {
        this.usuarioDAO = new UsuarioDAO();
    }

    /**
     * @throws AutenticacionException si el correo no existe o la contraseña no coincide
     */
    public Usuario iniciarSesion(String correo, String contrasena) {
        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);
        if (usuario == null || !usuario.getContrasena().equals(contrasena)) {
            throw new AutenticacionException("Correo o contraseña incorrectos.");
        }
        return usuario;
    }
}