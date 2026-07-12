package sistemapanelessolares.dominio;

public class PanelSolar {

    private int id;
    private String nombre;
    private String tipo;              // Monocristalino, Policristalino, Thin-Film, etc.
    private double potenciaWatts;    // Potencia pico en vatios (Wp)
    private double eficiencia;       // Porcentaje de eficiencia (0-100)
    private double costoUnidad;      // Costo por panel en $
    private double costoInstalacion; // Costo de instalación adicional por panel
    private String garantiaAnios;    // Garantía en años
    private String descripcion;


    public PanelSolar() {
        // Constructor vacío para facilitar la lectura de datos desde consola
    }
    /**
     * CONSTRUCTOR 1 (Sin ID): Utilizado por el administrador para registrar un nuevo panel.
     * pgAdmin se encargará de asignar el ID de forma automática (SERIAL).
     */
    public PanelSolar(String nombre, String tipo, double potenciaWatts, double eficiencia, 
                      double costoUnidad, double costoInstalacion, String garantiaAnios, String descripcion) {
        this.nombre = nombre;
        this.tipo = tipo;
        this.potenciaWatts = potenciaWatts;
        this.eficiencia = eficiencia;
        this.costoUnidad = costoUnidad;
        this.costoInstalacion = costoInstalacion;
        this.garantiaAnios = garantiaAnios;
        this.descripcion = descripcion;
    }

    /**
     * CONSTRUCTOR 2 (Con ID): Utilizado al consultar la base de datos (SELECT) 
     * para cargar los paneles existentes en el sistema con su identificador real.
     */
    public PanelSolar(int id, String nombre, String tipo, double potenciaWatts,
                      double eficiencia, double costoUnidad, double costoInstalacion,
                      String garantiaAnios, String descripcion) {
        this.id = id;
        this.nombre = nombre;
        this.tipo = tipo;
        this.potenciaWatts = potenciaWatts;
        this.eficiencia = eficiencia;
        this.costoUnidad = costoUnidad;
        this.costoInstalacion = costoInstalacion;
        this.garantiaAnios = garantiaAnios;
        this.descripcion = descripcion;
    }

    // ----------------------------------------------------------------
    //  Métodos de cálculo
    // ----------------------------------------------------------------

    public double produccionDiariaKWh(double horasSolEfectivas) {
        return (potenciaWatts / 1000.0) * horasSolEfectivas * (eficiencia / 100.0);
    }

    public double getCostoPorPanel() {
        return costoUnidad;
    }

    public double getPrecioDolar() {
        return costoUnidad;
    }

    public double getPrecio() {
        return costoUnidad;
    }

    public double getPotencia() {
        return potenciaWatts;
    }

    public String getGarantia() {
        return garantiaAnios;
    }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public double getPotenciaWatts() { return potenciaWatts; }
    public void setPotenciaWatts(double potenciaWatts) { this.potenciaWatts = potenciaWatts; }

    public double getEficiencia() { return eficiencia; }
    public void setEficiencia(double eficiencia) { this.eficiencia = eficiencia; }

    public double getCostoUnidad() { return costoUnidad; }
    public void setCostoUnidad(double costoUnidad) { this.costoUnidad = costoUnidad; }

    public double getCostoInstalacion() { return costoInstalacion; }
    public void setCostoInstalacion(double costoInstalacion) { this.costoInstalacion = costoInstalacion; }

    public String getGarantiaAnios() { return garantiaAnios; }
    public void setGarantiaAnios(String garantiaAnios) { this.garantiaAnios = garantiaAnios; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    // ----------------------------------------------------------------
    //  Visualización estética en Consola
    // ----------------------------------------------------------------
    @Override
    public String toString() {
        return String.format(
            "[%d] %s (%s) | Potencia: %.0fW | Eficiencia: %.1f%% | Costo: $%.2f | Inst: $%.2f | Garantía: %s años\n    Nota: %s",
            id, nombre, tipo, potenciaWatts, eficiencia, costoUnidad, costoInstalacion, garantiaAnios, descripcion
        );
    }
}