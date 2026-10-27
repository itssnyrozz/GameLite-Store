const RBX_PUBLIC_KEY = {"kty":"EC","crv":"P-256","x":"rPj1QjcpA_5ZkT6cJoZVkO7tFP0Ua0b5erCIwF7zKoU","y":"gx2kcdVVVev2AsY056Hsblwir6FGL79bDLtxAFkSSNE","ext":true,"key_ops":["verify"]};

const RBX_KEY = "rbxCustomizerSettings";
const RBX_LIC_KEY = "rbxCustomizerLicense";
const RBX_ADMIN_KEY = "rbxCustomizerAdminKey";
const RBX_ISSUED_KEY = "rbxCustomizerIssued";
const RBX_PREVIEW_KEY = "rbxCustomizerPreviewFree";

const RBX_ALG = { name: "ECDSA", namedCurve: "P-256" };
const RBX_SIGN = { name: "ECDSA", hash: "SHA-256" };

const RBX_DEFAULTS = {
  enabled: true,
  theme: "custom",
  forceNative: true,
  useBgColor: false,
  bgColor: "#121212",
  cardColor: "",
  textColor: "",
  accent: "",
  accentAuto: true,
  bgImage: "",
  bgGradient: "",
  gradEnabled: false,
  gradA: "#1e1b4b",
  gradB: "#7c3aed",
  gradAngle: 135,
  glassIntensity: 50,
  glassCards: false,
  glassNav: false,
  glassButtons: false,
  glassPanel: false,
  neonGlow: false,
  accentBorders: false,
  font: "",
  fontSize: 100,
  customScroll: false,
  smoothScroll: false,
  noAnimations: false,
  hideChat: false,
  hideAds: false,
  hideSidebar: false,
  hideFooter: false,
  hideFriendsRow: false,
  hidePremiumBtn: false,
  blurRobux: false,
  blurName: false,
  customCss: "",
  showFab: true,
  showScrollTop: true,
  showCopyButtons: true,
  showProfileInfo: true,
  infoUsername: true,
  infoId: true,
  infoAge: true,
  infoFriends: true,
  infoFollowers: true,
  infoFollowing: true,
  infoStatus: true,
  infoGroups: true,
  infoInventory: true,
  showGameStats: true,
  showGameExtra: true,
  showServerBrowser: true,
  serverPages: 1,
  serverShow: 25,
  serverMinPlayers: 0,
  rememberServers: true,
  quickJoin: true,
  lastServers: {},
  showUsernameHistory: true,
  showItemInfo: true,
  showItemExtra: true,
  showGroupInfo: true,
  showRobuxConvert: true,
  robuxRate: 0.0125,
  currency: "€",
  showDevex: true,
  devexRate: 0.0038,
  usdToEur: 0.86,
  trackPlaytime: true,
  dailyLimit: 0,
  limitNotified: "",
  breakReminder: 0,
  autoTheme: false,
  dayTheme: "robloxlight",
  nightTheme: "robloxdark",
  dayStart: 7,
  nightStart: 20,
  autoPeriod: "",
  enableShortcuts: true,
  openNewTab: false,
  quickLinks: "",
  playtime: {}
};

const RBX_PREMIUM_OFF = {
  bgGradient: "",
  gradEnabled: false,
  neonGlow: false,
  accentBorders: false,
  autoTheme: false,
  glassCards: false,
  glassNav: false,
  glassButtons: false,
  glassPanel: false,
  showServerBrowser: false,
  quickJoin: false,
  rememberServers: false,
  showGameExtra: false,
  showItemExtra: false,
  showUsernameHistory: false,
  showDevex: false,
  dailyLimit: 0,
  breakReminder: 0,
  enableShortcuts: false,
  openNewTab: false,
  quickLinks: ""
};

const RBX_LOCK_ONLY = [
  "gradA", "gradB", "gradAngle", "glassIntensity", "dayTheme", "nightTheme", "dayStart", "nightStart",
  "devexRate", "usdToEur", "serverPages", "serverShow", "serverMinPlayers"
];

