-- ============================================
-- Objeto:      dbo.AsignacionTramo
-- Tipo:        TABLE
-- Descripción: Tramo de trabajo en tiempo real: un colaborador en una
--              ObraSubpartida durante un lapso. El tramo con horaFinUtc NULL es
--              el estado vivo. Un solo tramo abierto por colaborador.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.AsignacionTramo', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AsignacionTramo (
        idAsignacionTramo   BIGINT          IDENTITY(1,1)   NOT NULL,
        idJornada           BIGINT          NOT NULL,
        idColaborador       INT             NOT NULL,           -- denormalizado (índice de tramo abierto + consultas)
        idObraSubpartida    BIGINT          NOT NULL,
        idCuadrilla         INT             NOT NULL,           -- bajo qué cuadrilla se ejecuta
        horaInicioUtc       DATETIME2       NOT NULL,
        horaFinUtc          DATETIME2       NULL,               -- NULL = tramo activo
        esPrestamo          BIT             NOT NULL    CONSTRAINT df_asignacionTramo_esPrestamo DEFAULT (0),
        asignadoPor         INT             NULL,
        motivo              NVARCHAR(200)   NULL,

        -- auditoría
        fechaCreacion       DATETIME2       NOT NULL    CONSTRAINT df_asignacionTramo_fechaCreacion DEFAULT GETDATE(),
        creadoPor           NVARCHAR(100)   NOT NULL,
        fechaModificacion   DATETIME2       NULL,
        modificadoPor       NVARCHAR(100)   NULL,

        CONSTRAINT pk_asignacionTramo PRIMARY KEY (idAsignacionTramo),
        CONSTRAINT ck_asignacionTramo_horas CHECK (horaFinUtc IS NULL OR horaFinUtc > horaInicioUtc),
        CONSTRAINT fk_asignacionTramo_idJornada FOREIGN KEY (idJornada)
            REFERENCES dbo.Jornada (idJornada) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionTramo_idColaborador FOREIGN KEY (idColaborador)
            REFERENCES dbo.Colaborador (idColaborador) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionTramo_idObraSubpartida FOREIGN KEY (idObraSubpartida)
            REFERENCES dbo.ObraSubpartida (idObraSubpartida) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionTramo_idCuadrilla FOREIGN KEY (idCuadrilla)
            REFERENCES dbo.Cuadrilla (IDCuadrilla) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionTramo_asignadoPor FOREIGN KEY (asignadoPor)
            REFERENCES dbo.Usuario (idUsuario) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- Un solo tramo abierto por colaborador (una subpartida a la vez).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ux_asignacionTramo_abierto')
    CREATE UNIQUE INDEX ux_asignacionTramo_abierto
        ON dbo.AsignacionTramo (idColaborador)
        WHERE horaFinUtc IS NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_asignacionTramo_idObraSubpartida')
    CREATE NONCLUSTERED INDEX ix_asignacionTramo_idObraSubpartida ON dbo.AsignacionTramo (idObraSubpartida);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_asignacionTramo_idCuadrilla')
    CREATE NONCLUSTERED INDEX ix_asignacionTramo_idCuadrilla ON dbo.AsignacionTramo (idCuadrilla);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_asignacionTramo_idJornada')
    CREATE NONCLUSTERED INDEX ix_asignacionTramo_idJornada ON dbo.AsignacionTramo (idJornada);
GO
