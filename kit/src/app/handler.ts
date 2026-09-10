import type { PublicMatch, PublicWeek } from "../game/type.ts";
import { canSlide, useLines } from "./state.ts";

async function linesAction(action: string, data: Record<string, unknown> = {}): Promise<any> {
  const response = await fetch(`/api?group=lines&action=${action}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || "LINES cloud failed");
  }
  return payload;
}

function applyMatch(view: PublicMatch): void {
  useLines.match.set(view);
  useLines.roomCode.set(view.code);
  useLines.notice.set("");
  if (view.you?.locked) {
    const next = { ...useLines.drafts.get() };
    for (const game of view.games) {
      if (game.yourPick != null) next[game.id] = game.yourPick;
    }
    useLines.drafts.set(next);
  }
}

export async function handleRegister(): Promise<void> {
  try {
    const row = await linesAction("register", {
      handle: useLines.handle.get(),
      playerId: useLines.playerId.get(),
      pin: useLines.pin.get() || "0000",
    });
    useLines.handle.set(row.handle);
    useLines.playerId.set(row.playerId);
    useLines.wins.set(row.wins);
    useLines.losses.set(row.losses);
    useLines.ties.set(row.ties);
    useLines.notice.set("Handle locked. Invite a rival.");
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not create handle");
  }
}

export async function handleLogin(): Promise<void> {
  try {
    const row = await linesAction("login", {
      handle: useLines.handle.get(),
      pin: useLines.pin.get(),
    });
    useLines.handle.set(row.handle);
    useLines.playerId.set(row.playerId);
    useLines.pin.set(String(useLines.pin.get()));
    useLines.wins.set(row.wins);
    useLines.losses.set(row.losses);
    useLines.ties.set(row.ties);
    useLines.notice.set("Welcome back.");
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not sign in");
  }
}

export async function handleLoadWeek(): Promise<void> {
  try {
    const week = await linesAction("week") as PublicWeek;
    useLines.week.set(week);
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not load the slate");
  }
}

export async function handleCreate(mode: "friend" | "house"): Promise<void> {
  try {
    if (!useLines.handle.get()) {
      useLines.handle.set("YOU");
    }
    const view = await linesAction("create", {
      handle: useLines.handle.get(),
      playerId: useLines.playerId.get(),
      mode,
    }) as PublicMatch;
    applyMatch(view);
    GlobalRoute.to("/play");
    askNotify();
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not open a challenge");
  }
}

export async function handleJoin(code?: string): Promise<void> {
  try {
    if (!useLines.handle.get()) {
      useLines.handle.set("YOU");
    }
    const view = await linesAction("join", {
      code: (code || useLines.joinCode.get()).trim(),
      handle: useLines.handle.get(),
      playerId: useLines.playerId.get(),
    }) as PublicMatch;
    applyMatch(view);
    GlobalRoute.to("/play");
    askNotify();
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not join");
  }
}

export async function handleRefresh(): Promise<void> {
  const code = useLines.roomCode.get();
  if (!code) return;
  try {
    const view = await linesAction("get", {
      code,
      playerId: useLines.playerId.get(),
    }) as PublicMatch;
    applyMatch(view);
  } catch {
    return;
  }
}

export async function handleLock(): Promise<void> {
  try {
    const view = await linesAction("lock", {
      code: useLines.roomCode.get(),
      playerId: useLines.playerId.get(),
      picks: useLines.drafts.get(),
    }) as PublicMatch;
    applyMatch(view);
    useLines.notice.set("Locked. No take-backs.");
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not lock");
  }
}

export async function handleDropLines(): Promise<void> {
  try {
    const view = await linesAction("dropLines", {
      code: useLines.roomCode.get(),
      playerId: useLines.playerId.get(),
    }) as PublicMatch;
    applyMatch(view);
  } catch (error) {
    useLines.notice.set(error instanceof Error ? error.message : "Could not drop the lines");
  }
}

export async function handleSeason(): Promise<void> {
  try {
    const row = await linesAction("season", { playerId: useLines.playerId.get() });
    if (row.handle) useLines.handle.set(row.handle);
    useLines.wins.set(row.wins);
    useLines.losses.set(row.losses);
    useLines.ties.set(row.ties);
    useLines.week.set(row.week);
  } catch {
    return;
  }
}

export function handleDraft(gameId: string, value: number): void {
  if (!canSlide.get()) return;
  useLines.drafts.set({
    ...useLines.drafts.get(),
    [gameId]: value,
  });
}

export function copyInvite(): void {
  const match = useLines.match.get();
  if (!match) return;
  const url = `${globalThis.location.origin}${match.invitePath}`;
  navigator.clipboard?.writeText(url);
  useLines.notice.set(`Invite copied · ${match.code}`);
}

function askNotify(): void {
  if (useLines.notifying.get()) return;
  if (!("Notification" in globalThis)) return;
  Notification.requestPermission().then((permission) => {
    useLines.notifying.set(permission === "granted");
    if (permission === "granted") {
      new Notification("LINES is live", {
        body: "You have 24 hours to lock your card. Closest to Vegas wins.",
        tag: "lines-open",
      });
    }
  });
}

watch(() => {
  if (!useLines.roomCode.get()) return;
  const timer = setInterval(() => {
    handleRefresh();
  }, 2500);
  onDestroy(() => clearInterval(timer));
});
