const RBX_BANNER_KEY = "rbxCustomizerBanner";

const RBX_POST_OK = [
  /^https:\/\/presence\.roblox\.com\/v1\/presence\/users$/,
  /^https:\/\/friends\.roblox\.com\/v1\/users\/\d+\/unfriend$/,
  /^https:\/\/avatar\.roblox\.com\/v1\/outfits\/\d+\/wear$/
];

const RBX_HEAD_URL = "https://thumbnails.roblox.com/v1/users/avatar-headshot?size=150x150&format=Png&isCircular=true&userIds=";
const RBX_ICON_URL = "https://thumbnails.roblox.com/v1/games/icons?returnPolicy=PlaceHolder&size=150x150&format=Png&isCircular=false&universeIds=";
const RBX_OUTFIT_URL = "https://thumbnails.roblox.com/v1/users/outfits?size=150x150&format=Png&isCircular=false&userOutfitIds=";

const RBX_ADD_FRIENDS_TXT = ["add friends", "ajouter des amis"];

const RBX_QJ_MODES = ["small", "ping", "random", "last"];

const RBX_FRIEND_GAME_SEL = [
  '[class*="friends-carousel-tile-experience" i]',
  '[class*="friend-tile-experience" i]',
  '[class*="friend-tile-game" i]',
  '[class*="friends-carousel"] [class*="experience-name" i]',
  '[class*="friends-carousel"] [class*="game-name" i]',
  '[class*="friends-carousel"] [class*="tile-game" i]',
  '[class*="friend-tile-dropdown" i] [class*="experience" i]',
  '[class*="friend-tile-dropdown" i] [class*="game" i]'
];

const RBX_FLAT_SEL = [
  ".game-card-info",
  ".item-card-container",
  ".item-card-link",
  ".item-card-caption",
  ".item-card-thumb-container",
  ".item-card-thumb-container .thumbnail-2d-container",
  ".item-card-thumb-container .item-card-thumb",
  "[class*='wearing' i] [class*='item' i]",
  "[class*='wearing' i] [class*='thumb' i]",
  "[class*='accoutrement' i] [class*='item' i]",
  "[class*='accoutrement' i] [class*='thumb' i]"
];

const RBX_FOCUS_SEL = [
  "#chat-container",
  ".chat-container",
  "#chat-main",
  ".friend-carousel-container",
  "#friend-carousel",
  ".friends-carousel-container",
  "[data-testid='friends-carousel']",
  "#footer-container",
  "footer",
  ".footer",
  ".ads-container",
  ".abp",
  ".ad-container",
  "[id^='Skyscraper']",
  "[id^='Leaderboard']",
  "[class*='advertisement']"
];

const RBX_BTN_LIST = [
  ".btn-primary-md", ".btn-primary-sm", ".btn-primary-lg",
  ".btn-secondary-md", ".btn-secondary-sm", ".btn-secondary-lg",
  ".btn-control-md", ".btn-control-sm", ".btn-control-lg",
  ".btn-growth-md", ".btn-growth-sm", ".btn-growth-lg",
  ".btn-cta-md", ".btn-cta-sm", ".btn-cta-lg"
];

const RBX_NAV_ITEMS = [".rbx-left-col li > a", "#navigation li > a", ".left-col-list li > a"];

const RBX_P2 = "html:root:root body";

Object.assign(RBX_DEFAULTS, {
  socJoin: true,
  socRap: true,
  socBestBtn: true,
  socBanner: true,
  socNotes: true,
  socFavGames: true,
  bannerHeight: 220,
  bannerPos: 50,
  bannerRadius: 12,
  showFriendsBtn: true,
  bestFriends: [],
  favGames: [],
  userNotes: {},
  blurReveal: true,
  blurId: true,
  hideFriendGames: true,
  hideAddFriends: true,
  flatCards: true,
  quickJoinMode: "small",
  uiPolish: true,
  uiRound: 12,
  uiButtons: true,
  uiLift: true,
  uiShadow: true,
  uiSidebar: true,
  uiTitles: true,
  uiAvatars: false,
  uiFocus: true,
  focusMode: false
});

Object.assign(RBX_PREMIUM_OFF, {
  socJoin: false,
  socRap: false,
  socBanner: false,
  socNotes: false,
  socFavGames: false
});

RBX_LOCK_ONLY.push("bannerHeight", "bannerPos", "bannerRadius", "quickJoinMode");

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

function rbxSocAddField(tabId, afterKey, field) {
  const t = RBX_TABS.find((x) => x.id === tabId);
  if (!t || !t.fields || t.fields.some((f) => f.key === field.key)) return;
  const i = t.fields.findIndex((f) => f.key === afterKey);
  t.fields.splice(i < 0 ? t.fields.length : i + 1, 0, field);
}

(function rbxSocSetup() {
  const iProfile = RBX_TABS.findIndex((t) => t.id === "profile");
  RBX_TABS.splice(
    iProfile < 0 ? RBX_TABS.length : iProfile + 1,
    0,
    { id: "friends", label: "Amis", fields: [] },
    { id: "outfits", label: "Avatar", fields: [] }
  );

  const iEff = RBX_TABS.findIndex((t) => t.id === "effects");
  RBX_TABS.splice(iEff < 0 ? RBX_TABS.length : iEff + 1, 0, {
    id: "interface",
    label: "Interface",
    fields: [
      { key: "uiPolish", type: "checkbox", label: "Interface améliorée (arrondis, animations, menus)" },
      { key: "uiRound", type: "range", label: "Arrondi des cartes et miniatures", min: 0, max: 28, step: 2, unit: " px" },
      { key: "uiButtons", type: "checkbox", label: "Boutons animés" },
      { key: "uiLift", type: "checkbox", label: "Cartes qui se soulèvent au survol" },
      { key: "uiShadow", type: "checkbox", label: "Ombres douces sur les sections" },
      { key: "uiSidebar", type: "checkbox", label: "Menu de gauche stylé" },
      { key: "uiTitles", type: "checkbox", label: "Titres de sections soulignés" },
      { key: "uiAvatars", type: "checkbox", label: "Anneau coloré autour des avatars" },
      { key: "uiFocus", type: "checkbox", label: "Halo sur les champs de saisie" },
      { key: "focusMode", type: "checkbox", label: "Mode focus : masque chat, amis, pubs et pied de page (Alt+Z)" }
    ]
  });

  const prem = RBX_TABS.find((t) => t.id === "premium");
  if (prem && prem.subs) {
    if (!prem.subs.some((s) => s.id === "social")) {
      const j = prem.subs.findIndex((s) => s.id === "info");
      prem.subs.splice(j < 0 ? prem.subs.length : j + 1, 0, { id: "social", label: "Profil+", fields: [] });
    }
    const comfort = prem.subs.find((s) => s.id === "comfort");
    if (comfort) {
      const sc = comfort.fields.find((f) => f.key === "enableShortcuts");
      if (sc) sc.label = "Raccourcis clavier (Alt + S U Q J H G C A Z)";
      if (!comfort.fields.some((f) => f.key === "quickJoinMode")) {
        const k = comfort.fields.findIndex((f) => f.key === "openNewTab");
        comfort.fields.splice(k < 0 ? comfort.fields.length : k + 1, 0, {
          key: "quickJoinMode",
          type: "select",
          label: "Bouton Rejoindre vite : quel serveur choisir",
          options: [["small", "Plus petit serveur"], ["ping", "Meilleur ping"], ["random", "Au hasard"], ["last", "Dernier serveur rejoint"]]
        });
      }
    }
  }

  rbxSocAddField("privacy", "blurName", { key: "blurReveal", type: "checkbox", label: "Révéler les pseudos et les Robux au survol de la souris" });
  rbxSocAddField("privacy", "blurReveal", { key: "blurId", type: "checkbox", label: "Flouter aussi l'ID du compte sur les profils" });
  rbxSocAddField("hide", "hideFriendsRow", { key: "hideFriendGames", type: "checkbox", label: "Masquer les jeux auxquels jouent mes amis" });
  rbxSocAddField("hide", "hideFriendGames", { key: "hideAddFriends", type: "checkbox", label: "Masquer le texte Add Friends" });
  rbxSocAddField("effects", "noAnimations", { key: "flatCards", type: "checkbox", label: "Retirer les rectangles derrière les cartes (stats des jeux, objets, objets portés)" });
})();

const rbxSleep = (ms) => new Promise((r) => setTimeout(r, ms));

function rbxSocClamp(n, lo, hi) {
  let v = Number(n);
  if (isNaN(v)) v = lo;
  return Math.min(hi, Math.max(lo, v));
}

