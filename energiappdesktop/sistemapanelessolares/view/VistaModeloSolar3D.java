package sistemapanelessolares.view;

import javafx.scene.AmbientLight;
import javafx.scene.Group;
import javafx.scene.Node;
import javafx.scene.PerspectiveCamera;
import javafx.scene.PointLight;
import javafx.scene.SceneAntialiasing;
import javafx.scene.SubScene;
import javafx.scene.paint.Color;
import javafx.scene.paint.PhongMaterial;
import javafx.scene.shape.Box;
import javafx.scene.transform.Rotate;
import sistemapanelessolares.dominio.Apartamento;
import sistemapanelessolares.dominio.Casa;
import sistemapanelessolares.dominio.CasaUnifamiliar;
import sistemapanelessolares.dominio.Edificio;
import sistemapanelessolares.dominio.PanelSolar;

public class VistaModeloSolar3D {

    private static final Color COLOR_PISO = Color.web("#E8F2ED");
    private static final Color COLOR_PARED = Color.web("#D9E4F2");
    private static final Color COLOR_TECHO = Color.web("#D3D8DC");
    private static final Color COLOR_PANEL = Color.web("#E9B84D");
    private static final Color COLOR_PANEL_OMBRE = Color.web("#C89A2A");
    private static final Color COLOR_VENTANA = Color.web("#7DB7E8");
    private static final Color COLOR_EDIFICIO = Color.web("#CEDAEA");
    private static final Color COLOR_MARCO = Color.web("#6E7F90");

    public static final class OrbitState {
        public final Rotate rotateX = new Rotate(-18, Rotate.X_AXIS);
        public final Rotate rotateY = new Rotate(0, Rotate.Y_AXIS);
        public double distancia = -900;
        public double mouseX;
        public double mouseY;
        public double anguloInicialX;
        public double anguloInicialY;
    }

    public static Group crearModelo3D(Casa casa, PanelSolar panel, int numeroPaneles) {
        Group root = new Group();
        root.setAutoSizeChildren(true);

        Group mundo = new Group();
        mundo.setId("modeloSolarMundo");

        Box piso = new Box(700, 12, 500);
        piso.setTranslateY(180);
        piso.setMaterial(new PhongMaterial(COLOR_PISO));

        Group vivienda = crearVivienda(casa, panel, numeroPaneles);
        vivienda.setTranslateY(0);

        mundo.getChildren().addAll(piso, vivienda);

        OrbitState orbit = new OrbitState();
        mundo.getTransforms().setAll(orbit.rotateX, orbit.rotateY);
        mundo.setUserData(orbit);

        AmbientLight ambientLight = new AmbientLight(Color.web("#FFFFFF", 0.85));
        PointLight pointLight = new PointLight(Color.web("#FFFFFF", 0.9));
        pointLight.setTranslateX(250);
        pointLight.setTranslateY(-200);
        pointLight.setTranslateZ(-500);

        root.getChildren().addAll(ambientLight, pointLight, mundo);
        return root;
    }

    public static SubScene crearSubScene(Casa casa, PanelSolar panel, int numeroPaneles) {
        Group root = crearModelo3D(casa, panel, numeroPaneles);

        Group mundo = (Group) root.lookup("#modeloSolarMundo");
        OrbitState orbit = (OrbitState) mundo.getUserData();

        PerspectiveCamera camera = new PerspectiveCamera(true);
        camera.setNearClip(0.1);
        camera.setFarClip(10000.0);
        camera.setFieldOfView(38);
        camera.setTranslateZ(orbit.distancia);
        camera.setTranslateY(-80);

        Group grupoCamara = new Group();
        grupoCamara.getChildren().add(camera);
        mundo.getChildren().add(grupoCamara);

        SubScene subScene = new SubScene(root, 820, 460, true, SceneAntialiasing.BALANCED);
        subScene.setFill(Color.web("#EEF3F7"));
        subScene.setCamera(camera);

        configurarOrbita(subScene, mundo, orbit, camera);
        actualizarCamara(subScene, mundo, orbit, camera);
        return subScene;
    }

    public static Node crearVistaResumen(Casa casa, PanelSolar panel, int numeroPaneles) {
        Group root = crearModelo3D(casa, panel, numeroPaneles);
        return root;
    }

