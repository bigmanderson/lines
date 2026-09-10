import type { Fixture, LinedFixture, TeamId } from "../nfl/type.ts";

export type PickMap = Record<string, number>;

export type SeatKind = "human" | "house";

export type Seat = {
  id: string;
  name: string;
  kind: SeatKind;
  lockedAt: string | null;
  picks: PickMap;
};

export type GameResult = {
  fixtureId: string;
  winnerId: string | "tie" | null;
  line: number;
  distances: Record<string, number>;
};

export type MatchStatus = "open" | "waiting" | "revealed";

export type MatchState = {
  code: string;
  hostId: string;
  season: number;
  week: number;
  label: string;
  opensAt: string;
  linesRevealAt: string;
  fixtures: LinedFixture[];
  players: Seat[];
  results: GameResult[] | null;
};

export type PublicTeam = {
  id: TeamId;
  city: string;
  name: string;
  abbr: string;
  color: string;
  color2: string;
  logo: string;
};

export type PublicGame = {
  id: string;
  kickoff: string;
  kickoffLabel: string;
  network: string;
  venue: string;
  note?: string;
  away: PublicTeam;
  home: PublicTeam;
  yourPick: number | null;
  rivalPick: number | null;
  line: number | null;
  winner: "you" | "rival" | "tie" | null;
  yourDistance: number | null;
  rivalDistance: number | null;
};

export type PublicMatch = {
  code: string;
  status: MatchStatus;
  weekLabel: string;
  season: number;
  week: number;
  opensAt: string;
  linesRevealAt: string;
  now: string;
  remainingMs: number;
  invitePath: string;
  you: { id: string; name: string; locked: boolean } | null;
  rival: { id: string; name: string; locked: boolean; kind: SeatKind } | null;
  games: PublicGame[];
  score: { you: number; rival: number; ties: number } | null;
  seasonSeries: { you: number; rival: number; ties: number } | null;
  canDropLines: boolean;
};

export type PublicWeek = {
  season: number;
  week: number;
  label: string;
  opensAt: string;
  linesRevealAt: string;
  now: string;
  remainingMs: number;
  fixtureCount: number;
  fixtures: Array<{
    id: string;
    week: number;
    season: number;
    kickoff: string;
    kickoffLabel: string;
    network: string;
    venue: string;
    note?: string;
    away: PublicTeam;
    home: PublicTeam;
  }>;
};
