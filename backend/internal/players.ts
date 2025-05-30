import { PrismaClient, Posicion, Temporada, JugadorEquiposView as PrismaJugadorEquiposViewType } from '@prisma/client';

const prisma = new PrismaClient();

// --- Define the desired output structure ---
interface EquipoInfoForPlayerList {
  equipoId: number;
  equipoNombre: string;
  equipoLiga: string;
  equipoPais: string;
  equipoFundado: number;
  fechaIngreso: Date;
  fechaSalida: Date | null;
}

interface EstadisticaInfoForPlayerList { // New interface for individual statistic entries
  id: number; // Estadistica's own ID
  partidosJugados: number;
  goles: number;
  asistencias: number;
  temporada: Temporada; // Use your Prisma enum
}

interface PlayerForList {
  jugadorId: number;
  jugadorNombre: string;
  jugadorPosicion: Posicion;
  jugadorEdad: number;
  jugadorNacionalidad: string;
  jugadorCreatedAt: Date;
  equipos: EquipoInfoForPlayerList[];
  estadisticas: EstadisticaInfoForPlayerList[];
}

export interface CreateEstadisticaData {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  temporada: Temporada;
}

// Updated input type for creating a new player
export interface CreatePlayerData {
  nombre: string;
  posicion: Posicion;
  edad: number;
  nacionalidad: string;
  equipos?: {
    equipoId: number;
    fechaIngreso: Date | string;
    fechaSalida?: Date | string | null;
  }[];
  estadisticas?: CreateEstadisticaData[]; // <<< ADDED THIS
}

// Re-using or defining similar input types for stints and stats
export interface TeamStintInputData { // For one team stint
  equipoId: number;
  fechaIngreso: Date | string;
  fechaSalida?: Date | string | null;
}

export interface EstadisticaInputData { // For one statistic entry
  partidosJugados: number;
  goles: number;
  asistencias: number;
  temporada: Temporada;
}

export interface UpdatePlayerWithRelationsPayload {
  nombre?: string;
  posicion?: Posicion;
  edad?: number;
  nacionalidad?: string;
  equipos?: TeamStintInputData[];
  estadisticas?: EstadisticaInputData[];
}

export async function createPlayer(data: CreatePlayerData) {
  console.log("Data received in createPlayer:", JSON.stringify(data, null, 2));
  try {
    const player = await prisma.jugador.create({
      data: {
        nombre: data.nombre,
        posicion: data.posicion,
        edad: data.edad,
        nacionalidad: data.nacionalidad,
        equipos: data.equipos
          ? {
            create: data.equipos.map((eq) => ({
              equipo: { connect: { id: eq.equipoId } },
              fechaIngreso: new Date(eq.fechaIngreso),
              fechaSalida: eq.fechaSalida ? new Date(eq.fechaSalida) : null,
            })),
          }
          : undefined,
        // Create initial statistics if provided
        estadisticas: data.estadisticas // Prisma can directly use this array for 'create'
          ? {
            create: data.estadisticas.map(stat => ({
              partidosJugados: stat.partidosJugados,
              goles: stat.goles,
              asistencias: stat.asistencias,
              temporada: stat.temporada, // Ensure this matches your enum values
            })),
          }
          : undefined,
      },
      include: { // What to return after creation
        equipos: { include: { equipo: true } },
        estadisticas: true, // Include statistics in the response
      },
    });
    console.log("Player created successfully:", JSON.stringify(player, null, 2));
    return player;
  } catch (error) {
    console.error("!!! ERROR IN createPlayer !!!:", error);
    throw error;
  }
}

