<script setup lang="ts">
import type { PublicTeam } from "@/game/type";

defineProps<{
  team: PublicTeam;
  size?: number;
}>();
</script>

<template>
  <div
    class="mark"
    :style="{
      width: `${size || 56}px`,
      height: `${size || 56}px`,
      boxShadow: `0 0 0 2px ${team.color}`,
    }"
  >
    <img :src="team.logo" :alt="team.name" />
  </div>
</template>
