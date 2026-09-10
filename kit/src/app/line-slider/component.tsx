import { Slider } from "../ui.ts";
import { pickCall } from "../style.ts";
import { pickLabel } from "../../game/helper.ts";
import { TeamMark } from "../team-mark/component.tsx";
import { SPREAD_MAX, SPREAD_MIN, SPREAD_STEP } from "../../nfl/const.ts";

const away = $(() => read(props.away));
const home = $(() => read(props.home));
const spread = $(() => {
  const value = read(props.value);
  return typeof value === "number" ? value : 0;
});
const call = $(() => pickLabel(away.get()?.abbr ?? "", home.get()?.abbr ?? "", spread.get()));

<YStack gap="8px">
  <Text style={pickCall}>{call}</Text>
  <XStack style={{ web: { width: "100%", alignItems: "center", gap: "0.65rem" } }}>
    <TeamMark team={away} size={48} />
    <YStack style={{ web: { flex: "1", minWidth: "0" } }}>
      <Slider
        min={SPREAD_MIN}
        max={SPREAD_MAX}
        step={SPREAD_STEP}
        value={spread}
        format="bare"
        size="lg"
        radius="full"
        on:input={(value: number) => props.onChange?.(value)}
      />
    </YStack>
    <TeamMark team={home} size={48} />
  </XStack>
  <XStack style={{ web: { width: "100%", justifyContent: "space-between" } }}>
    <Text style={{ web: { margin: "0", fontSize: "0.72rem", color: "rgba(246,243,234,0.5)", fontFamily: "IBM Plex Mono, monospace" } }}>{$(() => away.get()?.abbr)}</Text>
    <Text style={{ web: { margin: "0", fontSize: "0.72rem", color: "rgba(246,243,234,0.5)", fontFamily: "IBM Plex Mono, monospace" } }}>{$(() => home.get()?.abbr)}</Text>
  </XStack>
</YStack>
