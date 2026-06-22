/* =============================================================================
   002 — Agregar roles "Maestro de Obras" e "Ingeniero Residente" a dbo.Rol
   Base: AdelanteSBX (PRUEBAS).
   Idempotente: solo inserta si no existen (por nombre + idApp).

   Nota: dbo.Rol tiene idApp NOT NULL. Se usa idApp = 1 (misma app que el rol
   "Administrador" ya existente). Ajustá el idApp si tu app es otra.
   ============================================================================= */

INSERT INTO dbo.Rol (idApp, nombre, descripcion, fechaCreacion, creadoPor)
SELECT v.idApp, v.nombre, v.descripcion, SYSUTCDATETIME(), N'script-migracion'
FROM (VALUES
    (1, N'Maestro de Obras',    N'Maestro de obras'),
    (1, N'Ingeniero Residente', N'Ingeniero residente')
) AS v (idApp, nombre, descripcion)
WHERE NOT EXISTS (
    SELECT 1 FROM dbo.Rol r
    WHERE r.nombre = v.nombre AND r.idApp = v.idApp
);
GO

-- Verificación
SELECT idRol, idApp, nombre, descripcion FROM dbo.Rol ORDER BY idRol;
GO
