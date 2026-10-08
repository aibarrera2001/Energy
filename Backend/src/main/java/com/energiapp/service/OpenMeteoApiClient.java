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
            "https://api.open-meteo.com/v1/forecast?latitude=%.6f&longitude=%.6f&daily=shortwave_radiation_sum&timezone=auto",
            latitud, longitud
        );

        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        JSONObject json = new JSONObject(response.body());
        JSONObject daily = json.getJSONObject("daily");
        JSONArray radiationArray = daily.getJSONArray("shortwave_radiation_sum");

        double sumaMj = 0;
        int count = radiationArray.length();
        for (int i = 0; i < count; i++) {
            sumaMj += radiationArray.getDouble(i);
        }
        return (sumaMj / count) / 3.6;
    }
}