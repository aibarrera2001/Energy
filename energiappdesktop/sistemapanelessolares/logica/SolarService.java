package sistemapanelessolares.logica;

import java.sql.Connection;
import java.util.List;

import sistemapanelessolares.dao.PanelSolarDAO;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.PanelSolar;
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
    private final GestorCitas gestorCitas;
    private final GestorMantenimiento gestorMantenimiento;
    private final CasaService casaService;

    // ── Constructor sin BD ────────────────────────────────────────────
    public SolarService() {
        this.gestorPaneles = new GestorPaneles();
        cargarPanelesSemilla(this.gestorPaneles);
        this.gestorCitas = new GestorCitas();
        this.gestorMantenimiento = new GestorMantenimiento();
        this.casaService = new CasaService();
    }

    // ── Constructor con BD ────────────────────────────────────────────
    public SolarService(Connection conexionDB) {
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
        this.gestorPaneles = gp;
        this.gestorCitas = new GestorCitas();
        this.gestorMantenimiento = new GestorMantenimiento();
        this.casaService = new CasaService();
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
     * @throws ValidacionNegocioException si no hay panel seleccionado
     * @throws RecursoNoEncontradoException si la casa no existe
     */
    public String generarResumenSolar(Casa casa, PanelSolar panelSeleccionado) {
        if (panelSeleccionado == null) {
            throw new ValidacionNegocioException("No se ha seleccionado un panel solar.");
        }
        if (casa == null) {
            throw new RecursoNoEncontradoException("No existe una casa para generar el resumen.");
        }
        double costoInst = panelSeleccionado.getCostoInstalacion();
        return new CalculadoraPanels(casa, panelSeleccionado, costoInst).generarResumen();
    }

    /**
     * @throws ValidacionNegocioException si no hay panel seleccionado o no hay casas
     */
    public String generarResumenTodasLasCasas(List<Casa> casas, PanelSolar panelSeleccionado) {
        if (panelSeleccionado == null) {
            throw new ValidacionNegocioException("No se ha seleccionado un panel solar.");
        }
        if (casas == null || casas.isEmpty()) {
            throw new ValidacionNegocioException("No hay casas registradas para resumir.");
        }
        double costoInst = panelSeleccionado.getCostoInstalacion();
        StringBuilder sb = new StringBuilder();
        sb.append("=== Resumenes del sistema solar ===\n\n");
        for (int i = 0; i < casas.size(); i++) {
            sb.append(">>> Casa ").append(i + 1).append(":\n");
            sb.append(new CalculadoraPanels(
                    casas.get(i),
                    panelSeleccionado, costoInst).generarResumen()).append("\n\n");
        }
        return sb.toString();
    }

    public String generarResumenTodasLasCasas(List<Casa> casas, PanelSolar panelSeleccionado, double costoAdicional) {
        return generarResumenTodasLasCasas(casas, panelSeleccionado);
    }

    public double getConsumoTotalMensualKWh(List<Casa> casas) {
        if (casas == null) return 0;
        double total = 0;
        for (Casa casa : casas) total += casa.getConsumoDiarioKWh() * 30;
        return total;
    }

    // ── Getters ───────────────────────────────────────────────────────
    public GestorPaneles getGestorPaneles() { return gestorPaneles; }
    public GestorCitas getGestorCitas() { return gestorCitas; }
    public GestorMantenimiento getGestorMantenimiento() { return gestorMantenimiento; }
    public CasaService getCasaService() { return casaService; }
}