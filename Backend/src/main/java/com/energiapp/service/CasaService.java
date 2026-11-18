package com.energiapp.service;

import com.energiapp.dao.CasaDAO;
import com.energiapp.dto.ArticuloCatalogoDTO;
import com.energiapp.dto.CasaDTO;
import com.energiapp.dto.ItemCuestionarioDTO;
import org.springframework.stereotype.Service;

import java.sql.SQLException;
import java.util.List;

@Service
public class CasaService {

    private final CasaDAO casaDAO;

    public CasaService(CasaDAO casaDAO) {
        this.casaDAO = casaDAO;
    }

    public CasaDTO registrarCasa(CasaDTO casa) throws Exception {
        // 1. Validaciones de negocio según el tipo de propiedad
        if (casa.getTipoPropiedad() == null) {
            throw new IllegalArgumentException("El tipo de propiedad es obligatorio.");
        }

        switch (casa.getTipoPropiedad().toUpperCase()) {
            case "FINCA":
                if (casa.getLatitud() == 0.0 && casa.getLongitud() == 0.0) {
                    throw new IllegalArgumentException("Una finca requiere coordenadas geográficas (Latitud y Longitud).");
                }
                break;
            case "CASA":
            case "APARTAMENTO":
                if (casa.getDireccion() == null || casa.getDireccion().trim().isEmpty()) {
                    throw new IllegalArgumentException("La dirección es obligatoria para Casas y Apartamentos.");
                }
                break;
            case "EDIFICIO":
                if (casa.getDireccion() == null || casa.getDireccion().trim().isEmpty()) {
                    throw new IllegalArgumentException("La dirección es obligatoria para Edificios.");
                }
                break;
            default:
                throw new IllegalArgumentException("Tipo de propiedad no válido: " + casa.getTipoPropiedad());
        }

        // 2. Validación de regla de negocio: Casa nueva (cuestionario) vs Consumo conocido
        boolean esNuevaSinConsumo = casa.isEsCasaNueva() || casa.getConsumoMensual() <= 0;

        if (esNuevaSinConsumo) {
            casa.setEsCasaNueva(true);

            if (casa.getArticulosCuestionario() == null || casa.getArticulosCuestionario().isEmpty()) {
                throw new IllegalArgumentException("Como la propiedad es nueva y no cuenta con consumo mensual, debe completar el cuestionario seleccionando al menos un artículo.");
            }

            boolean tieneCantidadValida = casa.getArticulosCuestionario().stream()
                    .anyMatch(item -> item != null && item.getCantidad() > 0);

            if (!tieneCantidadValida) {
                throw new IllegalArgumentException("Debe indicar una cantidad mayor a cero para al menos un artículo del cuestionario.");
            }
        } else {
            casa.setEsCasaNueva(false);
        }

        // 3. Guardar propiedad (CasaDAO ejecutará la sumatoria de kWh/mes si es casa nueva)
        boolean exito = casaDAO.guardarCasa(casa);
        if (!exito) {
            throw new SQLException("No se pudo registrar la propiedad en la base de datos.");
        }
        return casa;
    }

    public List<ArticuloCatalogoDTO> obtenerCatalogoArticulos() throws SQLException {
        return casaDAO.obtenerCatalogoArticulos();
    }

    public List<CasaDTO> obtenerCasasPorUsuario(int idUsuario) throws SQLException {
        return casaDAO.obtenerCasasPorUsuario(idUsuario);
    }

    public CasaDTO obtenerCasaPorId(int idCasa) throws SQLException {
        return casaDAO.obtenerCasaPorId(idCasa);
    }
}