function sxEl(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function sxBtn(label, cls) {
  const b = sxEl("button", cls || "sx-btn", label);
  b.type = "button";
  return b;
}

function sxItem(label, value, wide) {
  const box = sxEl("div", wide ? "sx-item sx-wide" : "sx-item");
  box.appendChild(sxEl("small", "", label));
  box.appendChild(sxEl("strong", "", value));
  return box;
}

function rbxSafeImg(url) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" && /(^|\.)rbxcdn\.com$/.test(u.hostname) ? u.href : "";
  } catch (e) {
    return "";
  }
}

function sxImg(url, cls) {
  const i = document.createElement("img");
  if (cls) i.className = cls;
  i.alt = "";
  // Décodage hors du fil principal et chargement à l'approche : les longues listes d'amis ne figent plus le panneau.
  i.decoding = "async";
  i.loading = "lazy";
  const u = rbxSafeImg(url);
  if (u) i.src = u;
  return i;
}

function rbxAgo(iso) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const m = Math.max(0, Math.round((Date.now() - t) / 60000));
  if (m < 2) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 48) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} jours`;
}

const rbxItemBase = rbxItem;
rbxItem = function (label, value, isName) {
  const box = rbxItemBase(label, value, isName);
  if (label === "ID") {
    const st = box.querySelector("strong");
    if (st) st.classList.add("rx-blur-id");
  }
  return box;
};

let rbxBanner = null;
let rbxMeTry = 0;
let rbxAddAt = 0;
let rbxNameObsTimer = 0;
let rbxNameObsOn = false;
const rbxBannerBmp = { ts: 0, bmp: null, busy: false };

chrome.storage.local.get(RBX_BANNER_KEY, (res) => {
  rbxBanner = (res && res[RBX_BANNER_KEY]) || null;
  rbxSocBannerPreview();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[RBX_BANNER_KEY]) {
    rbxBanner = changes[RBX_BANNER_KEY].newValue || null;
    rbxSocBannerPreview();
  }
});

const rbxSocStyle = document.createElement("style");
rbxSocStyle.id = "rx-social-style";
document.documentElement.appendChild(rbxSocStyle);

function rbxSocSel(list) {
  return list.map((x) => `${RBX_P2} ${x}`).join(",");
}

function rbxSocPolishCss(s) {
  const A = "var(--rx-accent, #335fff)";
  const R = rbxSocClamp(s.uiRound, 0, 28);
  let css = "";

  {
    css += `${rbxSocSel([".game-card-thumb-container", ".item-card-thumb-container", ".thumbnail-2d-container", ".game-card-thumb-container img", ".item-card-thumb-container img"])} { border-radius: ${R}px !important; }`;
    css += `${rbxSocSel([".section-content", ".game-card-info", ".item-card-container", ".modal-content", ".modal-dialog", ".popover-content", ".dropdown-menu", ".rbx-popover-content", ".profile-about-content", ".game-description-wrapper", ".game-container", "textarea", "select"])} { border-radius: ${Math.max(6, R - 2)}px !important; }`;
  }

  if (s.uiButtons) {
    css += `${rbxSocSel(RBX_BTN_LIST)} { border-radius: ${Math.max(8, R)}px !important; transition: transform 0.12s ease, filter 0.15s ease, background-color 0.15s ease !important; }`;
    css += `${rbxSocSel(RBX_BTN_LIST.map((x) => x + ":hover"))} { transform: translateY(-1px); }`;
    css += `${rbxSocSel(RBX_BTN_LIST.map((x) => x + ":active"))} { transform: scale(0.97); }`;
  }

  if (s.uiLift) {
    css += `${rbxSocSel([".game-card-container", ".item-card-container"])} { transition: transform 0.18s ease !important; }`;
    css += `${rbxSocSel([".game-card-container:hover", ".item-card-container:hover"])} { transform: translateY(-4px); }`;
    css += `${rbxSocSel([".game-card-link:hover .game-card-thumb-container", ".item-card-link:hover .item-card-thumb-container"])} { box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35) !important; }`;
  }

  if (s.uiShadow && !s.glassCards && !s.accentBorders) {
    css += `${rbxSocSel([".section-content", ".profile-about-content", ".modal-content", ".dropdown-menu", ".popover-content"])} { box-shadow: 0 6px 22px rgba(0, 0, 0, 0.18) !important; }`;
  }

  if (s.uiSidebar) {
    css += `${rbxSocSel(RBX_NAV_ITEMS)} { border-radius: 12px !important; transition: background-color 0.15s ease, transform 0.15s ease !important; }`;
    css += `${rbxSocSel(RBX_NAV_ITEMS.map((x) => x + ":hover"))} { background-color: color-mix(in srgb, ${A} 16%, transparent) !important; transform: translateX(3px); }`;
    css += `${rbxSocSel([".rbx-left-col li.active > a", "#navigation li.active > a", ".left-col-list li.active > a", ".rbx-left-col li > a.active", ".left-col-list li > a.active"])} { background-color: color-mix(in srgb, ${A} 26%, transparent) !important; }`;
  }

  if (s.uiTitles) {
    css += `${rbxSocSel([".container-header h1", ".container-header h2", ".container-header h3"])} { position: relative; padding-bottom: 8px; }`;
    css += `${rbxSocSel([".container-header h1::after", ".container-header h2::after", ".container-header h3::after"])} { content: ""; position: absolute; left: 0; bottom: 0; width: 38px; height: 3px; border-radius: 3px; background: ${A}; }`;
  }

  if (s.uiAvatars) {
    css += `${rbxSocSel([".avatar-headshot img", ".avatar-card-image img", ".avatar-headshot-lg img", ".avatar-headshot-md img", "[class*='friend-tile' i] img"])} { box-shadow: 0 0 0 2px ${A}, 0 4px 12px rgba(0, 0, 0, 0.3) !important; }`;
  }

  if (s.uiFocus) {
    css += `${rbxSocSel(["input:focus", "textarea:focus", "select:focus"])} { outline: none !important; box-shadow: 0 0 0 2px color-mix(in srgb, ${A} 55%, transparent) !important; border-color: ${A} !important; }`;
  }

  return css;
}

function rbxSocBuildCss(s) {
  if (!s.enabled) return "";
  let css = "";

  if (s.flatCards) {
    css += `${rbxSocSel(RBX_FLAT_SEL)} { background: transparent !important; background-color: transparent !important; border: 0 !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`;
  }
  if (s.hideFriendGames) {
    css += `${rbxSocSel(RBX_FRIEND_GAME_SEL)} { display: none !important; }`;
  }
  if (s.blurReveal === false) {
    const lists = [];
    if (s.blurName) lists.push(RBX_BLUR_MINE);
    if (s.blurRobux) lists.push(RBX_BLUR_ROBUX);
    if (lists.length) {
      const base = lists.join(",").split(",").map((x) => x.trim()).filter(Boolean);
      css += `${base.map((x) => `${RBX_P2} ${x}:hover`).join(",")} { filter: blur(7px) !important; }`;
      css += `html:root:root #rx-panel .sx-blur:hover { filter: blur(7px) !important; }`;
    }
  }
  // L'ID n'est flouté que sur ton profil et ceux de tes amis (classe posée par rbxMarkNames).
  if (s.blurName) {
    css += `html.rx-blur-mine:root:root body .rx-blur-id { filter: blur(7px) !important; transition: filter 0.15s; }`;
    if (s.blurReveal !== false) css += `html.rx-blur-mine:root:root body .rx-blur-id:hover { filter: none !important; }`;
  }
  if (s.uiPolish) css += rbxSocPolishCss(s);
  if (s.focusMode) css += `${rbxSocSel(RBX_FOCUS_SEL)} { display: none !important; }`;
  return css;
}

function rbxSocStyleRefresh(s) {
  rbxSetCss(rbxSocStyle, rbxSocBuildCss(s));
}

rbxRefresh = function (s) {
  rbxSetCss(rbxStyle, rbxBuildCss(s));
  rbxApplyVars(s);
};

let rbxCsrfToken = "";

function rbxPostAllowed(url) {
  return RBX_POST_OK.some((re) => re.test(String(url)));
}

function rbxPostBody(url, body) {
  if (String(url).indexOf("presence.roblox.com") !== -1) {
    const ids = body && Array.isArray(body.userIds) ? body.userIds.map(Number).filter((n) => n > 0).slice(0, 100) : [];
    return { userIds: ids };
  }
  return undefined;
}

