"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/db/store";
import { formatTime } from "@/lib/utils";
import { SessionSetupModal } from "./session-setup-modal";

// No-Line Rule: no borders on header or cards
// Editorial spacing, display-scale session stats

export default function SessionsPage() {
  const { sessions, matches, endSession, activeSessionId } = useAppStore();
  const [showSetup, setShowSetup] = useState(false);

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header — glass-panel, NO border (No-Line Rule) */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-5">
          <a href="/" className="flex items-center gap-1.5 text-on-surface-variant tap-target justify-center">
            <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>arrow_back</span>
            <span className="font-body text-body-md">Back</span>
          </a>
          <h1 className="font-headline text-headline-sm text-on-surface tracking-tight">Sessions</h1>
          <Button size="sm" variant="secondary" onClick={() => setShowSetup(true)}>
            New
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12 space-y-6">
        {sorted.length === 0 && (
          <div className="bg-surface-container-low rounded-xl p-12 text-center space-y-4">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "2.5rem" }}>event</span>
            <p className="font-body text-body-lg text-on-surface-variant">No sessions yet.</p>
            <Button onClick={() => setShowSetup(true)}>Start First Session</Button>
          </div>
        )}

        {sorted.map((s) => {
          const sessionMatches = matches.filter((m) => m.sessionId === s.id);
          const isActive = s.id === activeSessionId;

          return (
            // surface-container-lowest on surface = tonal lift, no border
            <div key={s.id} className="bg-surface-container-lowest rounded-xl shadow-kinetic p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-headline text-headline-sm text-on-surface tracking-tight">
                    {s.name ?? "Session"}
                  </p>
                  <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant mt-1">
                    {new Date(s.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {" · "}
                    {formatTime(s.date)}
                  </p>
                </div>
                {isActive ? (
                  <Badge variant="live" label="Active" />
                ) : (
                  <Badge variant="done" label="Ended" />
                )}
              </div>

              {/* Stats — display-sm numbers, editorial negative space */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Courts", value: s.courtCount },
                  { label: "Matches", value: sessionMatches.length },
                  { label: "Mode", value: s.stayOnWinner ? "King" : "FIFO" },
                ].map(({ label, value }) => (
                  // Sectioning: surface-container-low background shift, no border
                  <div key={label} className="bg-surface-container-low rounded-xl p-4 text-center">
                    <p className="font-headline text-display-sm text-on-surface leading-none">
                      {value}
                    </p>
                    <p className="font-body text-label-sm uppercase tracking-editorial text-on-surface-variant mt-2">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {isActive && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => endSession(s.id)}
                  className="w-full"
                >
                  End Session
                </Button>
              )}
            </div>
          );
        })}
      </main>

      {showSetup && <SessionSetupModal onClose={() => setShowSetup(false)} />}
    </div>
  );
}
