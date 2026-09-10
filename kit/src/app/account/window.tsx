import { Field, Link, TextField } from "../ui.ts";
import { brand, kicker, lead, muted, navRow, page, panel, primaryAction, quietAction, shell } from "../style.ts";
import { useLines } from "../state.ts";
import { handleLogin, handleRegister } from "../handler.ts";

<View style={page}>
  <YStack style={shell}>
    <XStack style={navRow}>
      <Link unstyled to="/" style={quietAction}>Lobby</Link>
    </XStack>
    <Text style={kicker}>CLAIM YOUR SEAT</Text>
    <Text style={brand}>ACCOUNT</Text>
    <Text style={lead}>A handle and a PIN is the whole account. Invite links do the rest.</Text>
    <YStack style={panel}>
      <Field label="Handle">
        <TextField value={useLines.handle} placeholder="SIMMONS" />
      </Field>
      <Field label="PIN">
        <TextField value={useLines.pin} placeholder="0000" />
      </Field>
      <Button style={primaryAction} on:tap={handleRegister}>Create account</Button>
      <Button style={quietAction} on:tap={handleLogin}>Sign in</Button>
      <Text style={muted}>{$(() => useLines.notice.get())}</Text>
    </YStack>
  </YStack>
</View>
