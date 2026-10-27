// Onglet Limited : tous les limiteds de Roblox avec leur RAP (liste publique de Rolimons),
// tes limiteds avec leur valeur totale, et des alertes de prix.

Object.assign(RBX_DEFAULTS, { limWatch: [], limNotify: true, limAt: 0 });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});

RBX_TABS.push({ id: "limited", label: "Limited", fields: [] });
RBX6_ICONS.limited = '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 6 3-6"/>';
RBX9_DESC.limited = "Tous les limiteds de Roblox avec leur RAP, tes limiteds et des alertes de prix.";

const RBXLIM_DEMAND = ["Terrible", "Faible", "Normale", "Haute", "Incroyable"];
const RBXLIM_TTL = 10 * 60 * 1000;
const RBXLIM_WATCH_MAX = 20;
const RBXLIM_WATCH_EVERY = 5 * 60 * 1000;
const RBXLIM_PAGE = 60;
const rbxLim = { items: null, byId: new Map(), at: 0, busy: null, q: "", sort: "rap", shown: RBXLIM_PAGE, mine: null, mineBusy: false, watchBusy: false, thumbs: new Map() };

const rbxLimQ = (s) => document.querySelector(`#rx-panel ${s}`);

// ---------- Données ----------

// [nom, sigle, RAP, valeur, valeur par défaut, demande, tendance, projeté, hypé, rare] ; -1 = pas de donnée.
function rbxLimLoad(force) {
  if (rbxLim.items && !force && Date.now() - rbxLim.at < RBXLIM_TTL) return Promise.resolve(rbxLim.items);
  if (rbxLim.busy) return rbxLim.busy;
  rbxLim.busy = new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "rolimonsItems" }, (r) => {
      rbxLim.busy = null;
      if (chrome.runtime.lastError || !r || !r.ok) return resolve(rbxLim.items);
      rbxLim.items = Object.entries(r.items).map(([id, v]) => ({
        id: Number(id),
        name: String(v[0] || "Objet " + id),
        acr: String(v[1] || ""),
        rap: Number(v[2]) > 0 ? Number(v[2]) : 0,
        value: Number(v[3]) > 0 ? Number(v[3]) : null,
        demand: Number(v[5]),
        projected: v[7] === 1,
        rare: v[9] === 1
      }));
      rbxLim.byId = new Map(rbxLim.items.map((it) => [it.id, it]));
      rbxLim.at = Date.now();
      resolve(rbxLim.items);
    });
  });
  return rbxLim.busy;
}

// Miniatures des objets affichés, en une requête pour ceux qui manquent.
async function rbxLimThumbs(ids) {
  const need = ids.filter((id) => !rbxLim.thumbs.has(id)).slice(0, 100);
  if (!need.length) return;
  need.forEach((id) => rbxLim.thumbs.set(id, ""));
  const r = await rbxFetchJson(`https://thumbnails.roblox.com/v1/assets?assetIds=${need.join(",")}&size=110x110&format=Png&isCircular=false`);
  ((r && r.data) || []).forEach((t) => {
    if (!t.imageUrl) return;
    rbxLim.thumbs.set(Number(t.targetId), t.imageUrl);
    document.querySelectorAll(`#rx-panel img[data-lim-thumb="${Number(t.targetId)}"]`).forEach((img) => {
      img.src = t.imageUrl;
    });
  });
}

function rbxLimRobux(n) {
  return n ? `${rbxNum(n)} R$` : "—";
}

// ---------- Rendu ----------

