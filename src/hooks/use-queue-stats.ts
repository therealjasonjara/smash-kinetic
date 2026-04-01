import { useAppStore } from "@/lib/db/store";

export function useQueueStats() {
  const { queue } = useAppStore();
  const waiting = queue.filter((e) => e.status === "waiting");
  const assigned = queue.filter((e) => e.status === "assigned");
  const playing = queue.filter((e) => e.status === "playing");
  return { waiting, assigned, playing, totalWaiting: waiting.length };
}
