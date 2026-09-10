import { distance, pickLabel, winnerForGame } from "./helper.ts";

Deno.test("Chiefs by 3 beats Broncos by 5 when the book is Chiefs by 1", () => {
  // home KC, away DEN, line -1 (Chiefs by 1)
  // guess KC by 3 => homeSpread -3, distance 2
  // guess DEN by 5 => homeSpread +5, distance 6
  const line = -1;
  const chiefsBy3 = -3;
  const broncosBy5 = 5;
  if (distance(chiefsBy3, line) !== 2) throw new Error("Chiefs distance");
  if (distance(broncosBy5, line) !== 6) throw new Error("Broncos distance");
  if (winnerForGame(chiefsBy3, broncosBy5, line) !== "a") {
    throw new Error("Chiefs card should win");
  }
});

Deno.test("pick labels speak the way the table talks", () => {
  if (pickLabel("DEN", "KC", -3) !== "KC BY 3") throw new Error("home favorite");
  if (pickLabel("DEN", "KC", 5) !== "DEN BY 5") throw new Error("away favorite");
  if (pickLabel("DEN", "KC", 0) !== "PICK'EM") throw new Error("pickem");
});

Deno.test("equal distance is a push", () => {
  if (winnerForGame(-3, 1, -1) !== "tie") throw new Error("push");
});
