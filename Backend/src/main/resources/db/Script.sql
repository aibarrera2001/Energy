BEGIN;

-- ----------------------------------------------------------------
-- 1) EMPRESAS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa          SERIAL PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    nit                 VARCHAR(30) UNIQUE,
    ciudad              VARCHAR(100),
    direccion           VARCHAR(200),
    telefono            VARCHAR(30),
    email               VARCHAR(150) UNIQUE, -- Correo institucional/general de la empresa
    estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
    region              VARCHAR(50) DEFAULT 'COSTA_CARIBEÑA',
    descripcion_aportes TEXT,
    diferenciadores     TEXT,
    fecha_registro      TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2) USUARIOS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario          SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    correo              VARCHAR(150) NOT NULL UNIQUE,
    telefono            VARCHAR(30),
    contrasena          VARCHAR(255) NOT NULL,
    ciudad              VARCHAR(100),
    estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
    fecha_registro      TIMESTAMP NOT NULL DEFAULT now(),
    ultimo_login        TIMESTAMP
);

-- ----------------------------------------------------------------
-- 3) ADMINISTRATIVOS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrativos (
    id                  SERIAL PRIMARY KEY,
    empresa_id          INT NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100),
    telefono            VARCHAR(30),
    rol                 VARCHAR(50) DEFAULT 'ADMIN',
    correo              VARCHAR(150) NOT NULL UNIQUE,
    contrasena          VARCHAR(200) NOT NULL,
    fecha_registro      TIMESTAMP NOT NULL DEFAULT now()
);
-- ----------------------------------------------------------------
-- 4) CASAS (Soporta Casa, Apartamento, Edificio y Finca)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casas (
    id_casa                     SERIAL PRIMARY KEY,
    id_usuario                  INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    tipo_propiedad              VARCHAR(30) NOT NULL DEFAULT 'CASA', 
                                -- Valores: 'CASA' | 'APARTAMENTO' | 'EDIFICIO' | 'FINCA'
    
    -- Dirección física (Aplica para Casa, Apartamento, Edificio)
    direccion                   VARCHAR(200), 
    ciudad                      VARCHAR(100),
    
    -- Coordenadas Geográficas (Obligatorias para Finca, opcionales para otras)
    latitud                     DOUBLE PRECISION DEFAULT 0,
    longitud                    DOUBLE PRECISION DEFAULT 0,
    
    -- Métricas específicas según el tipo de propiedad (m2)
    area_terraza_techo_m2       DOUBLE PRECISION, -- Para Apartamento / Casa
    area_balcon_m2              DOUBLE PRECISION, -- Para Edificio
    area_disponible_m2          DOUBLE PRECISION, -- Para Finca
    
    consumo_mensual             DOUBLE PRECISION NOT NULL DEFAULT 0,
    imagen_ubicacion_url        TEXT,
    modelo_3d_url               TEXT
);

