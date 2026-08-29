package sistemapanelessolares.dominio;

public final class SolarAPIUsuario {

    private SolarAPIUsuario() {
        // Clase utilitaria de estimación solar.
    }

    public static double obtenerHorasSolPico(double latitud, double longitud, String ciudad) {
        if (ciudad != null && !ciudad.trim().isEmpty()) {
            String ciudadNormalizada = ciudad.trim().toLowerCase();

            if (ciudadNormalizada.contains("barranquilla") || ciudadNormalizada.contains("cartagena")
                    || ciudadNormalizada.contains("santa marta") || ciudadNormalizada.contains("caribe")) {
                return 5.8;
            }
            if (ciudadNormalizada.contains("medellin") || ciudadNormalizada.contains("pereira")
                    || ciudadNormalizada.contains("cali")) {
                return 5.3;
            }
            if (ciudadNormalizada.contains("bogota") || ciudadNormalizada.contains("cundinamarca")) {
                return 4.9;
            }
        }

        double absLatitud = Math.abs(latitud);
        if (absLatitud <= 5) return 5.8;
        if (absLatitud <= 12) return 5.5;
        if (absLatitud <= 20) return 5.1;
        if (absLatitud <= 30) return 4.8;
        return 4.2;
    }
}
