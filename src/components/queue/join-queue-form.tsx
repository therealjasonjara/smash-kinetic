"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/db/store";
import type { QueueEntry } from "@/lib/types";

// No-Line Rule: selected state uses background shift (bg-primary/15), never border
// Spec: surface-container-lowest card, xl radius

export function JoinQueueForm() {
  const { players, queue, joinQueue } = useAppStore();
  const [matchType, setMatchType] = useState<QueueEntry["matchType"]>("doubles");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [error, setError] = useState("");

  const needed = matchType === "doubles" ? 2 : 1;
  const alreadyQueued = new Set(
    queue.filter((e) => e.status === "waiting").flatMap((e) => e.playerIds)
  );
  const available = players.filter((p) => !alreadyQueued.has(p.id));

  function toggle(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setError("");
  }

  function submit() {
    if (selectedIds.length < needed) {
      setError(`Select ${needed} player${needed > 1 ? "s" : ""} to join.`);
      return;
    }
    joinQueue(selectedIds.slice(0, needed), matchType);
    setSelectedIds([]);
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-kinetic p-6 space-y-5">
      <h3 className="font-headline text-headline-sm text-on-surface tracking-tight">
        Join Queue
      </h3>

      {/* Match type — pill toggles */}
      <div className="grid grid-cols-2 gap-3">
        {(["singles", "doubles"] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setMatchType(t); setSelectedIds([]); setError(""); }}
            // Active: speed-streak gradient (primary CTA); inactive: surface-container bg shift
            className={`tap-target flex items-center justify-center gap-2 px-4 py-3 rounded-xl
              font-headline text-label-md font-semibold uppercase tracking-editorial
              transition-all duration-150
              ${matchType === t
                ? "btn-gradient text-on-primary shadow-kinetic"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
              }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
              {t === "singles" ? "person" : "group"}
            </span>
            {t}
          </button>
        ))}
      </div>

      {/* Player selection */}
      <div className="space-y-2">
        <p className="font-body text-label-md uppercase tracking-editorial text-on-surface-variant">
          Select {needed} player{needed > 1 ? "s" : ""}
        </p>

        {available.length === 0 ? (
          <p className="font-body text-body-md text-on-surface-variant">
            All players are already queued.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {available.map((p) => {
              const selected = selectedIds.includes(p.id);
              const disabled = !selected && selectedIds.length >= needed;
              return (
                <button
                  key={p.id}
                  onClick={() => toggle(p.id)}
                  disabled={disabled}
                  // No-Line Rule: selected state = bg shift only, no border
                  className={`tap-target flex items-center gap-2 px-3 py-3 rounded-xl text-left transition-all duration-150
                    ${selected
                      ? "bg-primary/15 text-on-surface shadow-kinetic"
                      : disabled
                      ? "bg-surface-container text-on-surface-variant/40 cursor-not-allowed"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                >
                  <span className="material-symbols-outlined text-primary" style={{ fontSize: "18px" }}>
                    {selected ? "check_circle" : "radio_button_unchecked"}
                  </span>
                  <span className="font-body text-body-md truncate">{p.name}</span>
                  <span className="ml-auto font-body text-label-sm text-on-surface-variant/70 shrink-0">
                    L{p.level}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {error && (
          <p className="font-body text-label-md text-error-container">{error}</p>
        )}
      </div>

      <Button onClick={submit} className="w-full" disabled={selectedIds.length === 0}>
        Confirm Queue Spot
      </Button>
    </div>
  );
}
