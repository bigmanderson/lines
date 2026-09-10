import { gameCard, muted, scorePill, win } from "../style.ts";
import { useLines } from "../state.ts";
import { handleDraft } from "../handler.ts";
import { pickLabel } from "../../game/helper.ts";
import { LineSlider } from "../line-slider/component.tsx";

const game = $(() => read(props.game));
const spread = $(() => useLines.drafts.get()?.[game.get()?.id] ?? 0);
const revealed = $(() => game.get()?.line != null);
const winner = $(() => game.get()?.winner);

<YStack
  style={$(() => ({
    web: {
      ...gameCard.web,
      ...(winner.get() === "you" ? win.web : {}),
    },
  }))}
>
  <XStack style={{ web: { width: "100%", justifyContent: "space-between", alignItems: "center" } }}>
    <Text style={muted}>{$(() => `${game.get()?.kickoffLabel} · ${game.get()?.network}`)}</Text>
    <Show when={$(() => Boolean(game.get()?.note))}>
      <Text style={scorePill}>{$(() => game.get()?.note)}</Text>
    </Show>
  </XStack>
  <Text style={muted}>{$(() => game.get()?.venue)}</Text>
  <LineSlider
    away={$(() => game.get()?.away)}
    home={$(() => game.get()?.home)}
    value={spread}
    on:change={(value: number) => handleDraft(game.get()?.id, value)}
  />
  <Show when={revealed}>
    <YStack gap="4px">
      <Text style={scorePill}>
        {$(() => `VEGAS ${pickLabel(game.get()?.away.abbr, game.get()?.home.abbr, game.get()?.line ?? 0)}`)}
      </Text>
      <Show when={$(() => game.get()?.rivalPick != null)}>
        <Text style={muted}>
          {$(() => {
            const row = game.get();
            const rival = useLines.match.get()?.rival?.name ?? "Rival";
            return `${rival} ${pickLabel(row.away.abbr, row.home.abbr, row.rivalPick ?? 0)} · you ${row.yourDistance ?? "—"} off, they ${row.rivalDistance ?? "—"} off`;
          })}
        </Text>
      </Show>
      <Show when={$(() => winner.get() === "you")}>
        <Text style={scorePill}>YOU TAKE IT</Text>
      </Show>
      <Show when={$(() => winner.get() === "rival")}>
        <Text style={muted}>They were closer</Text>
      </Show>
      <Show when={$(() => winner.get() === "tie")}>
        <Text style={muted}>Push</Text>
      </Show>
    </YStack>
  </Show>
</YStack>
