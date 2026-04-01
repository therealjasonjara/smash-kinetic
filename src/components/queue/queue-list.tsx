"use client";

import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/db/store";
import { formatTime, LEVEL_LABELS, estimateWait } from "@/lib/utils";

// Spec: Queue Card — surface-container-lowest bg, NO dividers, spacing-4 between names,
// position number uses display-sm, asymmetric top-left overlap

export function QueueList() {
  const { queue, players, leaveQueue } = useAppStore();

  const waiting = queue.filter((e) => e.status === "waiting");

  if (waiting.length === 0) {
    return (
      // Empty state: no border, background shift only
      <div className="bg-surface-container-low rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "2rem" }}>
          format_list_numbered
        </span>
        <p className="font-body text-body-md text-on-surface-variant mt-3">
          Queue is empty — be the first to join
        </p>
      </div>
    );
  }

  return (
    // Spec: no dividers between entries, use spacing-4 (1rem) of vertical white space
    <div className="space-y-4">
      {waiting.map((entry, idx) => {
        const entryPlayers = entry.playerIds
          .map((id) => players.find((p) => p.id === id))
          .filter(Boolean);

        const names = entryPlayers.map((p) => p!.name).join(" & ");
        const levels = entryPlayers.map((p) => LEVEL_LABELS[p!.level]).join(" / ");

        return (
          <div
            key={entry.id}
            // Spec: surface-container-lowest bg, xl radius, no border
            className="bg-surface-container-lowest rounded-xl shadow-kinetic relative overflow-hidden"
          >
            {/* Ghost position — display-sm, top-left, overlapping edge (Intentional Asymmetry) */}
            <span className="absolute -top-2 -left-1 font-headline text-display-md text-surface-container leading-none select-none pointer-events-none">
              {String(idx + 1).padStart(2, "0")}
            </span>

            <div className="relative z-10 pl-16 pr-4 py-5 flex items-center gap-3">
              {/* Player info — Spec: negative space, scale up, don't pack */}
              <div className="flex-1 min-w-0 space-y-1">
                <p className="font-headline text-headline-sm text-on-surface leading-tight tracking-tight">
                  {names}
                </p>
                <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
                  {levels} · {entry.matchType}
                </p>
                <p className="font-body text-label-sm uppercase tracking-editorial text-on-surface-variant/60">
                  Joined {formatTime(entry.joinedAt)}
                </p>
              </div>

              {/* Wait estimate */}
              <div className="text-right shrink-0">
                <p className="font-headline text-display-sm text-primary leading-none">
                  {estimateWait(idx)}
                </p>
                <p className="font-body text-label-sm uppercase tracking-editorial text-on-surface-variant mt-1">
                  Est. wait
                </p>
              </div>

              {/* Leave — ghost button, tertiary per spec */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => leaveQueue(entry.id)}
                className="shrink-0 tap-target !rounded-full"
                aria-label="Leave queue"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
