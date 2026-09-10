import { Field, TextField } from "../../ui.ts";
import { brand, kicker, lead, lockAction, muted, page, panel, shell } from "../../style.ts";
import { useLines } from "../../state.ts";
import { handleJoin } from "../../handler.ts";

const code = $(() => GlobalRoute.params.get()?.code ?? useLines.joinCode.get());

<View
  style={page}
  on:mount={() => {
    const next = String(GlobalRoute.params.get()?.code || "").toUpperCase();
    if (next) useLines.joinCode.set(next);
  }}
>
  <YStack style={shell}>
    <Text style={kicker}>YOU'RE INVITED</Text>
    <Text style={brand}>SIT</Text>
    <Text style={lead}>Enter your handle and take the other seat. 24 hours to lock. Don't open ESPN.</Text>
    <YStack style={panel}>
      <Field label="Handle">
        <TextField value={useLines.handle} placeholder="SIMMONS" />
      </Field>
      <Field label="Match code">
        <TextField value={useLines.joinCode} placeholder="AB3K" />
      </Field>
      <Button style={lockAction} on:tap={() => handleJoin(code.get())}>Take the other seat</Button>
      <Text style={muted}>Same PIN as your account if you already play LINES.</Text>
    </YStack>
    <Show when={$(() => !!useLines.notice.get())}>
      <Text style={muted}>{useLines.notice}</Text>
    </Show>
  </YStack>
</View>
