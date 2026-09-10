import { defineAPIGroup, raiseServerException } from "@inspatial/cloud";
import { publicTeam } from "../game/helper.ts";
import {
  bothLocked,
  bookOpen,
  emptyPicks,
  housePicks,
  remainingMs,
  roomCodeFromSeed,
  sanitizePicks,
} from "../game/helper.ts";
import { lockSeat, publicMatch, revealNow, scoreMatch, weekScore } from "../game/core.ts";
import type { MatchState, PublicWeek, Seat } from "../game/type.ts";
import { loadCurrentWeek, syncNflWeeks } from "../nfl/sync.ts";
import type { LinedFixture } from "../nfl/type.ts";

export const linesGroup = defineAPIGroup("lines", {
  description: "Guess the lines: register, invite, lock a card, reveal the book",
});

function handleOf(value: unknown): string {
  return String(value || "").trim().replace(/\s+/g, "").slice(0, 18).toUpperCase();
}

function pinOf(value: unknown): string {
  const pin = String(value || "").replace(/\D/g, "").slice(0, 4);
  return pin.padStart(4, "0").slice(0, 4);
}

async function loadWeek(orm: any, season?: number, weekNumber?: number) {
  if (season && weekNumber) {
    const exact = await orm.findEntry("nflWeek", [{
      field: "season",
      op: "=",
      value: season,
    }, {
      field: "week",
      op: "=",
      value: weekNumber,
    }]);
    if (exact) return exact;
  }
  const week = await loadCurrentWeek(orm);
  if (!week) raiseServerException(404, "No NFL week is loaded yet");
  return week;
}

function weekState(week: any): { opensAt: string; linesRevealAt: string; fixtures: LinedFixture[]; label: string; season: number; week: number } {
  return {
    season: Number(week.$season),
    week: Number(week.$week),
    label: String(week.$label),
    opensAt: String(week.$opensAt),
    linesRevealAt: String(week.$linesRevealAt),
    fixtures: week.$fixtures as LinedFixture[],
  };
}

function publicWeek(week: any, now = Date.now()): PublicWeek {
  const state = weekState(week);
  const reveal = bookOpen(state.linesRevealAt, now);
  if (reveal && week.$status !== "revealed") {
    week.$status = "revealed";
  }
  return {
    season: state.season,
    week: state.week,
    label: state.label,
    opensAt: state.opensAt,
    linesRevealAt: state.linesRevealAt,
    now: new Date(now).toISOString(),
    remainingMs: remainingMs(state.linesRevealAt, now),
    fixtureCount: state.fixtures.length,
    fixtures: state.fixtures.map((fixture) => ({
      id: fixture.id,
      week: fixture.week,
      season: fixture.season,
      kickoff: fixture.kickoff,
      kickoffLabel: fixture.kickoffLabel,
      network: fixture.network,
      venue: fixture.venue,
      away: fixture.away,
      home: fixture.home,
      note: fixture.note,
      awayTeam: publicTeam(fixture.away),
      home: fixture.home,
      away: fixture.away,
    })) as PublicWeek["fixtures"],
  };
}

function asMatch(row: any): MatchState {
  return row.$snapshot as MatchState;
}

async function loadMatch(orm: any, code: string) {
  const match = await orm.findEntry("linesMatch", [{
    field: "code",
    op: "=",
    value: String(code || "").trim().toUpperCase(),
  }]);
  if (!match) raiseServerException(404, "No match with that invite");
  return match;
}

