Object.assign(RBX_DEFAULTS, {
  uiType: true,
  uiCardTitles: true,
  uiSearch: true,
  uiDensity: "normal",
  hideGameBtn: true,
  hiddenGames: [],
  trackRobux: true,
  robuxLog: {}
});

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

RBX5_LOOK.push("uiType", "uiCardTitles", "uiSearch", "uiDensity");
RBX_POST_OK.push(/^https:\/\/friends\.roblox\.com\/v1\/users\/\d+\/(accept|decline)-friend-request$/);

RBX5_NEWS.length = 0;
RBX5_NEWS.push(
  "Panneau repensé : menu latéral, icônes et recherche avec Ctrl+K",
  "Emojis retirés, remplacés par des icônes vectorielles",
  "Nouvel onglet Activité : temps de jeu, suivi des Robux, liste de souhaits, jeux masqués",
  "Demandes d'amis reçues : accepter ou refuser sans quitter la page",
  "Sauvegarde complète : exporter et restaurer tous tes réglages",
  "Interface Roblox : typographie, densité, titres de cartes sur 2 lignes, recherche arrondie"
);

const rbx6q = (s) => document.querySelector(s);

function rbx6Svg(path, size) {
  const px = size || 18;
  return `<svg class="rx6-ico" viewBox="0 0 24 24" width="${px}" height="${px}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const RBX6_ICONS = {
  up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
  gear: '<path d="M4 7h8M16 7h4M4 17h4M12 17h8"/><circle cx="14" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>',
  users: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.6c2.6.2 4.1 1.7 4.5 4.4"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  themes: '<circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="15.5" cy="10.5" r="1"/>',
  colors: '<path d="M12 3c3.5 4.5 6 7.5 6 11a6 6 0 0 1-12 0c0-3.5 2.5-6.5 6-11z"/>',
  text: '<path d="M5 6V5h14v1M12 5v14M9 19h6"/>',
  effects: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 17v4M17 19h4"/>',
  interface: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10"/>',
  styles: '<path d="M6 4h12v17l-6-4-6 4z"/>',
  hide: '<path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z"/><circle cx="12" cy="12" r="2.5"/><path d="M4 4l16 16"/>',
  privacy: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  buttons: '<rect x="3" y="8" width="18" height="8" rx="4"/><circle cx="16" cy="12" r="2"/>',
  profile: '<circle cx="12" cy="8" r="4"/><path d="M4 20c1-4 4-6 8-6s7 2 8 6"/>',
  friends: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5"/><circle cx="17" cy="9" r="2.4"/><path d="M16.5 14.6c2.6.2 4.1 1.7 4.5 4.4"/>',
  outfits: '<path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3a4 4 0 0 1-8 0z"/>',
  premium: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  activity: '<path d="M5 20V11M12 20V4M19 20v-7"/>',
  tools: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  admin: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>'
};

const RBX6_GROUPS = [
  ["Apparence", ["themes", "colors", "text", "effects", "interface", "styles"]],
  ["Affichage", ["hide", "privacy", "buttons", "profile"]],
  ["Social", ["friends", "outfits"]],
  ["Outils", ["premium", "activity", "tools", "admin"]]
];

function rbx6Dock() {
  const map = { "rx-up": "up", "rx-gear": "gear", "rx-friends": "users", "rx-quick-join": "bolt" };
  Object.keys(map).forEach((id) => {
    const b = document.getElementById(id);
    if (b && b.dataset.rx6 !== "1") {
      b.innerHTML = rbx6Svg(RBX6_ICONS[map[id]], 20);
      b.dataset.rx6 = "1";
    }
  });
}

function rbx6DecorateTabs(ov) {
  const nav = ov.querySelector(".rx-tabs");
  if (!nav) return;
  nav.querySelectorAll(".rx6-group").forEach((n) => n.remove());
  const tabs = Array.from(nav.querySelectorAll(".rx-tab"));
  tabs.forEach((b) => {
    if (!b.querySelector(".rx6-ico") && RBX6_ICONS[b.dataset.tab]) b.insertAdjacentHTML("afterbegin", rbx6Svg(RBX6_ICONS[b.dataset.tab], 18));
  });
  RBX6_GROUPS.forEach((g) => {
    const first = tabs.find((b) => g[1].indexOf(b.dataset.tab) !== -1);
    if (!first) return;
    const h = document.createElement("div");
    h.className = "rx6-group";
    h.textContent = g[0];
    nav.insertBefore(h, first);
  });
}

rbxCenterIn = function (container, el) {
  if (!container || !el) return;
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const vertical = container.classList.contains("rx-tabs") && getComputedStyle(container).flexDirection === "column";
  if (vertical) container.scrollBy({ top: r.top - c.top - (c.height - r.height) / 2, behavior: "smooth" });
  else container.scrollBy({ left: r.left - c.left - (c.width - r.width) / 2, behavior: "smooth" });
};

(function rbx6Setup() {
  try {
    const iTools = RBX_TABS.findIndex((t) => t.id === "tools");
    if (!RBX_TABS.some((t) => t.id === "activity")) {
      RBX_TABS.splice(iTools < 0 ? RBX_TABS.length : iTools, 0, { id: "activity", label: "Activité", fields: [] });
    }
    rbxSocAddField("interface", "contentWidth", { key: "uiType", type: "checkbox", label: "Typographie, survols et focus plus soignés" });
    rbxSocAddField("interface", "uiType", { key: "uiCardTitles", type: "checkbox", label: "Titres de cartes sur 2 lignes au lieu d'être coupés" });
    rbxSocAddField("interface", "uiCardTitles", { key: "uiSearch", type: "checkbox", label: "Barre de recherche arrondie" });
    rbxSocAddField("interface", "uiSearch", {
      key: "uiDensity",
      type: "select",
      label: "Densité de la page",
      options: [["tight", "Serrée"], ["normal", "Normale"], ["comfy", "Aérée"]]
    });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
})();

const rbx6SanitizePrev = rbx5Sanitize;
rbx5Sanitize = function (d) {
  const out = rbx6SanitizePrev(d);
  if (out.uiDensity !== undefined && ["tight", "normal", "comfy"].indexOf(out.uiDensity) === -1) out.uiDensity = "normal";
  return out;
};

function rbx6Css(s) {
  const A = "var(--rx-accent, #335fff)";
  const sel = rbxSoc3Sel;
  let css = "";
  if (s.uiType) {
    css += `${RBX_P3} { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }`;
    css += `${RBX_P3} ::selection { background: color-mix(in srgb, ${A} 40%, transparent); color: inherit; }`;
    css += `${sel(["h1", "h2", "h3", ".font-header-1", ".font-header-2", ".text-lead"])} { letter-spacing: -0.01em; }`;
    css += `${sel(["a"])} { transition: color 0.15s ease, opacity 0.15s ease; }`;
    css += `${sel(["a:focus-visible", "button:focus-visible", "[role='button']:focus-visible", "[tabindex]:focus-visible"])} { outline: 2px solid ${A} !important; outline-offset: 2px; border-radius: 6px; }`;
    css += `${sel(["input[type='checkbox']", "input[type='radio']", "input[type='range']", "progress"])} { accent-color: ${A}; }`;
    css += `${sel([".game-description", ".text-description", ".item-description", ".profile-about-content p"])} { line-height: 1.55 !important; }`;
  }
  if (s.uiCardTitles) {
    // min-height : les notes sous le titre restent alignées entre titres d'une et de deux lignes.
    css += `${sel([".game-card-name", ".item-card-name", "[class*='game-card-name' i]", ".game-name-title"])} { white-space: normal !important; display: -webkit-box !important; -webkit-box-orient: vertical !important; -webkit-line-clamp: 2 !important; overflow: hidden !important; text-overflow: ellipsis !important; line-height: 1.25 !important; min-height: 2.5em; transition: color 0.15s ease; }`;
    css += `${sel([".game-card-container:hover .game-card-name", ".game-card-container:hover [class*='game-card-name' i]"])} { color: ${A} !important; }`;
  }
  if (s.uiSearch) {
    css += `${sel(["#navbar-universal-search input", ".rbx-navbar-search input", ".navbar-search input", "#navbar-universal-search .form-control"])} { border-radius: 999px !important; }`;
  }
  if (s.uiDensity === "comfy") {
    css += `${sel([".section"])} { margin-bottom: 40px !important; }`;
    css += `${sel([".container-header"])} { margin-bottom: 16px !important; }`;
    css += `${sel([".game-card-container"])} { margin-bottom: 18px !important; }`;
  } else if (s.uiDensity === "tight") {
    css += `${sel([".section"])} { margin-bottom: 14px !important; }`;
    css += `${sel([".container-header"])} { margin-bottom: 6px !important; }`;
    css += `${sel([".game-card-container"])} { margin-bottom: 6px !important; }`;
  }
  return css;
}

const rbx6CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx6CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx6Css(s);
};

let rbx6Reqs = [];
function rbx6Notify(title, text, href) {
  const host = rbx5Host();
  if (!host) return;
  while (host.children.length >= 4) host.firstChild.remove();
  const c = sxEl("div", "rx5-n");
  const txt = sxEl("div", "rx5-ntxt");
  txt.appendChild(sxEl("strong", "", title));
  txt.appendChild(document.createElement("br"));
  txt.appendChild(sxEl("span", "", text));
  c.appendChild(txt);
  if (href) {
    const a = sxEl("a", "rx5-nbtn", "Voir");
    a.href = href;
    c.appendChild(a);
  }
  const x = sxBtn("\u00d7", "rx5-nx");
  x.addEventListener("click", () => c.remove());
  c.appendChild(x);
  host.appendChild(c);
  setTimeout(() => c.remove(), 15000);
}

function rbx6RobuxRecord() {
  if (!rbxState.enabled || rbxState.trackRobux === false) return;
  const el = document.getElementById("nav-robux-amount") || document.getElementById("nav-robux-balance");
  if (!el) return;
  const txt = el.textContent || "";
  if (!txt.trim() || /[kKmM]/.test(txt)) return;
  const n = rbxParseRobux(txt);
  if (n === null) return;
  const log = rbxState.robuxLog && typeof rbxState.robuxLog === "object" ? rbxState.robuxLog : {};
  const keys = Object.keys(log).sort();
  const lastVal = keys.length ? log[keys[keys.length - 1]] : null;
  if (n === 0 && lastVal) return;
  const k = new Date().toLocaleDateString("sv-SE");
  if (log[k] === n) return;
  const next = { ...log, [k]: n };
  const all = Object.keys(next).sort();
  while (all.length > 120) delete next[all.shift()];
  rbxSet({ robuxLog: next });
}

function rbx6Bars(items) {
  const wrap = sxEl("div", "rx6-chart");
  const max = Math.max(1, ...items.map((i) => i.value));
  items.forEach((it) => {
    const col = sxEl("div", "rx6-col");
    const bar = sxEl("div", "rx6-bar");
    const fill = document.createElement("i");
    fill.style.height = Math.round((it.value / max) * 100) + "%";
    if (!it.value) fill.className = "rx6-zero";
    bar.appendChild(fill);
    bar.title = it.title;
    col.appendChild(bar);
    col.appendChild(sxEl("small", "", it.label));
    wrap.appendChild(col);
  });
  return wrap;
}

function rbx6DayLabel(d) {
  return d.toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", "").slice(0, 3);
}

function rbx6RenderStats() {
  const tb = rbx6q('#rx-panel [data-s6-box="time"]');
  if (tb) {
    tb.textContent = "";
    const pt = rbxState.playtime || {};
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      days.push({ d, k: d.toLocaleDateString("sv-SE") });
    }
    days.forEach((x) => {
      x.sec = Number(pt[x.k]) || 0;
    });
    const total = days.reduce((a, x) => a + x.sec, 0);
    const active = days.filter((x) => x.sec > 0).length;
    tb.appendChild(rbx6Bars(days.map((x) => ({ label: rbx6DayLabel(x.d), value: x.sec, title: `${x.d.toLocaleDateString("fr-FR")} : ${rbxFmtDuration(x.sec)}` }))));
    tb.appendChild(rbxStatRow("Aujourd'hui", rbxFmtDuration(days[days.length - 1].sec), true));
    tb.appendChild(rbxStatRow("Total sur 14 jours", rbxFmtDuration(total), false));
    tb.appendChild(rbxStatRow("Moyenne par jour actif", active ? rbxFmtDuration(Math.round(total / active)) : "—", false));
    const lim = Number(rbxState.dailyLimit) || 0;
    if (lim > 0) {
      const left = Math.max(0, lim * 60 - days[days.length - 1].sec);
      tb.appendChild(rbxStatRow("Limite du jour", `${lim} min (reste ${rbxFmtDuration(left)})`, false));
    }
    if (rbxState.trackPlaytime === false) tb.appendChild(sxEl("p", "rx-hint", "Le suivi du temps est désactivé : active-le dans Premium > Suivi."));
  }

  const rb = rbx6q('#rx-panel [data-s6-box="robux"]');
  if (rb) {
    rb.textContent = "";
    const log = rbxState.robuxLog && typeof rbxState.robuxLog === "object" ? rbxState.robuxLog : {};
    const keys = Object.keys(log).sort();
    if (!keys.length) {
      rb.appendChild(sxEl("p", "rx-empty", "Pas encore de données. Ouvre Roblox : ton solde sera relevé automatiquement."));
    } else {
      const days = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86400000);
        days.push({ d, k: d.toLocaleDateString("sv-SE") });
      }
      const before = keys.filter((x) => x < days[0].k).pop();
      let last = before !== undefined ? log[before] : null;
      days.forEach((x) => {
        if (log[x.k] !== undefined) last = log[x.k];
        x.v = last === null ? 0 : last;
      });
      rb.appendChild(rbx6Bars(days.map((x) => ({ label: rbx6DayLabel(x.d), value: x.v, title: `${x.d.toLocaleDateString("fr-FR")} : ${rbxNum(x.v)} Robux` }))));
      const cur = log[keys[keys.length - 1]];
      rb.appendChild(rbxStatRow("Dernier solde relevé", `${rbxNum(cur)} Robux`, true));
      if (keys.length > 1) {
        const pk = keys[keys.length - 2];
        const delta = cur - log[pk];
        rb.appendChild(rbxStatRow(`Variation depuis le ${new Date(pk).toLocaleDateString("fr-FR")}`, `${delta > 0 ? "+" : ""}${rbxNum(delta)} Robux`, false));
      }
      rb.appendChild(rbxStatRow("Jours enregistrés", String(keys.length), false));
    }
  }
}

function rbx6RenderHidden() {
  const box = rbx6q('#rx-panel [data-s6-list="hidden"]');
  if (!box) return;
  box.textContent = "";
  const list = Array.isArray(rbxState.hiddenGames) ? rbxState.hiddenGames : [];
  if (!list.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun jeu masqué."));
    return;
  }
  list.forEach((g) => {
    const row = sxEl("div", "rx-li");
    const name = sxEl("a", "rx-li-name", g.t || "Jeu " + g.p);
    name.href = `https://www.roblox.com/games/${encodeURIComponent(g.p)}`;
    row.appendChild(name);
    const b = sxBtn("Réafficher", "rx-sec");
    b.addEventListener("click", () => {
      rbxSet({ hiddenGames: (rbxState.hiddenGames || []).filter((x) => String(x.p) !== String(g.p)) });
      rbx6RenderHidden();
      rbx6ApplyHidden();
    });
    row.appendChild(b);
    box.appendChild(row);
  });
}

