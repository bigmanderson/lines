<script setup lang="ts">
import { lines, login, register, setHandle, setPin } from "@/store";
</script>

<template>
  <main class="shell">
    <nav class="nav">
      <router-link class="btn btn-ghost" to="/">Lobby</router-link>
    </nav>
    <p class="kicker">CLAIM YOUR SEAT</p>
    <h1 class="brand">ACCOUNT</h1>
    <p class="lead">A handle and a PIN is the whole account. Invite links do the rest.</p>
    <section class="panel">
      <label class="field">
        <span>Handle</span>
        <input :value="lines.handle" placeholder="SIMMONS" @input="setHandle(($event.target as HTMLInputElement).value)" />
      </label>
      <label class="field">
        <span>PIN</span>
        <input :value="lines.pin" inputmode="numeric" placeholder="0000" @input="setPin(($event.target as HTMLInputElement).value)" />
      </label>
      <button class="btn btn-gold" type="button" @click="register">Create account</button>
      <button class="btn btn-ghost" type="button" @click="login">Sign in</button>
      <p class="muted">{{ lines.notice }}</p>
    </section>
  </main>
</template>
