/**
 * main.js — GPS Portátiles
 * Funciones pequeñas, activadas solo si su marcado existe en la página
 * actual. Nada de estado global innecesario; cada módulo lee del DOM
 * y de PRODUCTS (products.js).
 */

/* ------------------------------------------------------------------ */
/* 1. Configuración                                                    */
/* ------------------------------------------------------------------ */
const WHATSAPP_NUMBER = "18097526329"; // Número real del negocio (dueños de gpsportatiles.com)

function waLink(productName) {
  const msg = productName
    ? `Hola 👋 Me interesa el GPS ${productName} 📍. Quiero más información.`
    : "Hola 👋 Quiero más información sobre los rastreadores GPS Portátiles 📍.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", minimumFractionDigits: 0 }).format(value);
}

/* ------------------------------------------------------------------ */
/* 2. Iconografía — referencias al sprite <svg id="icon-sprite"> que    */
/*    vive una sola vez en el <body> de cada página (ver build.py).    */
/*    Evita repetir el mismo path SVG decenas de veces por página.     */
/* ------------------------------------------------------------------ */
const CATEGORY_ICON_ID = {
  personal: "icon-cat-personal",
  vehicular: "icon-cat-vehicular",
  mascota: "icon-cat-mascota",
  moto: "icon-cat-moto",
  flotilla: "icon-cat-flotilla",
  objeto: "icon-cat-objeto",
};
function productIcon(key) {
  const id = CATEGORY_ICON_ID[key] || CATEGORY_ICON_ID.objeto;
  return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
}

function iconUse(id, extraClass) {
  return `<svg class="${extraClass || ""}" aria-hidden="true" focusable="false"><use href="#${id}"></use></svg>`;
}

function starRating(rating) {
  const full = Math.round(rating);
  const star = (cls) => iconUse("icon-star", cls);
  return `<span class="stars" role="img" aria-label="${rating} de 5 estrellas">${star("star-fill").repeat(full)}${star("star-empty").repeat(5 - full)}</span>`;
}

/* ------------------------------------------------------------------ */
/* Vitrina 3D del hero — alterna entre los 4 prototipos reales del     */
/* producto (rotación automática ya integrada en cada visor). Usa dos  */
/* iframes superpuestos: mientras uno se muestra, el otro precarga el  */
/* siguiente modelo en silencio, así el cambio es un cross-fade limpio */
/* en vez de un parpadeo en blanco.                                    */
/* ------------------------------------------------------------------ */
function initHeroShowcase() {
  const wrap = document.querySelector(".hero-showcase");
  if (!wrap) return;

  const sources = [
    "assets/3d/gps-personal.html",
    "assets/3d/gps-obd2.html",
    "assets/3d/gps-cargador.html",
    "assets/3d/gps-redondo.html",
  ];

  let frameA = wrap.querySelector('[data-frame="a"]');
  let frameB = wrap.querySelector('[data-frame="b"]');

  let current = 0;
  let active = frameA;
  let standby = frameB;
  active.src = sources[current];
  active.classList.add("is-active");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return; // deja el primer modelo fijo, sin ciclo automático

  function swap() {
    current = (current + 1) % sources.length;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      active.classList.remove("is-active");
      standby.classList.add("is-active");
      const tmp = active;
      active = standby;
      standby = tmp;
    };
    standby.addEventListener("load", finish, { once: true });
    standby.src = sources[current];
    setTimeout(finish, 4000); // red lenta: igual cruza, aunque el visor siga cargando de fondo
  }

  setInterval(swap, 7000);
}


function initLoader() {
  window.addEventListener("load", () => {
    const loader = document.querySelector(".page-loader");
    if (loader) setTimeout(() => loader.classList.add("hidden"), 180);
  });
}

