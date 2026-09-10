import type { PublicMatch, PublicWeek } from "@/game/type";

const cloudRoot = String(import.meta.env.VITE_CLOUD_URL || "").replace(/\/$/, "");

function apiErrorMessage(parsed: unknown, fallback: string) {
  if (typeof parsed === "string" && parsed.trim()) return parsed;
  if (Array.isArray(parsed)) {
    const first = parsed[0];
    if (typeof first === "string" && first.trim()) return first;
    if (first && typeof first === "object" && "message" in first) {
      const message = (first as { message?: string }).message;
      if (typeof message === "string" && message.trim()) return message;
    }
  }
  const row = parsed as { message?: string; error?: string | { message?: string } };
  if (typeof row?.message === "string" && row.message.trim()) return row.message;
  if (typeof row?.error === "string" && row.error.trim()) return row.error;
  if (typeof row?.error === "object" && row.error?.message) return row.error.message;
  return fallback;
}

export async function linesAction<T>(
  action: string,
  data: Record<string, unknown> = {},
): Promise<T> {
  const url = `${cloudRoot}/api?group=lines&action=${encodeURIComponent(action)}`;
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
  const text = await response.text();
  let parsed: unknown = {};
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { message: text };
    }
  }
  if (!response.ok) {
    throw new Error(apiErrorMessage(parsed, `lines.${action} failed`));
  }
  return parsed as T;
}

export type { PublicMatch, PublicWeek };
