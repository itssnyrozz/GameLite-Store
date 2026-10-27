// Page de profil : ID à côté du @pseudo (un clic le copie), date de création dans la ligne Amis / Abonnés,
// et jeux préférés du joueur entre « Tenue actuelle » et « Jeux ». Les jeux préférés peuvent être publics :
// le serveur (worker/, route /favs) ne garde que leurs numéros, noms et icônes viennent de Roblox.

Object.assign(RBX_DEFAULTS, { favPublic: true });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});

const RBXPF_MAX = 10;
const RBXPF_STAT = /^\d[\d\s.,]*\s*[kKM+]?\s+(amis|friends|connexions|connections|abonnés|abonnes|followers|à suivre|abonnements|following)$/i;
const RBXPF_WEAR = /^(tenue actuelle|currently wearing)$/i;
const RBXPF_GAMES = /^(jeux|games|expériences|experiences|créations|creations)$/i;
const rbxPf = { favs: new Map(), pending: new Set(), names: new Map(), pubSig: null, pubTimer: 0 };

// ---------- Réglage : jeux préférés publics (Premium > Profil+) ----------

const rbxPfTabPrev = rbxTabSocial;
rbxTabSocial = function () {
  const h = rbxPfTabPrev();
  const mark = '<div class="rx-col" data-soc-premium><span class="rx-label">Mes jeux préférés</span>';
  const field = rbxFieldHtml({ key: "favPublic", type: "checkbox", label: "Rendre mes jeux préférés publics (sur mon profil, pour tous ceux qui ont l'extension)" });
  return h.replace(mark, field + `<p class="rx-hint">Il faut avoir vérifié ton compte, comme pour la bannière publique plus bas.</p>` + mark);
};

// ---------- Publication ----------

function rbxPfMine() {
  const s = rbxState;
  if (!s.enabled || !s.socFavGames || !s.favPublic) return [];
  return rbxFavList()
    .map((g) => ({ p: Number(g.p), u: Number(g.u) }))
    .filter((g) => g.p > 0 && g.u > 0)
    .slice(0, RBXPF_MAX);
}

async function rbxPfPublish() {
  const t = await rbxBvToken();
  if (!t) return;
  const list = rbxPfMine();
  const sig = JSON.stringify(list);
  if (sig === rbxPf.pubSig) return;
  const r = list.length ? await rbxBvApi("PUT", "/favs/" + t.uid, { list }, { token: t.token }) : await rbxBvApi("DELETE", "/favs/" + t.uid, undefined, { token: t.token });
  if (r.ok) {
    rbxPf.pubSig = sig;
    rbxPf.favs.delete(String(t.uid));
  }
}

rbxOnChange(() => {
  clearTimeout(rbxPf.pubTimer);
  rbxPf.pubTimer = setTimeout(() => rbxPfPublish().catch(() => {}), 3000);
});

// Jeux publics d'un autre joueur : gardés 10 minutes, null tant qu'ils ne sont pas arrivés.
function rbxPfFavsOf(uid) {
  const k = String(uid);
  const hit = rbxPf.favs.get(k);
  if ((!hit || Date.now() - hit.at > 600000) && !rbxPf.pending.has(k)) {
    rbxPf.pending.add(k);
    rbxBvApi("GET", "/favs/" + k).then((r) => {
      rbxPf.pending.delete(k);
      const list = r.ok && r.data && Array.isArray(r.data.list) ? r.data.list : [];
      rbxPf.favs.set(k, { at: Date.now(), list: list.map((g) => ({ p: Number(g.p), u: Number(g.u) })).filter((g) => g.p > 0 && g.u > 0).slice(0, RBXPF_MAX) });
      rbxDomGen++;
    });
  }
  return hit ? hit.list : null;
}

// Noms des jeux (ceux des autres joueurs ne passent jamais par le serveur de l'extension).
async function rbxPfNames(us) {
  const need = us.filter((u) => !rbxPf.names.has(u));
  if (!need.length) return;
  need.forEach((u) => rbxPf.names.set(u, ""));
  const r = await rbxFetchJson(`https://games.roblox.com/v1/games?universeIds=${need.join(",")}`);
  ((r && r.data) || []).forEach((g) => rbxPf.names.set(Number(g.id), String(g.name || "")));
  rbxDomGen++;
}

// ---------- Profil ----------

function rbxPfLeafText(el) {
  return el.children.length <= 2 ? (el.textContent || "").replace(/\s+/g, " ").trim() : "";
}

function rbxPfSkip(el) {
  return el.closest("#rx-panel, #rx-overlay, #rx-bar, #rx-soc, #rx-dock, nav, #header, .rx-pf-favs");
}

// ID après le @pseudo de l'en-tête ; un clic le copie.
function rbxPfHandle(info) {
  const want = "@" + info.user.name;
  let el = document.querySelector(".rx-pf-id");
  const host = el && el.previousElementSibling;
  if (host && rbxPfLeafText(host) === want) return;
  if (el) el.remove();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (n.nodeValue.trim() !== want) continue;
    const p = n.parentElement;
    if (!p || rbxPfSkip(p)) continue;
    el = sxEl("span", "rx-pf-id", "ID " + info.user.id);
    el.title = "Cliquer pour copier l'ID";
    el.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      rbxCopyText(String(info.user.id), "ID copié");
    });
    p.insertAdjacentElement("afterend", el);
    return;
  }
}

