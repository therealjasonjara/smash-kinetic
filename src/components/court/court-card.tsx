"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/db/store";
import type { Court, Match, Player } from "@/lib/types";
import { minutesSince } from "@/lib/utils";

type CourtCardProps = {
  court: Court;
  onEndMatch?: (matchId: string) => void;
  onAssign?: (courtId: string) => void;
};

export function CourtCard({ court, onEndMatch, onAssign }: CourtCardProps) {
  const { matches, players } = useAppStore();

  const activeMatch = court.currentMatchId
    ? (matches.find((m) => m.id === court.currentMatchId) ?? null)
    : null;

  const teamNames = (ids: string[]) =>
    ids.map((id) => players.find((p: Player) => p.id === id)?.name ?? "—").join(" & ");

  const badgeVariant =
    court.status === "in-progress"
      ? "live"
      : court.status === "cleaning"
      ? "cleaning"
      : "free";

  const courtNumber = court.name.replace("Court ", "");

  return (
    // Spec: surface-container-lowest card on surface background = paper-on-concrete lift
    // Spec: xl (1.5rem) radius for primary containers
    // No border — tonal depth only
    <div className="bg-surface-container-lowest rounded-xl shadow-kinetic overflow-hidden relative">

      {/* Ghost court number — Spec: display-sm, top-LEFT, slightly overlapping card edge (Intentional Asymmetry) */}
      <span className="absolute -top-3 -left-2 font-headline text-display-lg text-surface-container leading-none select-none pointer-events-none z-0">
        {courtNumber}
      </span>

      <div className="relative z-10 p-5 pl-16">
        <div className="flex items-start justify-between mb-3">
          <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
            {court.name}
          </p>
          <Badge variant={badgeVariant} />
        </div>

        {activeMatch ? (
          <MatchDetails match={activeMatch} teamNames={teamNames} />
        ) : (
          <p className="font-body text-body-md text-on-surface-variant mt-1">
            {court.status === "cleaning" ? "Being cleaned — ready soon" : "Available now"}
          </p>
        )}

        <div className="flex gap-2 mt-5">
          {court.status === "available" && onAssign && (
            <Button size="sm" variant="secondary" onClick={() => onAssign(court.id)}>
              Assign Next Group
            </Button>
          )}
          {activeMatch && onEndMatch && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEndMatch(activeMatch.id)}
            >
              End Match
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function MatchDetails({
  match,
  teamNames,
}: {
  match: Match;
  teamNames: (ids: string[]) => string;
}) {
  return (
    // Spec: spacing-4 (1rem) between player names, no dividers
    <div className="space-y-4 mt-2">
      <div>
        <p className="font-headline text-body-lg font-semibold text-on-surface">
          {teamNames(match.teams[0])}
        </p>
        <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant mt-0.5">
          Team A
        </p>
      </div>

      {/* Spec: no 1px dividers — use background shift */}
      <div className="section-divider" />

      <div>
        <p className="font-headline text-body-lg font-semibold text-on-surface-variant">
          {teamNames(match.teams[1])}
        </p>
        <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant mt-0.5">
          Team B
        </p>
      </div>

      {match.score && (
        <p className="font-headline text-display-sm text-primary">
          {match.score[0]} — {match.score[1]}
        </p>
      )}

      <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
        <span className="material-symbols-outlined text-xs align-middle mr-1">timer</span>
        {minutesSince(match.startedAt)} min elapsed
      </p>
    </div>
  );
}