function rbxIsLockedKey(k) {
  return Object.prototype.hasOwnProperty.call(RBX_PREMIUM_OFF, k) || RBX_LOCK_ONLY.includes(k);
}

const RBX_THEMES = {
  robloxdark: { label: "Roblox Sombre", bgColor: "#121214", cardColor: "#232527", textColor: "#f7f7f8", accent: "#335fff" },
  robloxlight: { label: "Roblox Clair", bgColor: "#f2f4f5", cardColor: "#ffffff", textColor: "#393b3d", accent: "#335fff" },
  amoled: { label: "AMOLED", bgColor: "#000000", cardColor: "#0d0d0d", textColor: "#ffffff", accent: "#00a2ff" },
  sombre: { label: "Sombre", bgColor: "#121212", cardColor: "#1e1e1e", textColor: "#eeeeee", accent: "#3b82f6" },
  minuit: { label: "Minuit", bgColor: "#0b1020", cardColor: "#141b34", textColor: "#e6ebff", accent: "#6366f1" },
  nord: { label: "Nord", bgColor: "#2e3440", cardColor: "#3b4252", textColor: "#eceff4", accent: "#88c0d0" },
  dracula: { label: "Dracula", bgColor: "#282a36", cardColor: "#343746", textColor: "#f8f8f2", accent: "#bd93f9" },
  ocean: { label: "Océan", bgColor: "#06202b", cardColor: "#0b3345", textColor: "#e0f7ff", accent: "#00bcd4" },
  violet: { label: "Violet néon", bgColor: "#140021", cardColor: "#240038", textColor: "#f5e6ff", accent: "#d946ef" },
  sunset: { label: "Coucher de soleil", bgColor: "#2b1330", cardColor: "#40203f", textColor: "#ffe8d6", accent: "#ff7a45" },
  rose: { label: "Rose bonbon", bgColor: "#2a0f1d", cardColor: "#3d1829", textColor: "#ffe4ef", accent: "#ff4d8d" },
  foret: { label: "Forêt", bgColor: "#0f1f14", cardColor: "#18301f", textColor: "#e5f5e8", accent: "#22c55e" },
  rouge: { label: "Rouge sang", bgColor: "#1a0707", cardColor: "#2b0d0d", textColor: "#ffe5e5", accent: "#ef4444" },
  hacker: { label: "Hacker", bgColor: "#000000", cardColor: "#0a140a", textColor: "#33ff66", accent: "#00ff41" },
  cafe: { label: "Café", bgColor: "#1f1610", cardColor: "#2e2218", textColor: "#f3e6d8", accent: "#d97706" },
  clair: { label: "Clair", bgColor: "#f3f4f6", cardColor: "#ffffff", textColor: "#1f2937", accent: "#2563eb" },
  menthe: { label: "Menthe", bgColor: "#e8f7f1", cardColor: "#ffffff", textColor: "#16382d", accent: "#10b981" },
  sakura: { label: "Sakura", bgColor: "#fff1f5", cardColor: "#ffffff", textColor: "#4a1d2e", accent: "#ec4899" }
};

