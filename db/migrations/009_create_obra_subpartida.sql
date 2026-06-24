-- ============================================
-- Objeto:      dbo.ObraSubpartida
-- Tipo:        TABLE
-- Descripción: Instancia de un proceso (subpartida) ejecutándose en una obra.
--              Lleva presupuesto, avance y estado (abierta/cerrada). Las HH
--              ejecutadas NO se almacenan: se calculan desde AsignacionTramo.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.ObraSubpartida', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ObraSubpartida (
        -- ids
        idObraSubpartida        BIGINT          IDENTITY(1,1)   NOT NULL,
        idObra                  BIGINT          NOT NULL,       -- dbo.Obra.idObra es BIGINT
        idSubpartida            INT             NOT NULL,

        -- presupuesto (NULL: aún no definido)
        unidad                  NVARCHAR(10)    NULL,
        hhPresupuestadas        DECIMAL(20,5)   NULL,
        cantidadPresupuestada   DECIMAL(20,5)   NULL,
        cantidadEjecutada       DECIMAL(20,5)   NULL,

        -- ciclo de vida del proceso en la obra
        fechaAperturaUtc        DATETIME2       NOT NULL    CONSTRAINT df_obraSubpartida_fechaApertura DEFAULT SYSUTCDATETIME(),
        fechaCierreUtc          DATETIME2       NULL,
        estado                  NVARCHAR(20)    NOT NULL    CONSTRAINT df_obraSubpartida_estado DEFAULT (N'Abierta'),

        -- auditoría
        fechaCreacion           DATETIME2       NOT NULL    CONSTRAINT df_obraSubpartida_fechaCreacion DEFAULT GETDATE(),
        creadoPor               NVARCHAR(100)   NOT NULL,
        fechaModificacion       DATETIME2       NULL,
        modificadoPor           NVARCHAR(100)   NULL,

        -- constraints
        CONSTRAINT pk_obraSubpartida PRIMARY KEY (idObraSubpartida),
        CONSTRAINT ck_obraSubpartida_estado CHECK (estado IN (N'Abierta', N'Cerrada')),
        CONSTRAINT fk_obraSubpartida_idObra FOREIGN KEY (idObra)
            REFERENCES dbo.Obra (idObra) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_obraSubpartida_idSubpartida FOREIGN KEY (idSubpartida)
            REFERENCES dbo.sub_partidas (id) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- Solo una instancia ABIERTA por (obra, subpartida); permite reapertura
-- (cerrar una y abrir otra después).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ux_obraSubpartida_abierta')
    CREATE UNIQUE INDEX ux_obraSubpartida_abierta
        ON dbo.ObraSubpartida (idObra, idSubpartida)
        WHERE fechaCierreUtc IS NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_obraSubpartida_idObra')
    CREATE NONCLUSTERED INDEX ix_obraSubpartida_idObra ON dbo.ObraSubpartida (idObra);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_obraSubpartida_idSubpartida')
    CREATE NONCLUSTERED INDEX ix_obraSubpartida_idSubpartida ON dbo.ObraSubpartida (idSubpartida);
GO
