/* =============================================================================
   003 — Cuadrillas H4 + datos de prueba (departamento, puesto, obreros, asignaciones)
   Base: AdelanteSBX (PRUEBAS). Idempotente. Correr con login db_owner (davidpc).

   Hace:
   1. Crea dbo.CuadrillasH4 y dbo.CuadrillaMiembrosH4 (mismas columnas que leg.*).
   2. Agrega el Departamento "Administración de Obra".
   3. Agrega el Puesto "Obrero" en ese departamento.
   4. Crea 6 colaboradores obreros.
   5. Crea 2 cuadrillas: encargada por el colaborador del usuario 6 (carlos) y
      por el del usuario 5 (jerson) respectivamente.
   6. Asigna los obreros a las cuadrillas (3 y 3).
   ============================================================================= */

-- 1) Tablas (mismas columnas/PK/IDENTITY/defaults que las leg.*)
IF OBJECT_ID('dbo.CuadrillasH4', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CuadrillasH4 (
        IDCuadrilla   INT IDENTITY(1,1) NOT NULL,
        Nombre        NVARCHAR(200)     NOT NULL,
        IDProyecto    INT               NOT NULL,
        TaskNoBC      NVARCHAR(40)      NULL,
        IDEncargado   INT               NOT NULL,
        Capacidad     INT               NOT NULL CONSTRAINT DF_CuadrillasH4_Capacidad     DEFAULT ((25)),
        Activo        BIT               NOT NULL CONSTRAINT DF_CuadrillasH4_Activo         DEFAULT ((1)),
        FechaCreacion DATETIME          NOT NULL CONSTRAINT DF_CuadrillasH4_FechaCreacion  DEFAULT (GETDATE()),
        CreadoPor     INT               NULL,
        CONSTRAINT PK_CuadrillasH4 PRIMARY KEY CLUSTERED (IDCuadrilla)
    );
END
GO

IF OBJECT_ID('dbo.CuadrillaMiembrosH4', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CuadrillaMiembrosH4 (
        IDCuadMiembro INT IDENTITY(1,1) NOT NULL,
        IDCuadrilla   INT               NOT NULL,
        IDCol         INT               NOT NULL,
        FechaIngreso  DATETIME          NOT NULL CONSTRAINT DF_CuadrillaMiembrosH4_FechaIngreso DEFAULT (GETDATE()),
        FechaSalida   DATETIME          NULL,
        AsignadoPor   INT               NULL,
        Activo        BIT               NOT NULL CONSTRAINT DF_CuadrillaMiembrosH4_Activo       DEFAULT ((1)),
        CONSTRAINT PK_CuadrillaMiembrosH4 PRIMARY KEY CLUSTERED (IDCuadMiembro)
    );
END
GO

-- 2..6) Datos de prueba (un solo batch para poder usar variables)
DECLARE @idDeptObra INT, @idPuestoObrero INT, @cu1 INT, @cu2 INT;

-- 2) Departamento "Administración de Obra"
IF NOT EXISTS (SELECT 1 FROM dbo.Departamento WHERE nombre = N'Administración de Obra')
    INSERT INTO dbo.Departamento (nombre, fechaCreacion, creadoPor)
    VALUES (N'Administración de Obra', SYSUTCDATETIME(), N'seed-h4');
SELECT @idDeptObra = idDepartamento FROM dbo.Departamento WHERE nombre = N'Administración de Obra';

-- 3) Puesto "Obrero" en ese departamento
IF NOT EXISTS (SELECT 1 FROM dbo.Puesto WHERE nombre = N'Obrero' AND idDepartamento = @idDeptObra)
    INSERT INTO dbo.Puesto (idDepartamento, nombre, fechaCreacion, creadoPor)
    VALUES (@idDeptObra, N'Obrero', SYSUTCDATETIME(), N'seed-h4');
