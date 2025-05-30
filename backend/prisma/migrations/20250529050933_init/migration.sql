-- CreateEnum
CREATE TYPE "Posicion" AS ENUM ('Portero', 'Defensa', 'Mediocampista', 'Delantero');

-- CreateEnum
CREATE TYPE "Temporada" AS ENUM ('T2021_2022', 'T2022_2023', 'T2023_2024');

-- CreateTable
CREATE TABLE "Jugador" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "posicion" "Posicion" NOT NULL,
    "edad" SMALLINT NOT NULL,
    "nacionalidad" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Jugador_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "liga" TEXT NOT NULL,
    "pais" TEXT NOT NULL,
    "fundado" SMALLINT NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JugadorEquipo" (
    "jugadorId" INTEGER NOT NULL,
    "equipoId" INTEGER NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaSalida" TIMESTAMP(3),

    CONSTRAINT "JugadorEquipo_pkey" PRIMARY KEY ("jugadorId","equipoId")
);

-- CreateTable
CREATE TABLE "Estadistica" (
    "id" SERIAL NOT NULL,
    "jugadorId" INTEGER NOT NULL,
    "partidosJugados" INTEGER NOT NULL,
    "goles" INTEGER NOT NULL,
    "asistencias" INTEGER NOT NULL,
    "temporada" "Temporada" NOT NULL,

    CONSTRAINT "Estadistica_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Equipo_nombre_key" ON "Equipo"("nombre");

-- AddForeignKey
ALTER TABLE "JugadorEquipo" ADD CONSTRAINT "JugadorEquipo_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JugadorEquipo" ADD CONSTRAINT "JugadorEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estadistica" ADD CONSTRAINT "Estadistica_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


