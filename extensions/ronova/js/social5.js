const RBX5_VERSION = (function () {
  try {
    return chrome.runtime.getManifest().version;
  } catch (e) {
    return "";
  }
})();

const RBX5_NEWS = [
  "Recherche dans tous les réglages : Ctrl+K",
  "Nouvel onglet Styles : sauvegarde, partage et change de look en un clic",
  "Notifications quand un best friend se connecte ou lance un jeu",
  "Interface : barre de progression, apparition fluide des cartes, largeur du contenu",
  "Boutons flottants réductibles, à gauche ou à droite, panneau en 3 tailles",
  "Diagnostic intégré pour repérer ce qui ne s'affiche pas"
];

const RBX5_LOOK = [
  "theme", "useBgColor", "bgColor", "cardColor", "textColor", "accent", "accentAuto", "bgImage", "bgGradient",
  "gradEnabled", "gradA", "gradB", "gradC", "gradD", "gradCount", "gradType", "gradAngle", "gradDim",
  "gradAnimated", "gradSpeed", "glassIntensity", "glassCards", "glassNav", "glassButtons", "glassPanel",
  "neonGlow", "accentBorders", "font", "fontSize", "customScroll", "smoothScroll",
  "noAnimations", "forceNative", "uiPolish", "uiRound", "uiButtons", "uiLift", "uiShadow", "uiSidebar", "uiTitles",
  "uiAvatars", "uiFocus", "uiModern", "uiFriends", "uiAppear", "uiProgress", "contentWidth"
];

const RBX5_COLOR_KEYS = ["bgColor", "cardColor", "textColor", "accent", "gradA", "gradB", "gradC", "gradD"];

Object.assign(RBX_DEFAULTS, {
  panelSize: "normal",
  panelAnim: true,
  dockMode: "always",
  dockSide: "right",
  notifyBest: true,
  notifyEvery: 60,
  uiAppear: true,
  uiProgress: false,
  contentWidth: 0,
  presets: [],
  seenVer: ""
});

rbxState = rbxEffective(rbxSaved);

(function rbx5Setup() {
  const i = RBX_TABS.findIndex((t) => t.id === "interface");
  if (!RBX_TABS.some((t) => t.id === "styles")) {
    RBX_TABS.splice(i < 0 ? RBX_TABS.length : i + 1, 0, { id: "styles", label: "Styles", fields: [] });
  }
  rbxSocAddField("interface", "uiTitles", { key: "uiAppear", type: "checkbox", label: "Apparition fluide des cartes de jeux et d'objets" });
  rbxSocAddField("interface", "uiAppear", { key: "uiProgress", type: "checkbox", label: "Barre de progression du défilement en haut de la page" });
  rbxSocAddField("interface", "uiProgress", {
    key: "contentWidth",
    type: "select",
    label: "Largeur maximale du contenu",
    options: [[0, "Automatique"], [1100, "Étroite (1100 px)"], [1300, "Moyenne (1300 px)"], [1500, "Large (1500 px)"], [1700, "Très large (1700 px)"], [9999, "Toute la largeur"]]
  });
})();

function rbx5Norm(s) {
  return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim();
}

function rbx5Index() {
  const out = [];
  const seen = new Set();
  const panel = document.getElementById("rx-panel");
  if (!panel) return out;
  const tabNames = new Map();
  panel.querySelectorAll(".rx-tab").forEach((b) => tabNames.set(b.dataset.tab, b.textContent.replace(/\s+/g, " ").trim()));
  const subNames = new Map();
  panel.querySelectorAll(".rx-subtab").forEach((b) => subNames.set(b.dataset.sub, b.textContent.trim()));
  const paneNames = new Map();
  panel.querySelectorAll(".sx-subtab").forEach((b) => paneNames.set(b.dataset.socSub, b.textContent.trim()));
  const allowed = (id) => id !== "admin" || rbxAdmin || rbxSecretOpen;

  const add = (label, tab, sub, pane, el) => {
    const clean = label.replace(/\s+/g, " ").trim();
    if (!clean || clean.length > 110) return;
    const key = tab + "|" + sub + "|" + pane + "|" + clean;
    if (seen.has(key)) return;
    seen.add(key);
    const parts = [tabNames.get(tab) || tab];
    if (sub) parts.push(subNames.get(sub) || sub);
    if (pane) parts.push(paneNames.get(pane) || pane);
    out.push({ label: clean, norm: rbx5Norm(clean), path: parts.join(" › "), tab, sub, pane, el });
  };

  tabNames.forEach((name, id) => {
    if (allowed(id)) add("Onglet " + name, id, "", "", null);
  });

  panel.querySelectorAll(".rx-section").forEach((sec) => {
    const tab = sec.dataset.section;
    if (!allowed(tab)) return;
    sec.querySelectorAll(".rx-row, .rx-col, .rx-theme").forEach((el) => {
      const subEl = el.closest(".rx-sub");
      const paneEl = el.closest(".sx-sub");
      let label = "";
      const lb = el.querySelector(".rx-label");
      if (lb) {
        label = lb.textContent;
        if (el.querySelector('input[type="range"]')) label = label.replace(/\s*:\s*.*$/, "");
      } else if (el.classList.contains("rx-theme")) {
        const n = el.querySelector(".rx-theme-name");
        label = "Thème " + (n ? n.textContent : "");
      }
      if (!label) return;
      add(label, tab, subEl ? subEl.dataset.subSection : "", paneEl ? paneEl.dataset.socPane : "", el);
    });
  });
  return out;
}

