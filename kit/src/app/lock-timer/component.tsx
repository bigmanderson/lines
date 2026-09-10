import { kicker, panel, timer, muted } from "../style.ts";
import { remainingLabel, useLines } from "../state.ts";

const locked = $(() => Boolean(useLines.match.get()?.you?.locked));
const status = $(() => useLines.match.get()?.status ?? "open");

<YStack style={panel}>
  <Text style={kicker}>{$(() => locked.get() ? "CARD LOCKED" : "LINES DROP IN")}</Text>
  <Text style={timer}>{remainingLabel}</Text>
  <Text style={muted}>
    {$(() => {
      if (status.get() === "revealed") return "Book is out. Closest to the number takes each game.";
      if (locked.get()) return "You're in. Hide this tab. Don't peek ESPN. Wait for the book.";
      return "You have 24 hours from the drop. Lock every game. No take-backs.";
    })}
  </Text>
</YStack>