function rbx6RenderActivity() {
  rbx6RenderStats();
  rbx6RenderHidden();
}

function rbx6RenderReqs() {
  const box = rbx6q('#rx-panel [data-s6-list="incoming"]');
  const count = rbx6q('#rx-panel [data-s6-out="reqCount"]');
  if (!box) return;
  box.textContent = "";
  if (count) count.textContent = rbx6Reqs.length ? `${rbx6Reqs.length} demande(s) en attente` : "";
  if (!rbx6Reqs.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucune demande en attente."));
    return;
  }
  rbx6Reqs.forEach((f) => {
    const row = sxEl("div", "rx-li");
    row.appendChild(sxImg(rbxHeadCache.get(f.id), "sx-head"));
    row.appendChild(sxEl("span", "rx-li-name", rbxFriendLabel(f)));
    if (f.mutual) row.appendChild(sxEl("span", "rx-li-date", `${f.mutual} ami(s) en commun`));
    const ok = sxBtn("Accepter", "rx-sec rx6-ok");
    ok.addEventListener("click", () => rbx6ReqAct(f, "accept", false));
    const no = sxBtn("Refuser", "rx-sec rx-danger");
    no.addEventListener("click", () => rbx6ReqAct(f, "decline", false));
    row.appendChild(ok);
    row.appendChild(no);
    box.appendChild(row);
  });
}

