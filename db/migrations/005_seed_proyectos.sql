/* =============================================================================
   005 — Datos de prueba: 2 Proyectos (+ 1 Compañía, requerida por el FK)
   Base: AdelanteSBX (PRUEBAS). Idempotente.
   Solo campos NOT NULL (los necesarios). Se fuerzan los ids 1 y 2 para que
   coincidan con los datos de Obras (que referencian IDProyecto = 2).
   ============================================================================= */

-- Compañía (Proyecto.idCompania es FK obligatorio y dbo.Compania está vacía)
SET IDENTITY_INSERT dbo.Compania ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Compania WHERE idCompania = 1)
    INSERT INTO dbo.Compania (idCompania, codigo, nombre, fechaCreacion, creadoPor)
    VALUES (1, N'ADL', N'Adelante', SYSUTCDATETIME(), N'seed-prueba');
SET IDENTITY_INSERT dbo.Compania OFF;
GO

-- 2 Proyectos de prueba
SET IDENTITY_INSERT dbo.Proyecto ON;
IF NOT EXISTS (SELECT 1 FROM dbo.Proyecto WHERE idProyecto = 1)
    INSERT INTO dbo.Proyecto (idProyecto, idCompania, nombre, abreviatura, categoria, linkUbicacion, colorHexP, colorHexPDOC, fechaCreacion, creadoPor)
    VALUES (1, 1, N'Valle Castilla', N'VC', N'Residencial', N'', N'#9DCB94', N'#9DCB94', SYSUTCDATETIME(), N'seed-prueba');
IF NOT EXISTS (SELECT 1 FROM dbo.Proyecto WHERE idProyecto = 2)
    INSERT INTO dbo.Proyecto (idProyecto, idCompania, nombre, abreviatura, categoria, linkUbicacion, colorHexP, colorHexPDOC, fechaCreacion, creadoPor)
    VALUES (2, 1, N'Valle Novarum', N'VN', N'Residencial', N'', N'#3FA535', N'#3FA535', SYSUTCDATETIME(), N'seed-prueba');
SET IDENTITY_INSERT dbo.Proyecto OFF;
GO

-- Verificación
SELECT idProyecto, idCompania, nombre, abreviatura FROM dbo.Proyecto ORDER BY idProyecto;
GO
