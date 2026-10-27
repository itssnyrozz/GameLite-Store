// Avantages 10.3 : badge certifié (donné par le créateur depuis Admin), pseudo stylé (Premium),
// curseurs de souris (gratuit). Remplace l'ancien abonnement secret (js/secret.js, retiré).

// ---------- Badge certifié : accordé par le créateur ----------
// Le créateur l'a toujours ; les autres le reçoivent depuis Admin > Chercher un joueur (clé signée « t: cert »
// rangée dans la liste en ligne, comme le Premium). Les anciens dons « secret » comptent aussi.

const RBX_CERT_TIERS = ["cert", "secret"];
const RBX_CERT_CACHE = "rbxcCert";

function rbxCertCacheRead() {
  try {
    return localStorage.getItem(RBX_CERT_CACHE) === "1";
  } catch (e) {
    return false;
  }
}

function rbxCertCacheWrite(on) {
  try {
    if (on) localStorage.setItem(RBX_CERT_CACHE, "1");
    else localStorage.removeItem(RBX_CERT_CACHE);
  } catch (e) {
    // Stockage de la page indisponible : seul un court clignotement du badge au chargement revient.
  }
}

// Dernier état connu dès le chargement : sinon le badge disparaît le temps de revérifier (environ 1 s).
let rbxCertSub = { active: rbxCertCacheRead(), source: "cache" };

async function rbxCertCompute(admin) {
  const st = await rbxStoreGet([RBX_PREVIEW_KEY, RBX_CLOUD_KEY]);
  if (admin && !st[RBX_PREVIEW_KEY]) return { active: true, source: "admin" };
  const me = rbxMyIdNow();
  const c = st[RBX_CLOUD_KEY];
  const grants = me && c && Array.isArray(c.grants) ? c.grants.filter((g) => RBX_CERT_TIERS.includes(g.t) && Number(g.uid) === me) : [];
  for (const g of grants) {
    const r = await rbxVerifyLicense(g.key, false);
    if (r.ok && RBX_CERT_TIERS.includes(r.info.t) && Number(r.info.uid) === me) return { active: true, source: "cloud", info: r.info };
  }
  return { active: false };
}

const rbxCertComputePrev = rbxComputePremium;
rbxComputePremium = async function () {
  const r = await rbxCertComputePrev();
  try {
    rbxCertSub = await rbxCertCompute(r.admin);
  } catch (e) {
    rbxCertSub = { active: false };
  }
  rbxCertCacheWrite(rbxCertSub.active);
  return r;
};

// ---------- Réglages ----------

Object.assign(RBX_DEFAULTS, { secretName: false, secretNameStyle: "gradient", secretCursor: "" });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
// Pseudo stylé : Premium. Badge certifié : seulement si le créateur l'a accordé.
Object.assign(RBX_PREMIUM_OFF, { secretName: false });

const rbxCertEffectivePrev = rbxEffective;
rbxEffective = function (saved) {
  const out = rbxCertEffectivePrev(saved);
  if (!rbxCertSub.active) out.certOn = false;
  return out;
};
rbxState = rbxEffective(rbxSaved);

const RBX_CERT_FIELDS = [
  { key: "certOn", type: "checkbox", label: "Badge certifié à côté de mon pseudo (visible seulement par moi)" },
  { key: "certScale", type: "range", label: "Taille du badge certifié", min: 60, max: 260, step: 10, unit: "%" }
];

// Joueurs qui ont reçu le badge : réglages dans Profil (cachés pour les autres).
RBX_CERT_FIELDS.slice().reverse().forEach((f) => rbxSocAddField("profile", "showProfileInfo", f));

const RBX_CURSOR_OPTIONS = [
  ["", "Normal"],
  ["star", "Étoile"],
  ["heart", "Cœur"],
  ["crown", "Couronne"],
  ["sparkle", "Éclat"],
  ["bolt", "Éclair"],
  ["moon", "Lune"],
  ["flower", "Fleur"],
  ["diamond", "Diamant"],
  ["skull", "Crâne"],
  ["spade", "Pique"],
  ["music", "Note de musique"],
  ["arrow", "Flèche néon"],
  ["dot", "Point lumineux"]
];
rbxSocAddField("interface", "uiFocus", { key: "secretCursor", type: "select", label: "Curseur de souris sur Roblox", options: RBX_CURSOR_OPTIONS });
if (typeof RBX9_UI_GROUPS !== "undefined") {
  const g = RBX9_UI_GROUPS.find((x) => x[0] === "Général");
  if (g && !g[1].includes("secretCursor")) g[1].push("secretCursor");
}

