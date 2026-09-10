import { computed, reactive } from "vue";
import { linesAction } from "@/cloud/client";
import { clampSpread, clockLabel, playerId, remainingFrom } from "@/game/helper";
import type { PublicMatch, PublicWeek } from "@/game/type";

const STORAGE_KEY = "lines-player";

type Persist = {
  handle: string;
  pin: string;
  playerId: string;
  roomCode: string;
};

function readPersist(): Partial<Persist> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") as Persist;
  } catch {
    return {};
  }
}

const saved = readPersist();

export const lines = reactive({
  handle: saved.handle || "YOU",
  pin: saved.pin || "0000",
  playerId: saved.playerId || "",
  joinCode: "",
  notice: "",
  roomCode: saved.roomCode || "",
  week: null as PublicWeek | null,
  match: null as PublicMatch | null,
  drafts: {} as Record<string, number>,
  wins: 0,
  losses: 0,
  ties: 0,
  now: Date.now(),
  notifying: false,
  busy: false,
});

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    handle: lines.handle,
    pin: lines.pin,
    playerId: lines.playerId,
    roomCode: lines.roomCode,
  }));
}

if (!lines.playerId) {
  lines.playerId = playerId();
  persist();
}

setInterval(() => {
  lines.now = Date.now();
}, 1000);

export const remainingLabel = computed(() => {
  const stamp = lines.match?.linesRevealAt || lines.week?.linesRevealAt;
  if (!stamp) return "—";
  return clockLabel(remainingFrom(stamp, lines.now));
});

export const canSlide = computed(() => {
  const match = lines.match;
  if (!match) return false;
  return match.status === "open" && !match.you?.locked;
});

export function setHandle(value: string) {
  lines.handle = value.trim().toUpperCase().replace(/\s+/g, "").slice(0, 18) || "YOU";
  persist();
}

export function setPin(value: string) {
  lines.pin = value.replace(/\D/g, "").slice(0, 4);
  persist();
}

export function setJoinCode(value: string) {
  lines.joinCode = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
}

function applyMatch(view: PublicMatch) {
  lines.match = view;
  lines.roomCode = view.code;
  lines.notice = "";
  persist();
  if (view.you?.locked) {
    for (const game of view.games) {
      if (game.yourPick != null) lines.drafts[game.id] = game.yourPick;
    }
  } else {
    for (const game of view.games) {
      if (lines.drafts[game.id] == null) lines.drafts[game.id] = 0;
    }
  }
}

export function draft(gameId: string, value: number) {
  if (!canSlide.value) return;
  lines.drafts[gameId] = clampSpread(value);
}

function askNotify() {
  if (lines.notifying) return;
  if (!("Notification" in window)) return;
  Notification.requestPermission().then((permission) => {
    lines.notifying = permission === "granted";
    if (permission === "granted") {
      new Notification("LINES is live", {
        body: "You have 24 hours to lock your card. Closest to Vegas wins.",
        tag: "lines-open",
      });
    }
  });
}

export async function loadWeek() {
  try {
    lines.week = await linesAction<PublicWeek>("week");
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not load the slate";
  }
}

export async function register() {
  try {
    const row = await linesAction<{
      handle: string;
      playerId: string;
      wins: number;
      losses: number;
      ties: number;
    }>("register", {
      handle: lines.handle,
      playerId: lines.playerId,
      pin: lines.pin || "0000",
    });
    lines.handle = row.handle;
    lines.playerId = row.playerId;
    lines.wins = row.wins;
    lines.losses = row.losses;
    lines.ties = row.ties;
    lines.notice = "Handle locked. Invite a rival.";
    persist();
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not create handle";
  }
}

export async function login() {
  try {
    const row = await linesAction<{
      handle: string;
      playerId: string;
      wins: number;
      losses: number;
      ties: number;
    }>("login", {
      handle: lines.handle,
      pin: lines.pin,
    });
    lines.handle = row.handle;
    lines.playerId = row.playerId;
    lines.wins = row.wins;
    lines.losses = row.losses;
    lines.ties = row.ties;
    lines.notice = "Welcome back.";
    persist();
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not sign in";
  }
}

async function ensurePlayer() {
  try {
    const row = await linesAction<{
      handle: string;
      playerId: string;
      wins: number;
      losses: number;
      ties: number;
    }>("register", {
      handle: lines.handle,
      playerId: lines.playerId,
      pin: lines.pin || "0000",
    });
    lines.handle = row.handle;
    lines.playerId = row.playerId;
    lines.wins = row.wins;
    lines.losses = row.losses;
    lines.ties = row.ties;
    persist();
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (!/taken/i.test(message)) throw error;
    const row = await linesAction<{
      handle: string;
      playerId: string;
      wins: number;
      losses: number;
      ties: number;
    }>("login", {
      handle: lines.handle,
      pin: lines.pin || "0000",
    });
    lines.handle = row.handle;
    lines.playerId = row.playerId;
    lines.wins = row.wins;
    lines.losses = row.losses;
    lines.ties = row.ties;
    persist();
  }
}

export async function createMatch(mode: "friend" | "house") {
  lines.busy = true;
  try {
    if (!lines.handle) lines.handle = "YOU";
    await ensurePlayer();
    const view = await linesAction<PublicMatch>("create", {
      handle: lines.handle,
      playerId: lines.playerId,
      mode,
    });
    applyMatch(view);
    askNotify();
    return view;
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not open a challenge";
    return null;
  } finally {
    lines.busy = false;
  }
}

export async function joinMatch(code?: string) {
  lines.busy = true;
  try {
    if (!lines.handle) lines.handle = "YOU";
    await ensurePlayer();
    const view = await linesAction<PublicMatch>("join", {
      code: (code || lines.joinCode).trim(),
      handle: lines.handle,
      playerId: lines.playerId,
    });
    applyMatch(view);
    askNotify();
    return view;
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not join";
    return null;
  } finally {
    lines.busy = false;
  }
}

export async function refreshMatch() {
  if (!lines.roomCode) return;
  try {
    const view = await linesAction<PublicMatch>("get", {
      code: lines.roomCode,
      playerId: lines.playerId,
    });
    applyMatch(view);
  } catch {
    return;
  }
}

export async function lockCard() {
  lines.busy = true;
  try {
    const view = await linesAction<PublicMatch>("lock", {
      code: lines.roomCode,
      playerId: lines.playerId,
      picks: lines.drafts,
    });
    applyMatch(view);
    lines.notice = "Locked. No take-backs.";
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not lock";
  } finally {
    lines.busy = false;
  }
}

export async function dropLines() {
  try {
    const view = await linesAction<PublicMatch>("dropLines", {
      code: lines.roomCode,
      playerId: lines.playerId,
    });
    applyMatch(view);
  } catch (error) {
    lines.notice = error instanceof Error ? error.message : "Could not drop the lines";
  }
}

export async function loadSeason() {
  try {
    const row = await linesAction<{
      handle: string | null;
      wins: number;
      losses: number;
      ties: number;
      week: PublicWeek;
    }>("season", { playerId: lines.playerId });
    if (row.handle) lines.handle = row.handle;
    lines.wins = row.wins;
    lines.losses = row.losses;
    lines.ties = row.ties;
    lines.week = row.week;
    persist();
  } catch {
    return;
  }
}

export async function copyInvite() {
  const match = lines.match;
  if (!match) return;
  const url = `${location.origin}${match.invitePath}`;
  await navigator.clipboard?.writeText(url);
  lines.notice = `Invite copied · ${match.code}`;
}
