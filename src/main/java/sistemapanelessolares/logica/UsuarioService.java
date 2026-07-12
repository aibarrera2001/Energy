package sistemapanelessolares.logica;

import sistemapanelessolares.dao.UsuarioDAO;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.excepciones.AutenticacionException;
import sistemapanelessolares.excepciones.PersistenciaException;
import sistemapanelessolares.excepciones.RecursoNoEncontradoException;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class UsuarioService {

    private final UsuarioDAO usuarioDAO;

    public UsuarioService() {
        this.usuarioDAO = new UsuarioDAO();
    }

    /**
     * @throws ValidacionNegocioException si ya existe un usuario con ese correo
     * @throws PersistenciaException si la base de datos no confirma el guardado
     */
    public Usuario registrar(Usuario usuario) {
        if (usuarioDAO.buscarPorCorreo(usuario.getCorreo()) != null) {
            throw new ValidacionNegocioException("Ya existe un usuario con el correo: " + usuario.getCorreo());
        }
        usuarioDAO.guardar(usuario);
        if (usuario.getIdUsuario() == 0) {
            throw new PersistenciaException("No se pudo guardar el usuario en la base de datos.");
        }
        return usuario;
    }

    /**
     * @throws AutenticacionException si el correo no existe o la contraseña no coincide
     */
    public Usuario autenticar(String correo, String contrasena) {
        Usuario usuario = usuarioDAO.buscarPorCorreo(correo);
        if (usuario == null || !usuario.getContrasena().equals(contrasena)) {
            throw new AutenticacionException("Correo o contraseña incorrectos.");
        }
        return usuario;
    }

    /**
     * @throws RecursoNoEncontradoException si no existe un usuario con ese id
     */
    public Usuario buscarPorId(int id) {
        Usuario usuario = usuarioDAO.buscarPorId(id);
        if (usuario == null) {
            throw new RecursoNoEncontradoException("No existe ningún usuario con id " + id + ".");
        }
        return usuario;
    }

    public boolean actualizar(Usuario usuario) {
        return usuarioDAO.actualizar(usuario);
    }
}