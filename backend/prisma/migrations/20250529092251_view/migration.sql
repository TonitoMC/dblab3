
CREATE OR REPLACE VIEW "JugadorEquiposView" AS
SELECT
    ROW_NUMBER() OVER (ORDER BY j.id ASC, je."fechaIngreso" ASC NULLS LAST, je."equipoId" ASC NULLS LAST) AS "view_row_id",
    j.id AS "jugadorId",
    j.nombre AS "jugadorNombre",
    j.posicion AS "jugadorPosicion",
    j.edad AS "jugadorEdad",
    j.nacionalidad AS "jugadorNacionalidad",
    j."createdAt" AS "jugadorCreatedAt",

    e.id AS "equipoId",
    e.nombre AS "equipoNombre",
    e.liga AS "equipoLiga",
    e.pais AS "equipoPais",
    e.fundado AS "equipoFundado",

    je."fechaIngreso",
    je."fechaSalida",

    (
        SELECT COALESCE(
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'id', es.id,
                    'partidosJugados', es."partidosJugados",
                    'goles', es.goles,
                    'asistencias', es.asistencias,
                    'temporada', es.temporada
                ) ORDER BY es.temporada DESC
            ), '[]'::json)
        FROM "Estadistica" es
        WHERE es."jugadorId" = j.id
    ) AS "estadisticasArray"
FROM
    "Jugador" j
LEFT JOIN
    "JugadorEquipo" je ON j.id = je."jugadorId"
LEFT JOIN
    "Equipo" e ON je."equipoId" = e.id;