function rbx5Search(q) {
  const tokens = q.split(" ").filter(Boolean);
  const scored = [];
  rbx5Index().forEach((it) => {
    let ok = true;
    let score = 0;
    tokens.forEach((t) => {
      const i = it.norm.indexOf(t);
      if (i === -1) {
        ok = false;
        return;
      }
      score += i === 0 ? 3 : it.norm.indexOf(" " + t) !== -1 ? 2 : 1;
    });
    if (ok) scored.push({ it, score });
  });
  scored.sort((a, b) => b.score - a.score || a.it.label.length - b.it.label.length);
  return scored.slice(0, 12).map((x) => x.it);
}

function rbx5Go(it) {
  const panel = document.getElementById("rx-panel");
  if (!panel) return;
  rbxShowTab(it.tab);
  if (it.sub) rbxShowSub(it.sub);
  if (it.pane) {
    const b = panel.querySelector(`.sx-subtab[data-soc-sub="${it.pane}"]`);
    if (b) rbxSocShowSub(b);
  }
  if (!it.el) return;
  setTimeout(() => {
    it.el.scrollIntoView({ block: "center", behavior: "smooth" });
    it.el.classList.add("rx5-pulse");
    setTimeout(() => it.el.classList.remove("rx5-pulse"), 1800);
  }, 120);
}

function rbx5Pick(obj) {
  const o = {};
  RBX5_LOOK.forEach((k) => {
    if (obj && obj[k] !== undefined) o[k] = obj[k];
  });
  return o;
}

