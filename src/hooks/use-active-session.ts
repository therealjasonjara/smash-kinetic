import { useAppStore } from "@/lib/db/store";

export function useActiveSession() {
  const { sessions, activeSessionId } = useAppStore();
  const session = sessions.find((s) => s.id === activeSessionId) ?? null;
  return { session, isActive: !!session };
}
