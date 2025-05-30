-- DropForeignKey
ALTER TABLE "Estadistica" DROP CONSTRAINT "Estadistica_jugadorId_fkey";

-- DropForeignKey
ALTER TABLE "JugadorEquipo" DROP CONSTRAINT "JugadorEquipo_equipoId_fkey";

-- DropForeignKey
ALTER TABLE "JugadorEquipo" DROP CONSTRAINT "JugadorEquipo_jugadorId_fkey";

-- AlterTable
ALTER TABLE "JugadorEquipo" DROP CONSTRAINT "JugadorEquipo_pkey",
ADD CONSTRAINT "JugadorEquipo_pkey" PRIMARY KEY ("jugadorId", "equipoId", "fechaIngreso");

-- AddForeignKey
ALTER TABLE "JugadorEquipo" ADD CONSTRAINT "JugadorEquipo_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JugadorEquipo" ADD CONSTRAINT "JugadorEquipo_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "Equipo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estadistica" ADD CONSTRAINT "Estadistica_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "Jugador"("id") ON DELETE CASCADE ON UPDATE CASCADE;
