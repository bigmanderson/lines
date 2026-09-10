import { NFL_TEAMS } from "./const.ts";
import type { TeamId } from "./type.ts";

type OddsOutcome = {
  name?: string;
  point?: number;
};

type OddsMarket = {
  key?: string;
  outcomes?: OddsOutcome[];
};

type OddsBookmaker = {
  key?: string;
  markets?: OddsMarket[];
};

type OddsEvent = {
  home_team?: string;
  away_team?: string;
  bookmakers?: OddsBookmaker[];
};

function teamIdFromFullName(name: string): TeamId | null {
  const needle = String(name || "").trim().toLowerCase();
  if (!needle) return null;
  for (const team of Object.values(NFL_TEAMS)) {
    const full = `${team.city} ${team.name}`.toLowerCase();
    if (full === needle || needle.endsWith(team.name.toLowerCase())) return team.id;
  }
  return null;
}

export function oddsApiKey(): string {
  return (
    Deno.env.get("THE_ODDS_API_KEY") ||
    Deno.env.get("ODDS_API_KEY") ||
    ""
  ).trim();
}

export async function fetchDraftKingsSpreads(): Promise<Map<string, number>> {
  const key = oddsApiKey();
  const lines = new Map<string, number>();
  if (!key) return lines;
  const url =
    `https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?regions=us&markets=spreads&oddsFormat=american&bookmakers=draftkings&apiKey=${encodeURIComponent(key)}`;
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) {
    throw new Error(`Odds API failed (${response.status})`);
  }
  const events = await response.json() as OddsEvent[];
  for (const event of events) {
    const home = teamIdFromFullName(event.home_team || "");
    const away = teamIdFromFullName(event.away_team || "");
    if (!home || !away) continue;
    const market = event.bookmakers?.[0]?.markets?.find((row) => row.key === "spreads");
    const homeOutcome = market?.outcomes?.find((row) =>
      teamIdFromFullName(row.name || "") === home
    );
    if (typeof homeOutcome?.point !== "number") continue;
    lines.set(`${away}-${home}`, homeOutcome.point);
  }
  return lines;
}
