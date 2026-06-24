-- ============================================
-- Objeto:      dbo.AsignacionVigente
-- Tipo:        TABLE
-- Descripción: Destino persistente de cada colaborador ("dónde va"). Sobrevive
--              entre jornadas: al marcar entra a esta asignación; solo cambia
--              cuando el jefe lo reasigna. 1 fila por colaborador.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.AsignacionVigente', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.AsignacionVigente (
        idColaborador       INT             NOT NULL,   -- PK: una asignación vigente por persona
        idObraSubpartida    BIGINT          NOT NULL,
        idCuadrilla         INT             NOT NULL,
        vigenteDesdeUtc     DATETIME2       NOT NULL    CONSTRAINT df_asignacionVigente_vigenteDesde DEFAULT SYSUTCDATETIME(),
        asignadoPor         INT             NULL,

        -- auditoría
        fechaCreacion       DATETIME2       NOT NULL    CONSTRAINT df_asignacionVigente_fechaCreacion DEFAULT GETDATE(),
        creadoPor           NVARCHAR(100)   NOT NULL,
        fechaModificacion   DATETIME2       NULL,
        modificadoPor       NVARCHAR(100)   NULL,

        CONSTRAINT pk_asignacionVigente PRIMARY KEY (idColaborador),
        CONSTRAINT fk_asignacionVigente_idColaborador FOREIGN KEY (idColaborador)
            REFERENCES dbo.Colaborador (idColaborador) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionVigente_idObraSubpartida FOREIGN KEY (idObraSubpartida)
            REFERENCES dbo.ObraSubpartida (idObraSubpartida) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionVigente_idCuadrilla FOREIGN KEY (idCuadrilla)
            REFERENCES dbo.Cuadrilla (IDCuadrilla) ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT fk_asignacionVigente_asignadoPor FOREIGN KEY (asignadoPor)
            REFERENCES dbo.Usuario (idUsuario) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_asignacionVigente_idObraSubpartida')
    CREATE NONCLUSTERED INDEX ix_asignacionVigente_idObraSubpartida ON dbo.AsignacionVigente (idObraSubpartida);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_asignacionVigente_idCuadrilla')
    CREATE NONCLUSTERED INDEX ix_asignacionVigente_idCuadrilla ON dbo.AsignacionVigente (idCuadrilla);
GO