function rbx5Sanitize(d) {
  const out = {};
  if (!d || typeof d !== "object") return out;
  RBX5_LOOK.forEach((k) => {
    if (!(k in d)) return;
    const v = d[k];
    const def = RBX_DEFAULTS[k];
    if (RBX5_COLOR_KEYS.includes(k)) {
      if (v === "" || (typeof v === "string" && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(v))) out[k] = v;
      return;
    }
    if (k === "theme") {
      out[k] = typeof v === "string" && (v === "custom" || RBX_ALL_THEMES[v]) ? v : "custom";
      return;
    }
    if (k === "bgImage") {
      out[k] = typeof v === "string" && (v === "" || /^https:\/\/[^\s"'()<>]{1,480}$/.test(v)) ? v : "";
      return;
    }
    if (k === "bgGradient") {
      out[k] = rbxSafeGradient(v);
      return;
    }
    if (k === "font") {
      out[k] = typeof v === "string" && /^[\w\s,'"-]{0,80}$/.test(v) ? v : "";
      return;
    }
    if (k === "gradType") {
      out[k] = ["linear", "radial", "conic"].includes(v) ? v : "linear";
      return;
    }
    if (typeof def === "boolean") {
      if (typeof v === "boolean") out[k] = v;
      return;
    }
    if (typeof def === "number") {
      const n = Number(v);
      if (Number.isFinite(n)) out[k] = rbxSocClamp(n, -1000, 5000);
      return;
    }
    if (typeof def === "string" && typeof v === "string" && v.length <= 200) out[k] = v;
  });
  return out;
}

function rbx5Encode(obj) {
  return "RBXS1." + rbxBytesToB64u(new TextEncoder().encode(JSON.stringify(obj)));
}

function rbx5Decode(code) {
  const m = /^RBXS1\.([A-Za-z0-9_-]+)$/.exec(String(code || "").trim());
  if (!m) return null;
  try {
    return JSON.parse(new TextDecoder().decode(rbxB64uToBytes(m[1])));
  } catch (e) {
    return null;
  }
}

function rbx5PresetList() {
  return Array.isArray(rbxSaved.presets) ? rbxSaved.presets : [];
}

function rbx5ApplyPreset(p) {
  const d = rbx5Sanitize(p.data);
  rbxSet({ ...d, autoPeriod: "" });
  rbxSyncInputs();
  rbxToast(`Style « ${p.name} » appliqué`);
}

function rbx5AddPreset(name, data) {
  const list = rbx5PresetList();
  if (list.length >= 20) {
    rbxToast("20 styles maximum : supprime-en un d'abord");
    return false;
  }
  const rec = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), name: String(name).slice(0, 30), ts: Date.now(), data };
  rbxSet({ presets: [rec, ...list] });
  return true;
}

function rbx5RenderStyles() {
  const box = document.querySelector('#rx-panel [data-s5-list="presets"]');
  if (!box) return;
  box.textContent = "";
  const list = rbx5PresetList();
  if (!list.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun style enregistré. Règle ton look, donne-lui un nom puis clique sur Sauvegarder."));
    return;
  }
  list.forEach((p) => {
    const row = sxEl("div", "rx-li");
    const sw = sxEl("span", "rx5-sw");
    const d = p.data || {};
    const th = RBX_ALL_THEMES[d.theme] || {};
    [d.bgColor || th.bgColor, d.cardColor || th.cardColor, d.accent || th.accent].forEach((c) => {
      const dot = sxEl("i");
      if (typeof c === "string" && /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(c)) dot.style.background = c;
      sw.appendChild(dot);
    });
    row.appendChild(sw);
    row.appendChild(sxEl("span", "rx-li-name", p.name));
    const ap = sxBtn("Appliquer", "rx-sec");
    ap.addEventListener("click", () => rbx5ApplyPreset(p));
    const cp = sxBtn("Copier le code", "rx-sec");
    cp.addEventListener("click", () => rbxCopyText(rbx5Encode({ v: 1, n: p.name, d: p.data }), "Code de style copié"));
    const del = sxBtn("Supprimer", "rx-sec rx-danger");
    del.addEventListener("click", () => {
      if (!confirm(`Supprimer le style « ${p.name} » ?`)) return;
      rbxSet({ presets: rbx5PresetList().filter((x) => x.id !== p.id) });
      rbx5RenderStyles();
    });
    row.appendChild(ap);
    row.appendChild(cp);
    row.appendChild(del);
    box.appendChild(row);
  });
}

function rbx5StylesHtml() {
  const f = (o) => rbxFieldHtml(o);
  const panelGroup =
    f({ key: "panelSize", type: "select", label: "Taille du panneau", options: [["compact", "Compact"], ["normal", "Normal"], ["large", "Grand"]] }) +
    f({ key: "panelAnim", type: "checkbox", label: "Animation d'ouverture du panneau" }) +
    f({ key: "dockMode", type: "select", label: "Boutons flottants", options: [["always", "Toujours visibles"], ["hover", "Réduits, ils s'ouvrent au survol"]] }) +
    f({ key: "dockSide", type: "select", label: "Côté des boutons flottants", options: [["right", "À droite"], ["left", "À gauche"]] });
  const notifGroup =
    f({ key: "notifyBest", type: "checkbox", label: "Prévenir quand un best friend se connecte ou lance un jeu" }) +
    f({ key: "notifyEvery", type: "select", label: "Fréquence de vérification", options: [[30, "Toutes les 30 secondes"], [60, "Toutes les minutes"], [120, "Toutes les 2 minutes"], [300, "Toutes les 5 minutes"]] });
  return `<p class="rx-hint">Sauvegarde ton look actuel (thème, dégradé, verre, interface, effets), change de style en un clic et partage-le avec un code.</p>
<div class="rx-group"><div class="rx-col"><span class="rx-label">Sauvegarder mon look actuel</span>
<div class="rx-inline"><input type="text" maxlength="30" placeholder="Nom du style" data-s5-in="presetName"><button type="button" class="rx-sec" data-s5="presetSave">Sauvegarder</button></div></div></div>
<div class="rx-list rx-spaced" data-s5-list="presets"></div>
<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Partager un style</span>
<textarea data-s5-in="shareCode" placeholder="Colle un code de style ici (RBXS1.…)"></textarea>
<div class="rx-actions"><button type="button" class="rx-sec" data-s5="shareCopy">Copier mon look actuel</button><button type="button" class="rx-sec" data-s5="shareImport">Importer ce code</button><button type="button" class="rx-sec rx-danger" data-s5="resetLook">Réinitialiser l'apparence</button></div></div></div>
<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Panneau et boutons flottants</span></div>${panelGroup}</div>
<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Notifications des best friends</span></div>${notifGroup}</div>`;
}

function rbx5FillStyles() {
  const sec = document.querySelector('#rx-panel .rx-section[data-section="styles"]');
  if (sec) sec.innerHTML = rbx5StylesHtml();
  rbx5RenderStyles();
}

async function rbx5Action(name) {
  const inp = (n) => document.querySelector(`#rx-panel [data-s5-in="${n}"]`);

  if (name === "presetSave") {
    const raw = inp("presetName") ? inp("presetName").value.trim() : "";
    const label = raw || `Style ${rbx5PresetList().length + 1}`;
    if (rbx5AddPreset(label, rbx5Pick(rbxSaved))) {
      if (inp("presetName")) inp("presetName").value = "";
      rbx5RenderStyles();
      rbxToast(`Style « ${label} » sauvegardé`);
    }
    return;
  }
  if (name === "shareCopy") {
    const code = rbx5Encode({ v: 1, n: "Mon style", d: rbx5Pick(rbxSaved) });
    if (inp("shareCode")) inp("shareCode").value = code;
    rbxCopyText(code, "Code de ton look copié");
    return;
  }
  if (name === "shareImport") {
    const obj = rbx5Decode(inp("shareCode") ? inp("shareCode").value : "");
    if (!obj || obj.v !== 1) {
      rbxToast("Code de style invalide");
      return;
    }
    const data = rbx5Sanitize(obj.d);
    if (!Object.keys(data).length) {
      rbxToast("Ce code ne contient aucun réglage utilisable");
      return;
    }
    const label = typeof obj.n === "string" && obj.n.trim() ? obj.n.trim().slice(0, 30) : "Style importé";
    rbxSet({ ...data, autoPeriod: "" });
    rbbx5SyncAfterImport(label, data);
    return;
  }
  if (name === "resetLook") {
    if (!confirm("Réinitialiser toute l'apparence (thème, dégradé, verre, interface, effets) ? Tes autres réglages ne changent pas.")) return;
    rbxSet({ ...rbx5Pick(RBX_DEFAULTS), autoPeriod: "" });
    rbxSyncInputs();
    rbxToast("Apparence réinitialisée");
    return;
  }
}

function rbbx5SyncAfterImport(label, data) {
  rbxSyncInputs();
  if (rbx5PresetList().length < 20) rbx5AddPreset(label, data);
  rbx5RenderStyles();
  rbxToast(`Style « ${label} » importé et appliqué`);
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  const b = t.closest("#rx-panel [data-s5]");
  if (b) rbx5Action(b.dataset.s5);
});

