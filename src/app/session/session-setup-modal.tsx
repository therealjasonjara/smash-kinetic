"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/lib/db/store";

// Spec: floating modals use Glassmorphism (backdrop-filter: blur(20px))

type Props = { onClose: () => void };

export function SessionSetupModal({ onClose }: Props) {
  const { startSession } = useAppStore();
  const [name, setName] = useState("Saturday Session");
  const [courtCount, setCourtCount] = useState(3);
  const [stayOnWinner, setStayOnWinner] = useState(false);

  function submit() {
    if (courtCount < 1) return;
    startSession(name, courtCount, stayOnWinner);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(44, 47, 49, 0.45)", backdropFilter: "blur(4px)" }}
    >
      {/* Glassmorphism modal panel */}
      <div className="glass-modal w-full max-w-sm rounded-t-2xl sm:rounded-2xl p-6 shadow-float space-y-6">
        <h2 className="font-headline text-headline-sm text-on-surface tracking-tight">
          New Session
        </h2>

        <Input
          label="Session name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Saturday Morning"
        />

        {/* Court count stepper */}
        <div className="flex flex-col gap-3">
          <p className="font-body text-label-md font-medium uppercase tracking-editorial text-on-surface-variant">
            Number of courts
          </p>
          <div className="flex items-center gap-5">
            <button
              className="tap-target w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-headline text-xl text-on-surface active:scale-90 transition-transform"
              onClick={() => setCourtCount((v) => Math.max(1, v - 1))}
            >
              −
            </button>
            <span className="font-headline text-display-md text-on-surface w-14 text-center leading-none">
              {courtCount}
            </span>
            <button
              className="tap-target w-12 h-12 rounded-full bg-surface-container flex items-center justify-center font-headline text-xl text-on-surface active:scale-90 transition-transform"
              onClick={() => setCourtCount((v) => v + 1)}
            >
              +
            </button>
          </div>
        </div>

        {/* King of the Court toggle — no border, background shift */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-4 tap-target cursor-pointer"
          onClick={() => setStayOnWinner((v) => !v)}>
          <div>
            <p className="font-headline text-body-lg font-semibold text-on-surface">
              King of the Court
            </p>
            <p className="font-body text-label-md text-on-surface-variant mt-0.5">
              Winners stay on; next challengers up
            </p>
          </div>
          {/* Toggle pill */}
          <button
            role="switch"
            aria-checked={stayOnWinner}
            onClick={(e) => { e.stopPropagation(); setStayOnWinner((v) => !v); }}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 ml-4 ${
              stayOnWinner ? "bg-primary" : "bg-surface-container-high"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                stayOnWinner ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={submit} className="flex-1" disabled={!name.trim()}>
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