function rbxLimRow(it, extra) {
  const row = sxEl("div", "rx-li rxlim-row");
  const img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  img.dataset.limThumb = it.id;
  if (rbxLim.thumbs.get(it.id)) img.src = rbxLim.thumbs.get(it.id);
  row.appendChild(img);
  const txt = sxEl("div", "rxlim-txt");
  const name = sxEl("a", "rx-li-name", it.name);
  name.href = `https://www.roblox.com/catalog/${it.id}`;
  txt.appendChild(name);
  const tags = sxEl("div", "rxlim-tags");
  const tag = (t, cls) => tags.appendChild(sxEl("span", "rx-tag" + (cls ? " " + cls : ""), t));
  if (it.acr) tag(it.acr, "rxlim-acr");
  tag("RAP " + rbxLimRobux(it.rap));
  if (it.value) tag("Valeur " + rbxLimRobux(it.value), "rxlim-val");
  if (it.demand >= 0) tag("Demande " + RBXLIM_DEMAND[it.demand]);
  if (it.rare) tag("Rare", "rxlim-rare");
  if (it.projected) tag("Projeté", "rxlim-warn");
  (extra || []).forEach((x) => tag(x));
  txt.appendChild(tags);
  row.appendChild(txt);
  return row;
}

function rbxLimWatchBtn(it) {
  const on = rbxLimWatchList().some((w) => w.id === it.id);
  const b = sxBtn(on ? "Alerte activée" : "Créer une alerte", "rx-sec" + (on ? " rx-active" : ""));
  b.dataset.limWatch = it.id;
  return b;
}

function rbxLimRenderAll() {
  const box = rbxLimQ('[data-lim-list="all"]');
  const sum = rbxLimQ('[data-lim-out="sum"]');
  if (!box) return;
  if (!rbxLim.items) {
    box.replaceChildren(sxEl("p", "rx-empty", rbxLim.busy ? "Chargement des limiteds…" : "La liste n'a pas pu être chargée. Réessaie avec Actualiser."));
    return;
  }
  const q = rbxLim.q.trim().toLowerCase();
  let list = q ? rbxLim.items.filter((it) => it.name.toLowerCase().indexOf(q) !== -1 || it.acr.toLowerCase() === q) : rbxLim.items.slice();
  const by = {
    rap: (a, b) => b.rap - a.rap,
    value: (a, b) => (b.value || b.rap) - (a.value || a.rap),
    demand: (a, b) => b.demand - a.demand || b.rap - a.rap,
    name: (a, b) => a.name.localeCompare(b.name, "fr")
  };
  list.sort(by[rbxLim.sort] || by.rap);
  const total = list.length;
  list = list.slice(0, rbxLim.shown);
  if (sum) sum.textContent = `${rbxNum(total)} limited${total > 1 ? "s" : ""}${q ? " trouvé" + (total > 1 ? "s" : "") : ""} · mis à jour à ${new Date(rbxLim.at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`;
  if (!total) {
    box.replaceChildren(sxEl("p", "rx-empty", "Aucun limited ne correspond."));
  } else {
    box.replaceChildren(
      ...list.map((it) => {
        const row = rbxLimRow(it);
        row.appendChild(rbxLimWatchBtn(it));
        return row;
      })
    );
  }
  const more = rbxLimQ('[data-lim-act="more"]');
  if (more) more.hidden = total <= rbxLim.shown;
  rbxLimThumbs(list.map((it) => it.id)).catch(() => {});
}

// Inventaire : limiteds classiques de l'utilisateur, avec le RAP donné par Roblox (inventaire visible requis).
async function rbxLimLoadMine() {
  const me = rbxMyIdNow();
  if (!me || rbxLim.mineBusy) return;
  rbxLim.mineBusy = true;
  const out = [];
  try {
    let cursor = "";
    for (let page = 0; page < 10; page++) {
      const r = await rbxFetchJson(`https://inventory.roblox.com/v1/users/${me}/assets/collectibles?limit=100&sortOrder=Desc${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`);
      if (!r || !Array.isArray(r.data)) {
        if (!page) rbxLim.mine = null;
        return;
      }
      out.push(...r.data);
      cursor = r.nextPageCursor;
      if (!cursor) break;
    }
    rbxLim.mine = out;
  } finally {
    rbxLim.mineBusy = false;
  }
}