document.addEventListener(
  "keydown",
  (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey || e.shiftKey || !e.key || e.key.toLowerCase() !== "k") return;
    e.preventDefault();
    rbxOpenPanel();
    setTimeout(() => {
      const i = document.querySelector("#rx-panel [data-rx5-search]");
      if (i) {
        i.focus();
        i.select();
      }
    }, 60);
  },
  true
);

function rbx5InjectChrome(ov) {
  const panel = ov.querySelector("#rx-panel");
  const head = panel ? panel.querySelector(".rx-head") : null;
  if (!panel || !head) return;

  const wrap = sxEl("div", "rx5-searchwrap");
  const box = sxEl("div", "rx5-search");
  box.appendChild(sxEl("span", "rx5-ico"));
  const input = document.createElement("input");
  input.type = "search";
  input.placeholder = "Rechercher un réglage…";
  input.autocomplete = "off";
  input.setAttribute("data-rx5-search", "1");
  box.appendChild(input);
  box.appendChild(sxEl("kbd", "", "Ctrl K"));
  const res = sxEl("div", "rx5-results");
  res.hidden = true;
  wrap.appendChild(box);
  wrap.appendChild(res);
  head.insertAdjacentElement("afterend", wrap);

  let hits = [];
  let idx = 0;

  const mark = () => {
    Array.from(res.querySelectorAll(".rx5-res")).forEach((b, i) => b.classList.toggle("rx5-on", i === idx));
    const cur = res.querySelectorAll(".rx5-res")[idx];
    if (cur) cur.scrollIntoView({ block: "nearest" });
  };

  const choose = (it) => {
    input.value = "";
    res.hidden = true;
    res.textContent = "";
    hits = [];
    rbx5Go(it);
  };

  const render = () => {
    const q = rbx5Norm(input.value);
    res.textContent = "";
    if (!q) {
      res.hidden = true;
      hits = [];
      return;
    }
    hits = rbx5Search(q);
    idx = 0;
    if (!hits.length) {
      res.appendChild(sxEl("p", "rx5-none", "Aucun réglage trouvé."));
      res.hidden = false;
      return;
    }
    hits.forEach((h) => {
      const b = sxEl("button", "rx5-res");
      b.type = "button";
      b.appendChild(sxEl("strong", "", h.label));
      b.appendChild(sxEl("small", "", h.path));
      b.addEventListener("click", () => choose(h));
      res.appendChild(b);
    });
    res.hidden = false;
    mark();
  };

  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && hits.length) {
      e.preventDefault();
      idx = (idx + 1) % hits.length;
      mark();
    } else if (e.key === "ArrowUp" && hits.length) {
      e.preventDefault();
      idx = (idx - 1 + hits.length) % hits.length;
      mark();
    } else if (e.key === "Enter" && hits[idx]) {
      e.preventDefault();
      choose(hits[idx]);
    } else if (e.key === "Escape" && (input.value || !res.hidden)) {
      e.preventDefault();
      e.stopPropagation();
      input.value = "";
      render();
    }
  });
  panel.addEventListener("click", (e) => {
    if (!wrap.contains(e.target)) res.hidden = true;
  });

  const content = panel.querySelector(".rx-content");
  if (RBX5_VERSION && rbxSaved.seenVer !== RBX5_VERSION && content) {
    const news = sxEl("div", "rx5-news");
    news.appendChild(sxEl("strong", "", "Nouveautés de la version " + RBX5_VERSION));
    const ul = document.createElement("ul");
    RBX5_NEWS.forEach((t) => ul.appendChild(sxEl("li", "", t)));
    news.appendChild(ul);
    const ok = sxBtn("Compris", "rx-sec");
    ok.addEventListener("click", () => {
      rbxSet({ seenVer: RBX5_VERSION });
      news.remove();
    });
    news.appendChild(ok);
    content.insertBefore(news, content.firstChild);
  }

  const foot = sxEl("div", "rx5-foot");
  foot.appendChild(sxEl("span", "", "RoNova v" + RBX5_VERSION));
  foot.appendChild(sxEl("span", "", "Ctrl+K pour chercher un réglage"));
  panel.appendChild(foot);
}

