"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { type PlayerForList, Posicion } from "@/types/player"

interface UpdatePlayerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  player: PlayerForList | null
  onPlayerUpdated: () => void
}

interface UpdatePlayerData {
  nombre?: string
  posicion?: Posicion
  edad?: number
  nacionalidad?: string
}

const positionOptions = [
  { value: Posicion.PORTERO, label: "Goalkeeper" },
  { value: Posicion.DEFENSA, label: "Defender" },
  { value: Posicion.MEDIOCAMPISTA, label: "Midfielder" }, // Updated to use correct spelling
  { value: Posicion.DELANTERO, label: "Forward" },
]

export function UpdatePlayerDialog({ open, onOpenChange, player, onPlayerUpdated }: UpdatePlayerDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<UpdatePlayerData>({})
  const [originalData, setOriginalData] = useState<UpdatePlayerData>({})
  const [changedFields, setChangedFields] = useState<Set<keyof UpdatePlayerData>>(new Set())

  // Reset and initialize form when player changes
  useEffect(() => {
    if (player) {
      const initialData = {
        nombre: player.jugadorNombre,
        posicion: player.jugadorPosicion,
        edad: player.jugadorEdad,
        nacionalidad: player.jugadorNacionalidad,
      }
      setFormData(initialData)
      setOriginalData(initialData)
      setChangedFields(new Set())
    }
  }, [player])

  const handleFieldChange = (field: keyof UpdatePlayerData, value: string | number | Posicion) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Track changed fields by comparing with original values
    if (value !== originalData[field]) {
      setChangedFields((prev) => {
        const updated = new Set(prev)
        updated.add(field)
        return updated
      })
    } else {
      setChangedFields((prev) => {
        const updated = new Set(prev)
        updated.delete(field)
        return updated
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!player) return

    try {
      setIsSubmitting(true)

      // Only include fields that have changed
      const updateData: UpdatePlayerData = {}
      changedFields.forEach((field) => {
        updateData[field] = formData[field]
      })

      // Don't send request if nothing changed
      if (Object.keys(updateData).length === 0) {
        onOpenChange(false)
        return
      }

      console.log("Sending update data:", JSON.stringify(updateData, null, 2))

      const response = await fetch(`http://localhost:3001/players/${player.jugadorId}`, {
        method: "PATCH", // Assuming your API uses PATCH for partial updates
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to update player: ${response.status} ${response.statusText}`)
      }

      onPlayerUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error("Error updating player:", error)
      alert(error instanceof Error ? error.message : "Failed to update player")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!player) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Player</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Player Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Name</Label>
                <Input
                  id="nombre"
                  value={formData.nombre || ""}
                  onChange={(e) => handleFieldChange("nombre", e.target.value)}
                  placeholder="Player name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nacionalidad">Nationality</Label>
                <Input
                  id="nacionalidad"
                  value={formData.nacionalidad || ""}
                  onChange={(e) => handleFieldChange("nacionalidad", e.target.value)}
                  placeholder="e.g., Spain, Brazil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posicion">Position</Label>
                <Select
                  value={formData.posicion}
                  onValueChange={(value) => handleFieldChange("posicion", value as Posicion)}
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
                <Label htmlFor="edad">Age</Label>
                <Input
                  id="edad"
                  type="number"
                  min="16"
                  max="50"
                  value={formData.edad || ""}
                  onChange={(e) => handleFieldChange("edad", Number.parseInt(e.target.value) || 0)}
                  placeholder="Age"
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || changedFields.size === 0}>
              {isSubmitting ? "Updating..." : "Update Player"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
