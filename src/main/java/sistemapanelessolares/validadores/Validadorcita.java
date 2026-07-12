package sistemapanelessolares.validadores;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import sistemapanelessolares.dominio.Cita;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class Validadorcita {

    private static final LocalTime HORA_APERTURA = LocalTime.of(8, 0);
    private static final LocalTime HORA_CIERRE    = LocalTime.of(17, 0);

    /**
     * @throws ValidacionNegocioException si algún dato de la cita no cumple las reglas de negocio
     */
    public static void validarCita(Cita cita) {
        if (cita == null) {
            throw new ValidacionNegocioException("La cita no puede ser nula.");
        }
        if (cita.getUsuario() == null) {
            throw new ValidacionNegocioException("La cita debe estar asociada a un usuario.");
        }
        if (cita.getCasa() == null) {
            throw new ValidacionNegocioException("La cita debe estar asociada a una propiedad (casa/apartamento/edificio).");
        }
        if (cita.getFecha() == null) {
            throw new ValidacionNegocioException("La fecha de la cita es obligatoria.");
        }
        if (cita.getFecha().isBefore(LocalDate.now())) {
            throw new ValidacionNegocioException("No se puede agendar una cita en una fecha pasada.");
        }
        if (cita.getFecha().getDayOfWeek() == DayOfWeek.SUNDAY) {
            throw new ValidacionNegocioException("No se agendan citas los domingos.");
        }
        if (cita.getHora() == null) {
            throw new ValidacionNegocioException("La hora de la cita es obligatoria.");
        }
        if (cita.getHora().isBefore(HORA_APERTURA) || cita.getHora().isAfter(HORA_CIERRE)) {
            throw new ValidacionNegocioException("El horario de atención es de " + HORA_APERTURA + " a " + HORA_CIERRE + ".");
        }
        String tipo = cita.getTipoServicio();
        if (tipo == null || !(tipo.equals("INSTALACION") || tipo.equals("MANTENIMIENTO")
                || tipo.equals("INSPECCION") || tipo.equals("COTIZACION"))) {
            throw new ValidacionNegocioException("Tipo de servicio inválido: " + tipo);
        }
    }
}