const RBX_PREMIUM_THEMES = {
  aurore: { label: "Aurore", bgColor: "#0b1b2b", cardColor: "#10283d", textColor: "#e6fff7", accent: "#2dd4bf", gradient: "linear-gradient(135deg, #0b1b2b 0%, #134e4a 50%, #4c1d95 100%)" },
  cyberpunk: { label: "Cyberpunk", bgColor: "#0d0221", cardColor: "#1a0b3b", textColor: "#f0e6ff", accent: "#ff2a6d", gradient: "linear-gradient(135deg, #0d0221 0%, #261447 55%, #5c1038 100%)" },
  lave: { label: "Lave", bgColor: "#1a0500", cardColor: "#2b0a04", textColor: "#fff0e6", accent: "#ff5722", gradient: "linear-gradient(160deg, #1a0500 0%, #4a1305 55%, #7c2d12 100%)" },
  glace: { label: "Glace", bgColor: "#e8f4fb", cardColor: "#ffffff", textColor: "#0f2a3a", accent: "#0ea5e9", gradient: "linear-gradient(135deg, #e8f4fb 0%, #c7e6f7 55%, #e0e7ff 100%)" },
  royal: { label: "Or royal", bgColor: "#14110a", cardColor: "#211c10", textColor: "#fff6d6", accent: "#facc15", gradient: "linear-gradient(135deg, #14110a 0%, #2c230b 60%, #3a2f0b 100%)" },
  galaxie: { label: "Galaxie", bgColor: "#050816", cardColor: "#0f1330", textColor: "#e8eaff", accent: "#8b5cf6", gradient: "linear-gradient(135deg, #050816 0%, #1e1b4b 55%, #581c87 100%)" },
  vaporwave: { label: "Vaporwave", bgColor: "#1a0b2e", cardColor: "#2a1247", textColor: "#ffe6fb", accent: "#00f5d4", gradient: "linear-gradient(135deg, #1a0b2e 0%, #4a1a7a 55%, #8e1f8a 100%)" },
  matrix: { label: "Matrix", bgColor: "#000000", cardColor: "#04110a", textColor: "#b6ffcb", accent: "#22ff6a", gradient: "linear-gradient(180deg, #000000 0%, #022c14 100%)" },
  abysses: { label: "Abysses", bgColor: "#02131f", cardColor: "#06263a", textColor: "#d7f1ff", accent: "#38bdf8", gradient: "linear-gradient(180deg, #02131f 0%, #0c4a6e 100%)" },
  cerise: { label: "Cerise", bgColor: "#240312", cardColor: "#3a0a1f", textColor: "#ffe0ea", accent: "#fb7185", gradient: "linear-gradient(135deg, #240312 0%, #5c1230 55%, #7f1d3a 100%)" },
  printemps: { label: "Printemps", bgColor: "#effaf0", cardColor: "#ffffff", textColor: "#14301c", accent: "#16a34a", gradient: "linear-gradient(135deg, #effaf0 0%, #fef9c3 55%, #dcfce7 100%)" },
  crepuscule: { label: "Crépuscule", bgColor: "#1e1b4b", cardColor: "#312e81", textColor: "#eef2ff", accent: "#fb923c", gradient: "linear-gradient(180deg, #1e1b4b 0%, #4c1d95 55%, #9a3412 100%)" }
};

const RBX_ALL_THEMES = { ...RBX_THEMES, ...RBX_PREMIUM_THEMES };

let rbxSaved = { ...RBX_DEFAULTS };
let rbxState = { ...RBX_DEFAULTS };
let rbxPremium = { active: false };
let rbxAdmin = false;
let rbxReady = false;
let rbxToastTimer = 0;
let rbxSaveTimer = 0;
let rbxLastWrite = 0;
let rbxMe = null;
const rbxListeners = [];

function rbxOnChange(fn) {
  // Plusieurs fichiers enregistrent la même fonction : une seule fois suffit.
  if (rbxListeners.indexOf(fn) === -1) rbxListeners.push(fn);
}

function rbxNotify() {
  rbxListeners.forEach((fn) => fn(rbxState));
}

function rbxEffective(saved) {
  // Toujours une copie : les modules qui ajustent l'état ne doivent jamais modifier les réglages enregistrés.
  if (rbxPremium.active) return { ...saved };
  const out = { ...saved, ...RBX_PREMIUM_OFF };
  if (RBX_PREMIUM_THEMES[saved.theme]) {
    out.useBgColor = false;
    out.cardColor = "";
    out.textColor = "";
    out.accent = "";
  }
  return out;
}

function rbxSave() {
  clearTimeout(rbxSaveTimer);
  rbxSaveTimer = 0;
  rbxLastWrite = Date.now();
  chrome.storage.local.set({ [RBX_KEY]: rbxSaved });
}

function rbxSet(patch) {
  if (!rbxReady) return;
  rbxSaved = { ...rbxSaved, ...patch };
  rbxState = rbxEffective(rbxSaved);
  rbxLastWrite = Date.now();
  clearTimeout(rbxSaveTimer);
  rbxSaveTimer = setTimeout(rbxSave, 150);
  rbxNotify();
}

