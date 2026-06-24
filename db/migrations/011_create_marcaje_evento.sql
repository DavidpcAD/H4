-- ============================================
-- Objeto:      dbo.MarcajeEvento
-- Tipo:        TABLE
-- Descripción: Ingesta cruda de entrada/salida desde el sistema biométrico
--              externo. Identifica al colaborador por cédula. Append-only.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.MarcajeEvento', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MarcajeEvento (
        idMarcajeEvento     BIGINT          IDENTITY(1,1)   NOT NULL,
        cedula              NVARCHAR(100)   NOT NULL,                    -- valor crudo recibido del API
        idColaborador       INT             NULL,                       -- resuelto al conciliar (match por cédula)
        tipoEvento          NVARCHAR(10)    NOT NULL,
        fechaHoraUtc        DATETIME2       NOT NULL,
        idExterno           NVARCHAR(100)   NULL,                       -- id del evento en el sistema externo
        dispositivo         NVARCHAR(100)   NULL,
        esProcesado         BIT             NOT NULL    CONSTRAINT df_marcajeEvento_esProcesado DEFAULT (0),

        -- auditoría
        fechaCreacion       DATETIME2       NOT NULL    CONSTRAINT df_marcajeEvento_fechaCreacion DEFAULT GETDATE(),
        creadoPor           NVARCHAR(100)   NOT NULL,
        fechaModificacion   DATETIME2       NULL,
        modificadoPor       NVARCHAR(100)   NULL,

        CONSTRAINT pk_marcajeEvento PRIMARY KEY (idMarcajeEvento),
        CONSTRAINT ck_marcajeEvento_tipoEvento CHECK (tipoEvento IN (N'ENTRADA', N'SALIDA')),
        CONSTRAINT fk_marcajeEvento_idColaborador FOREIGN KEY (idColaborador)
            REFERENCES dbo.Colaborador (idColaborador) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- Idempotencia: no duplicar reenvíos del API (cuando trae idExterno).
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ux_marcajeEvento_idExterno')
    CREATE UNIQUE INDEX ux_marcajeEvento_idExterno
        ON dbo.MarcajeEvento (idExterno)
        WHERE idExterno IS NOT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_marcajeEvento_cedula')
    CREATE NONCLUSTERED INDEX ix_marcajeEvento_cedula ON dbo.MarcajeEvento (cedula);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_marcajeEvento_idColaborador')
    CREATE NONCLUSTERED INDEX ix_marcajeEvento_idColaborador ON dbo.MarcajeEvento (idColaborador);
GO

-- Índice de apoyo para resolver la cédula del API -> idColaborador.
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_colaborador_cedula')
    CREATE NONCLUSTERED INDEX ix_colaborador_cedula ON dbo.Colaborador (cedula);
GO
