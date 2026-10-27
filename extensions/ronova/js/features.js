const rbxCache = new Map();
const rbxLoadedAt = Date.now();

const RBX_SIG_KEYS = [
  "enabled", "showCopyButtons", "showProfileInfo", "infoUsername", "infoId", "infoAge",
  "infoFriends", "infoFollowers", "infoFollowing", "infoStatus", "infoGroups", "infoInventory",
  "showUsernameHistory", "showGameStats", "showGameExtra", "showServerBrowser", "rememberServers",
  "showItemInfo", "showItemExtra", "showGroupInfo", "showRobuxConvert", "robuxRate", "currency"
];

const RBX_NAV_KEYS = { h: "/home", g: "/discover", c: "/catalog", a: "/my/avatar" };

const RBX_NAME_LINK_SKIP = "#rx-panel, #rx-bar, #rx-toast, #rx-dock, #navigation, #header, .rbx-header, .navbar-fixed-top";

let rbxNamesAt = 0;
let rbxNameCache = { key: "", list: [] };

function rbxFetchJson(url) {
  return rbxBgFetch(url);
}

async function rbxUserInfo(id) {
  if (rbxCache.has(id)) return rbxCache.get(id);
  const [u, fr, fo, fg, hist, gr, inv] = await Promise.all([
    rbxFetchJson(`https://users.roblox.com/v1/users/${id}`),
    rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/friends/count`),
    rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/followers/count`),
    rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/followings/count`),
    rbxFetchJson(`https://users.roblox.com/v1/users/${id}/username-history?limit=10&sortOrder=Desc`),
    rbxFetchJson(`https://groups.roblox.com/v2/users/${id}/groups/roles`),
    rbxFetchJson(`https://inventory.roblox.com/v1/users/${id}/can-view-inventory`)
  ]);
  const info = {
    user: u,
    friends: fr ? fr.count : null,
    followers: fo ? fo.count : null,
    following: fg ? fg.count : null,
    history: hist && Array.isArray(hist.data) ? hist.data.map((h) => h.name) : [],
    groups: gr && Array.isArray(gr.data) ? gr.data.length : null,
    inv: inv && typeof inv.canView === "boolean" ? inv.canView : null
  };
  if (u) rbxCache.set(id, info);
  return info;
}

async function rbxUniverse(placeId) {
  const key = "u" + placeId;
  if (rbxCache.has(key)) return rbxCache.get(key);
  const d = await rbxFetchJson(`https://apis.roblox.com/universes/v1/places/${placeId}/universe`);
  const id = d && d.universeId ? d.universeId : null;
  if (id) rbxCache.set(key, id);
  return id;
}

async function rbxGameStats(universeId) {
  const key = "g" + universeId;
  if (rbxCache.has(key)) return rbxCache.get(key);
  const [g, v] = await Promise.all([
    rbxFetchJson(`https://games.roblox.com/v1/games?universeIds=${universeId}`),
    rbxFetchJson(`https://games.roblox.com/v1/games/votes?universeIds=${universeId}`)
  ]);
  const game = g && g.data && g.data[0] ? g.data[0] : null;
  const votes = v && v.data && v.data[0] ? v.data[0] : null;
  const stats = { game, votes };
  if (game) rbxCache.set(key, stats);
  return stats;
}

async function rbxItemInfo(id) {
  const key = "i" + id;
  if (rbxCache.has(key)) return rbxCache.get(key);
  const d = await rbxFetchJson(`https://economy.roblox.com/v2/assets/${id}/details`);
  if (d && d.Name) rbxCache.set(key, d);
  return d;
}

async function rbxGroupInfo(id) {
  const key = "r" + id;
  if (rbxCache.has(key)) return rbxCache.get(key);
  const g = await rbxFetchJson(`https://groups.roblox.com/v1/groups/${id}`);
  if (g && g.name) rbxCache.set(key, g);
  return g;
}

async function rbxFetchServers(placeId, order, pages) {
  const out = [];
  let cursor = "";
  for (let i = 0; i < pages; i++) {
    const url = `https://games.roblox.com/v1/games/${placeId}/servers/Public?limit=100&sortOrder=${order}${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`;
    const r = await rbxFetchJson(url);
    if (!r || !Array.isArray(r.data)) break;
    r.data.forEach((sv) => out.push(sv));
    cursor = r.nextPageCursor;
    if (!cursor) break;
  }
  return out;
}

function rbxCopy(text, btn) {
  rbxClip(text).then((ok) => {
    if (!ok) return;
    const old = btn.textContent;
    btn.textContent = "Copié !";
    rbxToast("Copié dans le presse-papiers");
    setTimeout(() => {
      btn.textContent = old;
    }, 1200);
  });
}

function rbxNum(n) {
  return typeof n === "number" ? n.toLocaleString("fr-FR") : "—";
}

function rbxDate(iso) {
  return iso ? new Date(iso).toLocaleDateString("fr-FR") : "—";
}

