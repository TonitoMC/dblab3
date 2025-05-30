export enum Posicion {
  PORTERO = "Portero",
  DEFENSA = "Defensa",
  MEDIOCAMPISTA = "Mediocampista", // Fixed spelling
  DELANTERO = "Delantero",
}

export enum Temporada {
  TEMPORADA_2021_22 = "T2021_2022",
  TEMPORADA_2022_23 = "T2022_2023",
  TEMPORADA_2023_24 = "T2023_2024",
}

export interface EquipoInfoForPlayerList {
  equipoId: number
  equipoNombre: string
  equipoLiga: string
  equipoPais: string
  equipoFundado: number
  fechaIngreso: Date
  fechaSalida: Date | null
}

export interface EstadisticaInfoForPlayerList {
  id: number
  partidosJugados: number
  goles: number
  asistencias: number
  temporada: Temporada
}

export interface PlayerForList {
  jugadorId: number
  jugadorNombre: string
  jugadorPosicion: Posicion
  jugadorEdad: number
  jugadorNacionalidad: string
  jugadorCreatedAt: Date
  equipos: EquipoInfoForPlayerList[]
  estadisticas: EstadisticaInfoForPlayerList[]
}

export interface CreatePlayerData {
  nombre: string
  posicion: Posicion
  edad: number
  nacionalidad: string
  equipos?: {
    equipoId: number
    fechaIngreso: string // ISO string format
    fechaSalida?: string | null // ISO string format or null
  }[]
  estadisticas?: {
    partidosJugados: number
    goles: number
    asistencias: number
    temporada: Temporada
  }[]
}
