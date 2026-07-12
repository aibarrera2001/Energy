package sistemapanelessolares.dominio;

/**
 * Representa un apartamento dentro de un edificio.
 * Al no tener techo propio, la instalación depende de la azotea
 * comunitaria del edificio (área asignada) o de un balcón/terraza privados.
 */
public class Apartamento extends Casa {

    private int piso;
    private String nombreEdificio;
    private boolean tieneBalconTerraza;
    private double areaBalconM2;
    private String orientacionBalcon;
    private double areaAzoteaAsignadaM2; // m2 de azotea comunitaria asignados a esta unidad, si aplica
    private String imagenBalconUrl;
    private String modelo3DUrl;

    public Apartamento(String direccion, String ciudad, double consumoMensualKWh,
                        double latitud, double longitud, int piso, String nombreEdificio,
                        boolean tieneBalconTerraza, double areaBalconM2, String orientacionBalcon) {
        super(direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.piso = piso;
        this.nombreEdificio = nombreEdificio;
        this.tieneBalconTerraza = tieneBalconTerraza;
        this.areaBalconM2 = areaBalconM2;
        this.orientacionBalcon = orientacionBalcon;
    }

    public Apartamento(int idCasa, String direccion, String ciudad, double consumoMensualKWh,
                        double latitud, double longitud, int piso, String nombreEdificio,
                        boolean tieneBalconTerraza, double areaBalconM2, String orientacionBalcon) {
        super(idCasa, direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.piso = piso;
        this.nombreEdificio = nombreEdificio;
        this.tieneBalconTerraza = tieneBalconTerraza;
        this.areaBalconM2 = areaBalconM2;
        this.orientacionBalcon = orientacionBalcon;
    }

    /** Área aprovechable: balcón/terraza propios + cuota de azotea asignada, si existe */
    public double getAreaDisponibleParaPaneles() {
        double area = areaAzoteaAsignadaM2;
        if (tieneBalconTerraza) area += areaBalconM2 * 0.9;
        return area;
    }

    public String getTipoPropiedad() { return "Apartamento"; }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getPiso() { return piso; }
    public void setPiso(int piso) { this.piso = piso; }

    public String getNombreEdificio() { return nombreEdificio; }
    public void setNombreEdificio(String nombreEdificio) { this.nombreEdificio = nombreEdificio; }

    public boolean isTieneBalconTerraza() { return tieneBalconTerraza; }
    public void setTieneBalconTerraza(boolean tieneBalconTerraza) { this.tieneBalconTerraza = tieneBalconTerraza; }

    public double getAreaBalconM2() { return areaBalconM2; }
    public void setAreaBalconM2(double areaBalconM2) { this.areaBalconM2 = areaBalconM2; }

    public String getOrientacionBalcon() { return orientacionBalcon; }
    public void setOrientacionBalcon(String orientacionBalcon) { this.orientacionBalcon = orientacionBalcon; }

    public double getAreaAzoteaAsignadaM2() { return areaAzoteaAsignadaM2; }
    public void setAreaAzoteaAsignadaM2(double areaAzoteaAsignadaM2) { this.areaAzoteaAsignadaM2 = areaAzoteaAsignadaM2; }

    public String getImagenBalconUrl() { return imagenBalconUrl; }
    public void setImagenBalconUrl(String imagenBalconUrl) { this.imagenBalconUrl = imagenBalconUrl; }

    public String getModelo3DUrl() { return modelo3DUrl; }
    public void setModelo3DUrl(String modelo3DUrl) { this.modelo3DUrl = modelo3DUrl; }

    @Override
    public String toString() {
        return "Apartamento{" + super.toString() +
                ", edificio='" + nombreEdificio + '\'' +
                ", piso=" + piso +
                ", balcon=" + tieneBalconTerraza +
                ", areaDisponiblePaneles=" + String.format("%.1f", getAreaDisponibleParaPaneles()) + " m2}";
    }
}