async function rbx6LoadReqs() {
  const box = rbx6q('#rx-panel [data-s6-list="incoming"]');
  if (!box) return;
  box.textContent = "Chargement des demandes…";
  const r = await rbxFetchJson("https://friends.roblox.com/v1/my/friends/requests?limit=100&sortOrder=Desc");
  if (!r || !Array.isArray(r.data)) {
    box.textContent = "Impossible de lire tes demandes d'amis : Roblox n'a pas répondu.";
    return;
  }
  const list = r.data
    .map((it) => ({
      id: it.id || (it.friendRequest && it.friendRequest.senderId),
      name: it.name || "",
      displayName: it.displayName || "",
      mutual: Array.isArray(it.mutualFriendsList) ? it.mutualFriendsList.length : 0
    }))
    .filter((x) => x.id);
  const need = list.filter((f) => !f.name);
  if (need.length) await rbxFillNames(need);
  await rbxThumbBatch(RBX_HEAD_URL, list.map((f) => f.id), rbxHeadCache, 100);
  rbx6Reqs = list;
  rbx6RenderReqs();
}

async function rbx6ReqAct(f, kind, quiet) {
  const url = `https://friends.roblox.com/v1/users/${f.id}/${kind}-friend-request`;
  let r = await rbxPostJson(url, undefined);
  if (r.status === 429) {
    await rbxSleep(4000);
    r = await rbxPostJson(url, undefined);
  }
  if (r.ok) {
    rbx6Reqs = rbx6Reqs.filter((x) => x.id !== f.id);
    rbx6RenderReqs();
    if (!quiet) rbxToast(kind === "accept" ? "Demande acceptée" : "Demande refusée");
  } else if (!quiet) {
    rbxToast("Roblox a refusé l'opération");
  }
  return r.ok;
}

