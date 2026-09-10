export type TeamId =
  | "ARI"
  | "ATL"
  | "BAL"
  | "BUF"
  | "CAR"
  | "CHI"
  | "CIN"
  | "CLE"
  | "DAL"
  | "DEN"
  | "DET"
  | "GB"
  | "HOU"
  | "IND"
  | "JAX"
  | "KC"
  | "LAC"
  | "LAR"
  | "LV"
  | "MIA"
  | "MIN"
  | "NE"
  | "NO"
  | "NYG"
  | "NYJ"
  | "PHI"
  | "PIT"
  | "SEA"
  | "SF"
  | "TB"
  | "TEN"
  | "WAS";

export type Team = {
  id: TeamId;
  city: string;
  name: string;
  abbr: string;
  espn: string;
  color: string;
  color2: string;
};

export type Fixture = {
  id: string;
  week: number;
  season: number;
  kickoff: string;
  kickoffLabel: string;
  network: string;
  venue: string;
  away: TeamId;
  home: TeamId;
  note?: string;
};

export type LinedFixture = Fixture & {
  line: number;
  hasLine?: boolean;
};