async function rbxPostDirect(url, body) {
  const send = () =>
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json;charset=UTF-8", "x-csrf-token": rbxCsrfToken },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  let r = await send();
  if (r.status === 403) {
    const t = r.headers.get("x-csrf-token");
    if (t) {
      rbxCsrfToken = t;
      r = await send();
    }
  }
  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    data = null;
  }
  return { ok: r.ok, status: r.status, data };
}

async function rbxPostJson(url, body) {
  if (!rbxPostAllowed(url)) return { ok: false, status: 0, data: null };
  const clean = rbxPostBody(url, body);
  try {
    return await rbxPostDirect(url, clean);
  } catch (e) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "postJson", url, body: clean }, (res) => {
        if (chrome.runtime.lastError || !res) resolve({ ok: false, status: 0, data: null });
        else resolve(res);
      });
    });
  }
}

async function rbxPresence(ids) {
  const out = new Map();
  if (!ids.length) return out;
  const r = await rbxPostJson("https://presence.roblox.com/v1/presence/users", { userIds: ids });
  if (r.ok && r.data && Array.isArray(r.data.userPresences)) {
    r.data.userPresences.forEach((p) => out.set(p.userId, p));
  }
  return out;
}

function rbxPresenceText(p) {
  if (!p) return "Statut indisponible";
  if (p.userPresenceType === 2) return "En jeu" + (p.lastLocation ? " · " + p.lastLocation : "");
  if (p.userPresenceType === 3) return "Dans Roblox Studio";
  if (p.userPresenceType === 1) return "En ligne";
  return "Hors ligne";
}

function rbxCanJoin(p) {
  return !!(p && p.userPresenceType === 2 && p.placeId && p.gameId);
}

function rbxJoinPresence(p) {
  if (!rbxCanJoin(p)) {
    rbxToast("Impossible de le rejoindre pour l'instant");
    return;
  }
  location.href = rbxJoinUrl(p.placeId, p.gameId);
}

const rbxHeadCache = new Map();
const rbxIconCache = new Map();
const rbxOutfitThumbs = new Map();

async function rbxThumbBatch(base, ids, cache, chunk) {
  const need = Array.from(new Set(ids)).filter((i) => !cache.has(i));
  for (let i = 0; i < need.length; i += chunk) {
    const part = need.slice(i, i + chunk);
    const r = await rbxFetchJson(base + part.join(","));
    if (r && Array.isArray(r.data)) {
      r.data.forEach((d) => {
        if (d && d.imageUrl) cache.set(d.targetId, d.imageUrl);
      });
    }
  }
  return cache;
}

function rbxNeedPremium() {
  if (rbxPremium.active) return false;
  rbxToast("Fonction réservée au Premium");
  return true;
}

async function rbxMyId() {
  const me = await rbxCurrentUser();
  return me ? me.id : 0;
}

function rbxBestList() {
  return Array.isArray(rbxState.bestFriends) ? rbxState.bestFriends : [];
}

function rbxFavList() {
  return Array.isArray(rbxState.favGames) ? rbxState.favGames : [];
}

async function rbxToggleBest(id, name, dn) {
  const list = rbxBestList();
  if (list.some((b) => b.id === id)) {
    rbxSet({ bestFriends: list.filter((b) => b.id !== id) });
    rbxToast("Retiré des best friends");
    return false;
  }
  if (list.length >= 30) {
    rbxToast("30 best friends maximum");
    return false;
  }
  rbxSet({ bestFriends: [...list, { id, n: name || String(id), d: dn || name || String(id) }] });
  rbxToast("Ajouté aux best friends");
  return true;
}

const rbxRapCache = new Map();

async function rbxFetchRap(userId, onProgress) {
  const key = String(userId);
  const hit = rbxRapCache.get(key);
  if (hit && Date.now() - hit.at < 300000) return hit.res;
  let cursor = "";
  let rap = 0;
  let count = 0;
  let more = false;
  const top = [];
  for (let i = 0; i < 15; i++) {
    const url = `https://inventory.roblox.com/v1/users/${userId}/assets/collectibles?limit=100&sortOrder=Asc${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`;
    const r = await rbxFetchJson(url);
    if (!r || !Array.isArray(r.data)) {
      if (i === 0) return { priv: true };
      more = true;
      break;
    }
    r.data.forEach((it) => {
      const v = Number(it.recentAveragePrice) || 0;
      rap += v;
      count++;
      top.push({ n: it.name || "?", v });
    });
    if (onProgress) onProgress(count);
    cursor = r.nextPageCursor || "";
    if (!cursor) break;
    if (i === 14) more = true;
    await rbxSleep(350);
  }
  top.sort((a, b) => b.v - a.v);
  const res = { rap, count, top: top.slice(0, 3), truncated: more };
  rbxRapCache.set(key, { at: Date.now(), res });
  return res;
}

async function rbxAddFavGame(placeId) {
  const pid = String(placeId || "").trim();
  if (!/^\d+$/.test(pid)) {
    rbxToast("ID de jeu invalide");
    return false;
  }
  const list = rbxFavList();
  if (list.some((g) => String(g.p) === pid)) {
    rbxToast("Déjà dans tes jeux préférés");
    return false;
  }
  if (list.length >= 12) {
    rbxToast("12 jeux préférés maximum");
    return false;
  }
  const u = await rbxUniverse(pid);
  if (!u) {
    rbxToast("Jeu introuvable");
    return false;
  }
  const st = await rbxGameStats(u);
  const name = st && st.game && st.game.name ? st.game.name : "Jeu " + pid;
  rbxSet({ favGames: [...rbxFavList(), { p: pid, u: Number(u), t: String(name).slice(0, 80) }] });
  rbxToast("Ajouté aux jeux préférés");
  return true;
}

async function rbxToggleFav(placeId) {
  const pid = String(placeId);
  const list = rbxFavList();
  if (list.some((g) => String(g.p) === pid)) {
    rbxSet({ favGames: list.filter((g) => String(g.p) !== pid) });
    rbxToast("Retiré des jeux préférés");
    return;
  }
  await rbxAddFavGame(pid);
}

async function rbxQuickJoinGame(placeId) {
  const s = rbxState;
  const mode = RBX_QJ_MODES.includes(s.quickJoinMode) ? s.quickJoinMode : "small";
  if (mode === "last") {
    const last = s.lastServers && s.lastServers[placeId];
    if (last && last.id) {
      location.href = rbxJoinUrl(placeId, last.id);
      return;
    }
  }
  rbxToast("Recherche d'un serveur…");
  const list = await rbxFetchServers(placeId, "Asc", 1);
  const sortMode = mode === "ping" ? "ping" : mode === "random" ? "random" : "small";
  const l = rbxSortServers(list, sortMode, rbxMinPlayers());
  if (!l.length) {
    rbxToast("Aucun serveur trouvé, lancement normal");
    location.href = `roblox://experiences/start?placeId=${encodeURIComponent(placeId)}`;
    return;
  }
  rbxRememberServer(placeId, l[0].id);
  location.href = rbxJoinUrl(placeId, l[0].id);
}

rbxQuickJoin = function () {
  const page = rbxPageInfo(location.pathname);
  if (!page || page.k !== "game") {
    rbxToast("Ouvre la page d'un jeu");
    return Promise.resolve();
  }
  return rbxQuickJoinGame(page.id);
};

let rbxOutfits = [];
let rbxOutfitsLoading = false;

function rbxRenderOutfits() {
  const box = document.querySelector('#rx-panel [data-soc-list="outfits"]');
  if (!box) return;
  box.textContent = "";
  if (!rbxOutfits.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucune tenue trouvée. Enregistre des tenues dans l'éditeur d'avatar de Roblox (Costumes)."));
    return;
  }
  rbxOutfits.forEach((o) => {
    const card = sxEl("div", "sx-outfit");
    card.appendChild(sxImg(rbxOutfitThumbs.get(o.id), ""));
    card.appendChild(sxEl("span", "sx-oname", o.name || "Tenue"));
    const b = sxBtn("Équiper", "rx-sec");
    b.addEventListener("click", () => rbxWearOutfit(o));
    card.appendChild(b);
    box.appendChild(card);
  });
}

