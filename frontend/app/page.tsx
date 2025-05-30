"use client"

import { useState, useEffect } from "react"
import { PlayerList } from "@/components/player-list"
import { CreatePlayerDialog } from "@/components/create-player-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import type { PlayerForList } from "@/types/player"

export default function PlayersPage() {
  const [players, setPlayers] = useState<PlayerForList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("http://localhost:3001/players")

      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`)
      }

      const data = await response.json()
      setPlayers(data)
    } catch (err) {
      console.error("Error fetching players:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch players")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlayers()
  }, [])

  const handlePlayerCreated = () => {
    setIsCreateDialogOpen(false)
    fetchPlayers() // Refresh the list
  }

  const handlePlayerDeleted = () => {
    fetchPlayers() // Refresh the list
  }

  const handlePlayerUpdated = () => {
    fetchPlayers() // Refresh the list
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading players...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-semibold">Error loading players</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
            <Button onClick={fetchPlayers} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Player Management</h1>
          <p className="text-muted-foreground">Manage your football players, teams, and statistics</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Player
        </Button>
      </div>

      <PlayerList players={players} onPlayerDeleted={handlePlayerDeleted} onPlayerUpdated={handlePlayerUpdated} />

      <CreatePlayerDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onPlayerCreated={handlePlayerCreated}
      />
    </div>
  )
}