async function rbx6DeclineAll() {
  if (!rbx6Reqs.length) {
    rbxToast("Aucune demande à refuser");
    return;
  }
  if (!confirm(`Refuser les ${rbx6Reqs.length} demandes d'amis en attente ? Action définitive.`)) return;
  const todo = rbx6Reqs.slice();
  let ok = 0;
  for (const f of todo) {
    const done = await rbx6ReqAct(f, "decline", true);
    if (done) ok++;
    else break;
    await rbxSleep(800);
  }
  rbxToast(`${ok} demande(s) refusée(s)`);
}

function rbx6ActivityHtml() {
  const f = (o) => rbxFieldHtml(o);
  return `<nav class="sx-subtabs"><button type="button" class="sx-subtab sx-active" data-soc-sub="time">Temps de jeu</button><button type="button" class="sx-subtab" data-soc-sub="robux">Robux</button><button type="button" class="sx-subtab" data-soc-sub="hidden">Jeux masqués</button></nav>
<div class="sx-sub sx-active" data-soc-pane="time">
<p class="rx-hint">Temps passé sur le site Roblox dans ce navigateur pendant les 14 derniers jours. Les parties lancées depuis l'application ne sont pas comptées.</p>
<div data-s6-box="time"></div>
<div class="rx-actions"><button type="button" class="rx-sec rx-danger" data-act="clearPlaytime">Réinitialiser le temps</button></div>
</div>
<div class="sx-sub" data-soc-pane="robux">
<p class="rx-hint">Ton solde est relevé quand tu ouvres Roblox. Seuls les soldes affichés en entier sont enregistrés, sur cet ordinateur uniquement.</p>
<div class="rx-group">${f({ key: "trackRobux", type: "checkbox", label: "Enregistrer mon solde de Robux" })}</div>
<div class="rx-spaced" data-s6-box="robux"></div>
<div class="rx-actions"><button type="button" class="rx-sec rx-danger" data-s6="robuxClear">Effacer l'historique des Robux</button></div>
</div>
<div class="sx-sub" data-soc-pane="hidden">
<p class="rx-hint">Jeux que tu as masqués avec le bouton Masquer, en haut à droite d'une vignette de jeu quand tu la survoles.</p>
<div class="rx-group">${f({ key: "hideGameBtn", type: "checkbox", label: "Afficher le bouton Masquer au survol d'un jeu" })}</div>
<div class="rx-list rx-spaced" data-s6-list="hidden"></div>
<div class="rx-actions"><button type="button" class="rx-sec" data-s6="hiddenClear">Tout réafficher</button></div>
</div>`;
}

