-- ============================================================
--  EnergiApp — Aplicación de escritorio para EMPRESAS
--  Script de creación de base de datos (PostgreSQL / pgAdmin)
--  Generado a partir de: AdministrativoDAO, CasaDAO, CitaDAO,
--  EmpresaDAO, MantenimientoDAO, PanelSolarDAO
-- ============================================================
-- Ejecutar completo en el Query Tool de pgAdmin, sobre una base
-- de datos vacía (por ejemplo "energiapp").
-- ============================================================

BEGIN;

-- ----------------------------------------------------------------
-- 1) EMPRESAS
--    Cada fila es una empresa instaladora/mantenedora registrada
--    en el marketplace (creada desde la web, gestionada acá).
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id_empresa           SERIAL PRIMARY KEY,
    nombre               VARCHAR(150) NOT NULL,
    nit                  VARCHAR(30)  UNIQUE,
    ciudad               VARCHAR(100),
    direccion            VARCHAR(200),
    telefono             VARCHAR(30),
    email                VARCHAR(150) UNIQUE,
    estado               VARCHAR(20)  NOT NULL DEFAULT 'ACTIVA',  -- ACTIVA | INACTIVA | PENDIENTE_APROBACION
    region               VARCHAR(50)  DEFAULT 'COSTA_CARIBEÑA',
    descripcion_aportes  TEXT,  -- Qué aporta la empresa
    diferenciadores     TEXT,  -- En qué destaca
    correo_admin        VARCHAR(150),  -- Email del administrador
    contrasena_admin    VARCHAR(200),  -- Contraseña para inicio de sesión
    fecha_registro      TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 2) ADMINISTRATIVOS
--    Usuarios internos de la app de escritorio (empleados de una
--    empresa). AdministrativoDAO todavía no filtra por empresa_id
--    (ver nota al final), por eso la columna queda nullable.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS administrativos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    apellido    VARCHAR(100),
    telefono    VARCHAR(30),
    rol         VARCHAR(50),
    correo      VARCHAR(150) NOT NULL UNIQUE,
    contrasena  VARCHAR(200) NOT NULL,
    empresa_id  INT REFERENCES empresas(id_empresa)
);

-- ----------------------------------------------------------------
-- 3) PANELES_SOLARES
--    Catálogo de paneles. PanelSolarDAO todavía no filtra por
--    empresa_id (ver nota al final); la columna queda nullable
--    para no romper el guardar()/listarTodos() actuales.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS paneles_solares (
    id                 SERIAL PRIMARY KEY,
    nombre             VARCHAR(150) NOT NULL,
    tipo               VARCHAR(50)  NOT NULL,   -- Monocristalino | Policristalino | Thin-Film | Bifacial | PERC
    potencia_w         DOUBLE PRECISION NOT NULL,
    eficiencia         DOUBLE PRECISION NOT NULL,
    precio             DOUBLE PRECISION NOT NULL,
    costo_instalacion  DOUBLE PRECISION NOT NULL DEFAULT 0,
    garantia_anios     VARCHAR(10),
    descripcion        TEXT,
    empresa_id         INT REFERENCES empresas(id_empresa)
);

-- ----------------------------------------------------------------
-- 3.5) INVENTARIO_EMPRESA
--      Inventario de paneles específicos de cada empresa con
--      cantidades disponibles y precios personalizados
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS inventario_empresa (
    id_inventario    SERIAL PRIMARY KEY,
    empresa_id       INT NOT NULL REFERENCES empresas(id_empresa) ON DELETE CASCADE,
    nombre_panel     VARCHAR(150) NOT NULL,
    cantidad         INT NOT NULL DEFAULT 0,
    precio_empresa   DOUBLE PRECISION NOT NULL,
    fecha_agregado   TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE(empresa_id, nombre_panel)
);

-- ----------------------------------------------------------------
-- 4) USUARIOS
--    Usuarios finales de la plataforma (clientes/residentes)
--    que se registran para usar EnergiApp
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario          SERIAL PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    apellido            VARCHAR(100) NOT NULL,
    correo              VARCHAR(150) NOT NULL UNIQUE,
    telefono            VARCHAR(30),
    contrasena          VARCHAR(255) NOT NULL,
    ciudad              VARCHAR(100),
    estado              VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',  -- ACTIVO | INACTIVO | SUSPENDIDO
    fecha_registro      TIMESTAMP NOT NULL DEFAULT now(),
    ultimo_login        TIMESTAMP
);

-- ----------------------------------------------------------------
-- 5) CASAS
--    Propiedades del cliente (creadas desde la web). id_usuario
--    referencia al usuario en la tabla usuarios local.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS casas (
    id_casa                      SERIAL PRIMARY KEY,
    id_usuario                   INT NOT NULL REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    direccion                    VARCHAR(200) NOT NULL,
    ciudad                       VARCHAR(100),
    consumo_mensual              DOUBLE PRECISION NOT NULL DEFAULT 0,
    latitud                      DOUBLE PRECISION DEFAULT 0,
    longitud                     DOUBLE PRECISION DEFAULT 0,

    tipo_propiedad               VARCHAR(20) NOT NULL DEFAULT 'CASA',
    -- Valores esperados: 'CASA' | 'CASA_UNIFAMILIAR' | 'APARTAMENTO' | 'EDIFICIO'

    -- Campos de CasaUnifamiliar
    numero_pisos                 INT,
    area_techo_m2                DOUBLE PRECISION,
    tipo_techo                   VARCHAR(20),
    orientacion_techo            VARCHAR(20),
    pendiente_techo_grados       DOUBLE PRECISION,

    -- Campos de Apartamento
    piso                         INT,
    nombre_edificio               VARCHAR(150),
    tiene_balcon_terraza         BOOLEAN,
    area_balcon_m2               DOUBLE PRECISION,
    orientacion_balcon           VARCHAR(20),
    area_azotea_asignada_m2      DOUBLE PRECISION,

    -- Campos de Edificio
    numero_apartamentos          INT,
    area_azotea_total_m2         DOUBLE PRECISION,
    azotea_disponible_paneles    BOOLEAN,
    administrador_nombre         VARCHAR(150),
    administrador_telefono       VARCHAR(30),

    -- Comunes para modelado 3D
    imagen_ubicacion_url         TEXT,
    modelo_3d_url                TEXT
);

