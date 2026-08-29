package sistemapanelessolares.logica;

import sistemapanelessolares.dao.EmpresaDAO;
import sistemapanelessolares.dominio.Empresa;
import sistemapanelessolares.excepciones.ValidacionNegocioException;

public class RegistroEmpresaService {

    private EmpresaDAO empresaDAO;

    public RegistroEmpresaService() {
        this.empresaDAO = new EmpresaDAO();
    }

    /**
     * Registra una nueva empresa con validaciones
     * @param empresa Objeto Empresa con todos los datos
     * @param paneles Array de paneles con formato: [["Nombre1", cantidad, precio], ["Nombre2", cantidad, precio], ...]
     * @return ID de la empresa registrada
     * @throws ValidacionNegocioException Si hay errores en los datos
     */
    public int registrarEmpresa(Empresa empresa, String[][] paneles) throws ValidacionNegocioException {
        // Validaciones básicas
        validarDatosBasicos(empresa);
        validarCorreoAdmin(empresa.getCorreoAdmin());
        validarContrasena(empresa.getContrasenaAdmin());

        // Guardar la empresa
        int empresaId = empresaDAO.guardar(empresa);

        if (empresaId == 0) {
            throw new ValidacionNegocioException("No se pudo registrar la empresa. Intente de nuevo.");
        }

        // Guardar inventario de paneles
        if (paneles != null && paneles.length > 0) {
            for (String[] panel : paneles) {
                if (panel.length >= 3) {
                    try {
                        String nombre = panel[0];
                        int cantidad = Integer.parseInt(panel[1]);
                        double precio = Double.parseDouble(panel[2]);

                        empresaDAO.agregarPanelInventario(empresaId, nombre, cantidad, precio);
                    } catch (NumberFormatException e) {
                        throw new ValidacionNegocioException("Formato inválido en datos de paneles.");
                    }
                }
            }
        }

        return empresaId;
    }

    /**
     * Valida los datos básicos de la empresa
     */
    private void validarDatosBasicos(Empresa empresa) throws ValidacionNegocioException {
        if (empresa.getNombre() == null || empresa.getNombre().trim().isEmpty()) {
            throw new ValidacionNegocioException("El nombre de la empresa es obligatorio.");
        }

        if (empresa.getNit() == null || empresa.getNit().trim().isEmpty()) {
            throw new ValidacionNegocioException("El NIT es obligatorio.");
        }

        if (empresa.getCiudad() == null || empresa.getCiudad().trim().isEmpty()) {
            throw new ValidacionNegocioException("La ciudad es obligatoria.");
        }

        if (empresa.getDireccion() == null || empresa.getDireccion().trim().isEmpty()) {
            throw new ValidacionNegocioException("La dirección es obligatoria.");
        }

        if (empresa.getTelefono() == null || empresa.getTelefono().trim().isEmpty()) {
            throw new ValidacionNegocioException("El teléfono es obligatorio.");
        }

        if (empresa.getEmail() == null || empresa.getEmail().trim().isEmpty()) {
            throw new ValidacionNegocioException("El email es obligatorio.");
        }

        if (!empresa.getEmail().matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new ValidacionNegocioException("El formato del email no es válido.");
        }

        if (empresa.getDescripcionAportes() == null || empresa.getDescripcionAportes().trim().isEmpty()) {
            throw new ValidacionNegocioException("La descripción de aportes es obligatoria.");
        }

        if (empresa.getDiferenciadores() == null || empresa.getDiferenciadores().trim().isEmpty()) {
            throw new ValidacionNegocioException("La descripción de diferenciadores es obligatoria.");
        }
    }

    /**
     * Valida el correo del administrador
     */
    private void validarCorreoAdmin(String correoAdmin) throws ValidacionNegocioException {
        if (correoAdmin == null || correoAdmin.trim().isEmpty()) {
            throw new ValidacionNegocioException("El correo del administrador es obligatorio.");
        }

        if (!correoAdmin.endsWith("@energiapp.com")) {
            throw new ValidacionNegocioException("El correo del administrador debe terminar en @energiapp.com");
        }

        if (empresaDAO.buscarPorCorreoAdmin(correoAdmin)) {
            throw new ValidacionNegocioException("El correo del administrador ya está registrado.");
        }
    }

    /**
     * Valida la contraseña
     */
    private void validarContrasena(String contrasena) throws ValidacionNegocioException {
        if (contrasena == null || contrasena.trim().isEmpty()) {
            throw new ValidacionNegocioException("La contraseña es obligatoria.");
        }

        if (contrasena.length() < 8) {
            throw new ValidacionNegocioException("La contraseña debe tener mínimo 8 caracteres.");
        }

        if (!contrasena.matches(".*[A-Z].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos una letra mayúscula.");
        }

        if (!contrasena.matches(".*[a-z].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos una letra minúscula.");
        }

        if (!contrasena.matches(".*[0-9].*")) {
            throw new ValidacionNegocioException("La contraseña debe contener al menos un número.");
        }
    }

    /**
     * Valida credenciales de login
     */
    public Empresa validarLogin(String correoAdmin, String contrasena) throws ValidacionNegocioException {
        if (correoAdmin == null || correoAdmin.isEmpty()) {
            throw new ValidacionNegocioException("El correo es obligatorio.");
        }

        if (contrasena == null || contrasena.isEmpty()) {
            throw new ValidacionNegocioException("La contraseña es obligatoria.");
        }

        Empresa empresa = empresaDAO.buscarPorCorreoAdminCompleto(correoAdmin);

        if (empresa == null) {
            throw new ValidacionNegocioException("Credenciales inválidas.");
        }

        if (!empresa.getContrasenaAdmin().equals(contrasena)) {
            throw new ValidacionNegocioException("Credenciales inválidas.");
        }

        if (!"ACTIVA".equals(empresa.getEstado())) {
            throw new ValidacionNegocioException("La empresa no está activa.");
        }

        return empresa;
    }
}
