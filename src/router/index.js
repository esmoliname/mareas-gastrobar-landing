import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

// Lazy loading: cada vista se descarga solo cuando se navega hacia ella.
const routes = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginView.vue"),
  },
  {
    path: "/ar-test",
    name: "ar-test",
    component: () => import("../views/ArTestView.vue"),
  },
  {
    path: "/admin",
    name: "admin",
    component: () => import("../views/AdminView.vue"),
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

// Guard global: verifica firma y expiración real del token (no solo su existencia
// en storage) antes de permitir el acceso a rutas protegidas.
router.beforeEach(async (to) => {
  const auth = useAuthStore();
  await auth.ensureValidSession();

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } };
  }

  if (to.name === "login" && auth.isAuthenticated) {
    return { path: "/admin" };
  }

  return true;
});

export default router;