const rbx6TabFriendsPrev = rbxTabFriends;
rbxTabFriends = function () {
  let h = rbx6TabFriendsPrev();
  h = h.replace("</nav>", '<button type="button" class="sx-subtab" data-soc-sub="incoming">Demandes reçues</button></nav>');
  h += `<div class="sx-sub" data-soc-pane="incoming">
<p class="rx-hint">Accepte ou refuse les demandes d'amis reçues sans ouvrir la page Amis. Une demande traitée disparaît de la liste.</p>
<div class="rx-actions"><button type="button" class="rx-sec" data-s6="reqLoad">Charger les demandes</button><button type="button" class="rx-sec rx-danger" data-s6="reqDeclineAll">Tout refuser</button></div>
<p class="rx-hint" data-s6-out="reqCount"></p>
<div class="rx-list" data-s6-list="incoming"></div>
</div>`;
  return h;
};

function rbx6CleanSettings(obj) {
  const out = {};
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return out;
  Object.keys(RBX_DEFAULTS).forEach((k) => {
    if (!(k in obj)) return;
    const v = obj[k];
    const def = RBX_DEFAULTS[k];
    if (Array.isArray(def)) {
      if (Array.isArray(v) && v.length <= 400) out[k] = v;
    } else if (def !== null && typeof def === "object") {
      if (v && typeof v === "object" && !Array.isArray(v) && Object.keys(v).length <= 500) out[k] = v;
    } else if (typeof def === "boolean") {
      if (typeof v === "boolean") out[k] = v;
    } else if (typeof def === "number") {
      if (v !== "" && Number.isFinite(Number(v))) out[k] = Number(v);
    } else if (typeof def === "string") {
      if (typeof v === "string" && v.length <= 100000) out[k] = v;
    }
  });
  RBX5_LOOK.forEach((k) => {
    delete out[k];
  });
  Object.assign(out, rbx5Sanitize(obj));
  return out;
}

