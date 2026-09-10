import { NFL_TEAMS } from "./const.ts";
import type { LinedFixture, TeamId } from "./type.ts";

const SCOREBOARD =
  "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard";
const CORE = "https://sports.core.api.espn.com/v2/sports/football/leagues/nfl";

const ESPN_TEAM_ID: Record<string, TeamId> = {
  "1": "ATL",
  "2": "BUF",
  "3": "CHI",
  "4": "CIN",
  "5": "CLE",
  "6": "DAL",
  "7": "DEN",
  "8": "DET",
  "9": "GB",
  "10": "TEN",
  "11": "IND",
  "12": "KC",
  "13": "LV",
  "14": "LAR",
  "15": "MIA",
  "16": "MIN",
  "17": "NE",
  "18": "NO",
  "19": "NYG",
  "20": "NYJ",
  "21": "PHI",
  "22": "ARI",
  "23": "PIT",
  "24": "LAC",
  "25": "SF",
  "26": "SEA",
  "27": "TB",
  "28": "WAS",
  "29": "CAR",
  "30": "JAX",
  "33": "BAL",
  "34": "HOU",
};

const FETCH_HEADERS = {
  accept: "application/json",
  "user-agent": "LINES/0.1 (guess-the-lines)",
};

export type EspnOdds = {
  spread?: number;
  details?: string;
  provider?: { name?: string };
};

export type EspnCompetitor = {
  homeAway?: string;
  id?: string;
  team?: { abbreviation?: string };
};

export type EspnEvent = {
  id?: string;
  date?: string;
  shortName?: string;
  competitions?: Array<{
    date?: string;
    venue?: { fullName?: string; address?: { city?: string } };
    broadcasts?: Array<{ names?: string[] }>;
    broadcast?: string;
    notes?: Array<{ headline?: string }>;
    odds?: EspnOdds[];
    competitors?: EspnCompetitor[];
    neutralSite?: boolean;
  }>;
};

export type EspnScoreboard = {
  season?: { year?: number; type?: number };
  week?: { number?: number };
  events?: EspnEvent[];
};

export function teamIdFromEspn(abbr: string): TeamId | null {
  const key = String(abbr || "").trim().toUpperCase();
  if (!key) return null;
  if (key in NFL_TEAMS) return key as TeamId;
  for (const team of Object.values(NFL_TEAMS)) {
    if (team.espn.toUpperCase() === key) return team.id;
  }
  return null;
}

export function teamIdFromEspnId(id: string): TeamId | null {
  return ESPN_TEAM_ID[String(id || "").trim()] ?? null;
}

