package sistemapanelessolares.logica;

import java.util.List;

import sistemapanelessolares.dao.MantenimientoDAO;
import sistemapanelessolares.dominio.Mantenimiento;
import sistemapanelessolares.excepciones.PersistenciaException;
import sistemapanelessolares.excepciones.RecursoNoEncontradoException;
import sistemapanelessolares.validadores.Validadormantenimiento;

/**
 * Orquesta el ciclo de vida del mantenimiento de paneles instalados:
 * aplica Validadormantenimiento y persiste cada operación a través de
 * MantenimientoDAO. La base de datos es la fuente de verdad.
 */
public class GestorMantenimiento {

    private final MantenimientoDAO mantenimientoDAO;

    public GestorMantenimiento() {
        this.mantenimientoDAO = new MantenimientoDAO();
    }

    public GestorMantenimiento(MantenimientoDAO mantenimientoDAO) {
        this.mantenimientoDAO = mantenimientoDAO;
    }

    // ----------------------------------------------------------------
    //  Programación
    // ----------------------------------------------------------------

    /**
     * @throws PersistenciaException si la base de datos no confirma el guardado
     */
    public Mantenimiento programarMantenimiento(Mantenimiento mantenimiento) {
        Validadormantenimiento.validarMantenimiento(mantenimiento);
        mantenimientoDAO.guardar(mantenimiento);
        if (mantenimiento.getIdMantenimiento() == 0) {
            throw new PersistenciaException("No se pudo guardar el mantenimiento en la base de datos.");
        }
        return mantenimiento;
    }

    /**
     * Registra la ejecución de un mantenimiento y programa automáticamente
     * el siguiente mantenimiento preventivo (a 6 meses), persistiendo ambos.
     * @throws RecursoNoEncontradoException si no existe el mantenimiento indicado
     */
    public Mantenimiento registrarMantenimientoRealizado(int idMantenimiento, String tecnicoAsignado,
                                                          double costo, String observaciones) {
        Mantenimiento m = obtenerOFallar(idMantenimiento);
        m.marcarComoRealizado(tecnicoAsignado, costo, observaciones);
        mantenimientoDAO.actualizar(m);

        Mantenimiento siguiente = new Mantenimiento(
                m.getNombreCliente(), m.getCasa(), "PREVENTIVO",
                m.getFechaProximoMantenimiento(), "Mantenimiento preventivo periódico");
        siguiente.setEmpresaId(m.getEmpresaId());
        mantenimientoDAO.guardar(siguiente);

        return m;
    }

    public Mantenimiento cancelarMantenimiento(int idMantenimiento, String motivo) {
        Mantenimiento m = obtenerOFallar(idMantenimiento);
        m.cancelar(motivo);
        mantenimientoDAO.actualizar(m);
        return m;
    }

    /**
     * @throws RecursoNoEncontradoException si no existe un mantenimiento con ese id
     */
    private Mantenimiento obtenerOFallar(int idMantenimiento) {
        Mantenimiento m = mantenimientoDAO.buscarPorId(idMantenimiento);
        if (m == null) {
            throw new RecursoNoEncontradoException("No existe ningún mantenimiento con id " + idMantenimiento + ".");
        }
        return m;
    }

    // ----------------------------------------------------------------
    //  Consultas
    // ----------------------------------------------------------------

    public Mantenimiento buscarPorId(int idMantenimiento) { return mantenimientoDAO.buscarPorId(idMantenimiento); }

    public List<Mantenimiento> listarPorUsuario(int idUsuario) { return mantenimientoDAO.listarPorUsuario(idUsuario); }

    public List<Mantenimiento> listarPorCasa(int idCasa) { return mantenimientoDAO.listarPorCasa(idCasa); }

    public List<Mantenimiento> listarPendientes() { return mantenimientoDAO.listarPendientes(); }

    public List<Mantenimiento> listarVencidos() { return mantenimientoDAO.listarVencidos(); }
}