async function rbxLoadOutfits() {
  const box = document.querySelector('#rx-panel [data-soc-list="outfits"]');
  if (!box || rbxOutfitsLoading) return;
  rbxOutfitsLoading = true;
  box.textContent = "Chargement de tes tenues…";
  const id = await rbxMyId();
  if (!id) {
    box.textContent = "Connecte-toi à Roblox pour voir tes tenues.";
    rbxOutfitsLoading = false;
    return;
  }
  const r = await rbxFetchJson(`https://avatar.roblox.com/v1/users/${id}/outfits?isEditable=true&itemsPerPage=50&page=1`);
  rbxOutfits = r && Array.isArray(r.data) ? r.data.filter((o) => o && o.id) : [];
  await rbxThumbBatch(RBX_OUTFIT_URL, rbxOutfits.map((o) => o.id), rbxOutfitThumbs, 100);
  rbxOutfitsLoading = false;
  rbxRenderOutfits();
}

async function rbxWearOutfit(o) {
  if (rbxNeedPremium()) return;
  rbxToast(`Équipement de « ${o.name || "la tenue"} »…`);
  const r = await rbxPostJson(`https://avatar.roblox.com/v1/outfits/${o.id}/wear`, undefined);
  if (r.status === 429) {
    rbxToast("Trop de requêtes, réessaie dans quelques secondes");
    return;
  }
  if (r.ok && !(r.data && r.data.success === false)) {
    const bad = r.data && Array.isArray(r.data.invalidAssetIds) ? r.data.invalidAssetIds.length : 0;
    rbxToast(bad ? "Tenue équipée (certains objets ne sont plus disponibles)" : "Tenue équipée");
    if (location.pathname.indexOf("/my/avatar") === 0) setTimeout(() => location.reload(), 900);
  } else {
    rbxToast("Impossible d'équiper cette tenue");
  }
}

let rbxFriendsList = [];
const rbxFriendSel = new Set();
let rbxFriendBusy = false;
let rbxOnlineBusy = false;

function rbxBestIds() {
  return new Set(rbxBestList().map((b) => b.id));
}

function rbxUpdateRemoveBtn() {
  const b = document.querySelector('#rx-panel [data-soc="uRemove"]');
  if (b && !rbxFriendBusy) b.textContent = `Retirer la sélection (${rbxFriendSel.size})`;
}

function rbxVisibleFriends() {
  const inp = document.querySelector('#rx-panel [data-soc-in="uFilter"]');
  const f = inp ? inp.value.trim().toLowerCase() : "";
  return rbxFriendsList.filter((x) => !f || String(x.name).toLowerCase().includes(f) || String(x.displayName || "").toLowerCase().includes(f));
}

function rbxRenderFriends() {
  const box = document.querySelector('#rx-panel [data-soc-list="friends"]');
  if (!box) return;
  box.textContent = "";
  const rows = rbxVisibleFriends();
  if (!rows.length) {
    box.appendChild(sxEl("p", "rx-empty", rbxFriendsList.length ? "Aucun ami ne correspond au filtre." : "Clique sur « Charger mes amis »."));
    rbxUpdateRemoveBtn();
    return;
  }
  const best = rbxBestIds();
  rows.forEach((f) => {
    const row = sxEl("div", "rx-li");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.className = "sx-check";
    cb.checked = rbxFriendSel.has(f.id);
    cb.addEventListener("change", () => {
      if (cb.checked) rbxFriendSel.add(f.id);
      else rbxFriendSel.delete(f.id);
      rbxUpdateRemoveBtn();
    });
    row.appendChild(cb);
    row.appendChild(sxImg(rbxHeadCache.get(f.id), "sx-head"));
    const name = sxEl("span", "rx-li-name");
    name.appendChild(sxEl("span", rbxState.blurName ? "sx-blur" : "", `${f.displayName || f.name} (@${f.name})`));
    row.appendChild(name);
    if (best.has(f.id)) row.appendChild(sxEl("span", "rx-tag", "Best friend"));
    if (f.isOnline) row.appendChild(sxEl("span", "rx-li-date", "En ligne"));
    row.addEventListener("click", (e) => {
      if (e.target === cb) return;
      cb.checked = !cb.checked;
      cb.dispatchEvent(new Event("change"));
    });
    box.appendChild(row);
  });
  rbxUpdateRemoveBtn();
}

async function rbxLoadFriends() {
  const box = document.querySelector('#rx-panel [data-soc-list="friends"]');
  if (!box) return;
  box.textContent = "Chargement de tes amis…";
  const id = await rbxMyId();
  if (!id) {
    box.textContent = "Connecte-toi à Roblox.";
    return;
  }
  const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/friends`);
  rbxFriendsList = r && Array.isArray(r.data) ? r.data.filter((f) => f && f.id) : [];
  rbxFriendsList.sort((a, b) => String(a.displayName || a.name).toLowerCase().localeCompare(String(b.displayName || b.name).toLowerCase()));
  rbxFriendSel.clear();
  rbxRenderFriends();
  rbxThumbBatch(RBX_HEAD_URL, rbxFriendsList.map((f) => f.id), rbxHeadCache, 100).then(rbxRenderFriends);
}

async function rbxLoadOnline() {
  const box = document.querySelector('#rx-panel [data-soc-list="online"]');
  const count = document.querySelector('#rx-panel [data-soc-out="onlineCount"]');
  if (!box || rbxOnlineBusy) return;
  rbxOnlineBusy = true;
  box.textContent = "Recherche de tes amis en ligne…";
  if (count) count.textContent = "";
  const id = await rbxMyId();
  if (!id) {
    box.textContent = "Connecte-toi à Roblox.";
    rbxOnlineBusy = false;
    return;
  }
  let list = rbxFriendsList;
  if (!list.length) {
    const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/friends`);
    list = r && Array.isArray(r.data) ? r.data.filter((f) => f && f.id) : [];
  }
  const ids = list.map((f) => f.id);
  const pres = new Map();
  for (let i = 0; i < ids.length; i += 100) {
    const m = await rbxPresence(ids.slice(i, i + 100));
    m.forEach((v, k) => pres.set(k, v));
  }
  const online = list.filter((f) => {
    const p = pres.get(f.id);
    return p && p.userPresenceType >= 1;
  });
  online.sort((a, b) => {
    const pa = pres.get(a.id).userPresenceType === 2 ? 0 : 1;
    const pb = pres.get(b.id).userPresenceType === 2 ? 0 : 1;
    return pa - pb;
  });
  await rbxThumbBatch(RBX_HEAD_URL, online.map((f) => f.id), rbxHeadCache, 100);
  rbxOnlineBusy = false;
  box.textContent = "";
  if (count) count.textContent = `${online.length} ami(s) en ligne sur ${list.length}`;
  if (!online.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun ami en ligne pour l'instant."));
    return;
  }
  online.forEach((f) => {
    const p = pres.get(f.id);
    const row = sxEl("div", "rx-li");
    row.appendChild(sxImg(rbxHeadCache.get(f.id), "sx-head"));
    const name = sxEl("span", "rx-li-name");
    name.appendChild(sxEl("span", rbxState.blurName ? "sx-blur" : "", `${f.displayName || f.name} (@${f.name})`));
    row.appendChild(name);
    row.appendChild(sxEl("span", "rx-li-date", rbxPresenceText(p)));
    if (rbxPremium.active && rbxCanJoin(p)) {
      const j = sxBtn("Rejoindre", "rx-sec");
      j.addEventListener("click", () => rbxJoinPresence(p));
      row.appendChild(j);
    }
    const a = sxEl("a", "rx-sec", "Profil");
    a.href = `https://www.roblox.com/users/${f.id}/profile`;
    row.appendChild(a);
    box.appendChild(row);
  });
}

