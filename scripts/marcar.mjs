// Simula el marcaje externo (entrada/salida) para pruebas.
// Uso: node --env-file=.env.local scripts/marcar.mjs <entrada|salida> <cedula>
//
// ENTRADA: registra el evento, abre Jornada y abre el tramo según la
//          AsignacionVigente del colaborador (si no tiene, queda sin asignación).
// SALIDA : registra el evento, cierra el tramo abierto y la Jornada.

import sql from "mssql";

const [, , tipoArg, cedula] = process.argv;
const tipo = (tipoArg || "").toLowerCase();

if (!["entrada", "salida"].includes(tipo) || !cedula) {
  console.error("Uso: node --env-file=.env.local scripts/marcar.mjs <entrada|salida> <cedula>");
  process.exit(1);
}

const config = {
  server: process.env.SQL_SERVER,
  port: Number.parseInt(process.env.SQL_PORT ?? "1433", 10),
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  options: { encrypt: true, trustServerCertificate: false },
  connectionTimeout: 8000,
  requestTimeout: 20000,
};

const pool = await sql.connect(config);

try {
  // Resolver colaborador por cédula
  const cr = await pool.request().input("ced", sql.NVarChar(100), cedula)
    .query("SELECT idColaborador, calcNombreCompleto AS nombre FROM dbo.Colaborador WHERE cedula = @ced");
  const col = cr.recordset[0];
  if (!col) {
    console.error(`Cédula no encontrada: ${cedula}`);
    process.exit(1);
  }
  const id = col.idColaborador;
  const tipoEvento = tipo === "entrada" ? "ENTRADA" : "SALIDA";

  // 1) Evento crudo (lo que mandaría el API externo)
  await pool.request()
    .input("ced", sql.NVarChar(100), cedula)
    .input("id", sql.Int, id)
    .input("t", sql.NVarChar(10), tipoEvento)
    .query(`INSERT INTO dbo.MarcajeEvento (cedula, idColaborador, tipoEvento, fechaHoraUtc, dispositivo, esProcesado, creadoPor)
            VALUES (@ced, @id, @t, SYSUTCDATETIME(), N'cli-test', 1, N'cli-marcar')`);

  if (tipo === "entrada") {
    const jr = await pool.request().input("id", sql.Int, id)
      .query("SELECT idJornada FROM dbo.Jornada WHERE idColaborador = @id AND fechaHoraSalidaUtc IS NULL");
    if (jr.recordset[0]) {
      console.log(`${col.nombre}: ya tenía una jornada abierta (no se duplica).`);
    } else {
      const ins = await pool.request().input("id", sql.Int, id)
        .query(`INSERT INTO dbo.Jornada (idColaborador, fechaHoraEntradaUtc, estado, creadoPor)
                OUTPUT inserted.idJornada VALUES (@id, SYSUTCDATETIME(), N'Abierta', N'cli-marcar')`);
      const idJornada = ins.recordset[0].idJornada;

      const v = await pool.request().input("id", sql.Int, id)
        .query("SELECT idObraSubpartida, idCuadrilla FROM dbo.AsignacionVigente WHERE idColaborador = @id");
      if (!v.recordset[0]) {
        console.log(`${col.nombre}: ENTRADA registrada, pero SIN asignación vigente → no se abrió tramo.`);
      } else {
        const { idObraSubpartida, idCuadrilla } = v.recordset[0];
        const h = await pool.request().input("id", sql.Int, id)
          .query("SELECT TOP 1 IDCuadrilla FROM dbo.CuadrillaMiembro WHERE IDCol = @id AND Activo = 1");
        const home = h.recordset[0]?.IDCuadrilla ?? null;
        const esPrestamo = home && home !== idCuadrilla ? 1 : 0;
        await pool.request()
          .input("j", sql.BigInt, idJornada)
          .input("id", sql.Int, id)
          .input("os", sql.BigInt, idObraSubpartida)
          .input("cu", sql.Int, idCuadrilla)
          .input("p", sql.Bit, esPrestamo)
          .query(`INSERT INTO dbo.AsignacionTramo (idJornada, idColaborador, idObraSubpartida, idCuadrilla, horaInicioUtc, esPrestamo, creadoPor)
                  VALUES (@j, @id, @os, @cu, SYSUTCDATETIME(), @p, N'cli-marcar')`);
        console.log(`${col.nombre}: ENTRADA registrada y tramo abierto${esPrestamo ? " (préstamo)" : ""}.`);
      }
    }
  } else {
    const jr = await pool.request().input("id", sql.Int, id)
      .query("SELECT idJornada FROM dbo.Jornada WHERE idColaborador = @id AND fechaHoraSalidaUtc IS NULL");
    if (!jr.recordset[0]) {
      console.log(`${col.nombre}: no tiene jornada abierta (nada que cerrar).`);
    } else {
      await pool.request().input("id", sql.Int, id)
        .query(`UPDATE dbo.AsignacionTramo SET horaFinUtc = SYSUTCDATETIME(), fechaModificacion = SYSUTCDATETIME(), modificadoPor = N'cli-marcar'
                WHERE idColaborador = @id AND horaFinUtc IS NULL`);
      await pool.request().input("id", sql.Int, id)
        .query(`UPDATE dbo.Jornada SET fechaHoraSalidaUtc = SYSUTCDATETIME(), estado = N'Cerrada', fechaModificacion = SYSUTCDATETIME(), modificadoPor = N'cli-marcar'
                WHERE idColaborador = @id AND fechaHoraSalidaUtc IS NULL`);
      console.log(`${col.nombre}: SALIDA registrada, jornada y tramo cerrados.`);
    }
  }
} finally {
  await pool.close();
}
