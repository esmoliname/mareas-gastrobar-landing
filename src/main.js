import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js";
import { applyTheme } from "./store/settings.js";
import "./styles/main.css";

applyTheme();

createApp(App).use(router).mount("#app");