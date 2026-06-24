-- ============================================
-- Objeto:      tr_prestamo_afterInsert / tr_prestamo_afterUpdate
-- Tipo:        TRIGGER
-- Descripción: Notificaciones del flujo de préstamo (cabecera+detalle):
--              - al crear la solicitud → notifica al jefe de la cuadrilla destino.
--              - al responder (Aceptado/Rechazado) → notifica al jefe que solicitó.
--              El detalle de trabajadores se muestra en la pantalla de la solicitud.
-- Autor:       migración H4
-- Fecha:       2026-06-24
-- Modificado:  adaptado a cabecera+detalle (sin idColaborador en la cabecera).
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER TRIGGER tr_prestamo_afterInsert
ON dbo.Prestamo AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO dbo.Notificacion (idUsuarioDestino, tipo, titulo, mensaje, idReferencia, fechaCreacion, creadoPor)
        SELECT u.idUsuario,
               N'PrestamoSolicitud',
               N'Solicitud de préstamo',
               CONCAT(N'Nueva solicitud de préstamo del ', CONVERT(CHAR(10), i.fechaDesde, 23),
                      N' al ', CONVERT(CHAR(10), i.fechaHasta, 23),
                      N'. Motivo: ', i.motivo),
               i.idPrestamo,
               GETDATE(),
               N'tr_prestamo_afterInsert'
        FROM inserted i
        JOIN dbo.Cuadrilla cd ON cd.IDCuadrilla = i.idCuadrillaDestino
        JOIN dbo.Usuario u ON u.idColaborador = cd.IDEncargado
        WHERE i.estado = N'Pendiente';
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH;
END;
GO

CREATE OR ALTER TRIGGER tr_prestamo_afterUpdate
ON dbo.Prestamo AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    IF UPDATE(estado)
    BEGIN
        BEGIN TRY
            INSERT INTO dbo.Notificacion (idUsuarioDestino, tipo, titulo, mensaje, idReferencia, fechaCreacion, creadoPor)
            SELECT i.solicitadoPor,
                   N'PrestamoRespuesta',
                   CONCAT(N'Préstamo ', i.estado),
                   CONCAT(N'Tu solicitud de préstamo (', CONVERT(CHAR(10), i.fechaDesde, 23),
                          N' al ', CONVERT(CHAR(10), i.fechaHasta, 23), N') fue ', i.estado, N'.'),
                   i.idPrestamo,
                   GETDATE(),
                   N'tr_prestamo_afterUpdate'
            FROM inserted i
            JOIN deleted d ON d.idPrestamo = i.idPrestamo
            WHERE i.estado <> d.estado AND i.estado IN (N'Aceptado', N'Rechazado');
        END TRY
        BEGIN CATCH
            THROW;
        END CATCH;
    END;
END;
GO
