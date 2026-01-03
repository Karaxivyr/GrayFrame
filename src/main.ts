import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./app/appRoot.vue";
import router from "./router";
import "./styles/_tokens.scss";
import "./styles/_globals.scss";
import "./styles/moduleBase.scss";
import "./styles/itemBase.scss";
import { createPersistPlugin } from "./composables/usePersistence";

/* NEW: load theme before mount so CSS vars are live from first paint */
import { useThemeStore } from "./stores/themeStore";

const app = createApp(App);
const pinia = createPinia();

// IMPORTANT: install persistence plugin before using stores anywhere
pinia.use(createPersistPlugin());

app.use(pinia);

/* Apply saved (or default) theme immediately */
const theme = useThemeStore();
theme.load();

app.use(router);
app.mount("#app");
