import { GUESS_WINDOW_MS } from "./const.ts";
import { fetchScoreboard, parseScoreboard } from "./espn.ts";
import { fetchDraftKingsSpreads, oddsApiKey } from "./odds.ts";
import type { LinedFixture } from "./type.ts";

type StoredFixture = LinedFixture & { hasLine?: boolean };

function hasLine(fixture: StoredFixture): boolean {
  return fixture.hasLine !== false && typeof fixture.line === "number";
}

function overlayOdds(fixtures: LinedFixture[], overlay: Map<string, number>): LinedFixture[] {
  if (!overlay.size) return fixtures;
  return fixtures.map((fixture) => {
    const next = overlay.get(`${fixture.away}-${fixture.home}`);
    if (typeof next !== "number") return fixture;
    return { ...fixture, line: next, hasLine: true } as StoredFixture;
  });
}

function freezeReady(fixtures: LinedFixture[], missingOdds: number): boolean {
  const withLines = fixtures.filter((row) => hasLine(row as StoredFixture)).length;
  return fixtures.length >= 8 && missingOdds === 0 && withLines === fixtures.length;
}

function mergeFrozen(existing: LinedFixture[], incoming: LinedFixture[]): LinedFixture[] {
  const byId = new Map(existing.map((row) => [row.id, row]));
  const merged = incoming.map((row) => {
    const prior = byId.get(row.id);
    if (!prior) return row;
    return {
      ...row,
      line: prior.line,
      hasLine: true,
    } as StoredFixture;
  });
  for (const row of existing) {
    if (!merged.some((item) => row.id === item.id)) merged.push(row);
  }
  return merged;
}

async function findWeek(orm: any, season: number, week: number) {
  return await orm.findEntry("nflWeek", [{
    field: "season",
    op: "=",
    value: season,
  }, {
    field: "week",
    op: "=",
    value: week,
  }]);
}

async function persistSlate(
  orm: any,
  parsed: { season: number; week: number; fixtures: LinedFixture[]; missingOdds: number },
  overlay: Map<string, number>,
) {
  const fixtures = overlayOdds(parsed.fixtures, overlay);
  const missing = fixtures.filter((row) => !hasLine(row as StoredFixture)).length;
  const existing = await findWeek(orm, parsed.season, parsed.week);
  const now = Date.now();
  const ready = freezeReady(fixtures, missing);
  if (!existing) {
    const week = orm.getNewEntry("nflWeek");
    week.update({
      season: parsed.season,
      week: parsed.week,
      label: `Week ${parsed.week} · ${parsed.season}`,
      status: "open",
      opensAt: new Date(now).toISOString(),
      linesRevealAt: new Date(now + GUESS_WINDOW_MS).toISOString(),
      linesFrozenAt: ready ? new Date(now).toISOString() : "",
      fixtures,
    });
    await week.save();
    return {
      season: parsed.season,
      week: parsed.week,
      games: fixtures.length,
      missingOdds: missing,
      frozen: ready,
      created: true,
    };
  }
  const frozenAt = String(existing.$linesFrozenAt || "");
  existing.$label = `Week ${parsed.week} · ${parsed.season}`;
  existing.$fixtures = frozenAt
    ? mergeFrozen(existing.$fixtures as LinedFixture[], fixtures)
    : fixtures;
  if (!frozenAt && ready) {
    existing.$linesFrozenAt = new Date(now).toISOString();
  }
  await existing.save();
  return {
    season: parsed.season,
    week: parsed.week,
    games: (existing.$fixtures as LinedFixture[]).length,
    missingOdds: missing,
    frozen: Boolean(existing.$linesFrozenAt),
    created: false,
  };
}

export async function loadCurrentWeek(orm: any) {
  const { rows } = await orm.getEntryList("nflWeek", {
    columns: ["id", "season", "week", "opensAt", "linesRevealAt", "status"],
    limit: 40,
    orderBy: "week",
    order: "desc",
  });
  if (!rows.length) return null;
  const now = Date.now();
  const sorted = [...rows].sort((a, b) => {
    const season = Number(b.season) - Number(a.season);
    if (season) return season;
    return Number(b.week) - Number(a.week);
  });
  const open = sorted.find((row) => {
    const reveal = new Date(String(row.linesRevealAt)).getTime();
    const opens = new Date(String(row.opensAt)).getTime();
    return now >= opens && now < reveal;
  });
  const pick = open || sorted[0];
  return await orm.getEntry("nflWeek", pick.id);
}

export async function syncNflWeeks(orm: any) {
  const currentBoard = await fetchScoreboard();
  const current = parseScoreboard(currentBoard);
  if (!current) throw new Error("ESPN scoreboard had no regular-season week");
  let overlay = new Map<string, number>();
  if (oddsApiKey()) {
    try {
      overlay = await fetchDraftKingsSpreads();
    } catch (error) {
      console.warn("Odds API overlay skipped:", error);
    }
  }
  const weeks = [current];
  try {
    const nextBoard = await fetchScoreboard(current.week + 1, current.season);
    const next = parseScoreboard(nextBoard);
    if (next && next.week !== current.week && next.fixtures.length) weeks.push(next);
  } catch (error) {
    console.warn("Next-week scoreboard skipped:", error);
  }
  const results = [];
  for (const slate of weeks) {
    results.push(await persistSlate(orm, slate, overlay));
  }
  return {
    source: oddsApiKey() ? "espn+odds-api" : "espn",
    weeks: results,
  };
}