export function kickoffLabel(iso: string): string {
  const stamp = new Date(iso);
  if (Number.isNaN(stamp.getTime())) return "";
  const label = stamp.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${label} ET`;
}

export function fixtureId(season: number, week: number, away: TeamId, home: TeamId): string {
  return `${season}-w${week}-${away.toLowerCase()}-${home.toLowerCase()}`;
}

export function homeRelativeSpread(odds: EspnOdds | undefined): number | null {
  if (!odds || typeof odds.spread !== "number" || !Number.isFinite(odds.spread)) {
    return null;
  }
  return odds.spread;
}

export function parseScoreboard(data: EspnScoreboard): {
  season: number;
  week: number;
  fixtures: LinedFixture[];
  missingOdds: number;
} | null {
  const season = Number(data.season?.year);
  const week = Number(data.week?.number);
  if (!season || !week) return null;
  const fixtures: LinedFixture[] = [];
  let missingOdds = 0;
  for (const event of data.events || []) {
    const competition = event.competitions?.[0];
    if (!competition) continue;
    const homeRow = competition.competitors?.find((row) => row.homeAway === "home");
    const awayRow = competition.competitors?.find((row) => row.homeAway === "away");
    const home = teamIdFromEspn(homeRow?.team?.abbreviation || "") ||
      teamIdFromEspnId(homeRow?.id || "");
    const away = teamIdFromEspn(awayRow?.team?.abbreviation || "") ||
      teamIdFromEspnId(awayRow?.id || "");
    if (!home || !away) continue;
    const kickoff = competition.date || event.date || "";
    const network = competition.broadcasts?.[0]?.names?.[0] ||
      String(competition.broadcast || "").trim() ||
      "TBD";
    const venue = competition.venue?.fullName || "TBD";
    const note = competition.notes?.[0]?.headline ||
      (competition.neutralSite ? "Neutral site" : undefined);
    const line = homeRelativeSpread(competition.odds?.[0]);
    if (line == null) missingOdds += 1;
    fixtures.push({
      id: fixtureId(season, week, away, home),
      week,
      season,
      kickoff,
      kickoffLabel: kickoffLabel(kickoff),
      network,
      venue,
      away,
      home,
      note,
      line: line ?? 0,
      hasLine: line != null,
    });
  }
  fixtures.sort((a, b) => a.kickoff.localeCompare(b.kickoff) || a.id.localeCompare(b.id));
  return { season, week, fixtures, missingOdds };
}

function https(url: string): string {
  return String(url || "").replace(/^http:\/\//, "https://");
}

function numberFromRef(url: string, key: string): number | null {
  const match = https(url).match(new RegExp(`/${key}/(\\d+)`));
  return match ? Number(match[1]) : null;
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(https(url), { headers: FETCH_HEADERS });
  if (!response.ok) throw new Error(`ESPN core failed (${response.status})`);
  return await response.json() as T;
}

async function fetchCoreScoreboard(week?: number, season = 2026): Promise<EspnScoreboard> {
  const listUrl = week
    ? `${CORE}/seasons/${season}/types/2/weeks/${week}/events?limit=50`
    : `${CORE}/events?limit=50`;
  const list = await getJson<{
    $meta?: { parameters?: { week?: string[]; season?: string[] } };
    items?: Array<{ $ref?: string }>;
  }>(listUrl);
  const refs = (list.items || []).map((item) => item.$ref).filter(Boolean) as string[];
  const events = await Promise.all(refs.map(async (ref) => {
    const event = await getJson<{
      date?: string;
      week?: { $ref?: string };
      season?: { $ref?: string };
      competitions?: Array<{
        date?: string;
        neutralSite?: boolean;
        venue?: { fullName?: string };
        broadcasts?: { $ref?: string };
        odds?: { $ref?: string };
        notes?: Array<{ headline?: string }>;
        competitors?: EspnCompetitor[];
      }>;
    }>(ref);
    const competition = event.competitions?.[0];
    let odds: EspnOdds[] = [];
    let network = "TBD";
    const extras = await Promise.all([
      competition?.odds?.$ref
        ? getJson<{ items?: EspnOdds[] }>(competition.odds.$ref)
        : Promise.resolve(null),
      competition?.broadcasts?.$ref
        ? getJson<{ items?: Array<{ station?: string; media?: { callLetters?: string } }> }>(
          competition.broadcasts.$ref,
        ).catch(() => null)
        : Promise.resolve(null),
    ]);
    odds = extras[0]?.items || [];
    network = extras[1]?.items?.[0]?.station || extras[1]?.items?.[0]?.media?.callLetters || "TBD";
    return {
      date: event.date,
      competitions: [{
        date: competition?.date,
        venue: { fullName: competition?.venue?.fullName },
        broadcasts: [{ names: [network] }],
        notes: competition?.notes,
        odds,
        competitors: competition?.competitors,
        neutralSite: competition?.neutralSite,
      }],
      _week: numberFromRef(event.week?.$ref || "", "weeks"),
      _season: numberFromRef(event.season?.$ref || "", "seasons"),
    };
  }));
  const year = events[0]?._season || Number(list.$meta?.parameters?.season?.[0]) || season;
  const weekNumber = events[0]?._week || Number(list.$meta?.parameters?.week?.[0]) || week || 1;
  return {
    season: { year, type: 2 },
    week: { number: weekNumber },
    events: events.map(({ _week, _season, ...event }) => event),
  };
}

export async function fetchScoreboard(week?: number, season?: number): Promise<EspnScoreboard> {
  const url = week
    ? `${SCOREBOARD}?seasontype=2&week=${week}`
    : `${SCOREBOARD}?seasontype=2`;
  try {
    const response = await fetch(url, { headers: FETCH_HEADERS });
    if (response.ok) return await response.json() as EspnScoreboard;
  } catch {
    // site.api is often 403 from servers; core API is the durable path
  }
  return await fetchCoreScoreboard(week, season);
}
