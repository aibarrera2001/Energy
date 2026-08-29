package sistemapanelessolares.dominio;

public class Empresa {

    private int idEmpresa;
    private String nombre;
    private String nit;
    private String ciudad;
    private String direccion;
    private String telefono;
    private String email;
    private String estado;
    private String region;
    private String descripcionAportes;
    private String diferenciadores;
    private String correoAdmin;
    private String contrasenaAdmin;

    public Empresa() {
        this.estado = "ACTIVA";
        this.region = "COSTA_CARIBEÑA";
    }

    public Empresa(String nombre, String nit, String ciudad, String direccion, String telefono, String email) {
        this();
        this.nombre = nombre;
        this.nit = nit;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
    }

    public Empresa(int idEmpresa, String nombre, String nit, String ciudad, String direccion, String telefono, String email, String estado) {
        this.idEmpresa = idEmpresa;
        this.nombre = nombre;
        this.nit = nit;
        this.ciudad = ciudad;
        this.direccion = direccion;
        this.telefono = telefono;
        this.email = email;
        this.estado = estado != null ? estado : "ACTIVA";
        this.region = "COSTA_CARIBEÑA";
    }

    public int getIdEmpresa() {
        return idEmpresa;
    }

    public void setIdEmpresa(int idEmpresa) {
        this.idEmpresa = idEmpresa;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNit() {
        return nit;
    }

    public void setNit(String nit) {
        this.nit = nit;
    }

    public String getCiudad() {
        return ciudad;
    }

    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }

    public String getDireccion() {
        return direccion;
    }

    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }

    public String getTelefono() {
        return telefono;
    }

    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getDescripcionAportes() {
        return descripcionAportes;
    }

    public void setDescripcionAportes(String descripcionAportes) {
        this.descripcionAportes = descripcionAportes;
    }

    public String getDiferenciadores() {
        return diferenciadores;
    }

    public void setDiferenciadores(String diferenciadores) {
        this.diferenciadores = diferenciadores;
    }

    public String getCorreoAdmin() {
        return correoAdmin;
    }

    public void setCorreoAdmin(String correoAdmin) {
        this.correoAdmin = correoAdmin;
    }

    public String getContrasenaAdmin() {
        return contrasenaAdmin;
    }

    public void setContrasenaAdmin(String contrasenaAdmin) {
        this.contrasenaAdmin = contrasenaAdmin;
    }

    @Override
    public String toString() {
        return "Empresa{" +
                "idEmpresa=" + idEmpresa +
                ", nombre='" + nombre + '\'' +
                ", ciudad='" + ciudad + '\'' +
                ", telefono='" + telefono + '\'' +
                ", email='" + email + '\'' +
                ", region='" + region + '\'' +
                ", correoAdmin='" + correoAdmin + '\'' +
                '}';
    }
}
