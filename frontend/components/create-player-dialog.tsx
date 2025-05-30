"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, Users, Trophy } from "lucide-react"
import { type CreatePlayerData, Posicion, Temporada } from "@/types/player"

interface CreatePlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPlayerCreated: () => void
}

interface TeamStint {
  equipoId: number
  fechaIngreso: string
  fechaSalida?: string
}

interface Statistic {
  partidosJugados: number
  goles: number
  asistencias: number
  temporada: Temporada
}

const positionOptions = [
  { value: Posicion.PORTERO, label: "Goalkeeper" },
  { value: Posicion.DEFENSA, label: "Defender" },
  { value: Posicion.MEDIOCAMPISTA, label: "Midfielder" }, // Updated to use correct spelling
  { value: Posicion.DELANTERO, label: "Forward" },
]

const seasonOptions = [
  { value: Temporada.TEMPORADA_2021_22, label: "2021/22" },
  { value: Temporada.TEMPORADA_2022_23, label: "2022/23" },
  { value: Temporada.TEMPORADA_2023_24, label: "2023/24" },
]

export function CreatePlayerDialog({ open, onOpenChange, onPlayerCreated }: CreatePlayerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    posicion: Posicion.PORTERO,
    edad: "",
    nacionalidad: "",
  })
  const [teams, setTeams] = useState<TeamStint[]>([])
  const [statistics, setStatistics] = useState<Statistic[]>([])

  const resetForm = () => {
    setFormData({
      nombre: "",
      posicion: Posicion.PORTERO,
      edad: "",
      nacionalidad: "",
    })
    setTeams([])
    setStatistics([])
  }

  // Helper function to convert date to ISO string format
  const formatDateForBackend = (dateString: string): string => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toISOString()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.nombre || !formData.posicion || !formData.edad || !formData.nacionalidad) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsSubmitting(true)

      // Format teams data with proper date formatting
      const formattedTeams =
        teams.length > 0
          ? teams.map((team) => ({
              equipoId: team.equipoId,
              fechaIngreso: formatDateForBackend(team.fechaIngreso),
              fechaSalida: team.fechaSalida ? formatDateForBackend(team.fechaSalida) : null,
            }))
          : undefined

      const playerData: CreatePlayerData = {
        nombre: formData.nombre,
        posicion: formData.posicion,
        edad: Number.parseInt(formData.edad),
        nacionalidad: formData.nacionalidad,
        equipos: formattedTeams,
        estadisticas: statistics.length > 0 ? statistics : undefined,
      }

      console.log("Sending player data:", JSON.stringify(playerData, null, 2))

      const response = await fetch("http://localhost:3001/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(playerData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Server error response:", errorData)
        throw new Error(errorData.message || `Failed to create player: ${response.status} ${response.statusText}`)
      }

      resetForm()
      onPlayerCreated()
    } catch (error) {
      console.error("Error creating player:", error)
      alert(error instanceof Error ? error.message : "Failed to create player")
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTeam = () => {
    setTeams([
      ...teams,
      {
        equipoId: 0,
        fechaIngreso: "",
        fechaSalida: "",
      },
    ])
  }

  const removeTeam = (index: number) => {
    setTeams(teams.filter((_, i) => i !== index))
  }

  const updateTeam = (index: number, field: keyof TeamStint, value: string | number) => {
    const updatedTeams = [...teams]
    updatedTeams[index] = { ...updatedTeams[index], [field]: value }
    setTeams(updatedTeams)
  }

  const addStatistic = () => {
    setStatistics([
      ...statistics,
      {
        partidosJugados: 0,
        goles: 0,
        asistencias: 0,
        temporada: Temporada.TEMPORADA_2023_24,
      },
    ])
  }

  const removeStatistic = (index: number) => {
    setStatistics(statistics.filter((_, i) => i !== index))
  }

  const updateStatistic = (index: number, field: keyof Statistic, value: string | number | Temporada) => {
    const updatedStats = [...statistics]
    updatedStats[index] = { ...updatedStats[index], [field]: value }
    setStatistics(updatedStats)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Name *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Player name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nacionalidad">Nationality *</Label>
                  <Input
                    id="nacionalidad"
                    value={formData.nacionalidad}
                    onChange={(e) => setFormData({ ...formData, nacionalidad: e.target.value })}
                    placeholder="e.g., Spain, Brazil"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posicion">Position *</Label>
                  <Select
                    value={formData.posicion}
                    onValueChange={(value) => setFormData({ ...formData, posicion: value as Posicion })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select position" />
                    </SelectTrigger>
                    <SelectContent>
                      {positionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Age *</Label>
                  <Input
                    id="edad"
                    type="number"
                    min="16"
                    max="50"
                    value={formData.edad}
                    onChange={(e) => setFormData({ ...formData, edad: e.target.value })}
                    placeholder="Age"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Teams Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team History
                </CardTitle>
                <Button type="button" onClick={addTeam} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Team
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {teams.length === 0 ? (
                <p className="text-muted-foreground text-sm">No teams added yet. Click "Add Team" to get started.</p>
              ) : (
                teams.map((team, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Team {index + 1}</Badge>
                      <Button
                        type="button"
                        onClick={() => removeTeam(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label>Team ID</Label>
                        <Input
                          type="number"
                          value={team.equipoId || ""}
                          onChange={(e) => updateTeam(index, "equipoId", Number.parseInt(e.target.value) || 0)}
                          placeholder="Team ID"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Join Date</Label>
                        <Input
                          type="date"
                          value={team.fechaIngreso}
                          onChange={(e) => updateTeam(index, "fechaIngreso", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Leave Date (Optional)</Label>
                        <Input
                          type="date"
                          value={team.fechaSalida || ""}
                          onChange={(e) => updateTeam(index, "fechaSalida", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Statistics Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Statistics
                </CardTitle>
                <Button type="button" onClick={addStatistic} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Season
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {statistics.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                  No statistics added yet. Click "Add Season" to get started.
                </p>
              ) : (
                statistics.map((stat, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Season {index + 1}</Badge>
                      <Button
                        type="button"
                        onClick={() => removeStatistic(index)}
                        size="sm"
                        variant="ghost"
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="space-y-2">
                        <Label>Season</Label>
                        <Select
                          value={stat.temporada}
                          onValueChange={(value: Temporada) => updateStatistic(index, "temporada", value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {seasonOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Games</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stat.partidosJugados}
                          onChange={(e) =>
                            updateStatistic(index, "partidosJugados", Number.parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Goals</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stat.goles}
                          onChange={(e) => updateStatistic(index, "goles", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Assists</Label>
                        <Input
                          type="number"
                          min="0"
                          value={stat.asistencias}
                          onChange={(e) => updateStatistic(index, "asistencias", Number.parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Player"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
