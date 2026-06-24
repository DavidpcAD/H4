-- ============================================
-- Objeto:      dbo.Cuadrilla, dbo.CuadrillaMiembro
-- Tipo:        RENAME
-- Descripción: Estandariza CuadrillasH4 -> Cuadrilla y CuadrillaMiembrosH4 ->
--              CuadrillaMiembro (PascalCase singular) + constraints.
-- Autor:       migración H4
-- Fecha:       2026-06-23
-- Modificado:
-- ============================================
-- OJO: el código de la app (/api/mi-cuadrilla y el seed 003) referencia los
-- nombres viejos; deben actualizarse junto con este rename.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- Tablas
IF OBJECT_ID('dbo.CuadrillasH4', 'U') IS NOT NULL AND OBJECT_ID('dbo.Cuadrilla', 'U') IS NULL
    EXEC sp_rename 'dbo.CuadrillasH4', 'Cuadrilla';
IF OBJECT_ID('dbo.CuadrillaMiembrosH4', 'U') IS NOT NULL AND OBJECT_ID('dbo.CuadrillaMiembro', 'U') IS NULL
    EXEC sp_rename 'dbo.CuadrillaMiembrosH4', 'CuadrillaMiembro';
GO

-- Primary keys
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'PK_CuadrillasH4')
    EXEC sp_rename 'dbo.PK_CuadrillasH4', 'pk_cuadrilla';
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'PK_CuadrillaMiembrosH4')
    EXEC sp_rename 'dbo.PK_CuadrillaMiembrosH4', 'pk_cuadrillaMiembro';
GO

-- Default constraints
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'DF_CuadrillasH4_Capacidad')
    EXEC sp_rename 'dbo.DF_CuadrillasH4_Capacidad', 'df_cuadrilla_capacidad';
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'DF_CuadrillasH4_Activo')
    EXEC sp_rename 'dbo.DF_CuadrillasH4_Activo', 'df_cuadrilla_activo';
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'DF_CuadrillasH4_FechaCreacion')
    EXEC sp_rename 'dbo.DF_CuadrillasH4_FechaCreacion', 'df_cuadrilla_fechaCreacion';
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'DF_CuadrillaMiembrosH4_FechaIngreso')
    EXEC sp_rename 'dbo.DF_CuadrillaMiembrosH4_FechaIngreso', 'df_cuadrillaMiembro_fechaIngreso';
IF EXISTS (SELECT 1 FROM sys.objects WHERE name = 'DF_CuadrillaMiembrosH4_Activo')
    EXEC sp_rename 'dbo.DF_CuadrillaMiembrosH4_Activo', 'df_cuadrillaMiembro_activo';
GO

-- Nota: las columnas (IDCuadrilla, Nombre, IDEncargado, IDCol...) se mantienen
-- con su nombre actual para no romper las consultas existentes de la app.
