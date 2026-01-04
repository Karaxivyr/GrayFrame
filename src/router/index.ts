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
  // No separate /theme route — Theme & Colors lives inside the Settings page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Optional: reflect route title from meta if you use it elsewhere
router.afterEach((to) => {
  if (to.meta?.title) document.title = String(to.meta.title);
});

export default router;
