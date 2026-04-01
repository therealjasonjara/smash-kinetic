"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/db/store";

// Spec: "Floating action elements or modals should utilize Glassmorphism"
// backdrop-filter: blur(20px), semi-transparent surface

type EndMatchModalProps = {
  matchId: string;
  onClose: () => void;
};

export function EndMatchModal({ matchId, onClose }: EndMatchModalProps) {
  const { matches, players, endMatch } = useAppStore();
  const match = matches.find((m) => m.id === matchId);
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(15);

  if (!match) return null;

  const getNames = (ids: string[]) =>
    ids.map((id) => players.find((p) => p.id === id)?.name ?? "?").join(" & ");

  const teamAName = getNames(match.teams[0]);
  const teamBName = getNames(match.teams[1]);
  const winner: 0 | 1 = scoreA >= scoreB ? 0 : 1;

  function confirm() {
    endMatch(matchId, [scoreA, scoreB], winner);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(44, 47, 49, 0.45)", backdropFilter: "blur(4px)" }}>
      {/* Glassmorphism modal panel */}
      <div className="glass-modal w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-float space-y-6">

        <h2 className="font-headline text-headline-sm text-on-surface tracking-tight text-center">
          End Match
        </h2>

        {/* Score stepper — large tap targets, display-scale numbers */}
        <div className="grid grid-cols-2 gap-6">
          {[
            { label: teamAName, value: scoreA, set: setScoreA },
            { label: teamBName, value: scoreB, set: setScoreB },
          ].map(({ label, value, set }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant text-center truncate w-full">
                {label}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  className="tap-target w-11 h-11 rounded-full bg-surface-container flex items-center justify-center font-headline text-xl text-on-surface active:scale-90 transition-transform"
                  onClick={() => set((v) => Math.max(0, v - 1))}
                >
                  −
                </button>
                {/* Spec: display-md for prominent numbers */}
                <span className="font-headline text-display-md text-on-surface w-14 text-center leading-none">
                  {value}
                </span>
                <button
                  className="tap-target w-11 h-11 rounded-full bg-surface-container flex items-center justify-center font-headline text-xl text-on-surface active:scale-90 transition-transform"
                  onClick={() => set((v) => v + 1)}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Winner preview — background shift, no border */}
        <div className="bg-secondary-container rounded-xl px-4 py-4 text-center">
          <p className="font-body text-label-md uppercase tracking-editorial text-on-secondary-container opacity-70">
            Winner
          </p>
          <p className="font-headline text-headline-sm text-on-secondary-container tracking-tight mt-1">
            {winner === 0 ? teamAName : teamBName}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={confirm} className="flex-1">
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
