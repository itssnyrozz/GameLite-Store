Object.assign(RBX_DEFAULTS, {
  socMutual: true,
  itemPriceChart: true
});

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

RBX5_NEWS.length = 0;
RBX5_NEWS.push(
  "Premium automatique : le créateur peut te l'offrir sans que tu aies de clé à entrer",
  "Amis > Mes amis : tous tes amis avec leur statut en direct, filtres, recherche et Rejoindre en un clic",
  "Badge Créateur : repère le créateur de l'extension sur son profil et à côté de son pseudo",
  "Retour du badge certifié sur ton profil, dans Premium > Profil+",
  "Roblox plus moderne : cartes qui apparaissent au défilement, en-tête en verre, menus et fenêtres animés",
  "Survol des jeux plus fluide : l'image zoome et la carte se soulève avec une lueur",
  "Panneau redessiné : fermeture animée, interrupteurs à ressort, effets au survol",
  "Fonctions en double ou peu utiles retirées (horloge, badge certifié, filtres de couleur, diagnostic…)",
  "Amis en commun sur les profils et historique du prix des objets limited"
);

const RBX9_DESC = {
  themes: "Choisis une base de couleurs pour tout le site.",
  colors: "Ajuste chaque couleur à la main.",
  text: "Police, taille du texte et arrondis.",
  effects: "Petits effets visuels et filtres de couleur.",
  interface: "Retouches du design de Roblox, rangées par zone.",
  styles: "Sauvegarde, partage et outils du panneau.",
  hide: "Retire les blocs que tu ne veux pas voir.",
  privacy: "Floute ce que tu ne veux pas montrer à l'écran.",
  buttons: "Boutons ajoutés par l'extension.",
  profile: "Infos ajoutées sur les profils, les jeux et les objets.",
  friends: "Rejoindre, best friends, demandes et ménage dans tes amis.",
  outfits: "Change de tenue sans ouvrir l'éditeur d'avatar.",
  premium: "Fonctions avancées.",
  activity: "Temps de jeu et Robux.",
  tools: "Convertisseur et raccourcis de navigation.",
  admin: "Licences et réglages avancés."
};

const RBX9_UI_GROUPS = [
  ["Général", ["uiPolish", "uiModern", "uiType", "uiDensity", "contentWidth", "uiRound", "uiFocus", "focusMode"]],
  ["Animations", ["uiMotion", "uiAppear", "uiLift", "uiButtons"]],
  ["Cartes et sections", ["uiShadow", "uiCardTitles", "uiTitles", "uiChips", "uiSeeAll"]],
  ["Menu et en-tête", ["uiGlassHeader", "uiSidebar", "uiSearch", "uiProgress", "uiBadgeFix", "hidePlusPromo"]],
  ["Amis", ["uiFriends", "themePopups", "friendNames", "showHandles", "bestFirst", "uiAvatars"]]
];

// Réglages retirés en 8.0 : on reporte leur effet sur l'équivalent conservé.
function rbx9Migrate() {
  if (!rbxReady || rbxSaved.v8Migrated) return;
  const s = rbxSaved;
  const patch = { v8Migrated: true };
  if (s.wide === true && !Number(s.contentWidth)) patch.contentWidth = 9999;
  if (s.compact === true && s.uiDensity === "normal") patch.uiDensity = "tight";
  if (s.radius !== undefined && s.radius !== "" && Number.isFinite(Number(s.radius))) patch.uiRound = rbxClamp(Math.round(Number(s.radius) / 2) * 2, 0, 28);
  if (s.hoverZoom === true) patch.uiLift = true;
  rbxSet(patch);
}

const RBX9_KEYS = [
  ["Ctrl + K", "Chercher un réglage", false],
  ["?", "Afficher cette aide", false],
  ["Échap", "Fermer le panneau", false],
  ["Alt + S", "Ouvrir le panneau", true],
  ["Alt + U", "Remonter en haut de la page", true],
  ["Alt + Q", "Aller à la barre de recherche", true],
  ["Alt + J", "Rejoindre vite le jeu ouvert", true],
  ["Alt + Z", "Mode focus", true],
  ["Alt + H", "Accueil", true],
  ["Alt + G", "Découvrir", true],
  ["Alt + C", "Catalogue", true],
  ["Alt + A", "Mon avatar", true]
];

