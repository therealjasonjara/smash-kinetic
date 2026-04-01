import type { Player, QueueEntry, Match, EloResult } from "@/lib/types";

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

/**
 * Find the best doubles pairing from available players for the current session.
 *
 * Scoring per candidate pair (lower = better):
 *   - |levelA - levelB|          → skill balance (0–4)
 *   - +5 if played together this session → outweighs any level diff, so fresh pairings
 *     are always preferred; falls back to skill balance when all pairs are repeats
 *   - +random(0, 0.9)            → jitter so re-rolling produces variety
 *
 * Returns the winning [idA, idB] and whether it was a repeated pairing (fallback).
 * Returns null if fewer than 2 players are available.
 */
export function findBalancedPair(
  available: Player[],
  sessionMatches: Match[],
  sessionId: string
): { ids: [string, string]; wasRepeated: boolean } | null {
  if (available.length < 2) return null;

  // Build the set of same-team pairs from this session's match history
  const playedTogether = new Set<string>();
  for (const match of sessionMatches) {
    if (match.sessionId !== sessionId) continue;
    for (const team of match.teams) {
      for (let i = 0; i < team.length; i++) {
        for (let j = i + 1; j < team.length; j++) {
          playedTogether.add([team[i], team[j]].sort().join("|"));
        }
      }
    }
  }

  type Candidate = { ids: [string, string]; score: number; wasRepeated: boolean };
  const candidates: Candidate[] = [];

  for (let i = 0; i < available.length; i++) {
    for (let j = i + 1; j < available.length; j++) {
      const a = available[i];
      const b = available[j];
      const pairKey = [a.id, b.id].sort().join("|");
      const repeated = playedTogether.has(pairKey);
      candidates.push({
        ids: [a.id, b.id],
        score: Math.abs(a.level - b.level) + (repeated ? 5 : 0) + Math.random() * 0.9,
        wasRepeated: repeated,
      });
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  const best = candidates[0];
  return { ids: best.ids, wasRepeated: best.wasRepeated };
}

/** Level label for display */
export const LEVEL_LABELS: Record<number, string> = {
  1: "Beginner",
  2: "Novice",
  3: "Intermediate",
  4: "Advanced",
  5: "Pro",
};