export async function getPlayers(): Promise<PlayerForList[]> {
  console.log("DEBUG: [getPlayers] Function called (fetching stats from view).");

  let viewResults: PrismaJugadorEquiposViewType[];

  try {
    console.log("DEBUG: [getPlayers] Attempting to fetch from prisma.jugadorEquiposView...");
    viewResults = await prisma.jugadorEquiposView.findMany({
      orderBy: [
        { jugadorNombre: 'asc' },
        { view_row_id: 'asc' }
      ],
    });
    console.log("DEBUG: [getPlayers] Prisma query successful.");
    console.log(`DEBUG: [getPlayers] Raw viewResults length: ${viewResults.length}`);

    // Removed BigInt-problematic logs for brevity, add back with replacer if needed for debugging
  } catch (error) {
    console.error("DEBUG: [getPlayers] !!! ERROR DURING PRISMA QUERY ON VIEW !!!", error);
    throw error;
  }

  if (!viewResults || viewResults.length === 0) {
    console.log("DEBUG: [getPlayers] viewResults is empty. Returning empty array.");
    return [];
  }

  const playersMap = new Map<number, PlayerForList>();

  for (const row of viewResults) {
    if (!playersMap.has(row.jugadorId)) {
      // The 'estadisticasArray' from the view is a JSON type.
      // Prisma Client will return it as a JavaScript array of objects if the JSON is an array.
      // We need to cast it to our defined type.
      let parsedStats: EstadisticaInfoForPlayerList[] = [];
      if (row.estadisticasArray && Array.isArray(row.estadisticasArray)) {
        // Assuming the objects within row.estadisticasArray match EstadisticaInfoForPlayerList
        parsedStats = row.estadisticasArray as any as EstadisticaInfoForPlayerList[];
      }

      playersMap.set(row.jugadorId, {
        jugadorId: row.jugadorId,
        jugadorNombre: row.jugadorNombre,
        jugadorPosicion: row.jugadorPosicion,
        jugadorEdad: row.jugadorEdad,
        jugadorNacionalidad: row.jugadorNacionalidad,
        jugadorCreatedAt: row.jugadorCreatedAt,
        equipos: [],
        estadisticas: parsedStats, // Assign the parsed statistics array
      });
    }

    const playerEntry = playersMap.get(row.jugadorId)!;

    // Add team information if it exists
    if (
      row.equipoId !== null && row.equipoNombre !== null && row.fechaIngreso !== null &&
      row.equipoLiga !== null && row.equipoPais !== null && row.equipoFundado !== null
    ) {
      // Check if this specific team stint is already added for this player
      // This is important because the view still has one row per player-team,
      // but the stats array is the same for all those rows for the same player.
      const teamExists = playerEntry.equipos.some(
        (e) => e.equipoId === row.equipoId &&
          e.fechaIngreso.getTime() === row.fechaIngreso!.getTime() // Compare time for Date objects
      );

      if (!teamExists) {
        playerEntry.equipos.push({
          equipoId: row.equipoId,
          equipoNombre: row.equipoNombre,
          equipoLiga: row.equipoLiga,
          equipoPais: row.equipoPais,
          equipoFundado: row.equipoFundado,
          fechaIngreso: row.fechaIngreso,
          fechaSalida: row.fechaSalida,
        });
      }
    }
  }

  const processedPlayers = Array.from(playersMap.values());
  console.log(`DEBUG: [getPlayers] Processing complete. Returning ${processedPlayers.length} unique players.`);
  return processedPlayers;
}


export async function updatePlayer(
  id: number,
  data: Partial<{ nombre: string; posicion: Posicion; edad: number; nacionalidad: string }>
) {
  return await prisma.jugador.update({
    where: { id },
    data,
  });
}

export async function deletePlayer(id: number) {
  console.log(`Attempting to delete player with ID: ${id} (cascade should apply)`);
  try {
    const deletedPlayer = await prisma.jugador.delete({
      where: { id },
    });
    console.log("Successfully deleted player and related records (due to cascade):", deletedPlayer);
    return deletedPlayer; // Or a success message
  } catch (error: any) {
    console.error(`Error deleting player with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record to delete not found
      throw new Error('Player not found to delete.');
    }
    throw error;
  }
}