// « Créé le … » à la suite de « 47 Amis · 69 Abonnés · 1 À suivre », avec le même style.
function rbxPfCreated(info) {
  let pill = document.querySelector(".rx-pf-created");
  // Déjà en place dans la ligne des statistiques : rien à chercher.
  if (pill && pill.parentElement && Array.from(pill.parentElement.children).filter((c) => RBXPF_STAT.test(rbxPfLeafText(c))).length > 1) return;
  const stats = Array.from(document.body.querySelectorAll("a, button, span, div, li")).filter((x) => RBXPF_STAT.test(rbxPfLeafText(x)) && !rbxPfSkip(x));
  // Le plus haut élément de chaque chiffre dont le parent regroupe plusieurs chiffres : la ligne des statistiques.
  let last = null;
  for (const x of stats) {
    let el = x;
    while (el.parentElement && stats.filter((y) => el.parentElement.contains(y)).length === 1) el = el.parentElement;
    if (el.parentElement && stats.filter((y) => el.parentElement.contains(y)).length > 1) last = el;
  }
  if (!last) {
    if (pill) pill.remove();
    return;
  }
  const text = "Créé le " + new Date(info.user.created).toLocaleDateString("fr-FR");
  if (pill && pill.parentElement === last.parentElement && pill.textContent === text) return;
  if (pill) pill.remove();
  pill = document.createElement("span");
  pill.className = (last.className && typeof last.className === "string" ? last.className + " " : "") + "rx-pf-created";
  pill.textContent = text;
  pill.title = `Compte créé le ${rbxAge(info.user.created)}`;
  last.parentElement.appendChild(pill);
}

function rbxPfHeading(re) {
  return Array.from(document.querySelectorAll("h2, h3")).find((h) => !rbxPfSkip(h) && re.test(h.textContent.replace(/\s+/g, " ").trim())) || null;
}

// Bloc à placer entre « Tenue actuelle » et « Jeux » : juste avant la section des jeux, sinon après la tenue.
function rbxPfSpot() {
  const wear = rbxPfHeading(RBXPF_WEAR);
  const games = rbxPfHeading(RBXPF_GAMES);
  if (wear && games) {
    let lca = wear.parentElement;
    while (lca && !lca.contains(games)) lca = lca.parentElement;
    if (!lca) return null;
    let sec = games;
    while (sec.parentElement !== lca) sec = sec.parentElement;
    return { ref: sec, where: "beforebegin", head: wear };
  }
  const one = wear || games;
  if (!one) return null;
  let sec = one;
  while (sec.parentElement && sec.parentElement.querySelectorAll("h2, h3").length === 1 && sec.parentElement !== document.body) sec = sec.parentElement;
  return { ref: sec, where: wear ? "afterend" : "beforebegin", head: one };
}

function rbxPfFavs(uid, mine) {
  let box = document.querySelector(".rx-pf-favs");
  const list = mine ? (rbxState.socFavGames ? rbxFavList().map((g) => ({ p: Number(g.p), u: Number(g.u), t: g.t })).slice(0, RBXPF_MAX) : []) : rbxPfFavsOf(uid) || [];
  const spot = list.length ? rbxPfSpot() : null;
  if (!spot) {
    if (box) box.remove();
    return;
  }
  const sig = uid + "|" + list.map((g) => g.p + ":" + (g.t || rbxPf.names.get(g.u) || "")).join(",") + "|" + rbxState.favPublic;
  const inPlace = box && (spot.where === "beforebegin" ? spot.ref.previousElementSibling === box : spot.ref.nextElementSibling === box);
  if (box && inPlace && box.dataset.sig === sig) return;
  if (box) box.remove();
  box = sxEl("div", "rx-pf-favs");
  box.dataset.sig = sig;
  const h = document.createElement(spot.head.tagName);
  h.className = spot.head.className;
  h.textContent = mine ? "Mes jeux préférés" : "Jeux préférés";
  box.appendChild(h);
  if (mine) box.appendChild(sxEl("p", "rx-pf-note", rbxState.favPublic ? "Visibles par tous ceux qui ont l'extension (si ton compte est vérifié)." : "Visibles uniquement par toi."));
  const grid = sxEl("div", "rx-pf-grid");
  const imgs = [];
  list.forEach((g) => {
    const a = sxEl("a", "rx-pf-game");
    a.href = `/games/${encodeURIComponent(g.p)}`;
    const img = sxImg("", "");
    imgs.push({ img, u: g.u });
    a.appendChild(img);
    a.appendChild(sxEl("span", "", g.t || rbxPf.names.get(g.u) || "Jeu " + g.p));
    grid.appendChild(a);
  });
  box.appendChild(grid);
  spot.ref.insertAdjacentElement(spot.where, box);
  if (!mine) rbxPfNames(list.map((g) => g.u)).catch(() => {});
  rbxThumbBatch(RBX_ICON_URL, imgs.map((x) => x.u), rbxIconCache, 100).then(() => {
    imgs.forEach((x) => {
      const u = rbxSafeImg(rbxIconCache.get(x.u));
      if (u) x.img.src = u;
    });
  });
}

async function rbxPfTick() {
  const page = rbxPageInfo(location.pathname);
  if (!rbxState.enabled || !page || page.k !== "user") {
    document.querySelectorAll(".rx-pf-id, .rx-pf-created, .rx-pf-favs").forEach((n) => n.remove());
    return;
  }
  if (!document.body || !rbxDomChanged("profile")) return;
  const info = await rbxUserInfo(page.id);
  if (!info || !info.user || rbxPageInfo(location.pathname)?.id !== page.id) return;
  const me = rbxMyIdNow();
  [() => rbxPfHandle(info), () => rbxPfCreated(info), () => rbxPfFavs(page.id, me && String(me) === page.id)].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
}

rbxEvery(() => rbxPfTick().catch(() => {}), 1000);
rbxOnChange(() => {
  rbxDomGen++;
});
