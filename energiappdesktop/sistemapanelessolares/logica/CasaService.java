package sistemapanelessolares.logica;

import java.util.List;

import sistemapanelessolares.dao.CasaDAO;
import sistemapanelessolares.dominio.Apartamento;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.CasaUnifamiliar;
import sistemapanelessolares.dominio.Edificio;
import sistemapanelessolares.excepciones.PersistenciaException;

/**
 * Orquesta el registro de propiedades (Casa y sus subtipos CasaUnifamiliar,
 * Apartamento, Edificio) para el futuro modelado 3D. La vista no debe llamar
 * a CasaDAO directamente: pasa siempre por este servicio.
 */
public class CasaService {

    private final CasaDAO casaDAO;

    public CasaService() {
        this.casaDAO = new CasaDAO();
    }

    public CasaUnifamiliar registrarCasaUnifamiliar(CasaUnifamiliar casa, int idUsuario) {
        casaDAO.guardarCasaUnifamiliar(casa, idUsuario);
        if (casa.getIdCasa() == 0) {
            throw new PersistenciaException("No se pudo guardar la casa unifamiliar en la base de datos.");
        }
        return casa;
    }

    public Apartamento registrarApartamento(Apartamento apto, int idUsuario) {
        casaDAO.guardarApartamento(apto, idUsuario);
        if (apto.getIdCasa() == 0) {
            throw new PersistenciaException("No se pudo guardar el apartamento en la base de datos.");
        }
        return apto;
    }

    public Edificio registrarEdificio(Edificio edificio, int idUsuario) {
        casaDAO.guardarEdificio(edificio, idUsuario);
        if (edificio.getIdCasa() == 0) {
            throw new PersistenciaException("No se pudo guardar el edificio en la base de datos.");
        }
        return edificio;
    }

    public List<Casa> listarPorUsuario(int idUsuario) {
        return casaDAO.listarPorUsuario(idUsuario);
    }

    /** Asocia la imagen digital y/o el modelo 3D generado a una propiedad ya guardada. */
    public boolean actualizarImagenModelo3D(int idCasa, String imagenUrl, String modelo3DUrl) {
        return casaDAO.actualizarImagenModelo3D(idCasa, imagenUrl, modelo3DUrl);
    }

    public boolean eliminar(int idCasa) {
        return casaDAO.eliminar(idCasa);
    }
}