import type { LinedFixture } from "../nfl/type.ts";
import { publicTeam } from "./helper.ts";
import { bothLocked, bookOpen, distance, remainingMs, winnerForGame } from "./helper.ts";
import type { GameResult, MatchState, PublicGame, PublicMatch, Seat } from "./type.ts";

export function scoreMatch(match: MatchState): GameResult[] {
  const [left, right] = match.players;
  return match.fixtures.map((fixture) => {
    const a = left?.picks[fixture.id] ?? null;
    const b = right?.picks[fixture.id] ?? null;
    const verdict = winnerForGame(a, b, fixture.line);
    const winnerId = verdict === "a"
      ? left.id
      : verdict === "b"
      ? right.id
      : verdict;
    const distances: Record<string, number> = {};
    if (left && a != null) distances[left.id] = distance(a, fixture.line);
    if (right && b != null) distances[right.id] = distance(b, fixture.line);
    return {
      fixtureId: fixture.id,
      winnerId,
      line: fixture.line,
      distances,
    };
  });
}

export function weekScore(results: GameResult[], playerId: string, rivalId: string) {
  let you = 0;
  let rival = 0;
  let ties = 0;
  for (const row of results) {
    if (row.winnerId === playerId) you += 1;
    else if (row.winnerId === rivalId) rival += 1;
    else if (row.winnerId === "tie") ties += 1;
  }
  return { you, rival, ties };
}

export function publicMatch(
  match: MatchState,
  playerId: string,
  now = Date.now(),
  seasonSeries: PublicMatch["seasonSeries"] = null,
): PublicMatch {
  const you = match.players.find((seat) => seat.id === playerId) ?? null;
  const rival = match.players.find((seat) => seat.id !== playerId) ?? null;
  const revealBook = bookOpen(match.linesRevealAt, now);
  const revealPicks = revealBook;
  const results = revealBook ? (match.results ?? scoreMatch(match)) : null;
  const status: PublicMatch["status"] = revealBook
    ? "revealed"
    : bothLocked(match.players)
    ? "waiting"
    : "open";

  return {
    code: match.code,
    status,
    weekLabel: match.label,
    season: match.season,
    week: match.week,
    opensAt: match.opensAt,
    linesRevealAt: match.linesRevealAt,
    now: new Date(now).toISOString(),
    remainingMs: remainingMs(match.linesRevealAt, now),
    invitePath: `/g/${match.code}`,
    you: you ? { id: you.id, name: you.name, locked: Boolean(you.lockedAt) } : null,
    rival: rival
      ? { id: rival.id, name: rival.name, locked: Boolean(rival.lockedAt), kind: rival.kind }
      : null,
    games: match.fixtures.map((fixture) =>
      publicGame(fixture, you, rival, revealPicks, revealBook, results, playerId)
    ),
    score: results && rival ? weekScore(results, playerId, rival.id) : null,
    seasonSeries,
    canDropLines: !revealBook && match.hostId === playerId,
  };
}

function publicGame(
  fixture: LinedFixture,
  you: Seat | null,
  rival: Seat | null,
  revealPicks: boolean,
  revealBook: boolean,
  results: GameResult[] | null,
  playerId: string,
): PublicGame {
  const result = results?.find((row) => row.fixtureId === fixture.id) ?? null;
  const yourPick = you?.lockedAt ? you.picks[fixture.id] ?? null : null;
  const rivalPick = revealPicks && rival?.lockedAt ? rival.picks[fixture.id] ?? null : null;
  let winner: PublicGame["winner"] = null;
  if (result?.winnerId === playerId) winner = "you";
  else if (result && rival && result.winnerId === rival.id) winner = "rival";
  else if (result?.winnerId === "tie") winner = "tie";

  return {
    id: fixture.id,
    kickoff: fixture.kickoff,
    kickoffLabel: fixture.kickoffLabel,
    network: fixture.network,
    venue: fixture.venue,
    note: fixture.note,
    away: publicTeam(fixture.away),
    home: publicTeam(fixture.home),
    yourPick,
    rivalPick,
    line: revealBook ? fixture.line : null,
    winner,
    yourDistance: result && you ? result.distances[you.id] ?? null : null,
    rivalDistance: result && rival ? result.distances[rival.id] ?? null : null,
  };
}

export function lockSeat(match: MatchState, playerId: string, picks: Record<string, number>, at: string): MatchState {
  const next: MatchState = {
    ...match,
    players: match.players.map((seat) => {
      if (seat.id !== playerId) return seat;
      if (seat.lockedAt) return seat;
      return { ...seat, lockedAt: at, picks };
    }),
  };
  if (bookOpen(next.linesRevealAt, new Date(at).getTime())) {
    next.results = scoreMatch(next);
  }
  return next;
}

export function revealNow(match: MatchState, at: string): MatchState {
  const next: MatchState = { ...match, linesRevealAt: at };
  next.results = scoreMatch(next);
  return next;
}
