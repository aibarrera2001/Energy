package sistemapanelessolares.dominio;

/**
 * Representa una casa unifamiliar (vivienda independiente con techo propio).
 * Extiende Casa agregando los datos necesarios para el modelado 3D
 * y la ubicación sugerida de los paneles solares sobre el techo.
 */
public class CasaUnifamiliar extends Casa {

    private int numeroPisos;
    private double areaTechoM2;
    private String tipoTecho;        // "Inclinado" | "Plano"
    private String orientacionTecho; // "Norte", "Sur", "Este", "Oeste", "Noreste", etc.
    private double pendienteTechoGrados;
    private String imagenTechoUrl;   // Foto/imagen satelital o digital del techo
    private String modelo3DUrl;      // Ruta/URL al modelo 3D generado de la propiedad

    public CasaUnifamiliar(String direccion, String ciudad, double consumoMensualKWh,
                            double latitud, double longitud, int numeroPisos,
                            double areaTechoM2, String tipoTecho, String orientacionTecho,
                            double pendienteTechoGrados) {
        super(direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.numeroPisos = numeroPisos;
        this.areaTechoM2 = areaTechoM2;
        this.tipoTecho = tipoTecho;
        this.orientacionTecho = orientacionTecho;
        this.pendienteTechoGrados = pendienteTechoGrados;
    }

    public CasaUnifamiliar(int idCasa, String direccion, String ciudad, double consumoMensualKWh,
                            double latitud, double longitud, int numeroPisos,
                            double areaTechoM2, String tipoTecho, String orientacionTecho,
                            double pendienteTechoGrados) {
        super(idCasa, direccion, ciudad, consumoMensualKWh, latitud, longitud);
        this.numeroPisos = numeroPisos;
        this.areaTechoM2 = areaTechoM2;
        this.tipoTecho = tipoTecho;
        this.orientacionTecho = orientacionTecho;
        this.pendienteTechoGrados = pendienteTechoGrados;
    }

    /** Área realmente aprovechable para paneles (se descuenta ~15% por chimeneas, tanques, sombras, etc.) */
    public double getAreaDisponibleParaPaneles() {
        return areaTechoM2 * 0.85;
    }

    public String getTipoPropiedad() { return "Casa Unifamiliar"; }

    // ----------------------------------------------------------------
    //  Getters y Setters
    // ----------------------------------------------------------------

    public int getNumeroPisos() { return numeroPisos; }
    public void setNumeroPisos(int numeroPisos) { this.numeroPisos = numeroPisos; }

    public double getAreaTechoM2() { return areaTechoM2; }
    public void setAreaTechoM2(double areaTechoM2) { this.areaTechoM2 = areaTechoM2; }

    public String getTipoTecho() { return tipoTecho; }
    public void setTipoTecho(String tipoTecho) { this.tipoTecho = tipoTecho; }

    public String getOrientacionTecho() { return orientacionTecho; }
    public void setOrientacionTecho(String orientacionTecho) { this.orientacionTecho = orientacionTecho; }

    public double getPendienteTechoGrados() { return pendienteTechoGrados; }
    public void setPendienteTechoGrados(double pendienteTechoGrados) { this.pendienteTechoGrados = pendienteTechoGrados; }

    public String getImagenTechoUrl() { return imagenTechoUrl; }
    public void setImagenTechoUrl(String imagenTechoUrl) { this.imagenTechoUrl = imagenTechoUrl; }

    public String getModelo3DUrl() { return modelo3DUrl; }
    public void setModelo3DUrl(String modelo3DUrl) { this.modelo3DUrl = modelo3DUrl; }

    @Override
    public String toString() {
        return "CasauniFamiliar{" + super.toString() +
                ", pisos=" + numeroPisos +
                ", techo=" + tipoTecho + " (" + areaTechoM2 + " m2, orientacion " + orientacionTecho + ")" +
                ", areaDisponiblePaneles=" + String.format("%.1f", getAreaDisponibleParaPaneles()) + " m2}";
    }
}