    public static void aplicarVista(SubScene subScene, String tipoVista) {
        if (subScene == null || subScene.getRoot() == null) return;
        Group mundo = (Group) subScene.getRoot().lookup("#modeloSolarMundo");
        if (mundo == null) return;
        OrbitState orbit = (OrbitState) mundo.getUserData();
        if (orbit == null) return;

        switch (tipoVista) {
            case "frontal" -> {
                orbit.rotateY.setAngle(0);
                orbit.rotateX.setAngle(-18);
                orbit.distancia = -900;
            }
            case "superior" -> {
                orbit.rotateY.setAngle(0);
                orbit.rotateX.setAngle(-88);
                orbit.distancia = -1100;
            }
            case "lateral" -> {
                orbit.rotateY.setAngle(90);
                orbit.rotateX.setAngle(-18);
                orbit.distancia = -950;
            }
            case "reset" -> {
                orbit.rotateY.setAngle(0);
                orbit.rotateX.setAngle(-18);
                orbit.distancia = -900;
            }
            default -> {
                orbit.rotateY.setAngle(0);
                orbit.rotateX.setAngle(-18);
                orbit.distancia = -900;
            }
        }

        PerspectiveCamera camera = (PerspectiveCamera) subScene.getCamera();
        if (camera != null) {
            camera.setTranslateZ(orbit.distancia);
        }
    }

    private static void actualizarCamara(SubScene subScene, Group mundo, OrbitState orbit, PerspectiveCamera camera) {
        if (camera != null) {
            camera.setTranslateZ(orbit.distancia);
            camera.setTranslateY(-80);
        }
        if (mundo != null) {
            mundo.getTransforms().setAll(orbit.rotateX, orbit.rotateY);
        }
    }

    private static void configurarOrbita(SubScene subScene, Group mundo, OrbitState orbit, PerspectiveCamera camera) {
        subScene.setOnMousePressed(event -> {
            orbit.mouseX = event.getSceneX();
            orbit.mouseY = event.getSceneY();
            orbit.anguloInicialX = orbit.rotateX.getAngle();
            orbit.anguloInicialY = orbit.rotateY.getAngle();
        });

        subScene.setOnMouseDragged(event -> {
            double deltaX = event.getSceneX() - orbit.mouseX;
            double deltaY = event.getSceneY() - orbit.mouseY;

            orbit.rotateY.setAngle(orbit.anguloInicialY + deltaX * 0.4);
            orbit.rotateX.setAngle(orbit.anguloInicialX - deltaY * 0.35);
            actualizarCamara(subScene, mundo, orbit, camera);
        });

        subScene.setOnScroll(event -> {
            orbit.distancia += event.getDeltaY() * 0.8;
            if (orbit.distancia > -250) orbit.distancia = -250;
            if (orbit.distancia < -2200) orbit.distancia = -2200;
            actualizarCamara(subScene, mundo, orbit, camera);
        });
    }

    private static Group crearVivienda(Casa casa, PanelSolar panel, int numeroPaneles) {
        Group vivienda = new Group();

        if (casa instanceof CasaUnifamiliar) {
            vivienda.getChildren().add(crearCasaUnifamiliar((CasaUnifamiliar) casa, numeroPaneles));
        } else if (casa instanceof Apartamento) {
            vivienda.getChildren().add(crearApartamento((Apartamento) casa, numeroPaneles));
        } else if (casa instanceof Edificio) {
            vivienda.getChildren().add(crearEdificio((Edificio) casa, numeroPaneles));
        } else {
            vivienda.getChildren().add(crearCasaBase(numeroPaneles));
        }

        return vivienda;
    }

    private static Group crearCasaBase(int numeroPaneles) {
        Group group = new Group();

        Box pared = new Box(360, 170, 300);
        pared.setTranslateY(90);
        pared.setMaterial(new PhongMaterial(COLOR_PARED));

        Box techo = new Box(420, 18, 340);
        techo.setTranslateY(200);
        techo.setRotationAxis(Rotate.Z_AXIS);
        techo.setRotate(12);
        techo.setMaterial(new PhongMaterial(COLOR_TECHO));

        Box puerta = new Box(80, 120, 20);
        puerta.setTranslateX(0);
        puerta.setTranslateY(70);
        puerta.setTranslateZ(155);
        puerta.setMaterial(new PhongMaterial(Color.web("#8A5E3B")));

        group.getChildren().addAll(pared, techo, puerta, crearPaneles(numeroPaneles, 260, 195, 30, true));
        return group;
    }

    private static Group crearCasaUnifamiliar(CasaUnifamiliar casa, int numeroPaneles) {
        Group group = new Group();

        Box pared = new Box(420, 180, 340);
        pared.setTranslateY(95);
        pared.setMaterial(new PhongMaterial(COLOR_PARED));

        Box techo = new Box(470, 20, 390);
        techo.setTranslateY(210);
        techo.setRotationAxis(Rotate.Z_AXIS);
        techo.setRotate(22);
        techo.setMaterial(new PhongMaterial(COLOR_TECHO));

        Box puerta = new Box(80, 120, 18);
        puerta.setTranslateY(70);
        puerta.setTranslateZ(175);
        puerta.setMaterial(new PhongMaterial(Color.web("#8A5E3B")));

        Box ventana1 = new Box(90, 70, 16);
        ventana1.setTranslateX(-120);
        ventana1.setTranslateY(90);
        ventana1.setTranslateZ(175);
        ventana1.setMaterial(new PhongMaterial(COLOR_VENTANA));

        Box ventana2 = new Box(90, 70, 16);
        ventana2.setTranslateX(120);
        ventana2.setTranslateY(90);
        ventana2.setTranslateZ(175);
        ventana2.setMaterial(new PhongMaterial(COLOR_VENTANA));

        group.getChildren().addAll(pared, techo, puerta, ventana1, ventana2);
        group.getChildren().add(crearPaneles(numeroPaneles, 260, 205, 24, true));
        return group;
    }