const rbx6StylesPrev = rbx5StylesHtml;
rbx5StylesHtml = function () {
  return (
    rbx6StylesPrev() +
    `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Sauvegarde complète</span>
<p class="rx-hint">Exporte tous tes réglages (apparence, best friends, notes, jeux masqués, etc.) pour les restaurer plus tard ou les copier sur un autre ordinateur. Ta licence et ta clé admin ne sont jamais incluses.</p>
<textarea data-s5-in="backupText" placeholder="Colle ici une sauvegarde à restaurer"></textarea>
<div class="rx-actions"><button type="button" class="rx-sec" data-s5="backupCopy">Copier la sauvegarde</button><button type="button" class="rx-sec" data-s5="backupImport">Restaurer cette sauvegarde</button><button type="button" class="rx-sec rx-danger" data-s5="backupReset">Tout réinitialiser</button></div></div></div>`
  );
};

const rbx6ActionPrev = rbx5Action;
rbx5Action = async function (name) {
  const inp = (n) => document.querySelector(`#rx-panel [data-s5-in="${n}"]`);
  if (name === "backupCopy") {
    const txt = JSON.stringify(rbxSaved);
    if (inp("backupText")) inp("backupText").value = txt;
    rbxCopyText(txt, "Sauvegarde copiée");
    return;
  }
  if (name === "backupImport") {
    let obj = null;
    try {
      obj = JSON.parse(inp("backupText") ? inp("backupText").value : "");
    } catch (e) {
      obj = null;
    }
    const clean = rbx6CleanSettings(obj);
    if (!Object.keys(clean).length) {
      rbxToast("Sauvegarde invalide ou vide");
      return;
    }
    if (!confirm(`Restaurer ${Object.keys(clean).length} réglages ? Ils remplacent ceux qui existent déjà.`)) return;
    rbxSet({ ...clean, autoPeriod: "" });
    rbxSyncInputs();
    rbxToast("Sauvegarde restaurée");
    return;
  }
  if (name === "backupReset") {
    if (!confirm("Tout réinitialiser ? Apparence, best friends, notes, jeux masqués : tout sera effacé.")) return;
    rbxSet({ ...RBX_DEFAULTS });
    rbxSyncInputs();
    rbxToast("Tout a été réinitialisé");
    return;
  }
  return rbx6ActionPrev(name);
};

