
import { PrismaClient, Posicion, Temporada, JugadorEquiposView as PrismaJugadorEquiposViewType } from '@prisma/client';

const prisma = new PrismaClient();

class PlayerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlayerValidationError";
  }
}

class TeamOverlapError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TeamOverlapError";
  }
}

interface EquipoInfoForPlayerList {
  equipoId: number;
  equipoNombre: string;
  equipoLiga: string;
  equipoPais: string;
  equipoFundado: number;
  fechaIngreso: Date;
  fechaSalida: Date | null;
}

interface EstadisticaInfoForPlayerList {
  id: number;
  partidosJugados: number;
  goles: number;
  asistencias: number;
  temporada: Temporada;
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
  estadisticas?: CreateEstadisticaData[];
}

export interface TeamStintInputData {
  equipoId: number;
  fechaIngreso: Date | string;
  fechaSalida?: Date | string | null;
}

export interface EstadisticaInputData {
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

function validatePlayerData(data: Partial<CreatePlayerData>): void {
  if (data.nombre !== undefined && (!data.nombre || data.nombre.trim().length === 0)) {
    throw new PlayerValidationError("Player name cannot be empty");
  }

  if (data.edad !== undefined && (data.edad < 16 || data.edad > 50)) {
    throw new PlayerValidationError("Player age must be between 16 and 50");
  }

  if (data.nacionalidad !== undefined && (!data.nacionalidad || data.nacionalidad.trim().length === 0)) {
    throw new PlayerValidationError("Player nationality cannot be empty");
  }
}

function validateEstadisticaData(stats: CreateEstadisticaData[]): void {
  for (const stat of stats) {
    if (stat.partidosJugados < 0) {
      throw new PlayerValidationError("Games played cannot be negative");
    }
    if (stat.goles < 0) {
      throw new PlayerValidationError("Goals cannot be negative");
    }
    if (stat.asistencias < 0) {
      throw new PlayerValidationError("Assists cannot be negative");
    }
  }
}

function dateRangesOverlap(
  start1: Date,
  end1: Date | null,
  start2: Date,
  end2: Date | null
): boolean {
  const effectiveEnd1 = end1 || new Date();
  const effectiveEnd2 = end2 || new Date();
  return start1 <= effectiveEnd2 && start2 <= effectiveEnd1;
}

async function validateNoTeamOverlaps(
  playerId: number | null,
  newTeamStints: { equipoId: number; fechaIngreso: Date | string; fechaSalida?: Date | string | null }[]
): Promise<void> {
  let existingStints: { equipoId: number; fechaIngreso: Date; fechaSalida: Date | null }[] = [];

  if (playerId) {
    const existing = await prisma.jugadorEquipo.findMany({
      where: { jugadorId: playerId },
      select: { equipoId: true, fechaIngreso: true, fechaSalida: true },
    });
    existingStints = existing;
  }

  const normalizedNewStints = newTeamStints.map(stint => ({
    equipoId: stint.equipoId,
    fechaIngreso: new Date(stint.fechaIngreso),
    fechaSalida: stint.fechaSalida ? new Date(stint.fechaSalida) : null,
  }));

  for (let i = 0; i < normalizedNewStints.length; i++) {
    for (let j = i + 1; j < normalizedNewStints.length; j++) {
      const stint1 = normalizedNewStints[i];
      const stint2 = normalizedNewStints[j];

      if (dateRangesOverlap(
        stint1.fechaIngreso,
        stint1.fechaSalida,
        stint2.fechaIngreso,
        stint2.fechaSalida
      )) {
        throw new TeamOverlapError(
          `Player cannot be on multiple teams during overlapping periods`
        );
      }
    }
  }

  for (const existingStint of existingStints) {
    for (const newStint of normalizedNewStints) {
      if (dateRangesOverlap(
        existingStint.fechaIngreso,
        existingStint.fechaSalida,
        newStint.fechaIngreso,
        newStint.fechaSalida
      )) {
        throw new TeamOverlapError(
          `New team stint overlaps with existing team assignment`
        );
      }
    }
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) {
    return String(error.message);
  }
  return 'Unknown error occurred';
}

export async function createPlayer(data: CreatePlayerData) {
  console.log("Data received in createPlayer:", JSON.stringify(data, null, 2));

  try {
    validatePlayerData(data);

    if (data.estadisticas) {
      validateEstadisticaData(data.estadisticas);
    }

    if (data.equipos) {
      await validateNoTeamOverlaps(null, data.equipos);
    }

    const createData = {
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
      estadisticas: data.estadisticas
        ? {
          create: data.estadisticas.map(stat => ({
            partidosJugados: stat.partidosJugados,
            goles: stat.goles,
            asistencias: stat.asistencias,
            temporada: stat.temporada,
          })),
        }
        : undefined,
    };

    console.log("About to create player with data:", JSON.stringify(createData, null, 2));

    const player = await prisma.jugador.create({
      data: createData,
      include: {
        equipos: { include: { equipo: true } },
        estadisticas: true,
      },
    });

    console.log("Player created successfully:", JSON.stringify(player, null, 2));
    return player;
  } catch (error) {
    console.error("!!! ERROR IN createPlayer !!!:", error);

    if (error instanceof PlayerValidationError || error instanceof TeamOverlapError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'code' in error) {
      switch (error.code) {
        case 'P2002':
          throw new PlayerValidationError("A player with this information already exists");
        case 'P2025':
          throw new PlayerValidationError("Referenced team does not exist");
        default:
          throw new Error(`Database error: ${getErrorMessage(error)}`);
      }
    }

    throw new Error(`Failed to create player: ${getErrorMessage(error)}`);
  }
}

export async function getPlayers(): Promise<PlayerForList[]> {
  try {
    const viewResults = await prisma.jugadorEquiposView.findMany({
      orderBy: [
        { jugadorNombre: 'asc' },
        { view_row_id: 'asc' }
      ],
    });

    if (!viewResults || viewResults.length === 0) {
      return [];
    }

    const playersMap = new Map<number, PlayerForList>();

    for (const row of viewResults) {
      if (!playersMap.has(row.jugadorId)) {
        let parsedStats: EstadisticaInfoForPlayerList[] = [];
        if (row.estadisticasArray && Array.isArray(row.estadisticasArray)) {
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
          estadisticas: parsedStats,
        });
      }

      const playerEntry = playersMap.get(row.jugadorId)!;

      if (
        row.equipoId !== null && row.equipoNombre !== null && row.fechaIngreso !== null &&
        row.equipoLiga !== null && row.equipoPais !== null && row.equipoFundado !== null
      ) {
        const teamExists = playerEntry.equipos.some(
          (e) => e.equipoId === row.equipoId &&
            e.fechaIngreso.getTime() === row.fechaIngreso!.getTime()
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

    return Array.from(playersMap.values());
  } catch (error) {
    throw new Error(`Failed to fetch players: ${getErrorMessage(error)}`);
  }
}

export async function updatePlayer(
  id: number,
  data: Partial<{ nombre: string; posicion: Posicion; edad: number; nacionalidad: string }>
) {
  try {
    validatePlayerData(data);

    return await prisma.jugador.update({
      where: { id },
      data,
      include: {
        equipos: { include: { equipo: true } },
        estadisticas: true,
      },
    });
  } catch (error) {
    if (error instanceof PlayerValidationError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2025') {
      throw new PlayerValidationError("Player not found");
    }

    throw new Error(`Failed to update player: ${getErrorMessage(error)}`);
  }
}

export async function deletePlayer(id: number) {
  try {
    const deletedPlayer = await prisma.jugador.delete({
      where: { id },
    });
    return deletedPlayer;
  } catch (error: any) {
    if (error.code === 'P2025') {
      throw new PlayerValidationError('Player not found to delete.');
    }
    throw new Error(`Failed to delete player: ${getErrorMessage(error)}`);
  }
}

