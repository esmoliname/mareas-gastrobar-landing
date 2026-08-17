import { computed, reactive, ref } from "vue";
import { modelOptions } from "../data/models3d.js";
import { menuCategories, sanitizeDish } from "../stores/catalog.js";
import { addItem, updateItem } from "../stores/catalog.js";
import { notifyError, notifySuccess } from "../utils/toast.js";
import { LIMITS, validators } from "../utils/validation.js";

// Estado y lógica del formulario de platillos (crear/editar), compartido
// entre AdminCatalog y DishFormModal.
export function useDishForm() {
  const open = ref(false);
  const editingId = ref(null);
  const submitted = ref(false);

  const form = reactive({
    name: "",
    category: menuCategories[0],
    price: "",
    description: "",
    image: "",
    model: modelOptions[0].glb,
    usdz: modelOptions[0].usdz,
    tags: [],
    popular: false,
    available: true,
  });

  const errors = reactive({
    name: "",
    price: "",
    image: "",
    model: "",
    usdz: "",
  });

  const modelGroups = computed(() => {
    const groups = new Map();
    for (const opt of modelOptions) {
      if (!groups.has(opt.category)) groups.set(opt.category, []);
      groups.get(opt.category).push(opt);
    }
    return [...groups.entries()];
  });

  const categories = menuCategories;

  const title = computed(() => (editingId.value ? "Editar platillo" : "Nuevo platillo"));

  const pricePreview = computed(() => {
    const n = Number(form.price);
    return Number.isFinite(n) && n > 0 ? n : 0;
  });

  function rules() {
    return {
      name: [validators.required, validators.maxLength(LIMITS.name)],
      price: [validators.required, validators.numberRange(1, LIMITS.priceMax)],
      image: [validators.httpUrl(true)],
      model: [validators.httpUrl(true)],
      usdz: [validators.httpUrl(true)],
    };
  }

  function openCreate() {
    editingId.value = null;
    Object.assign(form, {
      name: "",
      category: menuCategories[0],
      price: "",
      description: "",
      image: "",
      model: modelOptions[0].glb,
      usdz: modelOptions[0].usdz,
      tags: [],
      popular: false,
      available: true,
    });
    Object.keys(errors).forEach((k) => (errors[k] = ""));
    submitted.value = false;
    open.value = true;
  }

  function openEdit(item) {
    editingId.value = item.id;
    Object.assign(form, {
      name: item.name,
      category: item.category,
      price: String(item.price),
      description: item.description,
      image: item.image,
      model: item.model,
      usdz: item.usdz || "",
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      popular: item.popular,
      available: item.available,
    });
    Object.keys(errors).forEach((k) => (errors[k] = ""));
    submitted.value = false;
    open.value = true;
  }

  function close() {
    open.value = false;
    editingId.value = null;
  }

  function submit() {
    submitted.value = true;
    Object.assign(errors, validateFields(rules(), form));
    if (Object.values(errors).some(Boolean)) {
      notifyError("Revisá los campos marcados en el formulario.");
      return;
    }
    const sanitized = sanitizeDish(form);
    if (!sanitized.ok) {
      Object.assign(errors, sanitized.errors);
      notifyError("Revisá los campos marcados en el formulario.");
      return;
    }
    const payload = { ...sanitized.dish };
    if (editingId.value) {
      updateItem(editingId.value, payload);
      notifySuccess("Platillo actualizado. Los cambios ya están visibles en el menú.");
    } else {
      addItem(payload);
      notifySuccess("Platillo agregado al catálogo.");
    }
    close();
  }

  function onModelChange(key) {
    const opt = modelOptions.find((o) => o.key === key);
    if (!opt) return;
    form.model = opt.glb;
    if (!form.usdz) form.usdz = opt.usdz;
  }

  function toggleTag(tag) {
    if (form.tags.includes(tag)) {
      form.tags = form.tags.filter((t) => t !== tag);
    } else {
      form.tags = [...form.tags, tag];
    }
  }

  return { open, editingId, submitted, form, errors, title, categories, modelGroups, pricePreview, openCreate, openEdit, close, submit, onModelChange, toggleTag };
}