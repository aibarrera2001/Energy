package sistemapanelessolares.validadores;

import sistemapanelessolares.dominio.PanelSolar;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class validadorePanelSolar {

    public static void validarNombre(String nombre) {
        if (nombre == null || nombre.trim().isEmpty()) {
            throw new ValidacionNegocioException("El nombre del panel no puede estar vacío.");
        }
    }

    public static void validarTipo(String tipo) {
        if (tipo == null || tipo.trim().isEmpty()) {
            throw new ValidacionNegocioException("El tipo de panel no puede estar vacío.");
        }
        // Tipos válidos conocidos (extensible)
        String[] tiposValidos = {"Monocristalino", "Policristalino", "Thin-Film", "Bifacial", "PERC"};
        boolean esValido = false;
        for (String t : tiposValidos) {
            if (t.equalsIgnoreCase(tipo.trim())) {
                esValido = true;
                break;
            }
        }
        if (!esValido) {
            throw new ValidacionNegocioException(
                "Tipo de panel no reconocido: '" + tipo + "'. " +
                "Tipos válidos: Monocristalino, Policristalino, Thin-Film, Bifacial, PERC."
            );
        }
    }

    public static void validarPotencia(double potencia) {
        if (potencia <= 0) {
            throw new ValidacionNegocioException("La potencia del panel debe ser mayor a 0 vatios.");
        }
        if (potencia > 1000) {
            throw new ValidacionNegocioException("La potencia del panel no puede superar 1000W por unidad.");
        }
    }

    public static void validarEficiencia(double eficiencia) {
        if (eficiencia <= 0 || eficiencia > 100) {
            throw new ValidacionNegocioException("La eficiencia debe estar entre 0.1% y 100%.");
        }
    }

    public static void validarCosto(double costo, String campo) {
        if (costo < 0) {
            throw new ValidacionNegocioException("El " + campo + " no puede ser negativo.");
        }
    }

    public static void validarGarantia(String garantia) {
        if (garantia == null || garantia.trim().isEmpty()) {
            throw new ValidacionNegocioException("La garantía no puede estar vacía.");
        }
    }

    /**
     * @throws ValidacionNegocioException si algún dato del panel no cumple las reglas de negocio
     */
    public static boolean validarPanel(PanelSolar panel) {
        if (panel == null) {
            throw new ValidacionNegocioException("El panel no puede ser nulo.");
        }
        validarNombre(panel.getNombre());
        validarTipo(panel.getTipo());
        validarPotencia(panel.getPotenciaWatts());
        validarEficiencia(panel.getEficiencia());
        validarCosto(panel.getCostoUnidad(), "costo por unidad");
        validarCosto(panel.getCostoInstalacion(), "costo de instalación");
        validarGarantia(panel.getGarantiaAnios());
        return true;
    }
}