function initHeaderScrollState() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;

  const root = document.documentElement;
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  btn.setAttribute("aria-label", root.getAttribute("data-theme") === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");

  btn.addEventListener("click", () => {
    const goingDark = root.getAttribute("data-theme") !== "dark";

    const applyTheme = () => {
      if (goingDark) {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      btn.setAttribute("aria-label", goingDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
      try {
        localStorage.setItem("gp-theme", goingDark ? "dark" : "light");
      } catch (err) {
        // Si el navegador bloquea localStorage (modo privado, etc.), el
        // tema igual cambia, solo no se recuerda para la próxima visita.
      }
    };

    if (!document.startViewTransition || reduceMotion) {
      applyTheme();
      return;
    }

    const rect = btn.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme());
    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: "cubic-bezier(.16,.84,.44,1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });
}

function initNavToggle() {
  const toggle = document.querySelector(".nav-toggle");
  const header = document.querySelector(".site-header");
  if (!toggle || !header) return;

  const close = () => {
    header.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) {
      close();
      toggle.focus();
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 721px)");
  desktopQuery.addEventListener("change", (e) => {
    if (e.matches) close();
  });
}

function initBackToTop() {
  const btn = document.querySelector(".back-top");
  if (!btn) return;
  window.addEventListener("scroll", () => btn.classList.toggle("visible", window.scrollY > 560), { passive: true });
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function initReveal() {
  const items = document.querySelectorAll("[data-reveal]:not(.in-view)");
  if (!items.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((el) => io.observe(el));
}

function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg><span></span>`;
    document.body.appendChild(toast);
  }
  toast.querySelector("span").textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

function initBuyNotifications() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("a[data-buy]")) showToast("Abriendo WhatsApp para completar tu pedido…");
  });
}

function initHeaderSearch() {
  const input = document.querySelector("[data-header-search]");
  if (!input) return;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      window.location.href = `catalogo.html?q=${encodeURIComponent(input.value.trim())}`;
    }
  });
}

function initAccordion() {
  document.querySelectorAll(".accordion-trigger").forEach((btn) => {
    if (btn._bound) return;
    btn._bound = true;
    btn.addEventListener("click", () => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      const expanded = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!expanded));
      panel.style.maxHeight = expanded ? null : panel.scrollHeight + "px";
    });
  });
}

// Los paneles abiertos miden su alto con scrollHeight en el momento del clic.
// Si la tipografía web termina de cargar después (font-display: swap) o el
// usuario redimensiona/rota la pantalla, ese alto queda desactualizado y el
// texto puede recortarse. Lo recalculamos en ambos casos.
function initAccordionReflow() {
  const recalc = () => {
    document.querySelectorAll('.accordion-trigger[aria-expanded="true"]').forEach((btn) => {
      const panel = document.getElementById(btn.getAttribute("aria-controls"));
      if (panel) panel.style.maxHeight = panel.scrollHeight + "px";
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(recalc);
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalc, 150);
    },
    { passive: true }
  );
}

/* ------------------------------------------------------------------ */
/* 4. Tarjeta de producto reutilizable                                  */
/* ------------------------------------------------------------------ */
function stockLineHTML(p) {
  const cls = p.disponibilidad === "in-stock" ? "stock-line--in" : "stock-line--back";
  return `<p class="stock-line ${cls}"><span class="dot"></span>${p.disponibilidadTexto}</p>`;
}

function productCardHTML(p, options = {}) {
  const infoOnly = options.infoOnly === true;
  const badge = p.precioAnterior ? `<span class="chip chip--sale">Oferta</span>` : "";
  const shippingBadge = `<span class="chip chip--shipping">Envío gratis</span>`;
  const oldPrice = p.precioAnterior ? `<span class="price-old">${formatPrice(p.precioAnterior)}</span>` : "";
  const media3d = p.model3d ? ` data-model3d="${p.model3d}"` : "";
  const actionsHTML = infoOnly
    ? `<a class="btn btn-outline btn-block btn-sm" href="producto-${p.id}.html">Ver más información ${iconUse("icon-arrow")}</a>`
    : `
      <a class="btn btn-whatsapp btn-block btn-sm" data-buy target="_blank" rel="noopener" href="${waLink(p.nombre)}">
        ${iconUse("icon-whatsapp")}
        Comprar por WhatsApp
      </a>
      <a class="link-arrow" href="producto-${p.id}.html">Ver ficha técnica ${iconUse("icon-arrow")}</a>`;
  return `
  <article class="card-product" data-reveal>
    <a class="card-product__media" href="producto-${p.id}.html" aria-label="Ver ${p.nombre}"${media3d}>
      ${shippingBadge}
      ${badge}
      ${productIcon(p.imagen)}
    </a>
    <div class="card-product__body">
      <span class="card-product__eyebrow">${p.linea}</span>
      <h3 class="card-product__title"><a href="producto-${p.id}.html">${p.nombre}</a></h3>
      <ul class="card-product__bullets">
        ${p.bullets.slice(0, 2).map((b) => `<li>${b}</li>`).join("")}
      </ul>
      <div class="rating-row">${starRating(p.rating)} <span>${p.rating}</span><span class="rating-count">(${p.reviews})</span></div>
      <div class="price-row">
        <span class="price">${formatPrice(p.precio)}</span>
        ${oldPrice}
        <span class="price-currency">DOP</span>
      </div>
      ${stockLineHTML(p)}
    </div>
    <div class="card-product__actions">
      ${actionsHTML}
    </div>
  </article>`;
}

/* ------------------------------------------------------------------ */
/* 5. Home: cuadrículas de producto                                     */
/* ------------------------------------------------------------------ */
function initHomeGrids() {
  const featured = document.querySelector("[data-grid='featured']");
  if (featured) featured.innerHTML = PRODUCTS.map((p) => productCardHTML(p, { infoOnly: true })).join("");
  initReveal();
}

/* ------------------------------------------------------------------ */
/* 6. Catálogo: render + filtros + búsqueda en tiempo real              */
/* ------------------------------------------------------------------ */
function initCatalog() {
  const grid = document.querySelector("[data-grid='catalog']");
  if (!grid) return;

  const params = new URLSearchParams(window.location.search);
  const searchInput = document.querySelector("[data-catalog-search]");
  const sortSelect = document.querySelector("[data-sort]");
  const resultsCount = document.querySelector("[data-results-count]");
  const checkboxes = document.querySelectorAll("[data-filter-cat]");
  const priceMax = document.querySelector("[data-filter-price]");
  const priceLabel = document.querySelector("[data-price-label]");

  if (params.get("q") && searchInput) searchInput.value = params.get("q");
  if (params.get("cat")) {
    checkboxes.forEach((cb) => { if (cb.value === params.get("cat")) cb.checked = true; });
  }

  function render() {
    const query = (searchInput?.value || "").toLowerCase().trim();
    const activeCats = [...checkboxes].filter((c) => c.checked).map((c) => c.value);
    const maxPrice = priceMax ? Number(priceMax.value) : Infinity;
    if (priceLabel && priceMax) priceLabel.textContent = formatPrice(maxPrice);

    let results = PRODUCTS.filter((p) => {
      const matchesQuery = !query || p.nombre.toLowerCase().includes(query) || p.descripcionCorta.toLowerCase().includes(query);
      const matchesCat = !activeCats.length || p.categoria.some((c) => activeCats.includes(c));
      const matchesPrice = p.precio <= maxPrice;
      return matchesQuery && matchesCat && matchesPrice;
    });

    const sort = sortSelect?.value;
    if (sort === "price-asc") results.sort((a, b) => a.precio - b.precio);
    if (sort === "price-desc") results.sort((a, b) => b.precio - a.precio);
    if (sort === "rating") results.sort((a, b) => b.rating - a.rating);

    grid.innerHTML = results.length
      ? results.map(productCardHTML).join("")
      : `<div class="empty-state"><p>No encontramos productos con esos filtros. Prueba ajustando la búsqueda o el precio máximo.</p></div>`;
    if (resultsCount) resultsCount.textContent = `${results.length} producto${results.length === 1 ? "" : "s"} encontrado${results.length === 1 ? "" : "s"}`;
    initReveal();
    initCardModels();
  }

  searchInput?.addEventListener("input", render);
  sortSelect?.addEventListener("change", render);
  priceMax?.addEventListener("input", render);
  checkboxes.forEach((cb) => cb.addEventListener("change", render));
  render();
}

/* ------------------------------------------------------------------ */
/* 7. Página de producto: detalle, galería, buy-box, tabs, relacionados */
/* ------------------------------------------------------------------ */
function initProductDetail() {
  const root = document.querySelector("[data-product-detail]");
  if (!root) return;

  const qpId = new URLSearchParams(window.location.search).get("id");
  const pathMatch = window.location.pathname.match(/producto-([a-z0-9-]+)\.html$/i);
  const id = qpId || (pathMatch ? pathMatch[1] : null);
  const product = PRODUCTS.find((p) => p.id === id) || PRODUCTS[0];

  document.title = `${product.nombre} — GPS Portátiles`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", product.descripcionCorta);

  document.querySelector("[data-breadcrumb-name]").textContent = product.nombre;
  const galleryMain = document.querySelector("[data-gallery-main]");
  if (product.model3d) {
    galleryMain.classList.add("has-3d");
    galleryMain.removeAttribute("role");
    galleryMain.removeAttribute("tabindex");
    galleryMain.removeAttribute("aria-pressed");
    galleryMain.removeAttribute("aria-label");
    galleryMain.innerHTML = `<span class="chip chip--shipping gallery-shipping-badge">Envío gratis</span><iframe src="${product.model3d}" title="Vista 3D de ${product.nombre}" loading="lazy"></iframe>`;
    const activate360Btn = document.querySelector("[data-activate-360]");
    if (activate360Btn) {
      activate360Btn.hidden = false;
      const viewer360 = document.querySelector("[data-viewer-360]");
      const viewer360Frame = viewer360.querySelector("[data-viewer-360-frame]");
      const viewer360Close = viewer360.querySelector("[data-viewer-360-close]");
      activate360Btn.addEventListener("click", () => {
        viewer360Frame.src = product.model3d;
        viewer360.hidden = false;
      });
      viewer360Close.addEventListener("click", () => {
        viewer360.hidden = true;
        viewer360Frame.src = "";
      });
    }
  } else {
    galleryMain.innerHTML = `<span class="chip chip--shipping gallery-shipping-badge">Envío gratis</span>${productIcon(product.imagen)}`;
    const arBtn = document.querySelector("[data-ar-open]");
    if (arBtn) arBtn.hidden = true;
  }
  document.querySelector("[data-product-eyebrow]").textContent = product.linea;
  document.querySelector("[data-product-name]").innerHTML = product.nombre.replace(/\bTAG\b/, '<span class="accent">TAG</span>');
  document.querySelector("[data-product-sku]").textContent = product.subtitulo;
  document.querySelector("[data-product-rating]").innerHTML = `${starRating(product.rating)} <span>${product.rating}</span><span class="rating-count">(${product.reviews} reseñas)</span>`;
  document.querySelector("[data-product-price]").textContent = formatPrice(product.precio);

  const oldPriceEl = document.querySelector("[data-product-price-old]");
  if (oldPriceEl) oldPriceEl.textContent = formatPrice(product.precio + 700);

  initOfferTimer();

  const stockEl = document.querySelector("[data-product-stock]");
  const stockCls = product.disponibilidad === "in-stock" ? "stock-line--in" : "stock-line--back";
  stockEl.className = `stock-line ${stockCls}`;
  stockEl.innerHTML = `<span class="dot"></span>${product.disponibilidadTexto}`;
  document.querySelector("[data-product-desc]").textContent = product.descripcionLarga;

  const mockupVideo = document.querySelector("[data-mockup-video]");
  if (mockupVideo && product.id === "rastreador-mini-tag") {
    mockupVideo.hidden = false;
  }

  const quickfactsHeading = document.querySelector("[data-quickfacts-heading]");
  if (quickfactsHeading && product.id === "rastreador-mini-tag") {
    quickfactsHeading.textContent = "¿Por qué elegir el TAG?";
    quickfactsHeading.hidden = false;
  }

  if (product.id === "rastreador-mini-tag") {
    const howBlock = document.querySelector("[data-how-block]");
    if (howBlock) {
      howBlock.hidden = false;
      const howFrame = howBlock.querySelector("[data-how-frame]");
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      howFrame.src = `assets/how-funciona-tag.html?theme=${isDark ? "dark" : "light"}`;

      window.addEventListener("message", (e) => {
        if (!e.data || e.data.type !== "gp-how-height") return;
        howFrame.style.height = `${e.data.height}px`;
      });

      const themeBtn = document.getElementById("themeToggle");
      if (themeBtn) {
        themeBtn.addEventListener("click", () => {
          setTimeout(() => {
            const nowDark = document.documentElement.getAttribute("data-theme") === "dark";
            howFrame.contentWindow.postMessage({ type: "gp-theme", dark: nowDark }, "*");
          }, 50);
        });
      }
    }
    const specsSection = document.querySelector("[data-specs-section]");
    if (specsSection) specsSection.hidden = true;
  }

  const usesBlock = document.querySelector("[data-uses-block]");
  if (usesBlock && product.id === "rastreador-mini-tag") {
    usesBlock.hidden = false;
    const usesToggle = usesBlock.querySelector("[data-uses-toggle]");
    const usesImg = usesBlock.querySelector(".zoomable-img");
    usesToggle.addEventListener("click", () => usesImg.click());
  }

  document.querySelector("[data-fact-red]").textContent = product.red;
  document.querySelector("[data-fact-bateria]").textContent = product.bateriaDias;
  document.querySelector("[data-fact-cobertura]").textContent = product.cobertura;
  document.querySelector("[data-fact-garantia]").textContent = product.garantia;

  const caracteristicasEl = document.querySelector("[data-product-caracteristicas]");
  if (product.caracteristicasDestacadas) {
    caracteristicasEl.classList.add("feature-cards");
    document.querySelector("[data-caracteristicas-section]").classList.add("pdp-summary-block--wide");
    caracteristicasEl.innerHTML = product.caracteristicasDestacadas
      .map(
        (c) => `<li class="feature-card"><span class="feature-card-icon"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${c.svg}</svg></span><span>${c.label}</span></li>`
      )
      .join("");
  } else {
    caracteristicasEl.innerHTML = product.caracteristicas.map((c) => `<li>${c}</li>`).join("");
  }

  const specs = [
    ["Compatibilidad", product.compatibilidad],
    ["Cobertura", product.cobertura],
    ["Tipo de red", product.red],
    ["Batería", product.bateriaDias],
    ["Peso", product.peso],
    ["Dimensiones", product.dimensiones],
    ["Garantía", product.garantia],
  ];
  document.querySelector("[data-spec-grid]").innerHTML = specs.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  document.querySelector("[data-box-contents]").innerHTML = product.caja.map((c) => `<li>${c}</li>`).join("");
  document.querySelector("[data-ideal-para]").textContent = product.idealPara;

  document.querySelector("[data-product-faqs]").innerHTML = product.faqs
    .map((f) => `<div class="pdp-faq-item"><h3${f.destacada ? ' class="pdp-faq-question--accent"' : ""}>${f.p}</h3><p>${f.r}</p></div>`)
    .join("");

  const reviewsEl = document.querySelector("[data-product-reviews]");
  if (reviewsEl && product.resenas) {
    reviewsEl.innerHTML = product.resenas
      .map(
        (r) => `
      <article class="review-card">
        <img class="review-photo" src="${r.foto}" alt="Foto publicada por ${r.nombre}" width="84" height="84" loading="lazy">
        <div class="review-body">
          <strong class="review-name">${r.nombre}</strong>
          <span class="review-city">${r.ciudad || ""}</span>
          <div class="review-stars">${starRating(r.rating)}</div>
          <p class="review-text">${r.texto}</p>
        </div>
      </article>`
      )
      .join("");
  }

  initPhotoLightbox(document);

  initOrderModal(product);

  const aiAudioEl = document.getElementById("ai-audio");
  if (aiAudioEl) aiAudioEl.src = `assets/audio/${product.id}.mp3`;

  initArViewer(product);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.nombre,
    sku: product.sku,
    description: product.descripcionLarga,
    brand: { "@type": "Brand", name: "GPS Portátiles" },
    offers: {
      "@type": "Offer",
      priceCurrency: "DOP",
      price: product.precio,
      availability: product.disponibilidad === "in-stock" ? "https://schema.org/InStock" : "https://schema.org/PreOrder",
      url: window.location.href,
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviews },
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(ld);
  document.head.appendChild(script);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Inicio", item: "https://www.gpsportatiles.com/index.html" },
      { "@type": "ListItem", position: 2, name: "Catálogo", item: "https://www.gpsportatiles.com/catalogo.html" },
      { "@type": "ListItem", position: 3, name: product.nombre, item: `https://www.gpsportatiles.com/producto-${product.id}.html` },
    ],
  };
  const breadcrumbScript = document.createElement("script");
  breadcrumbScript.type = "application/ld+json";
  breadcrumbScript.textContent = JSON.stringify(breadcrumbLd);
  document.head.appendChild(breadcrumbScript);

  initReveal();
}

function initOrderModal(product) {
  const modal = document.querySelector("[data-order-modal]");
  if (!modal) return;
  const form = modal.querySelector("[data-order-form]");
  const productNameEl = modal.querySelector("[data-order-product-name]");
  const qtyContainer = modal.querySelector("[data-order-qty]");

  const hasTierOffer = product.id === "rastreador-mini-tag";
  const TIERS = [
    { qty: 1, label: "1", discount: 0, badge: null },
    { qty: 2, label: "2", discount: 0.10, badge: "10% OFF" },
    { qty: 3, label: "3+", discount: 0.15, badge: "15% OFF" },
  ];

  let getQty, getUnitPrice;

  if (hasTierOffer) {
    qtyContainer.innerHTML = `
      <span class="order-qty-label">Elegir cantidad</span>
      <div class="qty-tiers">
        ${TIERS.map(
          (t, i) => `
        <label class="qty-tier">
          <input type="radio" name="qtyTier" value="${i}" data-tier-radio ${i === 0 ? "checked" : ""}>
          <span class="qty-tier-count">${t.label}</span>
          ${t.badge ? `<span class="qty-tier-badge">${t.badge}</span>` : `<span class="qty-tier-badge qty-tier-badge--empty"></span>`}
          <span class="qty-tier-price">${formatPrice(Math.floor(product.precio * (1 - t.discount)))}${t.qty > 1 ? " c/u" : ""}</span>
        </label>`
        ).join("")}
      </div>
      <div class="qty-exact" data-qty-exact>
        <label for="order-qty-exact">Cantidad exacta</label>
        <input type="number" id="order-qty-exact" data-qty-exact-input value="1" min="1" max="20" inputmode="numeric">
      </div>
    `;
    const radios = Array.from(qtyContainer.querySelectorAll("[data-tier-radio]"));
    const tiersWrap = qtyContainer.querySelector(".qty-tiers");
    const exactInput = qtyContainer.querySelector("[data-qty-exact-input]");

    function tierIndexForQty(qty) {
      if (qty >= 3) return 2;
      if (qty === 2) return 1;
      return 0;
    }

    // Elegir un tramo (1 / 2 / 3+) actualiza el número exacto al valor típico de ese tramo.
    tiersWrap.addEventListener("change", (e) => {
      const target = e.target;
      if (!target || target.name !== "qtyTier") return;
      const idx = parseInt(target.value, 10);
      exactInput.value = String(TIERS[idx].qty);
      updateSummary();
    });

    // Editar el número directamente mueve la selección del tramo que corresponda,
    // así siempre queda sincronizado en ambos sentidos.
    exactInput.addEventListener("input", () => {
      let n = parseInt(exactInput.value, 10);
      if (!n || n < 1) n = 1;
      if (n > 20) n = 20;
      const idx = tierIndexForQty(n);
      radios[idx].checked = true;
      updateSummary();
    });

    getQty = () => {
      const n = parseInt(exactInput.value, 10);
      if (!n || n < 1) return 1;
      return Math.min(n, 20);
    };
    getUnitPrice = () => {
      const idx = tierIndexForQty(getQty());
      return Math.floor(product.precio * (1 - TIERS[idx].discount));
    };
  } else {
    qtyContainer.innerHTML = `
      <div class="qty-row">
        <span class="qty-label">Cantidad</span>
        <div class="qty-stepper">
          <button type="button" class="qty-btn" data-qty-minus aria-label="Quitar una unidad">−</button>
          <input type="number" class="qty-input" data-qty-input value="1" min="1" max="20" inputmode="numeric" aria-label="Cantidad">
          <button type="button" class="qty-btn" data-qty-plus aria-label="Agregar una unidad">+</button>
        </div>
      </div>
    `;
    const qtyInput = qtyContainer.querySelector("[data-qty-input]");
    const qtyMinus = qtyContainer.querySelector("[data-qty-minus]");
    const qtyPlus = qtyContainer.querySelector("[data-qty-plus]");

    getQty = () => {
      const n = parseInt(qtyInput.value, 10);
      if (!n || n < 1) return 1;
      return Math.min(n, 20);
    };
    getUnitPrice = () => product.precio;

    qtyInput.addEventListener("change", () => {
      qtyInput.value = getQty();
      updateSummary();
    });
    qtyMinus.addEventListener("click", () => {
      qtyInput.value = Math.max(1, getQty() - 1);
      updateSummary();
    });
    qtyPlus.addEventListener("click", () => {
      qtyInput.value = Math.min(20, getQty() + 1);
      updateSummary();
    });
  }

  function updateSummary() {
    if (!productNameEl) return;
    const qty = getQty();
    const unit = getUnitPrice();
    const subtotal = unit * qty;
    const qtyText = qty > 1 ? ` × ${qty} = ${formatPrice(subtotal)}` : ` — ${formatPrice(unit)}`;
    productNameEl.textContent = `${product.nombre}${qtyText}`;
  }
  updateSummary();

  document.querySelectorAll("[data-order-open]").forEach((btn) => {
    btn.addEventListener("click", () => {
      updateSummary();
      if (typeof modal.showModal === "function") modal.showModal();
    });
  });
  modal.querySelectorAll("[data-order-close]").forEach((btn) => {
    btn.addEventListener("click", () => modal.close());
  });
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close(); // clic fuera del formulario cierra el modal
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const city = (data.get("city") || "").toString().trim();
    const qty = getQty();
    const unit = getUnitPrice();
    const subtotal = unit * qty;
    const msg =
      `Hola 🛒 Quiero realizar un pedido:\n` +
      `Producto: ${product.nombre}\n` +
      `Cantidad: ${qty}\n` +
      `Precio unitario: ${formatPrice(unit)}\n` +
      `Total: ${formatPrice(subtotal)}\n` +
      `Nombre: ${name}\n` +
      `Teléfono: ${phone}\n` +
      `Correo: ${email}\n` +
      `Ciudad: ${city}`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
    modal.close();
    form.reset();
    const exactWrapReset = qtyContainer.querySelector("[data-qty-exact]");
    if (exactWrapReset) exactWrapReset.hidden = true;
    updateSummary();
  });
}