window.addEventListener("pagehide", () => {
  if (rbxSaveTimer) rbxSave();
});

function rbxToast(msg, ms) {
  if (!document.body) return;
  let t = document.getElementById("rx-toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "rx-toast";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add("rx-show");
  clearTimeout(rbxToastTimer);
  rbxToastTimer = setTimeout(() => t.classList.remove("rx-show"), ms || 2200);
}

function rbxStoreGet(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.get(keys, (res) => resolve(res || {}));
  });
}

function rbxStoreSet(obj) {
  return new Promise((resolve) => {
    chrome.storage.local.set(obj, () => resolve());
  });
}

function rbxStoreRemove(keys) {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => resolve());
  });
}

function rbxBgFetch(url, retried) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "fetchJson", url }, (res) => {
      if (chrome.runtime.lastError || !res) return resolve(null);
      if (res.status === 429 && !retried) {
        setTimeout(() => rbxBgFetch(url, true).then(resolve), 1500);
        return;
      }
      resolve(res.ok ? res.data : null);
    });
  });
}

function rbxClip(text) {
  const fallback = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;left:-9999px;top:0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (e) {
      ok = false;
    }
    ta.remove();
    return ok;
  };
  const p = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text).then(() => true, fallback) : Promise.resolve(fallback());
  return p.then((ok) => {
    if (!ok) rbxToast("Impossible de copier : sélectionne le texte et fais Ctrl+C");
    return ok;
  });
}

const rbxTasks = [];

function rbxEvery(fn, ms) {
  rbxTasks.push({ fn, ms, at: 0 });
}

// Pendant un défilement, les passages qui lisent la mise en page feraient saccader l'écran : on attend la fin.
let rbxScrollAt = 0;
window.addEventListener(
  "scroll",
  () => {
    rbxScrollAt = Date.now();
  },
  { passive: true, capture: true }
);

function rbxRunTasks() {
  if (document.hidden) return;
  const now = Date.now();
  if (now - rbxScrollAt < 250) return;
  rbxTasks.forEach((t) => {
    if (now - t.at < t.ms) return;
    t.at = now;
    try {
      t.fn();
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
}

// Toutes les 250 ms, mais seulement quand le navigateur a un moment libre (au plus tard 1 s après).
function rbxPump() {
  try {
    rbxRunTasks();
  } finally {
    setTimeout(() => {
      if (typeof requestIdleCallback === "function") requestIdleCallback(rbxPump, { timeout: 1000 });
      else rbxPump();
    }, 250);
  }
}
rbxPump();
document.addEventListener("visibilitychange", rbxRunTasks);

// Compteur de changements de la page : les passages qui parcourent tout le DOM
// sautent leur tour quand rien n'a bougé (ni la page, ni les réglages).
let rbxDomGen = 1;
let rbxDomObs = null;
const rbxDomSeen = {};

function rbxDomWatch() {
  if (rbxDomObs || !document.body) return;
  rbxDomObs = new MutationObserver(() => {
    rbxDomGen++;
  });
  rbxDomObs.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function rbxDomChanged(key, maxAge = 5000) {
  rbxDomWatch();
  const now = Date.now();
  const m = rbxDomSeen[key];
  if (m && m.gen === rbxDomGen && m.state === rbxState && now - m.at < maxAge) return false;
  rbxDomSeen[key] = { gen: rbxDomGen, state: rbxState, at: now };
  return true;
}

window.addEventListener("resize", () => {
  rbxDomGen++;
});

// Les sélecteurs [class*="x" i] de notre CSS obligent le navigateur à revérifier toute la page
// à chaque changement de classe (10 ms pour 50 cartes au lieu de 0,1 ms). On les remplace par une
// classe .rx-kN, posée ici sur les éléments concernés avant l'affichage : même rendu, sans ce coût.
const rbxKeys = [];
let rbxKeyAll = "";
let rbxKeyObs = null;

function rbxKeyMark(el) {
  const raw = el.getAttribute("class");
  if (!raw) return;
  const own = raw.indexOf("rx-k") === -1 ? raw : raw.replace(/(^|\s)rx-k\d+(?=\s|$)/g, "");
  const low = own.toLowerCase();
  for (const k of rbxKeys) {
    const want = (k.i ? low : own).indexOf(k.v) !== -1;
    if (want !== el.classList.contains(k.cls)) el.classList.toggle(k.cls, want);
  }
}

function rbxKeyScan(root) {
  if (root.nodeType !== 1) return;
  rbxKeyMark(root);
  root.querySelectorAll(rbxKeyAll).forEach(rbxKeyMark);
}

function rbxKeyWatch() {
  if (rbxKeyObs) return;
  rbxKeyObs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "attributes") rbxKeyMark(m.target);
      else m.addedNodes.forEach(rbxKeyScan);
    }
    // Nos propres classes ne doivent pas relancer un passage.
    rbxKeyObs.takeRecords();
  });
  rbxKeyObs.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
}

