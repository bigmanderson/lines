<script setup lang="ts">
import { computed } from "vue";
import { pickLabel } from "@/game/helper";
import { SPREAD_MAX, SPREAD_MIN, SPREAD_STEP } from "@/game/helper";
import type { PublicTeam } from "@/game/type";
import TeamMark from "./TeamMark.vue";

const props = defineProps<{
  away: PublicTeam;
  home: PublicTeam;
  modelValue: number;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

const call = computed(() => pickLabel(props.away.abbr, props.home.abbr, props.modelValue));

function onInput(event: Event) {
  const value = Number((event.target as HTMLInputElement).value);
  emit("update:modelValue", value);
}
</script>

<template>
  <div class="line-slider">
    <p class="pick-call">{{ call }}</p>
    <div class="row">
      <TeamMark :team="away" :size="48" />
      <label class="slider">
        <input
          type="range"
          :min="SPREAD_MIN"
          :max="SPREAD_MAX"
          :step="SPREAD_STEP"
          :value="modelValue"
          :disabled="readonly"
          @input="onInput"
        />
      </label>
      <TeamMark :team="home" :size="48" />
    </div>
    <div class="spread-row">
      <span>{{ away.abbr }}</span>
      <span>{{ home.abbr }}</span>
    </div>
  </div>
</template>
