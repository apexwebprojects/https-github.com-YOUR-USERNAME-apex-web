/* Apex Web Development — front-end */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const el = (t, c, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
  const telHref = p => "tel:" + String(p || "").replace(/[^\d+]/g, "");
  const fmtPhone = p => {
    const d = String(p || "").replace(/\D/g, "");
    if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
    return p;
  };
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

  let CONTENT = null;

  // ---------- render ----------
  function render(c) {
    const b = c.business || {}, hero = c.hero || {};
    const phone = b.phone || "";

    // nav / logo
    $("#logoName").textContent = (b.name || "Apex").split(" ")[0];
    const np = $("#navPhone");
    np.href = telHref(phone); np.querySelector("span").textContent = fmtPhone(phone);
    $("#footName").textContent = b.name || "Apex Web Development";
    $("#footTag").textContent = b.tagline || "";
    $("#formPhone").textContent = fmtPhone(phone);

    // hero
    $("#heroEyebrow").textContent = hero.eyebrow || "";
    $("#heroHeadline").innerHTML = highlight(hero.headline || "");
    animateHeadline($("#heroHeadline"));
    $("#heroSub").textContent = hero.sub || "";
    $("#heroCta1").textContent = hero.ctaPrimary || "Get a Quote";
    $("#heroCta2").textContent = hero.ctaSecondary || "See My Work";
    const stats = [["stat1num", "stat1label"], ["stat2num", "stat2label"], ["stat3num", "stat3label"]];
    $("#heroStats").innerHTML = stats.map(([n, l]) =>
      `<div class="stat"><div class="num">${esc(hero[n] || "")}</div><div class="lbl">${esc(hero[l] || "")}</div></div>`).join("");

    // services
    $("#servicesGrid").innerHTML = (c.services || []).map((s, i) =>
      `<div class="card reveal ${i % 3 === 1 ? "d1" : i % 3 === 2 ? "d2" : ""}">
        <div class="ico">${esc(s.icon || "✦")}</div>
        <h3>${esc(s.title)}</h3><p>${esc(s.desc)}</p></div>`).join("");

    // process
    $("#stepsGrid").innerHTML = (c.process || []).map((s, i) =>
      `<div class="step reveal ${["", "d1", "d2", "d3"][i % 4]}"><div class="n">${esc(s.step)}</div><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></div>`).join("");

    // portfolio
    $("#folioGrid").innerHTML = (c.portfolio || []).map((p, i) => folioCard(p, i)).join("");

    // pricing
    $("#priceGrid").innerHTML = (c.pricing || []).map(p => priceCard(p)).join("");
    const care = c.carePlan || {};
    $("#careWrap").innerHTML = (care.enabled === false) ? "" :
      `<div class="care reveal">
        <div><h4>${esc(care.name || "Care Plan")}</h4><p>${esc(care.blurb || "")}</p></div>
        <div style="text-align:right"><div class="ca-price">$${esc(care.price || "")}<span style="font-size:1rem;color:var(--muted)">${esc(care.period || "/mo")}</span></div>
        <a href="#contact" class="btn btn-ghost" style="margin-top:.5rem">Add to any plan</a></div></div>`;

    // about
    const ab = c.about || {};
    $("#aboutHeading").textContent = ab.heading || "";
    $("#aboutBody").textContent = ab.body || "";
    $("#aboutPoints").innerHTML = (ab.points || []).map(p =>
      `<li><span class="tick">${CHECK}</span><span>${esc(p)}</span></li>`).join("");
    $("#aboutAvatar").textContent = (b.owner || "B").charAt(0).toUpperCase();
    $("#aboutSign").textContent = `— ${b.owner || "Ben"}, ${b.name || "Apex"}`;

    // testimonials — auto-advancing slider (content stays admin-editable)
    const quotes = (c.testimonials || []);
    $("#quotesGrid").innerHTML = `
      <div class="q-slider" id="qSlider">
        <div class="q-track" id="qTrack">${quotes.map(t =>
          `<div class="q-slide"><div class="qcard">
            <div class="stars">★★★★★</div><p>"${esc(t.quote)}"</p>
            <div class="who"><div class="a">${esc((t.name || "?").charAt(0))}</div>
            <div><div class="n">${esc(t.name)}</div><div class="r">${esc(t.role)}</div></div></div>
          </div></div>`).join("")}</div>
      </div>
      <div class="q-dots" id="qDots">${quotes.map((_, i) =>
        `<button data-i="${i}" aria-label="Testimonial ${i + 1}"></button>`).join("")}</div>`;
    initQuoteSlider(quotes.length);

    // faq
    $("#faqList").innerHTML = (c.faq || []).map(f =>
      `<div class="faq-item"><button class="faq-q">${esc(f.q)}<span class="pm">+</span></button>
       <div class="faq-a"><div>${esc(f.a)}</div></div></div>`).join("");

    // careers
    const careers = c.careers || [];
    $("#careersGrid").innerHTML = careers.length ? careers.map(j =>
      `<div class="career reveal"><div>
        <h4>${esc(j.title)}</h4>
        <div class="meta"><span>📍 ${esc(j.location || "Remote")}</span><span>🗂 ${esc(j.type || "Contract")}</span></div>
        <p>${esc(j.description)}</p></div>
        <a href="mailto:${esc(b.email)}?subject=${encodeURIComponent("Application: " + (j.title || ""))}" class="btn btn-ghost">Apply</a></div>`).join("")
      : `<div class="career-empty">No open positions right now — but I'm always glad to hear from talented people. Reach out any time.</div>`;

    // contact block
    const webHref = b.website ? (/^https?:\/\//.test(b.website) ? b.website : "https://" + b.website) : "";
    $("#ctaContact").innerHTML = `
      <a href="${telHref(phone)}"><span class="ci">📞</span><span>${esc(fmtPhone(phone))}<span class="sub">Call or text ${esc((b.owner || "Ben").split(" ")[0])} directly</span></span></a>
      <a href="mailto:${esc(b.email)}"><span class="ci">✉</span><span>${esc(b.email)}<span class="sub">Email me your project</span></span></a>
      ${b.website ? `<a href="${esc(webHref)}"><span class="ci">🌐</span><span>${esc(b.website)}<span class="sub">Apex on the web</span></span></a>` : ""}
      <a href="#"><span class="ci">📍</span><span>${esc(b.location)}<span class="sub">${esc(b.hours || "")}</span></span></a>`;

    // footer
    const fp = $("#footPhone"); fp.href = telHref(phone); fp.textContent = fmtPhone(phone);
    const fe = $("#footEmail"); fe.href = "mailto:" + (b.email || ""); fe.textContent = b.email || "";
    $("#footCopy").textContent = `© ${new Date().getFullYear()} ${b.name || "Apex Web Development"}. All rights reserved.`;

    // chat header
    $("#chatName").textContent = `${b.owner || "Ben"} — ${(b.name || "Apex").split(" ")[0]}`;
    $("#chatAv").textContent = (b.owner || "B").charAt(0).toUpperCase();
    document.title = `${b.name || "Apex Web Development"} | Custom Websites for Local Businesses`;

    renderMarquee(c); renderPhotoStrip(c);
    initReveal(); initFaq();
    initCounters(); initRotator(c); initFolioNav(); initTilt();
    magneticButtons();
  }

  // optional photo strip near the top — only shows when enabled in admin + has photos
  function renderPhotoStrip(c) {
    const el = $("#photoStrip");
    if (!el) return;
    const g = c.photos || {};
    const imgs = [g.photo1, g.photo2, g.photo3].filter(Boolean);
    if (!g.enabled || !imgs.length) { el.style.display = "none"; el.innerHTML = ""; return; }
    el.style.display = "";
    el.innerHTML = `<div class="wrap"><div class="photo-strip-grid">${imgs.map(src =>
      `<figure class="ph"><img src="${esc(src)}" alt="Recent work by Apex Web Development" loading="lazy"></figure>`).join("")}</div></div>`;
  }

  // scrolling industries ticker — driven by editable content.industries.list
  function renderMarquee(c) {
    const track = $("#marqueeTrack");
    if (!track) return;
    const items = (c.industries && c.industries.list) || [];
    if (!items.length) { track.innerHTML = ""; return; }
    const seq = items.map(x => `<span>${esc(x)}</span><i>✦</i>`).join("");
    track.innerHTML = seq + seq; // duplicated for a seamless loop
  }

  // word-by-word headline reveal (keeps the highlighted word intact)
  function animateHeadline(el) {
    if (!el) return;
    if (matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { el.classList.add("in"); return; }
    const nodes = Array.from(el.childNodes);
    el.innerHTML = "";
    let i = 0;
    nodes.forEach(node => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(tok => {
          if (tok.trim() === "") { el.appendChild(document.createTextNode(tok)); return; }
          const w = el2("span", "word", tok); w.style.setProperty("--i", i++); el.appendChild(w);
        });
      } else {
        const w = el2("span", "word"); w.style.setProperty("--i", i++); w.appendChild(node); el.appendChild(w);
      }
    });
    el.classList.add("in", "words-ready");
  }
  function el2(t, c, txt) { const e = document.createElement(t); if (c) e.className = c; if (txt != null) e.textContent = txt; return e; }

  // interactive hero: a living dot-field that ripples and reacts to the cursor
  function initHeroCanvas() {
    const canvas = document.getElementById("heroCanvas");
    if (!canvas) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    const GAP = 34, R = 120;
    let w = 0, h = 0, dpr = 1, dots = [], t = 0, running = true;
    const mouse = { x: -9999, y: -9999 };

    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let y = GAP; y < h; y += GAP)
        for (let x = GAP; x < w; x += GAP) dots.push({ bx: x, by: y });
    }
    function frame() {
      if (!running) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const d of dots) {
        const wave = Math.sin(d.bx * 0.018 + d.by * 0.02 + t * 1.25) * 1.5;
        let px = d.bx, py = d.by + wave, r = 1.1, col = "rgba(26,22,20,.16)";
        const dx = px - mouse.x, dy = py - mouse.y, dist = Math.hypot(dx, dy);
        if (dist < R) {
          const f = 1 - dist / R;
          px += (dx / (dist || 1)) * f * 16;
          py += (dy / (dist || 1)) * f * 16;
          r = 1.1 + f * 2.8;
          col = "rgba(255,119,51," + (0.22 + f * 0.65).toFixed(3) + ")";
        }
        ctx.beginPath(); ctx.arc(px, py, r, 0, 6.2832); ctx.fillStyle = col; ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    window.addEventListener("mouseout", () => { mouse.x = -9999; mouse.y = -9999; });
    new IntersectionObserver(es => {
      es.forEach(e => {
        const was = running; running = e.isIntersecting;
        if (running && !was) requestAnimationFrame(frame);
      });
    }, { threshold: 0 }).observe(canvas);
    build();
    requestAnimationFrame(frame);
  }

  // floating pollen/spore drift — soft particles rising through the hero
  function initPollen() {
    const canvas = document.getElementById("pollen");
    if (!canvas) return;
    if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    const N = 46, COLS = ["127,176,105", "140,168,142", "76,122,91"]; // sprout, sage, moss
    let w = 0, h = 0, dpr = 1, parts = [], running = true, t = 0;
    function spawn(anywhere) {
      return {
        x: Math.random() * w, y: anywhere ? Math.random() * h : h + 12,
        r: Math.random() * 2 + 0.8, vy: -(Math.random() * 0.28 + 0.12),
        drift: Math.random() * 0.6 + 0.2, phase: Math.random() * 6.28,
        a: Math.random() * 0.4 + 0.16, c: COLS[(Math.random() * COLS.length) | 0]
      };
    }
    function build() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = canvas.getBoundingClientRect(); w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!parts.length) for (let i = 0; i < N; i++) parts.push(spawn(true));
    }
    function frame() {
      if (!running) return;
      t += 0.016; ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy; p.x += Math.sin(t * p.drift + p.phase) * 0.4;
        if (p.y < -12) Object.assign(p, spawn(false));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")"; ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    window.addEventListener("resize", build);
    new IntersectionObserver(es => es.forEach(e => {
      const was = running; running = e.isIntersecting;
      if (running && !was) requestAnimationFrame(frame);
    }), { threshold: 0 }).observe(canvas);
    build();
    requestAnimationFrame(frame);
  }

  // hero mouse-parallax — the organic background layers drift with the cursor for depth
  function initHeroParallax() {
    const hero = document.querySelector(".hero"), bg = document.querySelector(".hero-bg");
    if (!hero || !bg || !window.matchMedia || !matchMedia("(pointer:fine)").matches) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let tx = 0, ty = 0, x = 0, y = 0, active = false;
    hero.addEventListener("mousemove", e => {
      const r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!active) { active = true; loop(); }
    });
    hero.addEventListener("mouseleave", () => { tx = 0; ty = 0; });
    function loop() {
      x += (tx - x) * 0.06; y += (ty - y) * 0.06;
      bg.style.transform = "translate(" + (x * 34).toFixed(1) + "px," + (y * 26).toFixed(1) + "px)";
      if (Math.abs(tx - x) > 0.001 || Math.abs(ty - y) > 0.001 || tx !== 0 || ty !== 0) requestAnimationFrame(loop);
      else active = false;
    }
  }

  // buttons drift subtly toward the cursor
  function magneticButtons() {
    if (!window.matchMedia || !matchMedia("(pointer:fine)").matches) return;
    document.querySelectorAll(".btn").forEach(b => {
      if (b._mag) return; b._mag = true;
      b.addEventListener("mousemove", e => {
        const r = b.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.22;
        const y = (e.clientY - r.top - r.height / 2) * 0.35;
        b.style.transform = `translate(${x}px,${y}px)`;
      });
      b.addEventListener("mouseleave", () => { b.style.transform = ""; });
    });
  }

  // ---------- engagement effects ----------
  function initQuoteSlider(count) {
    if (!count) return;
    const track = $("#qTrack"), dots = Array.from(document.querySelectorAll("#qDots button"));
    let idx = 0, timer = null;
    function go(i) {
      idx = (i + count) % count;
      track.style.transform = `translateX(-${idx * 100}%)`;
      dots.forEach((d, n) => d.classList.toggle("on", n === idx));
    }
    function play() { stop(); timer = setInterval(() => go(idx + 1), 5000); }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    dots.forEach(d => d.addEventListener("click", () => { go(+d.dataset.i); play(); }));
    const slider = $("#qSlider");
    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", play);
    go(0); play();
  }

  function initCounters() {
    // count-up animation on the hero stats when they scroll into view
    const nums = document.querySelectorAll("#heroStats .num");
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        obs.unobserve(e.target);
        const full = e.target.textContent;
        const m = full.match(/^([\d.,]+)(.*)$/);
        if (!m) return;
        const target = parseFloat(m[1].replace(/,/g, "")), suffix = m[2];
        const dec = (m[1].split(".")[1] || "").length;
        const t0 = performance.now(), dur = 1300;
        (function tick(now) {
          const p = Math.min(1, (now - t0) / dur), ease = 1 - Math.pow(1 - p, 3);
          e.target.textContent = (target * ease).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick); else e.target.textContent = full;
        })(t0);
      });
    }, { threshold: 0.4 });
    nums.forEach(n => obs.observe(n));
  }

  function initRotator(c) {
    const el = $("#rotateWord");
    if (!el) return;
    const words = (c.services || []).map(s => s.title).filter(Boolean);
    if (!words.length) { el.closest(".specialty").style.display = "none"; return; }
    let i = 0;
    el.textContent = words[0];
    setInterval(() => {
      el.classList.add("out");
      setTimeout(() => {
        i = (i + 1) % words.length;
        el.textContent = words[i];
        el.classList.remove("out");
      }, 300);
    }, 2800);
  }

  function initFolioNav() {
    const grid = $("#folioGrid"), prev = $("#folioPrev"), next = $("#folioNext");
    if (!grid || !prev || !next) return;
    const step = () => (grid.querySelector(".folio-card") ? grid.querySelector(".folio-card").offsetWidth + 26 : 400);
    prev.addEventListener("click", () => grid.scrollBy({ left: -step(), behavior: "smooth" }));
    next.addEventListener("click", () => grid.scrollBy({ left: step(), behavior: "smooth" }));
  }

  function initTilt() {
    if (!window.matchMedia || !matchMedia("(pointer:fine)").matches) return;
    document.querySelectorAll(".folio-card").forEach(card => {
      card.addEventListener("mousemove", e => {
        const r = card.getBoundingClientRect();
        const rx = ((e.clientY - r.top) / r.height - 0.5) * -6;
        const ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
        card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  function highlight(h) {
    // emphasize a key word with gradient
    const words = ["Calgary", "handmade", "AI phone agents", "websites", "local"];
    let out = esc(h);
    for (const w of words) {
      const re = new RegExp(`\\b(${w})\\b`, "i");
      if (re.test(out)) { out = out.replace(re, '<span class="grad">$1</span>'); break; }
    }
    return out;
  }

  function priceCard(p) {
    const feats = (p.features || []).map(f => `<li>${CHECK}<span>${esc(f)}</span></li>`).join("");
    return `<div class="price reveal ${p.featured ? "featured" : ""}">
      ${p.featured ? '<div class="badge">Most Popular</div>' : ""}
      <h3>${esc(p.name)}</h3><div class="blurb">${esc(p.blurb || "")}</div>
      <div class="amount"><span class="cur">$</span><span class="val">${esc(p.price)}</span><span class="per">${esc(p.period || "")}</span></div>
      <ul>${feats}</ul>
      <a href="#contact" class="btn ${p.featured ? "btn-primary" : "btn-ghost"} btn-block">${esc(p.cta || "Get started")}</a>
    </div>`;
  }

  function folioCard(p, i) {
    const accent = p.accent || "#6d8bff";
    const vis = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.title)}">`
      : `<div class="mock" style="background:linear-gradient(150deg,${esc(accent)},${shade(accent)})">
           <div class="mockbar"><i></i><i></i><i></i></div>
           <div class="mockbody">
             <div class="ml" style="width:70%"></div>
             <div class="ml sm"></div><div class="ml sm" style="width:60%"></div>
             <div class="ml btn" style="background:rgba(255,255,255,.95)"></div>
           </div></div>`;
    const tags = (p.tags || []).map(t => `<span>${esc(t)}</span>`).join("");
    return `<div class="folio-card reveal ${["", "d1", "d2"][i % 3]}">
      <div class="folio-vis">
        <span class="style-tag" style="background:${esc(accent)}cc">${esc(p.style || "")}</span>
        ${vis}
      </div>
      <div class="folio-body">
        <div class="cat">${esc(p.category || "")}</div>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.description || "")}</p>
        <div class="folio-tags">${tags}</div>
        ${(p.link || p.originalUrl) ? `<div class="folio-cta">
          ${p.link ? `<a href="${esc(linkHref(p.link))}" target="_blank" rel="noopener noreferrer" class="folio-open">Open ↗</a>` : ""}
          ${p.originalUrl ? `<a href="${esc(linkHref(p.originalUrl))}" target="_blank" rel="noopener noreferrer" class="folio-orig">See the original</a>` : ""}
        </div>` : ""}
      </div></div>`;
  }
  const linkHref = u => u ? (/^https?:\/\//i.test(u) ? u : "https://" + u) : "#";
  function shade(hex) {
    try {
      const n = parseInt(hex.slice(1), 16);
      let r = (n >> 16) - 40, g = ((n >> 8) & 255) - 30, b = (n & 255) - 10;
      r = Math.max(0, r); g = Math.max(0, g); b = Math.max(0, b);
      return `rgb(${r},${g},${b})`;
    } catch (e) { return "#222"; }
  }

  // ---------- interactions ----------
  function initFaq() {
    document.querySelectorAll(".faq-q").forEach(q => {
      q.addEventListener("click", () => {
        const item = q.closest(".faq-item");
        const a = item.querySelector(".faq-a");
        const open = item.classList.toggle("open");
        a.style.maxHeight = open ? a.scrollHeight + "px" : "0";
      });
    });
  }
  function initReveal() {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); obs.unobserve(e.target); } });
    }, { threshold: 0.12 });
    document.querySelectorAll(".reveal:not(.in)").forEach(r => obs.observe(r));
  }
  function initNav() {
    const nav = $("#nav");
    const bar = $("#scrollProgress");
    const bgfx = $(".bg-fx");
    let ticking = false;
    window.addEventListener("scroll", () => {
      nav.classList.toggle("scrolled", window.scrollY > 20);
      if (bar) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
      }
      if (bgfx && !ticking) {
        ticking = true;
        requestAnimationFrame(() => { bgfx.style.transform = `translateY(${window.scrollY * 0.12}px)`; ticking = false; });
      }
    });
    $("#burger").addEventListener("click", () => $("#navLinks").classList.toggle("mobile-open"));
    $("#navLinks").addEventListener("click", e => { if (e.target.tagName === "A") $("#navLinks").classList.remove("mobile-open"); });
  }

  // ---------- contact form ----------
  function initForm() {
    const form = $("#leadForm"), msg = $("#formMsg");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      msg.className = "form-msg";
      const data = {
        name: $("#lf-name").value.trim(),
        email: $("#lf-email").value.trim(),
        phone: $("#lf-phone").value.trim(),
        message: $("#lf-message").value.trim()
      };
      try {
        const r = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const j = await r.json();
        if (r.ok) {
          msg.className = "form-msg ok";
          msg.textContent = "Thanks " + (data.name.split(" ")[0] || "") + "! Your message is in — I'll get back to you very soon.";
          form.reset();
        } else {
          msg.className = "form-msg err"; msg.textContent = j.error || "Something went wrong.";
        }
      } catch (err) {
        msg.className = "form-msg err"; msg.textContent = "Network error — please call or email instead.";
      }
    });
  }

  // ---------- chat ----------
  const Chat = {
    convId: localStorage.getItem("apex_conv") || null,
    lastId: 0,
    poll: null,
    open: false,
    init() {
      $("#chatFab").addEventListener("click", () => this.toggle());
      $("#chatClose").addEventListener("click", () => this.toggle(false));
      $("#chatStart").addEventListener("click", () => this.start());
      $("#chatSend").addEventListener("click", () => this.send());
      $("#chatInput").addEventListener("keydown", e => { if (e.key === "Enter") this.send(); });
      if (this.convId) { this.showChat(); }
    },
    toggle(force) {
      this.open = force == null ? !this.open : force;
      $("#chatPanel").classList.toggle("open", this.open);
      $("#chatBadge").style.display = "none";
      if (this.open && this.convId) { this.refresh(); this.startPoll(); }
      else { this.stopPoll(); }
    },
    async start() {
      const name = $("#chatPreName").value.trim() || "Visitor";
      const email = $("#chatPreEmail").value.trim();
      try {
        const r = await fetch("/api/chat/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, email }) });
        const j = await r.json();
        this.convId = j.conv_id;
        localStorage.setItem("apex_conv", this.convId);
        localStorage.setItem("apex_name", name);
        this.showChat();
        this.addMsg({ sender: "admin", body: `Hey ${name.split(" ")[0]}! 👋 Thanks for reaching out. What can I help you with?`, ts: Date.now() / 1000 }, true);
        this.startPoll();
      } catch (e) { alert("Couldn't start chat — please call instead."); }
    },
    showChat() {
      $("#chatPre").style.display = "none";
      $("#chatBody").style.display = "flex";
      $("#chatFoot").style.display = "flex";
      this.refresh();
    },
    async refresh() {
      if (!this.convId) return;
      try {
        const r = await fetch(`/api/chat/messages?conv_id=${this.convId}&after=${this.lastId}`);
        const j = await r.json();
        (j.messages || []).forEach(m => this.addMsg(m));
      } catch (e) { }
    },
    addMsg(m, local) {
      if (m.id) this.lastId = Math.max(this.lastId, m.id);
      const body = $("#chatBody");
      const d = el("div", "msg " + (m.sender === "visitor" ? "visitor" : "admin"));
      d.innerHTML = esc(m.body) + `<div class="msg-time">${time(m.ts)}</div>`;
      body.appendChild(d);
      body.scrollTop = body.scrollHeight;
      if (!this.open && m.sender === "admin" && !local) {
        $("#chatBadge").style.display = "grid";
      }
    },
    async send() {
      const input = $("#chatInput"); const text = input.value.trim();
      if (!text || !this.convId) return;
      input.value = "";
      this.addMsg({ sender: "visitor", body: text, ts: Date.now() / 1000 }, true);
      try {
        await fetch("/api/chat/send", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conv_id: this.convId, body: text, name: localStorage.getItem("apex_name") || "" })
        });
      } catch (e) { }
    },
    startPoll() { this.stopPoll(); this.poll = setInterval(() => this.refresh(), 3500); },
    stopPoll() { if (this.poll) clearInterval(this.poll); this.poll = null; }
  };
  function time(ts) {
    const d = new Date((ts || 0) * 1000);
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  // ---------- boot ----------
  async function boot() {
    // 1) Content first — nothing else may block the page from rendering.
    try {
      const r = await fetch("/api/content");
      CONTENT = await r.json();
      render(CONTENT);
    } catch (e) {
      console.error("Failed to load content", e);
    }
    // 2) Safety net — a reveal element must never stay invisible.
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.in)").forEach(function (r) { r.classList.add("in"); });
    }, 2200);
    // 3) Enhancements — each isolated so a single failure can't blank the page.
    [initNav, initForm, function () { Chat.init(); }, initHeroCanvas, initPollen, initHeroParallax]
      .forEach(function (fn) { try { fn(); } catch (e) { console.warn("init skipped:", e); } });
  }
  document.addEventListener("DOMContentLoaded", boot);
})();