async function rbxRemoveSelected() {
  if (rbxFriendBusy) return;
  const ids = Array.from(rbxFriendSel);
  if (!ids.length) {
    rbxToast("Coche d'abord des amis");
    return;
  }
  const byId = new Map(rbxFriendsList.map((f) => [f.id, f]));
  const names = ids.slice(0, 6).map((id) => {
    const f = byId.get(id);
    return f ? f.displayName || f.name : String(id);
  });
  const sample = names.join(", ") + (ids.length > 6 ? "…" : "");
  if (ids.length >= 10) {
    const t = prompt(`Tu vas retirer ${ids.length} amis (${sample}).\nAction définitive. Tape RETIRER pour confirmer :`);
    if (t !== "RETIRER") return;
  } else if (!confirm(`Retirer ${ids.length} ami(s) : ${sample} ?\nAction définitive.`)) {
    return;
  }
  rbxFriendBusy = true;
  const btn = document.querySelector('#rx-panel [data-soc="uRemove"]');
  let ok = 0;
  let fail = 0;
  const removed = new Set();
  for (let i = 0; i < ids.length; i++) {
    if (btn) btn.textContent = `Retrait ${i + 1}/${ids.length}…`;
    const url = `https://friends.roblox.com/v1/users/${ids[i]}/unfriend`;
    let r = await rbxPostJson(url, undefined);
    if (r.status === 429) {
      await rbxSleep(5000);
      r = await rbxPostJson(url, undefined);
    }
    if (r.ok) {
      ok++;
      removed.add(ids[i]);
    } else {
      fail++;
      if (r.status === 429) break;
    }
    await rbxSleep(900);
  }
  rbxFriendBusy = false;
  rbxFriendsList = rbxFriendsList.filter((f) => !removed.has(f.id));
  removed.forEach((id) => rbxFriendSel.delete(id));
  const left = rbxBestList().filter((b) => !removed.has(b.id));
  if (left.length !== rbxBestList().length) rbxSet({ bestFriends: left });
  rbxRenderFriends();
  const skipped = ids.length - ok - fail;
  rbxToast(`${ok} ami(s) retiré(s)${fail ? ", " + fail + " échec(s)" : ""}${skipped > 0 ? ", " + skipped + " non traité(s) (limite Roblox, réessaie plus tard)" : ""}`, 5000);
}

let rbxBestToken = 0;

async function rbxRenderBest() {
  const box = document.querySelector('#rx-panel [data-soc-list="best"]');
  if (!box) return;
  const list = rbxBestList();
  const token = ++rbxBestToken;
  if (!list.length) {
    box.textContent = "";
    box.appendChild(sxEl("p", "rx-empty", "Aucun best friend. Ajoute un pseudo ci-dessus ou utilise le bouton Best friend sur le profil d'un joueur."));
    return;
  }
  const ids = list.map((b) => b.id);
  const [, pres] = await Promise.all([rbxThumbBatch(RBX_HEAD_URL, ids, rbxHeadCache, 100), rbxPresence(ids)]);
  if (token !== rbxBestToken) return;
  box.textContent = "";
  list.forEach((b) => {
    const p = pres.get(b.id);
    const row = sxEl("div", "rx-li");
    row.appendChild(sxImg(rbxHeadCache.get(b.id), "sx-head"));
    const name = sxEl("span", "rx-li-name");
    name.appendChild(sxEl("span", rbxState.blurName ? "sx-blur" : "", `${b.d || b.n} (@${b.n})`));
    row.appendChild(name);
    row.appendChild(sxEl("span", "rx-li-date", rbxPresenceText(p)));
    if (rbxPremium.active && rbxCanJoin(p)) {
      const j = sxBtn("Rejoindre", "rx-sec");
      j.addEventListener("click", () => rbxJoinPresence(p));
      row.appendChild(j);
    }
    const a = sxEl("a", "rx-sec", "Profil");
    a.href = `https://www.roblox.com/users/${b.id}/profile`;
    row.appendChild(a);
    const del = sxBtn("Retirer", "rx-sec rx-danger");
    del.addEventListener("click", () => rbxToggleBest(b.id, b.n, b.d));
    row.appendChild(del);
    box.appendChild(row);
  });
}

function rbxRenderFavManager() {
  const box = document.querySelector('#rx-panel [data-soc-list="fav"]');
  if (!box) return;
  box.textContent = "";
  const list = rbxFavList();
  if (!list.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun jeu préféré."));
    return;
  }
  list.forEach((g, i) => {
    const row = sxEl("div", "rx-li");
    row.appendChild(sxEl("span", "rx-tag", String(i + 1)));
    row.appendChild(sxEl("span", "rx-li-name", g.t || String(g.p)));
    if (i > 0) {
      const up = sxBtn("↑", "rx-sec");
      up.addEventListener("click", () => {
        const next = rbxFavList().slice();
        const tmp = next[i - 1];
        next[i - 1] = next[i];
        next[i] = tmp;
        rbxSet({ favGames: next });
      });
      row.appendChild(up);
    }
    const del = sxBtn("Retirer", "rx-sec rx-danger");
    del.addEventListener("click", () => rbxSet({ favGames: rbxFavList().filter((x) => String(x.p) !== String(g.p)) }));
    row.appendChild(del);
    box.appendChild(row);
  });
}

function rbxDataUrlToBlob(url) {
  const m = /^data:(image\/[a-z0-9.+-]+);base64,(.*)$/i.exec(String(url || ""));
  if (!m) return null;
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: m[1] });
}

// Bannière affichée en ce moment : la tienne, ou celle publiée pour le profil ouvert (js/social8.js).
let rbxBannerActive = null;

async function rbxBannerBitmap(which) {
  const ban = which || rbxBannerActive || rbxBanner;
  if (!ban || typeof ban.url !== "string") return null;
  const ts = ban.ts + "|" + ban.url.length;
  if (rbxBannerBmp.ts === ts && rbxBannerBmp.bmp) return rbxBannerBmp.bmp;
  if (rbxBannerBmp.busy) return null;
  rbxBannerBmp.busy = true;
  let bmp = null;
  try {
    const blob = rbxDataUrlToBlob(ban.url);
    bmp = blob ? await createImageBitmap(blob) : null;
  } catch (e) {
    bmp = null;
  }
  rbxBannerBmp.ts = ts;
  rbxBannerBmp.bmp = bmp;
  rbxBannerBmp.busy = false;
  return bmp;
}

function rbxDrawCover(canvas, bmp, posY, w, h, dprFixed) {
  // Jusqu'à 3x : nette sur les écrans haute densité et quand la page est zoomée.
  const dpr = dprFixed || Math.min(3, window.devicePixelRatio || 1);
  const cw = Math.max(1, Math.round(w * dpr));
  const ch = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== cw) canvas.width = cw;
  if (canvas.height !== ch) canvas.height = ch;
  const ctx = canvas.getContext("2d");
  // Lissage haute qualité : sans lui, la réduction d'une grande image donne des bords crénelés et flous.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, cw, ch);
  const scale = Math.max(cw / bmp.width, ch / bmp.height);
  const dw = bmp.width * scale;
  const dh = bmp.height * scale;
  ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) * (posY / 100), dw, dh);
}

function rbxSocBannerPreview() {
  const c = document.querySelector("#rx-panel [data-soc-banner-preview]");
  if (!c) return;
  if (!rbxBanner) {
    c.hidden = true;
    return;
  }
  rbxBannerBitmap(rbxBanner).then((bmp) => {
    if (!bmp) {
      c.hidden = true;
      return;
    }
    c.hidden = false;
    rbxDrawCover(c, bmp, rbxSocClamp(rbxState.bannerPos, 0, 100), 600, 120, 1);
  });
}

// WebP garde plus de détails que le JPEG pour un poids plus faible ; repli en JPEG si le navigateur ne sait pas l'écrire.
function rbxEncodeImage(c, quality) {
  const webp = c.toDataURL("image/webp", quality);
  return webp.indexOf("data:image/webp") === 0 ? webp : c.toDataURL("image/jpeg", quality);
}

// maxBytes : taille maximale de l'adresse data: produite ; la qualité baisse par paliers pour y tenir.
async function rbxResizeImage(file, maxW, quality, maxBytes) {
  const src = await createImageBitmap(file);
  const scale = Math.min(1, maxW / src.width);
  const w = Math.max(1, Math.round(src.width * scale));
  const h = Math.max(1, Math.round(src.height * scale));
  // Réduction faite par le navigateur en qualité « high » : bien plus nette qu'un simple drawImage.
  const bmp = scale < 1 ? await createImageBitmap(src, { resizeWidth: w, resizeHeight: h, resizeQuality: "high" }) : src;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  const limit = maxBytes || 3000000;
  let q = quality;
  let url = rbxEncodeImage(c, q);
  while (url.length > limit && q > 0.5) {
    q -= 0.08;
    url = rbxEncodeImage(c, q);
  }
  return url;
}

async function rbxJoinUser(raw, joinNow) {
  if (rbxNeedPremium()) return;
  const out = document.querySelector('#rx-panel [data-soc-out="join"]');
  const v = String(raw || "").trim().replace(/^@/, "");
  if (!v) {
    rbxToast("Entre un pseudo ou un ID");
    return;
  }
  let id = 0;
  let label = v;
  if (/^\d+$/.test(v)) {
    id = Number(v);
  } else {
    const u = await rbxResolveUser(v);
    if (u) {
      id = u.id;
      label = u.name;
    }
  }
  if (!id) {
    if (out) out.textContent = "Joueur introuvable.";
    return;
  }
  if (out) out.textContent = "Recherche…";
  const map = await rbxPresence([id]);
  const p = map.get(id);
  if (out) out.textContent = `${label} : ${rbxPresenceText(p)}`;
  if (!joinNow) return;
  if (rbxCanJoin(p)) rbxJoinPresence(p);
  else rbxToast("Impossible de le rejoindre pour l'instant");
}