function rbx5ReadTab() {
  try {
    return sessionStorage.getItem("rx5Tab") || "";
  } catch (e) {
    return "";
  }
}

const rbx5BuildPanelPrev = rbxBuildPanel;
rbxBuildPanel = function () {
  const had = !!document.getElementById("rx-overlay");
  const saved = rbx5ReadTab();
  rbx5BuildPanelPrev();
  if (had) return;
  const ov = document.getElementById("rx-overlay");
  if (!ov) return;
  rbx5FillStyles();
  rbx5InjectChrome(ov);
  if (saved && saved !== "admin" && ov.querySelector(`.rx-tab[data-tab="${saved}"]`)) rbxShowTab(saved);
};

const rbx5ShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  rbx5ShowTabPrev(id);
  try {
    if (id !== "admin") sessionStorage.setItem("rx5Tab", id);
  } catch (e) {
    return;
  }
  if (id === "styles") rbx5RenderStyles();
};

const rbx5N = { map: new Map(), base: false, at: 0, busy: false };

function rbx5Host() {
  let el = document.getElementById("rx-notifs");
  if (!el && document.body) {
    el = document.createElement("div");
    el.id = "rx-notifs";
    document.body.appendChild(el);
  }
  return el;
}

function rbx5Card(b, p, kind) {
  const host = rbx5Host();
  if (!host) return;
  while (host.children.length >= 4) host.firstChild.remove();
  const c = sxEl("div", "rx5-n");
  c.appendChild(sxImg(rbxHeadCache.get(b.id), "rx5-nimg"));
  const txt = sxEl("div", "rx5-ntxt");
  txt.appendChild(sxEl("strong", "rx5-name", b.d || b.n));
  let msg = " vient de se connecter";
  if (kind === "play") msg = ` joue à ${p.lastLocation || "un jeu"}`;
  else if (kind === "studio") msg = " est dans Roblox Studio";
  txt.appendChild(sxEl("span", "", msg));
  c.appendChild(txt);
  if (kind === "play" && rbxCanJoin(p)) {
    const j = sxBtn("Rejoindre", "rx5-nbtn");
    j.addEventListener("click", () => rbxJoinPresence(p));
    c.appendChild(j);
  }
  const x = sxBtn("×", "rx5-nx");
  x.addEventListener("click", () => c.remove());
  c.appendChild(x);
  host.appendChild(c);
  setTimeout(() => c.remove(), 12000);
}

