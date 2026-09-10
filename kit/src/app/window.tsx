import { Field, Link, TextField } from "./ui.ts";
import { brand, kicker, lead, lockAction, muted, page, panel, primaryAction, quietAction, shell, ticker } from "./style.ts";
import { useLines } from "./state.ts";
import { handleCreate, handleJoin, handleLoadWeek, handleRegister } from "./handler.ts";
import { TeamMark } from "./team-mark/component.tsx";
import { NFL_TEAMS } from "../nfl/const.ts";

const teams = Object.values(NFL_TEAMS);

<View style={page} on:mount={handleLoadWeek}>
  <YStack style={shell}>
    <YStack gap="10px">
      <Text style={kicker}>BILL SIMMONS RULES · NO PEEKING</Text>
      <Text style={brand}>LINES</Text>
      <Text style={lead}>Guess every Vegas number before the book drops. Closest to the spread takes the game. Most games takes the week. You vs a friend. All season.</Text>
    </YStack>

    <XStack style={ticker}>
      <List each={teams} track="id">
        {(row: typeof teams[number]) => (
          <TeamMark
            team={{
              id: row.id,
              city: row.city,
              name: row.name,
              abbr: row.abbr,
              color: row.color,
              color2: row.color2,
              logo: `https://a.espncdn.com/i/teamlogos/nfl/500/${row.espn}.png`,
            }}
            size={36}
          />
        )}
      </List>
    </XStack>

    <YStack style={panel}>
      <Text style={kicker}>YOUR HANDLE</Text>
      <Field label="Handle">
        <TextField value={useLines.handle} placeholder="SIMMONS" />
      </Field>
      <Field label="4-digit PIN">
        <TextField value={useLines.pin} placeholder="0000" />
      </Field>
      <Button style={quietAction} on:tap={handleRegister}>Create account</Button>
      <Text style={muted}>Same handle + PIN claims your season on another phone.</Text>
    </YStack>

    <YStack style={panel}>
      <Text style={kicker}>{$(() => useLines.week.get()?.label ?? "WEEK 1 · 2026")}</Text>
      <Text style={muted}>{$(() => `${useLines.week.get()?.fixtureCount ?? 16} games. 24 hours on the clock.`)}</Text>
      <Button style={lockAction} on:tap={() => handleCreate("friend")}>Challenge a friend</Button>
      <Button style={primaryAction} on:tap={() => handleCreate("house")}>Play Vegas Vic</Button>
    </YStack>

    <YStack style={panel}>
      <Text style={kicker}>GOT AN INVITE?</Text>
      <Field label="Match code">
        <TextField value={useLines.joinCode} placeholder="AB3K" />
      </Field>
      <Button style={quietAction} on:tap={() => handleJoin()}>Join table</Button>
      <XStack style={{ web: { gap: "0.5rem" } }}>
        <Link unstyled to="/season" style={quietAction}>Season</Link>
        <Link unstyled to="/account" style={quietAction}>Account</Link>
      </XStack>
    </YStack>

    <Show when={$(() => !!useLines.notice.get())}>
      <Text style={muted}>{useLines.notice}</Text>
    </Show>
  </YStack>
</View>