function initPhotoLightbox(scopeEl) {
  const lightbox = document.querySelector("[data-lightbox]");
  if (!lightbox) return;
  const img = lightbox.querySelector("[data-lightbox-img]");
  const closeBtn = lightbox.querySelector("[data-lightbox-close]");

  function open(src, alt) {
    img.src = src;
    img.alt = alt || "";
    lightbox.hidden = false;
  }
  function close() {
    lightbox.hidden = true;
    img.src = "";
  }

  scopeEl.querySelectorAll(".review-photo, .zoomable-img").forEach((photo) => {
    photo.addEventListener("click", () => open(photo.src, photo.alt));
  });
  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) close(); // clic fuera de la imagen cierra
  });
}

function initOfferTimer() {
  const wrap = document.querySelector("[data-offer-timer]");
  if (!wrap || wrap.dataset.wired) return;
  wrap.dataset.wired = "1";

  const valueEl = wrap.querySelector("[data-offer-timer-value]");
  const labelEl = wrap.querySelector("[data-offer-timer-label]");
  const DURATION = 9 * 60;
  let remaining = DURATION;
  let paused = false;

  function render() {
    const m = Math.floor(remaining / 60).toString().padStart(2, "0");
    const s = (remaining % 60).toString().padStart(2, "0");
    valueEl.textContent = `${m}:${s}`;
  }
  render();

  setInterval(() => {
    if (paused) return;
    remaining--;
    if (remaining <= 0) {
      paused = true;
      labelEl.textContent = "¡Te dimos otra oportunidad!";
      valueEl.textContent = "";
      wrap.classList.add("offer-timer--restart");
      setTimeout(() => {
        remaining = DURATION;
        labelEl.textContent = "Oferta termina en";
        wrap.classList.remove("offer-timer--restart");
        paused = false;
        render();
      }, 2500);
      return;
    }
    render();
  }, 1000);
}