function rbxAge(iso) {
  const created = new Date(iso);
  const days = Math.floor((Date.now() - created.getTime()) / 86400000);
  const years = Math.floor(days / 365);
  const rest = days % 365;
  return `${created.toLocaleDateString("fr-FR")} (${years} an${years > 1 ? "s" : ""} et ${rest} jour${rest > 1 ? "s" : ""})`;
}

function rbxSpan(days) {
  const y = Math.floor(days / 365);
  const r = days % 365;
  const d = `${r} jour${r > 1 ? "s" : ""}`;
  return y ? `${y} an${y > 1 ? "s" : ""} et ${d}` : d;
}

function rbxDaysSince(iso) {
  return Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

function rbxMoney(robux, s) {
  const rate = Number(s.robuxRate) || 0;
  return `${(robux * rate).toFixed(2)} ${s.currency || ""}`.trim();
}

function rbxParseRobux(txt) {
  const m = String(txt || "").replace(/[\s\u00a0]/g, "").match(/^([\d.,]+)([KkMm]?)/);
  if (!m) return null;
  if (m[2]) {
    const n = parseFloat(m[1].replace(",", "."));
    if (isNaN(n)) return null;
    return n * (m[2].toLowerCase() === "m" ? 1000000 : 1000);
  }
  const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
  return isNaN(n) ? null : n;
}

function rbxItem(label, value, isName) {
  const box = document.createElement("div");
  box.className = "rx-item";
  const small = document.createElement("small");
  small.textContent = label;
  const strong = document.createElement("strong");
  strong.textContent = value;
  if (isName) strong.className = "rx-name-val";
  box.appendChild(small);
  box.appendChild(strong);
  return box;
}

function rbxCardEl(text) {
  const c = document.createElement("div");
  c.className = "rx-card";
  c.textContent = text;
  return c;
}

function rbxMountPoint() {
  return document.querySelector("#content .content") || document.querySelector("#content") || document.querySelector("main");
}

function rbxPageInfo(path) {
  let m = path.match(/\/users\/(\d+)/);
  if (m) return { k: "user", id: m[1], u: `/users/${m[1]}/profile` };
  m = path.match(/\/games\/(\d+)/);
  if (m) return { k: "game", id: m[1], u: `/games/${m[1]}` };
  m = path.match(/\/(?:catalog|library)\/(\d+)/);
  if (m) return { k: "item", id: m[1], u: `/catalog/${m[1]}` };
  m = path.match(/\/(?:groups|communities)\/(\d+)/);
  if (m) return { k: "group", id: m[1], u: `/groups/${m[1]}` };
  return null;
}

// Vignette de jeu autour d'un lien de jeu (liste ou carrousel), celle que les jeux masqués savent cacher :
// un seul jeu dedans. Renvoie la zone où placer les boutons au survol (Rejoindre, Masquer) : la miniature
// si elle remplit la vignette, sinon la vignette entière (une bannière dont l'image n'est qu'un décor au milieu).
function rbxGameTile(a) {
  for (const card of [a.closest("li"), a.closest(".game-card-container")]) {
    if (!card) continue;
    const ids = new Set(
      Array.from(card.querySelectorAll('a[href*="/games/"]'))
        .map((x) => (/\/games\/(\d+)/.exec(x.getAttribute("href") || "") || [])[1])
        .filter(Boolean)
    );
    if (ids.size !== 1) continue;
    const img = card.querySelector("img");
    if (!img) return null;
    const r = img.getBoundingClientRect();
    if (r.width < 80 || r.height < 60) return null;
    const c = card.getBoundingClientRect();
    return { card, img, rect: r.width < c.width * 0.6 ? c : r };
  }
  return null;
}

function rbxPageTitle() {
  return document.title.replace(/\s*[-–|]\s*Roblox\s*$/i, "").trim();
}

function rbxJoinUrl(placeId, serverId) {
  return `roblox://experiences/start?placeId=${encodeURIComponent(placeId)}&gameInstanceId=${encodeURIComponent(serverId)}`;
}

function rbxInviteUrl(placeId, serverId) {
  return `https://www.roblox.com/games/start?placeId=${encodeURIComponent(placeId)}&gameInstanceId=${encodeURIComponent(serverId)}`;
}

function rbxMinPlayers() {
  return Number(rbxState.serverMinPlayers) || 0;
}

function rbxSortServers(list, mode, min) {
  const l = list.filter((s) => s.playing < s.maxPlayers && s.playing >= (min || 0));
  if (mode === "small") l.sort((a, b) => a.playing - b.playing);
  else if (mode === "full") l.sort((a, b) => b.playing - a.playing);
  else if (mode === "ping") l.sort((a, b) => (a.ping == null ? 99999 : a.ping) - (b.ping == null ? 99999 : b.ping));
  else if (mode === "fps") l.sort((a, b) => (b.fps == null ? -1 : b.fps) - (a.fps == null ? -1 : a.fps));
  else {
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = l[i];
      l[i] = l[j];
      l[j] = t;
    }
  }
  return l;
}

