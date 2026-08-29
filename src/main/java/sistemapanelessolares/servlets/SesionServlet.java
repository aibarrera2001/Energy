package sistemapanelessolares.servlets;

import com.google.gson.Gson;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import sistemapanelessolares.dto.RespuestaDTO;

import java.io.IOException;
import java.io.PrintWriter;

/**
 * Servlet para validar sesión y obtener información del usuario autenticado
 * Endpoints:
 * - GET /api/usuarios/verificar-sesion
 */
@WebServlet(name = "SesionServlet", urlPatterns = {"/api/usuarios/verificar-sesion"})
public class SesionServlet extends HttpServlet {

    private Gson gson;

    @Override
    public void init() throws ServletException {
        super.init();
        gson = new Gson();
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            HttpSession sesion = request.getSession(false);
            
            if (sesion != null && sesion.getAttribute("usuarioId") != null) {
                // Usuario autenticado
                Object usuarioData = new Object() {
                    public final int id = (int) sesion.getAttribute("usuarioId");
                    public final String correo = (String) sesion.getAttribute("usuarioCorreo");
                    public final String nombre = (String) sesion.getAttribute("usuarioNombre");
                    public final String apellido = (String) sesion.getAttribute("usuarioApellido");
                };

                RespuestaDTO respuesta = new RespuestaDTO(
                        true,
                        "Sesión válida",
                        usuarioData
                );
                enviarRespuesta(response, respuesta, 200);
            } else {
                // No hay sesión válida
                RespuestaDTO respuesta = new RespuestaDTO(false, "Sin sesión activa");
                enviarRespuesta(response, respuesta, 401);
            }

        } catch (Exception e) {
            System.err.println("Error al verificar sesión: " + e.getMessage());
            enviarError(response, "Error al verificar sesión", 500);
        }
    }

    private void enviarRespuesta(HttpServletResponse response, RespuestaDTO respuesta, int statusCode) 
            throws IOException {
        
        response.setStatus(statusCode);
        PrintWriter writer = response.getWriter();
        writer.print(gson.toJson(respuesta));
        writer.flush();
    }

    private void enviarError(HttpServletResponse response, String mensaje, int statusCode) 
            throws IOException {
        
        response.setStatus(statusCode);
        RespuestaDTO respuesta = new RespuestaDTO(false, mensaje);
        PrintWriter writer = response.getWriter();
        writer.print(gson.toJson(respuesta));
        writer.flush();
    }
}