// ---------- Panneau : badge dans Admin, pseudo stylé dans Premium > Profil+ ----------

const rbxPerksAdminPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  const f = rbxFieldHtml;
  return (
    `<div class="rx-group"><div class="rx-col"><span class="rx-label">Badge certifié</span><p class="rx-hint">Visible seulement par celui qui l'a. Pour le donner à un joueur : Badge certifié à donner, plus bas.</p></div>${RBX_CERT_FIELDS.map(f).join("")}</div><div class="rx-spaced"></div>` +
    rbxPerksAdminPrev(store)
  );
};

const RBX_NAME_STYLES = [["gradient", "Dégradé arc-en-ciel"], ["neon", "Néon qui grésille"], ["glitch", "Glitch"], ["fire", "Feu"], ["gold", "Or brillant"], ["ice", "Glace"]];

const rbxPerksSocialPrev = rbxTabSocial;
rbxTabSocial = function () {
  const f = rbxFieldHtml;
  return (
    rbxPerksSocialPrev() +
    `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Pseudo stylé (visible seulement par toi)</span></div>` +
    f({ key: "secretName", type: "checkbox", label: "Afficher mon pseudo avec un style animé" }) +
    f({ key: "secretNameStyle", type: "select", label: "Style du pseudo", options: RBX_NAME_STYLES }) +
    `</div>`
  );
};

// Les réglages du badge n'apparaissent dans Profil que pour ceux qui l'ont reçu (le créateur les a dans Admin).
function rbxCertPanelSync() {
  const p = document.getElementById("rx-panel");
  if (p) p.classList.toggle("rx-has-cert", !!rbxCertSub.active && !rbxAdmin);
}

const rbxPerksRefreshPrev = rbxPanelRefresh;
rbxPanelRefresh = function () {
  const r = rbxPerksRefreshPrev();
  rbxCertPanelSync();
  return r;
};

const rbxPerksBuildPrev = rbxBuildPanel;
rbxBuildPanel = function () {
  const r = rbxPerksBuildPrev();
  rbxCertPanelSync();
  return r;
};

// ---------- Pseudo stylé : repère tes noms affichés sur la page ----------

function rbxMyNameMark() {
  const s = rbxState;
  const on = s.enabled && s.secretName;
  const seen = new Set();
  if (on && document.body) {
    const names = rbxOwnDisplay();
    const page = rbxPageInfo(location.pathname);
    if (rbxMe && page && page.k === "user" && String(rbxMe.id) === page.id) {
      const h = rbxProfileHeading(rbxMe.id);
      if (h) seen.add(h);
    }
    if (names.length) {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const t = node.nodeValue;
          if (!t || t.length > 60 || names.indexOf(t.trim().toLowerCase()) === -1) return NodeFilter.FILTER_REJECT;
          const p = node.parentElement;
          if (!p || p.closest("#rx-panel, #rx-toast, #rx-bf-pop, script, style, title, textarea, input, select")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      let n;
      while ((n = walker.nextNode()) && seen.size < 40) seen.add(n.parentElement);
    }
  }
  document.querySelectorAll("[data-rx-myname]").forEach((el) => {
    if (!seen.has(el)) el.removeAttribute("data-rx-myname");
  });
  seen.forEach((el) => {
    if (!el.hasAttribute("data-rx-myname")) el.setAttribute("data-rx-myname", "");
  });
}

rbxEvery(() => {
  if (document.body && rbxDomChanged("myname")) rbxMyNameMark();
}, 1000);
rbxOnChange(() => rbxMyNameMark());

// ---------- CSS ----------

const RBX_NAME_GRADS = {
  gradient: "linear-gradient(110deg, #8b5cf6, #ec4899, #f5b301, #3b82f6, #8b5cf6)",
  fire: "linear-gradient(110deg, #ffd200, #ff6a00, #ee0979, #ff6a00, #ffd200)",
  gold: "linear-gradient(110deg, #b8860b, #f5d76e, #fff4c2, #f5d76e, #b8860b)",
  ice: "linear-gradient(110deg, #a5f3fc, #e0f2fe, #ffffff, #7dd3fc, #a5f3fc)"
};

function rbxCursorUrl(glyph, color) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><text x='14' y='21' font-size='20' text-anchor='middle' fill='${color}' stroke='white' stroke-width='1.2' paint-order='stroke'>${glyph}</text></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 14 14`;
}

function rbxDotCursorUrl() {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24'><circle cx='12' cy='12' r='9' fill='rgba(236,72,153,0.25)'/><circle cx='12' cy='12' r='5' fill='#ec4899' stroke='white' stroke-width='1.5'/></svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12`;
}

