<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import {
  ArrowLeft,
  Bike,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  X,
} from "lucide-vue-next";
import { useCartStore, ORDER_TYPES, PAYMENT_METHODS } from "../stores/cart.js";
import { formatColones } from "../utils/format.js";
import { orderWhatsappUrl } from "../services/order.js";
import { config } from "../config/index.js";
import { notifyError, notifySuccess } from "../utils/toast.js";
import WhatsappIcon from "./WhatsappIcon.vue";

const cart = useCartStore();

const orderTypes = Object.values(ORDER_TYPES);
const paymentMethods = Object.values(PAYMENT_METHODS);

const pickupTimes = [
  "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00",
  "20:30", "21:00", "21:30", "22:00", "22:30",
];

const sending = ref(false);
const sentOk = ref(false);
const sentMessage = ref("");
const checkoutErrors = ref("");

const cashChange = computed(() => {
  const paid = Number(cart.cashPaid) || 0;
  return paid >= cart.total ? paid - cart.total : -1;
});

const orderTypeIcon = (id) => {
  if (id === "mesa") return Store;
  if (id === "pickup") return ShoppingBag;
  return Bike;
};

function onKeydown(e) {
  if (e.key === "Escape" && cart.drawerOpen) cart.close();
}

onMounted(() => document.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

watch(
  () => cart.drawerOpen,
  (open) => {
    document.body.style.overflow = open ? "hidden" : "";
    if (open) sentOk.value = false;
  }
);

function goCheckout() {
  checkoutErrors.value = "";
  cart.checkoutStep = "checkout";
}

function goBack() {
  cart.checkoutStep = "cart";
}

function validateCheckout() {
  checkoutErrors.value = "";
  if (cart.orderType === "mesa") {
    const table = String(cart.tableNumber || "").replace(/\D/g, "");
    if (!table) return "Indicá el número de mesa para tu orden.";
    if (Number(table) < 1 || Number(table) > config.businessRules.maxTableNumber) {
      return `El número de mesa debe estar entre 1 y ${config.businessRules.maxTableNumber}.`;
    }
  }
  if (cart.orderType === "pickup" && !cart.pickupTime) return "Elegí la hora de retiro de tu pedido.";
  if (cart.orderType === "express" && !String(cart.deliveryAddress || "").trim()) return "Ingresá la dirección de entrega.";
  if (cart.paymentMethod === "efectivo" && cashChange.value < 0) {
    return "El monto en efectivo debe cubrir el total de la orden.";
  }
  return "";
}

function confirmOrder() {
  const problem = validateCheckout();
  if (problem) {
    checkoutErrors.value = problem;
    notifyError(problem);
    return;
  }
  sending.value = true;
  setTimeout(() => {
    sentMessage.value = orderWhatsappUrl(cart);
    sentOk.value = true;
    sending.value = false;
    notifySuccess("Pedido armado. Enviálo por WhatsApp para confirmar.");
  }, 550);
}

function openWhatsapp() {
  window.open(sentMessage.value, "_blank", "noopener,noreferrer");
  cart.clear();
  cart.close();
}
</script>

<template>
  <Teleport to="body">
    <Transition name="cart">
      <div v-if="cart.drawerOpen" class="cart-overlay" @click.self="cart.close()">
        <aside class="cart-panel" role="dialog" aria-modal="true" aria-label="Carrito de pedidos">
          <header class="cart-head">
            <div class="cart-head__title">
              <ShoppingBag :size="18" aria-hidden="true" />
              <span>{{ cart.checkoutStep === "checkout" ? "Confirmar pedido" : "Tu pedido" }}</span>
            </div>
            <button class="cart-head__close" type="button" aria-label="Cerrar carrito" @click="cart.close()">
              <X :size="20" />
            </button>
          </header>

          <div v-if="sentOk" class="cart-success">
            <CheckCircle2 :size="44" class="cart-success__icon" aria-hidden="true" />
            <h3>¡Pedido listo!</h3>
            <p>Tu pedido quedó armado. Solo falta enviarlo por WhatsApp para que lo confirmen.</p>
            <a class="btn btn--wa cart-success__btn" :href="sentMessage" target="_blank" rel="noopener noreferrer" @click="openWhatsapp">
              <WhatsappIcon :size="20" />
              Enviar por WhatsApp
            </a>
            <button class="cart-success__later" type="button" @click="cart.close()">
              Lo envío después
            </button>
          </div>

          <template v-else>
            <div v-if="cart.checkoutStep === 'cart'" class="cart-body">
              <p v-if="cart.isEmpty" class="cart-empty">
                <ShoppingBag :size="30" aria-hidden="true" />
                Tu carrito está vacío.
                <span>Explorá el menú y agregá algo rico. 🍹</span>
              </p>

              <ul v-else class="cart-list">
                <li v-for="item in cart.items" :key="item.id" class="cart-item">
                  <img v-if="item.image" :src="item.image" :alt="item.name" class="cart-item__img" loading="lazy" decoding="async" />
                  <div v-else class="cart-item__img cart-item__img--empty" aria-hidden="true">🍽️</div>

                  <div class="cart-item__main">
                    <div class="cart-item__row">
                      <strong class="cart-item__name">{{ item.name }}</strong>
                      <span class="cart-item__price">{{ formatColones(item.price * item.quantity) }}</span>
                    </div>
                    <input
                      v-model="item.note"
                      type="text"
                      class="cart-item__note"
                      placeholder="Nota especial (sin cebolla, extra queso…)…"
                      maxlength="120"
                      @change="cart.setNote(item.id, item.note)"
                    />
                    <div class="cart-item__footer">
                      <div class="cart-qty">
                        <button type="button" aria-label="Quitar uno" @click="cart.decrement(item.id)">
                          <Minus :size="14" />
                        </button>
                        <span>{{ item.quantity }}</span>
                        <button type="button" aria-label="Agregar uno" @click="cart.increment(item.id)">
                          <Plus :size="14" />
                        </button>
                      </div>
                      <button class="cart-item__remove" type="button" :aria-label="`Quitar ${item.name} del pedido`" @click="cart.removeItem(item.id)">
                        <Trash2 :size="15" />
                      </button>
                    </div>
                  </div>
                </li>
              </ul>
            </div>

            <div v-else class="cart-body">
              <button class="cart-back" type="button" @click="goBack">
                <ArrowLeft :size="15" />
                Volver al carrito
              </button>

              <div class="checkout">
                <h3 class="checkout__title">Tipo de orden</h3>
                <div class="checkout__types">
                  <button
                    v-for="type in orderTypes"
                    :key="type.id"
                    class="checkout__type"
                    :class="{ 'is-active': cart.orderType === type.id }"
                    type="button"
                    @click="cart.orderType = type.id"
                  >
                    <component :is="orderTypeIcon(type.id)" :size="20" aria-hidden="true" />
                    <span>{{ type.label }}</span>
                  </button>
                </div>

                <label v-if="cart.orderType === 'mesa'" class="checkout__field">
                  <span>Número de mesa</span>
                  <input v-model="cart.tableNumber" type="number" min="1" :max="config.businessRules.maxTableNumber" inputmode="numeric" placeholder="Ej: 5" />
                </label>

                <label v-else-if="cart.orderType === 'pickup'" class="checkout__field">
                  <span>Hora de retiro</span>
                  <select v-model="cart.pickupTime">
                    <option value="" disabled>Elegí la hora…</option>
                    <option v-for="t in pickupTimes" :key="t" :value="t">{{ t }}</option>
                  </select>
                </label>

                <template v-else>
                  <label class="checkout__field">
                    <span>Dirección de entrega *</span>
                    <input v-model="cart.deliveryAddress" type="text" placeholder="Barrio, señas exactas…" />
                  </label>
                </template>

                <h3 class="checkout__title checkout__title--mt">Contacto</h3>
                <div class="checkout__grid">
                  <label class="checkout__field">
                    <span>Nombre</span>
                    <input v-model="cart.contactName" type="text" placeholder="Tu nombre" />
                  </label>
                  <label class="checkout__field">
                    <span>Teléfono</span>
                    <input v-model="cart.contactPhone" type="tel" inputmode="tel" placeholder="8xxx-xxxx" />
                  </label>
                </div>

                <h3 class="checkout__title checkout__title--mt">Método de pago</h3>
                <div class="checkout__pay">
                  <button
                    v-for="method in paymentMethods"
                    :key="method.id"
                    class="checkout__pay-option"
                    :class="{ 'is-active': cart.paymentMethod === method.id }"
                    type="button"
                    @click="cart.paymentMethod = method.id"
                  >
                    <span class="checkout__pay-radio" aria-hidden="true"></span>
                    <span>
                      <strong>{{ method.label }}</strong>
                      <small>{{ method.hint }}</small>
                    </span>
                  </button>
                </div>

                <label v-if="cart.paymentMethod === 'efectivo'" class="checkout__field">
                  <span>¿Con cuánto pagás? (₡)</span>
                  <input v-model="cart.cashPaid" type="number" min="0" step="500" inputmode="numeric" placeholder="Ej: 15000" />
                  <small v-if="cashChange >= 0" class="checkout__change">
                    Vuelto: <strong>{{ formatColones(cashChange) }}</strong>
                  </small>
                  <small v-else-if="cart.cashPaid !== ''" class="checkout__change checkout__change--warn">
                    El efectivo no cubre el total ({{ formatColones(cart.total) }}).
                  </small>
                </label>

                <p v-if="checkoutErrors" class="checkout__error" role="alert">
                  {{ checkoutErrors }}
                </p>
              </div>
            </div>

            <footer class="cart-foot">
              <div class="cart-totals">
                <div class="cart-totals__row"><span>Subtotal</span><span>{{ formatColones(cart.subtotal) }}</span></div>
                <div class="cart-totals__row"><span>IVA ({{ cart.taxPercent }}%)</span><span>{{ formatColones(cart.tax) }}</span></div>
                <div class="cart-totals__row cart-totals__row--total"><span>Total</span><span>{{ formatColones(cart.total) }}</span></div>
              </div>

              <button
                v-if="cart.checkoutStep === 'cart'"
                class="btn btn--primary cart-foot__btn"
                type="button"
                :disabled="cart.isEmpty"
                @click="goCheckout"
              >
                Continuar al checkout
              </button>
              <button v-else class="btn btn--wa cart-foot__btn" type="button" :disabled="sending" @click="confirmOrder">
                <WhatsappIcon :size="20" />
                {{ sending ? "Armando pedido…" : "Confirmar pedido por WhatsApp" }}
              </button>
            </footer>
          </template>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  background: rgba(4, 8, 6, 0.7);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.cart-panel {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  width: min(100%, 420px);
  background: rgba(14, 26, 20, 0.85);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border-left: 1px solid rgba(245, 239, 224, 0.14);
  box-shadow: -24px 0 60px rgba(0, 0, 0, 0.5);
  overflow-y: auto;
}

.cart-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: rgba(14, 26, 20, 0.78);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(245, 239, 224, 0.1);
}

