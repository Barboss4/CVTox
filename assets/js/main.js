(() => {
  const data = window.CVTOX_DATA;
  if (!data) return;

  const page = document.body.dataset.page || "home";
  const base = document.body.dataset.base || "";

  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const links = [
    ["home", "Início", `${base}index.html`],
    ["programacao", "Programação", `${base}programacao.html`],
    ["palestrantes", "Palestrantes", `${base}palestrantes.html`],
    ["inscricoes", "Inscrições", `${base}inscricoes.html`],
    ["local", "Local", `${base}local.html`],
    ["comissao", "Comissão", `${base}comissao.html`],
    ["contato", "Contato", `${base}contato.html`]
  ];

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `
      <header class="site-header">
        <div class="container nav-wrap">
          <a class="brand" href="${base}index.html" aria-label="Página inicial do CVTox">
            <img src="${base}assets/img/cvtox-logo.png" alt="Logo do CVTox" />
            <span><strong>${esc(data.event.edition)}</strong><small>${esc(data.event.title)}</small></span>
          </a>
          <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="main-nav" aria-label="Abrir menu">
            <span></span><span></span><span></span>
          </button>
          <nav id="main-nav" class="main-nav" aria-label="Navegação principal">
            ${links.map(([id, label, href]) => `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`).join("")}
          </nav>
        </div>
      </header>`;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `
      <footer class="site-footer">
        <div class="container footer-grid">
          <div>
            <strong>${esc(data.event.edition)} — ${esc(data.event.title)}</strong>
            <p>${esc(data.event.city)}</p>
          </div>
          <div>
            <a href="mailto:${esc(data.contact.email)}">${esc(data.contact.email)}</a>
            <a href="${esc(data.contact.instagramUrl)}" target="_blank" rel="noopener">${esc(data.contact.instagram)}</a>
          </div>
        </div>
        <div class="container footer-bottom">© <span data-year></span> CVTox. Site estático para GitHub Pages.</div>
      </footer>`;
  }

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("open", !open);
    });
    nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));
  }

  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = value;
  };

  setText("[data-event-edition]", data.event.edition);
  setText("[data-event-title]", data.event.title);
  setText("[data-event-subtitle]", data.event.subtitle);
  setText("[data-event-date]", data.event.date);
  setText("[data-event-location]", data.event.location);
  setText("[data-event-city]", data.event.city);
  setText("[data-event-description]", data.event.description);

  document.querySelectorAll("[data-registration-cta]").forEach(cta => {
    cta.textContent = data.event.registrationLabel;
    cta.href = data.event.registrationUrl;
    if (data.event.registrationUrl === "#") cta.setAttribute("aria-disabled", "true");
  });

  const highlights = document.querySelector("[data-highlights]");
  if (highlights) {
    highlights.innerHTML = data.highlights.map(item => `
      <article class="feature-card">
        <div class="feature-icon" aria-hidden="true">${esc(item.icon)}</div>
        <h3>${esc(item.title)}</h3>
        <p>${esc(item.text)}</p>
      </article>`).join("");
  }

  const speakers = document.querySelector("[data-speakers]");

  if (speakers) {

    const speakersToShow =
      page === "home"
        ? data.speakers
        : data.speakers;

    speakers.innerHTML = speakersToShow.map(s => `
      <article class="speaker-card">

        <div class="speaker-photo ${s.photo ? "has-photo" : ""}">
          ${
            s.photo
              ? `<img src="${esc(s.photo)}" alt="Foto de ${esc(s.name)}" />`
              : `<span aria-hidden="true">👤</span>`
          }
        </div>

        <div class="speaker-content">

          <p class="eyebrow">${esc(s.role)}</p>
        <h3>
          ${
            s.url
              ? `
                <a
                  href="${esc(s.url)}"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="speaker-name-link"
                >
                  ${esc(s.name)}
                </a>
              `
              : esc(s.name)
          }
        </h3>

          <p>${esc(s.talk)}</p>

        </div>

      </article>
    `).join("");
  }

  // Na home, todos os palestrantes ficam disponíveis em um carrossel horizontal.
  // Na página Palestrantes, a mesma lista continua sendo exibida inteira em grade.
  const speakerCarousel = document.querySelector("[data-speaker-carousel]");
  if (speakerCarousel) {
    const viewport = speakerCarousel.querySelector("[data-carousel-viewport]");
    const track = speakerCarousel.querySelector(".speaker-carousel-track");
    const prev = speakerCarousel.querySelector("[data-carousel-prev]");
    const next = speakerCarousel.querySelector("[data-carousel-next]");
    const status = speakerCarousel.querySelector("[data-carousel-status]");
    const cards = [...speakerCarousel.querySelectorAll(".speaker-card")];

    const cardStep = () => {
      if (!cards.length) return 0;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      return cards[0].getBoundingClientRect().width + gap;
    };

    const updateCarousel = () => {
      if (!viewport || !cards.length) return;
      const step = cardStep();
      const current = step ? Math.round(viewport.scrollLeft / step) : 0;
      const visible = step ? Math.max(1, Math.round((viewport.clientWidth + (parseFloat(getComputedStyle(track).gap) || 0)) / step)) : 1;
      const lastVisible = Math.min(cards.length, current + visible);

      if (status) status.textContent = `${current + 1}–${lastVisible} de ${cards.length}`;
      if (prev) prev.disabled = viewport.scrollLeft <= 2;
      if (next) next.disabled = viewport.scrollLeft >= viewport.scrollWidth - viewport.clientWidth - 2;
    };

    const move = direction => {
      if (!viewport) return;
      viewport.scrollBy({ left: cardStep() * direction, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => move(-1));
    next?.addEventListener("click", () => move(1));
    viewport?.addEventListener("scroll", () => requestAnimationFrame(updateCarousel), { passive: true });
    window.addEventListener("resize", updateCarousel);
    updateCarousel();
  }

const schedule = document.querySelector("[data-schedule]");

if (schedule) {

  schedule.innerHTML = data.schedule.map(day => `

    <section class="schedule-day">

      <div class="schedule-heading">

        <div>
          <span class="eyebrow">${esc(day.date)}</span>
          <h2>${esc(day.day)}</h2>
        </div>

      </div>

      <div class="schedule-list">

        ${day.items.map(item => `

          <div class="schedule-item">

            <time>${esc(item.time)}</time>

            <div class="schedule-content">

              <strong>${esc(item.title)}</strong>

              ${
                item.speaker
                  ? `<p class="schedule-speaker">${esc(item.speaker)}</p>`
                  : ""
              }

              ${
                item.institution
                  ? `<p class="schedule-institution">${esc(item.institution)}</p>`
                  : ""
              }

              <span class="schedule-type">
                ${esc(item.type)}
              </span>

            </div>

          </div>

        `).join("")}

      </div>

    </section>

  `).join("");

}

  const committee = document.querySelector("[data-committee]");
  if (committee) {
    committee.innerHTML = data.committee.map(member => `
      <article class="committee-card">
        <div class="committee-photo ${member.photo ? "has-photo" : ""}">
          ${member.photo ? `<img src="${esc(member.photo)}" alt="Foto de ${esc(member.name)}" />` : `<span aria-hidden="true">👤</span>`}
        </div>
        <div class="committee-content">
          <p class="eyebrow">${esc(member.role)}</p>
          <h3>${esc(member.name)}</h3>
        </div>
      </article>`
    ).join("");
  }

// ==========================================================
// PATROCINADORES E APOIADORES
// ==========================================================

const sponsors = document.querySelector("[data-sponsors]");

if (sponsors && Array.isArray(data.sponsors)) {

  const groupedSponsors = data.sponsors.reduce((groups, sponsor) => {

    const category = sponsor.category || "Apoio";

    if (!groups[category]) {
      groups[category] = [];
    }

    groups[category].push(sponsor);

    return groups;

  }, {});


  sponsors.innerHTML = Object.entries(groupedSponsors)
    .map(([category, items]) => `

      <section class="sponsor-group">

        <h3>${esc(category)}</h3>

        <div class="sponsor-grid">

          ${items.map(sponsor => {

            const content = `
              <div class="sponsor-logo-wrap">

                ${
                  sponsor.logo
                    ? `
                      <img
                        src="${esc(sponsor.logo)}"
                        alt="${esc(sponsor.name)}"
                        loading="lazy"
                      >
                    `
                    : `
                      <span class="sponsor-placeholder">
                        ${esc(sponsor.name)}
                      </span>
                    `
                }

              </div>

              <p class="sponsor-title">
                ${esc(sponsor.name)}
              </p>
            `;


            if (sponsor.url) {

              return `
                <a
                  class="sponsor-card"
                  href="${esc(sponsor.url)}"
                  target="_blank"
                  rel="noopener"
                  aria-label="${esc(sponsor.name)}"
                >
                  ${content}
                </a>
              `;

            }


            return `
              <div class="sponsor-card">
                ${content}
              </div>
            `;

          }).join("")}

        </div>

      </section>

    `).join("");
}


  setText("[data-venue-name]", data.venue.name);
  setText("[data-venue-address]", data.venue.address);
  setText("[data-venue-note]", data.venue.note);
  setText("[data-contact-email]", data.contact.email);
  setText("[data-contact-instagram]", data.contact.instagram);

  const emailLink = document.querySelector("[data-contact-email-link]");
  if (emailLink) emailLink.href = `mailto:${data.contact.email}`;
  const instaLink = document.querySelector("[data-contact-instagram-link]");
  if (instaLink) instaLink.href = data.contact.instagramUrl;
})();
