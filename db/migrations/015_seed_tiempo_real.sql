-- ============================================
-- Objeto:      Datos de prueba — marcaje en tiempo real
-- Tipo:        SEED
-- Descripción: Más obreros en las cuadrillas (en obras distintas), ObraSubpartida
--              abiertas, AsignacionVigente, Jornada y AsignacionTramo con estados
--              variados (activo, reasignado, préstamo, salida, sin marcar).
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- Requiere:    003, 009-013 aplicados. Correr con login db_owner (davidpc).
-- ============================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

DECLARE @ahora DATETIME2 = SYSUTCDATETIME();
DECLARE @cuCarlos INT = (SELECT IDCuadrilla FROM dbo.Cuadrilla WHERE Nombre = N'Cuadrilla Carlos');
DECLARE @cuJerson INT = (SELECT IDCuadrilla FROM dbo.Cuadrilla WHERE Nombre = N'Cuadrilla Jerson');
DECLARE @idPuestoObrero INT = (SELECT idPuesto FROM dbo.Puesto WHERE nombre = N'Obrero');

-- Obras y subpartidas de referencia
DECLARE @oVNA06 BIGINT = (SELECT idObra FROM dbo.Obra WHERE numeroObra = 'VN-A.06');
DECLARE @oVNC01 BIGINT = (SELECT idObra FROM dbo.Obra WHERE numeroObra = 'VN-C.01');
DECLARE @oVCD01 BIGINT = (SELECT idObra FROM dbo.Obra WHERE numeroObra = 'VC-D.01');
DECLARE @oVCF01 BIGINT = (SELECT idObra FROM dbo.Obra WHERE numeroObra = 'VC-F.01');
DECLARE @s111 INT = (SELECT id FROM dbo.sub_partidas WHERE codigo = '1.1.1');
DECLARE @s113 INT = (SELECT id FROM dbo.sub_partidas WHERE codigo = '1.1.3');
DECLARE @s121 INT = (SELECT id FROM dbo.sub_partidas WHERE codigo = '1.2.1');

-- 1) Nuevos obreros (idempotente por cédula)
IF NOT EXISTS (SELECT 1 FROM dbo.Colaborador WHERE cedula = N'OBR-H4-07')
    INSERT INTO dbo.Colaborador (idPais, idPuesto, nombre, primerApellido, segundoApellido, cedula, telefono, esActivo, fechaCreacion, creadoPor)
    VALUES
        (1, @idPuestoObrero, N'Pedro',   N'Solís',   N'Ramírez', N'OBR-H4-07', N'8888-0007', 1, @ahora, N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Esteban', N'Núñez',   N'Fonseca', N'OBR-H4-08', N'8888-0008', 1, @ahora, N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Fabián',  N'Araya',   N'Mora',    N'OBR-H4-09', N'8888-0009', 1, @ahora, N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Gerardo', N'Mena',    N'Salas',   N'OBR-H4-10', N'8888-0010', 1, @ahora, N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Hugo',    N'Ramírez', N'Soto',    N'OBR-H4-11', N'8888-0011', 1, @ahora, N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Ignacio', N'Soto',    N'Vega',    N'OBR-H4-12', N'8888-0012', 1, @ahora, N'seed-obreros-h4');

-- 2) Membership: 07-09 -> Carlos ; 10-12 -> Jerson
INSERT INTO dbo.CuadrillaMiembro (IDCuadrilla, IDCol)
SELECT CASE WHEN c.cedula IN ('OBR-H4-07', 'OBR-H4-08', 'OBR-H4-09') THEN @cuCarlos ELSE @cuJerson END, c.idColaborador
FROM dbo.Colaborador c
WHERE c.cedula IN ('OBR-H4-07', 'OBR-H4-08', 'OBR-H4-09', 'OBR-H4-10', 'OBR-H4-11', 'OBR-H4-12')
  AND NOT EXISTS (SELECT 1 FROM dbo.CuadrillaMiembro m WHERE m.IDCol = c.idColaborador);

-- 3) ObraSubpartida: abrir 5 instancias en 4 obras (idempotente sobre las abiertas)
INSERT INTO dbo.ObraSubpartida (idObra, idSubpartida, unidad, hhPresupuestadas, fechaAperturaUtc, estado, creadoPor)
SELECT v.idObra, v.idSub, N'm2', v.hh, @ahora, N'Abierta', N'seed-rt-h4'
FROM (VALUES
        (@oVNA06, @s113, CAST(120.0 AS DECIMAL(20,5))),
        (@oVNA06, @s121, CAST(90.0  AS DECIMAL(20,5))),
        (@oVNC01, @s111, CAST(60.0  AS DECIMAL(20,5))),
        (@oVCD01, @s111, CAST(50.0  AS DECIMAL(20,5))),
        (@oVCF01, @s113, CAST(80.0  AS DECIMAL(20,5)))
     ) v(idObra, idSub, hh)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.ObraSubpartida os
    WHERE os.idObra = v.idObra AND os.idSubpartida = v.idSub AND os.fechaCierreUtc IS NULL
);