    private static Group crearApartamento(Apartamento casa, int numeroPaneles) {
        Group group = new Group();

        Box bloque = new Box(350, 220, 260);
        bloque.setTranslateY(110);
        bloque.setMaterial(new PhongMaterial(COLOR_EDIFICIO));

        Box balcon = new Box(240, 15, 120);
        balcon.setTranslateY(220);
        balcon.setTranslateZ(145);
        balcon.setMaterial(new PhongMaterial(Color.web("#D9DEE4")));

        Box techo = new Box(390, 18, 300);
        techo.setTranslateY(240);
        techo.setMaterial(new PhongMaterial(COLOR_TECHO));

        Box ventana1 = new Box(80, 70, 16);
        ventana1.setTranslateX(-90);
        ventana1.setTranslateY(110);
        ventana1.setTranslateZ(135);
        ventana1.setMaterial(new PhongMaterial(COLOR_VENTANA));

        Box ventana2 = new Box(80, 70, 16);
        ventana2.setTranslateX(90);
        ventana2.setTranslateY(110);
        ventana2.setTranslateZ(135);
        ventana2.setMaterial(new PhongMaterial(COLOR_VENTANA));

        group.getChildren().addAll(bloque, balcon, techo, ventana1, ventana2);
        group.getChildren().add(crearPaneles(Math.max(4, numeroPaneles / 2), 250, 245, 18, true));
        return group;
    }

    private static Group crearEdificio(Edificio casa, int numeroPaneles) {
        Group group = new Group();

        Box torre = new Box(520, 300, 360);
        torre.setTranslateY(150);
        torre.setMaterial(new PhongMaterial(COLOR_EDIFICIO));

        Box azotea = new Box(560, 22, 420);
        azotea.setTranslateY(320);
        azotea.setMaterial(new PhongMaterial(COLOR_TECHO));

        Box ventana1 = new Box(80, 90, 18);
        ventana1.setTranslateX(-150);
        ventana1.setTranslateY(150);
        ventana1.setTranslateZ(185);
        ventana1.setMaterial(new PhongMaterial(COLOR_VENTANA));

        Box ventana2 = new Box(80, 90, 18);
        ventana2.setTranslateX(150);
        ventana2.setTranslateY(150);
        ventana2.setTranslateZ(185);
        ventana2.setMaterial(new PhongMaterial(COLOR_VENTANA));

        group.getChildren().addAll(torre, azotea, ventana1, ventana2);
        group.getChildren().add(crearPaneles(Math.max(8, numeroPaneles), 290, 320, 24, true));
        return group;
    }

    private static Group crearPaneles(int totalPaneles, double centroX, double centroY, double altoPanel, boolean inclinado) {
        Group paneles = new Group();
        int total = Math.max(1, totalPaneles);
        int columnas = 3;
        int filas = (int) Math.ceil((double) total / columnas);
        double pasoX = 80;
        double pasoZ = 70;
        double inicioX = -((columnas - 1) * pasoX) / 2.0;
        double inicioZ = -((filas - 1) * pasoZ) / 2.0;

        int contador = 0;
        for (int fila = 0; fila < filas && contador < total; fila++) {
            for (int col = 0; col < columnas && contador < total; col++) {
                Box panel = new Box(60, altoPanel, 42);
                panel.setTranslateX(centroX + inicioX + (col * pasoX));
                panel.setTranslateY(centroY);
                panel.setTranslateZ(inicioZ + (fila * pasoZ));
                panel.setMaterial(new PhongMaterial(COLOR_PANEL));
                panel.setRotationAxis(Rotate.X_AXIS);
                panel.setRotate(inclinado ? 18 : 0);

                Box marco = new Box(68, altoPanel + 3, 50);
                marco.setTranslateX(panel.getTranslateX());
                marco.setTranslateY(panel.getTranslateY());
                marco.setTranslateZ(panel.getTranslateZ());
                marco.setMaterial(new PhongMaterial(COLOR_MARCO));
                marco.setOpacity(0.45);

                paneles.getChildren().addAll(marco, panel);
                contador++;
            }
        }
        return paneles;
    }
}
