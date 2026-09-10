export const SPREAD_MIN = -21;
export const SPREAD_MAX = 21;
export const SPREAD_STEP = 0.5;

export function playerId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function clampSpread(value: number): number {
  const stepped = Math.round(value / SPREAD_STEP) * SPREAD_STEP;
  return Math.min(SPREAD_MAX, Math.max(SPREAD_MIN, stepped));
}

export function formatSpread(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value);
}

export function pickLabel(away: string, home: string, spread: number): string {
  if (spread === 0) return "PICK'EM";
  if (spread < 0) return `${home} BY ${formatSpread(Math.abs(spread))}`;
  return `${away} BY ${formatSpread(spread)}`;
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

export function remainingFrom(linesRevealAt: string, now = Date.now()): number {
  return Math.max(0, new Date(linesRevealAt).getTime() - now);
}