.cart-head__title {
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 700;
  font-size: 1rem;
}

.cart-head__close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(245, 239, 224, 0.15);
  background: transparent;
  color: var(--muted);
}

.cart-head__close:hover {
  color: var(--gold-light);
  border-color: var(--gold);
}

.cart-body {
  flex: 1;
  padding: 18px 20px;
}

.cart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 56px 20px;
  text-align: center;
  color: var(--muted);
  font-size: 0.9rem;
}

.cart-empty span {
  font-size: 0.8rem;
}

.cart-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.cart-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  background: var(--bg-panel-2);
  border: 1px solid rgba(245, 239, 224, 0.07);
}

.cart-item__img {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--bg-panel);
}

.cart-item__img--empty {
  display: grid;
  place-items: center;
  font-size: 1.6rem;
}

.cart-item__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cart-item__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.cart-item__name {
  font-size: 0.88rem;
  line-height: 1.3;
}

.cart-item__price {
  font-weight: 700;
  color: var(--gold-light);
  font-size: 0.85rem;
  white-space: nowrap;
}

.cart-item__note {
  width: 100%;
  padding: 7px 10px;
  border-radius: 8px;
  border: 1px solid rgba(245, 239, 224, 0.12);
  background: var(--bg-panel);
  color: var(--cream);
  font: inherit;
  font-size: 0.76rem;
  outline: none;
}

