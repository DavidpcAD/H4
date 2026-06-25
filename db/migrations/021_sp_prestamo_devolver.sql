-- ============================================
-- Objeto:      sp_prestamo_devolver_vencidos
-- Tipo:        STORED PROCEDURE
-- Descripción: Devuelve los préstamos vencidos (fechaHasta < hoy CR, estado
--              'Aceptado'): saca a los prestados de la cuadrilla destino,
--              elimina su asignación vigente bajo esa cuadrilla y marca el
--              préstamo como 'Finalizado'. Los colaboradores quedan de nuevo
--              solo en su cuadrilla de origen.
--              Pensado para ejecutarse en un job nocturno (SQL Agent).
-- Autor:       migración H4
-- Fecha:       2026-06-24
-- Modificado:
-- Requiere:    017 (Prestamo), 003 (CuadrillaMiembro), 010 (AsignacionVigente).
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER PROCEDURE dbo.sp_prestamo_devolver_vencidos
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @hoy DATE = CAST(SYSDATETIMEOFFSET() AT TIME ZONE 'Central America Standard Time' AS DATE);

    BEGIN TRY
        BEGIN TRAN;

        -- Préstamos aceptados cuyo rango ya terminó
        DECLARE @vencidos TABLE (idPrestamo BIGINT, idCuadrillaDestino INT);
        INSERT INTO @vencidos (idPrestamo, idCuadrillaDestino)
        SELECT p.idPrestamo, p.idCuadrillaDestino
        FROM dbo.Prestamo p
        WHERE p.estado = N'Aceptado' AND p.fechaHasta < @hoy;

        -- 1) Quitar a los prestados de la cuadrilla destino (membresía temporal)
        UPDATE m
        SET m.Activo = 0, m.FechaSalida = ISNULL(m.FechaSalida, @hoy)
        FROM dbo.CuadrillaMiembro m
        JOIN @vencidos v ON v.idCuadrillaDestino = m.IDCuadrilla
        JOIN dbo.PrestamoColaborador pc ON pc.idPrestamo = v.idPrestamo AND pc.idColaborador = m.IDCol
        WHERE m.Activo = 1 AND m.FechaSalida IS NOT NULL;

        -- 2) Eliminar la asignación vigente que apuntaba a la cuadrilla destino
        DELETE av
        FROM dbo.AsignacionVigente av
        JOIN @vencidos v ON v.idCuadrillaDestino = av.idCuadrilla
        JOIN dbo.PrestamoColaborador pc ON pc.idPrestamo = v.idPrestamo AND pc.idColaborador = av.idColaborador;

        -- 3) Marcar el detalle y la cabecera como finalizados
        UPDATE pc
        SET pc.estado = N'Devuelto', pc.fechaModificacion = SYSUTCDATETIME(), pc.modificadoPor = N'sp_prestamo_devolver'
        FROM dbo.PrestamoColaborador pc
        JOIN @vencidos v ON v.idPrestamo = pc.idPrestamo
        WHERE pc.estado <> N'Devuelto';

        UPDATE p
        SET p.estado = N'Finalizado', p.fechaModificacion = SYSUTCDATETIME(), p.modificadoPor = N'sp_prestamo_devolver'
        FROM dbo.Prestamo p
        JOIN @vencidos v ON v.idPrestamo = p.idPrestamo;

        COMMIT;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK;
        THROW;
    END CATCH;
END;
GO

-- Ejecución manual / desde job nocturno:
--   EXEC dbo.sp_prestamo_devolver_vencidos;
GO
