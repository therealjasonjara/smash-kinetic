"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useAppStore } from "@/lib/db/store";
import { LEVEL_LABELS } from "@/lib/utils";
import type { Player } from "@/lib/types";

// No-Line Rule: no border on header or cards
// Editorial spacing: py-12 main, space-y-16 between sections
// Typography: headline-sm for page title, display-sm for rank numbers

const LEVEL_OPTIONS = [1, 2, 3, 4, 5].map((n) => ({
  value: n,
  label: `${n} — ${LEVEL_LABELS[n]}`,
}));

type DeleteWarning = "in-match" | "in-queue" | "session-active";

export default function PlayersPage() {
  const { players, addPlayer, removePlayer, updatePlayer, queue, matches, activeSessionId } = useAppStore();
  const [name, setName] = useState("");
  const [level, setLevel] = useState<Player["level"]>(3);
  const [nameError, setNameError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string; warning: DeleteWarning } | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) { setNameError("Name is required."); return; }
    if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setNameError("A player with this name already exists.");
      return;
    }
    addPlayer(trimmed, level);
    setName("");
    setLevel(3);
    setNameError("");
  }

  function requestDelete(player: Player) {
    if (!activeSessionId) {
      // No active session — delete immediately, no warning needed
      removePlayer(player.id);
      return;
    }

    // Check most severe condition first: actively in a match
    const inMatch = matches.some(
      (m) => !m.endedAt && (m.teams[0].includes(player.id) || m.teams[1].includes(player.id))
    );
    if (inMatch) {
      setConfirmDelete({ id: player.id, name: player.name, warning: "in-match" });
      return;
    }

    // Check if waiting or assigned in queue
    const inQueue = queue.some(
      (e) => (e.status === "waiting" || e.status === "assigned") && e.playerIds.includes(player.id)
    );
    if (inQueue) {
      setConfirmDelete({ id: player.id, name: player.name, warning: "in-queue" });
      return;
    }

    // Session is active but player isn't in queue or match
    setConfirmDelete({ id: player.id, name: player.name, warning: "session-active" });
  }

  function confirmAndDelete() {
    if (!confirmDelete) return;
    removePlayer(confirmDelete.id);
    setConfirmDelete(null);
  }

  const sorted = [...players].sort((a, b) => b.rating - a.rating);

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header — glass-panel, NO border (No-Line Rule) */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-5">
          <a href="/" className="flex items-center gap-1.5 text-on-surface-variant tap-target justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
            <span className="font-body text-body-md">Back</span>
          </a>
          <h1 className="font-headline text-headline-sm text-on-surface tracking-tight">Players</h1>
          <span className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
            {players.length} total
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12 space-y-16">
        {/* ── Add player form ── */}
        <section>
          <h2 className="font-headline text-headline-sm text-on-surface tracking-tight mb-6">
            Add Player
          </h2>
          {/* surface-container-lowest on surface = tonal lift, no shadow needed */}
          <div className="bg-surface-container-lowest rounded-xl shadow-kinetic p-6 space-y-5">
            <Input
              label="Name"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Player name"
              error={nameError}
            />
            <Select
              label="Skill level"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value) as Player["level"])}
              options={LEVEL_OPTIONS}
            />
            <Button onClick={submit} className="w-full" disabled={!name.trim()}>
              Add Player
            </Button>
          </div>
        </section>

        {/* ── Rankings ── */}
        <section>
          <h2 className="font-headline text-headline-sm text-on-surface tracking-tight mb-6">
            Rankings
          </h2>

          {sorted.length === 0 ? (
            <div className="bg-surface-container-low rounded-xl p-10 text-center">
              <p className="font-body text-body-md text-on-surface-variant">
                No players yet — add some above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sorted.map((player, rank) => (
                <PlayerRow
                  key={player.id}
                  player={player}
                  rank={rank + 1}
                  isEditing={editingId === player.id}
                  onEdit={() => setEditingId(player.id)}
                  onSave={(patch) => { updatePlayer(player.id, patch); setEditingId(null); }}
                  onCancel={() => setEditingId(null)}
                  onRemove={() => requestDelete(player)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <DeleteWarningModal
          playerName={confirmDelete.name}
          warning={confirmDelete.warning}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={confirmAndDelete}
        />
      )}
    </div>
  );
}

const WARNING_COPY: Record<DeleteWarning, { headline: string; body: string }> = {
  "in-match": {
    headline: "Player is in an active match",
    body: "This player is currently on court. Deleting them now will remove them from the match record and rankings.",
  },
  "in-queue": {
    headline: "Player is in the queue",
    body: "This player is waiting for a court. Deleting them will remove their queue spot immediately.",
  },
  "session-active": {
    headline: "Session in progress",
    body: "A session is currently active. Deleting this player will remove all their history for this session.",
  },
};

function DeleteWarningModal({
  playerName,
  warning,
  onCancel,
  onConfirm,
}: {
  playerName: string;
  warning: DeleteWarning;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const { headline, body } = WARNING_COPY[warning];
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(44, 47, 49, 0.45)", backdropFilter: "blur(4px)" }}
    >
      <div className="glass-modal w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-float space-y-5">
        {/* Warning icon + headline */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-error-container/20 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-error-container" style={{ fontSize: "22px" }}>
              warning
            </span>
          </div>
          <div>
            <p className="font-headline text-headline-sm text-on-surface tracking-tight">
              {headline}
            </p>
            <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant mt-1">
              {playerName}
            </p>
          </div>
        </div>

        {/* Body */}
        <p className="font-body text-body-md text-on-surface-variant">{body}</p>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1">
            Delete Anyway
          </Button>
        </div>
      </div>
    </div>
  );
}

type PlayerRowProps = {
  player: Player;
  rank: number;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (patch: Partial<Pick<Player, "name" | "level">>) => void;
  onCancel: () => void;
  onRemove: () => void;
};

function PlayerRow({ player, rank, isEditing, onEdit, onSave, onCancel, onRemove }: PlayerRowProps) {
  const [editName, setEditName] = useState(player.name);
  const [editLevel, setEditLevel] = useState<Player["level"]>(player.level);

  const winRate =
    player.wins + player.losses > 0
      ? Math.round((player.wins / (player.wins + player.losses)) * 100)
      : 0;

  if (isEditing) {
    return (
      <div className="bg-surface-container-lowest rounded-xl shadow-kinetic p-5 space-y-4">
        <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Name" />
        <Select
          value={editLevel}
          onChange={(e) => setEditLevel(Number(e.target.value) as Player["level"])}
          options={LEVEL_OPTIONS}
        />
        <div className="flex gap-3">
          <Button size="sm" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
          <Button size="sm" onClick={() => onSave({ name: editName.trim(), level: editLevel })} className="flex-1" disabled={!editName.trim()}>
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    // Spec: rank number uses display-sm, lots of negative space, scale up for courtside legibility
    <div className="bg-surface-container-lowest rounded-xl shadow-kinetic relative overflow-hidden">
      {/* Ghost rank number — asymmetric top-left, display-scale */}
      <span className="absolute -top-2 -left-1 font-headline text-display-md text-surface-container leading-none select-none pointer-events-none">
        {rank}
      </span>

      <div className="relative z-10 pl-14 pr-4 py-5 flex items-center gap-3">
        <div className="flex-1 min-w-0 space-y-1">
          <p className="font-headline text-headline-sm text-on-surface tracking-tight truncate">
            {player.name}
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
              Lvl {player.level} · {LEVEL_LABELS[player.level]}
            </span>
            <span className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
              {player.wins}W {player.losses}L
            </span>
            {player.wins + player.losses > 0 && (
              <span className="font-body text-label-md uppercase tracking-editorial text-primary">
                {winRate}%
              </span>
            )}
          </div>
        </div>

        {/* ELO — prominent, right-aligned */}
        <div className="text-right shrink-0">
          <p className="font-headline text-display-sm text-primary leading-none">{player.rating}</p>
          <p className="font-body text-label-sm uppercase tracking-editorial text-on-surface-variant mt-1">
            ELO
          </p>
        </div>

        <div className="flex gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="tap-target w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
            aria-label="Edit player"
          >
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "18px" }}>edit</span>
          </button>
          <button
            onClick={onRemove}
            className="tap-target w-10 h-10 flex items-center justify-center rounded-full hover:bg-error-container/20 transition-colors"
            aria-label="Remove player"
          >
            <span className="material-symbols-outlined text-error-container" style={{ fontSize: "18px" }}>delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}
