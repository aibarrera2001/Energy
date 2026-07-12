# EnergicApps

Proyecto Java migrado a Maven con estructura estándar:

- `pom.xml` con dependencia de Google Maps Services
- `src/main/java/sistemapanelessolares/app` con las clases actuales

## Importar

1. Abre el proyecto como proyecto Maven en tu IDE.
2. Ejecuta `mvn compile` o `mvn package`.
3. Ejecuta `mvn exec:java` si configuras el plugin `exec` o ejecuta la clase `sistemapanelessolares.app.main`.

## Dependencia principal

```xml
<dependency>
  <groupId>com.google.maps</groupId>
  <artifactId>google-maps-services</artifactId>
  <version>2.1.0</version>
</dependency>
```

Puedes agregar código adicional para usar la API de Google Maps a partir de esta base.
