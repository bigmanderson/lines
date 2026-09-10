import type { LinedFixture } from "../nfl/type.ts";
import { CODE_ALPHABET, NFL_TEAMS, SPREAD_MAX, SPREAD_MIN, SPREAD_STEP } from "../nfl/const.ts";
import { teamLogo } from "../nfl/helper.ts";
import type { PickMap, PublicTeam, Seat } from "./type.ts";
import type { TeamId } from "../nfl/type.ts";

export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function roomCodeFromSeed(seed: number): string {
  const rng = createRng(seed ^ 0x9e3779b9);
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)];
  }
  return code;
}

export function playerId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function clampSpread(value: number): number {
  const stepped = Math.round(value / SPREAD_STEP) * SPREAD_STEP;
  return Math.min(SPREAD_MAX, Math.max(SPREAD_MIN, stepped));
}

export function publicTeam(id: TeamId): PublicTeam {
  const row = NFL_TEAMS[id];
  return {
    id: row.id,
    city: row.city,
    name: row.name,
    abbr: row.abbr,
    color: row.color,
    color2: row.color2,
    logo: teamLogo(id),
  };
}

export function pickLabel(away: string, home: string, spread: number): string {
  if (spread === 0) return "PICK'EM";
  if (spread < 0) return `${home} BY ${formatSpread(Math.abs(spread))}`;
  return `${away} BY ${formatSpread(spread)}`;
}

export function formatSpread(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function distance(guess: number, line: number): number {
  return Math.abs(guess - line);
}

export function winnerForGame(a: number | null, b: number | null, line: number): "a" | "b" | "tie" | null {
  if (a == null && b == null) return null;
  if (a == null) return "b";
  if (b == null) return "a";
  const da = distance(a, line);
  const db = distance(b, line);
  if (da < db) return "a";
  if (db < da) return "b";
  return "tie";
}

export function remainingMs(linesRevealAt: string, now = Date.now()): number {
  return Math.max(0, new Date(linesRevealAt).getTime() - now);
}

export function clockLabel(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  return `${minutes}:${pad(seconds)}`;
}

export function sanitizePicks(fixtures: LinedFixture[], raw: unknown): PickMap {
  const picks: PickMap = {};
  if (!raw || typeof raw !== "object") return picks;
  const source = raw as Record<string, unknown>;
  for (const fixture of fixtures) {
    const value = source[fixture.id];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    picks[fixture.id] = clampSpread(value);
  }
  return picks;
}

export function emptyPicks(fixtures: LinedFixture[]): PickMap {
  const picks: PickMap = {};
  for (const fixture of fixtures) picks[fixture.id] = 0;
  return picks;
}

export function housePicks(fixtures: LinedFixture[], seed: number): PickMap {
  const rng = createRng(seed);
  const picks: PickMap = {};
  for (const fixture of fixtures) {
    const wobble = (Math.floor(rng() * 9) - 4) * SPREAD_STEP;
    picks[fixture.id] = clampSpread(fixture.line + wobble);
  }
  return picks;
}

export function bothLocked(players: Seat[]): boolean {
  return players.length >= 2 && players.every((seat) => Boolean(seat.lockedAt));
}

export function bookOpen(linesRevealAt: string, now = Date.now()): boolean {
  return now >= new Date(linesRevealAt).getTime();
}
