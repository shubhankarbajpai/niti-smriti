/* NITI Smriti prototype: one-page app. Every screen is drawn here from data.js and content.js. */
(function () {
  "use strict";

  // =====================================================================
  // Helpers
  // =====================================================================
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const enc = encodeURIComponent;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (iso) => { const [y, m, d] = iso.split("-"); return `${d} ${MONTHS[+m - 1]} ${y}`; };
  const today = "2026-11-10";
  const catName = (c) => (CATEGORIES.find((x) => x.code === c) || {}).name || "";
  const person = (id) => PEOPLE[id] || { name: id, role: "", division: "" };
  const docById = (id) => DOCS.find((d) => d.id === id);
  const groupOf = (div) => (DIVISION_GROUPS.find((g) => g.divisions.includes(div)) || {}).name || "";
  const allDivisions = DIVISION_GROUPS.flatMap((g) => g.divisions);
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function canAccess(d) {
    if (d.access === "Public" || d.access === "NITI-wide") return true;
    if (d.access === "SMD") return USER.divisions.includes(d.division);
    if (d.access === "Restricted") return (d.restrictedTo || []).includes(USER.id) || d.owner === USER.id;
    return false;
  }
  const isPublished = (d) => !d.withdrawn && d.state !== "Submitted" && d.state !== "Withdrawn";
  const visible = () => DOCS.filter((d) => canAccess(d) && isPublished(d));

  const badge = (a) => `<span class="badge ${esc(a)}">${esc(a)}</span>`;
  const srcBadge = (s) => `<span class="src ${s === "Published NITI report" ? "pub" : s === "External agency" ? "ext" : "int"}">${esc(s)}</span>`;
  const verified = (d) => (d.verified ? `<span class="verified" title="Verified by the SMD data steward"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>Verified</span>` : "");
  const sep = `<span class="sep"></span>`;
  function docMeta(d, withDiv = true) {
    return `<div class="meta">${withDiv ? `<a href="#/division/${enc(d.division)}">${esc(d.division)}</a>${sep}` : ""}<span class="cat">${esc(catName(d.category))}</span>${sep}<span>${fmtDate(d.date)}</span>${badge(d.access)}${verified(d)}</div>`;
  }

  // Simple text search with scores
  function tokens(q) { return q.toLowerCase().replace(/[^a-z0-9ऀ-ॿ\s-]/g, " ").split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t)); }
  const STOP = new Set(["the", "and", "of", "on", "in", "for", "to", "a", "an", "all", "what", "has", "have", "is", "are", "which", "who", "me", "since", "their", "its", "already", "done", "niti", "reports", "report", "documents", "document", "give", "show", "list", "with", "by", "from", "this", "that", "work", "used"]);
  function score(d, toks) {
    if (!toks.length) return 1;
    const title = d.title.toLowerCase(), sum = d.summary.toLowerCase();
    const rest = [d.division, d.docType, d.tags.sector, d.tags.ministry, (d.tags.states || []).join(" "), d.efile, d.body.map((b) => b.text).join(" ")].join(" ").toLowerCase();
    let s = 0;
    toks.forEach((t) => {
      const stem = t.length > 4 ? t.replace(/(ing|es|s)$/, "") : t;
      if (title.includes(stem)) s += 3;
      if (sum.includes(stem)) s += 2;
      if (rest.includes(stem)) s += 1;
    });
    return s;
  }
  function find(q, pool) {
    const toks = tokens(q || "");
    return pool.map((d) => ({ d, s: score(d, toks) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || b.d.date.localeCompare(a.d.date)).map((x) => x.d);
  }

  // Toast
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // Download a text file (used for exports and templates)
  function download(name, text, type = "text/plain") {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }

  // Keep uploads and decisions for this visitor between page loads
  const store = {
    get(k, f) { try { const v = localStorage.getItem("smriti." + k); return v ? JSON.parse(v) : f; } catch (e) { return f; } },
    set(k, v) { try { localStorage.setItem("smriti." + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ } }
  };
  store.get("uploads", []).forEach((u) => { if (!docById(u.id)) DOCS.unshift(u); });
  let queueState = store.get("queue", {});
  let withdrawn = store.get("withdrawn", []);
  withdrawn.forEach((id) => { const d = docById(id); if (d) d.withdrawn = true; });
  function saveUploads() { store.set("uploads", DOCS.filter((d) => d.id.startsWith("u"))); }

  // =====================================================================
  // Icons
  // =====================================================================
  const I = {
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
    check: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
    user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6"/><path d="M22 11h-6"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>',
    book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    lock: '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    spark: '<path d="M9.94 14.06 4 20"/><path d="m14 4 1.5 3.5L19 9l-3.5 1.5L14 14l-1.5-3.5L9 9l3.5-1.5z"/>',
    down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
    x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    flag: '<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/>'
  };
  const ico = (n, size = 18) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[n]}</svg>`;

  // =====================================================================
  // Shell: menus, header search, language
  // =====================================================================
  function divisionBlocks(withCount) {
    return DIVISION_GROUPS.map((g, i) => `
      <div class="${i === 0 ? "sector" : ""}">
        <h3>${esc(g.name)}${withCount ? ` <small>${g.divisions.length}</small>` : ""}</h3>
        <ul>${g.divisions.map((d) => `<li><a href="#/division/${enc(d)}">${esc(d)}</a></li>`).join("")}</ul>
      </div>`);
  }
  function groupColumns(blocks) {
    const rest = blocks.slice(1), half = Math.ceil(rest.length / 2);
    return blocks[0] + `<div>${rest.slice(0, half).join("")}</div><div>${rest.slice(half).join("")}</div>`;
  }
  $("#megaDivisions").innerHTML = groupColumns(divisionBlocks(false));
  $("#megaCats").innerHTML = `<div class="menu-col"><ul>${CATEGORIES.slice(0, 2).map(catItem).join("")}</ul></div><div class="menu-col"><ul>${CATEGORIES.slice(2).map(catItem).join("")}</ul></div>`;
  function catItem(c) { return `<li><a href="#/category/${c.code}">Category ${c.code}: ${esc(c.name)}</a><p>${esc(c.desc)}</p></li>`; }
  $("#whoami").textContent = `${USER.name}, ${USER.designation}`;
  $("#avatar").textContent = USER.initials;

  const navItems = $$(".navitem");
  function closeMenus(except) {
    navItems.forEach((it) => { if (it !== except) { it.classList.remove("open"); const b = $("button.navbtn", it); if (b) b.setAttribute("aria-expanded", "false"); } });
  }
  navItems.forEach((it) => {
    const btn = $("button.navbtn", it);
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = !it.classList.contains("open");
      closeMenus(it); it.classList.toggle("open", open); btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".dropdown") || e.target.closest("a")) closeMenus();
    const h = e.target.closest("[data-href]");
    if (h) location.hash = h.dataset.href;
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenus(); closeDrawer(); } });

  $("#topSearch").addEventListener("submit", (e) => {
    e.preventDefault();
    const q = $("#q").value.trim(), scope = $("#scope").selectedIndex;
    let h = `#/search?q=${enc(q)}`;
    if (scope === 1) h += `&mine=1`;
    if (scope === 2) h += `&access=Public`;
    location.hash = h;
  });

  const STR = {
    en: { searchPh: "Search by topic, Division, State or file no.", scopeAll: "All of Smriti", scopeMine: "My Divisions", scopePub: "Published only", find: "Find", home: "Home", divisions: "Divisions", categories: "Document categories", contribute: "Contribute", tools: "Tools", help: "Help", welcome: USER.greeting, lede: "Ask about any work NITI has done, or find a report, note or minutes across Divisions.", askPh: "What has NITI already done on battery swapping?", ask: "Ask", try: "Try", whatDo: "What you can do", recent: "Recently published across NITI", topics: "Topics across Divisions", yourDivs: "Your Divisions" },
    hi: { searchPh: "विषय, प्रभाग, राज्य या फ़ाइल संख्या से खोजें", scopeAll: "संपूर्ण स्मृति", scopeMine: "मेरे प्रभाग", scopePub: "केवल प्रकाशित", find: "खोजें", home: "मुख पृष्ठ", divisions: "प्रभाग", categories: "दस्तावेज़ श्रेणियाँ", contribute: "योगदान", tools: "उपकरण", help: "सहायता", welcome: USER.greetingHi, lede: "नीति आयोग के किसी भी कार्य के बारे में पूछें, या प्रभागों की रिपोर्ट, नोट और कार्यवृत्त खोजें।", askPh: "बैटरी स्वैपिंग पर नीति आयोग ने अब तक क्या किया है?", ask: "पूछें", try: "उदाहरण", whatDo: "आप क्या कर सकते हैं", recent: "नीति आयोग में हाल में प्रकाशित", topics: "प्रभागों में विषय", yourDivs: "आपके प्रभाग" }
  };
  let lang = store.get("lang", "en");
  function applyLang() {
    const s = STR[lang];
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => { const k = el.dataset.i18n; if (s[k]) el.textContent = s[k]; });
    $$("[data-i18n-ph]").forEach((el) => { const k = el.dataset.i18nPh; if (s[k]) el.placeholder = s[k]; });
    $("#langBtn").textContent = lang === "en" ? "हिंदी" : "English";
  }
  $("#langBtn").addEventListener("click", () => { lang = lang === "en" ? "hi" : "en"; store.set("lang", lang); applyLang(); });

  // =====================================================================
  // Router
  // =====================================================================
  function parseHash() {
    const raw = location.hash.replace(/^#/, "") || "/";
    const [path, qs] = raw.split("?");
    const parts = path.split("/").filter(Boolean).map(decodeURIComponent);
    const params = {};
    (qs || "").split("&").filter(Boolean).forEach((kv) => { const [k, v = ""] = kv.split("="); params[decodeURIComponent(k)] = decodeURIComponent(v.replace(/\+/g, " ")); });
    return { parts, params };
  }
  const ROUTES = {
    "": viewHome, search: viewSearch, division: viewDivision, category: viewCategory, doc: viewDoc,
    ask: viewAsk, check: viewCheck, handover: viewHandover, upload: viewUpload, uploads: viewUploads,
    queue: viewQueue, help: viewHelp, notifications: viewNotifications, profile: viewProfile, topic: viewTopic
  };
  function render() {
    closeMenus(); closeDrawer();
    const { parts, params } = parseHash();
    const fn = ROUTES[parts[0] || ""] || viewNotFound;
    const view = $("#view");
    view.innerHTML = "";
    fn(view, parts.slice(1), params);
    $$(".mainnav [data-route]").forEach((a) => a.toggleAttribute("aria-current", (a.dataset.route === "home" && !parts[0]) || a.dataset.route === parts[0]));
    applyLang();
    if (!params.p) window.scrollTo(0, 0);
    document.title = (view.dataset.title ? view.dataset.title + " | " : "") + "NITI Smriti";
  }
  window.addEventListener("hashchange", render);

  function pageHead(view, title, sub, crumbs) {
    view.dataset.title = title;
    return `<div class="pagehead"><div class="wrap">
      ${crumbs ? `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${crumbs.map((c) => c[1] ? ` / <a href="${c[1]}">${esc(c[0])}</a>` : ` / <span>${esc(c[0])}</span>`).join("")}</nav>` : ""}
      <h1>${esc(title)}</h1>${sub ? `<p>${sub}</p>` : ""}
    </div></div>`;
  }

  // =====================================================================
  // Home
  // =====================================================================
  function viewHome(view) {
    view.dataset.title = "";
    const recent = visible().filter((d) => d.status === "Final").sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    view.innerHTML = `
    <section class="hero">
      <span class="hero-mark" lang="hi" aria-hidden="true">स्मृति</span>
      <div class="wrap">
        <h1 data-i18n="welcome">${esc(USER.greeting)}</h1>
        <p class="lede" data-i18n="lede"></p>
        <form class="ask" id="heroAsk">
          <label for="askbox">${ico("spark", 22)}<span class="sr-only">Ask Smriti</span></label>
          <input id="askbox" type="text" data-i18n-ph="askPh" autocomplete="off">
          <button type="submit" data-i18n="ask">Ask</button>
        </form>
        <div class="suggest"><span data-i18n="try">Try</span>${SUGGESTED_QUESTIONS.map((q) => `<a class="chip" href="#/ask?q=${enc(q)}">${esc(q)}</a>`).join("")}</div>
      </div>
    </section>
    <div class="wrap">
      <section class="section" aria-labelledby="h-do">
        <div class="section-head"><h2 id="h-do" data-i18n="whatDo">What you can do</h2></div>
        <div class="actions">
          <a class="action-primary" href="#/ask">
            <span class="ico orange">${ico("chat", 20)}</span>
            <h3>Ask Smriti</h3>
            <p>Ask in plain English or Hindi. Every answer cites the documents it draws on, and only from what you may access.</p>
            <span class="go">Ask a question</span>
          </a>
          <div class="action-list">
            ${actionItem("#/search", "search", "Find documents", "Filter by Division, category, State, Ministry or year")}
            ${actionItem("#/upload", "upload", "Upload a document", "Add it with its file number, tags and access level")}
            ${actionItem("#/check", "check", "Check a draft", "Flag figures and positions that differ from earlier NITI work")}
            ${actionItem("#/handover", "user", "Get a handover brief", "Past work, pending items and whom to consult")}
            ${actionItem("#/division/" + enc(USER.divisions[0]), "grid", "Browse your Divisions", "Each Division's library, document types and nodal officer")}
            ${actionItem("#/uploads", "book", "My uploads", "Track status, add versions, withdraw")}
          </div>
        </div>
      </section>

      <section class="section feed">
        <div class="panel" aria-labelledby="h-recent">
          <div class="panel-head"><h2 id="h-recent" data-i18n="recent">Recently published across NITI</h2><a href="#/search?sort=date">See all</a></div>
          <p class="access-note">${ico("shield", 14)} Showing only what you may access.</p>
          ${recent.map((d) => docRow(d)).join("")}
        </div>
        <div>
          <div class="panel mydiv" aria-labelledby="h-mine">
            <div class="panel-head"><h2 id="h-mine" data-i18n="yourDivs">Your Divisions</h2><a href="#/uploads?tab=library">Division library</a></div>
            <div class="divtabs" role="tablist">${USER.divisions.map((d, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${i}">${esc(d)}</button>`).join("")}</div>
            <div id="myDocs" role="tabpanel"></div>
            <div class="pending"><h3>Due from you</h3><ul id="pendingList"></ul><a href="#/upload">Upload now</a></div>
          </div>
          <div class="panel" style="margin-top:24px" aria-labelledby="h-topics">
            <div class="panel-head"><h2 id="h-topics" data-i18n="topics">Topics across Divisions</h2></div>
            <div class="topics">${TOPICS.map((t) => `<a class="topic" href="#/topic/${enc(t)}">${esc(t)}</a>`).join("")}</div>
          </div>
        </div>
      </section>

      <section class="section" aria-labelledby="h-cats">
        <div class="section-head"><h2 id="h-cats" data-i18n="categories">Document categories</h2><a href="#/help?s=access">How access works</a></div>
        <div class="cats">${CATEGORIES.map((c) => `<a href="#/category/${c.code}"><b>${c.code}</b><strong>${esc(c.name)}</strong><span>${esc(c.desc)}</span></a>`).join("")}</div>
      </section>

      <section class="section" id="directory" aria-labelledby="h-dir">
        <div class="section-head"><h2 id="h-dir" data-i18n="divisions">Divisions</h2></div>
        <div class="directory">${groupColumns(divisionBlocks(true))}</div>
      </section>
    </div>`;
    $("#heroAsk").addEventListener("submit", (e) => { e.preventDefault(); location.hash = `#/ask?q=${enc($("#askbox").value || $("#askbox").placeholder)}`; });
    const show = (i) => {
      const div = USER.divisions[i];
      $$(".divtabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(+b.dataset.tab === i)));
      const docs = visible().filter((d) => d.division === div).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
      $("#myDocs").innerHTML = docs.map((d) => `<article class="doc"><h3><a href="#/doc/${d.id}">${esc(d.title)}</a></h3>${docMeta(d, false)}</article>`).join("");
      $("#pendingList").innerHTML = (PENDING_FOR_USER[div] || []).map((p) => `<li>${p.link ? `<a href="${p.link}">${esc(p.text)}</a>` : esc(p.text)}<small>${esc(p.due)}</small></li>`).join("");
    };
    $(".divtabs").addEventListener("click", (e) => { const b = e.target.closest("[data-tab]"); if (b) show(+b.dataset.tab); });
    show(0);
  }
  const actionItem = (href, icon, t, s) => `<a class="action-item" href="${href}"><span class="ico">${ico(icon)}</span><div><strong>${t}</strong><span>${s}</span></div></a>`;
  function docRow(d) {
    return `<article class="doc">
      <h3><a href="#/doc/${d.id}">${esc(d.title)}</a></h3>
      ${docMeta(d)}
      <p>${esc(d.summary)}</p>
      <div class="doc-actions"><button type="button" data-quick="${d.id}">Quick view</button><a href="#/ask?q=${enc("Summarise: " + d.title)}&doc=${d.id}">Ask about this</a></div>
    </article>`;
  }

  // =====================================================================
  // Quick view drawer
  // =====================================================================
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-quick]");
    if (q) { e.preventDefault(); openDrawer(q.dataset.quick); }
  });
  $("#scrim").addEventListener("click", closeDrawer);
  function openDrawer(id) {
    const d = docById(id), dr = $("#drawer");
    dr.innerHTML = `
      <div class="drawer-head"><span>Quick view</span><button type="button" class="icon-btn dark" id="drawerClose" aria-label="Close quick view">${ico("x")}</button></div>
      <div class="drawer-body">
        <h2>${esc(d.title)}</h2>
        ${docMeta(d)}
        <p>${esc(d.summary)}</p>
        <dl class="kv">
          <dt>Document type</dt><dd>${esc(d.docType)}</dd>
          <dt>Source</dt><dd>${srcBadge(d.source)}${d.external ? " " + esc(d.external) : ""}</dd>
          <dt>Author</dt><dd>${esc(person(d.author).name)}</dd>
          <dt>e-Office file no.</dt><dd>${esc(d.efile)}</dd>
          <dt>Status</dt><dd>${esc(d.status)}, ${esc(d.version)}</dd>
        </dl>
        ${d.body[0] ? `<blockquote class="excerpt">${esc(d.body[0].text)}<cite>Page ${d.body[0].page}</cite></blockquote>` : ""}
        <div class="btnrow"><a class="btn" href="#/doc/${d.id}">Open full details</a><a class="btn line" href="#/ask?q=${enc("Summarise: " + d.title)}&doc=${d.id}">Ask about this</a></div>
      </div>`;
    dr.hidden = false; $("#scrim").hidden = false;
    requestAnimationFrame(() => dr.classList.add("open"));
    $("#drawerClose").addEventListener("click", closeDrawer);
    $("#drawerClose").focus();
  }
  function closeDrawer() {
    const dr = $("#drawer");
    if (!dr || dr.hidden) return;
    dr.classList.remove("open"); $("#scrim").hidden = true;
    setTimeout(() => { dr.hidden = true; }, reduceMotion ? 0 : 200);
  }

  // =====================================================================
  // Search results (also used by Division, Category and Topic pages)
  // =====================================================================
  const FACETS = [
    { key: "division", label: "Division", get: (d) => d.division },
    { key: "category", label: "Category", get: (d) => d.category, show: (v) => `${v}: ${catName(v)}` },
    { key: "docType", label: "Document type", get: (d) => d.docType },
    { key: "access", label: "Access level", get: (d) => d.access },
    { key: "source", label: "Source", get: (d) => d.source },
    { key: "status", label: "Status", get: (d) => d.status },
    { key: "sector", label: "Sector", get: (d) => d.tags.sector },
    { key: "state", label: "State / UT", get: (d) => d.tags.states || [] },
    { key: "ministry", label: "Partner Ministry", get: (d) => d.tags.ministry },
    { key: "year", label: "Year", get: (d) => String(d.tags.year) }
  ];
  function viewSearch(view, parts, params, fixed) {
    fixed = fixed || {};
    const q = params.q || "";
    if (!fixed.head) view.dataset.title = q ? `Results for "${q}"` : "Find documents";
    const sel = {};
    FACETS.forEach((f) => { sel[f.key] = (params[f.key] || "").split("|").filter(Boolean); });
    Object.keys(fixed.filter || {}).forEach((k) => { sel[k] = [fixed.filter[k]]; });
    if (params.mine) sel.division = sel.division.length ? sel.division : USER.divisions.slice();

    const base = q ? find(q, DOCS.filter(isPublished)) : DOCS.filter(isPublished).slice();
    const inScope = (d, skip) => FACETS.every((f) => {
      if (f.key === skip || !sel[f.key].length) return true;
      const v = f.get(d); return Array.isArray(v) ? v.some((x) => sel[f.key].includes(x)) : sel[f.key].includes(v);
    });
    const accessible = base.filter(canAccess);
    let results = accessible.filter((d) => inScope(d));
    const hidden = base.filter((d) => !canAccess(d) && inScope(d)).length;
    const sort = params.sort || (q ? "rel" : "date");
    if (sort === "date") results.sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "title") results.sort((a, b) => a.title.localeCompare(b.title));

    const facetHtml = FACETS.filter((f) => !(fixed.filter || {})[f.key]).map((f) => {
      const counts = {};
      accessible.filter((d) => inScope(d, f.key)).forEach((d) => { const v = f.get(d); (Array.isArray(v) ? v : [v]).filter(Boolean).forEach((x) => { counts[x] = (counts[x] || 0) + 1; }); });
      const keys = Object.keys(counts).sort((a, b) => counts[b] - counts[a] || a.localeCompare(b));
      if (!keys.length) return "";
      const open = sel[f.key].length || ["division", "category", "access"].includes(f.key);
      return `<details class="facet" ${open ? "open" : ""}><summary>${f.label}${sel[f.key].length ? ` <em>${sel[f.key].length}</em>` : ""}</summary>
        <ul>${keys.map((k) => `<li><label><input type="checkbox" data-facet="${f.key}" value="${esc(k)}" ${sel[f.key].includes(k) ? "checked" : ""}> <span>${esc(f.show ? f.show(k) : k)}</span> <small>${counts[k]}</small></label></li>`).join("")}</ul></details>`;
    }).join("");

    const chips = FACETS.flatMap((f) => (fixed.filter || {})[f.key] ? [] : sel[f.key].map((v) => `<button type="button" class="fchip" data-remove="${f.key}" data-value="${esc(v)}">${esc(f.show ? f.show(v) : v)} ${ico("x", 12)}</button>`)).join("");

    view.innerHTML = (fixed.head || pageHead(view, q ? `Results for "${q}"` : "Find documents", "", [["Find documents"]])) + `
      <div class="wrap results-wrap">
        <aside class="filters" aria-label="Filters">
          <div class="filters-head"><h2>Filter</h2><a href="${fixed.base || "#/search"}${q ? `?q=${enc(q)}` : ""}">Clear all</a></div>
          ${facetHtml}
        </aside>
        <section class="results">
          ${fixed.base ? "" : `<form class="inline-search" id="inlineSearch"><label class="sr-only" for="iq">Search</label><input id="iq" type="search" value="${esc(q)}" placeholder="Search by topic, Division, State or file no."><button type="submit">${ico("search")} Search</button></form>`}
          <div class="results-bar">
            <div><strong>${results.length}</strong> ${results.length === 1 ? "document" : "documents"} ${chips ? `<span class="fchips">${chips}</span>` : ""}</div>
            <label class="sortby">Sort by <select id="sortSel"><option value="rel" ${sort === "rel" ? "selected" : ""}>Relevance</option><option value="date" ${sort === "date" ? "selected" : ""}>Newest</option><option value="title" ${sort === "title" ? "selected" : ""}>Title</option></select></label>
          </div>
          <p class="access-note">${ico("shield", 14)} Showing only what you may access.${hidden ? ` ${hidden} more ${hidden === 1 ? "document matches" : "documents match"} but ${hidden === 1 ? "is" : "are"} outside your access. <a href="#/help?s=access">How access works</a>` : ""}</p>
          <div class="panel">${results.length ? results.map((d) => docRow(d)).join("") : `<div class="empty"><h3>No documents match</h3><p>Try fewer words, remove a filter, or <a href="#/ask?q=${enc(q)}">ask Smriti</a> instead.</p></div>`}</div>
        </section>
      </div>`;

    const go = (over) => {
      const p = Object.assign({}, params, over);
      FACETS.forEach((f) => { if ((fixed.filter || {})[f.key]) delete p[f.key]; });
      const qs = Object.keys(p).filter((k) => p[k]).map((k) => `${enc(k)}=${enc(p[k])}`).join("&");
      location.hash = (fixed.base || "#/search") + (qs ? "?" + qs : "");
    };
    $$("[data-facet]", view).forEach((cb) => cb.addEventListener("change", () => {
      const k = cb.dataset.facet;
      const vals = new Set(sel[k]); cb.checked ? vals.add(cb.value) : vals.delete(cb.value);
      go({ [k]: Array.from(vals).join("|"), mine: k === "division" ? "" : params.mine });
    }));
    $$("[data-remove]", view).forEach((b) => b.addEventListener("click", () => {
      const k = b.dataset.remove; go({ [k]: sel[k].filter((v) => v !== b.dataset.value).join("|"), mine: "" });
    }));
    $("#sortSel").addEventListener("change", (e) => go({ sort: e.target.value }));
    const iS = $("#inlineSearch");
    if (iS) iS.addEventListener("submit", (e) => { e.preventDefault(); go({ q: $("#iq").value.trim() }); });
  }

  function viewDivision(view, parts, params) {
    const name = parts[0];
    if (!allDivisions.includes(name)) return viewNotFound(view);
    const group = groupOf(name);
    const mine = USER.divisions.includes(name);
    const all = DOCS.filter((d) => d.division === name && isPublished(d));
    const acc = all.filter(canAccess);
    const nodal = NODAL_OFFICERS[name] ? person(NODAL_OFFICERS[name]) : null;
    const types = DOC_TYPES_COMMON.concat(DOC_TYPES_BY_GROUP[group] || []);
    const typeCount = (t) => acc.filter((d) => d.docType === t).length;
    view.dataset.title = name;
    const head = `<div class="pagehead divhead"><div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/">Divisions</a> / <span>${esc(group)}</span></nav>
        <div class="divhead-row">
          <div><h1>${esc(name)}</h1><p>${esc(group)}${mine ? ` <span class="pill">Your Division</span>` : ""}</p></div>
          <div class="divstats">
            <div><b>${acc.length}</b><span>documents you can see</span></div>
            <div><b>${acc.filter((d) => d.status === "Final").length}</b><span>final</span></div>
            <div><b>${nodal ? esc(nodal.name) : "To be nominated"}</b><span>Division nodal officer</span></div>
          </div>
        </div>
        <div class="divactions">${mine ? `<a class="btn" href="#/upload?division=${enc(name)}">${ico("upload", 16)} Upload to this Division</a>` : ""}<a class="btn line" href="#/handover?division=${enc(name)}">${ico("user", 16)} Handover brief</a><a class="btn line" href="#/ask?q=${enc("Brief me on " + name + "'s work and what is pending")}">${ico("chat", 16)} Ask about this Division</a></div>
        <details class="doctypes"><summary>Document types this Division deposits <small>${types.length}</small></summary>
          <ul>${types.map((t) => `<li class="${DOC_TYPES_COMMON.includes(t) ? "" : "special"}">${esc(t)}${typeCount(t) ? ` <small>${typeCount(t)}</small>` : ""}</li>`).join("")}</ul>
          <p class="hint">Types in orange are specific to ${esc(group)}. The rest are common to all Divisions.</p>
        </details>
      </div></div>`;
    if (!all.length) {
      view.innerHTML = head + `<div class="wrap"><div class="panel empty big"><h3>No documents yet</h3><p>${esc(name)} has not deposited any documents in this prototype.${mine ? ` <a href="#/upload?division=${enc(name)}">Upload the first one.</a>` : ""}</p></div></div>`;
      return;
    }
    viewSearch(view, parts, params, { head, base: `#/division/${enc(name)}`, filter: { division: name } });
  }
  function viewCategory(view, parts, params) {
    const c = CATEGORIES.find((x) => x.code === parts[0]);
    if (!c) return viewNotFound(view);
    view.dataset.title = `Category ${c.code}: ${c.name}`;
    const who = CATEGORY_ACCESS[c.code];
    const head = pageHead(view, `Category ${c.code}: ${c.name}`, esc(c.desc) + (who ? `. <span class="muted">${esc(who)}</span>` : ""), [["Document categories"], [c.name]]);
    viewSearch(view, parts, params, { head, base: `#/category/${c.code}`, filter: { category: c.code } });
  }
  const CATEGORY_ACCESS = {
    A: "Default access: the SMD that uploaded it.",
    B: "Default access: shared with all SMDs once final.",
    C: "Access set at upload; signed letters are usually NITI-wide.",
    D: "Access as agreed with the partner organisation."
  };
  function viewTopic(view, parts, params) {
    const t = parts[0];
    view.dataset.title = t;
    const head = pageHead(view, t, "Documents on this topic across Divisions.", [["Topics"], [t]]);
    viewSearch(view, parts, Object.assign({ q: t }, params), { head: head + `<div class="wrap"><a class="asklink" href="#/ask?q=${enc("What has NITI done on " + t + "?")}">${ico("chat", 16)} Ask Smriti what NITI has done on ${esc(t.toLowerCase())}</a></div>`, base: `#/topic/${enc(t)}` });
  }

  // =====================================================================
  // Document page with source viewer
  // =====================================================================
  function viewDoc(view, parts, params) {
    const d = docById(parts[0]);
    if (!d) return viewNotFound(view);
    view.dataset.title = d.title;
    if (!canAccess(d)) {
      view.innerHTML = pageHead(view, "You don't have access to this document", "", [["Document"]]) + `<div class="wrap"><div class="panel empty big">${ico("lock", 28)}<h3>This document is ${esc(d.access === "SMD" ? "limited to its Division" : "restricted to named officers")}</h3><p>Its owner can share it with you. Ask ${esc(person(d.owner).name)} (${esc(person(d.owner).division)}) for access, quoting file no. ${esc(d.efile)}.</p><a class="btn line" href="#/search">Back to search</a></div></div>`;
      return;
    }
    const pg = params.p ? +params.p : null;
    const versions = Array.from({ length: +d.version.replace("v", "") }, (_, i) => +d.version.replace("v", "") - i);
    const related = (d.related || []).map(docById).filter((x) => x && canAccess(x));
    const similar = visible().filter((x) => x.id !== d.id && !d.related.includes(x.id) && (x.tags.sector === d.tags.sector || x.docType === d.docType)).slice(0, 4);
    const canDownload = d.access !== "Restricted" || d.owner === USER.id;
    const pcard = (id, label) => { const p = person(id); return `<div class="person"><span class="pav">${esc(p.name.replace(/^Ms\.\s*/, "").split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><strong>${esc(p.name)}</strong><span>${esc(label)}</span><span>${esc(p.role)}, ${esc(p.division)}</span>${p.previous ? `<span class="muted">Earlier: ${esc(p.previous)}</span>` : ""}</div></div>`; };
    view.innerHTML = `
      <div class="pagehead"><div class="wrap">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a> / <a href="#/division/${enc(d.division)}">${esc(d.division)}</a> / <span>${esc(catName(d.category))}</span></nav>
        <h1>${esc(d.title)}</h1>
        ${docMeta(d)}
      </div></div>
      <div class="wrap docpage">
        <section>
          <div class="panel summary"><p>${esc(d.summary)}</p>
            <div class="btnrow">
              <button class="btn" type="button" id="dlBtn" ${canDownload ? "" : "disabled"}>${ico("down", 16)} Download</button>
              <a class="btn line" href="#/ask?q=${enc("Summarise: " + d.title)}&doc=${d.id}">${ico("chat", 16)} Ask about this</a>
              <button class="btn line" type="button" id="copyBtn">${ico("link", 16)} Copy link</button>
              <button class="btn ghost" type="button" id="flagBtn">${ico("flag", 16)} Flag as outdated</button>
            </div>
          </div>
          <div class="viewer" aria-label="Document preview">
            <div class="viewer-bar"><span>${ico("file", 16)} ${esc(d.title.slice(0, 48))}${d.title.length > 48 ? "..." : ""}.pdf</span><span>${d.body.length} ${d.body.length === 1 ? "excerpt" : "excerpts"}</span></div>
            ${d.body.map((b) => `<div class="vpage ${pg === b.page ? "hit" : ""}" id="page-${b.page}"><span class="pno">Page ${b.page}</span><p>${pg === b.page ? `<mark>${esc(b.text)}</mark>` : esc(b.text)}</p></div>`).join("") || `<div class="vpage"><p class="muted">Preview not available.</p></div>`}
          </div>
          ${related.length ? `<h2 class="sub">Related documents</h2><div class="panel">${related.map((x) => `<article class="doc"><h3><a href="#/doc/${x.id}">${esc(x.title)}</a></h3>${docMeta(x)}</article>`).join("")}</div>` : ""}
        </section>
        <aside>
          <div class="panel side">
            <h2>Details</h2>
            <dl class="kv">
              <dt>Division</dt><dd><a href="#/division/${enc(d.division)}">${esc(d.division)}</a></dd>
              <dt>Category</dt><dd>${d.category}: ${esc(catName(d.category))}</dd>
              <dt>Document type</dt><dd>${esc(d.docType)}</dd>
              <dt>Source</dt><dd>${srcBadge(d.source)}${d.external ? `<br>${esc(d.external)}` : ""}</dd>
              <dt>Access level</dt><dd>${badge(d.access)}</dd>
              <dt>Status</dt><dd>${esc(d.status)} ${verified(d)}</dd>
              <dt>Version</dt><dd>${esc(d.version)}</dd>
              <dt>Date</dt><dd>${fmtDate(d.date)}</dd>
              <dt>Language</dt><dd>${esc(d.language)}</dd>
              <dt>e-Office file no.</dt><dd>${esc(d.efile)}</dd>
              <dt>Tags</dt><dd class="tags">${[d.tags.sector, d.tags.ministry, ...(d.tags.states || []), d.tags.year].filter(Boolean).map((t) => `<a href="#/search?q=${enc(t)}">${esc(t)}</a>`).join("")}</dd>
            </dl>
          </div>
          <div class="panel side"><h2>People</h2>${pcard(d.author, "Author")}${d.owner !== d.author ? pcard(d.owner, "Owner") : `<p class="muted small">Also the current owner.</p>`}</div>
          <div class="panel side"><h2>Versions</h2><ul class="versions">${versions.map((v, i) => `<li><span>v${v}</span><span>${i === 0 ? "Current" : "Earlier version"}</span></li>`).join("")}</ul></div>
          ${similar.length ? `<div class="panel side"><h2>View similar</h2><ul class="linklist">${similar.map((x) => `<li><a href="#/doc/${x.id}">${esc(x.title)}</a><span>${esc(x.division)}</span></li>`).join("")}</ul></div>` : ""}
        </aside>
      </div>`;
    $("#dlBtn").addEventListener("click", () => toast("Download started (prototype: no real file)"));
    $("#copyBtn").addEventListener("click", () => { try { navigator.clipboard.writeText(location.href); } catch (e) { /* ignore */ } toast("Link copied"); });
    $("#flagBtn").addEventListener("click", (e) => { e.currentTarget.disabled = true; e.currentTarget.innerHTML = `${ico("flag", 16)} Flagged`; toast(`Update requested. ${person(d.owner).name} has been told.`); });
    if (pg) { const el = $("#page-" + pg); if (el) setTimeout(() => el.scrollIntoView({ block: "center", behavior: reduceMotion ? "auto" : "smooth" }), 60); }
  }

  // =====================================================================
  // Ask Smriti: answer view with citations
  // =====================================================================
  function viewAsk(view, parts, params) {
    const q = (params.q || "").trim();
    view.dataset.title = "Ask Smriti";
    view.innerHTML = `
      <div class="askpage"><div class="wrap narrow">
        <div class="askhead"><h1>Ask Smriti</h1><p>Answers draw only on documents you may access, and every statement links to its source.</p></div>
        <form class="ask light" id="askForm">
          <label for="askq">${ico("spark", 22)}<span class="sr-only">Your question</span></label>
          <input id="askq" type="text" value="${esc(q)}" placeholder="Ask about any work NITI has done" autocomplete="off">
          <button type="submit">Ask</button>
        </form>
        <div id="thread"></div>
        ${q ? "" : `<div class="starter"><h2>Try asking</h2>${SUGGESTED_QUESTIONS.map((s) => `<a class="starter-q" href="#/ask?q=${enc(s)}">${ico("chat", 16)} ${esc(s)}</a>`).join("")}
          <h2>Or use a tool</h2><div class="btnrow"><a class="btn line" href="#/check">${ico("check", 16)} Check a draft</a><a class="btn line" href="#/handover">${ico("user", 16)} Handover brief</a></div></div>`}
      </div></div>`;
    $("#askForm").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#askq").value.trim(); if (v) location.hash = `#/ask?q=${enc(v)}`; });
    if (!q) { $("#askq").focus(); return; }
    answer(q, params.doc);
  }

  function answer(q, docId) {
    const thread = $("#thread");
    const ql = q.toLowerCase();
    const yearMatch = ql.match(/since (20\d\d)/);
    const isList = LIST_TRIGGERS.some((t) => ql.includes(t));
    const card = document.createElement("article");
    card.className = "answer";
    card.innerHTML = `<div class="you"><span class="pav">${esc(USER.initials)}</span><p>${esc(q)}</p></div><div class="bot"><div class="thinking"><span></span><span></span><span></span> Searching documents you may access</div></div>`;
    thread.appendChild(card);
    const bot = $(".bot", card);

    setTimeout(() => {
      // 1. "Give me all reports on X": a list
      if (isList) {
        let list = find(q.replace(/since 20\d\d/i, ""), visible());
        if (yearMatch) list = list.filter((d) => +d.date.slice(0, 4) >= +yearMatch[1]);
        const hidden = find(q, DOCS.filter((d) => !canAccess(d))).length;
        bot.innerHTML = `<p class="lead">I found <strong>${list.length}</strong> ${list.length === 1 ? "document" : "documents"}${yearMatch ? ` since ${yearMatch[1]}` : ""}.</p>
          <p class="access-note">${ico("shield", 14)} Showing only what you may access.${hidden ? ` ${hidden} more outside your access.` : ""}</p>
          <div class="cards">${list.map((d) => `<a class="dcard" href="#/doc/${d.id}"><strong>${esc(d.title)}</strong><span>${esc(d.summary)}</span><div class="meta">${esc(d.division)}${sep}${srcBadge(d.source)}${sep}${esc(d.status)}${badge(d.access)}</div></a>`).join("") || `<p class="muted">Nothing found. Try different words.</p>`}</div>
          <div class="btnrow"><a class="btn line" href="#/search?q=${enc(q.replace(/^(all|list)\s+(reports|documents)\s+on\s+/i, "").replace(/since 20\d\d/i, ""))}">Open in search with filters</a></div>
          ${feedback()}`;
        wireFeedback(bot);
        return;
      }
      // 2. Scripted answer, or 3. built from best-matching documents
      let script = null;
      if (docId) {
        const d = docById(docId);
        script = { answer: [`${d.summary} {1}`, d.body[1] ? `${d.body[1].text} {2}` : ""].filter(Boolean), cites: [[d.id, (d.body[0] || {}).page || 1]].concat(d.body[1] ? [[d.id, d.body[1].page]] : []), followups: ["Who else has worked on this?", "Show related documents"] };
      } else {
        let best = 0;
        ASK_SCRIPTS.forEach((s) => { const n = s.match.filter((m) => ql.includes(m)).length; if (n > best) { best = n; script = s; } });
      }
      if (!script) {
        const hits = find(q, visible()).slice(0, 3);
        if (!hits.length) {
          bot.innerHTML = `<p class="lead">I couldn't find anything on that in the documents you may access.</p><p>Try different words, or <a href="#/search?q=${enc(q)}">search the library</a> with filters.</p>${feedback()}`;
          wireFeedback(bot); return;
        }
        script = {
          answer: hits.map((d, i) => `${d.division} has a ${d.status === "Final" ? "" : "working "}document on this: ${d.title}. ${d.body[0] ? d.body[0].text : d.summary} {${i + 1}}`),
          cites: hits.map((d) => [d.id, (d.body[0] || {}).page || 1]),
          followups: ["Show me all documents on this", "Who has worked on this?"]
        };
      }
      const cites = script.cites.map(([id, page]) => { const d = docById(id); return d && canAccess(d) ? { d, page } : null; });
      const shown = cites.filter(Boolean);
      const otherDivs = Array.from(new Set(shown.map((c) => c.d.division))).filter((x) => !USER.divisions.includes(x));
      bot.innerHTML = `
        <div class="answer-grid">
          <div class="answer-text" aria-live="polite"></div>
          <aside class="sources"><h3>Sources</h3>${cites.map((c, i) => !c ? "" : `
            <a class="source" id="src-${i + 1}" href="#/doc/${c.d.id}?p=${c.page}">
              <span class="n">${i + 1}</span>
              <span class="st"><strong>${esc(c.d.title)}</strong><span>${esc(c.d.division)}, page ${c.page}</span><span class="badges">${srcBadge(c.d.source)}${badge(c.d.access)}</span></span>
            </a>`).join("")}</aside>
        </div>`;
      const box = $(".answer-text", bot);
      // Drop any statement whose source the officer may not access
      const html = script.answer.filter((p) => !(p.match(/\{(\d+)\}/g) || []).some((m) => !cites[+m.slice(1, -1) - 1]))
        .map((p) => `<p>${esc(p).replace(/\{(\d+)\}/g, (_, n) => `<a class="cite" href="#src-${n}" data-cite="${n}" aria-label="Source ${n}">${n}</a>`)}</p>`).join("");
      const after = () => {
        let extra = "";
        if (script.overlap) extra += `<div class="callout warn">${ico("alert", 18)}<div><strong>Overlap</strong> ${esc(script.overlap)}</div></div>`;
        if (otherDivs.length) extra += `<div class="callout">${ico("grid", 18)}<div><strong>Related work in other Divisions</strong> ${otherDivs.map((x) => `<a href="#/division/${enc(x)}">${esc(x)}</a>`).join(", ")}</div></div>`;
        if (script.pending) extra += `<div class="callout pend"><div><strong>Pending</strong><ul>${script.pending.map((p) => `<li>${esc(p)}</li>`).join("")}</ul></div></div>`;
        extra += `<div class="followups">${(script.followups || []).map((f) => `<a class="chip light" href="#/ask?q=${enc(f)}">${esc(f)}</a>`).join("")}</div>`;
        extra += feedback();
        box.insertAdjacentHTML("beforeend", extra);
        wireFeedback(bot);
      };
      stream(box, html, after);
      bot.addEventListener("click", (e) => {
        const c = e.target.closest("[data-cite]");
        if (!c) return;
        e.preventDefault();
        const s = $("#src-" + c.dataset.cite, bot);
        $$(".source", bot).forEach((x) => x.classList.remove("on"));
        s.classList.add("on"); s.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      });
    }, reduceMotion ? 50 : 700);
  }
  // Reveal the answer word by word, like a live response
  function stream(box, html, done) {
    if (reduceMotion) { box.innerHTML = html; done(); return; }
    const tmp = document.createElement("div"); tmp.innerHTML = html;
    const walker = document.createTreeWalker(tmp, NodeFilter.SHOW_TEXT);
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    const full = nodes.map((n) => n.textContent);
    nodes.forEach((n) => { n.textContent = ""; });
    box.appendChild(tmp);
    let i = 0, w = 0;
    const words = full.map((t) => t.split(/(\s+)/));
    (function tick() {
      for (let k = 0; k < 4 && i < nodes.length; k++) {
        nodes[i].textContent += words[i][w] || ""; w++;
        if (w >= words[i].length) { i++; w = 0; }
      }
      if (i < nodes.length) setTimeout(tick, 18); else done();
    })();
  }
  const feedback = () => `<div class="fb"><span>Was this useful?</span><button type="button" data-fb="up" aria-label="Useful">👍</button><button type="button" data-fb="down" aria-label="Not useful">👎</button><button type="button" data-fb="comment">Add a comment</button></div>`;
  function wireFeedback(root) {
    $$("[data-fb]", root).forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.fb === "comment") {
        const fb = b.closest(".fb");
        fb.insertAdjacentHTML("afterend", `<form class="fbform"><label class="sr-only" for="fbc">Comment</label><input id="fbc" placeholder="What was missing or wrong?"><button class="btn small" type="submit">Send</button></form>`);
        const f = fb.nextElementSibling; $("input", f).focus();
        f.addEventListener("submit", (e) => { e.preventDefault(); f.remove(); toast("Comment sent to the Smriti team"); });
        b.disabled = true;
      } else { toast("Thanks. Your feedback was recorded."); $$("[data-fb=up],[data-fb=down]", root).forEach((x) => { x.disabled = true; }); b.classList.add("on"); }
    }));
  }

  // =====================================================================
  // Check a draft
  // =====================================================================
  function viewCheck(view) {
    view.innerHTML = pageHead(view, "Check a draft", "Upload a draft to see where its figures or positions differ from earlier NITI reports, and where it contradicts itself. The tool flags; you decide.", [["Tools"], ["Check a draft"]]) + `
      <div class="wrap" id="checkArea">
        <div class="panel uploadbox">
          <label class="drop" id="drop">
            <input type="file" id="draftFile" accept=".pdf,.doc,.docx,.txt">
            ${ico("upload", 28)}
            <strong>Drop your draft here, or choose a file</strong>
            <span>PDF or Word. The draft stays private to you and is not added to the repository.</span>
          </label>
          <div class="or">or</div>
          <button class="btn" type="button" id="sampleBtn">${ico("file", 16)} Use the sample draft: EV charging paper, v3</button>
        </div>
      </div>`;
    const start = (name) => runCheck(name);
    $("#sampleBtn").addEventListener("click", () => start(null));
    $("#draftFile").addEventListener("change", (e) => { if (e.target.files[0]) start(e.target.files[0].name); });
    dropzone($("#drop"), (f) => start(f.name));
  }
  function runCheck(fileName) {
    const area = $("#checkArea");
    const steps = ["Reading the draft", "Comparing with earlier NITI reports you may access", "Checking figures against published data", "Checking the draft against itself"];
    area.innerHTML = `<div class="panel progress"><h2>Checking ${esc(fileName || DRAFT_CHECK.title + ", " + DRAFT_CHECK.version)}</h2>${fileName ? `<p class="muted">Prototype: your file is not read. The sample draft is used to show how results look.</p>` : ""}<ol>${steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol><div class="bar"><span></span></div></div>`;
    const lis = $$(".progress li", area), bar = $(".progress .bar span", area);
    let i = 0;
    (function next() {
      if (i > 0) lis[i - 1].classList.add("done");
      if (i < lis.length) { lis[i].classList.add("now"); bar.style.width = ((i + 1) / lis.length * 100) + "%"; i++; setTimeout(next, reduceMotion ? 10 : 550); }
      else showCheck(area);
    })();
  }
  function showCheck(area) {
    const decisions = {};
    const draftHtml = DRAFT_CHECK.sections.map((s) => `<h3>${esc(s.heading)}</h3><p>${esc(s.text).replace(/\[\[(\w+)\|(.+?)\]\]/g, (_, id, t) => `<mark data-flag="${id.replace("b", "")}" id="m-${id}">${t}</mark>`)}</p>`).join("");
    const groups = {};
    DRAFT_CHECK.flags.forEach((f) => { (groups[f.type] = groups[f.type] || []).push(f); });
    area.innerHTML = `
      <div class="checkbar"><div><strong>${esc(DRAFT_CHECK.title)}</strong> <span class="muted">${esc(DRAFT_CHECK.version)}, ${esc(DRAFT_CHECK.division)}</span></div>
        <div><span class="countpill">${DRAFT_CHECK.flags.length} flags</span> <button class="btn line small" type="button" id="exportBtn">${ico("down", 14)} Export report</button> <a class="btn ghost small" href="#/check" id="againBtn">Check another draft</a></div></div>
      <div class="checkgrid">
        <article class="panel draft" aria-label="Draft">${draftHtml}</article>
        <section class="flags" aria-label="Flags">
          ${Object.keys(groups).map((g) => `<h2>${esc(g)} <small>${groups[g].length}</small></h2>${groups[g].map((f) => {
            const c = f.cite ? docById(f.cite[0]) : null;
            return `<div class="flag" id="flag-${f.id}" data-flag="${f.id}">
              <p>${ico("alert", 16)} ${esc(f.text)}</p>
              ${c ? `<a class="flagsrc" href="#/doc/${c.id}?p=${f.cite[1]}">${ico("book", 14)} ${esc(c.title)}, page ${f.cite[1]}</a>` : ""}
              <div class="decide" role="group" aria-label="Your decision"><button type="button" data-d="Accepted">Accept</button><button type="button" data-d="Will revise">Revise</button><button type="button" data-d="Noted">Note</button></div>
              <span class="decision"></span>
            </div>`; }).join("")}`).join("")}
          <p class="hint">The platform flags; you decide. Your decisions are saved in the exported report.</p>
        </section>
      </div>`;
    area.addEventListener("click", (e) => {
      const m = e.target.closest("mark[data-flag], .flag");
      const b = e.target.closest("[data-d]");
      if (b) {
        const fl = b.closest(".flag"); decisions[fl.dataset.flag] = b.dataset.d;
        $(".decision", fl).textContent = "Your decision: " + b.dataset.d;
        fl.classList.add("resolved"); $$("[data-d]", fl).forEach((x) => x.classList.toggle("on", x === b));
        return;
      }
      if (m && !e.target.closest("a")) {
        const id = m.dataset.flag;
        $$("mark", area).forEach((x) => x.classList.toggle("on", x.dataset.flag === id));
        $$(".flag", area).forEach((x) => x.classList.toggle("on", x.dataset.flag === id));
        const target = m.tagName === "MARK" ? $("#flag-" + id) : $(`mark[data-flag="${id}"]`, area);
        if (target) target.scrollIntoView({ block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
      }
    });
    $("#exportBtn").addEventListener("click", () => {
      const lines = [`Consistency check: ${DRAFT_CHECK.title}, ${DRAFT_CHECK.version}`, `Checked on ${fmtDate(today)} by ${USER.name}`, ""];
      DRAFT_CHECK.flags.forEach((f, i) => { const c = f.cite ? docById(f.cite[0]) : null; lines.push(`${i + 1}. ${f.type}`, `   ${f.text}`, c ? `   Source: ${c.title}, page ${f.cite[1]}` : "", `   Decision: ${decisions[f.id] || "Not yet decided"}`, ""); });
      download("consistency-check-report.txt", lines.filter((l) => l !== "").join("\n"));
      toast("Report downloaded");
    });
  }
  function dropzone(el, onFile) {
    ["dragenter", "dragover"].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); el.classList.add("over"); }));
    ["dragleave", "drop"].forEach((ev) => el.addEventListener(ev, (e) => { e.preventDefault(); el.classList.remove("over"); }));
    el.addEventListener("drop", (e) => { const f = e.dataTransfer.files[0]; if (f) onFile(f); });
  }

  // =====================================================================
  // Handover brief
  // =====================================================================
  function viewHandover(view, parts, params) {
    const div = params.division || USER.divisions[1];
    const options = Array.from(new Set(USER.divisions.concat(Object.keys(HANDOVER)))).concat(allDivisions.filter((d) => !USER.divisions.includes(d) && !HANDOVER[d]));
    view.innerHTML = pageHead(view, "Handover brief", "A cited brief on a Division's work: what has been done, what is pending, and whom to consult. Useful on your first day, or when taking over a subject.", [["Tools"], ["Handover brief"]]) + `
      <div class="wrap">
        <form class="panel hform" id="hform">
          <div class="field"><label for="hdiv">Division</label><select id="hdiv">${options.map((d) => `<option ${d === div ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></div>
          <div class="field"><label for="htopic">Topic <span class="muted">(optional)</span></label><input id="htopic" value="${esc(params.topic || (HANDOVER[div] || {}).topic || "")}" placeholder="For example: EV charging"></div>
          <button class="btn" type="submit">Prepare brief</button>
        </form>
        <div id="brief"></div>
      </div>`;
    $("#hdiv").addEventListener("change", (e) => { $("#htopic").value = (HANDOVER[e.target.value] || {}).topic || ""; });
    $("#hform").addEventListener("submit", (e) => { e.preventDefault(); buildBrief($("#hdiv").value, $("#htopic").value); });
    if (params.division) buildBrief(div, $("#htopic").value);
  }
  function buildBrief(div, topic) {
    const out = $("#brief");
    out.innerHTML = `<div class="panel"><div class="thinking pad"><span></span><span></span><span></span> Preparing the brief from documents you may access</div></div>`;
    setTimeout(() => {
      let h = HANDOVER[div];
      if (!h) {
        const docs = visible().filter((d) => d.division === div).sort((a, b) => b.date.localeCompare(a.date));
        if (!docs.length) { out.innerHTML = `<div class="panel empty big"><h3>Not enough documents yet</h3><p>${esc(div)} has not deposited enough documents for a brief in this prototype. Try E-Mobility or Managing Urbanisation.</p></div>`; return; }
        h = { summary: docs.slice(0, 3).map((d, i) => `${d.title}: ${d.summary} {${i + 1}}`), cites: docs.slice(0, 3).map((d) => [d.id, (d.body[0] || {}).page || 1]), pending: docs.filter((d) => d.status !== "Final").map((d) => `${d.title} (${d.status.toLowerCase()})`), consult: Array.from(new Set(docs.map((d) => d.owner))).map((p) => [p, "Owner of documents in this Division"]), key: docs.slice(0, 3).map((d) => d.id) };
      }
      const cites = h.cites.map(([id, page]) => { const d = docById(id); return d && canAccess(d) ? { d, page } : null; });
      const okPara = (p) => !(p.match(/\{(\d+)\}/g) || []).some((m) => !cites[+m.slice(1, -1) - 1]);
      out.innerHTML = `<article class="panel brief">
        <div class="brief-head"><div><h2>${esc(div)}${topic ? `: ${esc(topic)}` : ""}</h2><p class="muted">Prepared for ${esc(USER.name)} on ${fmtDate(today)} from ${cites.filter(Boolean).length} documents you may access</p></div><button class="btn line small" type="button" id="hExport">${ico("down", 14)} Export</button></div>
        <div class="brief-grid">
          <section><h3>What has been done</h3>${h.summary.filter(okPara).map((p) => `<p>${esc(p).replace(/\{(\d+)\}/g, (_, n) => `<a class="cite" href="#/doc/${cites[n - 1].d.id}?p=${cites[n - 1].page}">${n}</a>`)}</p>`).join("")}
            <ol class="refs">${cites.map((c) => !c ? "" : `<li value="${cites.indexOf(c) + 1}"><a href="#/doc/${c.d.id}?p=${c.page}">${esc(c.d.title)}</a> ${srcBadge(c.d.source)}</li>`).join("")}</ol></section>
          <section>
            <h3>Pending</h3><ul class="pendlist">${(h.pending.length ? h.pending : ["Nothing pending in deposited documents"]).map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
            <h3>Whom to consult</h3>${h.consult.map(([id, why]) => { const p = person(id); return `<div class="person"><span class="pav">${esc(p.name.replace(/^Ms\.\s*/, "").split(" ").map((w) => w[0]).join("").slice(0, 2))}</span><div><strong>${esc(p.name)}</strong><span>${esc(why)}</span><span class="muted">${esc(p.role)}, ${esc(p.division)}</span></div></div>`; }).join("")}
            <h3>Key documents</h3><ul class="linklist">${h.key.map(docById).filter((d) => d && canAccess(d)).map((d) => `<li><a href="#/doc/${d.id}">${esc(d.title)}</a><span>${esc(catName(d.category))}</span></li>`).join("")}</ul>
          </section>
        </div></article>`;
      $("#hExport").addEventListener("click", () => {
        const txt = [`Handover brief: ${div}${topic ? " - " + topic : ""}`, `Prepared for ${USER.name}, ${fmtDate(today)}`, "", "WHAT HAS BEEN DONE", ...h.summary.filter(okPara).map((p) => p.replace(/\{(\d+)\}/g, "[$1]")), "", "SOURCES", ...cites.map((c, i) => c ? `[${i + 1}] ${c.d.title}, page ${c.page}` : "").filter(Boolean), "", "PENDING", ...h.pending.map((p) => "- " + p), "", "WHOM TO CONSULT", ...h.consult.map(([id, why]) => `- ${person(id).name}: ${why}`)].join("\n");
        download("handover-brief.txt", txt); toast("Brief downloaded");
      });
    }, reduceMotion ? 20 : 650);
  }

  // =====================================================================
  // Upload
  // =====================================================================
  const ACCESS_HELP = {
    Public: "Already released outputs. Anyone, including the website.",
    "NITI-wide": "Final work any NITI officer may use.",
    SMD: "Work in progress, or for your Division only. When in doubt, choose this.",
    Restricted: "Sensitive work, for named officers only."
  };
  function viewUpload(view, parts, params) {
    const div = params.division && USER.divisions.includes(params.division) ? params.division : USER.divisions[0];
    view.innerHTML = pageHead(view, "Upload a document", "Add a report, note, minutes or a document received from a Ministry, State or research organisation. Never upload classified material or personal files.", [["Contribute"], ["Upload"]]) + `
      <div class="wrap upgrid">
        <form class="panel upform" id="upForm" novalidate>
          <section>
            <h2><span class="step">1</span> Choose the file</h2>
            <label class="drop" id="upDrop"><input type="file" id="upFile">${ico("upload", 26)}<strong>Drop a file here, or choose one</strong><span>PDF, Word, PowerPoint, Excel or CSV, up to 50 MB</span></label>
            <button class="linkbtn" type="button" id="exampleFile">Use an example file instead</button>
            <div id="fileChosen"></div>
          </section>
          <fieldset id="details" disabled>
            <h2><span class="step">2</span> Details <span class="aihint">${ico("spark", 14)} Suggested by Smriti from the file. Check and edit.</span></h2>
            <div class="grid2">
              <div class="field span2"><label for="fTitle">Title</label><input id="fTitle" required></div>
              <div class="field"><label for="fDiv">Division</label><select id="fDiv">${USER.divisions.map((d) => `<option ${d === div ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></div>
              <div class="field"><label for="fCat">Category</label><select id="fCat">${CATEGORIES.map((c) => `<option value="${c.code}">${c.code}: ${esc(c.name)}</option>`).join("")}</select></div>
              <div class="field"><label for="fType">Document type</label><select id="fType"></select></div>
              <div class="field"><label for="fSource">Source</label><select id="fSource"><option>NITI internal</option><option>Published NITI report</option><option>External agency</option></select></div>
              <div class="field" id="extField" hidden><label for="fExt">Received from</label><input id="fExt" placeholder="For example: Ministry of Power"></div>
              <div class="field"><label for="fDate">Document date</label><input id="fDate" type="date" value="${today}"></div>
              <div class="field"><label for="fEfile">e-Office file no.</label><input id="fEfile" placeholder="For example: DMA-21011/5/2026-DMA"></div>
              <div class="field"><label for="fStatus">Status</label><select id="fStatus"><option>Working draft</option><option>Final</option></select></div>
              <div class="field"><label for="fLang">Language</label><select id="fLang"><option>English</option><option>Hindi</option><option>Both</option></select></div>
              <div class="field"><label for="fAuthor">Author</label><input id="fAuthor" value="${esc(USER.name)}"></div>
              <div class="field span2"><label for="fTags">Tags <span class="muted">(sector, States, Ministry; separate with commas)</span></label><input id="fTags"></div>
            </div>
          </fieldset>
          <fieldset id="accessSet" disabled>
            <h2><span class="step">3</span> Who can see it</h2>
            <div class="accesspick">${Object.keys(ACCESS_HELP).map((a) => `<label class="acard"><input type="radio" name="acc" value="${a}" ${a === "SMD" ? "checked" : ""}><span>${badge(a)}<span>${esc(ACCESS_HELP[a])}</span></span></label>`).join("")}</div>
            <div id="restrictPick" hidden><p class="label">Named officers who can see it</p><div class="peoplepick">${Object.keys(PEOPLE).filter((id) => id !== USER.id).map((id) => `<label><input type="checkbox" value="${id}"> ${esc(PEOPLE[id].name)} <span class="muted">${esc(PEOPLE[id].division)}</span></label>`).join("")}</div></div>
            <label class="declare"><input type="checkbox" id="declare"> I confirm this document is not classified and contains no personal files.</label>
            <p class="err" id="upErr" role="alert"></p>
            <div class="btnrow"><button class="btn" type="submit">Submit for verification</button><a class="btn ghost" href="#/">Cancel</a></div>
            <p class="hint">Your Division's data steward (${esc(person(NODAL_OFFICERS[div] || "p5").name)}) checks the access level and details before it becomes visible.</p>
          </fieldset>
        </form>
        <aside>
          <div class="panel side"><h2>Upload protocol in brief</h2><ul class="rules">
            <li><strong>Who uploads</strong> The nominated uploader in each SMD. Any officer may upload their own working drafts at SMD or Restricted level.</li>
            <li><strong>When</strong> Within 5 working days of finalisation, and on the 1st and 16th of each month.</li>
            <li><strong>Changes</strong> Upload new versions as versions, not new documents.</li>
            <li><strong>Leaving NITI</strong> Upload working files for ongoing work at Division level, with a status note.</li>
          </ul><a href="#/help?s=protocol">Full protocol</a></div>
          <div class="panel side"><h2>Uploading many files?</h2><p class="small">Upload a ZIP with a metadata sheet listing each file's details.</p><button class="btn line small" type="button" id="tmplBtn">${ico("down", 14)} Download metadata sheet</button></div>
        </aside>
      </div>`;
    const setTypes = () => {
      const g = groupOf($("#fDiv").value);
      $("#fType").innerHTML = DOC_TYPES_COMMON.concat(DOC_TYPES_BY_GROUP[g] || []).map((t) => `<option>${esc(t)}</option>`).join("");
    };
    setTypes();
    $("#fDiv").addEventListener("change", setTypes);
    $("#fSource").addEventListener("change", (e) => { $("#extField").hidden = e.target.value !== "External agency"; });
    $$("input[name=acc]").forEach((r) => r.addEventListener("change", () => { $("#restrictPick").hidden = $("input[name=acc]:checked").value !== "Restricted"; }));
    const fill = (name, size) => {
      $("#fileChosen").innerHTML = `<div class="filechip">${ico("file", 16)} <strong>${esc(name)}</strong> <span class="muted">${size}</span></div>`;
      $("#details").disabled = false; $("#accessSet").disabled = false;
      const base = name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
      $("#fTitle").value = base.charAt(0).toUpperCase() + base.slice(1);
      const low = name.toLowerCase();
      if (low.includes("minute")) { $("#fCat").value = "C"; $("#fType").value = "Meeting records"; }
      else if (low.includes("draft") || low.includes("note")) { $("#fCat").value = "A"; }
      else { $("#fCat").value = "B"; $("#fType").value = "Final outputs"; }
      $("#fTags").value = groupOf($("#fDiv").value) === "Data, Research & Reform" ? "Data, NDAP" : "Urban";
      $$(".upform [id^=f]").forEach((el) => el.classList.add("suggested"));
      $("#fTitle").focus();
    };
    $("#upFile").addEventListener("change", (e) => { const f = e.target.files[0]; if (f) fill(f.name, (f.size / 1024 / 1024).toFixed(1) + " MB"); });
    dropzone($("#upDrop"), (f) => fill(f.name, (f.size / 1024 / 1024).toFixed(1) + " MB"));
    $("#exampleFile").addEventListener("click", () => fill("Minutes_NDAP_steering_committee_Nov2026.pdf", "1.2 MB"));
    $("#upForm").addEventListener("input", (e) => e.target.classList.remove("suggested"));
    $("#tmplBtn").addEventListener("click", () => {
      download("smriti-metadata-sheet.csv", "file_name,title,division,doc_type,source_type,external_source,access_level,restricted_to,doc_date,author,status,version,language\nEV_charging_handbook_2023.pdf,Handbook on EV Charging infrastructure,E-Mobility,Handbook / guidelines,Published NITI report,,Public,,2023-08-15,E-Mobility team,Final,v1,English\n", "text/csv");
      toast("Metadata sheet downloaded");
    });
    $("#upForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const err = $("#upErr");
      if (!$("#fTitle").value.trim()) { err.textContent = "Add a title before submitting."; $("#fTitle").focus(); return; }
      const acc = $("input[name=acc]:checked").value;
      const named = $$("#restrictPick input:checked").map((x) => x.value);
      if (acc === "Restricted" && !named.length) { err.textContent = "Choose at least one named officer for a Restricted document."; return; }
      if (!$("#declare").checked) { err.textContent = "Confirm the document is not classified before submitting."; $("#declare").focus(); return; }
      const id = "u" + Date.now();
      const doc = {
        id, title: $("#fTitle").value.trim(), division: $("#fDiv").value, category: $("#fCat").value, docType: $("#fType").value,
        source: $("#fSource").value, external: $("#fExt").value, access: acc, restrictedTo: named, date: $("#fDate").value || today,
        author: USER.id, owner: USER.id, status: $("#fStatus").value, verified: false, version: "v1", language: $("#fLang").value,
        efile: $("#fEfile").value || "Not given", tags: { sector: ($("#fTags").value.split(",")[0] || "").trim(), states: [], ministry: "", year: +($("#fDate").value || today).slice(0, 4) },
        summary: "Uploaded through Smriti; summary will be generated after verification.", body: [], related: [], state: "Submitted", ingest: "Processing", uploadedOn: today
      };
      DOCS.unshift(doc); saveUploads();
      view.innerHTML = pageHead(view, "Submitted for verification", "", [["Contribute"], ["Upload"]]) + `<div class="wrap"><div class="panel done">
        <div class="tick">${ico("check", 30)}</div>
        <h2>${esc(doc.title)}</h2>
        <p>${esc(doc.division)} | ${esc(catName(doc.category))} | ${badge(doc.access)}</p>
        <ol class="flow"><li class="ok">Uploaded</li><li class="now">Waiting for verification by ${esc(person(NODAL_OFFICERS[doc.division] || "p5").name)}</li><li>Published to ${esc(doc.access === "SMD" ? "your Division" : doc.access === "Restricted" ? "named officers" : doc.access === "Public" ? "everyone" : "all of NITI")}</li></ol>
        <div class="btnrow"><a class="btn" href="#/uploads">Go to My uploads</a><a class="btn line" href="#/upload">Upload another</a></div>
      </div></div>`;
    });
  }

  // =====================================================================
  // My uploads and Division library
  // =====================================================================
  function viewUploads(view, parts, params) {
    const tab = params.tab === "library" ? "library" : "mine";
    const mine = DOCS.filter((d) => d.owner === USER.id || d.author === USER.id);
    const lib = DOCS.filter((d) => USER.divisions.includes(d.division) && canAccess(d) && !d.withdrawn);
    const rows = tab === "mine" ? mine : lib;
    const stateOf = (d) => d.withdrawn ? "Withdrawn" : d.state || "Published";
    view.innerHTML = pageHead(view, tab === "mine" ? "My uploads" : "Division library", tab === "mine" ? "Documents you authored or own. Add a new version when a document changes; don't upload it again." : "Everything your Divisions have deposited that you may access.", [["Contribute"], [tab === "mine" ? "My uploads" : "Division library"]]) + `
      <div class="wrap">
        <div class="tabs" role="tablist"><a role="tab" href="#/uploads" aria-selected="${tab === "mine"}">My uploads <small>${mine.length}</small></a><a role="tab" href="#/uploads?tab=library" aria-selected="${tab === "library"}">Division library <small>${lib.length}</small></a><a class="btn small" href="#/upload">${ico("upload", 14)} Upload</a></div>
        <div class="panel tablewrap"><table class="tbl">
          <thead><tr><th>Document</th>${tab === "library" ? "<th>Division</th>" : ""}<th>Version</th><th>Last edited</th><th>Access</th><th>Status</th><th>Search index</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody>${rows.map((d) => `<tr data-id="${d.id}" class="${d.withdrawn ? "dim" : ""}">
            <td><a href="#/doc/${d.id}">${esc(d.title)}</a><span class="sub">${esc(catName(d.category))}</span></td>
            ${tab === "library" ? `<td>${esc(d.division)}</td>` : ""}
            <td>${esc(d.version)}</td>
            <td class="nowrap">${fmtDate(d.uploadedOn || d.date)}<span class="sub">${esc(person(d.owner).name)}</span></td>
            <td>${badge(d.access)}</td>
            <td><span class="state ${stateOf(d).replace(/\s/g, "")}">${esc(stateOf(d))}</span></td>
            <td>${d.ingest === "Processing" ? `<span class="muted">Processing</span>` : "Indexed"}</td>
            <td class="rowacts">${d.withdrawn ? "" : `<button type="button" data-act="version">New version</button><button type="button" data-act="edit">Edit</button>${d.owner === USER.id ? `<button type="button" data-act="withdraw">Withdraw</button>` : ""}`}</td>
          </tr>`).join("") || `<tr><td colspan="8" class="empty">Nothing here yet. <a href="#/upload">Upload your first document.</a></td></tr>`}</tbody>
        </table></div>
      </div>`;
    $(".tbl", view).addEventListener("click", (e) => {
      const b = e.target.closest("[data-act]"); if (!b) return;
      const tr = b.closest("tr"), d = docById(tr.dataset.id);
      if (b.dataset.act === "version") {
        d.version = "v" + (+d.version.replace("v", "") + 1); d.uploadedOn = today; saveUploads();
        toast(`New version ${d.version} added. It will be verified before it replaces the current one.`); render();
      } else if (b.dataset.act === "edit") {
        toast("Editing details sends the document back to the data steward for a quick check.");
      } else if (b.dataset.act === "withdraw") {
        if (b.dataset.confirm) { d.withdrawn = true; withdrawn.push(d.id); store.set("withdrawn", withdrawn); toast("Withdrawn. The change is logged."); render(); }
        else { b.dataset.confirm = "1"; b.textContent = "Confirm withdraw"; b.classList.add("danger"); }
      }
    });
  }

  // =====================================================================
  // Verification queue (data steward)
  // =====================================================================
  function viewQueue(view) {
    const items = QUEUE.concat(DOCS.filter((d) => d.state === "Submitted" && USER.divisions.includes(d.division)).map((d) => ({ id: d.id, title: d.title, division: d.division, by: d.author, category: d.category, access: d.access, date: d.uploadedOn || d.date, note: "", isDoc: true })));
    const open = items.filter((q) => !queueState[q.id]);
    view.innerHTML = pageHead(view, "Verification queue", "Uploads from your Divisions waiting for you to verify. Check the document is final, accurate and at the right access level.", [["Contribute"], ["Verification queue"]]) + `
      <div class="wrap">
        ${open.length ? "" : `<div class="panel empty big">${ico("check", 28)}<h3>All caught up</h3><p>There are no uploads waiting for verification.</p></div>`}
        <div class="queue">${open.map((q) => `
          <article class="panel qitem ${q.held ? "held" : ""}" data-id="${q.id}">
            <div class="qmain">
              ${q.held ? `<span class="heldtag">${ico("alert", 14)} Held by the classification screen</span>` : ""}
              <h2>${esc(q.title)}</h2>
              <div class="meta"><span>${esc(q.division)}</span>${sep}<span>${esc(catName(q.category))}</span>${sep}<span>Uploaded by ${esc(person(q.by).name)}, ${fmtDate(q.date)}</span>${badge(q.access)}</div>
              ${q.note ? `<p class="qnote">${esc(q.note)}</p>` : ""}
            </div>
            <div class="qacts">
              <label class="sr-only" for="acc-${q.id}">Access level</label>
              <select id="acc-${q.id}">${Object.keys(ACCESS_HELP).map((a) => `<option ${a === q.access ? "selected" : ""}>${a}</option>`).join("")}</select>
              <button class="btn small" type="button" data-q="verify">Verify</button>
              <button class="btn ghost small" type="button" data-q="reject">Return</button>
            </div>
          </article>`).join("")}</div>
      </div>`;
    $$(".qitem", view).forEach((el) => el.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]"); if (!b) return;
      const id = el.dataset.id, acc = $("select", el).value;
      queueState[id] = b.dataset.q; store.set("queue", queueState);
      const d = docById(id);
      if (d && b.dataset.q === "verify") { d.state = undefined; d.verified = true; d.access = acc; d.ingest = "Indexed"; saveUploads(); }
      if (d && b.dataset.q === "reject") { d.state = "Returned"; saveUploads(); }
      el.classList.add("leaving");
      toast(b.dataset.q === "verify" ? `Verified and published at ${acc} level` : "Returned to the uploader with a request to fix");
      setTimeout(render, reduceMotion ? 0 : 250);
    }));
  }

  // =====================================================================
  // Help and protocol
  // =====================================================================
  function viewHelp(view, parts, params) {
    view.innerHTML = pageHead(view, "Help", "What Smriti is, how access works, and the rules for uploading.", [["Help"]]) + `
      <div class="wrap helpgrid">
        <nav class="helpnav" aria-label="Help sections"><a href="#/help?s=about">What is Smriti</a><a href="#/help?s=access">Access levels</a><a href="#/help?s=categories">Categories and who can see them</a><a href="#/help?s=protocol">Upload protocol</a><a href="#/help?s=contact">Contact</a></nav>
        <div class="helpbody">
          <section id="about" class="panel prose"><h2>What is Smriti</h2>
            <p>Smriti is NITI Aayog's knowledge repository. Every Division deposits its reports, notes, minutes and documents received from Ministries, States and research organisations, so that work is not lost when people move, and no one starts a study without knowing what has been done before.</p>
            <p>You can search across Divisions, ask questions and get answers with sources, check a draft against earlier NITI work, and get a handover brief when you take over a subject. Everything you see is limited to what you may access.</p>
            <p>Smriti does not replace e-Office. Each document carries its e-Office file number so the two can be read together.</p></section>
          <section id="access" class="panel prose"><h2>Access levels</h2>
            <table class="tbl"><thead><tr><th>Level</th><th>Who can see it</th><th>Use it for</th></tr></thead><tbody>
              <tr><td>${badge("Public")}</td><td>Everyone, including the website</td><td>Released outputs</td></tr>
              <tr><td>${badge("NITI-wide")}</td><td>All officers of NITI Aayog and its attached offices</td><td>Final work any officer may use</td></tr>
              <tr><td>${badge("SMD")}</td><td>Officers of the Division concerned</td><td>Working papers and views not yet final. The default when in doubt.</td></tr>
              <tr><td>${badge("Restricted")}</td><td>Named officers only</td><td>Contracts, legal and personnel matters, sensitive inputs</td></tr>
            </tbody></table>
            <p>Classified documents never enter Smriti. Search and answers draw only on documents you may access, and every search, answer and document view is logged.</p></section>
          <section id="categories" class="panel prose"><h2>Categories and who can see them</h2>
            <table class="tbl"><thead><tr><th>Category</th><th>Examples</th></tr></thead><tbody>
              ${CATEGORIES.map((c) => `<tr><td><strong>${c.code}: ${esc(c.name)}</strong></td><td>${esc(c.desc)}</td></tr>`).join("")}
            </tbody></table>
            <table class="tbl matrix"><thead><tr><th>Who</th><th>Publicly available</th><th>Shared with all SMDs</th><th>Within the SMD only (default)</th></tr></thead><tbody>
              <tr><td>SMD that uploaded it</td><td class="y">Can see</td><td class="y">Can see</td><td class="y">Can see</td></tr>
              <tr><td>Other SMDs</td><td class="y">Can see</td><td class="y">Can see</td><td class="n">Cannot see</td></tr>
              <tr><td>Vice Chairperson, Members, CEO</td><td class="y">Can see</td><td class="y">Can see</td><td class="n">Cannot see</td></tr>
            </tbody></table>
            <p class="small muted">NITI leadership also sees a dashboard and summary of uploads by all SMDs.</p></section>
          <section id="protocol" class="panel prose"><h2>Upload protocol</h2>
            <ol class="protocol">
              <li><strong>Who uploads.</strong> The nominated uploader in each SMD. Any officer may upload their own working drafts at SMD or Restricted level.</li>
              <li><strong>What may be uploaded.</strong> Reports, papers, notes, minutes, presentations, analyses, and documents received from Ministries, States and research organisations. Never classified material or personal files.</li>
              <li><strong>Choosing the access level.</strong> Public: already released. NITI-wide: final work any NITI officer may use. SMD: work in progress or SMD-only. Restricted: sensitive work for named officers. When in doubt, choose SMD.</li>
              <li><strong>Verification.</strong> The SMD's data steward marks final documents verified after checking they are final, accurate and fit to share.</li>
              <li><strong>Rhythm.</strong> New final outputs within 5 working days of finalisation, and at the latest on the 1st and 16th of each month.</li>
              <li><strong>Changes.</strong> New versions are uploaded as versions, not new documents. Access changes and withdrawals are made by the data steward and logged.</li>
              <li><strong>On leaving NITI.</strong> Working files for ongoing work are uploaded at Division level and a status note is updated.</li>
              <li><strong>Audit.</strong> Every search, answer and file view is logged.</li>
            </ol></section>
          <section id="contact" class="panel prose"><h2>Contact</h2><p>For access requests, ask the document's owner. For help with Smriti, write to the Smriti help desk at smriti-help@example.in, or contact your Division's nodal officer.</p></section>
        </div>
      </div>`;
    if (params.s) { const el = $("#" + params.s); if (el) setTimeout(() => el.scrollIntoView({ block: "start" }), 30); }
  }

  // =====================================================================
  // Notifications and profile
  // =====================================================================
  function viewNotifications(view) {
    const items = [
      ["#/queue", "alert", "3 uploads are waiting for your verification", "Data Management & Analysis", "Today"],
      ["#/doc/d19", "flag", "An officer flagged a document as outdated: Strengthening city governments", "Managing Urbanisation", "Yesterday"],
      ["#/upload?division=" + enc("Managing Urbanisation"), "upload", "Minutes of the 5 Nov consultation are due in 3 working days", "Managing Urbanisation", "8 Nov"],
      ["#/doc/d22", "file", "New document published: Call for proposals, research studies 2026-27", "Research & Networking", "5 Nov"]
    ];
    view.innerHTML = pageHead(view, "Notifications", "", [["Notifications"]]) + `<div class="wrap narrow"><div class="panel">${items.map(([h, i, t, d, w]) => `<a class="notif" href="${h}"><span class="ico">${ico(i)}</span><span><strong>${esc(t)}</strong><span class="muted">${esc(d)}</span></span><span class="muted">${w}</span></a>`).join("")}</div></div>`;
  }
  function viewProfile(view) {
    view.innerHTML = pageHead(view, USER.name, esc(USER.designation), [["Profile"]]) + `<div class="wrap narrow"><div class="panel prose">
      <h2>Your Divisions</h2><ul>${USER.divisions.map((d) => `<li><a href="#/division/${enc(d)}">${esc(d)}</a></li>`).join("")}</ul>
      <h2>Your access</h2><p>You can see Public and NITI-wide documents, documents at SMD level in your three Divisions, and Restricted documents where you are named. You are a data steward for your Divisions and can verify uploads.</p>
      <p class="small muted">Your Divisions and access come from the NITI user and access matrix, matched to your NIC login. To change them, contact the Smriti administrator.</p>
      <div class="btnrow"><a class="btn line" href="index.html">Sign out</a></div></div></div>`;
  }
  function viewNotFound(view) {
    view.innerHTML = pageHead(view, "Page not found", "The link may be old or mistyped.", []) + `<div class="wrap"><a class="btn" href="#/">Go to the home page</a></div>`;
  }

  render();
})();
