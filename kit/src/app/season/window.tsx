import { Link } from "../ui.ts";
import { brand, kicker, lead, muted, navRow, page, panel, quietAction, scorePill, shell } from "../style.ts";
import { useLines } from "../state.ts";
import { handleSeason } from "../handler.ts";

<View style={page} on:mount={handleSeason}>
  <YStack style={shell}>
    <XStack style={navRow}>
      <Link unstyled to="/" style={quietAction}>Lobby</Link>
      <Text style={scorePill}>{$(() => useLines.handle.get() || "GUEST")}</Text>
    </XStack>
    <Text style={kicker}>SEASON SERIES</Text>
    <Text style={brand}>{$(() => `${useLines.wins.get()}–${useLines.losses.get()}`)}</Text>
    <Text style={lead}>Weeks won vs weeks lost. Pushes sit on the side.</Text>
    <YStack style={panel}>
      <Text style={muted}>{$(() => `${useLines.ties.get()} weeks pushed`)}</Text>
      <Text style={muted}>{$(() => useLines.week.get()?.label ?? "Week 1")}</Text>
      <Text style={muted}>Every rivalry is stored. Same friend, all 18 weeks.</Text>
    </YStack>
  </YStack>
</View>