function rbxTabFriends() {
  const tog = rbxFieldHtml({ key: "showFriendsBtn", type: "checkbox", label: "Bouton Amis flottant (accès rapide)" });
  return `<nav class="sx-subtabs"><button type="button" class="sx-subtab sx-active" data-soc-sub="join">Rejoindre</button><button type="button" class="sx-subtab" data-soc-sub="online">En ligne</button><button type="button" class="sx-subtab" data-soc-sub="best">Best friends</button><button type="button" class="sx-subtab" data-soc-sub="unfriend">Retirer des amis</button></nav>
<div class="sx-sub sx-active" data-soc-pane="join">
<p class="sx-lock" data-soc-lock hidden></p>
<div class="rx-group">
<div class="rx-col" data-soc-premium><span class="rx-label">Rejoindre quelqu'un en un clic</span>
<div class="rx-inline"><input type="text" placeholder="Pseudo ou ID" data-soc-in="joinUser"><button type="button" class="rx-sec" data-soc="joinGo">Rejoindre</button><button type="button" class="rx-sec" data-soc="joinInfo">Voir où il est</button></div>
<p class="rx-hint" data-soc-out="join"></p></div>
${tog}
</div>
<p class="rx-hint rx-spaced">Ça marche avec tes amis et les joueurs qui autorisent qu'on les rejoigne. C'est Roblox qui décide qui peut être rejoint.</p>
</div>
<div class="sx-sub" data-soc-pane="online">
<div class="rx-inline"><button type="button" class="rx-sec" data-soc="onRefresh">Actualiser</button></div>
<p class="rx-hint" data-soc-out="onlineCount"></p>
<div class="rx-list" data-soc-list="online"></div>
</div>
<div class="sx-sub" data-soc-pane="best">
<div class="rx-group"><div class="rx-col"><span class="rx-label">Ajouter un best friend</span>
<div class="rx-inline"><input type="text" placeholder="Pseudo Roblox" data-soc-in="bestUser"><button type="button" class="rx-sec" data-soc="bestAdd">Ajouter</button><button type="button" class="rx-sec" data-soc="bestRefresh">Actualiser les statuts</button></div></div></div>
<div class="rx-list rx-spaced" data-soc-list="best"></div>
</div>
<div class="sx-sub" data-soc-pane="unfriend">
<p class="rx-hint">Charge ta liste, filtre, coche les amis à retirer puis valide. Tes best friends ne sont pas cochés par « Tout sélectionner ». Un ami retiré doit être redemandé pour revenir.</p>
<div class="rx-inline"><button type="button" class="rx-sec" data-soc="uLoad">Charger mes amis</button><input type="text" placeholder="Filtrer par nom" data-soc-in="uFilter"></div>
<div class="rx-actions"><button type="button" class="rx-sec" data-soc="uAll">Tout sélectionner</button><button type="button" class="rx-sec" data-soc="uNone">Tout désélectionner</button><button type="button" class="rx-sec rx-danger" data-soc="uRemove">Retirer la sélection (0)</button></div>
<div class="rx-list rx-spaced" data-soc-list="friends"></div>
</div>`;
}

function rbxTabOutfits() {
  return `<p class="sx-lock" data-soc-lock hidden></p>
<p class="rx-hint">Équipe une de tes tenues enregistrées en un clic, sans ouvrir la page Avatar.</p>
<div class="rx-inline" data-soc-premium><button type="button" class="rx-sec" data-soc="oLoad">Actualiser mes tenues</button><button type="button" class="rx-sec" data-soc="oRandom">Tenue au hasard</button></div>
<div class="sx-outfits rx-spaced" data-soc-list="outfits" data-soc-premium></div>`;
}

function rbxTabSocial() {
  const f = (k, l) => rbxFieldHtml({ key: k, type: "checkbox", label: l });
  const r = (k, l, min, max, step, unit) => rbxFieldHtml({ key: k, type: "range", label: l, min, max, step, unit });
  return `<p class="sx-lock" data-soc-lock hidden></p>
<div class="rx-group"><div class="rx-col"><span class="rx-label">Sur les profils des autres joueurs</span></div>
${f("socRap", "Afficher le RAP et les limiteds")}${f("socJoin", "Bouton Rejoindre")}${f("socBestBtn", "Bouton Best friend")}${f("socNotes", "Note privée sur chaque joueur")}</div>
<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Mon profil (visible uniquement par toi)</span></div>
${f("socBanner", "Afficher ma bannière")}
<div class="rx-col" data-soc-premium><span class="rx-label">Image de la bannière</span>
<div class="rx-inline"><label class="rx-sec sx-file">Choisir une image…<input type="file" accept="image/*" data-soc-file="banner" hidden></label><button type="button" class="rx-sec rx-danger" data-soc="bannerDel">Retirer</button></div>
<canvas class="sx-prev" data-soc-banner-preview width="600" height="120" hidden></canvas>
<p class="rx-hint">Elle s'affiche en haut de ton propre profil, et seulement chez toi. L'image reste sur ton ordinateur. Les GIF restent animés (4 Mo maximum).</p></div>
${r("bannerHeight", "Hauteur de la bannière", 100, 420, 10, " px")}${r("bannerPos", "Position verticale de l'image", 0, 100, 5, "%")}${r("bannerRadius", "Arrondi des coins", 0, 30, 2, " px")}
${f("socFavGames", "Afficher mes jeux préférés")}
<div class="rx-col" data-soc-premium><span class="rx-label">Mes jeux préférés</span>
<div class="rx-inline"><input type="text" placeholder="ID du jeu" data-soc-in="favId"><button type="button" class="rx-sec" data-soc="favAdd">Ajouter</button></div>
<div class="rx-list" data-soc-list="fav"></div></div></div>`;
}

function rbxSocFillSections() {
  const map = { friends: rbxTabFriends(), outfits: rbxTabOutfits() };
  Object.keys(map).forEach((id) => {
    const sec = document.querySelector(`#rx-panel .rx-section[data-section="${id}"]`);
    if (sec) sec.innerHTML = map[id];
  });
  const sub = document.querySelector('#rx-panel .rx-sub[data-sub-section="social"]');
  if (sub) sub.innerHTML = rbxTabSocial();
}

function rbxSocUpdateLocks() {
  document.querySelectorAll("#rx-panel [data-soc-lock]").forEach((el) => {
    el.hidden = !!rbxPremium.active;
    el.textContent = "Fonction réservée au Premium. Entre ta clé dans l'onglet Premium pour la débloquer.";
  });
  document.querySelectorAll("#rx-panel [data-soc-premium]").forEach((el) => {
    el.classList.toggle("rx-locked", !rbxPremium.active);
  });
}

function rbxSocPaneActive(id) {
  return !!document.querySelector(`#rx-panel .sx-sub.sx-active[data-soc-pane="${id}"]`);
}

function rbxSocSubActive() {
  return !!document.querySelector('#rx-panel .rx-section.rx-active .rx-sub.rx-active[data-sub-section="social"]');
}

function rbxSocShowSub(btn) {
  const sec = btn.closest(".rx-section");
  if (!sec) return;
  const id = btn.dataset.socSub;
  sec.querySelectorAll(".sx-subtab").forEach((b) => b.classList.toggle("sx-active", b === btn));
  sec.querySelectorAll(".sx-sub").forEach((p) => p.classList.toggle("sx-active", p.dataset.socPane === id));
  if (id === "best") rbxRenderBest();
  if (id === "online") rbxLoadOnline();
}

function rbxSocOnSocial() {
  rbxSocUpdateLocks();
  rbxRenderFavManager();
  rbxSocBannerPreview();
}

function rbxSocOnTab(id) {
  if (id === "friends") {
    rbxSocUpdateLocks();
    if (rbxSocPaneActive("best")) rbxRenderBest();
  }
  if (id === "outfits") {
    rbxSocUpdateLocks();
    if (!rbxOutfits.length && rbxPremium.active && !rbxOutfitsLoading) rbxLoadOutfits();
  }
  if (id === "premium" && rbxSocSubActive()) rbxSocOnSocial();
}

