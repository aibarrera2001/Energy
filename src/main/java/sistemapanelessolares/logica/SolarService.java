package sistemapanelessolares.logica;

import java.sql.Connection;
import java.util.List;

import sistemapanelessolares.dao.PanelSolarDAO;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.dominio.Usuario;
import sistemapanelessolares.excepciones.RecursoNoEncontradoException;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

/**
 * Servicio central de negocio. Ya NO depende de la capa view (antes tenía un
 * campo Registro importado de sistemapanelessolares.view, lo cual violaba la
 * regla view -> logica -> dominio). La vista es responsable de construir sus
 * propios componentes de presentación y de invocar UsuarioService/autentificacion
 * (ambos en logica) para registrar o autenticar usuarios.
 */
public class SolarService {

    private final GestorPaneles gestorPaneles;
    private final autentificacion autenticacion;
    private final ChatController chatController;
    private final GestorCitas gestorCitas;
    private final GestorMantenimiento gestorMantenimiento;

    // ── Constructor sin BD ────────────────────────────────────────────
    public SolarService() {
        this.gestorPaneles = new GestorPaneles();
        cargarPanelesSemilla(this.gestorPaneles);
        this.autenticacion = new autentificacion();
        this.chatController = new ChatController(this);
        this.gestorCitas = new GestorCitas();
        this.gestorMantenimiento = new GestorMantenimiento();
    }

    // ── Constructor con BD ────────────────────────────────────────────
    public SolarService(Connection conexionDB) {
        this.autenticacion = new autentificacion();

        GestorPaneles gp = new GestorPaneles();
        try {
            PanelSolarDAO repo = new PanelSolarDAO();
            List<PanelSolar> panelesBD = repo.listarTodos();
            if (panelesBD != null && !panelesBD.isEmpty()) {
                gp = new GestorPaneles(panelesBD);
            } else {
                cargarPanelesSemilla(gp);
            }
        } catch (Exception e) {
            cargarPanelesSemilla(gp);
        }
        this.gestorPaneles  = gp;
        this.chatController = new ChatController(this);
        this.gestorCitas = new GestorCitas();
        this.gestorMantenimiento = new GestorMantenimiento();
    }

    // ── Catálogo ──────────────────────────────────────────────────────
    public List<PanelSolar> obtenerPanelesParaCatalogo() {
        return gestorPaneles.listarPorPrecioAscendente();
    }

    public PanelSolar buscarPanelPorId(int id) {
        return gestorPaneles.buscarPorId(id).orElse(null);
    }

    private void cargarPanelesSemilla(GestorPaneles gp) {
        gp.agregarPanel(new PanelSolar(0, "SunPower Maxeon 3",    "Monocristalino", 400, 22.6, 350.00, 80.00, "25", "Panel premium alta eficiencia"));
        gp.agregarPanel(new PanelSolar(0, "Canadian Solar HiKu",  "Policristalino", 370, 18.9, 210.00, 60.00, "10", "Relacion costo-beneficio optima"));
        gp.agregarPanel(new PanelSolar(0, "First Solar Series 6", "Thin-Film",      420, 19.0, 275.00, 70.00, "10", "Ideal para grandes superficies"));
        gp.agregarPanel(new PanelSolar(0, "LONGi Hi-MO 5",        "PERC",           500, 21.3, 290.00, 65.00, "12", "Alta potencia por modulo"));
        gp.agregarPanel(new PanelSolar(0, "Trina Vertex S+",      "Bifacial",       445, 21.8, 320.00, 75.00, "15", "Captacion por ambas caras"));
    }

    // ── Resúmenes solares ─────────────────────────────────────────────

    /**
     * @throws ValidacionNegocioException si el usuario no tiene panel seleccionado
     * @throws RecursoNoEncontradoException si el índice de casa no existe
     */
    public String generarResumenSolar(Usuario usuario, int indiceCasa) {
        if (usuario.getPanelSeleccionado() == null) {
            throw new ValidacionNegocioException("El usuario no tiene un panel seleccionado.");
        }
        if (usuario.getCasas().isEmpty() || indiceCasa >= usuario.getCasas().size()) {
            throw new RecursoNoEncontradoException("No existe una casa en el índice " + indiceCasa + ".");
        }
        Casa casa = usuario.getCasas().get(indiceCasa);
        double costoInst = usuario.getPanelSeleccionado().getCostoInstalacion();
        return new CalculadoraPanels(casa, usuario.getPanelSeleccionado(), costoInst).generarResumen();
    }

    /**
     * @throws ValidacionNegocioException si el usuario no tiene panel seleccionado o no tiene casas
     */
    public String generarResumenTodasLasCasas(Usuario usuario) {
        if (usuario.getPanelSeleccionado() == null) {
            throw new ValidacionNegocioException("El usuario no tiene un panel seleccionado.");
        }
        if (usuario.getCasas().isEmpty()) {
            throw new ValidacionNegocioException("El usuario no tiene casas registradas.");
        }
        double costoInst = usuario.getPanelSeleccionado().getCostoInstalacion();
        StringBuilder sb = new StringBuilder();
        sb.append("=== Resumenes de ").append(usuario.getNombre())
          .append(" ").append(usuario.getApellido()).append(" ===\n\n");
        for (int i = 0; i < usuario.getCasas().size(); i++) {
            sb.append(">>> Casa ").append(i + 1).append(":\n");
            sb.append(new CalculadoraPanels(
                    usuario.getCasas().get(i),
                    usuario.getPanelSeleccionado(), costoInst).generarResumen()).append("\n\n");
        }
        return sb.toString();
    }

    public String generarResumenTodasLasCasas(Usuario usuario, double costoAdicional) {
        return generarResumenTodasLasCasas(usuario);
    }

    public double getConsumoTotalMensualKWh(Usuario usuario) {
        double total = 0;
        for (Casa casa : usuario.getCasas()) total += casa.getConsumoDiarioKWh() * 30;
        return total;
    }

    // ── Chat ──────────────────────────────────────────────────────────
    public String consultarChat(String mensaje) {
        return chatController.procesarMensaje(mensaje);
    }

    public String procesarMensajeChat(int idUsuario, String mensaje) {
        return chatController.procesarMensaje(mensaje);
    }

    // ── Getters ───────────────────────────────────────────────────────
    public GestorPaneles   getGestorPaneles()  { return gestorPaneles; }
    public autentificacion getAutenticacion()  { return autenticacion; }
    public ChatController  getChatController() { return chatController; }
    public GestorCitas         getGestorCitas()         { return gestorCitas; }
    public GestorMantenimiento getGestorMantenimiento() { return gestorMantenimiento; }
}