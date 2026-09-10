<script setup lang="ts">
import { NFL_TEAMS, teamLogo } from "@/nfl/teams";

const loop = [...NFL_TEAMS, ...NFL_TEAMS];
</script>

<template>
  <div class="ticker">
    <div class="ticker-track">
      <div
        v-for="(team, index) in loop"
        :key="`${team.id}-${index}`"
        class="mark"
        :style="{ width: '36px', height: '36px', boxShadow: `0 0 0 2px ${team.color}` }"
      >
        <img :src="teamLogo(team.espn)" :alt="team.id" />
      </div>
    </div>
  </div>
</template>