async function rbx6Action(name) {
  if (name === "reqLoad") return rbx6LoadReqs();
  if (name === "reqDeclineAll") return rbx6DeclineAll();
  if (name === "robuxClear") {
    if (confirm("Effacer tout l'historique de tes Robux ?")) {
      rbxSet({ robuxLog: {} });
      rbx6RenderStats();
    }
    return;
  }
  if (name === "hiddenClear") {
    if (confirm("Réafficher tous les jeux masqués ?")) {
      rbxSet({ hiddenGames: [] });
      rbx6RenderHidden();
      rbx6ApplyHidden();
    }
  }
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  const b = t.closest("#rx-panel [data-s6]");
  if (b) rbx6Action(b.dataset.s6);
});

function rbx6OnPane(id) {
  if (id === "time" || id === "robux") rbx6RenderStats();
  else if (id === "hidden") rbx6RenderHidden();
  else if (id === "incoming") rbx6LoadReqs();
}

const rbx6ShowSubPrev = rbxSocShowSub;
rbxSocShowSub = function (btn) {
  rbx6ShowSubPrev(btn);
  rbx6OnPane(btn.dataset.socSub);
};

const rbx6ShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  rbx6ShowTabPrev(id);
  if (id === "activity") rbx6RenderActivity();
};

const rbx6BuildPrev = rbxBuildPanel;
rbxBuildPanel = function () {
  const had = !!document.getElementById("rx-overlay");
  rbx6BuildPrev();
  if (had) return;
  const ov = document.getElementById("rx-overlay");
  if (!ov) return;
  try {
    const sec = ov.querySelector('.rx-section[data-section="activity"]');
    if (sec) sec.innerHTML = rbx6ActivityHtml();
    rbx6DecorateTabs(ov);
    ov.querySelectorAll(".rx5-ico").forEach((el) => {
      el.innerHTML = rbx6Svg(RBX6_ICONS.search, 16);
    });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
};

function rbx6ApplyHidden() {
  if (!rbxDomChanged("hidden")) return;
  const hidden = new Set((Array.isArray(rbxState.hiddenGames) ? rbxState.hiddenGames : []).map((g) => String(g.p)));
  const on = rbxState.enabled && hidden.size > 0;
  document.querySelectorAll("[data-rx-gh]").forEach((el) => {
    if (!on || !hidden.has(el.dataset.rxGh)) {
      el.style.display = "";
      el.removeAttribute("data-rx-gh");
    }
  });
  if (!on) return;
  const here = rbxPageInfo(location.pathname);
  const skip = "#rx-panel, #rx-bar, #rx-soc, #rx-overlay, #rx-dock, #navigation, #header, [class*='friends-carousel' i], [class*='friend-tile' i]";
  document.querySelectorAll('a[href*="/games/"]').forEach((a) => {
    if (a.closest(skip)) return;
    const m = /\/games\/(\d+)/.exec(a.getAttribute("href") || "");
    if (!m || !hidden.has(m[1])) return;
    if (here && here.k === "game" && here.id === m[1]) return;
    const candidates = [a.closest("li"), a.closest(".game-card-container")];
    for (const card of candidates) {
      if (!card || card.hasAttribute("data-rx-gh")) continue;
      const ids = new Set(
        Array.from(card.querySelectorAll('a[href*="/games/"]'))
          .map((x) => (/\/games\/(\d+)/.exec(x.getAttribute("href") || "") || [])[1])
          .filter(Boolean)
      );
      if (ids.size !== 1) continue;
      card.setAttribute("data-rx-gh", m[1]);
      card.style.display = "none";
      return;
    }
  });
}

let rbx6HH = null;
let rbx6HHInfo = null;
let rbx6HHTimer = 0;

function rbx6HHHide() {
  if (rbx6HH) rbx6HH.hidden = true;
  rbx6HHInfo = null;
}

function rbx6HHSchedule() {
  clearTimeout(rbx6HHTimer);
  rbx6HHTimer = setTimeout(rbx6HHHide, 250);
}

function rbx6HideGame(info) {
  const list = Array.isArray(rbxState.hiddenGames) ? rbxState.hiddenGames : [];
  if (list.some((g) => String(g.p) === info.pid)) return;
  if (list.length >= 200) {
    rbxToast("200 jeux masqués maximum");
    return;
  }
  rbxSet({ hiddenGames: [{ p: info.pid, t: info.title }, ...list] });
  rbx6HHHide();
  rbx6ApplyHidden();
  rbxToast("Jeu masqué. Tu peux le réafficher dans l'onglet Accueil de l'extension.");
}

function rbx6HHBtn() {
  if (rbx6HH) return rbx6HH;
  const b = document.createElement("button");
  b.id = "rx-hover-hide";
  b.type = "button";
  b.textContent = "Masquer";
  b.title = "Ne plus afficher ce jeu";
  b.hidden = true;
  b.addEventListener("mouseenter", () => clearTimeout(rbx6HHTimer));
  b.addEventListener("mouseleave", rbx6HHSchedule);
  b.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (rbx6HHInfo) rbx6HideGame(rbx6HHInfo);
  });
  document.body.appendChild(b);
  rbx6HH = b;
  return b;
}