async function upsertPlayer(orm: any, playerId: string, handle: string, pin?: string) {
  const id = String(playerId || "").trim();
  const tag = handleOf(handle);
  if (!id) raiseServerException(400, "Missing player");
  if (tag.length < 2) raiseServerException(400, "Pick a handle");
  let player = await orm.findEntry("linesPlayer", [{ field: "playerId", op: "=", value: id }]);
  if (!player) {
    const taken = await orm.findEntry("linesPlayer", [{ field: "handle", op: "=", value: tag }]);
    if (taken) raiseServerException(409, "That handle is taken. Sign in with your PIN.");
    player = orm.getNewEntry("linesPlayer");
    player.update({
      handle: tag,
      playerId: id,
      pin: pin ? pinOf(pin) : pinOf("0000"),
      wins: 0,
      losses: 0,
      ties: 0,
    });
    await player.save();
    return player;
  }
  if (handleOf(player.$handle) !== tag) {
    const taken = await orm.findEntry("linesPlayer", [{ field: "handle", op: "=", value: tag }]);
    if (taken && taken.$playerId !== id) raiseServerException(409, "That handle is taken");
    player.$handle = tag;
    await player.save();
  }
  return player;
}

async function loginPlayer(orm: any, handle: string, pin: string) {
  const tag = handleOf(handle);
  const player = await orm.findEntry("linesPlayer", [{ field: "handle", op: "=", value: tag }]);
  if (!player || String(player.$pin) !== pinOf(pin)) {
    raiseServerException(403, "Handle or PIN is wrong");
  }
  return player;
}

function rivalryKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

async function loadSeries(orm: any, a: string, b: string) {
  const key = rivalryKey(a, b);
  const row = await orm.findEntry("linesRivalry", [{ field: "key", op: "=", value: key }]);
  if (!row) return { you: 0, rival: 0, ties: 0 };
  const youAreA = row.$playerA === a;
  return {
    you: Number(youAreA ? row.$winsA : row.$winsB),
    rival: Number(youAreA ? row.$winsB : row.$winsA),
    ties: Number(row.$ties),
  };
}

async function writeSeries(orm: any, match: MatchState, nowIso: string) {
  if (match.players.length < 2 || !match.results) return;
  const [left, right] = match.players;
  const tally = weekScore(match.results, left.id, right.id);
  const key = rivalryKey(left.id, right.id);
  let row = await orm.findEntry("linesRivalry", [{ field: "key", op: "=", value: key }]);
  if (!row) {
    row = orm.getNewEntry("linesRivalry");
    row.update({
      key,
      playerA: left.id < right.id ? left.id : right.id,
      playerB: left.id < right.id ? right.id : left.id,
      winsA: 0,
      winsB: 0,
      ties: 0,
      weeks: 0,
    });
  }
  const leftIsA = row.$playerA === left.id;
  if (tally.you > tally.rival) {
    if (leftIsA) row.$winsA = Number(row.$winsA) + 1;
    else row.$winsB = Number(row.$winsB) + 1;
  } else if (tally.rival > tally.you) {
    if (leftIsA) row.$winsB = Number(row.$winsB) + 1;
    else row.$winsA = Number(row.$winsA) + 1;
  } else {
    row.$ties = Number(row.$ties) + 1;
  }
  row.$weeks = Number(row.$weeks) + 1;
  await row.save();
  await bumpPlayer(orm, left.id, tally.you, tally.rival, tally.ties);
  await bumpPlayer(orm, right.id, tally.rival, tally.you, tally.ties);
  void nowIso;
}

async function bumpPlayer(orm: any, playerId: string, wins: number, losses: number, ties: number) {
  const player = await orm.findEntry("linesPlayer", [{ field: "playerId", op: "=", value: playerId }]);
  if (!player) return;
  if (wins > losses) player.$wins = Number(player.$wins) + 1;
  else if (losses > wins) player.$losses = Number(player.$losses) + 1;
  else player.$ties = Number(player.$ties) + 1;
  await player.save();
}

async function packed(orm: any, matchRow: any, playerId: string, now = Date.now()) {
  const match = asMatch(matchRow);
  if (bookOpen(match.linesRevealAt, now) && !match.results) {
    match.results = scoreMatch(match);
    matchRow.$snapshot = match;
    matchRow.$status = "revealed";
    await matchRow.save();
    await writeSeries(orm, match, new Date(now).toISOString());
  } else if (bothLocked(match.players) && matchRow.$status === "open") {
    matchRow.$status = "waiting";
    await matchRow.save();
  }
  const rival = match.players.find((seat: Seat) => seat.id !== playerId);
  const seasonSeries = rival ? await loadSeries(orm, playerId, rival.id) : null;
  return publicMatch(match, playerId, now, seasonSeries);
}

