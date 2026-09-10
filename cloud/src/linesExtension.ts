import { defineExtension } from "@inspatial/cloud";
import { linesGroup } from "./api/linesGroup.ts";
import { linesMatch } from "./entries/linesMatch.ts";
import { linesPlayer } from "./entries/linesPlayer.ts";
import { linesRivalry } from "./entries/linesRivalry.ts";
import { nflWeek } from "./entries/nflWeek.ts";
import { ensureLocalAdmin } from "./seed/ensureLocalAdmin.ts";
import { ensureSyncSchedule } from "./seed/ensureSyncSchedule.ts";
import { ensureWeek } from "./seed/ensureWeek.ts";
import { vueCors } from "./serve/vueCors.ts";

export const linesExtension = defineExtension("lines", {
  label: "LINES",
  description: "Guess the Vegas lines. Closest to the number takes the game.",
  icon: "game",
  entryTypes: [linesPlayer, nflWeek, linesMatch, linesRivalry],
  apiGroups: [linesGroup],
  middleware: [vueCors],
  afterGlobalMigrate: [{
    name: "ensureLocalAdmin",
    action: ensureLocalAdmin,
  }, {
    name: "ensureWeek",
    action: ensureWeek,
  }, {
    name: "ensureSyncSchedule",
    action: ensureSyncSchedule,
  }],
  boot: [{
    name: "ensureLocalAdmin",
    action: async (inCloud) => {
      await ensureLocalAdmin({ orm: inCloud.orm });
    },
  }, {
    name: "ensureWeek",
    action: async (inCloud) => {
      await ensureWeek({ orm: inCloud.orm });
    },
  }, {
    name: "ensureSyncSchedule",
    action: async (inCloud) => {
      await ensureSyncSchedule({ orm: inCloud.orm });
    },
  }],
});