function initArViewer(product) {
  const openBtn = document.querySelector("[data-ar-open]");
  const overlay = document.querySelector("[data-ar-overlay]");
  if (!openBtn || !overlay || !product.model3d) return;

  const video = overlay.querySelector("[data-ar-video]");
  const errorBox = overlay.querySelector("[data-ar-error]");
  const wrap = overlay.querySelector("[data-ar-model-wrap]");
  const frame = overlay.querySelector("[data-ar-model-frame]");
  const hint = overlay.querySelector("[data-ar-hint]");
  const closeBtn = overlay.querySelector("[data-ar-close]");

  const USAGE_HINT = "Arrastra para girar · pellizca o usa la rueda para hacer zoom · toca la pantalla para moverlo";

  let stream = null;
  let baseX = null, baseY = null;       // punto donde se "colocó" el producto (px en pantalla)
  let baseHeading = null, baseTilt = null; // lectura del giroscopio en el momento de colocarlo
  let orientationActive = false;

  // Precarga el modelo 3D desde que se abre la página del producto, no cuando
  // se toca el botón — así, para cuando el cliente entra a la cámara, el
  // modelo ya está cargado y aparece al instante en vez de tardar.
  frame.src = product.model3d;

  function getHeading(e) {
    if (typeof e.webkitCompassHeading === "number") return e.webkitCompassHeading;
    if (typeof e.alpha === "number") return 360 - e.alpha;
    return null;
  }
  function angleDelta(a, b) {
    let d = a - b;
    d = ((d + 180) % 360 + 360) % 360 - 180;
    return d;
  }

  function placeAt(x, y) {
    baseX = x;
    baseY = y;
    wrap.style.left = `${x}px`;
    wrap.style.top = `${y}px`;
    wrap.style.opacity = "1";
    wrap.style.pointerEvents = "auto";
    // Se toma la orientación actual del teléfono como "punto cero"
    baseHeading = null;
    baseTilt = null;
  }

  function onDeviceOrientation(e) {
    if (baseX === null) return; // todavía no se ha colocado
    const heading = getHeading(e);
    const tilt = typeof e.beta === "number" ? e.beta : null;
    if (heading === null && tilt === null) return;

    if (baseHeading === null) {
      baseHeading = heading;
      baseTilt = tilt;
      return;
    }

    const dH = heading !== null && baseHeading !== null ? angleDelta(heading, baseHeading) : 0;
    const dT = tilt !== null && baseTilt !== null ? tilt - baseTilt : 0;

    const PX_PER_DEG = 14;
    const HIDE_THRESHOLD = 28; // grados de giro antes de ocultarlo

    const offsetX = -dH * PX_PER_DEG;
    const offsetY = dT * PX_PER_DEG;
    const farAway = Math.abs(dH) > HIDE_THRESHOLD || Math.abs(dT) > HIDE_THRESHOLD;

    wrap.style.left = `${baseX + offsetX}px`;
    wrap.style.top = `${baseY + offsetY}px`;
    wrap.style.opacity = farAway ? "0" : "1";
    wrap.style.pointerEvents = farAway ? "none" : "auto";
  }

  async function enableOrientation() {
    if (orientationActive) return;
    try {
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res !== "granted") return;
      }
      window.addEventListener("deviceorientation", onDeviceOrientation);
      orientationActive = true;
    } catch (err) {
      // Sin giroscopio disponible: el producto queda fijo donde se colocó, sin problema.
    }
  }

  function showError() {
    if (errorBox) errorBox.hidden = false;
    if (hint) hint.style.display = "none";
  }

  async function openAr() {
    overlay.hidden = false;
    if (errorBox) errorBox.hidden = true;
    baseX = null;
    baseY = null;
    if (hint) {
      hint.style.display = "";
      hint.textContent = USAGE_HINT;
    }
    if (!frame.src || frame.src === "about:blank") frame.src = product.model3d;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      video.srcObject = stream;
    } catch (err) {
      console.warn("No se pudo acceder a la cámara:", err);
      showError();
      return;
    }

    // Aparece de inmediato al centro de la pantalla, sin esperar un toque.
    placeAt(window.innerWidth / 2, window.innerHeight / 2);

    await enableOrientation();
  }

  function closeAr() {
    overlay.hidden = true;
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    video.srcObject = null;
    // El modelo 3D se deja cargado (no se apaga el iframe) para que la
    // próxima vez que se abra la cámara aparezca al instante.
    if (orientationActive) {
      window.removeEventListener("deviceorientation", onDeviceOrientation);
      orientationActive = false;
    }
    baseX = null;
    baseY = null;
  }

  openBtn.addEventListener("click", openAr);
  closeBtn.addEventListener("click", closeAr);

  // Un toque sobre el video (fuera del modelo) lo mueve ahí.
  video.addEventListener("click", (e) => {
    placeAt(e.clientX, e.clientY);
  });
}