document.addEventListener("mouseover", (e) => {
  const s = rbxState;
  if (!s.enabled || !s.hideGameBtn || !document.body) return;
  const t = e.target;
  if (!t || !t.closest) return;
  if (t.closest("#rx-hover-hide")) {
    clearTimeout(rbx6HHTimer);
    return;
  }
  if (t.closest("#rx-panel, #rx-overlay, #rx-bar, #rx-soc, #navigation, #header, [class*='friends-carousel' i], [class*='friend-tile' i]")) return;
  const a = t.closest('a[href*="/games/"]');
  if (!a) {
    if (rbx6HH && !rbx6HH.hidden) rbx6HHSchedule();
    return;
  }
  const m = /\/games\/(\d+)/.exec(a.getAttribute("href") || "");
  if (!m) return;
  const here = rbxPageInfo(location.pathname);
  if (here && here.k === "game" && here.id === m[1]) return;
  // Seulement sur les vignettes que rbx6ApplyHidden sait cacher : sinon le bouton ne ferait rien.
  const tile = rbxGameTile(a);
  if (!tile) return;
  const r = tile.rect;
  const nm = tile.card.querySelector(".game-card-name, [class*='game-card-name' i]");
  const title = ((nm && nm.textContent.trim()) || tile.img.alt || "Jeu " + m[1]).slice(0, 80);
  clearTimeout(rbx6HHTimer);
  const b = rbx6HHBtn();
  rbx6HHInfo = { pid: m[1], title };
  b.style.left = r.right - 8 + "px";
  b.style.top = r.top + 8 + "px";
  b.hidden = false;
});

document.addEventListener("mouseout", () => {
  if (rbx6HH && !rbx6HH.hidden) rbx6HHSchedule();
});

window.addEventListener("scroll", () => rbx6HHHide(), { passive: true, capture: true });

chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "openPanel") rbxOpenPanel();
});

function rbx6Tick() {
  if (!document.body) return;
  [rbx6Dock, rbx6ApplyHidden, rbx6RobuxRecord].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
}

const rbx6Refresh = rbxMakeThrottle(() => {
  const ov = document.getElementById("rx-overlay");
  if (ov && ov.classList.contains("rx-open") && ov.querySelector('.rx-section[data-section="activity"].rx-active')) rbx6RenderActivity();
}, 600);

rbxEvery(rbx6Tick, 1000);
rbxOnChange(rbxMakeThrottle(rbx6Tick, 800));
rbxOnChange(rbx6Refresh);