-- Resolver las instancias abiertas
DECLARE @osA BIGINT = (SELECT idObraSubpartida FROM dbo.ObraSubpartida WHERE idObra=@oVNA06 AND idSubpartida=@s113 AND fechaCierreUtc IS NULL); -- VN-A.06 / 1.1.3
DECLARE @osB BIGINT = (SELECT idObraSubpartida FROM dbo.ObraSubpartida WHERE idObra=@oVNA06 AND idSubpartida=@s121 AND fechaCierreUtc IS NULL); -- VN-A.06 / 1.2.1
DECLARE @osC BIGINT = (SELECT idObraSubpartida FROM dbo.ObraSubpartida WHERE idObra=@oVNC01 AND idSubpartida=@s111 AND fechaCierreUtc IS NULL); -- VN-C.01 / 1.1.1
DECLARE @osD BIGINT = (SELECT idObraSubpartida FROM dbo.ObraSubpartida WHERE idObra=@oVCD01 AND idSubpartida=@s111 AND fechaCierreUtc IS NULL); -- VC-D.01 / 1.1.1
DECLARE @osE BIGINT = (SELECT idObraSubpartida FROM dbo.ObraSubpartida WHERE idObra=@oVCF01 AND idSubpartida=@s113 AND fechaCierreUtc IS NULL); -- VC-F.01 / 1.1.3

-- Plan: cédula -> ObraSubpartida destino, cuadrilla bajo la que trabaja, estado, préstamo
DECLARE @plan TABLE (idColaborador INT, idOS BIGINT, idCuadrilla INT, estado VARCHAR(12), esPrestamo BIT);
INSERT INTO @plan (idColaborador, idOS, idCuadrilla, estado, esPrestamo)
SELECT c.idColaborador, p.idOS, p.idCuadrilla, p.estado, p.esPrestamo
FROM (VALUES
        ('OBR-H4-01', @osA, @cuCarlos, 'activo',     CAST(0 AS BIT)),  -- Juan   VN-A.06/1.1.3
        ('OBR-H4-02', @osB, @cuCarlos, 'activo',     0),               -- María  VN-A.06/1.2.1 (misma obra, otra subpartida)
        ('OBR-H4-03', @osC, @cuCarlos, 'activo',     0),               -- Luis   VN-C.01/1.1.1 (otra obra)
        ('OBR-H4-07', @osC, @cuCarlos, 'reasignado', 0),               -- Pedro  A -> C
        ('OBR-H4-08', @osC, @cuCarlos, 'sinmarcar',  0),               -- Esteban (no marcó)
        ('OBR-H4-09', @osB, @cuCarlos, 'activo',     0),               -- Fabián VN-A.06/1.2.1
        ('OBR-H4-04', @osD, @cuJerson, 'activo',     0),               -- Andrea VC-D.01/1.1.1
        ('OBR-H4-05', @osE, @cuJerson, 'salida',     0),               -- Marcos VC-F.01/1.1.3 (jornada cerrada)
        ('OBR-H4-06', @osD, @cuCarlos, 'prestamo',   1),               -- Diego (de Jerson) prestado a Carlos
        ('OBR-H4-10', @osE, @cuJerson, 'activo',     0),               -- Gerardo VC-F.01/1.1.3
        ('OBR-H4-11', @osD, @cuJerson, 'activo',     0),               -- Hugo    VC-D.01/1.1.1
        ('OBR-H4-12', @osE, @cuJerson, 'sinmarcar',  0)                -- Ignacio (no marcó)
     ) p(cedula, idOS, idCuadrilla, estado, esPrestamo)
JOIN dbo.Colaborador c ON c.cedula = p.cedula;

-- 4) AsignacionVigente (destino persistente de cada uno)
INSERT INTO dbo.AsignacionVigente (idColaborador, idObraSubpartida, idCuadrilla, vigenteDesdeUtc, asignadoPor, creadoPor)
SELECT pl.idColaborador, pl.idOS, pl.idCuadrilla, @ahora,
       CASE WHEN pl.idCuadrilla = @cuCarlos THEN 6 ELSE 5 END, N'seed-rt-h4'
FROM @plan pl
WHERE NOT EXISTS (SELECT 1 FROM dbo.AsignacionVigente av WHERE av.idColaborador = pl.idColaborador);

