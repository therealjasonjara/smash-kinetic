export type Player = {
  id: string;
  name: string;
  level: 1 | 2 | 3 | 4 | 5; // 1 = beginner, 5 = strongest
  rating: number; // ELO-style numeric
  wins: number;
  losses: number;
  createdAt: Date;
};

export type QueueEntry = {
  id: string;
  playerIds: string[]; // 1 for singles pre-register, or used for paired entry
  joinedAt: Date;
  status: "waiting" | "assigned" | "playing" | "done";
  courtPreference?: string;
  matchType: "singles" | "doubles";
};

export type CourtStatus = "available" | "in-progress" | "cleaning";

export type Court = {
  id: string;
  name: string; // e.g. "Court 1"
  status: CourtStatus;
  currentMatchId?: string;
};

export type Match = {
  id: string;
  courtId: string;
  sessionId: string;
  teams: [string[], string[]]; // [teamA playerIds, teamB playerIds]
  score?: [number, number];
  winningSide?: 0 | 1;
  startedAt: Date;
  endedAt?: Date;
};

export type Session = {
  id: string;
  name?: string;
  date: Date;
  courtCount: number;
  isActive: boolean;
  stayOnWinner: boolean; // king-of-the-court mode
};

// ELO helper types
export type EloResult = {
  newRatingA: number;
  newRatingB: number;
};
