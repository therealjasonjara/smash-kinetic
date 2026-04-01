"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Player, QueueEntry, Court, Match, Session } from "@/lib/types";
import {
  generateId,
  balanceTeams,
  pickNextGroup,
  updateElo,
  avgRating,
} from "@/lib/utils";

type AppState = {
  players: Player[];
  queue: QueueEntry[];
  courts: Court[];
  matches: Match[];
  sessions: Session[];
  activeSessionId: string | null;
};

type AppActions = {
  // Session
  startSession: (name: string, courtCount: number, stayOnWinner?: boolean) => Session;
  endSession: (id: string) => void;

  // Players
  addPlayer: (name: string, level: Player["level"]) => Player;
  removePlayer: (id: string) => void;
  updatePlayer: (id: string, patch: Partial<Pick<Player, "name" | "level">>) => void;

  // Queue
  joinQueue: (playerIds: string[], matchType: QueueEntry["matchType"]) => QueueEntry;
  leaveQueue: (entryId: string) => void;
  assignNextGroup: (courtId: string) => void;

  // Courts
  initCourts: (count: number) => void;
  markCourtAvailable: (courtId: string) => void;
  markCourtCleaning: (courtId: string) => void;

  // Matches
  startMatch: (courtId: string, playerIds: string[]) => Match;
  endMatch: (matchId: string, score: [number, number], winningSide: 0 | 1) => void;
};

const DEFAULT_PLAYER_RATING = 1000;

