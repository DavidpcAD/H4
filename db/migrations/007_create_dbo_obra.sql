-- ============================================
-- Objeto:      dbo.Obra
-- Tipo:        TABLE
-- Descripción: Catálogo de obras (portado de bi.dim_obra, nombres en español).
-- Autor:       migración H4
-- Fecha:       2026-06-22
-- Modificado:
-- ============================================

IF OBJECT_ID('dbo.Obra', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Obra (
        -- ids
        idObra                    BIGINT          IDENTITY(1,1)   NOT NULL,

        -- negocio
        numeroObra                NVARCHAR(20)    NOT NULL,
        nombreMostrado            NVARCHAR(250)   NULL,
        descripcion               NVARCHAR(250)   NULL,
        centroCosto               NVARCHAR(20)    NULL,
        areaCosteo                NVARCHAR(20)    NULL,
        proyectoPadre             NVARCHAR(10)    NULL,
        areaProrrateadaM2         DECIMAL(20,5)   NULL,
        gerenteProyecto           NVARCHAR(100)   NULL,
        idEncargado               NVARCHAR(100)   NULL,
        ubicacion                 NVARCHAR(100)   NULL,
        estado                    NVARCHAR(50)    NULL,
        fechaInicio               DATE            NULL,
        fechaFin                  DATE            NULL,
        fechaCreacionObra         DATE            NULL,
        precioNormalMaquinaria    DECIMAL(20,5)   NULL,
        precioConcretoMaquinaria  DECIMAL(20,5)   NULL,
        origenPrincipal           NVARCHAR(20)    NULL,

        -- auditoría
        fechaCreacion             DATETIME2       NOT NULL    CONSTRAINT df_obra_fechaCreacion DEFAULT GETDATE(),
        creadoPor                 NVARCHAR(100)   NOT NULL,
        fechaModificacion         DATETIME2       NULL,
        modificadoPor             NVARCHAR(100)   NULL,

        -- constraints
        CONSTRAINT pk_obra PRIMARY KEY (idObra),
        CONSTRAINT ux_obra_numeroObra UNIQUE (numeroObra)
    );
END
GO

-- índices (según los de origen)
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_areaCosteo')
    CREATE NONCLUSTERED INDEX ix_obra_areaCosteo ON dbo.Obra (areaCosteo);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_centroCosto')
    CREATE NONCLUSTERED INDEX ix_obra_centroCosto ON dbo.Obra (centroCosto);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='ix_obra_proyectoPadre')
    CREATE NONCLUSTERED INDEX ix_obra_proyectoPadre ON dbo.Obra (proyectoPadre);
GO