/* ------------------------------------------------------------------ */
/* Chat de preguntas (portada) — sin IA, guionado por botones.          */
/* ------------------------------------------------------------------ */

// Configura estos dos valores para que los mensajes de "cliente potencial"
// lleguen a tu Telegram. Cómo conseguirlos:
//   1) Habla con @BotFather en Telegram, crea un bot con /newbot y copia el
//      token que te da (algo como "123456789:AAExxxxxxxxxxxxxxxxxxxxxxx").
//   2) Agrega ese bot a tu canal o grupo (o inicia un chat privado con él).
//   3) Para el chat_id: si es un canal, usa "@tu_canal" (si es público) o
//      consíguelo con el bot @userinfobot / @getidsbot.
// IMPORTANTE: como este es un sitio estático (sin servidor propio), este
// token queda visible en el código fuente para cualquiera que lo inspeccione.
// Con un bot dedicado solo para esto (sin permisos de administrador en nada
// importante), el riesgo real es bajo — como mucho, alguien podría enviar
// mensajes falsos a ese chat — pero es información que debes conocer.
const TELEGRAM_BOT_TOKEN = "8695616676:AAEeynPELQ82yNgVC28o0mVnS-r1Tr7L8JY"; // @GORDOGPS_BOT
const TELEGRAM_CHAT_ID = "1114745675"; // ID personal de Joelvin Diaz