function rbxArrowCursorUrl() {
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='28' height='28'><path d='M4 3 L4 22 L9 17 L13 25 L16 23.5 L12 15.5 L19 15.5 Z' fill='#22d3ee' stroke='white' stroke-width='1.5' stroke-linejoin='round'/></svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 4 3`;
}

const RBX_CURSORS = {
  star: () => rbxCursorUrl("★", "#f5b301"),
  heart: () => rbxCursorUrl("♥", "#ec4899"),
  crown: () => rbxCursorUrl("♛", "#f5b301"),
  sparkle: () => rbxCursorUrl("✦", "#c084fc"),
  bolt: () => rbxCursorUrl("⚡", "#facc15"),
  moon: () => rbxCursorUrl("☾", "#fde68a"),
  flower: () => rbxCursorUrl("✿", "#f9a8d4"),
  diamond: () => rbxCursorUrl("◆", "#60a5fa"),
  skull: () => rbxCursorUrl("☠", "#e5e7eb"),
  spade: () => rbxCursorUrl("♠", "#111111"),
  music: () => rbxCursorUrl("♪", "#a78bfa"),
  arrow: rbxArrowCursorUrl,
  dot: rbxDotCursorUrl
};

function rbxPerksCss(s) {
  let css = "";
  if (s.secretName) {
    const who = `${RBX_P3} [data-rx-myname]`;
    const style = RBX_NAME_STYLES.some((x) => x[0] === s.secretNameStyle) ? s.secretNameStyle : "gradient";
    if (style === "neon") {
      css += `${who} { color: #ffffff !important; text-shadow: 0 0 4px #fff, 0 0 10px #ec4899, 0 0 22px #ec4899, 0 0 36px #8b5cf6; animation: rxNameFlicker 3s infinite; }`;
    } else if (style === "glitch") {
      css += `${who} { text-shadow: 2px 0 #22d3ee, -2px 0 #ec4899; animation: rxNameGlitch 2.2s steps(1) infinite; }`;
    } else {
      const glow = style === "fire" ? " filter: drop-shadow(0 0 6px rgba(255, 106, 0, 0.6));" : "";
      css += `${who} { background: ${RBX_NAME_GRADS[style]} 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; animation: rxNameShift ${style === "fire" ? 2.5 : 6}s linear infinite;${glow} }`;
    }
    css += `${who} :is(.rx-cert, .rx-creator) { -webkit-text-fill-color: initial; text-shadow: none; animation: none; }`;
    css += `@keyframes rxNameShift { to { background-position: 300% 0; } }`;
    css += `@keyframes rxNameFlicker { 0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.55; } }`;
    css += `@keyframes rxNameGlitch { 0%, 100% { transform: none; text-shadow: 2px 0 #22d3ee, -2px 0 #ec4899; } 10% { transform: translate(-1px, 1px); text-shadow: -3px 0 #22d3ee, 3px 0 #ec4899; } 20% { transform: translate(1px, -1px); } 30% { transform: none; text-shadow: 1px 0 #22d3ee, -1px 0 #ec4899; } }`;
  }
  const make = RBX_CURSORS[s.secretCursor];
  if (make) {
    const u = make();
    css += `html:root:root body, html:root:root body * { cursor: ${u}, auto !important; }`;
    css += `html:root:root body :is(a, button, [role="button"], label, select, summary), html:root:root body :is(a, button, [role="button"]) * { cursor: ${u}, pointer !important; }`;
    css += `html:root:root body :is(input:not([type="checkbox"]):not([type="radio"]):not([type="range"]), textarea, [contenteditable]) { cursor: text !important; }`;
  }
  css += `#rx-panel:not(.rx-has-cert) [data-section="profile"] .rx-row:has([data-key="certOn"]), #rx-panel:not(.rx-has-cert) [data-section="profile"] .rx-row:has([data-key="certScale"]), #rx-panel:not(.rx-has-cert) [data-section="profile"] .rx-col:has([data-key="certScale"]) { display: none !important; }`;
  return css;
}

const rbxPerksCssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbxPerksCssPrev(s);
  if (!s.enabled) return base;
  return base + rbxPerksCss(s);
};
rbxOnChange(rbxSocStyleRefresh);
