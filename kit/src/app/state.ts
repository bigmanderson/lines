import { clockLabel, emptyPicks, playerId } from "../game/helper.ts";
import type { PublicMatch, PublicWeek } from "../game/type.ts";
import { WEEK1_2026 } from "../nfl/const.ts";

export const useLines = createState.in({
  id: "lines-play",
  initialState: {
    handle: "YOU",
    pin: "0000",
    playerId: "",
    joinCode: "",
    notice: "",
    roomCode: "",
    week: null as PublicWeek | null,
    match: null as PublicMatch | null,
    drafts: emptyPicks(WEEK1_2026.map((fixture) => ({ ...fixture, line: 0 }))),
    wins: 0,
    losses: 0,
    ties: 0,
    now: Date.now(),
    notifying: false,
  },
  action: {
    setHandle: {
      key: "handle",
      fn: (_current: string, next: string) => next.trim().toUpperCase().slice(0, 18),
    },
    setPin: {
      key: "pin",
      fn: (_current: string, next: string) => next.replace(/\D/g, "").slice(0, 4),
    },
    setJoinCode: {
      key: "joinCode",
      fn: (_current: string, next: string) => next.toUpperCase().slice(0, 4),
    },
  },
  storage: {
    key: "lines-player",
    backend: "local",
    include: ["handle", "playerId", "pin", "roomCode"],
  },
});

watch(() => {
  if (useLines.playerId.get()) return;
  useLines.playerId.set(playerId());
});

watch(() => {
  const timer = setInterval(() => useLines.now.set(Date.now()), 1000);
  onDestroy(() => clearInterval(timer));
});

export const remainingLabel = $(() => {
  const match = useLines.match.get();
  const week = useLines.week.get();
  const ms = match?.remainingMs ?? week?.remainingMs ?? 0;
  const drift = Math.max(0, (match || week)
    ? new Date((match || week)!.linesRevealAt).getTime() - useLines.now.get()
    : ms);
  return clockLabel(drift);
});

export const canSlide = $(() => {
  const match = useLines.match.get();
  if (!match) return false;
  return match.status === "open" && !match.you?.locked;
});

export { playerId };