-- datos (solo si la tabla está vacía)
IF NOT EXISTS (SELECT 1 FROM dbo.Obra)
BEGIN
    INSERT INTO dbo.Obra (numeroObra, nombreMostrado, descripcion, centroCosto, areaCosteo, proyectoPadre, areaProrrateadaM2, gerenteProyecto, idEncargado, ubicacion, estado, fechaInicio, fechaFin, fechaCreacionObra, precioNormalMaquinaria, precioConcretoMaquinaria, origenPrincipal, creadoPor) VALUES
        (N'ALM-SSO', N'Seguridad ocupacional', N'Seguridad ocupacional', N'ALM-SSO', N'IND VAR', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-06', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'COM-FORM', N'Formalización', N'Formalización', N'COM-FORM', N'COM FORM', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'COM-MER', N'Mercadeo', N'Mercadeo', N'COM-MER', N'COM MERC', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'COM-VENT', N'Ventas', N'Ventas', N'COM-VENT', N'COM VENT', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-D. JOSE', N'CS-D. JOSE', NULL, N'CS-D. JOSE', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'CS-D.JOSE', N'Casa Don Jose', N'Casa Don Jose', N'CS-D.JOSE', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-DANIEL', N'Casa Daniel', N'Casa Daniel', N'CS-DANIEL', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-DAVID', N'Casa David', N'Casa David', N'CS-DAVID', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-GILDA', N'Casa Doña Gilda', N'Casa Doña Gilda', N'CS-GILDA', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-JOSE H.', N'Casa Jose Hijo', N'Casa Jose Hijo', N'CS-JOSE H.', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-LUIS R.', N'Casa Luis Roberto', N'Casa Luis Roberto', N'CS-LUIS R.', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'CS-MARCOS', N'Casa Marcos', N'Casa Marcos', N'CS-MARCOS', N'UTD ANTICIPADA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-AGREGADO', N'Agregados', N'Agregados', N'F-AGREGADO', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-09', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-MAD-NUE', N'Fabrica Maderas Nuevas', N'Fabrica Maderas Nuevas', N'F-MAD-NUE', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-MADERAS', N'Fabrica Maderas', N'Fabrica Maderas', N'F-MADERAS', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-METALES', N'Fabrica Metales', N'Fabrica Metales', N'F-METALES', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-MUEBLES', N'Fabrica Muebles', N'Fabrica Muebles', N'F-MUEBLES', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'F-PREFA', N'Fabrica Prefabricados de Concreto', N'Fabrica Prefabricados de Concreto', N'F-PREFA', N'PRO FABRICACION', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'FE-INC', N'Feriados en Incapacidades', N'Feriados en Incapacidades', N'FE-INC', N'ADM VAR', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'GEN-BAR', N'Generales Barani', N'Generales Barani', N'GEN-BAR', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'GEN-ILIOS', N'Generales Ilios', N'Generales Ilios', N'GEN-ILIOS', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-20', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'GEN-NOVA', N'Generales Novarum', N'Generales Novarum', N'GEN-NOVA', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'HER', N'Herramienta', N'Herramienta', N'HER', N'MAQ HER', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'HO-CEDERIC', N'Homes', N'Homes', N'HO-CEDERIC', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'HO-COOPER', N'HO-COOPER', NULL, N'HO-COOPER', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-05', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'HO-MALAVAS', N'Homes', N'Homes', N'HO-MALAVAS', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-BAR', N'Infraestructura Barani', N'Infraestructura Barani', N'INF-BAR', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-05', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-FIG', N'Infraestructura Figueres', N'Infraestructura Figueres', N'INF-FIG', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-GV-EST', N'Gran Vía Este', N'Gran Vía Este', N'INF-GV-EST', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-HDAII', N'Infraestructura HDA II', N'Infraestructura HDA II', N'INF-HDAII', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-PURIR', N'Infraestructura V. Santiago (Purires)', N'Infraestructura V. Santiago (Purires)', N'INF-PURIR', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'INF-SANT', N'INF-SANT', NULL, N'INF-SANT', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'MAQ', N'MAQUINARIA', N'MAQUINARIA', N'MAQ', N'MAQ VAR', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-30', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'O-EXTERNAS', N'Obras Externas', N'Obras Externas', N'O-EXTERNAS', N'PRO EXTERNOS', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'PD-AD-LOC', N'Adelante Locales', N'Adelante Locales', N'PD-AD-LOC', N'LC AD ALQ', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'PD-CNI-LOC', N'CNI Locales', N'CNI Locales', N'PD-CNI-LOC', N'LC CNI', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'POWER APP', N'POWER APP', NULL, N'POWER APP', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'PV-ILIOS', N'Post Venta Ilios', N'Post Venta Ilios', N'PV-ILIOS', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'PV-NOVARUM', N'Post Venta Novarum', N'Post Venta Novarum', N'PV-NOVARUM', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'QFI', N'Quinta Flor', N'Quinta Flor', N'QFI', N'PRO INFRA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'SSCC', N'Servicios Centrales', N'Servicios Centrales', N'SSCC', N'ADM FIJOS', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-30', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-1.01', N'Santorini Azotea', N'Santorini Azotea', N'VB-1.01', N'PRO VIVIENDA', NULL, 187.58000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-1.02', N'Santorini Especial', N'Santorini Especial', N'VB-1.02', N'PRO VIVIENDA', NULL, 190.43000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-03-03', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-1.03', N'VB-1.03', NULL, N'VB-1.03', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-06', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-1.17', N'Estella Especial Techo', N'Estella Especial Techo', N'VB-1.17', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-11', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-1.19', N'POR DEFINIR', N'POR DEFINIR', N'VB-1.19', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-06-09', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.01', N'VB-5.01', NULL, N'VB-5.01', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-06', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.12', N'Santorini Az', N'Santorini Az', N'VB-5.12', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-16', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.13', N'POR DEFINIR', N'POR DEFINIR', N'VB-5.13', N'PRO VIVIENDA', NULL, 198.80000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-03-23', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.14', N'Estella Az', N'Estella Az', N'VB-5.14', N'PRO VIVIENDA', NULL, 108.09000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-05', 0.00000, 0.00000, N'PRODUCTION', N'etl-import');
    INSERT INTO dbo.Obra (numeroObra, nombreMostrado, descripcion, centroCosto, areaCosteo, proyectoPadre, areaProrrateadaM2, gerenteProyecto, idEncargado, ubicacion, estado, fechaInicio, fechaFin, fechaCreacionObra, precioNormalMaquinaria, precioConcretoMaquinaria, origenPrincipal, creadoPor) VALUES
        (N'VB-5.15', N'Estella Techo', N'Estella Techo', N'VB-5.15', N'PRO VIVIENDA', NULL, 102.22000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-04-21', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.16', N'VB-5.16', NULL, N'VB-5.16', N'PRO VIVIENDA', NULL, 107.32000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-06', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.17', N'POR DEFINIR', N'POR DEFINIR', N'VB-5.17', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-04-28', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.22', N'Zante Az', N'Zante Az', N'VB-5.22', N'PRO VIVIENDA', NULL, 127.60000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-09', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-5.23', N'Gyro Az', N'Gyro Az', N'VB-5.23', N'PRO VIVIENDA', NULL, 145.79000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-10', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.02', N'Santorini Az', N'Santorini Az', N'VB-6.02', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-24', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.03', N'Santorini Azotea', N'Santorini Azotea', N'VB-6.03', N'PRO VIVIENDA', NULL, 149.57000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.07', N'Tebas Azotea', N'Tebas Azotea', N'VB-6.07', N'PRO VIVIENDA', NULL, 84.36000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.08', N'Caspe Azotea', N'Caspe Azotea', N'VB-6.08', N'PRO VIVIENDA', NULL, 87.93000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.24', N'Santorini Azotea', N'Santorini Azotea', N'VB-6.24', N'PRO VIVIENDA', NULL, 159.54000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-04-17', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VB-6.26', N'Santorini Azotea', N'Santorini Azotea', N'VB-6.26', N'PRO VIVIENDA', NULL, 160.62000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VC-D.01', N'Avila', N'Avila', N'VC-D.01', N'PRO VIVIENDA', NULL, 83.96000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VC-F.01', N'Toledo', N'Toledo', N'VC-F.01', N'PRO VIVIENDA', NULL, 66.10000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VI-11.22', N'SIN DEFINIR', N'SIN DEFINIR', N'VI-11.22', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-16', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VI-13.58', N'SIN DEFINIR', N'SIN DEFINIR', N'VI-13.58', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-16', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VI-14.52', N'SIN DEFINIR', N'SIN DEFINIR', N'VI-14.52', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-16', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VI-16.03', N'SIN DEFINIR', N'SIN DEFINIR', N'VI-16.03', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-16', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-A.06', N'Santorini Especial', N'Santorini Especial', N'VN-A.06', N'PRO VIVIENDA', NULL, 251.86000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-05-20', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-B.22', N'Estella 3D 2.5B Az', N'Estella 3D 2.5B Az', N'VN-B.22', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-06-17', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-B.23', N'VN-B.23', NULL, N'VN-B.23', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.24', N'Stella A 2D 1.5B (PA)', N'Stella A 2D 1.5B (PA)', N'VN-B.24', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-B.25', N'VN-B.25', NULL, N'VN-B.25', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.26', N'VN-B.26', NULL, N'VN-B.26', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.27', N'VN-B.27', NULL, N'VN-B.27', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.28', N'VN-B.28', NULL, N'VN-B.28', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.29', N'VN-B.29', NULL, N'VN-B.29', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.30', N'Santorini Azotea', N'Santorini Azotea', N'VN-B.30', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-B.31', N'VN-B.31', NULL, N'VN-B.31', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.32', N'VN-B.32', NULL, N'VN-B.32', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-B.33', N'Estella Azotea', N'Estella Azotea', N'VN-B.33', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-B.34', N'VN-B.34', NULL, N'VN-B.34', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.01', N'Zante Az', N'Zante Az', N'VN-C.01', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-25', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-C.02', N'VN-C.02', NULL, N'VN-C.02', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.03', N'Estella Az', N'Estella Az', N'VN-C.03', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-12-04', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-C.04', N'VN-C.04', NULL, N'VN-C.04', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.05', N'VN-C.05', NULL, N'VN-C.05', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.07', N'VN-C.07', NULL, N'VN-C.07', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.08', N'Estella Azotea', N'Estella Azotea', N'VN-C.08', N'PRO VIVIENDA', NULL, 108.09000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-C.09', N'VN-C.09', NULL, N'VN-C.09', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.10', N'Estella Techo', N'Estella Techo', N'VN-C.10', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-10-31', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-C.11', N'VN-C.11', NULL, N'VN-C.11', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.12', N'VN-C.12', NULL, N'VN-C.12', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.13', N'VN-C.13', NULL, N'VN-C.13', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.14', N'VN-C.14', NULL, N'VN-C.14', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.17', N'Zante Az', N'Zante Az', N'VN-C.17', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2026-01-20', 0.00000, 0.00000, N'PRODUCTION', N'etl-import'),
        (N'VN-C.18', N'VN-C.18', NULL, N'VN-C.18', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.19', N'VN-C.19', NULL, N'VN-C.19', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.20', N'VN-C.20', NULL, N'VN-C.20', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.21', N'VN-C.21', NULL, N'VN-C.21', N'PRO VIVIENDA', NULL, 0.00000, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, N'LEDGER', N'etl-import'),
        (N'VN-C.22', N'Zante Azotea', N'Zante Azotea', N'VN-C.22', N'PRO VIVIENDA', NULL, 109.20000, NULL, NULL, NULL, N'Open', '0001-01-01', '0001-01-01', '2025-11-02', 0.00000, 0.00000, N'PRODUCTION', N'etl-import');
END
GO

SELECT COUNT(*) AS filas FROM dbo.Obra;
GO