const CHAT_TOPICS = [
  {
    id: "productos",
    q: "¿Qué rastreadores GPS tienen disponibles?",
    a: "Tenemos rastreadores para personas, vehículos, mascotas y objetos de valor — incluyendo un modelo mini que no necesita SIM ni pagos mensuales. Todos están disponibles ahora mismo.",
    ctaLabel: "Ver catálogo completo",
    ctaHref: "catalogo.html",
  },
  {
    id: "envio",
    q: "¿Cuánto cuesta el envío y cuánto tarda?",
    a: "Hacemos envío gratis a todo el país.",
  },
  {
    id: "garantia",
    q: "¿Los productos tienen garantía?",
    a: "Sí, todos nuestros equipos incluyen 6 meses de garantía contra defectos de fábrica.",
  },
  {
    id: "ver-antes",
    q: "¿Puedo ver el producto antes de comprarlo?",
    a: "Sí — en la ficha de cada producto lo puedes girar y hacerle zoom en 3D, y hasta verlo con la cámara de tu teléfono como si lo tuvieras en tu mesa, tu cama o en la mano.",
  },
  {
    id: "pedido",
    q: "¿Cómo hago mi pedido?",
    a: "Eliges el producto, das clic en «Realizar pedido», completas tus datos, y el pedido queda confirmado directo por WhatsApp con nuestro equipo.",
  },
  {
    id: "sim",
    q: "¿Necesito pagar un plan mensual?",
    a: "Depende del modelo: la mayoría trabaja con una línea de datos, pero el Rastreador Mini TAG no necesita SIM ni pago mensual — su batería dura hasta 3 años.",
  },
  {
    id: "ubicacion",
    q: "¿Dónde están ubicados?",
    a: "Estamos en Santiago de los Caballeros, República Dominicana, y hacemos envíos a todo el país.",
  },
];

function playChatBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.13, ctx.currentTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.22);
  } catch (err) {
    // Algunos navegadores bloquean audio hasta la primera interacción del
    // usuario — no pasa nada si el primer beep no suena.
  }
}

function normalizeDoPhone(raw) {
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits; // agrega el código de país si falta
  return digits;
}

function sendLeadToTelegram(rawPhone) {
  const phone = normalizeDoPhone(rawPhone);
  const followUp =
    "Hola, notamos que nuestro chat inteligente de gpsportatiles.com respondió algunas dudas, me gustaría saber si tienes alguna otra duda o necesitas información de algún artículo en específico.";
  const waLink = `https://wa.me/${phone}?text=${encodeURIComponent(followUp)}`;
  const text = `📲 Cliente potencial desde el chat de la web\nTeléfono: +${phone}\n${waLink}`;

  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN.indexOf("TU_") === 0) {
    console.warn("Chat: falta configurar TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID en main.js.");
    return;
  }
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text }),
  }).catch(() => {
    console.warn("Chat: no se pudo enviar el aviso a Telegram.");
  });
}

function initChatWidget() {
  const widget = document.querySelector("[data-chat-widget]");
  if (!widget) return;

  const toggleBtn = widget.querySelector("[data-chat-toggle]");
  const closeBtn = widget.querySelector("[data-chat-close]");
  const panel = widget.querySelector("[data-chat-panel]");
  const messagesEl = widget.querySelector("[data-chat-messages]");
  const dot = widget.querySelector("[data-chat-dot]");
  const notify = widget.querySelector("[data-chat-notify]");
  const notifyClose = widget.querySelector("[data-chat-notify-close]");

  let askedForPhone = false;
  let answeredTopics = [];

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addMessage(text, sender) {
    const el = document.createElement("div");
    el.className = `chat-msg chat-msg--${sender}`;
    el.textContent = text;
    messagesEl.appendChild(el);
    scrollToBottom();
    playChatBeep();
  }

  function addBotMessageWithTyping(text, callback) {
    const typing = document.createElement("div");
    typing.className = "chat-typing";
    typing.innerHTML = "<span></span><span></span><span></span>";
    messagesEl.appendChild(typing);
    scrollToBottom();
    const delay = 700 + Math.random() * 700;
    setTimeout(() => {
      typing.remove();
      addMessage(text, "bot");
      if (callback) callback();
    }, delay);
  }

  function addWhatsAppCTA() {
    const el = document.createElement("a");
    el.className = "chat-cta-whatsapp";
    el.target = "_blank";
    el.rel = "noopener";
    el.href = waLink();
    el.innerHTML = `${iconUse("icon-whatsapp")}Hablar por WhatsApp ahora`;
    messagesEl.appendChild(el);
    scrollToBottom();
  }

  function showMenu() {
    const remaining = CHAT_TOPICS.filter((t) => answeredTopics.indexOf(t.id) === -1);
    const wrap = document.createElement("div");
    wrap.className = "chat-options";
    if (remaining.length) {
      remaining.forEach((topic) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "chat-option-btn";
        btn.textContent = topic.q;
        btn.addEventListener("click", () => selectTopic(topic, btn));
        wrap.appendChild(btn);
      });
    }
    messagesEl.appendChild(wrap);
    if (answeredTopics.length > 0) addWhatsAppCTA();
    scrollToBottom();
  }

  function disableAllOptions() {
    messagesEl.querySelectorAll(".chat-option-btn").forEach((b) => (b.disabled = true));
  }

  function selectTopic(topic, btnEl) {
    disableAllOptions();
    addMessage(topic.q, "user");
    answeredTopics.push(topic.id);

    addBotMessageWithTyping(topic.a, () => {
      const afterAnswer = () => {
        if (topic.ctaLabel && topic.ctaHref) {
          const link = document.createElement("a");
          link.className = "chat-option-btn";
          link.href = topic.ctaHref;
          link.textContent = topic.ctaLabel + " →";
          const wrap = document.createElement("div");
          wrap.className = "chat-options";
          wrap.appendChild(link);
          messagesEl.appendChild(wrap);
          scrollToBottom();
        }
        setTimeout(showMenu, 350);
      };

      if (!askedForPhone) {
        askedForPhone = true;
        setTimeout(() => {
          addBotMessageWithTyping(
            "Para brindarte una mejor asistencia, ¿me permites tu número de teléfono? 📱",
            () => showPhoneForm(afterAnswer)
          );
        }, 400);
      } else {
        afterAnswer();
      }
    });
  }

  function showPhoneForm(onDone) {
    const wrap = document.createElement("div");
    wrap.className = "chat-phone-form";
    wrap.innerHTML = `
      <input type="tel" inputmode="numeric" autocomplete="off" placeholder="Ej. 8095551234" data-chat-phone-input>
      <div class="chat-phone-actions">
        <button type="button" class="chat-option-btn" data-chat-phone-send disabled>Enviar</button>
      </div>
      <button type="button" class="chat-phone-skip" data-chat-phone-skip>Prefiero no dar mi número</button>
    `;
    messagesEl.appendChild(wrap);
    scrollToBottom();

    const input = wrap.querySelector("[data-chat-phone-input]");
    const sendBtn = wrap.querySelector("[data-chat-phone-send]");
    const skipBtn = wrap.querySelector("[data-chat-phone-skip]");
    let userTyped = false; // solo cuenta como "escrito" si hay tecleo real, no autocompletado silencioso

    function isValid() {
      return userTyped && input.value.trim().replace(/\D/g, "").length >= 10;
    }
    function refreshBtn() {
      sendBtn.disabled = !isValid();
    }

    input.addEventListener("keydown", () => { userTyped = true; });
    input.addEventListener("paste", () => { userTyped = true; });
    input.addEventListener("input", refreshBtn);

    function finish() {
      wrap.remove();
      onDone();
    }

    sendBtn.addEventListener("click", () => {
      if (!isValid()) {
        input.focus();
        return;
      }
      const raw = input.value.trim();
      // Paso de confirmación explícito antes de enviar nada a Telegram.
      wrap.innerHTML = `
        <p class="chat-phone-confirm">¿Confirmas que este es tu número? <strong>${raw}</strong></p>
        <div class="chat-phone-actions">
          <button type="button" class="chat-option-btn" data-chat-phone-confirm>Sí, confirmar</button>
          <button type="button" class="chat-option-btn" data-chat-phone-edit>Corregir</button>
        </div>
      `;
      wrap.querySelector("[data-chat-phone-confirm]").addEventListener("click", () => {
        sendLeadToTelegram(raw);
        addMessage(raw, "user");
        wrap.remove();
        addBotMessageWithTyping("¡Perfecto, gracias! En un momento alguien de nuestro equipo puede escribirte. Mientras tanto, ¿en qué más te ayudo?", onDone);
      });
      wrap.querySelector("[data-chat-phone-edit]").addEventListener("click", () => {
        finish(); // simplemente cierra sin enviar; puede volver a intentarlo desde el menú si quiere
      });
      scrollToBottom();
    });
    skipBtn.addEventListener("click", finish);
  }

  function startConversation() {
    if (messagesEl.dataset.started) return;
    messagesEl.dataset.started = "1";
    addBotMessageWithTyping("¡Hola! 👋 Soy del equipo de GPS Portátiles. ¿En qué puedo ayudarte hoy?", showMenu);
  }

  function openChat() {
    widget.classList.add("is-open");
    panel.hidden = false;
    if (dot) dot.hidden = true;
    if (notify) notify.hidden = true;
    startConversation();
  }
  function closeChat() {
    widget.classList.remove("is-open");
    panel.hidden = true;
  }

  toggleBtn.addEventListener("click", () => {
    if (panel.hidden) openChat();
    else closeChat();
  });
  closeBtn.addEventListener("click", closeChat);

  if (notify) {
    setTimeout(() => {
      if (panel.hidden) {
        notify.hidden = false;
        if (dot) dot.hidden = false;
        playChatBeep();
      }
    }, 1800);
    notify.addEventListener("click", (e) => {
      if (e.target === notifyClose) return;
      openChat();
    });
    if (notifyClose) {
      notifyClose.addEventListener("click", (e) => {
        e.stopPropagation();
        notify.hidden = true;
      });
    }
    setTimeout(() => {
      if (notify && !notify.hidden) notify.hidden = true;
    }, 14000);
  }
}