function rbxRememberServer(placeId, serverId) {
  if (!rbxState.rememberServers) return;
  const all = { ...(rbxState.lastServers || {}), [placeId]: { id: serverId, ts: Date.now() } };
  const keys = Object.keys(all).sort((a, b) => all[b].ts - all[a].ts);
  const out = {};
  keys.slice(0, 50).forEach((k) => {
    out[k] = all[k];
  });
  rbxSet({ lastServers: out });
}

function rbxServerRow(sv, placeId) {
  const row = document.createElement("div");
  row.className = "rx-srv";
  const info = document.createElement("span");
  const ping = sv.ping == null ? "—" : Math.round(sv.ping) + " ms";
  const fps = sv.fps == null ? "—" : Math.round(sv.fps) + " FPS";
  const fill = sv.maxPlayers ? Math.round((sv.playing / sv.maxPlayers) * 100) : 0;
  info.textContent = `${sv.playing}/${sv.maxPlayers} joueurs (${fill} %) · ping ${ping} · ${fps}`;
  const btns = document.createElement("span");
  btns.className = "rx-srvbtns";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "rx-btn";
  copy.textContent = "Copier le lien";
  copy.addEventListener("click", () => rbxCopy(rbxInviteUrl(placeId, sv.id), copy));
  const a = document.createElement("a");
  a.className = "rx-btn";
  a.textContent = "Rejoindre";
  a.href = rbxJoinUrl(placeId, sv.id);
  a.addEventListener("click", () => rbxRememberServer(placeId, sv.id));
  btns.appendChild(copy);
  btns.appendChild(a);
  row.appendChild(info);
  row.appendChild(btns);
  return row;
}

function rbxMakeBtn(label) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "rx-btn";
  b.textContent = label;
  return b;
}

// Page de jeu : une barre d'actions (rejoindre, préféré) puis la liste des serveurs.
// Les boutons pour rejoindre chargent eux-mêmes les serveurs s'il le faut.
function rbxBuildServerBrowser(placeId) {
  const s = rbxState;
  const wrap = document.createElement("div");
  wrap.className = "rx-servers";
  const actions = document.createElement("div");
  actions.className = "rx-btnrow rx-actionbar";
  const tools = document.createElement("div");
  tools.className = "rx-btnrow";

  let servers = [];
  let loading = null;
  const list = document.createElement("div");
  list.className = "rx-srvlist";
  const count = document.createElement("span");
  count.className = "rx-count";

  const select = document.createElement("select");
  select.className = "rx-select";
  [["small", "Plus petits serveurs"], ["full", "Serveurs les plus pleins"], ["ping", "Meilleur ping"], ["fps", "Meilleur FPS"], ["random", "Aléatoire"]].forEach(([v, l]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = l;
    select.appendChild(o);
  });
  const load = rbxMakeBtn("Afficher les serveurs");

  const fetchAll = () => {
    if (!loading) {
      const pages = Math.min(5, Math.max(1, Number(rbxState.serverPages) || 1));
      loading = Promise.all([rbxFetchServers(placeId, "Asc", pages), rbxFetchServers(placeId, "Desc", pages)]).then(([asc, desc]) => {
        const map = new Map();
        asc.concat(desc).forEach((sv) => map.set(sv.id, sv));
        servers = Array.from(map.values());
        loading = null;
      });
    }
    return loading;
  };

  const render = () => {
    list.textContent = "";
    const limit = Math.min(100, Math.max(5, Number(rbxState.serverShow) || 25));
    const sorted = rbxSortServers(servers, select.value, rbxMinPlayers()).slice(0, limit);
    count.textContent = `${servers.length} serveurs trouvés`;
    if (!sorted.length) {
      list.textContent = "Aucun serveur disponible.";
      return;
    }
    sorted.forEach((sv) => list.appendChild(rbxServerRow(sv, placeId)));
  };

  const joinFrom = async (mode, btn) => {
    if (!servers.length) {
      const old = btn.textContent;
      btn.textContent = "Recherche…";
      await fetchAll();
      btn.textContent = old;
    }
    const l = rbxSortServers(servers, mode, rbxMinPlayers());
    if (!l.length) return rbxToast("Aucun serveur trouvé");
    rbxRememberServer(placeId, l[0].id);
    location.href = rbxJoinUrl(placeId, l[0].id);
  };

  const join = (label, mode, cls) => {
    const b = rbxMakeBtn(label);
    if (cls) b.classList.add(cls);
    b.addEventListener("click", () => joinFrom(mode, b));
    actions.appendChild(b);
  };
  join("Rejoindre vite", "small", "rx-btn-go");
  join("Meilleur ping", "ping");
  join("Au hasard", "random");

  const last = s.rememberServers && s.lastServers ? s.lastServers[placeId] : null;
  if (last && last.id) {
    const lb = document.createElement("a");
    lb.className = "rx-btn";
    lb.textContent = "Dernier serveur";
    lb.href = rbxJoinUrl(placeId, last.id);
    actions.appendChild(lb);
  }
  const app = document.createElement("a");
  app.className = "rx-btn";
  app.textContent = "Lancer via l'app";
  app.href = `roblox://experiences/start?placeId=${encodeURIComponent(placeId)}`;
  actions.appendChild(app);

  // Jeu préféré (Premium, js/social.js) : dans la même barre.
  if (s.socFavGames && typeof rbxFavList === "function") {
    const on = rbxFavList().some((g) => String(g.p) === String(placeId));
    const fav = rbxMakeBtn(on ? "♥ Jeu préféré" : "♡ Jeu préféré");
    fav.title = on ? "Retirer des jeux préférés" : "Ajouter aux jeux préférés";
    if (on) fav.classList.add("rx-btn-on");
    fav.addEventListener("click", () => rbxToggleFav(placeId));
    actions.appendChild(fav);
  }

  load.addEventListener("click", async () => {
    load.textContent = "Chargement…";
    servers = [];
    await fetchAll();
    load.textContent = "Actualiser";
    render();
  });
  select.addEventListener("change", () => {
    if (servers.length) render();
  });
  tools.appendChild(select);
  tools.appendChild(load);
  tools.appendChild(count);

  const title = document.createElement("strong");
  title.textContent = "Serveurs";
  wrap.appendChild(actions);
  wrap.appendChild(title);
  wrap.appendChild(tools);
  wrap.appendChild(list);
  return wrap;
}

