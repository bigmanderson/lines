<script setup lang="ts">
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { joinMatch, lines, setHandle, setJoinCode } from "@/store";

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const code = String(route.params.code || "").toUpperCase();
  if (code) setJoinCode(code);
});

async function sit() {
  const match = await joinMatch(String(route.params.code || lines.joinCode));
  if (match) await router.push("/play");
}
</script>

<template>
  <main class="shell">
    <p class="kicker">YOU'RE INVITED</p>
    <h1 class="brand">SIT</h1>
    <p class="lead">Enter your handle and take the other seat. 24 hours to lock. Don't open ESPN.</p>
    <section class="panel">
      <label class="field">
        <span>Handle</span>
        <input :value="lines.handle" placeholder="SIMMONS" @input="setHandle(($event.target as HTMLInputElement).value)" />
      </label>
      <label class="field">
        <span>Match code</span>
        <input :value="lines.joinCode" placeholder="AB3K" @input="setJoinCode(($event.target as HTMLInputElement).value)" />
      </label>
      <button class="btn btn-lime" type="button" :disabled="lines.busy" @click="sit">Take the other seat</button>
      <p class="muted">Same PIN as your account if you already play LINES.</p>
    </section>
    <p v-if="lines.notice" class="muted">{{ lines.notice }}</p>
  </main>
</template>
