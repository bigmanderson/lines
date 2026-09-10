<script setup lang="ts">
import { computed } from "vue";
import { pickLabel } from "@/game/helper";
import { canSlide, draft, lines } from "@/store";
import type { PublicGame } from "@/game/type";
import LineSlider from "./LineSlider.vue";

const props = defineProps<{
  game: PublicGame;
}>();

const spread = computed(() => lines.drafts[props.game.id] ?? 0);
const revealed = computed(() => props.game.line != null);
</script>

<template>
  <article class="game-card" :class="{ win: game.winner === 'you' }">
    <div class="meta">
      <p class="muted">{{ game.kickoffLabel }} · {{ game.network }}</p>
      <span v-if="game.note" class="pill">{{ game.note }}</span>
    </div>
    <p class="muted">{{ game.venue }}</p>
    <LineSlider
      :away="game.away"
      :home="game.home"
      :model-value="spread"
      :readonly="!canSlide"
      @update:model-value="draft(game.id, $event)"
    />
    <div v-if="revealed" class="reveal">
      <span class="pill">VEGAS {{ pickLabel(game.away.abbr, game.home.abbr, game.line ?? 0) }}</span>
      <p v-if="game.rivalPick != null" class="muted">
        {{ lines.match?.rival?.name ?? "Rival" }}
        {{ pickLabel(game.away.abbr, game.home.abbr, game.rivalPick ?? 0) }}
        · you {{ game.yourDistance ?? "—" }} off, they {{ game.rivalDistance ?? "—" }} off
      </p>
      <span v-if="game.winner === 'you'" class="pill">YOU TAKE IT</span>
      <p v-else-if="game.winner === 'rival'" class="muted">They were closer</p>
      <p v-else-if="game.winner === 'tie'" class="muted">Push</p>
    </div>
  </article>
</template>
