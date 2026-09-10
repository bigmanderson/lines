import { createRouter, createWebHistory } from "vue-router";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "lobby", component: () => import("./views/LobbyView.vue") },
    { path: "/play", name: "play", component: () => import("./views/PlayView.vue") },
    { path: "/g/:code", name: "join", component: () => import("./views/JoinView.vue") },
    { path: "/season", name: "season", component: () => import("./views/SeasonView.vue") },
    { path: "/account", name: "account", component: () => import("./views/AccountView.vue") },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});
