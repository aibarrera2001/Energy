package sistemapanelessolares.dominio;

/**
 * Representa un edificio completo (propiedad horizontal) donde los
 * paneles se instalan sobre la azotea comunitaria y se reparten
 * los beneficios entre los apartamentos que lo componen.
 */
public class Edificio extends Casa {

    private int numeroPisos;
    private int numeroApartamentos;
    private double areaAzoteaTotalM2;
    private boolean azoteaDisponibleParaPaneles;
    private String administradorNombre;
    private String administradorTelefono;
    private String imagenAzoteaUrl;
    private String modelo3DUrl;

    public Edificio(String direccion, String ciudad, double consumoMensualKWh,
                     double latitud, double longitud, int numeroPisos, int numeroApartamentos,
                     double areaAzoteaTotalM2, boolean azoteaDisponibleParaPaneles) {
        super(direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.numeroPisos = numeroPisos;
        this.numeroApartamentos = numeroApartamentos;
        this.areaAzoteaTotalM2 = areaAzoteaTotalM2;
        this.azoteaDisponibleParaPaneles = azoteaDisponibleParaPaneles;
    }

    public Edificio(int idCasa, String direccion, String ciudad, double consumoMensualKWh,
                     double latitud, double longitud, int numeroPisos, int numeroApartamentos,
                     double areaAzoteaTotalM2, boolean azoteaDisponibleParaPaneles) {
        super(idCasa, direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.numeroPisos = numeroPisos;
        this.numeroApartamentos = numeroApartamentos;
        this.areaAzoteaTotalM2 = areaAzoteaTotalM2;
        this.azoteaDisponibleParaPaneles = azoteaDisponibleParaPaneles;
    }

    /** Área realmente aprovechable de la azotea (se descuenta un 25% por tanques, cuartos técnicos, sombras, etc.) */
    public double getAreaDisponibleParaPaneles() {
        return azoteaDisponibleParaPaneles ? areaAzoteaTotalM2 * 0.75 : 0;
    }

    /** Área promedio de azotea que le correspondería a cada apartamento */
    public double getAreaPromedioPorApartamento() {
        if (numeroApartamentos <= 0) return 0;
        return getAreaDisponibleParaPaneles() / numeroApartamentos;
    }

    public String getTipoPropiedad() { return "Edificio"; }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getNumeroPisos() { return numeroPisos; }
    public void setNumeroPisos(int numeroPisos) { this.numeroPisos = numeroPisos; }

    public int getNumeroApartamentos() { return numeroApartamentos; }
    public void setNumeroApartamentos(int numeroApartamentos) { this.numeroApartamentos = numeroApartamentos; }

    public double getAreaAzoteaTotalM2() { return areaAzoteaTotalM2; }
    public void setAreaAzoteaTotalM2(double areaAzoteaTotalM2) { this.areaAzoteaTotalM2 = areaAzoteaTotalM2; }

    public boolean isAzoteaDisponibleParaPaneles() { return azoteaDisponibleParaPaneles; }
    public void setAzoteaDisponibleParaPaneles(boolean azoteaDisponibleParaPaneles) { this.azoteaDisponibleParaPaneles = azoteaDisponibleParaPaneles; }

    public String getAdministradorNombre() { return administradorNombre; }
    public void setAdministradorNombre(String administradorNombre) { this.administradorNombre = administradorNombre; }

    public String getAdministradorTelefono() { return administradorTelefono; }
    public void setAdministradorTelefono(String administradorTelefono) { this.administradorTelefono = administradorTelefono; }

    public String getImagenAzoteaUrl() { return imagenAzoteaUrl; }
    public void setImagenAzoteaUrl(String imagenAzoteaUrl) { this.imagenAzoteaUrl = imagenAzoteaUrl; }

    public String getModelo3DUrl() { return modelo3DUrl; }
    public void setModelo3DUrl(String modelo3DUrl) { this.modelo3DUrl = modelo3DUrl; }

    @Override
    public String toString() {
        return "Edificio{" + super.toString() +
                ", pisos=" + numeroPisos +
                ", apartamentos=" + numeroApartamentos +
                ", areaDisponiblePaneles=" + String.format("%.1f", getAreaDisponibleParaPaneles()) + " m2}";
    }
}