-- ----------------------------------------------------------------
-- 5) CITAS
--    empresa_id es obligatorio (CitaDAO siempre lo asigna, con
--    fallback a 1 si el objeto Cita no trae uno). id_usuario se
--    mantiene por compatibilidad con listarPorUsuario(), pero
--    CitaDAO.guardar() actualmente siempre inserta 0 ahí (ver nota
--    al final) — el dato real del cliente viaja en nombre_cliente.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS citas (
    id_cita             SERIAL PRIMARY KEY,
    empresa_id          INT NOT NULL REFERENCES empresas(id_empresa),
    id_usuario          INT NOT NULL DEFAULT 0,   -- legado; ver nota al final
    nombre_cliente       VARCHAR(150),
    id_casa             INT REFERENCES casas(id_casa),
    id_panel            INT REFERENCES paneles_solares(id),
    fecha               DATE NOT NULL,
    hora                TIME NOT NULL,
    tipo_servicio       VARCHAR(20) NOT NULL,     -- INSTALACION | MANTENIMIENTO | INSPECCION | COTIZACION
    estado              VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    direccion_visita    TEXT,
    notas               TEXT,
    tecnico_asignado    VARCHAR(150),
    motivo_cancelacion  TEXT,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------
-- 6) MANTENIMIENTOS
--    Mismo esquema de empresa_id/id_usuario/nombre_cliente que citas.
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mantenimientos (
    id_mantenimiento             SERIAL PRIMARY KEY,
    empresa_id                   INT NOT NULL REFERENCES empresas(id_empresa),
    id_usuario                   INT NOT NULL DEFAULT 0,  -- legado; ver nota al final
    nombre_cliente                VARCHAR(150),
    id_casa                      INT NOT NULL REFERENCES casas(id_casa),
    tipo_mantenimiento           VARCHAR(20) NOT NULL,    -- PREVENTIVO | CORRECTIVO
    fecha_programada             DATE NOT NULL,
    fecha_realizada               DATE,
    estado                       VARCHAR(20) NOT NULL DEFAULT 'PROGRAMADO',
    descripcion_trabajo          TEXT,
    tecnico_asignado             VARCHAR(150),
    costo                        DOUBLE PRECISION DEFAULT 0,
    observaciones                TEXT,
    fecha_proximo_mantenimiento  DATE
);

-- ----------------------------------------------------------------
-- 7) Índices para las consultas más usadas por los DAO
-- ----------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_administrativos_empresa   ON administrativos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_paneles_empresa            ON paneles_solares(empresa_id);
CREATE INDEX IF NOT EXISTS idx_casas_usuario               ON casas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_citas_empresa                ON citas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_citas_usuario                ON citas(id_usuario);
CREATE INDEX IF NOT EXISTS idx_citas_fecha_hora             ON citas(fecha, hora);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_empresa       ON mantenimientos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_casa          ON mantenimientos(id_casa);
CREATE INDEX IF NOT EXISTS idx_mantenimientos_fecha         ON mantenimientos(fecha_programada);

COMMIT;

-- ============================================================
-- 8) DATOS DE PRUEBA (opcional) — para arrancar la app ya con
--    algo que ver. Comenta este bloque si no lo necesitas.
-- ============================================================
BEGIN;

INSERT INTO empresas (nombre, nit, ciudad, direccion, telefono, email, estado)
VALUES ('Solar Caribe SAS', '900123456-1', 'Valledupar', 'Cra 7 #12-34', '3001234567', 'contacto@solarcaribe.com', 'ACTIVA')
ON CONFLICT (email) DO NOTHING;

-- Contraseña de prueba en texto plano: admin123
-- (el sistema actual guarda la contraseña tal cual — si vas a exponer
--  esto en producción, hay que migrar a hash antes de lanzar la web)
INSERT INTO administrativos (nombre, apellido, telefono, rol, correo, contrasena, empresa_id)
SELECT 'Ana', 'Martínez', '3007654321', 'ADMIN', 'admin@solarcaribe.com', 'admin123', id_empresa
FROM empresas WHERE email = 'contacto@solarcaribe.com'
ON CONFLICT (correo) DO NOTHING;

INSERT INTO paneles_solares (nombre, tipo, potencia_w, eficiencia, precio, costo_instalacion, garantia_anios, descripcion, empresa_id)
SELECT 'Canadian Solar HiKu', 'Policristalino', 370, 18.9, 210.00, 60.00, '10', 'Relación costo-beneficio óptima', id_empresa
FROM empresas WHERE email = 'contacto@solarcaribe.com';

COMMIT;