(function rbx9Setup() {
  try {
    const ui = RBX_TABS.find((t) => t.id === "interface");
    if (ui && ui.fields) {
      const byKey = new Map(ui.fields.map((f) => [f.key, f]));
      const used = new Set();
      const out = [];
      RBX9_UI_GROUPS.forEach(([label, keys]) => {
        const fs = keys.filter((k) => byKey.has(k) && !used.has(k));
        if (!fs.length) return;
        out.push({ key: "", type: "heading", label });
        fs.forEach((k) => {
          used.add(k);
          out.push(byKey.get(k));
        });
      });
      const rest = ui.fields.filter((f) => !used.has(f.key));
      if (rest.length) out.push({ key: "", type: "heading", label: "Autres" }, ...rest);
      ui.fields = out;
    }
    const prof = RBX_TABS.find((t) => t.id === "profile");
    if (prof && prof.fields && !prof.fields.some((f) => f.key === "socMutual")) {
      prof.fields.push(
        { key: "", type: "heading", label: "Autres pages" },
        { key: "socMutual", type: "checkbox", label: "Amis en commun sur le profil des autres joueurs" },
        { key: "itemPriceChart", type: "checkbox", label: "Historique du prix des objets limited" }
      );
    }
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
})();

const rbx9FieldPrev = rbxFieldHtml;
rbxFieldHtml = function (f) {
  if (f.type === "heading") return `<div class="rx9-heading">${rbxEsc(f.label)}</div>`;
  return rbx9FieldPrev(f);
};

function rbx9TabKeys(id) {
  const t = RBX_TABS.find((x) => x.id === id);
  return t && t.fields ? t.fields.map((f) => f.key).filter(Boolean) : [];
}

function rbx9Same(a, b) {
  if (a === b) return true;
  if ((a === "" || a === null || a === undefined) && (b === "" || b === null || b === undefined)) return true;
  return typeof a === "number" && Number(b) === a;
}

function rbx9MarkMods() {
  document.querySelectorAll("#rx-panel [data-key]").forEach((el) => {
    const k = el.dataset.key;
    if (k === "enabled") return;
    const row = el.closest(".rx-row, .rx-col");
    if (row) row.classList.toggle("rx9-mod", !rbx9Same(RBX_DEFAULTS[k], rbxSaved[k]));
  });
  document.querySelectorAll("#rx-panel [data-rx9-reset]").forEach((b) => {
    const keys = rbx9TabKeys(b.dataset.rx9Reset);
    b.disabled = !keys.some((k) => !rbx9Same(RBX_DEFAULTS[k], rbxSaved[k]));
  });
}

function rbx9ResetTab(id) {
  const keys = rbx9TabKeys(id);
  if (!keys.length) return;
  const t = RBX_TABS.find((x) => x.id === id);
  if (!confirm(`Remettre l'onglet « ${t ? t.label : id} » par défaut ?`)) return;
  const patch = {};
  keys.forEach((k) => {
    patch[k] = RBX_DEFAULTS[k];
  });
  if (keys.some((k) => ["bgColor", "cardColor", "textColor", "accent", "useBgColor"].includes(k))) patch.theme = "custom";
  rbxSet(patch);
  rbxSyncInputs();
  rbxToast("Onglet réinitialisé");
}

function rbx9Heads(ov) {
  ov.querySelectorAll(".rx-section").forEach((sec) => {
    if (sec.querySelector(":scope > .rx9-head")) return;
    const id = sec.dataset.section;
    const tab = RBX_TABS.find((t) => t.id === id);
    if (!tab) return;
    const head = sxEl("div", "rx9-head");
    const txt = sxEl("div", "rx9-head-txt");
    txt.appendChild(sxEl("h3", "", tab.label));
    if (RBX9_DESC[id]) txt.appendChild(sxEl("p", "", RBX9_DESC[id]));
    head.appendChild(txt);
    if (rbx9TabKeys(id).length) {
      const b = sxBtn("Réinitialiser cet onglet", "rx-sec rx9-reset");
      b.dataset.rx9Reset = id;
      head.appendChild(b);
    }
    sec.insertBefore(head, sec.firstChild);
  });
}

function rbx9HelpOpen() {
  let ov = document.getElementById("rx9-help");
  if (ov) {
    ov.remove();
    return;
  }
  if (!document.body) return;
  ov = sxEl("div", "");
  ov.id = "rx9-help";
  const box = sxEl("div", "rx9-help-box");
  box.setAttribute("role", "dialog");
  box.appendChild(sxEl("h3", "", "Raccourcis clavier"));
  const on = !!rbxState.enableShortcuts;
  if (!on) box.appendChild(sxEl("p", "rx9-help-note", "Les raccourcis Alt sont désactivés : active-les dans Premium > Confort."));
  const list = sxEl("div", "rx9-keys");
  RBX9_KEYS.forEach(([k, label, alt]) => {
    const row = sxEl("div", alt && !on ? "rx9-key rx9-off" : "rx9-key");
    const kb = sxEl("span", "rx9-kbd");
    k.split(" + ").forEach((part, i) => {
      if (i) kb.appendChild(document.createTextNode(" + "));
      kb.appendChild(sxEl("kbd", "", part));
    });
    row.appendChild(kb);
    row.appendChild(sxEl("span", "", label));
    list.appendChild(row);
  });
  box.appendChild(list);
  const close = sxBtn("Fermer", "rx9-help-close");
  close.addEventListener("click", () => ov.remove());
  box.appendChild(close);
  ov.appendChild(box);
  ov.addEventListener("click", (e) => {
    if (e.target === ov) ov.remove();
  });
  document.body.appendChild(ov);
}

function rbx9Typing(t) {
  return !!(t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)));
}