.cart-item__note:focus {
  border-color: var(--gold);
}

.cart-item__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.cart-qty {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  border-radius: 999px;
  border: 1px solid rgba(245, 239, 224, 0.14);
  background: var(--bg-panel);
  overflow: hidden;
}

.cart-qty button {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  color: var(--sand);
}

.cart-qty button:hover {
  color: var(--gold-light);
  background: rgba(201, 162, 39, 0.1);
}

.cart-qty span {
  min-width: 26px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.cart-item__remove {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 0;
  background: transparent;
  color: var(--muted);
}

.cart-item__remove:hover {
  color: var(--coral);
  background: rgba(232, 122, 93, 0.12);
}

.cart-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 14px;
  padding: 0;
}

.cart-back:hover {
  color: var(--gold-light);
}

.checkout {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.checkout__title {
  font-family: var(--font-body);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--muted);
}

.checkout__title--mt {
  margin-top: 10px;
}

.checkout__types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.checkout__type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 12px 6px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.14);
  background: var(--bg-panel-2);
  color: var(--sand);
  font-size: 0.74rem;
  font-weight: 600;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

.checkout__type:hover {
  border-color: var(--green-bright);
}

.checkout__type.is-active {
  border-color: var(--gold);
  background: rgba(201, 162, 39, 0.1);
  color: var(--gold-light);
}

