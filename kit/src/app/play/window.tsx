import { Link } from "../ui.ts";
import { brand, kicker, lead, lockAction, muted, navRow, page, panel, quietAction, scorePill, shell } from "../style.ts";
import { canSlide, useLines } from "../state.ts";
import { copyInvite, handleDropLines, handleLock, handleRefresh } from "../handler.ts";
import { LockTimer } from "../lock-timer/component.tsx";
import { LineCard } from "../line-card/component.tsx";

<View style={page} on:mount={handleRefresh}>
  <YStack style={shell}>
    <XStack style={navRow}>
      <Link unstyled to="/" style={quietAction}>Lobby</Link>
      <Text style={scorePill}>{$(() => useLines.match.get()?.code || "—")}</Text>
    </XStack>

    <YStack gap="6px">
      <Text style={kicker}>{$(() => useLines.match.get()?.weekLabel ?? "WEEK 1")}</Text>
      <Text style={brand}>THE CARD</Text>
      <Text style={lead}>
        {$(() => {
          const match = useLines.match.get();
          if (!match) return "Opening the slate…";
          if (!match.rival) return "Share the invite. Don't lock until they sit — or lock now and wait.";
          return `${match.you?.name ?? "YOU"} vs ${match.rival.name}`;
        })}
      </Text>
    </YStack>

    <LockTimer />

    <Show when={$(() => !useLines.match.get()?.rival)}>
      <YStack style={panel}>
        <Text style={kicker}>INVITE LINK</Text>
        <Text style={lead}>{$(() => `${globalThis.location.origin}${useLines.match.get()?.invitePath ?? ""}`)}</Text>
        <Button style={quietAction} on:tap={copyInvite}>Copy invite</Button>
      </YStack>
    </Show>

    <Show when={$(() => !!useLines.match.get()?.score)}>
      <YStack style={panel}>
        <Text style={kicker}>WEEK TALLY</Text>
        <Text style={brand}>
          {$(() => {
            const score = useLines.match.get()?.score;
            return `${score?.you ?? 0}–${score?.rival ?? 0}`;
          })}
        </Text>
        <Text style={muted}>{$(() => `${useLines.match.get()?.score?.ties ?? 0} pushes`)}</Text>
      </YStack>
    </Show>

    <List each={$(() => useLines.match.get()?.games ?? [])} track="id">
      {(row: any) => <LineCard game={row} />}
    </List>

    <Show when={canSlide}>
      <Button style={lockAction} on:tap={handleLock}>Lock the card</Button>
    </Show>
    <Show when={$(() => Boolean(useLines.match.get()?.canDropLines && useLines.match.get()?.you?.locked))}>
      <Button style={quietAction} on:tap={handleDropLines}>Drop the lines (demo)</Button>
    </Show>
    <Show when={$(() => !!useLines.notice.get())}>
      <Text style={muted}>{useLines.notice}</Text>
    </Show>
  </YStack>
</View>
