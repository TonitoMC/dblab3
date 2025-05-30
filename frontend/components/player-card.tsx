"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ChevronDown, ChevronUp, Trash2, Users, Trophy, Calendar, MapPin, Flag, Edit } from "lucide-react"
import { type PlayerForList, Posicion } from "@/types/player"
import { UpdatePlayerDialog } from "./update-player-dialog"

interface PlayerCardProps {
  player: PlayerForList
  onPlayerDeleted: () => void
  onPlayerUpdated: () => void
}

const positionColors = {
  [Posicion.PORTERO]: "bg-yellow-100 text-yellow-800 border-yellow-200",
  [Posicion.DEFENSA]: "bg-blue-100 text-blue-800 border-blue-200",
  [Posicion.MEDIOCAMPISTA]: "bg-green-100 text-green-800 border-green-200", // Updated to use correct spelling
  [Posicion.DELANTERO]: "bg-red-100 text-red-800 border-red-200",
}

const positionLabels = {
  [Posicion.PORTERO]: "Goalkeeper",
  [Posicion.DEFENSA]: "Defender",
  [Posicion.MEDIOCAMPISTA]: "Midfielder", // Updated to use correct spelling
  [Posicion.DELANTERO]: "Forward",
}

const seasonLabels = {
  T2021_2022: "2021/22",
  T2022_2023: "2022/23",
  T2023_2024: "2023/24",
}

export function PlayerCard({ player, onPlayerDeleted, onPlayerUpdated }: PlayerCardProps) {
  const [isTeamsOpen, setIsTeamsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`http://localhost:3001/players/${player.jugadorId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete player")
      }

      onPlayerDeleted()
    } catch (error) {
      console.error("Error deleting player:", error)
      alert("Failed to delete player. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const totalGoals = player.estadisticas.reduce((sum, stat) => sum + stat.goles, 0)
  const totalAssists = player.estadisticas.reduce((sum, stat) => sum + stat.asistencias, 0)
  const totalGames = player.estadisticas.reduce((sum, stat) => sum + stat.partidosJugados, 0)

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{player.jugadorNombre}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Flag className="h-3 w-3" />
                {player.jugadorNacionalidad}
                <span>•</span>
                <span>{player.jugadorEdad} years old</span>
              </div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary-600 hover:bg-primary-50"
                onClick={() => setIsUpdateDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Player</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete {player.jugadorNombre}? This action cannot be undone and will
                      remove all associated team history and statistics.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <Badge variant="outline" className={`w-fit ${positionColors[player.jugadorPosicion]}`}>
            {positionLabels[player.jugadorPosicion]}
          </Badge>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-lg font-semibold">{totalGames}</div>
              <div className="text-xs text-muted-foreground">Games</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-lg font-semibold">{totalGoals}</div>
              <div className="text-xs text-muted-foreground">Goals</div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2">
              <div className="text-lg font-semibold">{totalAssists}</div>
              <div className="text-xs text-muted-foreground">Assists</div>
            </div>
          </div>

          {/* Teams Section */}
          {player.equipos.length > 0 && (
            <Collapsible open={isTeamsOpen} onOpenChange={setIsTeamsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">Teams ({player.equipos.length})</span>
                  </div>
                  {isTeamsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {player.equipos.map((equipo, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-1">
                    <div className="font-medium">{equipo.equipoNombre}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {equipo.equipoLiga}, {equipo.equipoPais}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(equipo.fechaIngreso)} -{" "}
                      {equipo.fechaSalida ? formatDate(equipo.fechaSalida) : "Present"}
                    </div>
                    <div className="text-xs text-muted-foreground">Founded: {equipo.equipoFundado}</div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Statistics Section */}
          {player.estadisticas.length > 0 && (
            <Collapsible open={isStatsOpen} onOpenChange={setIsStatsOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="font-medium">Statistics ({player.estadisticas.length})</span>
                  </div>
                  {isStatsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                {player.estadisticas.map((stat) => (
                  <div key={stat.id} className="border rounded-lg p-3">
                    <div className="font-medium mb-2">
                      {seasonLabels[stat.temporada as keyof typeof seasonLabels] || stat.temporada}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{stat.partidosJugados}</div>
                        <div className="text-muted-foreground">Games</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{stat.goles}</div>
                        <div className="text-muted-foreground">Goals</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{stat.asistencias}</div>
                        <div className="text-muted-foreground">Assists</div>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      <UpdatePlayerDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        player={player}
        onPlayerUpdated={onPlayerUpdated}
      />
    </>
  )
}
