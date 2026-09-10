<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import LineCard from "@/components/LineCard.vue";
import LockTimer from "@/components/LockTimer.vue";
import { canSlide, copyInvite, dropLines, lines, lockCard, refreshMatch } from "@/store";

const origin = location.origin;
let timer = 0;

onMounted(() => {
  void refreshMatch();
  timer = window.setInterval(() => {
    void refreshMatch();
  }, 2500);
});

onUnmounted(() => {
  window.clearInterval(timer);
});
</script>

<template>
  <main class="shell">
    <nav class="nav">
      <router-link class="btn btn-ghost" to="/">Lobby</router-link>
      <span class="pill">{{ lines.match?.code || "—" }}</span>
    </nav>

    <header>
      <p class="kicker">{{ lines.match?.weekLabel ?? "THIS WEEK" }}</p>
      <h1 class="brand">THE CARD</h1>
      <p class="lead">
        <template v-if="!lines.match">Opening the slate…</template>
        <template v-else-if="!lines.match.rival">
          Share the invite. Don't lock until they sit — or lock now and wait.
        </template>
        <template v-else>
          {{ lines.match.you?.name ?? "YOU" }} vs {{ lines.match.rival.name }}
        </template>
      </p>
    </header>

    <LockTimer />

    <section v-if="lines.match && !lines.match.rival" class="panel">
      <p class="kicker">INVITE LINK</p>
      <p class="lead">{{ origin }}{{ lines.match.invitePath }}</p>
      <button class="btn btn-ghost" type="button" @click="copyInvite">Copy invite</button>
    </section>

    <section v-if="lines.match?.score" class="panel">
      <p class="kicker">WEEK TALLY</p>
      <p class="brand" style="font-size: 4.2rem">{{ lines.match.score.you }}–{{ lines.match.score.rival }}</p>
      <p class="muted">{{ lines.match.score.ties }} pushes</p>
    </section>

    <LineCard v-for="game in lines.match?.games ?? []" :key="game.id" :game="game" />

    <div v-if="canSlide" class="sticky-lock">
      <button class="btn btn-lime" type="button" :disabled="lines.busy" @click="lockCard">Lock the card</button>
    </div>
    <button
      v-if="lines.match?.canDropLines && lines.match.you?.locked"
      class="btn btn-ghost"
      type="button"
      @click="dropLines"
    >
      Drop the lines (demo)
    </button>
    <p v-if="lines.notice" class="muted">{{ lines.notice }}</p>
  </main>
</template>
