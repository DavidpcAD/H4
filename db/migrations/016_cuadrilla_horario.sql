-- ============================================
-- Objeto:      dbo.Cuadrilla (horario de jornada)
-- Tipo:        ALTER TABLE
-- Descripción: Agrega el horario laboral a la cuadrilla (hora de inicio y fin).
--              Ese horario aplica a todos sus colaboradores y define si un
--              trabajador sin tramo abierto está "sin marcar" (dentro del
--              horario) o "fuera de horario".
-- Autor:       migración H4
-- Fecha:       2026-06-24
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Columnas de horario (default 06:00–17:00). Idempotente.
IF COL_LENGTH('dbo.Cuadrilla', 'horaInicioJornada') IS NULL
    ALTER TABLE dbo.Cuadrilla
        ADD horaInicioJornada TIME(0) NOT NULL
            CONSTRAINT df_cuadrilla_horaInicioJornada DEFAULT ('06:00:00');
GO

IF COL_LENGTH('dbo.Cuadrilla', 'horaFinJornada') IS NULL
    ALTER TABLE dbo.Cuadrilla
        ADD horaFinJornada TIME(0) NOT NULL
            CONSTRAINT df_cuadrilla_horaFinJornada DEFAULT ('17:00:00');
GO

-- (Opcional) horarios de ejemplo por cuadrilla — ajustá a los reales.
UPDATE dbo.Cuadrilla SET horaInicioJornada = '06:00:00', horaFinJornada = '15:00:00' WHERE Nombre = N'Cuadrilla Carlos';
UPDATE dbo.Cuadrilla SET horaInicioJornada = '07:00:00', horaFinJornada = '16:00:00' WHERE Nombre = N'Cuadrilla Jerson';
GO

-- Verificación
SELECT IDCuadrilla, Nombre, horaInicioJornada, horaFinJornada FROM dbo.Cuadrilla ORDER BY IDCuadrilla;
GO
