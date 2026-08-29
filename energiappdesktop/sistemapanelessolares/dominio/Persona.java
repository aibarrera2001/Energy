package sistemapanelessolares.dominio;

public abstract class Persona {

    private int id;
    private String nombre;
    private String apellido;
    private String telefono;

    public Persona() {}

    public Persona(int id, String nombre, String apellido, String telefono) {
        this.id = id;
        this.nombre = nombre;
        this.apellido = apellido;
        this.telefono = telefono;
    }

    // Getters y Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getApellido() { return apellido; }
    public void setApellido(String apellido) { this.apellido = apellido; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }

    public String toString() {
        return "Persona{" + "id=" + id + ", nombre='" + nombre + " " + apellido + '\'' +
               ", telefono='" + telefono + '\'' + '}';
    }
}