function rbxLimRenderMine() {
  const box = rbxLimQ('[data-lim-list="mine"]');
  const tot = rbxLimQ('[data-lim-out="mine"]');
  if (!box) return;
  if (!rbxMyIdNow()) return box.replaceChildren(sxEl("p", "rx-empty", "Connecte-toi à Roblox pour voir tes limiteds."));
  if (rbxLim.mineBusy) return box.replaceChildren(sxEl("p", "rx-empty", "Chargement de ton inventaire…"));
  if (!rbxLim.mine) return box.replaceChildren(sxEl("p", "rx-empty", "Inventaire illisible : il doit être visible (Paramètres Roblox → Confidentialité)."));
  let rap = 0;
  let value = 0;
  const rows = rbxLim.mine.map((a) => {
    const info = rbxLim.byId.get(Number(a.assetId));
    const it = { id: Number(a.assetId), name: a.name || (info && info.name) || "Objet " + a.assetId, acr: info ? info.acr : "", rap: Number(a.recentAveragePrice) || (info ? info.rap : 0), value: info ? info.value : null, demand: info ? info.demand : -1, rare: !!(info && info.rare), projected: !!(info && info.projected) };
    rap += it.rap;
    value += it.value || it.rap;
    return rbxLimRow(it, a.serialNumber ? ["#" + rbxNum(a.serialNumber)] : []);
  });
  if (tot) {
    tot.replaceChildren(
      sxEl("div", "", `${rbxNum(rbxLim.mine.length)} limited${rbxLim.mine.length > 1 ? "s" : ""}`),
      sxEl("strong", "", "RAP total " + rbxLimRobux(rap)),
      sxEl("div", "", "Valeur estimée " + rbxLimRobux(value))
    );
  }
  box.replaceChildren(...(rows.length ? rows : [sxEl("p", "rx-empty", "Tu n'as aucun limited pour le moment.")]));
  rbxLimThumbs(rbxLim.mine.map((a) => Number(a.assetId))).catch(() => {});
}

// ---------- Alertes ----------

function rbxLimWatchList() {
  return Array.isArray(rbxState.limWatch) ? rbxState.limWatch : [];
}

function rbxLimWatchToggle(id) {
  const list = rbxLimWatchList();
  if (list.some((w) => w.id === id)) {
    rbxSet({ limWatch: list.filter((w) => w.id !== id) });
    rbxToast("Alerte retirée");
  } else {
    if (list.length >= RBXLIM_WATCH_MAX) return rbxToast(`${RBXLIM_WATCH_MAX} alertes maximum`);
    const it = rbxLim.byId.get(id);
    rbxSet({ limWatch: [...list, { id, n: it ? it.name : "Objet " + id, rap: it ? it.rap : 0, best: null, target: null }] });
    rbxToast("Alerte créée : règle ton prix cible dans le sous-onglet Alertes");
  }
  rbxLimRenderAll();
  rbxLimRenderWatch();
}

function rbxLimRenderWatch() {
  const box = rbxLimQ('[data-lim-list="watch"]');
  if (!box) return;
  const list = rbxLimWatchList();
  if (!list.length) return box.replaceChildren(sxEl("p", "rx-empty", "Aucune alerte. Clique sur « Créer une alerte » à côté d'un limited."));
  box.replaceChildren(
    ...list.map((w) => {
      const info = rbxLim.byId.get(w.id);
      const row = rbxLimRow({ id: w.id, name: w.n, acr: info ? info.acr : "", rap: w.rap, value: info ? info.value : null, demand: -1 }, ["Meilleur prix " + rbxLimRobux(w.best)]);
      const target = document.createElement("input");
      target.type = "number";
      target.min = "1";
      target.placeholder = "Prix cible";
      target.title = "Prévenir quand le meilleur prix passe sous ce montant";
      target.value = w.target || "";
      target.dataset.limTarget = w.id;
      row.appendChild(target);
      const del = sxBtn("Retirer", "rx-sec rx-danger");
      del.dataset.limWatch = w.id;
      row.appendChild(del);
      return row;
    })
  );
  rbxLimThumbs(list.map((w) => w.id)).catch(() => {});
}