function rbxKeyCss(css) {
  const before = rbxKeys.length;
  const out = css.replace(/\[class\*=(["'])([^"'\]]+)\1(\s+i)?\]/g, (m, q, v, i) => {
    const ci = !!i;
    const val = ci ? v.toLowerCase() : v;
    let k = rbxKeys.find((x) => x.v === val && x.i === ci);
    if (!k) {
      k = { v: val, i: ci, cls: "rx-k" + rbxKeys.length, sel: `[class*="${v}"${ci ? " i" : ""}]` };
      rbxKeys.push(k);
    }
    return "." + k.cls;
  });
  if (rbxKeys.length !== before) {
    rbxKeyAll = rbxKeys.map((k) => k.sel).join(", ");
    rbxKeyWatch();
    rbxKeyScan(document.documentElement);
  }
  return out;
}

// Tout notre CSS généré passe par ici : réécriture des sélecteurs, et rien n'est touché s'il n'a pas changé.
function rbxSetCss(style, css) {
  css = rbxKeyCss(css);
  if (style.textContent !== css) style.textContent = css;
}

function rbxBytesToB64u(bytes) {
  let s = "";
  bytes.forEach((b) => {
    s += String.fromCharCode(b);
  });
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function rbxB64uToBytes(str) {
  const pad = "=".repeat((4 - (str.length % 4)) % 4);
  const bin = atob(str.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function rbxRandHex(n) {
  const b = crypto.getRandomValues(new Uint8Array(n));
  return Array.from(b).map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function rbxCurrentUser() {
  if (rbxMe) return rbxMe;
  const m = document.querySelector('meta[name="user-data"]');
  const id = m ? Number(m.getAttribute("data-userid")) : 0;
  if (id) {
    rbxMe = { id, name: m.getAttribute("data-name") || "" };
    return rbxMe;
  }
  const d = await rbxBgFetch("https://users.roblox.com/v1/users/authenticated");
  if (d && d.id) {
    rbxMe = { id: Number(d.id), name: d.name || "" };
    return rbxMe;
  }
  return null;
}

function rbxPublicFromPrivate(priv) {
  return { kty: "EC", crv: "P-256", x: priv.x, y: priv.y, ext: true, key_ops: ["verify"] };
}

async function rbxCheckAdmin(priv) {
  if (!priv || !RBX_PUBLIC_KEY) return false;
  try {
    const pk = await crypto.subtle.importKey("jwk", priv, RBX_ALG, false, ["sign"]);
    const pub = await crypto.subtle.importKey("jwk", RBX_PUBLIC_KEY, RBX_ALG, false, ["verify"]);
    const data = crypto.getRandomValues(new Uint8Array(16));
    const sig = await crypto.subtle.sign(RBX_SIGN, pk, data);
    return await crypto.subtle.verify(RBX_SIGN, pub, sig, data);
  } catch (e) {
    return false;
  }
}

async function rbxVerifyLicense(str, checkUid) {
  if (!RBX_PUBLIC_KEY) return { ok: false, error: "Aucune clé publique n'est configurée dans l'extension" };
  const parts = String(str || "").trim().split(".");
  if (parts.length !== 3 || parts[0] !== "RBXC1") return { ok: false, error: "Format de clé invalide" };
  let valid = false;
  try {
    const pub = await crypto.subtle.importKey("jwk", RBX_PUBLIC_KEY, RBX_ALG, false, ["verify"]);
    valid = await crypto.subtle.verify(RBX_SIGN, pub, rbxB64uToBytes(parts[2]), new TextEncoder().encode(parts[0] + "." + parts[1]));
  } catch (e) {
    valid = false;
  }
  if (!valid) return { ok: false, error: "Clé invalide" };
  let info = null;
  try {
    info = JSON.parse(new TextDecoder().decode(rbxB64uToBytes(parts[1])));
  } catch (e) {
    return { ok: false, error: "Clé illisible" };
  }
  if (!info || info.v !== 1) return { ok: false, error: "Version de clé non reconnue" };
  if (info.exp && Date.now() > info.exp) return { ok: false, error: "Clé expirée", info };
  if (checkUid && info.uid) {
    const me = await rbxCurrentUser();
    if (!me) return { ok: false, error: "Connecte-toi à Roblox pour activer cette clé", info };
    if (me.id !== info.uid) return { ok: false, error: "Cette clé est liée à un autre compte Roblox", info };
  }
  return { ok: true, info };
}

async function rbxComputePremium() {
  const store = await rbxStoreGet([RBX_LIC_KEY, RBX_ADMIN_KEY, RBX_PREVIEW_KEY]);
  const admin = await rbxCheckAdmin(store[RBX_ADMIN_KEY]);
  if (admin && !store[RBX_PREVIEW_KEY]) return { admin, premium: { active: true, source: "admin" } };
  const lic = store[RBX_LIC_KEY];
  if (lic) {
    const r = await rbxVerifyLicense(lic, false);
    if (r.ok && !r.info.t) return { admin, premium: { active: true, source: "license", info: r.info } };
    return { admin, premium: { active: false, error: r.error } };
  }
  return { admin, premium: { active: false } };
}

async function rbxEnforceBinding() {
  const p = rbxPremium;
  if (!p.active || p.source !== "license" || !p.info || !p.info.uid) return;
  const me = await rbxCurrentUser();
  if (!me || me.id === p.info.uid || rbxPremium !== p) return;
  rbxPremium = { active: false, error: "Cette clé est liée à un autre compte Roblox" };
  rbxState = rbxEffective(rbxSaved);
  rbxNotify();
  if (typeof rbxPanelRefresh === "function") rbxPanelRefresh();
}

async function rbxRefreshPremium() {
  let prem;
  try {
    prem = await rbxComputePremium();
  } catch (e) {
    prem = { admin: false, premium: { active: false } };
  }
  rbxAdmin = prem.admin;
  rbxPremium = prem.premium;
  rbxState = rbxEffective(rbxSaved);
  rbxNotify();
  if (typeof rbxPanelRefresh === "function") rbxPanelRefresh();
  rbxEnforceBinding();
}

async function rbxActivateLicense(str) {
  const r = await rbxVerifyLicense(str, true);
  if (!r.ok) return r;
  if (r.info.t) return { ok: false, error: "Cette clé n'est pas une clé Premium" };
  await rbxStoreSet({ [RBX_LIC_KEY]: String(str).trim() });
  await rbxRefreshPremium();
  return r;
}

async function rbxRemoveLicense() {
  await rbxStoreRemove(RBX_LIC_KEY);
  await rbxRefreshPremium();
}

async function rbxGenerateAdminKeys() {
  const pair = await crypto.subtle.generateKey(RBX_ALG, true, ["sign", "verify"]);
  const priv = await crypto.subtle.exportKey("jwk", pair.privateKey);
  await rbxStoreSet({ [RBX_ADMIN_KEY]: priv });
  return rbxPublicFromPrivate(priv);
}

async function rbxImportAdminKey(obj) {
  if (!obj || obj.kty !== "EC" || !obj.d || !obj.x || !obj.y) return { ok: false, error: "Clé privée invalide" };
  if (RBX_PUBLIC_KEY && !(await rbxCheckAdmin(obj))) {
    return { ok: false, error: "Cette clé ne correspond pas à la clé publique de l'extension" };
  }
  await rbxStoreSet({ [RBX_ADMIN_KEY]: obj });
  return { ok: true };
}

async function rbxIssueKey(opts) {
  if (!rbxAdmin) throw new Error("Accès admin requis");
  const store = await rbxStoreGet([RBX_ADMIN_KEY, RBX_ISSUED_KEY]);
  const priv = store[RBX_ADMIN_KEY];
  if (!priv) throw new Error("Clé privée absente");
  const pk = await crypto.subtle.importKey("jwk", priv, RBX_ALG, false, ["sign"]);
  const now = Date.now();
  const days = Number(opts.days) || 0;
  const payload = {
    v: 1,
    id: rbxRandHex(6),
    uid: Number(opts.uid) || 0,
    name: String(opts.name || "").slice(0, 40),
    iat: now,
    exp: days > 0 ? now + days * 86400000 : 0
  };
  // « t » distingue les abonnements (absent = Premium) ; il est signé avec le reste.
  if (opts.tier) payload.t = String(opts.tier).slice(0, 12);
  const head = "RBXC1." + rbxBytesToB64u(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign(RBX_SIGN, pk, new TextEncoder().encode(head)));
  const key = head + "." + rbxBytesToB64u(sig);
  const list = Array.isArray(store[RBX_ISSUED_KEY]) ? store[RBX_ISSUED_KEY] : [];
  list.unshift({ id: payload.id, name: payload.name, uid: payload.uid, iat: payload.iat, exp: payload.exp, t: payload.t || "", key });
  await rbxStoreSet({ [RBX_ISSUED_KEY]: list.slice(0, 200) });
  return { key, payload };
}

async function rbxRemoveIssued(id) {
  const store = await rbxStoreGet([RBX_ISSUED_KEY]);
  const list = (Array.isArray(store[RBX_ISSUED_KEY]) ? store[RBX_ISSUED_KEY] : []).filter((e) => e.id !== id);
  await rbxStoreSet({ [RBX_ISSUED_KEY]: list });
}

async function rbxSetPreview(flag) {
  await rbxStoreSet({ [RBX_PREVIEW_KEY]: !!flag });
  await rbxRefreshPremium();
}

async function rbxWipeAdmin() {
  await rbxStoreRemove([RBX_ADMIN_KEY, RBX_PREVIEW_KEY]);
  await rbxRefreshPremium();
}

(async function rbxInit() {
  let prem;
  const [res, p] = await Promise.all([
    rbxStoreGet(RBX_KEY),
    rbxComputePremium().catch(() => ({ admin: false, premium: { active: false } }))
  ]);
  prem = p;
  rbxSaved = { ...RBX_DEFAULTS, ...(res[RBX_KEY] || {}) };
  rbxAdmin = prem.admin;
  rbxPremium = prem.premium;
  rbxState = rbxEffective(rbxSaved);
  rbxReady = true;
  rbxNotify();
  rbxEnforceBinding();
})();

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  if (changes[RBX_LIC_KEY] || changes[RBX_ADMIN_KEY] || changes[RBX_PREVIEW_KEY]) rbxRefreshPremium();
  if (!changes[RBX_KEY]) return;
  if (rbxSaveTimer || Date.now() - rbxLastWrite < 800) return;
  rbxSaved = { ...RBX_DEFAULTS, ...(changes[RBX_KEY].newValue || {}) };
  rbxState = rbxEffective(rbxSaved);
  rbxNotify();
});

rbxEvery(() => {
  const p = rbxPremium;
  if (p.active && p.source === "license" && p.info && p.info.exp && Date.now() > p.info.exp) rbxRefreshPremium();
}, 60000);