-- ----------------------------------------------------------------
-- 5) CATALOGOS Y MATERIALES (Paneles, Conversores, Baterías, Cables)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paneles_solares (
    id                  SERIAL PRIMARY KEY,
    nombre              VARCHAR(150) NOT NULL,
    tipo                VARCHAR(50) NOT NULL,
    potencia_w          DOUBLE PRECISION NOT NULL,
    eficiencia          DOUBLE PRECISION NOT NULL,
    precio              DOUBLE PRECISION NOT NULL,
    costo_instalacion   DOUBLE PRECISION NOT NULL DEFAULT 0,
    garantia_anios      VARCHAR(10),
    descripcion         TEXT,
    empresa_id          INT REFERENCES empresas(id_empresa) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS conversores (
    id                      SERIAL PRIMARY KEY,
    nombre                  VARCHAR(150),
    capacidad_conversion   DOUBLE PRECISION NOT NULL, -- Watts (W) / kW
    precio                  DOUBLE PRECISION NOT NULL,
    stock                   INT NOT NULL DEFAULT 0,
    empresa_id              INT REFERENCES empresas(id_empresa) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS baterias (
    id                      SERIAL PRIMARY KEY,
    nombre                  VARCHAR(150),
    capacidad_carga         DOUBLE PRECISION NOT NULL, -- Ah / kWh
    precio                  DOUBLE PRECISION NOT NULL,
    stock                   INT NOT NULL DEFAULT 0,
    porcentaje_carga        DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    empresa_id              INT REFERENCES empresas(id_empresa) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cables (
    id                              SERIAL PRIMARY KEY,
    diametro                        DOUBLE PRECISION NOT NULL, -- mm
    capacidad_transporte_energia    DOUBLE PRECISION NOT NULL, -- Amperios (A)
    precio                          DOUBLE PRECISION NOT NULL, -- Precio x metro
    stock                           INT NOT NULL DEFAULT 0,    -- Metros disponibles
    empresa_id                      INT REFERENCES empresas(id_empresa) ON DELETE SET NULL
);

-- ----------------------------------------------------------------
-- 6) COMPONENTES INSTALADOS EN CASAS (1 a Muchos)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casa_paneles (
    id_casa_panel       SERIAL PRIMARY KEY,
    id_casa             INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    id_panel            INT NOT NULL REFERENCES paneles_solares(id),
    cantidad            INT NOT NULL DEFAULT 1,
    fecha_instalacion   DATE DEFAULT CURRENT_DATE
);

CREATE TABLE IF NOT EXISTS casa_conversores (
    id_casa_conversor   SERIAL PRIMARY KEY,
    id_casa             INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    id_conversor        INT NOT NULL REFERENCES conversores(id),
    cantidad            INT NOT NULL DEFAULT 1,
    fecha_instalacion   DATE DEFAULT CURRENT_DATE
);

-- ----------------------------------------------------------------
-- 7) FACTURAS
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS facturas (
    id_factura                      SERIAL PRIMARY KEY,
    id_usuario                      INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_casa                         INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    empresa_id                      INT NOT NULL REFERENCES empresas(id_empresa),
    precio_paneles                  DOUBLE PRECISION NOT NULL DEFAULT 0,
    precio_conversores              DOUBLE PRECISION NOT NULL DEFAULT 0,
    precio_baterias                 DOUBLE PRECISION NOT NULL DEFAULT 0,
    precio_cables                   DOUBLE PRECISION NOT NULL DEFAULT 0,
    costo_instalacion_servicios     DOUBLE PRECISION NOT NULL DEFAULT 0,
    monto_total                     DOUBLE PRECISION NOT NULL,
    estado_pago                     VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | PAGADO | CANCELADO
    fecha_emision                   TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 8) CITAS (Instalación, Mantenimiento y Arreglo)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citas (
    id_cita             SERIAL PRIMARY KEY,
    empresa_id          INT NOT NULL REFERENCES empresas(id_empresa),
    id_usuario          INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_casa             INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    tipo_servicio       VARCHAR(20) NOT NULL, -- 'INSTALACION' | 'MANTENIMIENTO' | 'ARREGLO'
    
    -- Relación para servicio de INSTALACION
    id_factura          INT REFERENCES facturas(id_factura) ON DELETE SET NULL,
    
    -- Información de servicio de ARREGLO
    articulo_danado     VARCHAR(30), -- 'PANEL' | 'CABLE' | 'INVERSOR' | 'BATERIA'
    descripcion_danio   TEXT,
    
    fecha               DATE NOT NULL,
    hora                TIME NOT NULL,
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE', -- PENDIENTE | EN_PROCESO | FINALIZADA | CANCELADA
    tecnico_asignado    VARCHAR(150),
    notas               TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS registros_servicios (
    id_servicio         SERIAL PRIMARY KEY,
    empresa_id          INT NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    id_usuario          INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_casa             INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    tipo_servicio       VARCHAR(50) NOT NULL, -- 'INSTALACION' | 'MANTENIMIENTO'
    monto_cobrado       DOUBLE PRECISION NOT NULL,
    fecha_servicio      DATE NOT NULL DEFAULT CURRENT_DATE,
    descripcion         TEXT
);
-- ----------------------------------------------------------------
-- 9) MANTENIMIENTOS (Historial y Registro de Trabajos)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mantenimientos (
    id_mantenimiento            SERIAL PRIMARY KEY,
    empresa_id                  INT NOT NULL REFERENCES empresas(id_empresa),
    id_usuario                  INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_casa                     INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    tipo_mantenimiento          VARCHAR(20) NOT NULL, -- PREVENTIVO | CORRECTIVO
    fecha_programada            DATE NOT NULL,
    fecha_realizada             DATE,
    estado                      VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    descripcion_trabajo         TEXT,
    tecnico_asignado            VARCHAR(150),
    costo                       DOUBLE PRECISION DEFAULT 0,
    observaciones               TEXT,
    fecha_proximo_mantenimiento DATE
);
BEGIN;

CREATE TABLE IF NOT EXISTS historial_predicciones (
    id_prediccion       SERIAL PRIMARY KEY,
    id_usuario          INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    id_casa             INT NOT NULL REFERENCES casas(id_casa) ON DELETE CASCADE,
    empresa_id          INT NOT NULL REFERENCES empresas(id_empresa),
    id_panel            INT NOT NULL REFERENCES paneles_solares(id),
    cantidad_paneles    INT NOT NULL DEFAULT 1,
    
    -- Métricas meteorológicas obtenidas de Open-Meteo
    radiacion_diaria_kwh DOUBLE PRECISION NOT NULL, -- Direct normal / global horizontal irradiance
    
    -- Resultados de la estimación
    generacion_estimada_kwh_mes DOUBLE PRECISION NOT NULL,
    ahorro_estimado_cop_mes    DOUBLE PRECISION NOT NULL,
    co2_evitado_ton_anio       DOUBLE PRECISION NOT NULL,
    
    fecha_calculo       TIMESTAMP NOT NULL DEFAULT now()
);
-- ----------------------------------------------------------------
-- 11) CHATBOT E HISTORIAL DE MENSAJES (Fase 5)
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chat_mensajes (
    id_mensaje        SERIAL PRIMARY KEY,
    id_usuario        INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    empresa_id        INT NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    mensaje_usuario   TEXT NOT NULL,
    respuesta_bot     TEXT NOT NULL,
    fecha_envio       TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 10) Índices de Optimización
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_casas_usuario         ON casas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_casa_paneles_casa     ON casa_paneles(id_casa);
CREATE INDEX IF NOT EXISTS idx_casa_conversor_casa   ON casa_conversores(id_casa);
CREATE INDEX IF NOT EXISTS idx_facturas_usuario_casa ON facturas(id_usuario, id_casa);
CREATE INDEX IF NOT EXISTS idx_citas_factura         ON citas(id_factura);
CREATE INDEX IF NOT EXISTS idx_citas_empresa_fecha   ON citas(empresa_id, fecha);
CREATE INDEX IF NOT EXISTS idx_predicciones_usuario ON historial_predicciones(id_usuario);
CREATE INDEX IF NOT EXISTS idx_predicciones_casa    ON historial_predicciones(id_casa);
CREATE INDEX IF NOT EXISTS idx_chat_usuario_empresa ON chat_mensajes(id_usuario, empresa_id);

COMMIT;