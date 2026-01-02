import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "overview",
    component: () => import("../pages/overviewPage.vue"),
  },
  {
    path: "/settings",
    name: "settings",
    component: () => import("../pages/settingsPage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
