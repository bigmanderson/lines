import { parseScoreboard, teamIdFromEspn, teamIdFromEspnId } from "./espn.ts";

Deno.test("WSH maps to WAS", () => {
  if (teamIdFromEspn("WSH") !== "WAS") throw new Error("WSH should be WAS");
  if (teamIdFromEspn("wsh") !== "WAS") throw new Error("wsh should be WAS");
  if (teamIdFromEspn("SEA") !== "SEA") throw new Error("SEA");
  if (teamIdFromEspnId("28") !== "WAS") throw new Error("ESPN id 28 is WAS");
});

Deno.test("ESPN scoreboard becomes home-relative fixtures", () => {
  const parsed = parseScoreboard({
    season: { year: 2026, type: 2 },
    week: { number: 1 },
    events: [{
      date: "2026-09-15T00:20:00.000Z",
      competitions: [{
        date: "2026-09-15T00:20:00.000Z",
        venue: { fullName: "Empower Field" },
        broadcasts: [{ names: ["ESPN"] }],
        odds: [{ details: "KC -1", spread: -1 }],
        competitors: [
          { homeAway: "home", team: { abbreviation: "KC" } },
          { homeAway: "away", team: { abbreviation: "DEN" } },
        ],
      }],
    }, {
      date: "2026-09-13T17:00:00.000Z",
      competitions: [{
        date: "2026-09-13T17:00:00.000Z",
        venue: { fullName: "Lucas Oil Stadium" },
        broadcasts: [{ names: ["CBS"] }],
        odds: [{ details: "BAL -3.5", spread: 3.5 }],
        competitors: [
          { homeAway: "home", team: { abbreviation: "IND" } },
          { homeAway: "away", team: { abbreviation: "BAL" } },
        ],
      }],
    }],
  });
  if (!parsed) throw new Error("parse failed");
  if (parsed.season !== 2026 || parsed.week !== 1) throw new Error("week");
  if (parsed.fixtures.length !== 2) throw new Error("count");
  if (parsed.missingOdds !== 0) throw new Error("odds");
  const denver = parsed.fixtures.find((row) => row.id === "2026-w1-den-kc");
  if (!denver || denver.line !== -1) throw new Error("Chiefs favorite should be negative");
  const raven = parsed.fixtures.find((row) => row.id === "2026-w1-bal-ind");
  if (!raven || raven.line !== 3.5) throw new Error("away favorite should be positive");
});
