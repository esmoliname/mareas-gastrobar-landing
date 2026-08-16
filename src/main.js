import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router/index.js";
import { applyTheme } from "./stores/settings.js";
import "./styles/main.css";

applyTheme();

createApp(App).use(createPinia()).use(router).mount("#app");