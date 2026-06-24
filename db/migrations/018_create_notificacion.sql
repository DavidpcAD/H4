-- ============================================
-- Objeto:      dbo.Notificacion
-- Tipo:        TABLE
-- Descripción: Notificaciones dirigidas a un usuario (genérica). Para el flujo
--              de préstamo, le llega al jefe destino la solicitud y al jefe
--              origen la respuesta. idReferencia apunta al objeto (ej. idPrestamo).
-- Autor:       migración H4
-- Fecha:       2026-06-24
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID('dbo.Notificacion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Notificacion (
        idNotificacion      BIGINT          IDENTITY(1,1)   NOT NULL,
        idUsuarioDestino    INT             NOT NULL,       -- a quién le llega
        tipo                NVARCHAR(40)    NOT NULL,       -- ej. PrestamoSolicitud / PrestamoRespuesta
        titulo              NVARCHAR(150)   NOT NULL,
        mensaje             NVARCHAR(500)   NULL,
        idReferencia        BIGINT          NULL,           -- objeto referenciado (ej. idPrestamo); referencia lógica, no FK
        esLeida             BIT             NOT NULL        CONSTRAINT df_notificacion_esLeida DEFAULT (0),
        fechaLeidaUtc       DATETIME2       NULL,

        -- auditoría
        fechaCreacion       DATETIME2       NOT NULL        CONSTRAINT df_notificacion_fechaCreacion DEFAULT GETDATE(),
        creadoPor           NVARCHAR(100)   NOT NULL,
        fechaModificacion   DATETIME2       NULL,
        modificadoPor       NVARCHAR(100)   NULL,

        CONSTRAINT pk_notificacion PRIMARY KEY (idNotificacion),
        CONSTRAINT fk_notificacion_idUsuarioDestino FOREIGN KEY (idUsuarioDestino)
            REFERENCES dbo.Usuario (idUsuario) ON DELETE NO ACTION ON UPDATE NO ACTION
    );
END
GO

-- Para "mis notificaciones (no leídas)"
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'ix_notificacion_destino')
    CREATE NONCLUSTERED INDEX ix_notificacion_destino ON dbo.Notificacion (idUsuarioDestino, esLeida, fechaCreacion);
GO
