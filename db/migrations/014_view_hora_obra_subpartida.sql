-- ============================================
-- Objeto:      v_horaObraSubpartida
-- Tipo:        VIEW
-- Descripción: HH ejecutadas por ObraSubpartida, sumando la duración de cada
--              tramo (el abierto se calcula contra la hora UTC actual). No se
--              persiste ningún total: siempre es en vivo.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE OR ALTER VIEW v_horaObraSubpartida AS
SELECT
    os.idObraSubpartida,
    os.idObra,
    os.idSubpartida,
    os.hhPresupuestadas,
    COUNT(t.idAsignacionTramo)                                                                          AS tramos,
    COUNT(DISTINCT t.idColaborador)                                                                     AS colaboradores,
    CAST(SUM(DATEDIFF(SECOND, t.horaInicioUtc, COALESCE(t.horaFinUtc, SYSUTCDATETIME()))) / 3600.0
         AS DECIMAL(20,5))                                                                              AS hhEjecutadas
FROM dbo.ObraSubpartida os
LEFT JOIN dbo.AsignacionTramo t ON t.idObraSubpartida = os.idObraSubpartida
GROUP BY os.idObraSubpartida, os.idObra, os.idSubpartida, os.hhPresupuestadas;
GO
