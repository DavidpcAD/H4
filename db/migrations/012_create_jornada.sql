-- ============================================
-- Objeto:      dbo.Jornada
-- Tipo:        TABLE
-- Descripción: Día de marcaje (entrada -> salida) de un colaborador. Derivado
--              de MarcajeEvento. El marcaje es individual, nunca de cuadrilla.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Jornada', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Jornada (
        idJornada               BIGINT          IDENTITY(1,1)   NOT NULL,
        idColaborador           INT             NOT NULL,
        fechaHoraEntradaUtc     DATETIME2       NOT NULL,
        fechaHoraSalidaUtc      DATETIME2       NULL,           -- NULL = en obra
        estado                  NVARCHAR(20)    NOT NULL    CONSTRAINT df_jornada_estado DEFAULT (N'Abierta'),

        -- auditoría
        fechaCreacion           DATETIME2       NOT NULL    CONSTRAINT df_jornada_fechaCreacion DEFAULT GETDATE(),
        creadoPor               NVARCHAR(100)   NOT NULL,
        fechaModificacion       DATETIME2       NULL,
        modificadoPor           NVARCHAR(100)   NULL,

        CONSTRAINT pk_jornada PRIMARY KEY (idJornada),
        CONSTRAINT ck_jornada_estado CHECK (estado IN (N'Abierta', N'Cerrada', N'Anomalia')),
        CONSTRAINT ck_jornada_salida CHECK (fechaHoraSalidaUtc IS NULL OR fechaHoraSalidaUtc >= fechaHoraEntradaUtc),
        CONSTRAINT fk_jornada_idColaborador FOREIGN KEY (idColaborador)
            REFERENCES dbo.Colaborador (idColaborador) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- Una sola jornada abierta por colaborador.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ux_jornada_abierta')
    CREATE UNIQUE INDEX ux_jornada_abierta
        ON dbo.Jornada (idColaborador)
        WHERE fechaHoraSalidaUtc IS NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_jornada_idColaborador')
    CREATE NONCLUSTERED INDEX ix_jornada_idColaborador ON dbo.Jornada (idColaborador, fechaHoraEntradaUtc);
GO