SELECT @idPuestoObrero = idPuesto FROM dbo.Puesto WHERE nombre = N'Obrero' AND idDepartamento = @idDeptObra;

-- 4) Colaboradores obreros (idPais 1 = Costa Rica; calcNombreCompleto es computada, se omite)
IF NOT EXISTS (SELECT 1 FROM dbo.Colaborador WHERE creadoPor = N'seed-obreros-h4')
    INSERT INTO dbo.Colaborador (idPais, idPuesto, nombre, primerApellido, segundoApellido, cedula, telefono, esActivo, fechaCreacion, creadoPor)
    VALUES
        (1, @idPuestoObrero, N'Juan',   N'Pérez',  N'Mora',    N'OBR-H4-01', N'8888-0001', 1, SYSUTCDATETIME(), N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'María',  N'Solano', N'Vega',    N'OBR-H4-02', N'8888-0002', 1, SYSUTCDATETIME(), N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Luis',   N'Vargas', N'Castro',  N'OBR-H4-03', N'8888-0003', 1, SYSUTCDATETIME(), N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Andrea', N'Rojas',  N'Quesada', N'OBR-H4-04', N'8888-0004', 1, SYSUTCDATETIME(), N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Marcos', N'Vega',   N'Araya',   N'OBR-H4-05', N'8888-0005', 1, SYSUTCDATETIME(), N'seed-obreros-h4'),
        (1, @idPuestoObrero, N'Diego',  N'Calvo',  N'Brenes',  N'OBR-H4-06', N'8888-0006', 1, SYSUTCDATETIME(), N'seed-obreros-h4');

-- 5) Cuadrillas: encargadas por el colaborador del usuario 6 (carlos=6) y del 5 (jerson=5)
IF NOT EXISTS (SELECT 1 FROM dbo.CuadrillasH4 WHERE Nombre = N'Cuadrilla Carlos')
    INSERT INTO dbo.CuadrillasH4 (Nombre, IDProyecto, IDEncargado, CreadoPor)
    VALUES (N'Cuadrilla Carlos', 2, 6, NULL);
SELECT @cu1 = IDCuadrilla FROM dbo.CuadrillasH4 WHERE Nombre = N'Cuadrilla Carlos';

IF NOT EXISTS (SELECT 1 FROM dbo.CuadrillasH4 WHERE Nombre = N'Cuadrilla Jerson')
    INSERT INTO dbo.CuadrillasH4 (Nombre, IDProyecto, IDEncargado, CreadoPor)
    VALUES (N'Cuadrilla Jerson', 1, 5, NULL);
SELECT @cu2 = IDCuadrilla FROM dbo.CuadrillasH4 WHERE Nombre = N'Cuadrilla Jerson';

-- 6) Asignar obreros: los primeros 3 a la cuadrilla de carlos, los otros 3 a la de jerson
;WITH obreros AS (
    SELECT idColaborador, ROW_NUMBER() OVER (ORDER BY idColaborador) AS rn
    FROM dbo.Colaborador
    WHERE creadoPor = N'seed-obreros-h4'
)
INSERT INTO dbo.CuadrillaMiembrosH4 (IDCuadrilla, IDCol)
SELECT CASE WHEN o.rn <= 3 THEN @cu1 ELSE @cu2 END, o.idColaborador
FROM obreros o
WHERE NOT EXISTS (SELECT 1 FROM dbo.CuadrillaMiembrosH4 m WHERE m.IDCol = o.idColaborador);
GO

-- Verificación
SELECT c.IDCuadrilla, c.Nombre, c.IDEncargado, COUNT(m.IDCuadMiembro) AS miembros
FROM dbo.CuadrillasH4 c
LEFT JOIN dbo.CuadrillaMiembrosH4 m ON m.IDCuadrilla = c.IDCuadrilla
GROUP BY c.IDCuadrilla, c.Nombre, c.IDEncargado
ORDER BY c.IDCuadrilla;
GO
