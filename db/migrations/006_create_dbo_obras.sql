/* =============================================================================
   006 — Crear dbo.Obras (columnas iniciales) + datos de prueba
   Base: AdelanteSBX (PRUEBAS). Idempotente.
   REQUIERE haber corrido 005 antes (la FK IDProyecto apunta a dbo.Proyecto,
   y los datos de prueba usan IDProyecto = 2 = Valle Novarum).

   Columnas según la tabla de origen:
     IDObraAD (PK, asignado externamente), IDLote, IDProyecto (FK), IDPresupuesto, Obra
   ============================================================================= */

IF OBJECT_ID('dbo.Obras', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Obras (
        IDObraAD      INT          NOT NULL,
        IDLote        INT          NULL,
        IDProyecto    INT          NOT NULL,
        IDPresupuesto INT          NULL,
        Obra          NVARCHAR(40) NOT NULL,
        CONSTRAINT PK_Obras PRIMARY KEY CLUSTERED (IDObraAD)
    );
END
GO

-- FK hacia dbo.Proyecto
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Obras_Proyecto')
    ALTER TABLE dbo.Obras
        ADD CONSTRAINT FK_Obras_Proyecto
        FOREIGN KEY (IDProyecto) REFERENCES dbo.Proyecto (idProyecto);
GO

-- Datos de prueba (5 obras del proyecto 2 = Valle Novarum)
IF NOT EXISTS (SELECT 1 FROM dbo.Obras)
    INSERT INTO dbo.Obras (IDObraAD, IDLote, IDProyecto, IDPresupuesto, Obra) VALUES
        (20, 550, 2, NULL, N'VN-G.01'),
        (21, 551, 2, NULL, N'VN-G.02'),
        (22, 552, 2, NULL, N'VN-G.03'),
        (23, 553, 2, NULL, N'VN-G.04'),
        (25, 554, 2, NULL, N'VN-G.05');
GO

-- Verificación
SELECT IDObraAD, IDLote, IDProyecto, IDPresupuesto, Obra FROM dbo.Obras ORDER BY IDObraAD;
GO