async function rbx5Poll() {
  const s = rbxState;
  if (!s.enabled || !s.notifyBest || document.visibilityState !== "visible" || rbx5N.busy || !document.body) return;
  const list = rbxBestList();
  if (!list.length) {
    rbx5N.map.clear();
    rbx5N.base = false;
    return;
  }
  const every = Math.max(30, Number(s.notifyEvery) || 60) * 1000;
  if (Date.now() - rbx5N.at < every) return;
  rbx5N.busy = true;
  rbx5N.at = Date.now();
  try {
    const ids = list.map((b) => b.id);
    const pres = await rbxPresence(ids);
    if (!pres.size) return;
    await rbxThumbBatch(RBX_HEAD_URL, ids, rbxHeadCache, 100);
    list.forEach((b) => {
      const p = pres.get(b.id);
      if (!p) return;
      const prev = rbx5N.map.get(b.id);
      const type = p.userPresenceType;
      if (rbx5N.base && prev !== undefined) {
        if (type === 2 && prev !== 2) rbx5Card(b, p, "play");
        else if (type === 3 && prev !== 3 && prev < 1) rbx5Card(b, p, "studio");
        else if (type >= 1 && prev < 1) rbx5Card(b, p, "online");
      }
      rbx5N.map.set(b.id, type);
    });
    rbx5N.base = true;
  } finally {
    rbx5N.busy = false;
  }
}

let rbx5Prog = null;
let rbx5ProgRaf = 0;

function rbx5ProgUpdate() {
  rbx5ProgRaf = 0;
  if (!rbx5Prog) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  rbx5Prog.style.transform = `scaleX(${p})`;
}

window.addEventListener(
  "scroll",
  () => {
    if (rbx5Prog && !rbx5ProgRaf) rbx5ProgRaf = requestAnimationFrame(rbx5ProgUpdate);
  },
  { passive: true }
);

function rbx5ProgEnsure() {
  const on = rbxState.enabled && rbxState.uiProgress && document.body;
  if (!on) {
    if (rbx5Prog) {
      rbx5Prog.remove();
      rbx5Prog = null;
    }
    return;
  }
  if (!rbx5Prog || !rbx5Prog.isConnected) {
    rbx5Prog = document.createElement("div");
    rbx5Prog.id = "rx-progress";
    document.body.appendChild(rbx5Prog);
  }
  rbx5ProgUpdate();
}

function rbx5Apply(s) {
  const r = document.documentElement;
  r.dataset.rxSize = ["compact", "normal", "large"].includes(s.panelSize) ? s.panelSize : "normal";
  r.dataset.rxAnim = s.panelAnim === false ? "off" : "on";
  r.dataset.rxDock = s.dockMode === "hover" ? "hover" : "always";
  r.dataset.rxSide = s.dockSide === "left" ? "left" : "right";
}

function rbx5Css(s) {
  let css = "";
  const w = Number(s.contentWidth) || 0;
  if (w > 0) {
    css += `${RBX_P3} .content, ${RBX_P3} .container-main, ${RBX_P3} #content, ${RBX_P3} .container-main > .content { width: min(100%, ${w}px) !important; max-width: ${w}px !important; }`;
  }
  if (s.blurName) {
    css += `${RBX_P3} #rx-notifs .rx5-name { filter: blur(7px) !important; transition: filter 0.15s; }`;
    if (s.blurReveal !== false) css += `${RBX_P3} #rx-notifs .rx5-name:hover { filter: none !important; }`;
  }
  return css;
}

const rbx5CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx5CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx5Css(s);
};

function rbx5Tick() {
  if (!document.body) return;
  rbx5Apply(rbxState);
  rbx5ProgEnsure();
  rbx5Poll().catch(() => {});
}

rbxEvery(rbx5Tick, 1000);
rbxOnChange(rbx5Apply);
rbxOnChange(rbxSocStyleRefresh);