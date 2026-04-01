"use client";

import { useState } from "react";
import { CourtCard } from "@/components/court/court-card";
import { QueueList } from "@/components/queue/queue-list";
import { JoinQueueForm } from "@/components/queue/join-queue-form";
import { EndMatchModal } from "@/components/score/end-match-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/lib/db/store";
import { useActiveSession } from "@/hooks/use-active-session";
import { useQueueStats } from "@/hooks/use-queue-stats";
import { SessionSetupModal } from "./session/session-setup-modal";

// No-Line Rule: all structural separations via background color shifts
// Editorial spacing: spacing-12 (3rem) and spacing-16 (4rem) between major sections

export default function DashboardPage() {
  const { courts, assignNextGroup } = useAppStore();
  const { session, isActive } = useActiveSession();
  const { totalWaiting } = useQueueStats();
  const [endingMatchId, setEndingMatchId] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);

  const activeCourts = courts.filter((c) => c.status === "in-progress");

  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header — glass-panel, NO border-b (No-Line Rule: background shift separates) */}
      <header className="sticky top-0 z-40 glass-panel">
        <div className="max-w-2xl mx-auto flex items-center justify-between h-16 px-5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sports_tennis</span>
            <span className="font-headline text-headline-sm text-primary tracking-tight">
              SMASH KINETIC
            </span>
          </div>
          {isActive ? (
            <Badge variant="live" label={session?.name ?? "Live"} />
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setShowSetup(true)}>
              Start Session
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-12 space-y-16">
        {/* ── Empty state ── */}
        {!isActive && (
          // No border — surface-container-low background provides sectioning
          <div className="bg-surface-container-low rounded-xl p-12 text-center space-y-6">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "3rem" }}>
              sports_tennis
            </span>
            <div className="space-y-2">
              <p className="font-headline text-headline-md text-on-surface tracking-tight">
                No active session
              </p>
              <p className="font-body text-body-lg text-on-surface-variant">
                Start a session to manage courts, queue, and scores.
              </p>
            </div>
            <Button size="lg" onClick={() => setShowSetup(true)}>
              Start Session
            </Button>
          </div>
        )}

        {isActive && (
          <>
            {/* ── Stats strip — editorial spacing-12 above ── */}
            <section className="grid grid-cols-3 gap-4">
              {[
                { icon: "stadium", label: "Courts", value: courts.length, color: "text-primary" },
                { icon: "sports_tennis", label: "In Play", value: activeCourts.length, color: "text-tertiary" },
                { icon: "format_list_numbered", label: "Waiting", value: totalWaiting, color: "text-secondary-dim" },
              ].map(({ icon, label, value, color }) => (
                // surface-container-lowest card on surface bg = tonal depth
                <div key={label} className="bg-surface-container-lowest rounded-xl shadow-kinetic p-5 text-center">
                  <span className={`material-symbols-outlined ${color}`}>{icon}</span>
                  <p className={`font-headline text-display-sm mt-2 leading-none ${color}`}>
                    {value}
                  </p>
                  <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant mt-2">
                    {label}
                  </p>
                </div>
              ))}
            </section>

            {/* ── Courts section ── */}
            <section className="space-y-5">
              <h2 className="font-headline text-headline-sm text-on-surface tracking-tight">
                Courts
              </h2>
              {courts.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-8 text-center">
                  <p className="font-body text-body-md text-on-surface-variant">
                    No courts configured for this session.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {courts.map((court) => (
                    <CourtCard
                      key={court.id}
                      court={court}
                      onEndMatch={(matchId) => setEndingMatchId(matchId)}
                      onAssign={(courtId) => assignNextGroup(courtId)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* ── Queue section — editorial spacing-16 above ── */}
            <section className="space-y-5">
              <div className="flex items-baseline justify-between">
                <h2 className="font-headline text-headline-sm text-on-surface tracking-tight">
                  Queue
                </h2>
                {totalWaiting > 0 && (
                  <Badge variant="waiting" label={`${totalWaiting} waiting`} />
                )}
              </div>
              <JoinQueueForm />
              <QueueList />
            </section>
          </>
        )}
      </main>

      {/* Bottom nav — glass-panel, NO border-t (No-Line Rule) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 glass-panel">
        <div className="max-w-2xl mx-auto flex justify-around h-16 items-center px-2">
          {[
            { href: "/", icon: "dashboard", label: "Dashboard" },
            { href: "/players", icon: "group", label: "Players" },
            { href: "/session", icon: "event", label: "Sessions" },
          ].map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              className="flex flex-col items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors tap-target justify-center"
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="font-body text-label-sm uppercase tracking-editorial">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {endingMatchId && (
        <EndMatchModal matchId={endingMatchId} onClose={() => setEndingMatchId(null)} />
      )}
      {showSetup && <SessionSetupModal onClose={() => setShowSetup(false)} />}
    </div>
  );
}