function initGalleryZoom() {
  const main = document.querySelector("[data-gallery-main]");
  if (!main) return;
  if (main.classList.contains("has-3d")) return; // el visor 3D trae su propio zoom (rueda/pellizco)
  const toggle = () => {
    const zoomed = main.classList.toggle("zoomed");
    main.setAttribute("aria-pressed", String(zoomed));
  };
  main.addEventListener("click", toggle);
  main.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
}

/* ------------------------------------------------------------------ */
/* 8. Formularios                                                        */
/* ------------------------------------------------------------------ */
function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const phone = (data.get("phone") || "").toString().trim();
    const topic = (data.get("topic") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    const lines = [`Hola, soy ${name}.`];
    if (topic) lines.push(`Motivo: ${topic}.`);
    if (message) lines.push(message);
    if (phone) lines.push(`Mi teléfono: ${phone}.`);
    const text = lines.join(" ");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    form.reset();
  });
}


/* ------------------------------------------------------------------ */
/* Vitrina 3D en las tarjetas de producto — cada tarjeta arranca con el */
/* ícono plano (pinta al instante) y, solo cuando entra en pantalla,    */
/* se le monta el visor 3D real (girando solo, sin interacción, igual  */
/* que la vitrina del hero) encima del ícono. Así ninguna tarjeta que   */
/* el usuario no ve llega a cargar su modelo.                          */
/* ------------------------------------------------------------------ */
function initCardModels() {
  const targets = document.querySelectorAll(".card-product__media[data-model3d]");
  if (!targets.length) return;

  const mount = (el) => {
    if (el.querySelector("iframe")) return;
    const src = el.dataset.model3d;
    const frame = document.createElement("iframe");
    frame.src = src + (src.includes("?") ? "&static=1" : "?static=1");
    frame.loading = "lazy";
    frame.tabIndex = -1;
    frame.setAttribute("aria-hidden", "true");
    frame.className = "card-product__frame";
    el.appendChild(frame);
    el.classList.add("has-frame");
  };

  if (!("IntersectionObserver" in window)) {
    targets.forEach(mount); // navegadores muy viejos: cargar directo, sin lazy
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          mount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px 0px" }
  );
  targets.forEach((el) => observer.observe(el));
}


function initAudioPlayer() {
  const btn = document.getElementById("audio-player-btn");
  const audio = document.getElementById("ai-audio");
  if (!btn || !audio) return;

  btn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", () => btn.classList.add("is-playing"));
  audio.addEventListener("pause", () => btn.classList.remove("is-playing"));
  audio.addEventListener("ended", () => btn.classList.remove("is-playing"));
}

document.addEventListener("DOMContentLoaded", () => {
  initLoader();
  initHeaderScrollState();
  initThemeToggle();
  initNavToggle();
  initBackToTop();
  initHeaderSearch();
  initBuyNotifications();
  initAccordion();
  initAccordionReflow();
  initHomeGrids();
  initHeroShowcase();
  initChatWidget();
  initCatalog();
  initProductDetail();
  initCardModels();
  initGalleryZoom();
  initContactForm();
  initAudioPlayer();
  initReveal();

  document.querySelectorAll("[data-wa-generic]").forEach((el) => (el.href = waLink()));
});