function rbxSocOnState() {
  const ov = document.getElementById("rx-overlay");
  if (!ov || !ov.classList.contains("rx-open")) return;
  if (rbxSocSubActive()) {
    rbxRenderFavManager();
    rbxSocBannerPreview();
  }
  if (ov.querySelector('.rx-section[data-section="friends"].rx-active') && rbxSocPaneActive("best")) rbxRenderBest();
}

const rbxBuildPanelBase = rbxBuildPanel;
rbxBuildPanel = function () {
  const had = !!document.getElementById("rx-overlay");
  rbxBuildPanelBase();
  if (!had && document.getElementById("rx-overlay")) rbxSocFillSections();
};

const rbxShowTabBase = rbxShowTab;
rbxShowTab = function (id) {
  rbxShowTabBase(id);
  rbxSocOnTab(id);
};

const rbxShowSubBase = rbxShowSub;
rbxShowSub = function (id) {
  rbxShowSubBase(id);
  if (id === "social") rbxSocOnSocial();
};

const rbxApplyLocksBase = rbxApplyLocks;
rbxApplyLocks = function () {
  rbxApplyLocksBase();
  rbxSocUpdateLocks();
};

async function rbxSocAction(name) {
  const inp = (n) => document.querySelector(`#rx-panel [data-soc-in="${n}"]`);
  const val = (n) => (inp(n) ? inp(n).value : "");

  if (name === "joinGo") return rbxJoinUser(val("joinUser"), true);
  if (name === "joinInfo") return rbxJoinUser(val("joinUser"), false);

  if (name === "bestAdd") {
    const v = val("bestUser").trim().replace(/^@/, "");
    if (!v) {
      rbxToast("Entre un pseudo");
      return;
    }
    const u = await rbxResolveUser(v);
    if (!u) {
      rbxToast("Joueur introuvable");
      return;
    }
    if (rbxBestList().some((b) => b.id === u.id)) {
      rbxToast("Déjà dans tes best friends");
      return;
    }
    await rbxToggleBest(u.id, u.name, u.displayName);
    if (inp("bestUser")) inp("bestUser").value = "";
    return;
  }
  if (name === "bestRefresh") return rbxRenderBest();
  if (name === "onRefresh") return rbxLoadOnline();

  if (name === "uLoad") return rbxLoadFriends();
  if (name === "uAll") {
    const best = rbxBestIds();
    rbxVisibleFriends().forEach((f) => {
      if (!best.has(f.id)) rbxFriendSel.add(f.id);
    });
    return rbxRenderFriends();
  }
  if (name === "uNone") {
    rbxFriendSel.clear();
    return rbxRenderFriends();
  }
  if (name === "uRemove") return rbxRemoveSelected();

  if (name === "oLoad") {
    if (rbxNeedPremium()) return;
    return rbxLoadOutfits();
  }
  if (name === "oRandom") {
    if (rbxNeedPremium()) return;
    if (!rbxOutfits.length) {
      rbxToast("Charge d'abord tes tenues");
      return;
    }
    return rbxWearOutfit(rbxOutfits[Math.floor(Math.random() * rbxOutfits.length)]);
  }

  if (name === "bannerDel") {
    await rbxStoreRemove(RBX_BANNER_KEY);
    rbxToast("Bannière retirée");
    return;
  }
  if (name === "favAdd") {
    if (rbxNeedPremium()) return;
    const ok = await rbxAddFavGame(val("favId"));
    if (ok && inp("favId")) inp("favId").value = "";
  }
}

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  const sub = t.closest("[data-soc-sub]");
  if (sub && sub.closest("#rx-panel")) {
    rbxSocShowSub(sub);
    return;
  }
  const a = t.closest("[data-soc]");
  if (a && a.closest("#rx-panel")) rbxSocAction(a.dataset.soc);
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches('[data-soc-in="uFilter"]')) rbxRenderFriends();
});

document.addEventListener("change", async (e) => {
  const t = e.target;
  if (!t || !t.matches || !t.matches('[data-soc-file="banner"]')) return;
  const file = t.files && t.files[0];
  t.value = "";
  if (!file || rbxNeedPremium()) return;
  if (!/^image\//.test(file.type)) {
    rbxToast("Choisis un fichier image");
    return;
  }
  try {
    let url;
    if (file.type === "image/gif") {
      // GIF gardé tel quel pour rester animé ; 4 Mo maximum (taille acceptée par le serveur des bannières).
      if (file.size > 4 * 1024 * 1024) {
        rbxToast("GIF trop lourd : 4 Mo maximum", 5000);
        return;
      }
      url = await new Promise((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(String(fr.result));
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    } else {
      url = await rbxResizeImage(file, 2560, 0.92);
    }
    await rbxStoreSet({ [RBX_BANNER_KEY]: { url, ts: Date.now() } });
    rbxToast(file.type === "image/gif" ? "Bannière GIF animée enregistrée" : "Bannière enregistrée");
  } catch (err) {
    rbxToast("Image illisible");
  }
});

document.addEventListener("keydown", (e) => {
  if (!rbxState.enableShortcuts || !e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  if (e.key.toLowerCase() !== "z") return;
  e.preventDefault();
  const next = !rbxState.focusMode;
  rbxSet({ focusMode: next });
  rbxToast(next ? "Mode focus activé" : "Mode focus désactivé");
});

function rbxSocRapCard(id) {
  const card = sxEl("div", "sx-card");
  card.appendChild(sxEl("strong", "sx-title", "RAP et limiteds"));
  const body = sxEl("div", "sx-body", "Calcul en cours…");
  card.appendChild(body);
  rbxFetchRap(id, (n) => {
    if (body.isConnected) body.textContent = `Calcul en cours… ${n} objets lus`;
  }).then((r) => {
    if (!body.isConnected) return;
    body.textContent = "";
    if (r.priv) {
      body.textContent = "Inventaire privé : impossible de calculer le RAP.";
      return;
    }
    const grid = sxEl("div", "sx-grid");
    grid.appendChild(sxItem("RAP total", `${rbxNum(r.rap)} Robux`));
    grid.appendChild(sxItem("Limiteds", rbxNum(r.count)));
    if (r.top.length) {
      grid.appendChild(sxItem("Objets les plus chers", r.top.map((x) => `${x.n} (${rbxNum(x.v)})`).join(" · "), true));
    }
    body.appendChild(grid);
    if (r.truncated) body.appendChild(sxEl("p", "sx-note", "Inventaire très grand : valeur partielle."));
  });
  return card;
}

function rbxSocNoteCard(id) {
  const card = sxEl("div", "sx-card");
  card.appendChild(sxEl("strong", "sx-title", "Note privée"));
  card.appendChild(sxEl("p", "sx-note", "Visible uniquement par toi, enregistrée sur cet ordinateur"));
  const ta = document.createElement("textarea");
  ta.className = "sx-note-area";
  ta.maxLength = 500;
  ta.placeholder = "Écris une note sur ce joueur…";
  const notes = rbxState.userNotes || {};
  ta.value = notes[id] ? notes[id].t : "";
  let timer = 0;
  ta.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      const all = { ...(rbxState.userNotes || {}) };
      const t = ta.value.trim();
      if (t) all[id] = { t: t.slice(0, 500), ts: Date.now() };
      else delete all[id];
      const keys = Object.keys(all).sort((a, b) => all[b].ts - all[a].ts).slice(0, 300);
      const out = {};
      keys.forEach((k) => {
        out[k] = all[k];
      });
      rbxSet({ userNotes: out });
    }, 500);
  });
  card.appendChild(ta);
  return card;
}

function rbxSocOtherProfile(box, page) {
  const s = rbxState;
  if (!s.socBestBtn && !s.socJoin && !s.socRap && !s.socNotes) return false;
  const id = Number(page.id);

  if (s.socBestBtn || s.socJoin) {
    const row = sxEl("div", "sx-row");
    box.appendChild(row);

    if (s.socBestBtn) {
      const entry = rbxBestList().find((b) => b.id === id);
      const days = entry && entry.t ? Math.floor((Date.now() - entry.t) / 86400000) : -1;
      const since = days < 0 ? "" : days === 0 ? " depuis aujourd'hui" : ` depuis ${days} jour${days > 1 ? "s" : ""}`;
      const b = sxBtn(entry ? `★ Best friend${since}` : "Ajouter en best friend");
      b.addEventListener("click", async () => {
        const info = await rbxUserInfo(String(id));
        const u = info && info.user;
        rbxToggleBest(id, u ? u.name : "", u ? u.displayName : "");
      });
      row.appendChild(b);
    }

    if (s.socJoin) {
      const status = sxEl("span", "sx-status", "Statut…");
      const join = sxBtn("Rejoindre", "sx-btn sx-green");
      join.hidden = true;
      const refresh = sxBtn("Actualiser le statut");
      let cur = null;
      const load = async () => {
        status.textContent = "Statut…";
        join.hidden = true;
        const map = await rbxPresence([id]);
        if (!box.isConnected) return;
        cur = map.get(id) || null;
        const seen = cur && cur.userPresenceType === 0 && cur.lastOnline ? " · vu " + rbxAgo(cur.lastOnline) : "";
        status.textContent = rbxPresenceText(cur) + seen;
        join.hidden = !rbxCanJoin(cur);
      };
      join.addEventListener("click", () => rbxJoinPresence(cur));
      refresh.addEventListener("click", load);
      row.appendChild(join);
      row.appendChild(refresh);
      row.appendChild(status);
      load();
    }
  }

  if (s.socRap) box.appendChild(rbxSocRapCard(id));
  if (s.socNotes) box.appendChild(rbxSocNoteCard(id));
  return true;
}