document.addEventListener(
  "keydown",
  (e) => {
    const help = document.getElementById("rx9-help");
    if (help && e.key === "Escape") {
      e.preventDefault();
      e.stopImmediatePropagation();
      help.remove();
      return;
    }
    if (e.key !== "?" || e.ctrlKey || e.metaKey || e.altKey || rbx9Typing(e.target) || !rbxState.enabled) return;
    e.preventDefault();
    rbx9HelpOpen();
  },
  true
);

const rbx9BuildPrev = rbxBuildPanel;
rbxBuildPanel = function () {
  const had = !!document.getElementById("rx-overlay");
  rbx9BuildPrev();
  if (had) return;
  const ov = document.getElementById("rx-overlay");
  if (!ov) return;
  try {
    rbx9Heads(ov);
    const foot = ov.querySelector(".rx5-foot");
    if (foot) {
      const b = sxBtn("Raccourcis clavier (?)", "rx9-foot-btn");
      b.addEventListener("click", rbx9HelpOpen);
      foot.appendChild(b);
    }
    ov.addEventListener("click", (e) => {
      const b = e.target.closest && e.target.closest("[data-rx9-reset]");
      if (b) rbx9ResetTab(b.dataset.rx9Reset);
    });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
};

const rbx9SyncPrev = rbxSyncInputs;
rbxSyncInputs = function () {
  rbx9SyncPrev();
  rbx9MarkMods();
};

const rbx9OutputsPrev = rbxUpdateOutputs;
rbxUpdateOutputs = function () {
  rbx9OutputsPrev();
  rbx9MarkMods();
};

const rbx9Mutual = { id: "", busy: false, list: null, total: 0, err: "" };

async function rbx9FriendIds(uid) {
  const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${uid}/friends`);
  if (r && Array.isArray(r.data) && r.data.length) return r.data.map((f) => f && f.id).filter(Boolean);
  const found = await rbxFriendsFind(uid);
  return found.map((f) => f.id);
}

async function rbx9LoadMutual(uid) {
  rbx9Mutual.busy = true;
  rbx9Mutual.id = uid;
  rbx9Mutual.list = null;
  rbx9Mutual.err = "";
  try {
    const me = await rbxMyId();
    if (!me) throw new Error("Connecte-toi à Roblox");
    const mine = rbxFriendsList.length ? rbxFriendsList : await rbxFetchFriendsList(me, null);
    if (!mine.length) throw new Error("Impossible de charger ta liste d'amis");
    const theirs = new Set(await rbx9FriendIds(uid));
    if (rbx9Mutual.id !== uid) return;
    if (!theirs.size) throw new Error("Liste d'amis privée ou indisponible");
    const common = mine.filter((f) => theirs.has(f.id));
    common.sort((a, b) => rbxFriendSortKey(a).localeCompare(rbxFriendSortKey(b)));
    await rbxThumbBatch(RBX_HEAD_URL, common.slice(0, 24).map((f) => f.id), rbxHeadCache, 100);
    if (rbx9Mutual.id !== uid) return;
    rbx9Mutual.list = common;
  } catch (e) {
    if (rbx9Mutual.id === uid) rbx9Mutual.err = e.message || "Erreur";
  } finally {
    rbx9Mutual.busy = false;
  }
}

function rbx9Anchor(mount) {
  const ids = ["rx-req", "rx-soc", "rx-bar"];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.parentElement === mount) return el;
  }
  return null;
}

function rbx9Place(el, mount) {
  const a = rbx9Anchor(mount);
  if (a) {
    if (a.nextElementSibling !== el) a.insertAdjacentElement("afterend", el);
  } else if (el.parentElement !== mount) {
    mount.insertBefore(el, mount.firstChild);
  }
}

function rbx9MutualRender() {
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-mutual");
  const me = rbxMe;
  const want = rbxState.enabled && rbxState.socMutual && page && page.k === "user" && me && String(me.id) !== page.id && mount;
  if (!want) {
    if (el) el.remove();
    return;
  }
  if (rbx9Mutual.id !== page.id && !rbx9Mutual.busy) rbx9LoadMutual(page.id);
  const m = rbx9Mutual;
  const sig = [page.id, m.busy ? 1 : 0, m.err, m.list ? m.list.length : -1, rbxState.blurName ? 1 : 0].join("|");
  if (el && el.dataset.sig === sig) {
    rbx9Place(el, mount);
    return;
  }
  if (!el) {
    el = sxEl("div", "sx-card");
    el.id = "rx-mutual";
  }
  el.dataset.sig = sig;
  el.textContent = "";
  const title = sxEl("strong", "sx-title", "Amis en commun");
  el.appendChild(title);
  if (m.id !== page.id || m.busy) {
    el.appendChild(sxEl("p", "sx-note", "Recherche des amis en commun…"));
  } else if (m.err) {
    el.appendChild(sxEl("p", "sx-note", m.err));
  } else if (!m.list || !m.list.length) {
    el.appendChild(sxEl("p", "sx-note", "Aucun ami en commun."));
  } else {
    title.textContent = `Amis en commun (${m.list.length})`;
    const grid = sxEl("div", "rx9-mutual");
    m.list.slice(0, 24).forEach((f) => {
      const a = sxEl("a", "rx9-mf");
      a.href = `https://www.roblox.com/users/${f.id}/profile`;
      a.title = rbxFriendLabel(f);
      a.appendChild(sxImg(rbxHeadCache.get(f.id), ""));
      a.appendChild(sxEl("span", "rx9-mname", f.displayName || f.name || String(f.id)));
      grid.appendChild(a);
    });
    el.appendChild(grid);
    if (m.list.length > 24) el.appendChild(sxEl("p", "sx-note", `et ${m.list.length - 24} autre(s)`));
  }
  rbx9Place(el, mount);
}

