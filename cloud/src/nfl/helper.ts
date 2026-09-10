import { NFL_TEAMS, WEEK1_2026, WEEK1_2026_LINES } from "./const.ts";
import type { LinedFixture, Team, TeamId } from "./type.ts";

export function team(id: TeamId): Team {
  return NFL_TEAMS[id];
}

export function teamLogo(id: TeamId): string {
  return `https://a.espncdn.com/i/teamlogos/nfl/500/${NFL_TEAMS[id].espn}.png`;
}

export function teamWordmark(id: TeamId): string {
  const row = NFL_TEAMS[id];
  return `${row.city} ${row.name}`;
}

export function linedWeek1(): LinedFixture[] {
  return WEEK1_2026.map((fixture) => ({
    ...fixture,
    line: WEEK1_2026_LINES[fixture.id] ?? 0,
  }));
}
