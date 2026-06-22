/* =============================================================================
   004 — Crear e importar dbo.sub_partidas (esquema + datos)
   Generado desde el export JSON. Filas: 94.
   Base destino: AdelanteSBX. Ejecutar en SSMS / Azure Data Studio.
   ============================================================================= */

IF OBJECT_ID('dbo.sub_partidas', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.sub_partidas (
        [id] INT IDENTITY(1,1) NOT NULL,
        [codigo] VARCHAR(50) NOT NULL,
        [nombre] NVARCHAR(50) NOT NULL,
        [partida_id] INT NOT NULL,
        [sprint_numero] SMALLINT NOT NULL,
        [es_critica] BIT NOT NULL,
        [descripcion] NVARCHAR(50) NULL,
        [activo] BIT NOT NULL,
        [creado_en] DATETIME2 NOT NULL,
        CONSTRAINT PK_sub_partidas PRIMARY KEY CLUSTERED ([id])
    );
END
GO

-- Carga de datos (preserva los id originales)
SET IDENTITY_INSERT dbo.sub_partidas ON;
GO
INSERT INTO dbo.sub_partidas ([id], [codigo], [nombre], [partida_id], [sprint_numero], [es_critica], [descripcion], [activo], [creado_en]) VALUES
    (1, '1.1.1', N'Trazos y Rellenos', 1, 1, 1, NULL, 1, '2026-05-27 19:47:13.587'),
    (2, '3.2.1', N'Mecánico Losa', 15, 1, 1, NULL, 1, '2026-05-27 19:47:12.628'),
    (3, '3.1.1', N'Eléctrico Losa', 14, 1, 1, NULL, 1, '2026-05-27 19:47:12.792'),
    (4, '1.1.2', N'Sello Losa', 1, 1, 1, NULL, 1, '2026-05-27 19:47:13.271'),
    (5, '1.1.3', N'Acero y Formaleta Losa', 1, 1, 1, NULL, 1, '2026-05-27 19:47:07.679'),
    (6, '1.1.4', N'Colado Losa', 1, 1, 1, NULL, 1, '2026-05-27 19:47:10.238'),
    (7, '1.2.1', N'Acero Muros N1', 2, 3, 1, NULL, 1, '2026-05-27 19:47:16.134'),
    (8, '1.2.2', N'Armado Formaleta N1', 2, 3, 1, NULL, 1, '2026-05-27 19:47:16.293'),
    (9, '1.2.3', N'Colado Muros N1', 2, 3, 1, NULL, 1, '2026-05-27 19:47:16.451'),
    (10, '1.2.4', N'Acero Muros N2', 2, 5, 1, NULL, 1, '2026-05-27 19:47:16.929'),
    (11, '1.2.5', N'Armado Formaleta N2', 2, 5, 1, NULL, 1, '2026-05-27 19:47:16.772'),
    (12, '3.1.2', N'Eléctrico Muros N1', 14, 3, 1, NULL, 1, '2026-05-27 19:47:15.816'),
    (13, '3.2.2', N'Mecanico Muros N1', 15, 3, 1, NULL, 1, '2026-05-27 19:47:15.974'),
    (14, '1.2.6', N'Colado Muros N2', 2, 5, 1, NULL, 1, '2026-05-27 19:47:07.505'),
    (15, '1.2.7', N'Armado Gradas N1', 2, 6, 0, NULL, 1, '2026-05-27 19:47:15.339'),
    (16, '1.2.8', N'Colado Gradas N1', 2, 6, 0, NULL, 1, '2026-05-27 19:47:15.659'),
    (17, '1.3.1', N'Estructura Techo Casa', 3, 6, 1, NULL, 1, '2026-05-27 19:47:15.022'),
    (18, '1.3.2', N'Cubierta de Techo Casa', 3, 6, 1, NULL, 1, '2026-05-27 19:47:15.179'),
    (19, '1.3.3', N'Estructura Cochera y Terraza', 3, 8, 1, NULL, 1, '2026-05-27 19:47:18.362'),
    (20, '1.3.4', N'Baranda Azotea', 3, 8, 0, NULL, 1, '2026-05-27 19:47:11.036'),
    (21, '1.3.5', N'Pasamanos Gradas', 3, 11, 0, NULL, 1, '2026-05-27 19:47:21.933'),
    (22, '1.3.6', N'Cubierta Cochera y Terraza', 3, 14, 0, NULL, 1, '2026-05-27 19:47:14.063'),
    (23, '1.3.7', N'Pintura Estructura', 3, 14, 0, NULL, 1, '2026-05-27 19:47:14.699'),
    (24, '1.3.8', N'Gradas Metalicas Armado', 3, 13, 0, NULL, 1, '2026-05-27 19:47:19.059'),
    (25, '1.4.1', N'Botaguas', 4, 9, 0, NULL, 1, '2026-05-27 19:47:14.864'),
    (26, '1.4.2', N'Canoas Cochera', 4, 14, 0, NULL, 1, '2026-05-27 19:47:14.540'),
    (27, '1.4.3', N'Canoas Casa', 4, 14, 0, NULL, 1, '2026-05-27 19:47:22.250'),
    (28, '1.4.4', N'Bajantes', 4, 17, 0, NULL, 1, '2026-05-27 19:47:15.498'),
    (29, '1.5.1', N'Columna Medidor', 5, 7, 0, NULL, 1, '2026-05-27 19:47:17.725'),
    (30, '1.5.2', N'Columnas Cochera', 5, 7, 0, NULL, 1, '2026-05-27 19:47:17.884'),
    (31, '1.5.3', N'Tapias Prefa', 5, 8, 0, NULL, 1, '2026-05-27 19:47:09.277'),
    (32, '1.5.4', N'Chorrea de Cochera', 5, 8, 0, NULL, 1, '2026-05-27 19:47:08.318'),
    (33, '1.5.5', N'Chorrea Terraza', 5, 8, 0, NULL, 1, '2026-05-27 19:47:13.113'),
    (34, '1.5.6', N'Aceras', 5, 8, 0, NULL, 1, '2026-05-27 19:47:09.438'),
    (35, '1.5.7', N'Geoceldas', 5, 17, 0, NULL, 1, '2026-05-27 19:47:20.816'),
    (36, '1.6.1', N'Liviano Exterior', 6, 9, 1, NULL, 1, '2026-05-27 19:47:08.481'),
    (37, '1.6.2', N'Liviano Tablero ', 6, 9, 0, NULL, 1, '2026-05-27 19:47:18.521'),
    (38, '1.6.3', N'Liviano Interior', 6, 9, 1, NULL, 1, '2026-05-27 19:47:09.757'),
    (39, '1.6.4', N'Tablilla Plastica', 6, 17, 0, NULL, 1, '2026-05-27 19:47:13.428'),
    (40, '2.1.1', N'Repello Externo', 7, 10, 1, NULL, 1, '2026-05-27 19:47:10.074'),
    (41, '2.1.2', N'Repello Interno', 7, 10, 1, NULL, 1, '2026-05-27 19:47:07.837'),
    (42, '2.1.3', N'Empaste', 7, 11, 1, NULL, 1, '2026-05-27 19:47:07.996'),
    (43, '2.2.1', N'Enchape Casa', 8, 14, 1, NULL, 1, '2026-05-27 19:47:10.712'),
    (44, '2.2.2', N'Tablatek o Enchape Externo', 8, 15, 0, NULL, 1, '2026-05-27 19:47:12.950'),
    (45, '2.3.1', N'Pintura Sello', 9, 15, 0, NULL, 1, '2026-05-27 19:47:13.905'),
    (46, '2.3.2', N'Pintura Externa', 9, 14, 0, NULL, 1, '2026-05-27 19:47:19.539'),
    (47, '2.3.3', N'Pintura Interna y Fisuras', 9, 17, 0, NULL, 1, '2026-05-27 19:47:22.092'),
    (48, '2.3.4', N'Impermeabilizante Azotea 1er Mano', 9, 17, 1, NULL, 1, '2026-05-27 19:47:21.137'),
    (49, '2.3.5', N'Datallado Pintura', 9, 18, 1, NULL, 1, '2026-05-27 19:47:12.170'),
    (50, '2.4.1', N'Ventaneria Casas', 10, 15, 1, NULL, 1, '2026-05-27 19:47:11.353');
GO
INSERT INTO dbo.sub_partidas ([id], [codigo], [nombre], [partida_id], [sprint_numero], [es_critica], [descripcion], [activo], [creado_en]) VALUES
    (51, '2.4.2', N'Puertas Corredizas', 10, 16, 0, NULL, 1, '2026-05-27 19:47:22.408'),
    (52, '2.6.1', N'Puertas y Rodapie', 11, 16, 1, NULL, 1, '2026-05-27 19:47:19.697'),
    (53, '2.6.2', N'Muebles y Closets', 11, 16, 0, NULL, 1, '2026-05-27 19:47:19.859'),
    (54, '2.6.3', N'Sobres de Cocina y Bano', 11, 17, 1, NULL, 1, '2026-05-27 19:47:20.019'),
    (55, '2.7.1', N'Losa Sanitaria', 12, 17, 0, NULL, 1, '2026-05-27 19:47:20.499'),
    (56, '2.7.2', N'Griferia y Fregadero', 12, 17, 1, NULL, 1, '2026-05-27 19:47:20.658'),
    (57, '2.7.3', N'Pila', 12, 17, 0, NULL, 1, '2026-05-27 19:47:20.335'),
    (58, '4.1.1', N'Extras ', 16, 19, 1, NULL, 1, '2026-05-27 19:47:11.840'),
    (59, '2.8.1', N'Relleno Patios', 13, 17, 0, NULL, 1, '2026-05-27 19:47:08.145'),
    (60, '2.8.2', N'Zacate', 13, 17, 0, NULL, 1, '2026-05-27 19:47:13.745'),
    (61, '2.8.3', N'Sello Cochera y Terraza', 13, 18, 0, NULL, 1, '2026-05-27 19:47:20.978'),
    (62, '2.8.4', N'Limpieza', 13, 19, 1, NULL, 1, '2026-05-27 19:47:17.248'),
    (63, '3.1.3', N'Electrico Muros N2', 14, 5, 1, NULL, 1, '2026-05-27 19:47:07.340'),
    (64, '3.1.4', N'Electrico Iluminacion', 14, 6, 0, NULL, 1, '2026-05-27 19:47:17.568'),
    (65, '3.1.5', N'Cableado Electrico', 14, 6, 0, NULL, 1, '2026-05-27 19:47:08.957'),
    (66, '3.1.6', N'Caja de Breakers y Datos', 14, 9, 0, NULL, 1, '2026-05-27 19:47:09.919'),
    (67, '3.1.7', N'Plaqueria y Apagadores', 14, 15, 0, NULL, 1, '2026-05-27 19:47:11.676'),
    (68, '3.1.8', N'Breakers', 14, 16, 0, NULL, 1, '2026-05-27 19:47:10.555'),
    (69, '3.1.9', N'Luminarias ', 14, 15, 0, NULL, 1, '2026-05-27 19:47:11.512'),
    (70, '3.2.3', N'Mecanico Muros N2', 15, 5, 1, NULL, 1, '2026-05-27 19:47:16.609'),
    (71, '3.2.4', N'Tuberias y Cajas Externas', 15, 7, 1, NULL, 1, '2026-05-27 19:47:18.204'),
    (72, '3.2.5', N'Tuberias Internas y Bajantes Mecanicos', 15, 7, 0, NULL, 1, '2026-05-27 19:47:18.042'),
    (73, '1.2.9', N'Armado Gradas N2', 2, 7, 0, NULL, 1, '2026-05-27 19:47:14.380'),
    (74, '1.2.10', N'Colado Gradas N2', 2, 7, 0, NULL, 1, '2026-05-27 19:47:14.223'),
    (75, '1.1.5', N'Desencofre y Resane Losa', 1, 1, 0, NULL, 1, '2026-05-27 19:47:17.088'),
    (76, '1.2.11', N'Desencofre Muros N1', 2, 3, 0, NULL, 1, '2026-05-27 19:47:08.637'),
    (77, '1.2.12', N'Resane Muros N1', 2, 3, 0, NULL, 1, '2026-05-27 19:47:21.456'),
    (78, '1.2.13', N'Desencofre Muros N2', 2, 5, 0, NULL, 1, '2026-05-27 19:47:08.799'),
    (79, '1.2.14', N'Resane Muros N2', 2, 5, 0, NULL, 1, '2026-05-27 19:47:17.410'),
    (80, '1.2.15', N'Desencofre Gradas N1', 2, 6, 0, NULL, 1, '2026-05-27 19:47:09.119'),
    (81, '1.2.16', N'Desencofre Gradas N2', 2, 7, 0, NULL, 1, '2026-05-27 19:47:21.614'),
    (82, '1.3.9', N'Perling Tapia', 3, 8, 0, NULL, 1, '2026-05-27 19:47:09.601'),
    (83, '1.6.5', N'Liviano Cuarto Pilas', 6, 9, 0, NULL, 1, '2026-05-27 19:47:18.679'),
    (84, '2.1.4', N'Repello Tapia', 7, 10, 0, NULL, 1, '2026-05-27 19:47:10.396'),
    (85, '2.1.5', N'Repello N2', 7, 11, 1, NULL, 1, '2026-05-27 19:47:18.901'),
    (86, '2.1.6', N'Empaste N2 Az', 7, 12, 1, NULL, 1, '2026-05-27 19:47:10.869'),
    (87, '1.3.10', N'Colado Grada Metalica', 3, 13, 0, NULL, 1, '2026-05-27 19:47:21.771'),
    (88, '2.2.3', N'Fragua', 8, 15, 1, NULL, 1, '2026-05-27 19:47:11.194'),
    (89, '2.2.4', N'Enchape N2', 8, 15, 1, NULL, 1, '2026-05-27 19:47:19.209'),
    (90, '1.5.8', N'Ochavos Azotea', 5, 14, 0, NULL, 1, '2026-05-27 19:47:19.377'),
    (91, '2.3.6', N'Poncheo', 13, 19, 1, NULL, 1, '2026-05-27 19:47:12.001'),
    (92, '3.2.6', N'Tanque A/C', 15, 19, 0, NULL, 1, '2026-05-27 19:47:20.177'),
    (93, '1.3.11', N'Pintura Cubierta Techo', 3, 18, 0, NULL, 1, '2026-05-27 19:47:12.441'),
    (94, '2.3.7', N'Impermeabilizante Azotea Final', 9, 18, 0, NULL, 1, '2026-05-27 19:47:21.296');
GO
SET IDENTITY_INSERT dbo.sub_partidas OFF;
GO

SELECT COUNT(*) AS filas FROM dbo.sub_partidas;
GO