-- 5 y 6) Jornada + Tramos (una sola vez, marcados con creadoPor='seed-rt-h4')
IF NOT EXISTS (SELECT 1 FROM dbo.Jornada WHERE creadoPor = N'seed-rt-h4')
BEGIN
    -- Jornada: los que marcaron (todos menos 'sinmarcar'); 'salida' queda cerrada
    INSERT INTO dbo.Jornada (idColaborador, fechaHoraEntradaUtc, fechaHoraSalidaUtc, estado, creadoPor)
    SELECT pl.idColaborador,
           CASE WHEN pl.estado = 'salida' THEN DATEADD(HOUR, -8, @ahora) ELSE DATEADD(HOUR, -3, @ahora) END,
           CASE WHEN pl.estado = 'salida' THEN DATEADD(HOUR, -1, @ahora) ELSE NULL END,
           CASE WHEN pl.estado = 'salida' THEN N'Cerrada' ELSE N'Abierta' END,
           N'seed-rt-h4'
    FROM @plan pl
    WHERE pl.estado <> 'sinmarcar';

    -- Tramo activo / préstamo: 1 abierto
    INSERT INTO dbo.AsignacionTramo (idJornada, idColaborador, idObraSubpartida, idCuadrilla, horaInicioUtc, horaFinUtc, esPrestamo, asignadoPor, motivo, creadoPor)
    SELECT j.idJornada, pl.idColaborador, pl.idOS, pl.idCuadrilla, DATEADD(HOUR, -3, @ahora), NULL, pl.esPrestamo,
           CASE WHEN pl.idCuadrilla = @cuCarlos THEN 6 ELSE 5 END,
           CASE WHEN pl.estado = 'prestamo' THEN N'Préstamo entre cuadrillas' ELSE NULL END,
           N'seed-rt-h4'
    FROM @plan pl
    JOIN dbo.Jornada j ON j.idColaborador = pl.idColaborador AND j.creadoPor = N'seed-rt-h4'
    WHERE pl.estado IN ('activo', 'prestamo');

    -- Tramo salida: 1 cerrado
    INSERT INTO dbo.AsignacionTramo (idJornada, idColaborador, idObraSubpartida, idCuadrilla, horaInicioUtc, horaFinUtc, esPrestamo, asignadoPor, creadoPor)
    SELECT j.idJornada, pl.idColaborador, pl.idOS, pl.idCuadrilla, DATEADD(HOUR, -8, @ahora), DATEADD(HOUR, -1, @ahora), 0,
           CASE WHEN pl.idCuadrilla = @cuCarlos THEN 6 ELSE 5 END, N'seed-rt-h4'
    FROM @plan pl
    JOIN dbo.Jornada j ON j.idColaborador = pl.idColaborador AND j.creadoPor = N'seed-rt-h4'
    WHERE pl.estado = 'salida';

    -- Reasignado (Pedro): tramo 1 en A cerrado + tramo 2 en su destino (C) abierto
    INSERT INTO dbo.AsignacionTramo (idJornada, idColaborador, idObraSubpartida, idCuadrilla, horaInicioUtc, horaFinUtc, esPrestamo, asignadoPor, motivo, creadoPor)
    SELECT j.idJornada, pl.idColaborador, @osA, @cuCarlos, DATEADD(HOUR, -3, @ahora), DATEADD(HOUR, -1, @ahora), 0, 6, N'Tramo inicial', N'seed-rt-h4'
    FROM @plan pl JOIN dbo.Jornada j ON j.idColaborador = pl.idColaborador AND j.creadoPor = N'seed-rt-h4'
    WHERE pl.estado = 'reasignado';

    INSERT INTO dbo.AsignacionTramo (idJornada, idColaborador, idObraSubpartida, idCuadrilla, horaInicioUtc, horaFinUtc, esPrestamo, asignadoPor, motivo, creadoPor)
    SELECT j.idJornada, pl.idColaborador, pl.idOS, @cuCarlos, DATEADD(HOUR, -1, @ahora), NULL, 0, 6, N'Reasignación', N'seed-rt-h4'
    FROM @plan pl JOIN dbo.Jornada j ON j.idColaborador = pl.idColaborador AND j.creadoPor = N'seed-rt-h4'
    WHERE pl.estado = 'reasignado';
END
GO

-- Verificación: HH en vivo por obra/subpartida
SELECT o.numeroObra, sp.codigo AS subpartida, v.colaboradores, v.tramos,
       CAST(v.hhEjecutadas AS DECIMAL(10,2)) AS hhEjecutadas, v.hhPresupuestadas
FROM v_horaObraSubpartida v
JOIN dbo.Obra o ON o.idObra = v.idObra
JOIN dbo.sub_partidas sp ON sp.id = v.idSubpartida
ORDER BY o.numeroObra, sp.codigo;
GO