.checkout__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--sand);
}

.checkout__field input,
.checkout__field select {
  width: 100%;
  padding: 11px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.14);
  background: var(--bg-panel-2);
  color: var(--cream);
  font: inherit;
  font-weight: 400;
  outline: none;
}

.checkout__field input:focus,
.checkout__field select:focus {
  border-color: var(--gold);
}

.checkout__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.checkout__pay {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkout__pay-option {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 13px;
  text-align: left;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(245, 239, 224, 0.14);
  background: var(--bg-panel-2);
  color: var(--sand);
  transition: border-color 0.2s ease;
}

.checkout__pay-option.is-active {
  border-color: var(--green-bright);
  background: rgba(46, 158, 91, 0.08);
}

.checkout__pay-radio {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border-radius: 50%;
  border: 2px solid var(--muted);
  flex-shrink: 0;
  display: grid;
  place-items: center;
}

.checkout__pay-option.is-active .checkout__pay-radio {
  border-color: var(--green-bright);
}

.checkout__pay-option.is-active .checkout__pay-radio::after {
  content: "";
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--green-bright);
}

.checkout__pay-option strong {
  display: block;
  font-size: 0.85rem;
}

.checkout__pay-option small {
  display: block;
  margin-top: 2px;
  color: var(--muted);
  font-size: 0.72rem;
}

.checkout__change {
  font-size: 0.76rem;
  color: var(--green-bright);
}

.checkout__change--warn {
  color: #ffb3a0;
}

.checkout__error {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: rgba(232, 122, 93, 0.12);
  border: 1px solid rgba(232, 122, 93, 0.35);
  color: #ffb3a0;
  font-size: 0.8rem;
}

.cart-foot {
  position: sticky;
  bottom: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 20px 20px;
  background: rgba(14, 26, 20, 0.8);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-top: 1px solid rgba(245, 239, 224, 0.1);
}

.cart-totals {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cart-totals__row {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  color: var(--muted);
}

.cart-totals__row--total {
  margin-top: 4px;
  padding-top: 10px;
  border-top: 1px dashed rgba(245, 239, 224, 0.15);
  color: var(--cream);
  font-size: 1rem;
  font-weight: 700;
}

.cart-totals__row--total span:last-child {
  color: var(--gold-light);
  font-family: var(--font-display);
  font-size: 1.15rem;
}

.cart-foot__btn {
  width: 100%;
}

.cart-foot__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cart-success {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 28px;
  text-align: center;
}

.cart-success__icon {
  color: var(--green-bright);
}

.cart-success h3 {
  font-size: 1.3rem;
}

.cart-success p {
  color: var(--muted);
  font-size: 0.88rem;
  max-width: 30ch;
}

.cart-success__btn {
  width: 100%;
  margin-top: 8px;
}

.cart-success__later {
  border: 0;
  background: transparent;
  color: var(--muted);
  font-size: 0.8rem;
  text-decoration: underline;
}

/* Transición */
.cart-enter-active,
.cart-leave-active {
  transition: opacity 0.25s ease;
}

.cart-enter-active .cart-panel,
.cart-leave-active .cart-panel {
  transition: transform 0.25s ease;
}

.cart-enter-from,
.cart-leave-to {
  opacity: 0;
}

.cart-enter-from .cart-panel,
.cart-leave-to .cart-panel {
  transform: translateX(100%);
}
</style>