// Meilleur prix en revente (limiteds classiques) ; null si l'objet n'est pas vendu ou pas revendable.
async function rbxLimBest(id) {
  const r = await rbxFetchJson(`https://economy.roblox.com/v1/assets/${id}/resellers?limit=10`);
  const prices = ((r && r.data) || []).map((x) => Number(x.price)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : null;
}

// Toutes les 5 minutes (partagé entre les onglets Roblox ouverts) : RAP et meilleur prix de chaque alerte.
async function rbxLimWatchCheck(manual) {
  const list = rbxLimWatchList();
  if (!list.length || rbxLim.watchBusy) return;
  if (!manual && (!rbxState.enabled || !rbxState.limNotify || document.hidden || Date.now() - (Number(rbxSaved.limAt) || 0) < RBXLIM_WATCH_EVERY)) return;
  rbxLim.watchBusy = true;
  rbxSet({ limAt: Date.now() });
  const upd = new Map();
  try {
    for (const w of list) {
      const rd = await rbxFetchJson(`https://economy.roblox.com/v1/assets/${w.id}/resale-data`);
      const rap = rd && Number(rd.recentAveragePrice) > 0 ? Number(rd.recentAveragePrice) : w.rap;
      const best = await rbxLimBest(w.id);
      const link = `https://www.roblox.com/catalog/${w.id}`;
      if (w.target && best && best <= w.target && best !== w.best) rbx6Notify("Prix cible atteint", `${w.n} : ${rbxLimRobux(best)} (cible ${rbxLimRobux(w.target)})`, link);
      if (w.rap && rap && rap !== w.rap) {
        const pct = Math.round(((rap - w.rap) / w.rap) * 100);
        if (pct) rbx6Notify(rap > w.rap ? "RAP en hausse" : "RAP en baisse", `${w.n} : ${rbxLimRobux(rap)} (${pct > 0 ? "+" : ""}${pct} %)`, link);
      }
      upd.set(w.id, { rap, best });
      await rbxSleep(350);
    }
  } finally {
    rbxLim.watchBusy = false;
  }
  rbxSet({ limWatch: rbxLimWatchList().map((w) => (upd.has(w.id) ? { ...w, ...upd.get(w.id) } : w)) });
  rbxLimRenderWatch();
  if (manual) rbxToast("Alertes vérifiées");
}

rbxEvery(() => rbxLimWatchCheck(false).catch(() => {}), 60000);

// ---------- Panneau ----------

function rbxLimHtml() {
  return `<nav class="sx-subtabs"><button type="button" class="sx-subtab sx-active" data-soc-sub="limAll">Tous les limiteds</button><button type="button" class="sx-subtab" data-soc-sub="limMine">Mes limiteds</button><button type="button" class="sx-subtab" data-soc-sub="limWatch">Alertes</button></nav>
<div class="sx-sub sx-active" data-soc-pane="limAll">
<div class="rx11-bar"><div class="rx11-search"><input type="search" placeholder="Chercher un limited (nom ou sigle)…" data-lim-in="q" autocomplete="off"></div>
<select data-lim-in="sort"><option value="rap">Trier par RAP</option><option value="value">Trier par valeur</option><option value="demand">Trier par demande</option><option value="name">Trier par nom</option></select>
<button type="button" class="rx-sec" data-lim-act="refresh">Actualiser</button></div>
<p class="rx-hint" data-lim-out="sum"></p>
<div class="rx-list" data-lim-list="all"></div>
<div class="rx-actions"><button type="button" class="rx-sec" data-lim-act="more" hidden>Afficher plus</button></div>
<p class="rx-hint">RAP : prix moyen des dernières ventes, donné par Roblox. Valeur et demande : estimations de Rolimons.</p>
</div>
<div class="sx-sub" data-soc-pane="limMine">
<p class="rx-hint">Les limiteds de ton inventaire avec leur RAP. Ton inventaire doit être visible dans tes paramètres Roblox.</p>
<div class="rxlim-total" data-lim-out="mine"></div>
<div class="rx-actions"><button type="button" class="rx-sec" data-lim-act="mine">Actualiser mon inventaire</button></div>
<div class="rx-list rx-spaced" data-lim-list="mine"></div>
</div>
<div class="sx-sub" data-soc-pane="limWatch">
<div class="rx-group">${rbxFieldHtml({ key: "limNotify", type: "checkbox", label: "Me prévenir (vérifié toutes les 5 minutes quand Roblox est ouvert)" })}</div>
<p class="rx-hint">Tu es prévenu quand le RAP d'un limited change, et quand son meilleur prix passe sous ton prix cible.</p>
<div class="rx-actions"><button type="button" class="rx-sec" data-lim-act="check">Vérifier maintenant</button></div>
<div class="rx-list rx-spaced" data-lim-list="watch"></div>
</div>`;
}

const rbxLimBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  return tab.id === "limited" ? rbxLimHtml() : rbxLimBodyPrev(tab);
};

