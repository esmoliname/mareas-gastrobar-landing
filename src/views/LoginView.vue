<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail, ShieldCheck } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth.js";
import { config } from "../config/index.js";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = reactive({
  username: "",
  password: "",
  remember: true,
});

const errors = reactive({
  username: "",
  password: "",
  form: "",
});

const showPassword = ref(false);
const submitted = ref(false);

const redirectTo = computed(() => {
  const target = route.query.redirect;
  // Open-redirect protection: solo rutas internas absolutas (empiezan con un solo "/"),
  // rechaza URLs externas, protocol-relative ("//evil.com") y backslashes.
  return typeof target === "string" && /^\/(?![/\\])/.test(target) ? target : "/admin";
});

onMounted(() => {
  document.title = "Iniciar sesión | Mareas Gastrobar";
  const el = document.getElementById("username-field");
  if (el) el.focus();
});

function validate() {
  errors.username = "";
  errors.password = "";
  errors.form = "";

  const username = form.username.trim().toLowerCase();
  const password = form.password;

  if (!username) errors.username = "Ingresá tu usuario.";
  else if (username.length < 3) errors.username = "El usuario debe tener al menos 3 caracteres.";

  if (!password) errors.password = "Ingresá tu contraseña.";
  else if (password.length < 6) errors.password = "La contraseña debe tener al menos 6 caracteres.";

  return !errors.username && !errors.password;
}

async function submit() {
  submitted.value = true;
  if (!validate()) return;

  try {
    const ok = await auth.login(form.username, form.password, form.remember);
    if (ok) router.replace(redirectTo.value);
  } catch (e) {
    errors.form = e.message || "No se pudo iniciar sesión. Intentá de nuevo.";
  }
}

function fillDemo() {
  form.username = config.admin.username;
  form.password = config.admin.password;
  errors.username = "";
  errors.password = "";
  errors.form = "";
}
</script>

<template>
  <div class="login">
    <div class="login__glow" aria-hidden="true"></div>

    <main class="login__card" role="main">
      <RouterLink class="login__back" to="/">
        ← Volver al sitio
      </RouterLink>

      <div class="login__brand" aria-hidden="true">🌴</div>
      <h1 class="login__title">Panel de Mareas</h1>
      <p class="login__subtitle">
        Accedé al panel de administración del gastrobar. Solo personal autorizado.
      </p>

      <form class="login__form" novalidate @submit.prevent="submit">
        <div class="login__field" :class="{ 'has-error': submitted && errors.username }">
          <label for="username-field">Usuario</label>
          <div class="login__input-wrap">
            <Mail :size="17" class="login__input-icon" aria-hidden="true" />
            <input
              id="username-field"
              v-model="form.username"
              type="text"
              name="username"
              autocomplete="username"
              placeholder="admin"
              :aria-invalid="submitted && Boolean(errors.username)"
              @input="errors.username = ''"
            />
          </div>
          <p v-if="submitted && errors.username" class="login__error">
            <AlertCircle :size="14" aria-hidden="true" />
            {{ errors.username }}
          </p>
        </div>

        <div class="login__field" :class="{ 'has-error': submitted && errors.password }">
          <label for="password-field">Contraseña</label>
          <div class="login__input-wrap">
            <Lock :size="17" class="login__input-icon" aria-hidden="true" />
            <input
              id="password-field"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              name="password"
              autocomplete="current-password"
              placeholder="••••••••"
              :aria-invalid="submitted && Boolean(errors.password)"
              @input="errors.password = ''"
            />
            <button
              class="login__toggle"
              type="button"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              @click="showPassword = !showPassword"
            >
              <EyeOff v-if="showPassword" :size="17" />
              <Eye v-else :size="17" />
            </button>
          </div>
          <p v-if="submitted && errors.password" class="login__error">
            <AlertCircle :size="14" aria-hidden="true" />
            {{ errors.password }}
          </p>
        </div>

        <div v-if="errors.form" class="login__error login__error--box" role="alert">
          <AlertCircle :size="15" aria-hidden="true" />
          {{ errors.form }}
        </div>

        <label class="login__remember">
          <input v-model="form.remember" type="checkbox" />
          <span>Mantener la sesión abierta en este dispositivo</span>
        </label>

        <button class="btn btn--primary login__submit" type="submit" :disabled="auth.loading">
          <Loader2 v-if="auth.loading" :size="18" class="login__spin" aria-hidden="true" />
          <LogIn v-else :size="18" aria-hidden="true" />
          {{ auth.loading ? "Verificando…" : "Iniciar sesión" }}
        </button>
      </form>

      <div class="login__demo">
        <ShieldCheck :size="15" class="login__demo-icon" aria-hidden="true" />
        <p>
          <strong>Acceso de demostración:</strong>
          usuario <code>{{ config.admin.username }}</code> · contraseña <code>{{ config.admin.password }}</code>
        </p>
        <button class="login__demo-fill" type="button" @click="fillDemo">Usar credenciales de prueba</button>
      </div>
    </main>

    <p class="login__footer">© {{ new Date().getFullYear() }} Mareas Gastrobar Tropical · Ciudad Quesada</p>
  </div>