async function rbxQuickJoin() {
  const page = rbxPageInfo(location.pathname);
  if (!page || page.k !== "game") {
    rbxToast("Ouvre la page d'un jeu");
    return;
  }
  rbxToast("Recherche d'un serveur…");
  const list = await rbxFetchServers(page.id, "Asc", 1);
  const l = rbxSortServers(list, "small", rbxMinPlayers());
  if (!l.length) {
    rbxToast("Aucun serveur trouvé");
    return;
  }
  rbxRememberServer(page.id, l[0].id);
  location.href = rbxJoinUrl(page.id, l[0].id);
}

async function rbxFillGame(box, placeId, s) {
  const universeId = await rbxUniverse(placeId);
  if (!box.isConnected) return;
  box.textContent = "";
  if (!universeId) {
    box.textContent = "Impossible de charger les infos du jeu.";
    return;
  }
  if (s.showGameStats) {
    const stats = await rbxGameStats(universeId);
    if (!box.isConnected) return;
    if (stats.game) {
      const g = stats.game;
      // Une ligne de pastilles compactes : « 1 en ligne · 756 visites · … ».
      const pills = document.createElement("div");
      pills.className = "rx-pills";
      const pill = (value, label, title) => {
        const p = document.createElement("span");
        p.className = "rx-pill";
        const b = document.createElement("b");
        b.textContent = value;
        p.appendChild(b);
        p.appendChild(document.createTextNode(" " + label));
        if (title) p.title = title;
        pills.appendChild(p);
      };
      pill(rbxNum(g.playing), "en ligne");
      pill(rbxNum(g.visits), "visites");
      pill(rbxNum(g.favoritedCount), "favoris");
      if (stats.votes) {
        const total = stats.votes.upVotes + stats.votes.downVotes;
        if (total) pill(Math.round((stats.votes.upVotes / total) * 100) + " %", "j'aime", `${rbxNum(stats.votes.upVotes)} j'aime, ${rbxNum(stats.votes.downVotes)} je n'aime pas`);
      }
      pill(rbxNum(g.maxPlayers), "par serveur", "Joueurs maximum par serveur");
      const days = g.created ? rbxDaysSince(g.created) : 0;
      pill(rbxDate(g.created), "création", days ? `Jeu créé il y a ${rbxSpan(days)}` : "");
      pill(rbxDate(g.updated), "mise à jour");
      if (s.showGameExtra && days) {
        pill(rbxNum(Math.round((g.visits || 0) / days)), "visites / jour", "Moyenne depuis la création");
        if (g.visits) pill(((g.favoritedCount / g.visits) * 1000).toFixed(1), "favoris / 1 000 visites");
      }
      box.appendChild(pills);
    }
  }
  if (s.showServerBrowser) {
    box.appendChild(rbxBuildServerBrowser(placeId));
  }
}

async function rbxFillProfile(card, bar, id, s) {
  const info = await rbxUserInfo(id);
  if (!bar.isConnected) return;
  card.textContent = "";

  if (!info.user) {
    card.textContent = "Impossible de charger les infos.";
    return;
  }

  // L'ID et la date de création sont dans l'en-tête du profil (js/profile.js) : ici, seulement les anciens pseudos.
  if (!info.history.length) {
    card.remove();
    return;
  }
  const grid = document.createElement("div");
  grid.className = "rx-grid";
  grid.appendChild(rbxItem("Anciens pseudos", info.history.join(", "), true));
  card.appendChild(grid);
}