function rbxLimOpen(pane) {
  if (pane === "limMine") {
    if (!rbxLim.mine && !rbxLim.mineBusy) rbxLimLoadMine().then(rbxLimRenderMine);
    // Valeurs Rolimons pour compléter le RAP de Roblox.
    rbxLimLoad(false).then(rbxLimRenderMine);
    return rbxLimRenderMine();
  }
  if (pane === "limWatch") return rbxLimRenderWatch();
  rbxLimRenderAll();
  rbxLimLoad(false).then(rbxLimRenderAll);
}

const rbxLimShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxLimShowTabPrev(id);
  if (id === "limited") {
    const p = rbxLimQ('.rx-section[data-section="limited"] .sx-sub.sx-active');
    rbxLimOpen(p ? p.dataset.socPane : "limAll");
  }
  return r;
};

const rbxLimShowSubPrev = rbxSocShowSub;
rbxSocShowSub = function (btn) {
  rbxLimShowSubPrev(btn);
  if (/^lim/.test(btn.dataset.socSub || "")) rbxLimOpen(btn.dataset.socSub);
};

document.addEventListener("click", (e) => {
  const t = e.target && e.target.closest ? e.target.closest("#rx-panel [data-lim-act], #rx-panel [data-lim-watch]") : null;
  if (!t) return;
  if (t.dataset.limWatch) return rbxLimWatchToggle(Number(t.dataset.limWatch));
  const act = t.dataset.limAct;
  if (act === "more") {
    rbxLim.shown += RBXLIM_PAGE;
    rbxLimRenderAll();
  } else if (act === "refresh") {
    const p = rbxLimLoad(true);
    rbxLimRenderAll();
    p.then(rbxLimRenderAll);
  } else if (act === "mine") {
    rbxLim.mine = null;
    const p = rbxLimLoadMine();
    rbxLimRenderMine();
    p.then(rbxLimRenderMine);
  } else if (act === "check") {
    if (!rbxLimWatchList().length) return rbxToast("Aucune alerte pour le moment");
    rbxToast("Vérification des alertes…");
    rbxLimWatchCheck(true).catch(() => {});
  }
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('#rx-panel [data-lim-in="q"]')) return;
  rbxLim.q = t.value;
  rbxLim.shown = RBXLIM_PAGE;
  rbxLimRenderAll();
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (!t || !t.matches) return;
  if (t.matches('#rx-panel [data-lim-in="sort"]')) {
    rbxLim.sort = t.value;
    rbxLim.shown = RBXLIM_PAGE;
    rbxLimRenderAll();
  } else if (t.matches("#rx-panel [data-lim-target]")) {
    const id = Number(t.dataset.limTarget);
    const v = Math.max(0, Math.round(Number(t.value) || 0));
    rbxSet({ limWatch: rbxLimWatchList().map((w) => (w.id === id ? { ...w, target: v || null } : w)) });
  }
});
