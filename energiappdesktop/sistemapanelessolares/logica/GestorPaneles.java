package sistemapanelessolares.logica;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.excepciones.RecursoNoEncontradoException;
import sistemapanelessolares.validadores.validadorePanelSolar;

public class GestorPaneles {

    private final List<PanelSolar> catalogo;
    private int contadorId;

    public GestorPaneles() {
        this.catalogo = new ArrayList<>();
        this.contadorId = 1;
    }

    public GestorPaneles(List<PanelSolar> paneles) {
        this.catalogo = new ArrayList<>();
        this.contadorId = 1;
        if (paneles != null && !paneles.isEmpty()) {
            this.catalogo.addAll(paneles);
            this.contadorId = paneles.stream()
                    .mapToInt(PanelSolar::getId)
                    .max().orElse(0) + 1;
        }
    }

    // ----------------------------------------------------------------
    //  CRUD (Lógica Pura de Negocio)
    //  Nota: la validación de datos del panel la sigue haciendo
    //  validadorePanelSolar (capa validadores); este gestor solo añade
    //  las excepciones de "recurso no encontrado" para id inexistente.
    // ----------------------------------------------------------------

    public PanelSolar agregarPanel(PanelSolar panel) {
        validadorePanelSolar.validarPanel(panel);
        panel.setId(contadorId++);
        catalogo.add(panel);
        return panel;
    }

    public void agregarPanelConId(PanelSolar panel) {
        validadorePanelSolar.validarPanel(panel);
        if (panel.getId() >= contadorId) {
            contadorId = panel.getId() + 1;
        }
        catalogo.add(panel);
    }

    /**
     * @throws RecursoNoEncontradoException si no existe un panel con ese id
     */
    public PanelSolar modificarPanel(int id, PanelSolar panelNuevo) {
        validadorePanelSolar.validarPanel(panelNuevo);
        PanelSolar existente = buscarPorId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe ningún panel con id " + id + "."));

        existente.setNombre(panelNuevo.getNombre());
        existente.setTipo(panelNuevo.getTipo());
        existente.setPotenciaWatts(panelNuevo.getPotenciaWatts());
        existente.setEficiencia(panelNuevo.getEficiencia());
        existente.setCostoUnidad(panelNuevo.getCostoUnidad());
        existente.setCostoInstalacion(panelNuevo.getCostoInstalacion());
        existente.setGarantiaAnios(panelNuevo.getGarantiaAnios());
        existente.setDescripcion(panelNuevo.getDescripcion());
        return existente;
    }

    /**
     * @throws RecursoNoEncontradoException si no existe un panel con ese id
     */
    public boolean eliminarPanel(int id) {
        PanelSolar panel = buscarPorId(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe ningún panel con id " + id + "."));
        catalogo.remove(panel);
        return true;
    }

    // ----------------------------------------------------------------
    //  Consultas
    //  Estas se mantienen con Optional/lista vacía: buscar y no encontrar
    //  es un resultado normal de una búsqueda, no un error del sistema.
    // ----------------------------------------------------------------

    public List<PanelSolar> listarPaneles() {
        return new ArrayList<>(catalogo);
    }

    public Optional<PanelSolar> buscarPorId(int id) {
        return catalogo.stream().filter(p -> p.getId() == id).findFirst();
    }

    public List<PanelSolar> buscarPorTipo(String tipo) {
        List<PanelSolar> resultado = new ArrayList<>();
        if (tipo == null) return resultado;

        for (PanelSolar p : catalogo) {
            if (p.getTipo() != null && p.getTipo().equalsIgnoreCase(tipo.trim())) {
                resultado.add(p);
            }
        }
        return resultado;
    }

    public List<PanelSolar> listarPorPrecioAscendente() {
        List<PanelSolar> ordenada = new ArrayList<>(catalogo);
        ordenada.sort((a, b) -> Double.compare(a.getCostoUnidad(), b.getCostoUnidad()));
        return ordenada;
    }
}