export const useAppStore = create<AppState & AppActions>()(
  persist(
    (set, get) => ({
      players: [],
      queue: [],
      courts: [],
      matches: [],
      sessions: [],
      activeSessionId: null,

      // ── Session ────────────────────────────────────────────────────────────
      startSession(name, courtCount, stayOnWinner = false) {
        const session: Session = {
          id: generateId(),
          name,
          date: new Date(),
          courtCount,
          isActive: true,
          stayOnWinner,
        };
        set((s) => ({
          sessions: [...s.sessions, session],
          activeSessionId: session.id,
        }));
        get().initCourts(courtCount);
        return session;
      },

      endSession(id) {
        set((s) => ({
          sessions: s.sessions.map((sess) =>
            sess.id === id ? { ...sess, isActive: false } : sess
          ),
          activeSessionId: s.activeSessionId === id ? null : s.activeSessionId,
        }));
      },

      // ── Players ────────────────────────────────────────────────────────────
      addPlayer(name, level) {
        const player: Player = {
          id: generateId(),
          name,
          level,
          rating: DEFAULT_PLAYER_RATING,
          wins: 0,
          losses: 0,
          createdAt: new Date(),
        };
        set((s) => ({ players: [...s.players, player] }));
        return player;
      },

      removePlayer(id) {
        set((s) => ({ players: s.players.filter((p) => p.id !== id) }));
      },

      updatePlayer(id, patch) {
        set((s) => ({
          players: s.players.map((p) =>
            p.id === id ? { ...p, ...patch } : p
          ),
        }));
      },

      // ── Queue ──────────────────────────────────────────────────────────────
      joinQueue(playerIds, matchType) {
        const entry: QueueEntry = {
          id: generateId(),
          playerIds,
          joinedAt: new Date(),
          status: "waiting",
          matchType,
        };
        set((s) => ({ queue: [...s.queue, entry] }));
        return entry;
      },

      leaveQueue(entryId) {
        set((s) => ({
          queue: s.queue.filter((e) => e.id !== entryId),
        }));
      },

      assignNextGroup(courtId) {
        const { queue } = get();
        const PLAYERS_NEEDED = 4; // doubles court
        const group = pickNextGroup(queue, PLAYERS_NEEDED);
        if (!group) return;

        // Take exactly PLAYERS_NEEDED playerIds in FIFO order
        const groupPlayerIds = group
          .flatMap((e) => e.playerIds)
          .slice(0, PLAYERS_NEEDED);

        get().startMatch(courtId, groupPlayerIds);

        // Only mark entries whose players are all in this match as "assigned".
        // If an entry is partially consumed (edge case), leave it "waiting" so
        // the remaining players aren't stranded.
        const matchPlayerSet = new Set(groupPlayerIds);
        const groupEntryIds = new Set(group.map((e) => e.id));

        set((s) => ({
          queue: s.queue.map((e) => {
            if (!groupEntryIds.has(e.id)) return e;
            const allInMatch = e.playerIds.every((id) => matchPlayerSet.has(id));
            return allInMatch ? { ...e, status: "assigned" as const } : e;
          }),
        }));
      },

      // ── Courts ─────────────────────────────────────────────────────────────
      initCourts(count) {
        const courts: Court[] = Array.from({ length: count }, (_, i) => ({
          id: generateId(),
          name: `Court ${i + 1}`,
          status: "available" as const,
        }));
        set({ courts });
      },

      markCourtAvailable(courtId) {
        set((s) => ({
          courts: s.courts.map((c) =>
            c.id === courtId
              ? { ...c, status: "available" as const, currentMatchId: undefined }
              : c
          ),
        }));
      },

      markCourtCleaning(courtId) {
        set((s) => ({
          courts: s.courts.map((c) =>
            c.id === courtId ? { ...c, status: "cleaning" as const } : c
          ),
        }));
      },

      // ── Matches ────────────────────────────────────────────────────────────
      startMatch(courtId, playerIds) {
        const { players, activeSessionId } = get();
        const matchPlayers = playerIds
          .map((id) => players.find((p) => p.id === id))
          .filter(Boolean) as Player[];

        const [teamA, teamB] = balanceTeams(matchPlayers);

        const match: Match = {
          id: generateId(),
          courtId,
          sessionId: activeSessionId ?? "",
          teams: [teamA, teamB],
          startedAt: new Date(),
        };

        set((s) => ({
          matches: [...s.matches, match],
          courts: s.courts.map((c) =>
            c.id === courtId
              ? { ...c, status: "in-progress" as const, currentMatchId: match.id }
              : c
          ),
        }));

        return match;
      },

      endMatch(matchId, score, winningSide) {
        const { matches, players } = get();
        const match = matches.find((m) => m.id === matchId);
        if (!match) return;

        const [teamAIds, teamBIds] = match.teams;
        const teamA = teamAIds
          .map((id) => players.find((p) => p.id === id))
          .filter(Boolean) as Player[];
        const teamB = teamBIds
          .map((id) => players.find((p) => p.id === id))
          .filter(Boolean) as Player[];

        const avgA = avgRating(teamA);
        const avgB = avgRating(teamB);
        const { newRatingA, newRatingB } = updateElo(avgA, avgB, winningSide);
        const ratingDeltaA = newRatingA - avgA;
        const ratingDeltaB = newRatingB - avgB;

        set((s) => ({
          matches: s.matches.map((m) =>
            m.id === matchId
              ? { ...m, score, winningSide, endedAt: new Date() }
              : m
          ),
          players: s.players.map((p) => {
            if (teamAIds.includes(p.id)) {
              return {
                ...p,
                rating: Math.round(p.rating + ratingDeltaA),
                wins: p.wins + (winningSide === 0 ? 1 : 0),
                losses: p.losses + (winningSide === 1 ? 1 : 0),
              };
            }
            if (teamBIds.includes(p.id)) {
              return {
                ...p,
                rating: Math.round(p.rating + ratingDeltaB),
                wins: p.wins + (winningSide === 1 ? 1 : 0),
                losses: p.losses + (winningSide === 0 ? 1 : 0),
              };
            }
            return p;
          }),
          queue: s.queue.map((e) => {
            // Only resolve entries that were explicitly assigned to this match.
            // Never touch "waiting" entries — a player may have re-queued.
            if (e.status !== "assigned") return e;
            const wasPlaying = e.playerIds.some(
              (id) => [...teamAIds, ...teamBIds].includes(id)
            );
            return wasPlaying ? { ...e, status: "done" as const } : e;
          }),
        }));

        get().markCourtAvailable(match.courtId);
      },
    }),
    {
      name: "smash-kinetic-store",
      // Revive Date strings back to Date objects on rehydration
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const reviveDates = (
          obj: Record<string, unknown>,
          keys: string[]
        ): Record<string, unknown> => {
          const copy: Record<string, unknown> = { ...obj };
          for (const k of keys) {
            if (copy[k]) copy[k] = new Date(copy[k] as string);
          }
          return copy;
        };
        state.players = state.players.map((p) => reviveDates(p as Record<string, unknown>, ["createdAt"]) as unknown as Player);
        state.queue = state.queue.map((e) => reviveDates(e as Record<string, unknown>, ["joinedAt"]) as unknown as QueueEntry);
        state.matches = state.matches.map((m) =>
          reviveDates(m as Record<string, unknown>, ["startedAt", "endedAt"]) as unknown as Match
        );
        state.sessions = state.sessions.map((s) => reviveDates(s as Record<string, unknown>, ["date"]) as unknown as Session);
      },
    }
  )
);
