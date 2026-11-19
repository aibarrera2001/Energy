package com.energiapp.service;

import org.springframework.stereotype.Component;
import org.json.JSONArray;
import org.json.JSONObject;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Component
public class OpenMeteoApiClient {

    private final HttpClient httpClient;

    public OpenMeteoApiClient() {
        this.httpClient = HttpClient.newHttpClient();
    }

    public double[] obtenerCoordenadas(String direccion) throws Exception {
        String direccionEncoded = URLEncoder.encode(direccion, StandardCharsets.UTF_8);
        String url = "https://geocoding-api.open-meteo.com/v1/search?name=" + direccionEncoded + "&count=1&language=es&format=json";

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        JSONObject json = new JSONObject(response.body());
        if (json.has("results") && !json.getJSONArray("results").isEmpty()) {
            JSONObject location = json.getJSONArray("results").getJSONObject(0);
            return new double[]{ location.getDouble("latitude"), location.getDouble("longitude") };
        }
        throw new IllegalArgumentException("No se encontraron coordenadas para: " + direccion);
    }

    public double obtenerRadiacionDiariaKwh(double latitud, double longitud) throws Exception {
        String url = String.format(
            Locale.US,
            "https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f&daily=shortwave_radiation_sum&timezone=America%%2FBogota",
            latitud, longitud
        );

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .header("Accept", "application/json")
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        JSONObject json = new JSONObject(response.body());

        if (response.statusCode() != 200 || !json.has("daily")) {
            String motivo = json.optString("reason", response.body());
            throw new IllegalStateException("Open-Meteo HTTP " + response.statusCode() + ": " + motivo);
        }

        JSONObject daily = json.getJSONObject("daily");
        JSONArray radiationArray = daily.getJSONArray("shortwave_radiation_sum");

        double sumaMj = 0;
        int validos = 0;
        for (int i = 0; i < radiationArray.length(); i++) {
            if (!radiationArray.isNull(i)) {
                sumaMj += radiationArray.getDouble(i);
                validos++;
            }
        }

        if (validos == 0) {
            throw new IllegalStateException("Open-Meteo no devolvió valores numéricos de radiación.");
        }

        return (sumaMj / validos) / 3.6;
    }
}