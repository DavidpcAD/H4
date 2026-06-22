/* =============================================================================
   001 — Agregar idRol a dbo.Usuario (FK a dbo.Rol)
   Base: AdelanteSBX (PRUEBAS). Ejecutar en SSMS / Azure Data Studio.
   Idempotente: se puede correr varias veces sin error.
   ============================================================================= */

-- 1) Columna idRol (nullable: los usuarios existentes no tienen rol asignado aún)
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('dbo.Usuario') AND name = 'idRol'
)
    ALTER TABLE dbo.Usuario ADD idRol INT NULL;
GO

-- 2) Llave foránea hacia dbo.Rol(idRol) (en batch aparte para que vea la columna)
IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_Usuario_Rol'
)
    ALTER TABLE dbo.Usuario
        ADD CONSTRAINT FK_Usuario_Rol
        FOREIGN KEY (idRol) REFERENCES dbo.Rol (idRol);
GO
