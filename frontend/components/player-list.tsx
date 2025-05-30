"use client"

import { PlayerCard } from "./player-card"
import type { PlayerForList } from "@/types/player"

interface PlayerListProps {
  players: PlayerForList[]
  onPlayerDeleted: () => void
  onPlayerUpdated: () => void
}

export function PlayerList({ players, onPlayerDeleted, onPlayerUpdated }: PlayerListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg mb-2">No players found</p>
          <p className="text-sm">Add your first player to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <PlayerCard
          key={player.jugadorId}
          player={player}
          onPlayerDeleted={onPlayerDeleted}
          onPlayerUpdated={onPlayerUpdated}
        />
      ))}
    </div>
  )
}
