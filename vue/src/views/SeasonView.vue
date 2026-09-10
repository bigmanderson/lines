<script setup lang="ts">
import { onMounted } from "vue";
import { lines, loadSeason } from "@/store";

onMounted(() => {
  void loadSeason();
});
</script>

<template>
  <main class="shell">
    <nav class="nav">
      <router-link class="btn btn-ghost" to="/">Lobby</router-link>
      <span class="pill">{{ lines.handle || "GUEST" }}</span>
    </nav>
    <p class="kicker">SEASON SERIES</p>
    <h1 class="brand">{{ lines.wins }}–{{ lines.losses }}</h1>
    <p class="lead">Weeks won vs weeks lost. Pushes sit on the side.</p>
    <section class="panel">
      <p class="muted">{{ lines.ties }} weeks pushed</p>
      <p class="muted">{{ lines.week?.label ?? "This week" }}</p>
      <p class="muted">Every rivalry is stored. Same friend, all 18 weeks.</p>
    </section>
  </main>
</template>
