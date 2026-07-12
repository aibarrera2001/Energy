package sistemapanelessolares.dominio;

public class Casa {

    private int    idCasa;
    private String direccion;
    private String ciudad;
    private double consumoMensualKWh;
    private double latitud;
    private double longitud;

    // Constructor sin ID (para casas nuevas)
    public Casa(String direccion, String ciudad, double consumoMensualKWh,
                double latitud, double longitud) {
        this.direccion        = direccion;
        this.ciudad           = ciudad;
        this.consumoMensualKWh = consumoMensualKWh;
        this.latitud          = latitud;
        this.longitud         = longitud;
    }

    // Constructor con ID (cargadas desde BD)
    public Casa(int idCasa, String direccion, String ciudad, double consumoMensualKWh,
                double latitud, double longitud) {
        this.idCasa           = idCasa;
        this.direccion        = direccion;
        this.ciudad           = ciudad;
        this.consumoMensualKWh = consumoMensualKWh;
        this.latitud          = latitud;
        this.longitud         = longitud;
    }

    public int    getIdCasa()                      { return idCasa; }
    public void   setIdCasa(int idCasa)            { this.idCasa = idCasa; }

    public String getDireccion()                   { return direccion; }
    public void   setDireccion(String d)           { this.direccion = d; }

    public String getCiudad()                      { return ciudad; }
    public void   setCiudad(String c)              { this.ciudad = c; }

    public double getConsumoDiarioKWh()            { return consumoMensualKWh / 30; }
    public double getConsumoMensualKWh()           { return consumoMensualKWh; }
    public void   setConsumoMensualKWh(double v)   { this.consumoMensualKWh = v; }

    public double getLatitud()                     { return latitud; }
    public double getLongitud()                    { return longitud; }

    @Override
    public String toString() {
        return "Casa en " + ciudad + " - " + direccion
                + ", consumo mensual: " + consumoMensualKWh + " kWh";
    }
}