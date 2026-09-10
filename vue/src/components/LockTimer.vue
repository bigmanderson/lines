<script setup lang="ts">
import { computed } from "vue";
import { lines, remainingLabel } from "@/store";

const locked = computed(() => Boolean(lines.match?.you?.locked));
const status = computed(() => lines.match?.status ?? "open");
const copy = computed(() => {
  if (status.value === "revealed") return "Book is out. Closest to the number takes each game.";
  if (locked.value) return "You're in. Hide this tab. Don't peek ESPN. Wait for the book.";
  return "You have 24 hours from the drop. Lock every game. No take-backs.";
});
</script>

<template>
  <section class="panel">
    <p class="kicker">{{ locked ? "CARD LOCKED" : "LINES DROP IN" }}</p>
    <p class="timer">{{ remainingLabel }}</p>
    <p class="muted">{{ copy }}</p>
  </section>
</template>