</template>

<style scoped>
.login {
  position: relative;
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px 28px;
  overflow: hidden;
  background:
    radial-gradient(90% 60% at 85% 0%, rgba(201, 162, 39, 0.09) 0%, transparent 55%),
    radial-gradient(80% 70% at 10% 100%, rgba(30, 122, 70, 0.2) 0%, transparent 60%),
    var(--bg-deep);
}

.login__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 30% at 50% 0%, rgba(46, 158, 91, 0.14) 0%, transparent 60%);
  pointer-events: none;
}

.login__card {
  position: relative;
  width: min(100%, 420px);
  padding: 34px 30px 28px;
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  border: 1px solid rgba(245, 239, 224, 0.1);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
}

.login__back {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  margin-bottom: 18px;
}

.login__back:hover {
  color: var(--gold-light);
}

.login__brand {
  font-size: 2.4rem;
  line-height: 1;
  margin-bottom: 10px;
}

.login__title {
  font-size: 1.6rem;
}

.login__subtitle {
  margin-top: 6px;
  font-size: 0.88rem;
  color: var(--muted);
}

.login__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.login__field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--sand);
}

.login__input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.login__input-icon {
  position: absolute;
  left: 13px;
  color: var(--muted);
  pointer-events: none;
}

.login__input-wrap input {
  width: 100%;
  padding: 12px 46px 12px 40px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.16);
  background: var(--bg-panel-2);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.login__input-wrap input:focus {
  border-color: var(--gold);
  box-shadow: 0 0 0 3px rgba(201, 162, 39, 0.15);
}

.login__field.has-error .login__input-wrap input {
  border-color: var(--coral);
}

.login__toggle {
  position: absolute;
  right: 8px;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted);
}

.login__toggle:hover {
  color: var(--gold-light);
}

.login__error {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 500;
  color: #ffb3a0;
}

.login__error--box {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(232, 122, 93, 0.12);
  border: 1px solid rgba(232, 122, 93, 0.35);
}

.login__remember {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 0.8rem;
  color: var(--muted);
  cursor: pointer;
}

.login__remember input {
  width: 17px;
  height: 17px;
  accent-color: var(--green);
}

.login__submit {
  width: 100%;
  margin-top: 4px;
}

.login__submit:disabled {
  opacity: 0.7;
  cursor: wait;
}

.login__spin {
  animation: login-spin 1s linear infinite;
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

.login__demo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 22px;
  padding: 14px;
  border-radius: var(--radius-sm);
  background: rgba(201, 162, 39, 0.07);
  border: 1px dashed rgba(201, 162, 39, 0.35);
  font-size: 0.78rem;
  color: var(--sand);
}

.login__demo-icon {
  color: var(--gold-light);
}

.login__demo code {
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--bg-deep);
  color: var(--gold-light);
  font-size: 0.74rem;
}

.login__demo-fill {
  align-self: flex-start;
  border: 0;
  background: transparent;
  color: var(--gold-light);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: underline;
  padding: 0;
}

.login__footer {
  position: relative;
  margin-top: 26px;
  font-size: 0.72rem;
  color: var(--muted);
}
</style>