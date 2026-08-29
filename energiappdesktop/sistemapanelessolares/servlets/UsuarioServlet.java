package sistemapanelessolares.servlets;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.dto.LoginRequestDTO;
import sistemapanelessolares.dto.RegistroRequestDTO;
import sistemapanelessolares.dto.RespuestaDTO;
import sistemapanelessolares.excepciones.AutenticacionException;
import sistemapanelessolares.excepciones.ValidacionNegocioException;
import sistemapanelessolares.logica.AutenticacionUsuarioService;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet para manejar registro e login de usuarios
 * Endpoints:
 * - POST /api/usuarios/registrar
 * - POST /api/usuarios/login
 * - GET /api/usuarios/logout
 */
@WebServlet(name = "UsuarioServlet", urlPatterns = {"/api/usuarios/registrar", "/api/usuarios/login", "/api/usuarios/logout"})
public class UsuarioServlet extends HttpServlet {

    private AutenticacionUsuarioService autenticacionService;
    private Gson gson;

    @Override
    public void init() throws ServletException {
        super.init();
        autenticacionService = new AutenticacionUsuarioService();
        gson = new Gson();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String path = request.getRequestURI();

        try {
            if (path.endsWith("/registrar")) {
                manejarRegistro(request, response);
            } else if (path.endsWith("/login")) {
                manejarLogin(request, response);
            } else {
                enviarError(response, "Endpoint no encontrado", 404);
            }
        } catch (Exception e) {
            System.err.println("Error en UsuarioServlet: " + e.getMessage());
            e.printStackTrace();
            enviarError(response, "Error interno del servidor", 500);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        String path = request.getRequestURI();

        if (path.endsWith("/logout")) {
            manejarLogout(request, response);
        } else {
            enviarError(response, "Endpoint no encontrado", 404);
        }
    }

    /**
     * Maneja el registro de nuevos usuarios
     */
    private void manejarRegistro(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            // Leer JSON del cuerpo de la solicitud
            String json = leerJsonDelRequest(request);
            RegistroRequestDTO registroDTO = gson.fromJson(json, RegistroRequestDTO.class);

            // Validar que los datos no sean nulos
            if (registroDTO.getNombre() == null || registroDTO.getCorreo() == null || 
                registroDTO.getContrasena() == null || registroDTO.getCiudad() == null) {
                enviarError(response, "Faltan campos obligatorios", 400);
                return;
            }

            // Crear objeto Usuario mediante setters
            Usuario usuario = new Usuario();
            usuario.setNombre(registroDTO.getNombre());
            usuario.setApellido(registroDTO.getApellido());
            usuario.setCorreo(registroDTO.getCorreo());
            usuario.setTelefono(registroDTO.getTelefono());
            usuario.setContrasena(registroDTO.getContrasena());
            usuario.setCiudad(registroDTO.getCiudad());
            usuario.setEstado("ACTIVO");

            // Registrar usuario
            int usuarioId = autenticacionService.registrarUsuario(usuario);

            RespuestaDTO respuesta = new RespuestaDTO(
                    true,
                    "Usuario registrado exitosamente",
                    usuarioId
            );

            enviarRespuesta(response, respuesta, 201);

        } catch (ValidacionNegocioException e) {
            enviarError(response, e.getMessage(), 400);
        } catch (Exception e) {
            System.err.println("Error al registrar usuario: " + e.getMessage());
            enviarError(response, "Error al registrar usuario", 500);
        }
    }

    /**
     * Maneja el login de usuarios
     */
    private void manejarLogin(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            // Leer JSON del cuerpo de la solicitud
            String json = leerJsonDelRequest(request);
            LoginRequestDTO loginDTO = gson.fromJson(json, LoginRequestDTO.class);

            if (loginDTO.getCorreo() == null || loginDTO.getContrasena() == null) {
                enviarError(response, "Correo y contraseña son obligatorios", 400);
                return;
            }

            // Autenticar usuario
            Usuario usuario = autenticacionService.autenticar(
                    loginDTO.getCorreo(),
                    loginDTO.getContrasena()
            );

            // Guardar en sesión
            HttpSession sesion = request.getSession(true);
            sesion.setAttribute("usuarioId", usuario.getIdUsuario());
            sesion.setAttribute("usuarioCorreo", usuario.getCorreo());
            sesion.setAttribute("usuarioNombre", usuario.getNombre());
            sesion.setAttribute("usuarioApellido", usuario.getApellido());

            RespuestaDTO respuesta = new RespuestaDTO(
                    true,
                    "Login exitoso",
                    new Object() {
                        public final int id = usuario.getIdUsuario();
                        public final String nombre = usuario.getNombre();
                        public final String apellido = usuario.getApellido();
                        public final String correo = usuario.getCorreo();
                        public final String ciudad = usuario.getCiudad();
                    }
            );

            enviarRespuesta(response, respuesta, 200);

        } catch (AutenticacionException e) {
            enviarError(response, e.getMessage(), 401);
        } catch (Exception e) {
            System.err.println("Error al hacer login: " + e.getMessage());
            enviarError(response, "Error al hacer login", 500);
        }
    }

    /**
     * Maneja el logout de usuarios
     */
    private void manejarLogout(HttpServletRequest request, HttpServletResponse response) 
            throws IOException {
        
        try {
            HttpSession sesion = request.getSession(false);
            if (sesion != null) {
                sesion.invalidate();
            }

            RespuestaDTO respuesta = new RespuestaDTO(true, "Sesión cerrada exitosamente");
            enviarRespuesta(response, respuesta, 200);

        } catch (Exception e) {
            System.err.println("Error al cerrar sesión: " + e.getMessage());
            enviarError(response, "Error al cerrar sesión", 500);
        }
    }

    /**
     * Lee el JSON del cuerpo de la solicitud
     */
    private String leerJsonDelRequest(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        String linea;
        
        try (BufferedReader reader = request.getReader()) {
            while ((linea = reader.readLine()) != null) {
                sb.append(linea);
            }
        }
        
        return sb.toString();
    }

    /**
     * Envía una respuesta JSON exitosa
     */
    private void enviarRespuesta(HttpServletResponse response, RespuestaDTO respuesta, int statusCode) 
            throws IOException {
        
        response.setStatus(statusCode);
        PrintWriter writer = response.getWriter();
        writer.print(gson.toJson(respuesta));
        writer.flush();
    }

    /**
     * Envía una respuesta de error en JSON
     */
    private void enviarError(HttpServletResponse response, String mensaje, int statusCode) 
            throws IOException {
        
        response.setStatus(statusCode);
        RespuestaDTO respuesta = new RespuestaDTO(false, mensaje);
        PrintWriter writer = response.getWriter();
        writer.print(gson.toJson(respuesta));
        writer.flush();
    }
}