const rbx9Price = { id: "", busy: false, data: null, err: "" };

async function rbx9LoadPrice(id) {
  rbx9Price.busy = true;
  rbx9Price.id = id;
  rbx9Price.data = null;
  rbx9Price.err = "";
  try {
    const d = await rbxItemInfo(id);
    if (rbx9Price.id !== id) return;
    if (!d || !(d.IsLimited || d.IsLimitedUnique)) {
      rbx9Price.err = "skip";
      return;
    }
    const r = await rbxFetchJson(`https://economy.roblox.com/v1/assets/${encodeURIComponent(id)}/resale-data`);
    if (rbx9Price.id !== id) return;
    if (!r || !Array.isArray(r.priceDataPoints)) {
      rbx9Price.err = "Historique de prix indisponible pour cet objet.";
      return;
    }
    rbx9Price.data = r;
  } finally {
    rbx9Price.busy = false;
  }
}

function rbx9Spark(points) {
  const NS = "http://www.w3.org/2000/svg";
  const W = 600;
  const H = 120;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("class", "rx9-spark");
  const vals = points.map((p) => p.v);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const span = hi - lo || 1;
  const xy = points.map((p, i) => [points.length > 1 ? (i / (points.length - 1)) * W : W / 2, H - 8 - ((p.v - lo) / span) * (H - 16)]);
  const line = xy.map((c, i) => (i ? "L" : "M") + c[0].toFixed(1) + " " + c[1].toFixed(1)).join(" ");
  const area = document.createElementNS(NS, "path");
  area.setAttribute("d", `${line} L${W} ${H} L0 ${H} Z`);
  area.setAttribute("class", "rx9-spark-area");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", line);
  path.setAttribute("class", "rx9-spark-line");
  path.setAttribute("vector-effect", "non-scaling-stroke");
  svg.appendChild(area);
  svg.appendChild(path);
  return svg;
}

