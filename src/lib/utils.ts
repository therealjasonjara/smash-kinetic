import type { Player, QueueEntry, EloResult } from "@/lib/types";

/** Generate a short random ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Format a Date to a short time string, e.g. "14:32" */
export function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Minutes elapsed since a Date */
export function minutesSince(date: Date): number {
  return Math.floor((Date.now() - new Date(date).getTime()) / 60_000);
}

/**
 * ELO rating update for a 1v1 or team match.
 * Uses average team rating for team games.
 */
export function updateElo(
  ratingA: number,
  ratingB: number,
  winningSide: 0 | 1,
  kFactor = 32
): EloResult {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  const expectedB = 1 - expectedA;
  const scoreA = winningSide === 0 ? 1 : 0;
  const scoreB = 1 - scoreA;
  return {
    newRatingA: Math.round(ratingA + kFactor * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + kFactor * (scoreB - expectedB)),
  };
}

/** Average ELO across a list of players */
export function avgRating(players: Player[]): number {
  if (players.length === 0) return 1000;
  return players.reduce((s, p) => s + p.rating, 0) / players.length;
}

/**
 * Balance two teams from a pool of N players (N must be even).
 * Sorts by level then alternates — closest possible skill spread.
 * Returns [teamA ids, teamB ids].
 */
export function balanceTeams(players: Player[]): [string[], string[]] {
  const sorted = [...players].sort((a, b) => b.level - a.level);
  const teamA: string[] = [];
  const teamB: string[] = [];
  sorted.forEach((p, i) => {
    if (i % 2 === 0) teamA.push(p.id);
    else teamB.push(p.id);
  });
  return [teamA, teamB];
}

/**
 * Pick the next group of entries from the waiting queue using FIFO,
 * accumulating until their combined playerIds reach playersNeeded.
 * Counts players across entries (not entry count) so a doubles pair
 * (2 players in one entry) correctly contributes 2 toward the total.
 * Returns null if not enough players are waiting.
 */
export function pickNextGroup(
  queue: QueueEntry[],
  playersNeeded: number
): QueueEntry[] | null {
  const waiting = queue.filter((e) => e.status === "waiting");
  const group: QueueEntry[] = [];
  let playerCount = 0;
  for (const entry of waiting) {
    if (playerCount >= playersNeeded) break;
    group.push(entry);
    playerCount += entry.playerIds.length;
  }
  return playerCount >= playersNeeded ? group : null;
}

/** Compute a human-readable wait estimate given queue position and avg match duration */
export function estimateWait(position: number, avgMatchMinutes = 22): string {
  const mins = position * avgMatchMinutes;
  if (mins < 1) return "< 1 min";
  if (mins < 60) return `~${mins} min`;
  return `~${Math.round(mins / 6) / 10} hr`;
}

/** Level label for display */
export const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Novice",
  3: "Intermediate",
  4: "Advanced",
  5: "Pro",
};
