package sistemapanelessolares.validadores;

import java.time.LocalDate;
import sistemapanelessolares.dominio.Mantenimiento;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class Validadormantenimiento {

    /**
     * @throws ValidacionNegocioException si algún dato del mantenimiento no cumple las reglas de negocio
     */
    public static void validarMantenimiento(Mantenimiento mantenimiento) {
        if (mantenimiento == null) {
            throw new ValidacionNegocioException("El mantenimiento no puede ser nulo.");
        }
        if (mantenimiento.getCasa() == null) {
            throw new ValidacionNegocioException("El mantenimiento debe estar asociado a una propiedad.");
        }
        if (mantenimiento.getFechaProgramada() == null) {
            throw new ValidacionNegocioException("La fecha programada es obligatoria.");
        }
        if (mantenimiento.getFechaProgramada().isBefore(LocalDate.now())) {
            throw new ValidacionNegocioException("La fecha programada no puede estar en el pasado.");
        }
        String tipo = mantenimiento.getTipoMantenimiento();
        if (tipo == null || !(tipo.equals("PREVENTIVO") || tipo.equals("CORRECTIVO"))) {
            throw new ValidacionNegocioException("Tipo de mantenimiento inválido: " + tipo);
        }
    }
}