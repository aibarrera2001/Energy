package sistemapanelessolares.dominio;

/**
 * Objeto de dominio puro: solo datos e identidad del administrativo.
 * La gestión del catálogo de paneles (GestorPaneles) es responsabilidad
 * de la capa de lógica (ver SolarService.getGestorPaneles()); el dominio
 * no debe depender de logica.
 */
public class Administrativo extends Persona {

    private int empresaId;
    private String rol;
    private String correo;
    private String contrasena; // Se maneja como contrasena en código Java para evitar problemas de codificación

    /**
     * CONSTRUCTOR 1 (Sin ID): Utilizado para registrar un nuevo administrador.
     * El ID se inicializa por defecto en 0.
     */
    public Administrativo(String nombre, String apellido, String telefono, String rol, String correo, String contrasena) {
        this(0, 1, nombre, apellido, telefono, rol, correo, contrasena);
    }

    /**
     * CONSTRUCTOR 2 (Con ID): Utilizado al recuperar los administradores desde la base de datos.
     */
    public Administrativo(int id, String nombre, String apellido, String telefono, String rol, String correo, String contrasena) {
        this(id, 1, nombre, apellido, telefono, rol, correo, contrasena);
    }

    public Administrativo(int id, int empresaId, String nombre, String apellido, String telefono, String rol, String correo, String contrasena) {
        super(id, nombre, apellido, telefono);
        this.empresaId = empresaId;
        this.rol = rol;
        this.correo = correo;
        this.contrasena = contrasena;
    }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getEmpresaId() { return empresaId; }
    public void setEmpresaId(int empresaId) { this.empresaId = empresaId; }

    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }

    public String getCorreo() { return correo; }
    public void setCorreo(String correo) { this.correo = correo; }

    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }

    public String getCodigo() {
        return rol + getId();
    }

    // ----------------------------------------------------------------
    //  Visualización de datos
    // ----------------------------------------------------------------
    @Override
    public String toString() {
        return "Administrativo{" +
                "id=" + getId() +
                ", nombre='" + getNombre() + '\'' +
                ", apellido='" + getApellido() + '\'' +
                ", telefono='" + getTelefono() + '\'' +
                ", rol='" + rol + '\'' +
                ", correo='" + correo + '\'' +
                '}';
    }
}