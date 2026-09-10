export type SeatKind = "human" | "house";

export type PublicTeam = {
  id: string;
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
  status: "open" | "waiting" | "revealed";
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
    kickoffLabel: string;
    network: string;
    venue: string;
    note?: string;
    away: PublicTeam;
    home: PublicTeam;
  }>;
};
