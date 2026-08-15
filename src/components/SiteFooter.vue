<script setup>
import { site } from "../data/site.js";
</script>

<template>
  <footer class="site-footer">
    <div class="container site-footer__grid">
      <div class="site-footer__brand">
        <p class="site-footer__logo">Mareas</p>
        <p class="site-footer__tag">Gastrobar Tropical · Restaurante y Bar en Ciudad Quesada, San Carlos</p>
        <p class="u-muted site-footer__bio">
          Comida, cócteles y buena vibra. Tropical, relajado y sin prisa.
        </p>
      </div>

      <address class="site-footer__col">
        <h3 class="site-footer__heading">Visítanos</h3>
        <p>
          {{ site.addressLine1 }}<br />
          {{ site.addressLine2 }}
        </p>
        <p>
          <a :href="`tel:${site.phoneTel}`">{{ site.phoneDisplay }}</a><br />
          <a :href="`mailto:${site.email}`">{{ site.email }}</a>
        </p>
        <p class="u-muted">Lun–Dom 11:00 – 23:45 · Vie–Sáb hasta 00:45</p>
      </address>

      <nav class="site-footer__col" aria-label="Redes sociales">
        <h3 class="site-footer__heading">Seguinos</h3>
        <ul class="site-footer__socials">
          <li><a :href="site.instagram" target="_blank" rel="noopener noreferrer">Instagram · {{ site.instagramHandle }}</a></li>
          <li><a :href="site.facebook" target="_blank" rel="noopener noreferrer">Facebook</a></li>
          <li><a :href="site.tripadvisor" target="_blank" rel="noopener noreferrer">TripAdvisor</a></li>
          <li><a :href="site.googleReviews" target="_blank" rel="noopener noreferrer">Google Maps</a></li>
        </ul>
      </nav>
    </div>

    <div class="container site-footer__bottom">
      <p>© {{ new Date().getFullYear() }} Mareas Gastrobar Tropical. Todos los derechos reservados.</p>
      <p class="u-muted site-footer__admin">
        <RouterLink to="/admin">Panel de administración</RouterLink>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: #08100d;
  border-top: 1px solid rgba(245, 239, 224, 0.08);
  padding-block: 48px 96px;
}

.site-footer__grid {
  display: grid;
  gap: 36px;
}

.site-footer__logo {
  font-family: var(--font-display);
  font-size: 1.9rem;
  font-weight: 600;
  color: var(--cream);
}

.site-footer__tag {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--gold);
  margin: 6px 0 12px;
}

.site-footer__bio {
  font-size: 0.9rem;
}

.site-footer__col {
  font-style: normal;
  font-size: 0.92rem;
  display: grid;
  gap: 10px;
  color: var(--sand);
}

.site-footer__heading {
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--muted);
}

.site-footer__socials {
  list-style: none;
  display: grid;
  gap: 8px;
}

.site-footer__bottom {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(245, 239, 224, 0.07);
  font-size: 0.78rem;
}

@media (min-width: 768px) {
  .site-footer__grid {
    grid-template-columns: 1.4fr 1fr 1fr;
  }

  .site-footer__bottom {
    flex-direction: row;
    justify-content: space-between;
  }

  .site-footer__admin {
    font-size: 0.78rem;
  }

  .site-footer__admin a {
    color: var(--muted);
  }

  .site-footer__admin a:hover {
    color: var(--gold-light);
  }
}
</style>