function freshMatch(code: string, host: Seat, week: ReturnType<typeof weekState>, house?: Seat): MatchState {
  return {
    code,
    hostId: host.id,
    season: week.season,
    week: week.week,
    label: week.label,
    opensAt: week.opensAt,
    linesRevealAt: week.linesRevealAt,
    fixtures: week.fixtures,
    players: house ? [host, house] : [host],
    results: null,
  };
}

linesGroup.addAction("register", {
  label: "Create handle",
  authRequired: false,
  mutates: true,
  params: [
    { key: "handle", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
    { key: "pin", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const player = await upsertPlayer(orm, String(params.playerId), params.handle, String(params.pin));
    return {
      handle: player.$handle,
      playerId: player.$playerId,
      wins: player.$wins,
      losses: player.$losses,
      ties: player.$ties,
    };
  },
});

linesGroup.addAction("login", {
  label: "Sign in",
  authRequired: false,
  mutates: false,
  params: [
    { key: "handle", type: "DataField", required: true },
    { key: "pin", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const player = await loginPlayer(orm, params.handle, String(params.pin));
    return {
      handle: player.$handle,
      playerId: player.$playerId,
      wins: player.$wins,
      losses: player.$losses,
      ties: player.$ties,
    };
  },
});

linesGroup.addAction("week", {
  label: "This week's slate",
  authRequired: false,
  mutates: false,
  async action({ orm }) {
    const week = await loadWeek(orm);
    const view = publicWeek(week);
    return {
      ...view,
      fixtures: (week.$fixtures as LinedFixture[]).map((fixture) => ({
        id: fixture.id,
        week: fixture.week,
        season: fixture.season,
        kickoff: fixture.kickoff,
        kickoffLabel: fixture.kickoffLabel,
        network: fixture.network,
        venue: fixture.venue,
        note: fixture.note,
        away: publicTeam(fixture.away),
        home: publicTeam(fixture.home),
      })),
    };
  },
});

linesGroup.addAction("syncWeek", {
  label: "Pull this week's Vegas lines",
  authRequired: false,
  mutates: true,
  async action({ orm }) {
    try {
      return await syncNflWeeks(orm);
    } catch (error) {
      return {
        skipped: true,
        reason: error instanceof Error ? error.message : "Could not pull NFL lines",
      };
    }
  },
});

linesGroup.addAction("create", {
  label: "Open a challenge",
  authRequired: false,
  mutates: true,
  params: [
    { key: "handle", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
    { key: "mode", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const player = await upsertPlayer(orm, String(params.playerId), params.handle);
    const week = weekState(await loadWeek(orm));
    let code = "";
    for (let i = 0; i < 8; i++) {
      code = roomCodeFromSeed(Date.now() + i * 7919);
      const existing = await orm.findEntry("linesMatch", [{ field: "code", op: "=", value: code }]);
      if (!existing) break;
    }
    const host: Seat = {
      id: player.$playerId,
      name: player.$handle,
      kind: "human",
      lockedAt: null,
      picks: emptyPicks(week.fixtures),
    };
    const house = String(params.mode) === "house"
      ? {
        id: `house-${code}`,
        name: "VEGAS VIC",
        kind: "house" as const,
        lockedAt: new Date().toISOString(),
        picks: housePicks(week.fixtures, Date.now()),
      }
      : undefined;
    const snapshot = freshMatch(code, host, week, house);
    const match = orm.getNewEntry("linesMatch");
    match.update({
      code,
      status: "open",
      hostId: host.id,
      season: week.season,
      week: week.week,
      weekLabel: week.label,
      snapshot,
    });
    await match.save();
    return packed(orm, match, host.id);
  },
});

linesGroup.addAction("join", {
  label: "Join a challenge",
  authRequired: false,
  mutates: true,
  params: [
    { key: "code", type: "DataField", required: true },
    { key: "handle", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const player = await upsertPlayer(orm, String(params.playerId), params.handle);
    const matchRow = await loadMatch(orm, String(params.code));
    const match = asMatch(matchRow);
    const sitting = match.players.find((seat) => seat.id === player.$playerId);
    if (!sitting) {
      if (match.players.filter((seat) => seat.kind === "human").length >= 2) {
        raiseServerException(400, "That challenge is full");
      }
      if (match.players.some((seat) => seat.kind === "house")) {
        raiseServerException(400, "That table is already sat");
      }
      match.players.push({
        id: player.$playerId,
        name: player.$handle,
        kind: "human",
        lockedAt: null,
        picks: emptyPicks(match.fixtures),
      });
      matchRow.$snapshot = match;
      await matchRow.save();
    }
    return packed(orm, matchRow, player.$playerId);
  },
});

linesGroup.addAction("get", {
  label: "Load a challenge",
  authRequired: false,
  mutates: false,
  params: [
    { key: "code", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const matchRow = await loadMatch(orm, String(params.code));
    return packed(orm, matchRow, String(params.playerId));
  },
});

linesGroup.addAction("lock", {
  label: "Lock the card",
  authRequired: false,
  mutates: true,
  params: [
    { key: "code", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
    { key: "picks", type: "JSONField", required: true },
  ],
  async action({ orm, params }) {
    const matchRow = await loadMatch(orm, String(params.code));
    let match = asMatch(matchRow);
    const playerId = String(params.playerId);
    const you = match.players.find((seat) => seat.id === playerId);
    if (!you) raiseServerException(403, "You are not in this challenge");
    if (you.lockedAt) raiseServerException(400, "Card already locked");
    if (bookOpen(match.linesRevealAt) && !you.lockedAt) {
      raiseServerException(400, "The window closed. You needed to lock in 24 hours.");
    }
    const picks = sanitizePicks(match.fixtures, params.picks);
    if (Object.keys(picks).length !== match.fixtures.length) {
      raiseServerException(400, "Slide every game before you lock");
    }
    match = lockSeat(match, playerId, picks, new Date().toISOString());
    matchRow.$snapshot = match;
    matchRow.$status = bookOpen(match.linesRevealAt)
      ? "revealed"
      : bothLocked(match.players)
      ? "waiting"
      : "open";
    await matchRow.save();
    return packed(orm, matchRow, playerId);
  },
});

linesGroup.addAction("dropLines", {
  label: "Drop the lines (demo)",
  authRequired: false,
  mutates: true,
  params: [
    { key: "code", type: "DataField", required: true },
    { key: "playerId", type: "DataField", required: true },
  ],
  async action({ orm, inCloud, params }) {
    if (inCloud.config?.core?.cloud_mode === "production") {
      raiseServerException(403, "Lines drop on the clock");
    }
    const matchRow = await loadMatch(orm, String(params.code));
    let match = asMatch(matchRow);
    if (match.hostId !== params.playerId) raiseServerException(403, "Only the host can drop the lines");
    const at = new Date().toISOString();
    match = revealNow(match, at);
    matchRow.$snapshot = match;
    matchRow.$status = "revealed";
    await matchRow.save();
    const week = await loadWeek(orm, match.season, match.week);
    week.$linesRevealAt = at;
    week.$status = "revealed";
    await week.save();
    await writeSeries(orm, match, at);
    return packed(orm, matchRow, String(params.playerId));
  },
});

linesGroup.addAction("season", {
  label: "Season desk",
  authRequired: false,
  mutates: false,
  params: [
    { key: "playerId", type: "DataField", required: true },
  ],
  async action({ orm, params }) {
    const player = await orm.findEntry("linesPlayer", [{
      field: "playerId",
      op: "=",
      value: String(params.playerId),
    }]);
    const week = publicWeek(await loadWeek(orm));
    return {
      handle: player?.$handle ?? null,
      wins: player?.$wins ?? 0,
      losses: player?.$losses ?? 0,
      ties: player?.$ties ?? 0,
      week,
    };
  },
});
