<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import TeamTicker from "@/components/TeamTicker.vue";
import { createMatch, joinMatch, lines, loadWeek, register, setHandle, setJoinCode, setPin } from "@/store";

const router = useRouter();

onMounted(() => {
  void loadWeek();
});

async function challenge() {
  const match = await createMatch("friend");
  if (match) await router.push("/play");
}

async function vic() {
  const match = await createMatch("house");
  if (match) await router.push("/play");
}

async function sit() {
  const match = await joinMatch();
  if (match) await router.push("/play");
}
</script>

<template>
  <main class="shell">
    <header>
      <p class="kicker">BILL SIMMONS RULES · NO PEEKING</p>
      <h1 class="brand">LINES</h1>
      <p class="lead">
        Guess every Vegas number before the book drops. Closest to the spread takes the game.
        Most games takes the week. You vs a friend. All season.
      </p>
    </header>

    <TeamTicker />

    <section class="panel">
      <p class="kicker">YOUR HANDLE</p>
      <label class="field">
        <span>Handle</span>
        <input :value="lines.handle" placeholder="SIMMONS" @input="setHandle(($event.target as HTMLInputElement).value)" />
      </label>
      <label class="field">
        <span>4-digit PIN</span>
        <input :value="lines.pin" inputmode="numeric" placeholder="0000" @input="setPin(($event.target as HTMLInputElement).value)" />
      </label>
      <button class="btn btn-ghost" type="button" @click="register">Create account</button>
      <p class="muted">Same handle + PIN claims your season on another phone.</p>
    </section>

    <section class="panel">
      <p class="kicker">{{ lines.week?.label ?? "THIS WEEK" }}</p>
      <p class="muted">{{ lines.week?.fixtureCount ?? "—" }} games. 24 hours on the clock.</p>
      <button class="btn btn-lime" type="button" :disabled="lines.busy" @click="challenge">Challenge a friend</button>
      <button class="btn btn-gold" type="button" :disabled="lines.busy" @click="vic">Play Vegas Vic</button>
    </section>

    <section class="panel">
      <p class="kicker">GOT AN INVITE?</p>
      <label class="field">
        <span>Match code</span>
        <input :value="lines.joinCode" placeholder="AB3K" @input="setJoinCode(($event.target as HTMLInputElement).value)" />
      </label>
      <button class="btn btn-ghost" type="button" :disabled="lines.busy" @click="sit">Join table</button>
      <div class="row">
        <router-link class="btn btn-ghost" to="/season">Season</router-link>
        <router-link class="btn btn-ghost" to="/account">Account</router-link>
      </div>
    </section>

    <p v-if="lines.notice" class="muted">{{ lines.notice }}</p>
  </main>
</template>