async function rbxFillItem(box, bar, id, s) {
  const d = await rbxItemInfo(id);
  if (!bar.isConnected) return;
  box.textContent = "";
  if (!d || !d.Name) {
    box.textContent = "Impossible de charger les infos de l'objet.";
    return;
  }
  const grid = document.createElement("div");
  grid.className = "rx-grid";
  grid.appendChild(rbxItem("Nom", d.Name));
  if (d.Creator && d.Creator.Name) grid.appendChild(rbxItem("Créateur", d.Creator.Name, true));
  let price = "Hors vente";
  if (d.IsForSale) {
    if (d.PriceInRobux) {
      price = `${rbxNum(d.PriceInRobux)} Robux`;
      if (s.showRobuxConvert) price += ` (≈ ${rbxMoney(d.PriceInRobux, s)})`;
    } else {
      price = "Gratuit";
    }
  }
  grid.appendChild(rbxItem("Prix", price));
  grid.appendChild(rbxItem("Création", rbxDate(d.Created)));
  grid.appendChild(rbxItem("Dernière mise à jour", rbxDate(d.Updated)));
  if (typeof d.Sales === "number" && d.Sales > 0) grid.appendChild(rbxItem("Ventes", rbxNum(d.Sales)));
  grid.appendChild(rbxItem("Limited", d.IsLimitedUnique ? "Limited U" : d.IsLimited ? "Limited" : "Non"));
  if (typeof d.Remaining === "number") grid.appendChild(rbxItem("Stock restant", rbxNum(d.Remaining)));
  if (s.showItemExtra && d.Created) {
    const days = rbxDaysSince(d.Created);
    grid.appendChild(rbxItem("Âge de l'objet", rbxSpan(days)));
    if (typeof d.Sales === "number" && d.Sales > 0) {
      grid.appendChild(rbxItem("Ventes par jour (moyenne)", (d.Sales / days).toFixed(1)));
      if (d.IsForSale && d.PriceInRobux) {
        grid.appendChild(rbxItem("Revenu brut estimé", `${rbxNum(d.Sales * d.PriceInRobux)} Robux`));
      }
    }
  }
  box.appendChild(grid);
}

async function rbxFillGroup(box, bar, id) {
  const g = await rbxGroupInfo(id);
  if (!bar.isConnected) return;
  box.textContent = "";
  if (!g || !g.name) {
    box.textContent = "Impossible de charger les infos du groupe.";
    return;
  }
  const grid = document.createElement("div");
  grid.className = "rx-grid";
  grid.appendChild(rbxItem("Nom", g.name));
  grid.appendChild(rbxItem("Membres", rbxNum(g.memberCount)));
  const owner = g.owner ? g.owner.displayName || g.owner.username || "—" : "Aucun";
  grid.appendChild(rbxItem("Propriétaire", owner, true));
  grid.appendChild(rbxItem("Accès", g.publicEntryAllowed ? "Public" : "Sur demande"));
  grid.appendChild(rbxItem("Vérifié", g.hasVerifiedBadge ? "Oui" : "Non"));
  box.appendChild(grid);
}

async function rbxRenderBar() {
  const s = rbxState;
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  const existing = document.getElementById("rx-bar");
  const fav = page && page.k === "game" && typeof rbxFavList === "function" && rbxFavList().some((g) => String(g.p) === page.id);
  const sig = location.pathname + "|" + RBX_SIG_KEYS.map((k) => s[k]).join("|") + "|" + s.socFavGames + "|" + fav;

  if (existing && existing.dataset.sig === sig && mount && mount.contains(existing)) return;
  if (existing) existing.remove();
  if (!s.enabled || !mount || !page) return;

  const wantProfile = page.k === "user" && s.showProfileInfo && s.showUsernameHistory;
  // Profils et jeux : pas de boutons Copier (ID à côté du @pseudo, onglet Développeurs pour les jeux).
  const wantCopy = s.showCopyButtons && page.k !== "user" && page.k !== "game";
  const wantGame = page.k === "game" && (s.showGameStats || s.showServerBrowser);
  const wantItem = page.k === "item" && s.showItemInfo;
  const wantGroup = page.k === "group" && s.showGroupInfo;
  if (!wantCopy && !wantProfile && !wantGame && !wantItem && !wantGroup) return;

  const id = page.id;
  const bar = document.createElement("div");
  bar.id = "rx-bar";
  bar.dataset.sig = sig;

  if (wantCopy) {
    const row = document.createElement("div");
    row.className = "rx-btnrow";
    const copyMap = {
      user: [["Copier l'ID", id], ["Copier le lien du profil", `https://www.roblox.com/users/${id}/profile`]],
      game: [["Copier l'ID de la place", id], ["Copier le lien du jeu", `https://www.roblox.com/games/${id}`]],
      item: [["Copier l'ID de l'objet", id], ["Copier le lien de l'objet", `https://www.roblox.com/catalog/${id}`]],
      group: [["Copier l'ID du groupe", id], ["Copier le lien du groupe", `https://www.roblox.com/groups/${id}`]]
    };
    copyMap[page.k].forEach(([label, value]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "rx-btn";
      b.textContent = label;
      b.addEventListener("click", () => rbxCopy(value, b));
      row.appendChild(b);
    });
    bar.appendChild(row);
  }

  const jobs = [];

  if (wantProfile) {
    const card = rbxCardEl("Chargement des infos…");
    bar.appendChild(card);
    jobs.push(() => rbxFillProfile(card, bar, id, s));
  }
  if (wantGame) {
    const box = rbxCardEl("Chargement des infos du jeu…");
    bar.appendChild(box);
    jobs.push(() => rbxFillGame(box, id, s));
  }
  if (wantItem) {
    const box = rbxCardEl("Chargement des infos de l'objet…");
    bar.appendChild(box);
    jobs.push(() => rbxFillItem(box, bar, id, s));
  }
  if (wantGroup) {
    const box = rbxCardEl("Chargement des infos du groupe…");
    bar.appendChild(box);
    jobs.push(() => rbxFillGroup(box, bar, id));
  }

  mount.insertBefore(bar, mount.firstChild);
  await Promise.all(jobs.map((j) => j()));
}