function rbxSocRender() {
  const s = rbxState;
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  const existing = document.getElementById("rx-soc");
  if (!s.enabled || !mount || !page || (page.k !== "user" && page.k !== "game")) {
    if (existing) existing.remove();
    return;
  }
  const me = rbxMe;
  const sig = [
    location.pathname,
    me ? me.id : 0,
    rbxPremium.active ? 1 : 0,
    s.socJoin,
    s.socRap,
    s.socBestBtn,
    s.socNotes,
    s.socFavGames,
    s.quickJoin,
    rbxBestList().map((b) => b.id).join(","),
    rbxFavList().map((g) => g.p).join(",")
  ].join("|");
  if (existing && existing.dataset.sig === sig && mount.contains(existing)) return;
  if (existing) existing.remove();

  const box = sxEl("div", "");
  box.id = "rx-soc";
  box.dataset.sig = sig;
  let filled = false;
  if (page.k === "user" && me) {
    filled = String(me.id) === page.id ? false : rbxSocOtherProfile(box, page);
  }
  if (!filled) return;
  const bar = document.getElementById("rx-bar");
  if (bar && bar.parentElement === mount) bar.insertAdjacentElement("afterend", box);
  else mount.insertBefore(box, mount.firstChild);
}

function rbxSocBannerEl() {
  const s = rbxState;
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-banner");
  const me = rbxMe;
  const has = rbxBanner && typeof rbxBanner.url === "string" && rbxBanner.url.indexOf("data:image/") === 0;
  const want = s.enabled && s.socBanner && has && page && page.k === "user" && me && String(me.id) === page.id && mount;
  if (!want) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = sxEl("div", "");
    el.id = "rx-banner";
    el.appendChild(document.createElement("canvas"));
  }
  el.style.height = rbxSocClamp(s.bannerHeight, 100, 420) + "px";
  el.style.borderRadius = rbxSocClamp(s.bannerRadius, 0, 30) + "px";
  if (mount.firstChild !== el) mount.insertBefore(el, mount.firstChild);
  const canvas = el.firstChild;
  const pos = rbxSocClamp(s.bannerPos, 0, 100);
  rbxBannerBitmap().then((bmp) => {
    if (!bmp || !el.isConnected || !rbxBanner) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    const sig = [rbxBanner.ts, w, h, pos].join("|");
    if (canvas.dataset.sig === sig) return;
    canvas.dataset.sig = sig;
    rbxDrawCover(canvas, bmp, pos, w, h);
  });
}

function rbxSocDock() {
  const dock = document.getElementById("rx-dock");
  if (!dock) return;
  const gear = document.getElementById("rx-gear");

  let b = document.getElementById("rx-friends");
  const want = rbxState.enabled && rbxState.showFriendsBtn;
  if (!want) {
    if (b) b.remove();
  } else if (!b) {
    b = sxBtn("", "");
    b.id = "rx-friends";
    b.title = "Amis et best friends";
    b.addEventListener("click", () => rbxOpenPanel("friends"));
    dock.insertBefore(b, gear);
  }

  const page = rbxPageInfo(location.pathname);
  let q = document.getElementById("rx-quick-join");
  const wantQ = rbxState.enabled && rbxState.quickJoin && page && page.k === "game";
  if (!wantQ) {
    if (q) q.remove();
  } else if (!q) {
    q = sxBtn("", "");
    q.id = "rx-quick-join";
    q.title = "Rejoindre ce jeu rapidement";
    q.addEventListener("click", () => rbxQuickJoin());
    dock.insertBefore(q, gear);
  }
}

function rbxScrubAttr(el, attr, on) {
  const key = "rxO" + attr.replace(/-/g, "");
  if (on) {
    const v = el.getAttribute(attr);
    if (v) {
      el.dataset[key] = v;
      el.setAttribute(attr, "");
    }
  } else if (el.dataset[key] !== undefined) {
    el.setAttribute(attr, el.dataset[key]);
    delete el.dataset[key];
  }
}

function rbxSocScrub() {
  if (!rbxDomChanged("scrub")) return;
  const on = rbxState.enabled && rbxState.blurName;
  if (on) {
    document.querySelectorAll('a[href*="/users/"]').forEach((a) => {
      if (a.closest("#rx-panel, #rx-toast")) return;
      const m = /\/users\/(\d+)/.exec(a.getAttribute("href") || "");
      if (!m || !rbxBlurTarget(m[1])) return;
      rbxScrubAttr(a, "title", true);
      rbxScrubAttr(a, "aria-label", true);
      a.querySelectorAll("img").forEach((i) => {
        rbxScrubAttr(i, "alt", true);
        rbxScrubAttr(i, "title", true);
      });
    });
    return;
  }
  document.querySelectorAll("[data-rx-otitle], [data-rx-oarialabel], [data-rx-oalt]").forEach((el) => {
    rbxScrubAttr(el, "title", false);
    rbxScrubAttr(el, "aria-label", false);
    rbxScrubAttr(el, "alt", false);
  });
}

function rbxSocAddFriends() {
  const on = rbxState.enabled && rbxState.hideAddFriends;
  if (!on) {
    document.querySelectorAll(".rx-hide-af").forEach((n) => n.classList.remove("rx-hide-af"));
    return;
  }
  const now = Date.now();
  if (now - rbxAddAt < 1000 || !rbxDomChanged("addfr")) return;
  rbxAddAt = now;
  if (!document.body) return;
  const hits = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.nodeValue;
      if (!t || t.length > 60) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || p.closest("#rx-panel, #rx-toast, script, style, textarea, input, select")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let node;
  while ((node = walker.nextNode())) {
    const t = node.nodeValue.replace(/\s+/g, " ").trim().toLowerCase();
    if (RBX_ADD_FRIENDS_TXT.indexOf(t) === -1) continue;
    let target = node.parentElement;
    for (let i = 0; i < 4; i++) {
      const p = target.parentElement;
      if (!p || p === document.body) break;
      if ((p.textContent || "").replace(/\s+/g, " ").trim().length > 40) break;
      if (p.querySelectorAll("img").length > 1) break;
      target = p;
    }
    hits.add(target);
  }
  document.querySelectorAll(".rx-hide-af").forEach((n) => {
    if (!hits.has(n)) n.classList.remove("rx-hide-af");
  });
  hits.forEach((n) => n.classList.add("rx-hide-af"));
}

function rbxSocWatch() {
  if (rbxNameObsOn || !document.body) return;
  rbxNameObsOn = true;
  new MutationObserver(() => {
    const s = rbxState;
    if (!s.enabled || (!s.blurName && !s.hideAddFriends)) return;
    if (rbxNameObsTimer) return;
    rbxNameObsTimer = setTimeout(() => {
      rbxNameObsTimer = 0;
      rbxNamesAt = 0;
      rbxAddAt = 0;
      rbxMarkNames();
      rbxSocScrub();
      rbxSocAddFriends();
    }, 250);
  }).observe(document.body, { childList: true, subtree: true });
}

function rbxSocTick() {
  if (!document.body) return;
  if (!rbxMe && Date.now() - rbxMeTry > 10000) {
    rbxMeTry = Date.now();
    rbxCurrentUser();
  }
  rbxSocWatch();
  rbxSocDock();
  rbxSocBannerEl();
  rbxSocRender();
  rbxSocScrub();
  rbxSocAddFriends();
}

rbxEvery(rbxSocTick, 800);
rbxOnChange(rbxSocStyleRefresh);
rbxOnChange(rbxSocTick);
rbxOnChange(rbxSocOnState);