function rbx9PriceRender() {
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-price");
  const want = rbxState.enabled && rbxState.itemPriceChart && page && page.k === "item" && mount;
  if (!want) {
    if (el) el.remove();
    return;
  }
  if (rbx9Price.id !== page.id && !rbx9Price.busy) rbx9LoadPrice(page.id).catch(() => {});
  const p = rbx9Price;
  if (p.id !== page.id || p.busy || p.err === "skip") {
    if (el) el.remove();
    return;
  }
  const sig = [page.id, p.err, p.data ? 1 : 0].join("|");
  if (el && el.dataset.sig === sig) {
    rbx9Place(el, mount);
    return;
  }
  if (!el) {
    el = sxEl("div", "sx-card");
    el.id = "rx-price";
  }
  el.dataset.sig = sig;
  el.textContent = "";
  el.appendChild(sxEl("strong", "sx-title", "Historique du prix (limited)"));
  if (p.err || !p.data) {
    el.appendChild(sxEl("p", "sx-note", p.err || "Historique de prix indisponible."));
    rbx9Place(el, mount);
    return;
  }
  const d = p.data;
  const pts = d.priceDataPoints
    .map((x) => ({ v: Number(x.value) || 0, t: new Date(x.date).getTime() }))
    .filter((x) => x.v > 0 && x.t)
    .sort((a, b) => a.t - b.t);
  const grid = sxEl("div", "sx-grid");
  grid.appendChild(sxItem("RAP actuel", `${rbxNum(Number(d.recentAveragePrice) || 0)} Robux`));
  if (d.originalPrice) grid.appendChild(sxItem("Prix d'origine", `${rbxNum(Number(d.originalPrice))} Robux`));
  if (typeof d.numberRemaining === "number") grid.appendChild(sxItem("Restant", rbxNum(d.numberRemaining)));
  if (typeof d.assetStock === "number" && d.assetStock > 0) grid.appendChild(sxItem("Stock total", rbxNum(d.assetStock)));
  if (typeof d.sales === "number") grid.appendChild(sxItem("Ventes", rbxNum(d.sales)));
  if (pts.length) {
    const vals = pts.map((x) => x.v);
    grid.appendChild(sxItem("Plus bas / plus haut", `${rbxNum(Math.min(...vals))} / ${rbxNum(Math.max(...vals))}`));
  }
  el.appendChild(grid);
  if (pts.length >= 2) {
    el.appendChild(rbx9Spark(pts));
    const range = sxEl("div", "rx9-spark-dates");
    range.appendChild(sxEl("span", "", new Date(pts[0].t).toLocaleDateString("fr-FR")));
    range.appendChild(sxEl("span", "", new Date(pts[pts.length - 1].t).toLocaleDateString("fr-FR")));
    el.appendChild(range);
  } else {
    el.appendChild(sxEl("p", "sx-note", "Pas assez de ventes récentes pour tracer une courbe."));
  }
  rbx9Place(el, mount);
}

function rbx9Css(s) {
  if (!s.blurName) return "";
  let css = `${RBX_P3} #rx-mutual .rx9-mname { filter: blur(7px) !important; transition: filter 0.15s; }`;
  if (s.blurReveal !== false) css += `${RBX_P3} #rx-mutual .rx9-mf:hover .rx9-mname { filter: none !important; }`;
  return css;
}

const rbx9CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx9CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx9Css(s);
};

function rbx9Tick() {
  if (!document.body) return;
  [rbx9Migrate, rbx9MutualRender, rbx9PriceRender].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
}

rbxEvery(rbx9Tick, 1000);
rbxOnChange(rbxMakeThrottle(rbx9Tick, 800));
rbxOnChange(rbxSocStyleRefresh);