function rbxOwnNames() {
  const out = [];
  const m = document.querySelector('meta[name="user-data"]');
  if (m) {
    ["data-name", "data-displayname"].forEach((a) => {
      const v = (m.getAttribute(a) || "").trim().toLowerCase();
      if (v) out.push(v);
    });
  }
  if (typeof rbxMe !== "undefined" && rbxMe && rbxMe.name) out.push(String(rbxMe.name).toLowerCase());
  return Array.from(new Set(out));
}

function rbxNameMatchers(names) {
  const key = names.join("|");
  if (rbxNameCache.key === key) return rbxNameCache.list;
  const list = names.map((n) => ({
    n,
    re: n.length >= 3 ? new RegExp("(^|[^a-z0-9_])" + n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "($|[^a-z0-9_])") : null
  }));
  rbxNameCache = { key, list };
  return list;
}

function rbxLeafTextEls(root, out) {
  if (/^(IMG|SVG|SCRIPT|STYLE|svg)$/.test(root.tagName)) return;
  let direct = false;
  root.childNodes.forEach((n) => {
    if (n.nodeType === 3 && n.nodeValue.trim()) direct = true;
  });
  if (direct) out.push(root);
  Array.from(root.children).forEach((c) => rbxLeafTextEls(c, out));
}

// Floutage limité à toi et à tes amis : liste d'amis chargée une seule fois, gardée 30 min.
const RBX_FRIENDS_KEY = "rbxCustomizerFriendIds";
const RBX_FRIENDS_TTL = 1800000;
const rbxBlurFriends = { ids: new Set(), uid: 0, at: 0, busy: false };

