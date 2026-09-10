import { GUESS_WINDOW_MS } from "../nfl/const.ts";
import { linedWeek1 } from "../nfl/helper.ts";
import { syncNflWeeks } from "../nfl/sync.ts";

export async function ensureWeek({ orm }: { orm: any }) {
  try {
    const adminOrm = orm.withUser?.(orm.systemGobalUser) ?? orm;
    const existing = await adminOrm.findEntry("nflWeek", [{
      field: "season",
      op: "=",
      value: 2026,
    }, {
      field: "week",
      op: "=",
      value: 1,
    }]);
    if (!existing) {
      const now = Date.now();
      const week = adminOrm.getNewEntry("nflWeek");
      week.update({
        season: 2026,
        week: 1,
        label: "Week 1 · 2026",
        status: "open",
        opensAt: new Date(now).toISOString(),
        linesRevealAt: new Date(now + GUESS_WINDOW_MS).toISOString(),
        fixtures: linedWeek1(),
      });
      await week.save();
    }
    try {
      await syncNflWeeks(adminOrm);
    } catch (error) {
      console.warn("live slate pull skipped:", error);
    }
  } catch (error) {
    console.warn("ensureWeek skipped:", error);
  }
}
