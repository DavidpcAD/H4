-- ============================================
-- Objeto:      dbo.Prestamo (cabecera) + dbo.PrestamoColaborador (detalle)
-- Tipo:        TABLE
-- Descripción: Solicitud de préstamo entre cuadrillas (cabecera) con uno o
--              varios trabajadores (detalle), rango de fechas, motivo y flujo
--              de aceptación. Migra la versión previa de un solo colaborador.
-- Autor:       migración H4
-- Fecha:       2026-06-24
-- Modificado:  cabecera+detalle para soportar 1 o varios trabajadores.
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 1) Cabecera (sin idColaborador). Crear si no existe (BD fresca).
IF OBJECT_ID('dbo.Prestamo', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Prestamo (
        idPrestamo          BIGINT          IDENTITY(1,1)   NOT NULL,
        idCuadrillaOrigen   INT             NOT NULL,
        idCuadrillaDestino  INT             NOT NULL,
        fechaDesde          DATE            NOT NULL,
        fechaHasta          DATE            NOT NULL,
        motivo              NVARCHAR(300)   NOT NULL,
        estado              NVARCHAR(20)    NOT NULL    CONSTRAINT df_prestamo_estado DEFAULT (N'Pendiente'),
        solicitadoPor       INT             NOT NULL,
        fechaSolicitudUtc   DATETIME2       NOT NULL    CONSTRAINT df_prestamo_fechaSolicitud DEFAULT SYSUTCDATETIME(),
        respondidoPor       INT             NULL,
        fechaRespuestaUtc   DATETIME2       NULL,
        fechaCreacion       DATETIME2       NOT NULL    CONSTRAINT df_prestamo_fechaCreacion DEFAULT GETDATE(),
        creadoPor           NVARCHAR(100)   NOT NULL,
        fechaModificacion   DATETIME2       NULL,
        modificadoPor       NVARCHAR(100)   NULL,
        CONSTRAINT pk_prestamo PRIMARY KEY (idPrestamo),
        CONSTRAINT ck_prestamo_estado CHECK (estado IN (N'Pendiente', N'Aceptado', N'Rechazado', N'Cancelado', N'Finalizado')),
        CONSTRAINT ck_prestamo_fechas CHECK (fechaHasta >= fechaDesde),
        CONSTRAINT ck_prestamo_cuadrillas CHECK (idCuadrillaOrigen <> idCuadrillaDestino),
        CONSTRAINT fk_prestamo_idCuadrillaOrigen FOREIGN KEY (idCuadrillaOrigen)
            REFERENCES dbo.Cuadrilla (IDCuadrilla) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_prestamo_idCuadrillaDestino FOREIGN KEY (idCuadrillaDestino)
            REFERENCES dbo.Cuadrilla (IDCuadrilla) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_prestamo_solicitadoPor FOREIGN KEY (solicitadoPor)
            REFERENCES dbo.Usuario (idUsuario) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_prestamo_respondidoPor FOREIGN KEY (respondidoPor)
            REFERENCES dbo.Usuario (idUsuario) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- 2) Migrar versión previa (un solo colaborador): quitar idColaborador de la cabecera.
IF COL_LENGTH('dbo.Prestamo', 'idColaborador') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_prestamo_idColaborador')
        ALTER TABLE dbo.Prestamo DROP CONSTRAINT fk_prestamo_idColaborador;
    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_prestamo_idColaborador')
        DROP INDEX ix_prestamo_idColaborador ON dbo.Prestamo;
    ALTER TABLE dbo.Prestamo DROP COLUMN idColaborador;
END
GO

-- 3) Índice de cabecera para "pendientes de mi cuadrilla destino"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_prestamo_destinoEstado')
    CREATE NONCLUSTERED INDEX ix_prestamo_destinoEstado ON dbo.Prestamo (idCuadrillaDestino, estado);
GO

-- 4) Detalle: uno o varios trabajadores por solicitud
IF OBJECT_ID('dbo.PrestamoColaborador', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PrestamoColaborador (
        idPrestamoColaborador BIGINT        IDENTITY(1,1)   NOT NULL,
        idPrestamo            BIGINT        NOT NULL,
        idColaborador         INT           NOT NULL,
        estado                NVARCHAR(20)  NOT NULL    CONSTRAINT df_prestamoColaborador_estado DEFAULT (N'Activo'),
        fechaCreacion         DATETIME2     NOT NULL    CONSTRAINT df_prestamoColaborador_fechaCreacion DEFAULT GETDATE(),
        creadoPor             NVARCHAR(100) NOT NULL,
        fechaModificacion     DATETIME2     NULL,
        modificadoPor         NVARCHAR(100) NULL,
        CONSTRAINT pk_prestamoColaborador PRIMARY KEY (idPrestamoColaborador),
        CONSTRAINT uq_prestamoColaborador UNIQUE (idPrestamo, idColaborador),
        CONSTRAINT ck_prestamoColaborador_estado CHECK (estado IN (N'Activo', N'Devuelto')),
        CONSTRAINT fk_prestamoColaborador_idPrestamo FOREIGN KEY (idPrestamo)
            REFERENCES dbo.Prestamo (idPrestamo) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_prestamoColaborador_idColaborador FOREIGN KEY (idColaborador)
            REFERENCES dbo.Colaborador (idColaborador) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_prestamoColaborador_idColaborador')
    CREATE NONCLUSTERED INDEX ix_prestamoColaborador_idColaborador ON dbo.PrestamoColaborador (idColaborador);
GO

-- 5) Enlace del tramo ejecutado bajo un préstamo (idempotente)
IF COL_LENGTH('dbo.AsignacionTramo', 'idPrestamo') IS NULL
    ALTER TABLE dbo.AsignacionTramo ADD idPrestamo BIGINT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_asignacionTramo_idPrestamo')
    ALTER TABLE dbo.AsignacionTramo
        ADD CONSTRAINT fk_asignacionTramo_idPrestamo FOREIGN KEY (idPrestamo)
        REFERENCES dbo.Prestamo (idPrestamo) ON DELETE NO ACTION ON UPDATE NO ACTION;
GO