async function rbxBlurFriendsLoad(me) {
  if (rbxBlurFriends.busy) return;
  rbxBlurFriends.busy = true;
  try {
    let c = (await rbxStoreGet([RBX_FRIENDS_KEY]))[RBX_FRIENDS_KEY];
    if (!c || c.uid !== me || Date.now() - c.at > RBX_FRIENDS_TTL) {
      const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${me}/friends`);
      const ids = r && Array.isArray(r.data) ? r.data.map((f) => Number(f && f.id)).filter(Boolean) : null;
      if (ids) {
        c = { uid: me, at: Date.now(), ids };
        rbxStoreSet({ [RBX_FRIENDS_KEY]: c });
      }
    }
    rbxBlurFriends.uid = me;
    // Échec réseau : nouvel essai dans 1 minute au lieu d'insister.
    rbxBlurFriends.at = c && c.uid === me ? c.at : Date.now() - RBX_FRIENDS_TTL + 60000;
    if (c && c.uid === me) {
      rbxBlurFriends.ids = new Set(c.ids);
      rbxDomGen++;
      rbxNamesAt = 0;
      rbxMarkNames();
    }
  } finally {
    rbxBlurFriends.busy = false;
  }
}

function rbxBlurTarget(id) {
  const me = typeof rbxMyIdNow === "function" ? rbxMyIdNow() : 0;
  const n = Number(id);
  if (!me) return false;
  if (n === me) return true;
  if (rbxBlurFriends.uid !== me || Date.now() - rbxBlurFriends.at > RBX_FRIENDS_TTL) rbxBlurFriendsLoad(me);
  return rbxBlurFriends.ids.has(n);
}

function rbxMarkNames() {
  const on = rbxState.enabled && rbxState.blurName;
  const current = document.querySelectorAll(".rx-blur-name");
  if (!on) {
    current.forEach((n) => n.classList.remove("rx-blur-name"));
    document.documentElement.classList.remove("rx-blur-mine");
    return;
  }
  const now = Date.now();
  if (now - rbxNamesAt < 1000 || !rbxDomChanged("names")) return;
  rbxNamesAt = now;
  if (typeof rbxMe !== "undefined" && !rbxMe && typeof rbxCurrentUser === "function") rbxCurrentUser();

  const hits = new Set();

  document.querySelectorAll('a[href*="/users/"]').forEach((a) => {
    if (a.closest(RBX_NAME_LINK_SKIP)) return;
    const m = /\/users\/(\d+)\/profile/.exec(a.getAttribute("href") || "");
    if (!m || !rbxBlurTarget(m[1])) return;
    const leaves = [];
    rbxLeafTextEls(a, leaves);
    leaves.forEach((l) => {
      if ((l.textContent || "").trim().length <= 40) hits.add(l);
    });
  });

  const matchers = rbxNameMatchers(rbxOwnNames());
  if (matchers.length && document.body) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const t = node.nodeValue;
        if (!t || t.length > 80) return NodeFilter.FILTER_REJECT;
        const p = node.parentElement;
        if (!p || p === document.body || p === document.documentElement) return NodeFilter.FILTER_REJECT;
        if (p.closest("#rx-panel, #rx-toast, script, style, textarea, input, select")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const t = node.nodeValue.trim().toLowerCase();
      if (!t) continue;
      const p = node.parentElement;
      if (p.children.length > 6) continue;
      if (matchers.some((m) => t === m.n || (m.re && t.length <= 40 && m.re.test(t)))) hits.add(p);
    }
  }

  current.forEach((n) => {
    if (!hits.has(n)) n.classList.remove("rx-blur-name");
  });
  hits.forEach((n) => n.classList.add("rx-blur-name"));
  const pg = rbxPageInfo(location.pathname);
  document.documentElement.classList.toggle("rx-blur-mine", !!(pg && pg.k === "user" && rbxBlurTarget(pg.id)));
}

function rbxEnsureDock() {
  if (!document.body) return;
  let dock = document.getElementById("rx-dock");
  if (!dock) {
    dock = document.createElement("div");
    dock.id = "rx-dock";
    dock.innerHTML = `<button type="button" id="rx-up" title="Haut de page">↑</button><button type="button" id="rx-gear" title="Réglages de l'extension">⚙</button>`;
    document.body.appendChild(dock);
    dock.querySelector("#rx-up").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    dock.querySelector("#rx-gear").addEventListener("click", () => rbxOpenPanel());
  }
  const s = rbxState;
  const showUp = s.enabled && s.showScrollTop;
  const showGear = s.showFab || !s.enabled;
  dock.querySelector("#rx-up").style.display = showUp ? "" : "none";
  dock.querySelector("#rx-gear").style.display = showGear ? "" : "none";
  dock.style.display = showUp || showGear ? "" : "none";
}

function rbxNavList() {
  return document.querySelector("ul.rbx-navbar") || document.querySelector("#header .navbar-left ul");
}

function rbxEnsureNav() {
  if (document.getElementById("rx-nav")) return;
  const list = rbxNavList();
  if (!list) return;
  const li = document.createElement("li");
  li.id = "rx-nav";
  li.className = "cursor-pointer";
  const a = document.createElement("a");
  a.className = "font-header-2 nav-menu-title text-header";
  a.href = "#";
  a.textContent = "RoNova";
  li.appendChild(a);
  list.appendChild(li);
}

function rbxEnsureLinks() {
  const list = rbxNavList();
  if (!list) return;
  const raw = rbxState.enabled ? rbxState.quickLinks || "" : "";
  const present = list.querySelectorAll(".rx-link").length;
  if (list.dataset.rxLinks === raw && (raw === "" || present > 0)) return;
  list.querySelectorAll(".rx-link").forEach((n) => n.remove());
  list.dataset.rxLinks = raw;
  raw.split("\n").forEach((line) => {
    const parts = line.split("|");
    if (parts.length < 2) return;
    const name = parts[0].trim();
    let url;
    try {
      url = new URL(parts.slice(1).join("|").trim());
    } catch (e) {
      return;
    }
    if (!name || url.protocol !== "https:") return;
    const li = document.createElement("li");
    li.className = "rx-link cursor-pointer";
    const a = document.createElement("a");
    a.className = "font-header-2 nav-menu-title text-header";
    a.href = url.href;
    a.textContent = name;
    li.appendChild(a);
    list.appendChild(li);
  });
}

function rbxSessionStart() {
  try {
    let v = Number(sessionStorage.getItem("rxSessionStart"));
    if (!v) {
      v = Date.now();
      sessionStorage.setItem("rxSessionStart", String(v));
    }
    return v;
  } catch (e) {
    return rbxLoadedAt;
  }
}

function rbxSessionMin() {
  return Math.floor((Date.now() - rbxSessionStart()) / 60000);
}

function rbxEnsureRobux() {
  const el = document.getElementById("nav-robux-amount") || document.getElementById("nav-robux-balance");
  const old = document.getElementById("rx-robux-eur");
  const want = rbxState.enabled && rbxState.showDevex;
  if (!el || !want) {
    if (old) old.remove();
    return;
  }
  const txt = el.textContent || "";
  const n = rbxParseRobux(txt);
  if (n === null) {
    if (old) old.remove();
    return;
  }
  const eur = n * (Number(rbxState.devexRate) || 0) * (Number(rbxState.usdToEur) || 0);
  const approx = /[kKmM]/.test(txt) ? "≈ " : "";
  const label = ` (${approx}${eur.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €)`;
  let span = old;
  if (!span || span.previousElementSibling !== el) {
    if (span) span.remove();
    span = document.createElement("span");
    span.id = "rx-robux-eur";
    span.style.marginLeft = "4px";
    el.insertAdjacentElement("afterend", span);
  }
  if (span.textContent !== label) span.textContent = label;
}

let rbxPlayPending = 0;

function rbxFlushPlaytime() {
  if (!rbxPlayPending) return;
  const pt = { ...(rbxState.playtime || {}) };
  const k = new Date().toLocaleDateString("sv-SE");
  pt[k] = (pt[k] || 0) + rbxPlayPending;
  rbxPlayPending = 0;
  const keys = Object.keys(pt).sort();
  while (keys.length > 60) delete pt[keys.shift()];
  rbxSet({ playtime: pt });
}

let rbxPlayAt = 0;

rbxEvery(() => {
  const now = Date.now();
  const gap = rbxPlayAt ? Math.round((now - rbxPlayAt) / 1000) : 0;
  rbxPlayAt = now;
  if (!rbxState.enabled || !rbxState.trackPlaytime || !gap) return;
  rbxPlayPending += Math.min(gap, 20);
  if (rbxPlayPending >= 60) rbxFlushPlaytime();
}, 15000);

document.addEventListener("visibilitychange", () => {
  if (document.hidden) rbxPlayAt = 0;
});

let rbxBreakCount = null;

function rbxCheckBreak() {
  const every = Number(rbxState.breakReminder);
  if (!rbxState.enabled || !every) {
    rbxBreakCount = null;
    return;
  }
  const min = rbxSessionMin();
  const due = Math.floor(min / every);
  if (rbxBreakCount === null) {
    rbxBreakCount = due;
    return;
  }
  if (due > rbxBreakCount) {
    rbxBreakCount = due;
    rbxToast(`Pause ? Tu es sur Roblox depuis ${min} min.`, 8000);
  }
}

function rbxCheckLimit() {
  const lim = Number(rbxState.dailyLimit);
  if (!rbxState.enabled || !lim) return;
  const k = new Date().toLocaleDateString("sv-SE");
  if (rbxState.limitNotified === k) return;
  const used = ((rbxState.playtime || {})[k] || 0) + rbxPlayPending;
  if (used >= lim * 60) {
    rbxSet({ limitNotified: k });
    rbxToast(`Limite de ${lim} min atteinte pour aujourd'hui`, 10000);
  }
}

function rbxAutoTheme() {
  const s = rbxState;
  if (!s.enabled || !s.autoTheme) return;
  const h = new Date().getHours();
  const a = Number(s.dayStart);
  const b = Number(s.nightStart);
  const day = a < b ? h >= a && h < b : h >= a || h < b;
  const period = day ? "day" : "night";
  if (s.autoPeriod === period) return;
  const id = day ? s.dayTheme : s.nightTheme;
  if (!RBX_ALL_THEMES[id]) return;
  rbxSet({ autoPeriod: period });
  rbxApplyTheme(id);
}

document.addEventListener(
  "click",
  (e) => {
    const t = e.target;
    if (t && t.closest && t.closest("#rx-nav")) {
      e.preventDefault();
      e.stopPropagation();
      rbxOpenPanel();
    }
  },
  true
);

document.addEventListener(
  "click",
  (e) => {
    if (!rbxState.enabled || !rbxState.openNewTab || e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || a.target === "_blank" || a.closest("#rx-panel") || a.closest("#rx-bar")) return;
    let url;
    try {
      url = new URL(a.href);
    } catch (err) {
      return;
    }
    if (url.protocol !== "https:" || !/(^|\.)roblox\.com$/.test(url.hostname) || !/^\/games\/\d+/.test(url.pathname)) return;
    e.preventDefault();
    e.stopPropagation();
    window.open(url.href, "_blank", "noopener");
  },
  true
);

document.addEventListener("keydown", (e) => {
  if (!rbxState.enableShortcuts || !e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  const k = e.key.toLowerCase();
  const base = ["s", "u", "q"];
  if (rbxState.quickJoin) base.push("j");
  const known = base.includes(k) || Object.prototype.hasOwnProperty.call(RBX_NAV_KEYS, k);
  if (!known) return;
  e.preventDefault();
  if (k === "s") rbxOpenPanel();
  else if (k === "u") window.scrollTo({ top: 0, behavior: "smooth" });
  else if (k === "j") rbxQuickJoin();
  else if (k === "q") {
    const input = document.querySelector("#navbar-universal-search input, input[type='search']");
    if (input) input.focus();
  } else {
    location.href = RBX_NAV_KEYS[k];
  }
});

function rbxTick() {
  if (!document.body) return;
  rbxEnsureNav();
  rbxEnsureLinks();
  rbxEnsureDock();
  rbxEnsureRobux();
  rbxAutoTheme();
  rbxCheckBreak();
  rbxCheckLimit();
  rbxMarkNames();
  rbxRenderBar();
}

rbxEvery(rbxTick, 700);
rbxOnChange(rbxTick);