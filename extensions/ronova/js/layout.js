// Rangement du panneau : moins d'onglets, réglages regroupés par thème, réglages mineurs retirés.
// Chargé en dernier : il réorganise ce que les autres fichiers ont ajouté, sans toucher à leurs fonctions.
// Ajoute aussi : police Google par son nom, image ou GIF de fond gratuit, badges offerts en ligne, modération IA.

// Réglages retirés du panneau : ils restent à leur valeur par défaut (ou verrouillés sans Premium).
const RBXL_HIDDEN = [
  "uiType", "uiFocus", "uiButtons", "uiShadow", "uiCardTitles", "uiTitles", "uiChips", "uiSeeAll", "navSeam",
  "uiBadgeFix", "themePopups", "bfOnline", "uiProgress", "uiAvatars", "uiAppear", "uiImages", "uiSearch",
  "friendNames", "bfStars", "neonGlow", "accentBorders", "flatCards", "blurId",
  "enableShortcuts", "openNewTab", "quickJoinMode", "hoverJoin", "quickLinks", "trackPlaytime", "dailyLimit", "breakReminder",
  "showDevex", "devexRate", "usdToEur", "showRobuxConvert", "robuxRate", "currency",
  "fontSize", "customScroll",
  // Toujours actifs ou fusionnés : thèmes Roblox forcés, notifications des best friends, pubs (avec les jeux sponsorisés).
  "forceNative", "notifyBest", "notifyEvery", "hideAds", "focusMode", "hideAddFriends", "blurReveal",
  // Infos de profil : l'ID et la date de création sont dans l'en-tête du profil (js/profile.js).
  "infoUsername", "infoId", "infoAge", "infoFriends", "infoFollowers", "infoFollowing", "infoGroups", "infoInventory", "infoStatus"
];

// Thèmes retirés de la liste (doublons ou trop proches d'un autre). Ils restent appliqués chez ceux qui les ont déjà.
const RBXL_DROP_THEMES = [
  "sombre", "rose", "rouge", "cafe", "clair", "menthe",
  "graphite", "lavande", "saphir", "rubis", "ardoise", "peche", "citron", "corail", "nuage", "mocha", "cosmos", "emeraude",
  "vaporwave", "matrix", "cerise", "printemps",
  "nord", "dracula", "ocean", "sunset", "foret", "hacker"
];

// Onglet Accueil : tout ce qui personnalise la page d'accueil de Roblox (js/layout.js, plus bas).
RBX_TABS.push({ id: "home", label: "Accueil", fields: [] });
RBX6_ICONS.home = '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h5v-6h4v6h5V10"/>';

// Onglet Idée / Bug : messages envoyés au Discord par le serveur (js/layout.js, plus bas).
RBX_TABS.push({ id: "feedback", label: "Idée / Bug", fields: [] });
RBX6_ICONS.feedback = '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>';

// Catégorie Admin : chaque partie de l'onglet Admin a son entrée dans le menu, visible seulement des admins.
// [entrée du menu, volet de l'onglet Admin, nom, description, icône]. Le contenu reste celui de l'onglet Admin (data-admin-body).
const RBXL_ADM = [
  ["adm-licenses", "licenses", "Licences", "Donner le Premium, clés émises et vérification d'une clé.", '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>'],
  ["adm-badges", "badges", "Badges", "Badges et titres à donner aux joueurs, badge certifié.", '<circle cx="12" cy="9" r="6"/><path d="M9 14.5L8 22l4-2 4 2-1-7.5"/>'],
  ["adm-online", "online", "En ligne", "Annonce pour tous les joueurs et modération en ligne.", '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'],
  ["adm-server", "server", "Serveur", "État du serveur Cloudflare, chiffres et mise à jour de son code.", '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>'],
  ["adm-settings", "settings", "Réglages", "Navigateur de serveurs, réglages avancés et clés admin.", '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>']
];
RBXL_ADM.forEach(([id, , label, , icon]) => {
  RBX_TABS.push({ id, label, fields: [] });
  RBX6_ICONS[id] = icon;
});

// Onglets fusionnés : [onglet gardé, nouveau nom, onglets sources, groupes de réglages].
const RBXL_MERGE = [
  ["home", "Accueil", ["home"], [["Masquer sur l'accueil", ["hideFriendsRow", "hideFriendGames", "hideSponsored"]]]],
  [
    "colors",
    "Couleurs et texte",
    ["colors", "text", "effects"],
    [
      ["Couleurs", ["useBgColor", "bgColor", "cardColor", "textColor", "accent"]],
      ["Texte", ["font"]],
      ["Effets", ["smoothScroll", "noAnimations"]]
    ]
  ],
  [
    "interface",
    "Interface",
    ["interface", "buttons"],
    [
      ["Style", ["uiPolish", "uiModern", "uiRound", "uiDensity", "contentWidth"]],
      ["Animations", ["uiMotion", "uiLift"]],
      ["Menu et amis", ["uiGlassHeader", "uiSidebar", "uiFriends", "showHandles", "bestFirst"]],
      ["Extension", ["secretCursor", "showFab", "showScrollTop", "showCopyButtons"]]
    ]
  ],
  [
    "hide",
    "Masquer et flouter",
    ["hide", "privacy"],
    [
      ["Menus", ["hideSidebar", "hidePremiumBtn", "hidePlusPromo"]],
      ["Pages", ["hideChat", "hideFooter"]],
      ["Flouter (révélé au survol de la souris)", ["blurRobux", "blurName"]]
    ]
  ]
];

// Placés ailleurs que dans les onglets fusionnés : à ne pas ranger dans « Autres ».
const RBXL_ELSEWHERE = ["bgImage"];

// Idée / Bug tout en haut du menu, seul, hors des catégories.
const RBXL_ORDER = ["feedback", "themes", "colors", "interface", "styles", "home", "hide", "profile", "friends", "outfits", "premium", "activity", "limited", "dev", "admin"].concat(RBXL_ADM.map((a) => a[0]));

const RBXL_LABELS = { styles: "Panneau et styles", activity: "Activité et outils" };

const RBXL_ADMIN_PANES = [
  ["licenses", "Licences", ["Donner le Premium", "Premium automatique", "Clés émises", "Vérifier une clé", "Chercher un joueur"]],
  ["badges", "Badges", ["Badge"]],
  ["online", "En ligne", ["Annonce", "Modération"]],
  ["server", "Serveur", ["Serveur RoNova"]],
  ["settings", "Réglages", ["Navigateur de serveurs", "Mes clés admin"]]
];

const RBXL_TITLE_COLORS = [
  ["gold", "Or"], ["accent", "Couleur du thème"], ["red", "Rouge"], ["purple", "Violet"], ["green", "Vert"],
  ["galaxy", "Galaxie"], ["rainbow", "Arc-en-ciel"], ["sunset", "Coucher de soleil"], ["ocean", "Océan"], ["fire", "Feu"]
];

let rbxlAdminPane = "licenses";
let rbxlGradSub = null;
let rbxlGlassSub = null;
let rbxlBgField = null;

// Journal des nouveautés vidé : plus de fenêtre « Nouveautés » à l'ouverture du panneau.
RBX5_NEWS.length = 0;

(function rbxlSetup() {
  try {
    const byId = (id) => RBX_TABS.find((t) => t.id === id);
    const all = new Map();
    RBX_TABS.forEach((t) => (t.fields || []).forEach((f) => f.key && all.set(f.key, f)));

    const font = all.get("font");
    if (font) {
      font.label = "Police : nom exact (Google Fonts ou installée)";
      font.placeholder = "Poppins, Montserrat, Comic Sans MS…";
    }
    const blur = all.get("blurName");
    if (blur) blur.label = "Flouter ton pseudo, ceux de tes amis et leur ID de compte";
    const labels = {
      hideSponsored: "Masquer les pubs et les jeux sponsorisés",
      hidePlusPromo: "Masquer la pub Roblox Plus du menu",
      blurRobux: "Flouter mon solde de Robux"
    };
    Object.keys(labels).forEach((k) => all.has(k) && (all.get(k).label = labels[k]));
    rbxlBgField = all.get("bgImage") || null;

    const placed = new Set(RBXL_MERGE.flatMap((m) => m[3].flatMap((g) => g[1])).concat(RBXL_ELSEWHERE));
    RBXL_MERGE.forEach(([id, label, sources, groups]) => {
      const tab = byId(id);
      if (!tab) return;
      const used = new Set();
      const out = [];
      groups.forEach(([head, keys]) => {
        const fs = keys.filter((k) => all.has(k) && !used.has(k));
        if (!fs.length) return;
        out.push({ key: "", type: "heading", label: head });
        fs.forEach((k) => {
          used.add(k);
          out.push(all.get(k));
        });
      });
      // Un réglage des onglets sources qui n'est rangé nulle part reste visible plutôt que de disparaître.
      const rest = [];
      sources.forEach((s) => {
        const t = byId(s);
        (t && t.fields ? t.fields : []).forEach((f) => {
          if (f.key && !used.has(f.key) && !placed.has(f.key) && RBXL_HIDDEN.indexOf(f.key) === -1) rest.push(f);
        });
      });
      if (rest.length) out.push({ key: "", type: "heading", label: "Autres" }, ...rest);
      tab.label = label;
      tab.fields = out;
    });

    // Image de fond : dans Thèmes, gratuite.
    const themesTab = byId("themes");
    if (themesTab && rbxlBgField) themesTab.fields = [rbxlBgField];

    // Badge certifié : seulement dans l'onglet Admin.
    const prof = byId("profile");
    if (prof && prof.fields) prof.fields = prof.fields.filter((f) => f.key !== "certOn" && f.key !== "certScale");

    Object.keys(RBXL_LABELS).forEach((id) => {
      const t = byId(id);
      if (t) t.label = RBXL_LABELS[id];
    });

    // Premium : Thèmes exclusifs (avec dégradé et effet verre), Infos, Profil+.
    const prem = byId("premium");
    if (prem && prem.subs) {
      const sub = (id) => prem.subs.find((s) => s.id === id);
      rbxlGradSub = sub("gradient") || null;
      rbxlGlassSub = sub("glass") || null;
      const themes = sub("themes");
      if (themes) {
        themes.fields = themes.fields.filter((f) => RBXL_HIDDEN.indexOf(f.key) === -1);
        const list = Object.entries(RBX_ALL_THEMES)
          .filter(([id]) => RBXL_DROP_THEMES.indexOf(id) === -1)
          .map(([id, th]) => [id, th.label]);
        themes.fields.forEach((f) => {
          if (f.options === "themes") f.options = list;
        });
      }
      const info = sub("info");
      if (info) info.label = "Infos";
      const drop = ["gradient", "glass", "comfort", "tracking", "robux"];
      prem.subs = prem.subs.filter((s) => drop.indexOf(s.id) === -1);
    }

    const kept = RBXL_ORDER.map(byId).filter(Boolean);
    const extra = RBX_TABS.filter((t) => kept.indexOf(t) === -1 && ["text", "effects", "privacy", "buttons", "tools"].indexOf(t.id) === -1);
    RBX_TABS.length = 0;
    RBX_TABS.push(...kept.slice(0, -1), ...extra, kept[kept.length - 1]);

    RBX6_GROUPS.length = 0;
    RBX6_GROUPS.push(
      ["Apparence", ["themes", "colors", "interface", "styles"]],
      ["Affichage", ["home", "hide", "profile"]],
      ["Social", ["friends", "outfits"]],
      ["Outils", ["premium", "activity", "limited"].concat(extra.map((t) => t.id), ["dev"])],
      ["Admin", ["admin"].concat(RBXL_ADM.map((a) => a[0]))]
    );

    Object.assign(RBX9_DESC, {
      themes: "Une base de couleurs pour tout le site, et ton image ou GIF de fond.",
      colors: "Couleurs du site, police et petits effets.",
      interface: "Retouches du design de Roblox et boutons ajoutés par l'extension.",
      styles: "Réglages du panneau, styles enregistrés et sauvegarde.",
      home: "Choisis les sections et les jeux affichés sur la page d'accueil de Roblox.",
      hide: "Retire les blocs inutiles et floute ton pseudo et ceux de tes amis.",
      premium: "Thèmes exclusifs avec dégradé et verre, infos détaillées et Profil+.",
      activity: "Temps de jeu (celui de Roblox), Robux, convertisseur et jeux récents.",
      outfits: "Tes tenues en un clic, et un bac à sable pour essayer n'importe quel objet.",
      feedback: "Propose une idée ou signale un bug : ton message arrive directement chez nous.",
      admin: "Licences, badges, annonces et réglages avancés."
    });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
})();

// ---------- État : réglages retirés et image de fond non vérifiée ----------

const rbxlMod = { ok: null, session: new Set(), pending: new Map(), timer: 0, notes: new Map(), bg: null, texts: null };

// Image de fond : un fichier choisi ou l'image d'un lien, gardée en image intégrée (seul format autorisé par Roblox).
// bgImage contient le lien ou « fichier : nom » ; l'image elle-même est stockée à part, une seule fois.
const RBXL_BG_KEY = "rbxCustomizerBgFile";
const RBXL_BG_MAX = 4 * 1024 * 1024;
const rbxlBg = { for: "", data: "" };

// Couleurs du thème tirées de l'image (calculées une fois par image, en mémoire).
RBX_DEFAULTS.bgAdapt = true;
RBX_DEFAULTS.bgSharp = false;
const rbxlPal = { for: "", c: null };

const rbxlEffectivePrev = rbxEffective;
rbxEffective = function (saved) {
  const out = rbxlEffectivePrev(saved);
  const locked = !(rbxPremium && rbxPremium.active);
  RBXL_HIDDEN.forEach((k) => {
    if (!(k in RBX_DEFAULTS)) return;
    out[k] = locked && k in RBX_PREMIUM_OFF ? RBX_PREMIUM_OFF[k] : RBX_DEFAULTS[k];
  });
  // L'image de fond ne s'affiche qu'une fois chargée et validée par la modération (ou si le serveur est injoignable).
  const bg = String(out.bgImage || "").trim();
  out.bgImage = bg && rbxlBg.for === bg && (bg === saved.bgImageOk || rbxlMod.session.has(bg)) ? RBX_BG_VAR : "";
  // Les pubs suivent « jeux sponsorisés » : un seul réglage pour les deux.
  out.hideAds = !!out.hideSponsored;
  const pal = out.bgImage && saved.bgAdapt !== false && rbxlPal.for === bg ? rbxlPal.c : null;
  // Le texte est déduit du fond par le thème ; le dégradé est coupé pour que l'image donne les couleurs.
  if (pal) Object.assign(out, { useBgColor: true, bgColor: pal.bg, cardColor: pal.card, textColor: "", accent: pal.accent, gradEnabled: false });
  return out;
};
rbxState = rbxEffective(rbxSaved);

function rbxlRefresh() {
  rbxState = rbxEffective(rbxSaved);
  rbxlQuiet(rbxNotify);
}

// Une erreur d'un autre module pendant la mise à jour ne doit pas interrompre l'image de fond.
function rbxlQuiet(fn) {
  try {
    fn();
  } catch (e) {
    void e;
  }
}

// ---------- Mes thèmes : créés dans l'onglet Thèmes, gratuits ----------

const RBXL_MY_MAX = 12;
const RBXL_MY_COLORS = [
  ["bgColor", "Fond", "#121214"],
  ["cardColor", "Cartes", "#232527"],
  ["textColor", "Texte", "#f7f7f8"],
  ["accent", "Accent", "#335fff"]
];

Object.assign(RBX_DEFAULTS, { myThemes: [] });
if (!Array.isArray(rbxSaved.myThemes)) rbxSaved.myThemes = [];

function rbxlHex(v, def) {
  return /^#[0-9a-f]{6}$/i.test(String(v || "")) ? String(v).toLowerCase() : def;
}

// Les thèmes perso rejoignent RBX_ALL_THEMES : rbxApplyTheme et le repère du thème actif marchent tels quels.
function rbxlMyList() {
  return (Array.isArray(rbxSaved.myThemes) ? rbxSaved.myThemes : [])
    .filter((t) => t && /^my-[a-z0-9]+$/.test(t.id))
    .slice(0, RBXL_MY_MAX)
    .map((t) => {
      const out = { id: t.id, label: String(t.label || "Mon thème").slice(0, 24) };
      RBXL_MY_COLORS.forEach(([k, , def]) => {
        out[k] = rbxlHex(t[k], def);
      });
      return out;
    });
}

function rbxlMySync() {
  Object.keys(RBX_ALL_THEMES).forEach((id) => {
    if (id.indexOf("my-") === 0) delete RBX_ALL_THEMES[id];
  });
  rbxlMyList().forEach((t) => {
    RBX_ALL_THEMES[t.id] = t;
  });
}

function rbxlMyDraft() {
  const t = { label: "" };
  RBXL_MY_COLORS.forEach(([k, , def]) => {
    const el = document.querySelector(`#rx-panel [data-rxl-my="${k}"]`);
    t[k] = rbxlHex(el && el.value, def);
  });
  return t;
}

function rbxlMyHtml() {
  const s = rbxState;
  const inputs = RBXL_MY_COLORS.map(([k, label, def]) => `<label class="rxl-my-color"><input type="color" value="${rbxlHex(s[k], def)}" data-rxl-my="${k}"><span>${label}</span></label>`).join("");
  return `<div class="rxl-block"><div class="rx9-heading">Créer mon thème</div><p class="rx-hint">Gratuit. Choisis tes couleurs, donne un nom à ton thème puis enregistre-le. Clique sur un de tes thèmes pour l'appliquer (${RBXL_MY_MAX} maximum).</p><div class="rx-themes" data-rxl-mylist></div><div class="rx-group rx-spaced"><div class="rxl-my-edit"><div data-rxl-mypreview></div><div class="rx-col"><div class="rxl-my-colors">${inputs}</div><div class="rx-inline"><input type="text" maxlength="24" placeholder="Nom du thème" data-rxl-my="label"><button type="button" class="rx-sec" data-rxl-my-act="save">Enregistrer mon thème</button></div></div></div></div></div>`;
}

function rbxlMyPreview() {
  const box = document.querySelector("#rx-panel [data-rxl-mypreview]");
  if (!box) return;
  const t = rbxlMyDraft();
  const name = document.querySelector('#rx-panel [data-rxl-my="label"]');
  t.label = (name && name.value.trim()) || "Aperçu";
  box.innerHTML = rbxThemeCard("", t, false);
  rbxStylePreviews(box);
}

function rbxlMyRender() {
  const box = document.querySelector("#rx-panel [data-rxl-mylist]");
  if (!box) return;
  const list = rbxlMyList();
  box.hidden = !list.length;
  box.innerHTML = list.map((t) => `<div class="rxl-my-item">${rbxThemeCard(t.id, t, false)}<button type="button" class="rxl-my-del" data-rxl-my-del="${t.id}" title="Supprimer ce thème">×</button></div>`).join("");
  rbxStylePreviews(box);
  rbxMarkTheme();
  rbxlMyPreview();
}

function rbxlMySave() {
  const list = rbxlMyList();
  if (list.length >= RBXL_MY_MAX) return rbxToast(`${RBXL_MY_MAX} thèmes maximum : supprimes-en un d'abord`);
  const name = document.querySelector('#rx-panel [data-rxl-my="label"]');
  const t = rbxlMyDraft();
  t.id = "my-" + Date.now().toString(36);
  t.label = ((name && name.value.trim()) || `Mon thème ${list.length + 1}`).slice(0, 24);
  rbxSet({ myThemes: [...list, t] });
  rbxApplyTheme(t.id);
  if (name) name.value = "";
  rbxlMyRender();
  rbxToast(`Thème « ${t.label} » enregistré et appliqué`);
}

function rbxlMyDelete(id) {
  const patch = { myThemes: rbxlMyList().filter((t) => t.id !== id) };
  // Les couleurs restent appliquées, mais elles ne sont plus liées à un thème de la liste.
  if (rbxState.theme === id) patch.theme = "custom";
  rbxSet(patch);
  rbxlMyRender();
}

document.addEventListener("click", (e) => {
  const t = e.target && e.target.closest ? e.target.closest("#rx-panel [data-rxl-my-act], #rx-panel [data-rxl-my-del]") : null;
  if (!t) return;
  if (t.dataset.rxlMyDel) rbxlMyDelete(t.dataset.rxlMyDel);
  else rbxlMySave();
});

document.addEventListener("input", (e) => {
  if (e.target && e.target.closest && e.target.closest("#rx-panel [data-rxl-my]")) rbxlMyPreview();
});

rbxlMySync();
rbxOnChange(rbxlMySync);

// ---------- Accueil : sections de la page d'accueil à cacher ----------

// Titres des sections cachées, en minuscules : le même nom est caché à chaque visite.
Object.assign(RBX_DEFAULTS, { homeHide: [] });
if (!Array.isArray(rbxSaved.homeHide)) rbxSaved.homeHide = [];

const RBXL_HOME_MAX = 50;
const RBXL_HOME_SKIP = "#rx-panel, #rx-overlay, #rx-bar, #rx-dock, #navigation, #header, nav, header, footer";

function rbxlIsHome() {
  return /^\/([a-z]{2}(-[a-z]{2})?\/)?home\/?$/i.test(location.pathname);
}

function rbxlHomeKey(t) {
  return t.replace(/\s+/g, " ").trim().toLowerCase().slice(0, 60);
}

// Une section = le plus grand bloc autour d'un titre qui ne contient aucun autre titre, s'il contient des jeux.
function rbxlHomeSections() {
  if (!rbxlIsHome() || !document.body) return [];
  const out = [];
  const seen = new Set();
  document.body.querySelectorAll("h2, h3").forEach((h) => {
    if (h.closest(RBXL_HOME_SKIP)) return;
    const title = h.textContent.replace(/\s+/g, " ").trim();
    const key = rbxlHomeKey(title);
    if (!key || seen.has(key)) return;
    let el = h;
    while (el.parentElement && el.parentElement !== document.body && el.parentElement.querySelectorAll("h2, h3").length === 1) el = el.parentElement;
    if (el === h || !el.querySelector('a[href*="/games/"]')) return;
    seen.add(key);
    out.push({ title: title.slice(0, 60), key, el });
  });
  return out;
}

function rbxlHomeApply() {
  if (!rbxDomChanged("homeHide")) return;
  const hide = new Set(rbxState.enabled && Array.isArray(rbxState.homeHide) ? rbxState.homeHide : []);
  const keep = new Set();
  if (hide.size) {
    rbxlHomeSections().forEach((sec) => {
      if (!hide.has(sec.key)) return;
      sec.el.setAttribute("data-rx-hs", "");
      keep.add(sec.el);
    });
  }
  document.querySelectorAll("[data-rx-hs]").forEach((el) => {
    if (!keep.has(el)) el.removeAttribute("data-rx-hs");
  });
}

function rbxlHomeRender() {
  const box = document.querySelector("#rx-panel [data-rxl-home]");
  if (!box) return;
  const hidden = Array.isArray(rbxState.homeHide) ? rbxState.homeHide : [];
  // Sections vues sur cette page, puis celles déjà cachées qu'on ne voit pas ici (pour pouvoir les réafficher).
  const rows = rbxlHomeSections().map((s) => ({ title: s.title, key: s.key }));
  hidden.forEach((k) => {
    if (!rows.some((r) => r.key === k)) rows.push({ title: k, key: k });
  });
  box.textContent = "";
  if (!rows.length) {
    box.appendChild(sxEl("p", "rx-empty", "Ouvre la page d'accueil de Roblox pour voir ses sections ici."));
    return;
  }
  const group = sxEl("div", "rx-group");
  rows.forEach((r) => {
    const row = sxEl("label", "rx-row");
    row.appendChild(sxEl("span", "rx-label", r.title));
    const sw = sxEl("span", "rx-switch");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = hidden.indexOf(r.key) === -1;
    input.dataset.rxlHomeKey = r.key;
    sw.appendChild(input);
    sw.appendChild(document.createElement("i"));
    row.appendChild(sw);
    group.appendChild(row);
  });
  box.appendChild(group);
}

document.addEventListener("change", (e) => {
  const t = e.target;
  if (!t || !t.matches || !t.matches("#rx-panel [data-rxl-home-key]")) return;
  const key = t.dataset.rxlHomeKey;
  const list = (Array.isArray(rbxState.homeHide) ? rbxState.homeHide : []).filter((k) => k !== key);
  if (!t.checked) {
    if (list.length >= RBXL_HOME_MAX) {
      t.checked = true;
      return rbxToast(`${RBXL_HOME_MAX} sections cachées maximum`);
    }
    list.push(key);
  }
  rbxSet({ homeHide: list });
  rbxlHomeApply();
});

rbxEvery(rbxlHomeApply, 1000);
rbxOnChange(rbxlHomeApply);

// Les réglages « Masquer sur l'accueil » (body) se placent entre les sections et les jeux masqués.
function rbxlHomeHtml(body) {
  return `<div class="rx9-heading">Sections de l'accueil</div><p class="rx-hint">Décoche une section pour la cacher de ta page d'accueil. Elle reste cachée à chaque visite.</p><div data-rxl-home></div>${body}<div class="rxl-block" data-rxl-homegames><div class="rx9-heading">Jeux masqués</div></div>`;
}

// ---------- Panneau ----------

const rbxlSectionBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  const h = rbxlSectionBodyPrev(tab);
  if (tab.id !== "themes" || !rbxlBgField) return h;
  return (
    h +
    `<div class="rxl-block"><div class="rx9-heading">Image de fond</div><p class="rx-hint">Gratuit. Choisis une image ou un GIF animé dans tes fichiers (4 Mo maximum). Elle est vérifiée automatiquement avant de s'afficher.</p><div class="rx-group"><div class="rx-col"><p class="rx-hint" data-rxl-bgstatus></p><div class="rx-actions"><label class="rx-sec sx-file">Choisir dans mes fichiers<input type="file" accept="image/png,image/jpeg,image/gif,image/webp" data-rxl-bgfile hidden></label><button type="button" class="rx-sec rx-danger" data-rxl-bg="clear">Retirer l'image</button></div></div>${rbxFieldHtml({ key: "bgAdapt", type: "checkbox", label: "Adapter les couleurs du thème à l'image" })}${rbxFieldHtml({ key: "bgSharp", type: "checkbox", label: "Rendu net (petites images, pixel art, dessins)" })}</div></div>` +
    rbxlMyHtml()
  );
};

const rbxlHomeBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  const h = rbxlHomeBodyPrev(tab);
  return tab.id === "home" ? rbxlHomeHtml(h) : h;
};

// ---------- Idée / Bug : envoyé au salon Discord par le serveur (route /feedback), jamais directement ----------

const RBXL_FB = {
  idea: {
    icon: RBX6_ICONS.feedback,
    title: "Une idée",
    sub: "Une fonction, un changement",
    label: "Ton idée",
    hint: "Une fonction à ajouter, un truc à changer : dis-nous tout. On lit chaque message.",
    send: "Envoyer l'idée",
    done: "Ton idée est envoyée !"
  },
  bug: {
    // Mêmes icônes au trait que les onglets du panneau (rbx6Svg), pas d'emoji.
    icon: '<path d="M9 7V6a3 3 0 0 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6z"/><path d="M12 20v-9M6 13H2M22 13h-4M6.5 8.5 4 7M17.5 8.5 20 7M6 17l-3 2M18 17l3 2"/>',
    title: "Un bug",
    sub: "Quelque chose ne marche pas",
    label: "Le bug",
    hint: "Explique ce qui ne marche pas et ce que tu faisais juste avant. Plus c'est précis, plus vite on le corrige.",
    send: "Signaler le bug",
    done: "Le bug est signalé !",
    tpl: "Ce que je faisais : \nCe qui s'est passé : \nCe que j'attendais : "
  }
};
const RBXL_FB_MAX = 1500;
const RBXL_FB_MIN = 10;
// Brouillon gardé par type : passer d'Idée à Bug ne perd pas le texte. Envoi verrouillé pendant l'attente du serveur,
// puis 30 s (comme le serveur), avec un compte à rebours qui ne tourne que pendant l'attente.
const rbxlFb = { kind: "idea", draft: { idea: "", bug: "" }, busy: false, until: 0, tick: 0 };

const rbxlFbBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  const h = rbxlFbBodyPrev(tab);
  if (tab.id !== "feedback") return h;
  const kinds = ["idea", "bug"]
    .map((k) => {
      const c = RBXL_FB[k];
      return `<button type="button" class="rxl-fb-kind${k === "idea" ? " rx-active" : ""}" data-rxl-fb-kind="${k}"><span class="rxl-fb-ico">${rbx6Svg(c.icon, 20)}</span><span class="rxl-fb-kt"><b>${c.title}</b><small>${c.sub}</small></span></button>`;
    })
    .join("");
  const c = RBXL_FB.idea;
  // L'onglet n'a pas de réglages : le cadre vide qui les contiendrait est retiré.
  return (
    h.replace('<div class="rx-group"></div>', "") +
    `<div class="rxl-fb"><div class="rxl-fb-kinds">${kinds}</div>` +
    `<div class="rxl-fb-card" data-rxl-fb-form>` +
    `<div class="rxl-fb-head"><span class="rx-label" data-rxl-fb-label>${c.label}</span><button type="button" class="rxl-fb-tpl" data-rxl-fb-tpl hidden>Remplir avec un modèle</button></div>` +
    `<p class="rx-hint" data-rxl-fb-hint>${c.hint}</p>` +
    `<textarea class="rxl-fb-text" data-rxl-fb-text maxlength="${RBXL_FB_MAX}" rows="7"></textarea>` +
    `<div class="rxl-fb-meter"><i data-rxl-fb-bar></i></div>` +
    `<div class="rxl-fb-foot"><span class="rx-hint" data-rxl-fb-status></span><span class="rx-hint" data-rxl-fb-count>0 / ${RBXL_FB_MAX}</span></div>` +
    `<div class="rxl-fb-attach"><span class="rxl-fb-attach-t">Joint au message</span><div class="rxl-fb-chips" data-rxl-fb-chips></div></div>` +
    `<label class="rx-row rxl-fb-row"><span class="rx-label">Joindre mon pseudo Roblox (pour qu'on puisse te répondre)</span><span class="rx-switch"><input type="checkbox" data-rxl-fb-name checked><i></i></span></label>` +
    `<button type="button" class="rxl-fb-send" data-rxl-fb-send disabled>${c.send}</button>` +
    `<p class="rx-hint rxl-fb-kbd">Ctrl + Entrée pour envoyer</p></div>` +
    `<div class="rxl-fb-done" data-rxl-fb-done hidden><div class="rxl-fb-check">${rbx6Svg('<path d="M20 6L9 17l-5-5"/>', 28)}</div><b data-rxl-fb-donet></b><p class="rx-hint">L'équipe RoNova est prévenue sur Discord. Merci de nous aider à améliorer l'extension !</p><button type="button" class="rx-sec" data-rxl-fb-again>Envoyer autre chose</button></div></div>`
  );
};

function rbxlFbQ(sel) {
  return document.querySelector(`#rx-panel [${sel}]`);
}

function rbxlFbStatus(text, bad) {
  const s = rbxlFbQ("data-rxl-fb-status");
  if (!s) return;
  s.textContent = text;
  s.classList.toggle("rxl-fb-bad", !!bad);
}

// Navigateur et version, joints aux bugs (« Opera GX 131 », « Chrome 141 »…).
function rbxlFbBrowser() {
  const d = navigator.userAgentData;
  const b = d && d.brands ? d.brands.find((x) => !/Not|Chromium/i.test(x.brand)) : null;
  if (b) return (b.brand + " " + b.version).slice(0, 40);
  const m = /(OPR|Edg|Firefox|Chrome)\/(\d+)/.exec(navigator.userAgent);
  return m ? ({ OPR: "Opera", Edg: "Edge" }[m[1]] || m[1]) + " " + m[2] : "";
}

// Ce qui part avec le message, affiché tel quel pour que le joueur sache ce qu'il envoie.
function rbxlFbChips() {
  const box = rbxlFbQ("data-rxl-fb-chips");
  if (!box) return;
  const chips = ["RoNova v" + chrome.runtime.getManifest().version];
  if (rbxlFb.kind === "bug") {
    const p = location.pathname;
    chips.push("Page : " + (p.length > 40 ? p.slice(0, 39) + "…" : p));
    const nav = rbxlFbBrowser();
    if (nav) chips.push(nav);
  }
  const nameBox = rbxlFbQ("data-rxl-fb-name");
  if (nameBox && nameBox.checked) {
    const m = document.querySelector('meta[name="user-data"]');
    const name = (typeof rbxMe !== "undefined" && rbxMe && rbxMe.name) || (m && m.getAttribute("data-name")) || "";
    chips.push(name ? "Pseudo : " + name : "Ton pseudo Roblox");
  }
  box.textContent = "";
  chips.forEach((t) => box.appendChild(sxEl("span", "rxl-fb-chip", t)));
}

function rbxlFbUpdate() {
  const ta = rbxlFbQ("data-rxl-fb-text");
  const btn = rbxlFbQ("data-rxl-fb-send");
  if (!ta || !btn) return;
  const len = ta.value.length;
  const ok = ta.value.trim().length >= RBXL_FB_MIN;
  const c = rbxlFbQ("data-rxl-fb-count");
  if (c) {
    c.textContent = `${len} / ${RBXL_FB_MAX}`;
    c.classList.toggle("rxl-fb-bad", len > RBXL_FB_MAX - 100);
  }
  const bar = rbxlFbQ("data-rxl-fb-bar");
  if (bar) {
    bar.style.width = Math.min(100, (len / RBXL_FB_MAX) * 100).toFixed(1) + "%";
    bar.classList.toggle("rxl-fb-low", !ok);
  }
  const tpl = rbxlFbQ("data-rxl-fb-tpl");
  if (tpl) tpl.hidden = rbxlFb.kind !== "bug" || !!ta.value.trim();
  const wait = Math.ceil((rbxlFb.until - Date.now()) / 1000);
  btn.disabled = rbxlFb.busy || !ok || wait > 0;
  btn.textContent = rbxlFb.busy ? "Envoi…" : wait > 0 ? `Patiente ${wait} s` : RBXL_FB[rbxlFb.kind].send;
  if (wait > 0 && !rbxlFb.tick) {
    rbxlFb.tick = setInterval(() => {
      if (Date.now() < rbxlFb.until && rbxlFbQ("data-rxl-fb-send")) return rbxlFbUpdate();
      clearInterval(rbxlFb.tick);
      rbxlFb.tick = 0;
      rbxlFbUpdate();
    }, 1000);
  }
}

function rbxlFbKind(kind) {
  const ta = rbxlFbQ("data-rxl-fb-text");
  if (!ta || !RBXL_FB[kind]) return;
  rbxlFbView(false);
  rbxlFb.draft[rbxlFb.kind] = ta.value;
  rbxlFb.kind = kind;
  ta.value = rbxlFb.draft[kind];
  document.querySelectorAll("#rx-panel [data-rxl-fb-kind]").forEach((b) => b.classList.toggle("rx-active", b.dataset.rxlFbKind === kind));
  rbxlFbQ("data-rxl-fb-label").textContent = RBXL_FB[kind].label;
  rbxlFbQ("data-rxl-fb-hint").textContent = RBXL_FB[kind].hint;
  rbxlFbStatus("");
  rbxlFbChips();
  rbxlFbUpdate();
}

// done = true : écran « Merci » à la place du formulaire.
function rbxlFbView(done) {
  const form = rbxlFbQ("data-rxl-fb-form");
  const ok = rbxlFbQ("data-rxl-fb-done");
  if (!form || !ok) return;
  form.hidden = done;
  ok.hidden = !done;
  if (done) rbxlFbQ("data-rxl-fb-donet").textContent = RBXL_FB[rbxlFb.kind].done;
}

async function rbxlFbSend() {
  const ta = rbxlFbQ("data-rxl-fb-text");
  if (!ta || rbxlFb.busy || Date.now() < rbxlFb.until) return;
  const text = ta.value.trim();
  if (text.length < RBXL_FB_MIN) return;
  rbxlFb.busy = true;
  rbxlFbStatus("");
  rbxlFbUpdate();
  const body = { kind: rbxlFb.kind, text, ver: chrome.runtime.getManifest().version };
  if (rbxlFb.kind === "bug") Object.assign(body, { page: location.pathname.slice(0, 200), nav: rbxlFbBrowser() });
  const nameBox = rbxlFbQ("data-rxl-fb-name");
  if (nameBox && nameBox.checked) {
    const me = await rbxCurrentUser().catch(() => null);
    if (me && me.id) Object.assign(body, { uid: me.id, name: me.name });
  }
  const r = await rbxBvApi("POST", "/feedback", body);
  rbxlFb.busy = false;
  if (r.ok) {
    ta.value = "";
    rbxlFb.draft[rbxlFb.kind] = "";
    rbxlFb.until = Date.now() + 30000;
    rbxlFbView(true);
  } else rbxlFbStatus((r.data && r.data.error) || "Envoi impossible, vérifie ta connexion", true);
  rbxlFbUpdate();
}

document.addEventListener("input", (e) => {
  if (e.target && e.target.matches && e.target.matches("#rx-panel [data-rxl-fb-text]")) rbxlFbUpdate();
});

document.addEventListener("change", (e) => {
  if (e.target && e.target.matches && e.target.matches("#rx-panel [data-rxl-fb-name]")) rbxlFbChips();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey) && e.target && e.target.matches && e.target.matches("#rx-panel [data-rxl-fb-text]")) {
    e.preventDefault();
    rbxlFbSend();
  }
});

document.addEventListener("click", (e) => {
  const t = e.target && e.target.closest && e.target.closest("#rx-panel [data-rxl-fb-kind], #rx-panel [data-rxl-fb-send], #rx-panel [data-rxl-fb-tpl], #rx-panel [data-rxl-fb-again]");
  if (!t) return;
  if (t.dataset.rxlFbKind) return rbxlFbKind(t.dataset.rxlFbKind);
  if (t.hasAttribute("data-rxl-fb-send")) return rbxlFbSend();
  const ta = rbxlFbQ("data-rxl-fb-text");
  if (t.hasAttribute("data-rxl-fb-again")) rbxlFbView(false);
  else if (ta && !ta.value.trim()) ta.value = RBXL_FB.bug.tpl;
  if (!ta) return;
  rbxlFbUpdate();
  ta.focus();
  // Curseur à la fin de la première ligne du modèle, prêt à écrire.
  const i = ta.value.indexOf("\n");
  if (i > 0) ta.setSelectionRange(i, i);
});

// Thèmes exclusifs : le dégradé et l'effet verre s'affichent dessous, dans le même sous-onglet.
const rbxlSubBodyPrev = rbxSubBody;
rbxSubBody = function (sub) {
  let h = rbxlSubBodyPrev(sub);
  if (sub.id !== "themes") return h;
  h = h.replace("dans l'onglet Dégradé", "juste en dessous");
  if (rbxlGradSub) h += `<div class="rxl-block"><div class="rx9-heading">Dégradé personnalisé</div>${rbxlSubBodyPrev(rbxlGradSub)}</div>`;
  if (rbxlGlassSub) h += `<div class="rxl-block"><div class="rx9-heading">Effet verre</div>${rbxlSubBodyPrev(rbxlGlassSub)}</div>`;
  return h;
};

function rbxlLabelOf(el) {
  const l = el.querySelector(".rx-label");
  return l ? l.textContent.trim() : "";
}

// Onglet Amis : 5 sous-onglets au lieu de 6, et les alertes rangées dans « Réglages » au lieu d'être au-dessus.
// Les identifiants des volets restent ceux des autres fichiers (all, best, incoming, join) : leur code marche tel quel.
function rbxlTidyFriends(ov) {
  const sec = ov.querySelector('.rx-section[data-section="friends"]');
  const nav = sec && sec.querySelector(".sx-subtabs");
  if (!nav || nav.dataset.rxlTidy) return;
  nav.dataset.rxlTidy = "1";
  const pane = (id) => sec.querySelector(`.sx-sub[data-soc-pane="${id}"]`);
  const tab = (id) => nav.querySelector(`.sx-subtab[data-soc-sub="${id}"]`);
  const heading = (text) => sxEl("div", "rx9-heading rxl-pane-head", text);
  // Rassemble le volet « from » sous un titre à la fin du volet « into », puis retire son onglet.
  const merge = (into, from, title) => {
    const a = pane(into);
    const b = pane(from);
    if (!a || !b) return;
    a.appendChild(heading(title));
    while (b.firstChild) a.appendChild(b.firstChild);
    b.remove();
    const t = tab(from);
    if (t) t.remove();
  };

  const join = pane("join");
  const incoming = pane("incoming");
  if (incoming) incoming.insertBefore(heading("Demandes reçues"), incoming.firstChild);
  merge("incoming", "requests", "Demandes envoyées");
  if (join) join.insertBefore(heading("Rejoindre"), join.firstChild);
  merge("join", "unfriend", "Retirer des amis");

  // Réglages : alertes de connexion (au-dessus des onglets jusqu'ici) et bouton Amis flottant.
  const set = sxEl("div", "sx-sub");
  set.dataset.socPane = "settings";
  set.appendChild(heading("Alertes"));
  let el = nav.previousElementSibling;
  const top = [];
  while (el && !el.classList.contains("rx9-head")) {
    top.unshift(el);
    el = el.previousElementSibling;
  }
  top.forEach((n) => set.appendChild(n));
  const fab = sec.querySelector('[data-key="showFriendsBtn"]');
  const fabRow = fab && fab.closest(".rx-row");
  if (fabRow) {
    set.appendChild(heading("Accès rapide"));
    const g = sxEl("div", "rx-group");
    g.appendChild(fabRow);
    set.appendChild(g);
  }
  sec.appendChild(set);
  const setTab = sxEl("button", "sx-subtab", "Réglages");
  setTab.type = "button";
  setTab.dataset.socSub = "settings";
  nav.appendChild(setTab);

  const names = { all: "Mes amis", best: "Best friends", incoming: "Demandes", join: "Outils" };
  ["all", "best", "incoming", "join", "settings"].forEach((id) => {
    const t = tab(id);
    if (!t) return;
    const count = t.querySelector(".rx11-count");
    if (names[id]) t.textContent = names[id];
    if (count) t.appendChild(count);
    nav.appendChild(t);
  });
}

// Jeux masqués : le volet de l'onglet Activité rejoint l'onglet Accueil (même liste, mêmes boutons).
function rbxlTidyHomeGames(ov) {
  const box = ov.querySelector("[data-rxl-homegames]");
  const pane = ov.querySelector('.rx-section[data-section="activity"] .sx-sub[data-soc-pane="hidden"]');
  if (!box || !pane) return;
  while (pane.firstChild) box.appendChild(pane.firstChild);
  pane.remove();
  const tab = ov.querySelector('.rx-section[data-section="activity"] .sx-subtab[data-soc-sub="hidden"]');
  if (tab) tab.remove();
}

function rbxlTidy(ov) {
  [rbxlTidyFriends, rbxlTidyHomeGames].forEach((fn) => {
    try {
      fn(ov);
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
  ov.querySelectorAll(".rx-theme[data-theme]").forEach((b) => {
    if (RBXL_DROP_THEMES.indexOf(b.dataset.theme) !== -1) b.remove();
  });
  const news = ov.querySelector(".rx5-news");
  if (news) news.remove();
  const styles = ov.querySelector('.rx-section[data-section="styles"]');
  if (styles) {
    const head = styles.querySelector(":scope > .rx9-head");
    const panel = [...styles.children].find((c) => rbxlLabelOf(c) === "Panneau et boutons flottants");
    if (panel) styles.insertBefore(panel, head ? head.nextSibling : styles.firstChild);
    // Notifications des best friends : toujours actives, plus de réglage.
    const notif = [...styles.children].find((c) => rbxlLabelOf(c) === "Notifications des best friends");
    if (notif) notif.remove();
  }
  // Bloc Outils : seuls les jeux récents restent. Convertisseur et recherche de joueur retirés, « aller à un ID » passe
  // par la recherche du panneau (Ctrl K), le temps de jeu vient de Roblox (volet Temps de jeu).
  const act = ov.querySelector('.rx-section[data-section="activity"]');
  if (act && !act.querySelector("[data-rxl-tools]")) {
    const box = sxEl("div", "rxl-block");
    box.dataset.rxlTools = "1";
    box.innerHTML = rbxSectionBody({ id: "tools", label: "Outils", fields: [] });
    box.querySelectorAll(".rx-group").forEach((g) => {
      if (!g.querySelector("[data-tools-recent]")) g.remove();
    });
    const recent = box.querySelector(".rx-group");
    if (recent) recent.classList.remove("rx-spaced");
    act.appendChild(box);
  }
  const outfits = ov.querySelector('.rx-section[data-section="outfits"]');
  if (outfits && !outfits.querySelector("[data-rxl-sb]")) outfits.insertAdjacentHTML("beforeend", rbxlSbHtml());
}

const rbxlBuildPrev = rbxBuildPanel;
rbxBuildPanel = function () {
  const had = !!document.getElementById("rx-overlay");
  rbxlBuildPrev();
  if (had) return;
  const ov = document.getElementById("rx-overlay");
  if (!ov) return;
  try {
    rbxlTidy(ov);
    rbxlMyRender();
    rbxUpdateAdminTab();
    ov.addEventListener("click", (e) => {
      const t = e.target.closest && e.target.closest("[data-rxl-pane], [data-rxl-title-del], [data-rxl-bg]");
      if (!t) return;
      if (t.dataset.rxlPane) {
        rbxlAdminPane = t.dataset.rxlPane;
        rbxlShowAdminPane();
      } else if (t.dataset.rxlBg === "clear") rbxlBgClear();
      else rbxlTitleRemove(t.dataset.rxlTitleDel);
    });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
};

const rbxlShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxlShowTabPrev(id);
  if (id === "activity" && typeof rbxRecentRender === "function") rbxRecentRender();
  if (id === "home") {
    rbxlHomeRender();
    rbx6RenderHidden();
  }
  if (id === "outfits") rbxlSbShow();
  if (id === "feedback") {
    rbxlFbChips();
    rbxlFbUpdate();
  }
  return r;
};

// ---------- Admin : sous-onglets ----------

function rbxlPaneFor(el) {
  if (el.classList.contains("rx12-stats")) return "licenses";
  if (el.classList.contains("rx-actions")) return "settings";
  const label = rbxlLabelOf(el);
  if (!label) return "";
  const hit = RBXL_ADMIN_PANES.find((p) => p[2].some((t) => label.indexOf(t) === 0));
  return hit ? hit[0] : "settings";
}

function rbxlShowAdminPane() {
  const body = document.querySelector("#rx-panel [data-admin-body]");
  if (!body) return;
  body.querySelectorAll("[data-rxl-pane]").forEach((b) => b.classList.toggle("rx-active", b.dataset.rxlPane === rbxlAdminPane));
  body.querySelectorAll("[data-rxl-section]").forEach((s) => s.classList.toggle("rx-active", s.dataset.rxlSection === rbxlAdminPane));
}

function rbxlGroupAdmin() {
  const body = document.querySelector("#rx-panel [data-admin-body]");
  if (!body || !rbxAdmin || body.querySelector(":scope > .rxl-subtabs")) return;
  const kids = [...body.children];
  if (!kids.length) return;
  const panes = new Map(RBXL_ADMIN_PANES.map(([id]) => [id, sxEl("div", "rxl-sub")]));
  let last = "licenses";
  kids.forEach((k) => {
    // Un bloc vide est un conteneur rempli plus tard : il suit le bloc qui le précède.
    const p = rbxlPaneFor(k) || last;
    last = p;
    panes.get(p).appendChild(k);
  });
  const nav = sxEl("nav", "rxl-subtabs");
  RBXL_ADMIN_PANES.forEach(([id, label]) => {
    if (!panes.get(id).children.length) return;
    const b = sxBtn(label, "rxl-subtab");
    b.dataset.rxlPane = id;
    nav.appendChild(b);
  });
  body.appendChild(nav);
  panes.forEach((el, id) => {
    if (!el.children.length) return;
    el.dataset.rxlSection = id;
    body.appendChild(el);
  });
  if (!panes.get(rbxlAdminPane).children.length) rbxlAdminPane = "licenses";
  rbxlShowAdminPane();
}

const rbxlRenderAdminPrev = rbxRenderAdmin;
rbxRenderAdmin = async function () {
  const r = await rbxlRenderAdminPrev.apply(this, arguments);
  try {
    const body = document.querySelector("#rx-panel [data-admin-body]");
    if (body && rbxAdmin && !body.querySelector("[data-rxl-srv]")) body.insertAdjacentHTML("beforeend", rbxlSrvHtml());
    rbxlGroupAdmin();
    rbxlTitlesRender();
    if (rbxlAdminPane === "server") rbxlSrvLoad();
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
  return r;
};

// ---------- Catégorie Admin du menu ----------

// Une entrée Admin du menu affiche l'onglet Admin sur le bon volet. Si l'onglet Admin est déjà ouvert, on change
// seulement de volet, sans tout reconstruire.
const rbxlAdmShowPrev = rbxShowTab;
rbxShowTab = function (id) {
  // Ancienne entrée « Admin » (raccourci secret, recherche du panneau) : le volet en cours.
  if (id === "admin") id = "adm-" + rbxlAdminPane;
  const hit = RBXL_ADM.find((a) => a[0] === id);
  if (!hit) return rbxlAdmShowPrev(id);
  if (!(rbxAdmin || rbxSecretOpen)) return;
  const sec = document.querySelector('#rx-panel .rx-section[data-section="admin"]');
  const ready = sec && sec.classList.contains("rx-active") && sec.querySelector("[data-admin-body] > .rxl-subtabs");
  rbxlAdminPane = hit[1];
  const r = ready ? undefined : rbxlAdmShowPrev("admin");
  document.querySelectorAll("#rx-panel .rx-tab").forEach((b) => b.classList.toggle("rx-active", b.dataset.tab === id));
  const h3 = sec && sec.querySelector(".rx9-head h3");
  const desc = sec && sec.querySelector(".rx9-head p");
  if (h3 && rbxAdmin) h3.textContent = hit[2];
  if (desc && rbxAdmin) desc.textContent = hit[3];
  if (ready) {
    rbxlShowAdminPane();
    if (hit[1] === "server") rbxlSrvLoad();
  }
  return r;
};

// Entrées Admin visibles seulement pour les admins (ou après le code secret : seulement la première, pour la configuration).
const rbxlUpdateAdminPrev = rbxUpdateAdminTab;
rbxUpdateAdminTab = function () {
  rbxlUpdateAdminPrev();
  const nav = document.querySelector("#rx-panel .rx-tabs");
  if (!nav) return;
  const open = !!(rbxAdmin || rbxSecretOpen);
  RBXL_ADM.forEach(([id], i) => {
    const b = nav.querySelector(`.rx-tab[data-tab="${id}"]`);
    if (b) b.classList.toggle("rxl-adm-on", open && (rbxAdmin || i === 0));
  });
  // Titre « Admin » de la catégorie : juste avant l'ancienne entrée Admin (toujours cachée).
  let head = nav.querySelector('.rx-tab[data-tab="admin"]');
  while (head && !head.classList.contains("rx6-group")) head = head.previousElementSibling;
  if (head) head.hidden = !open;
  const active = nav.querySelector(".rx-tab.rx-active");
  if (!open && active && active.dataset.tab.indexOf("adm-") === 0) rbxShowTab("themes");
};

// ---------- Admin > Serveur : état du serveur Cloudflare, chiffres, synchro GitHub ----------

const rbxlSrv = { busy: false };

function rbxlSrvHtml() {
  return `<div class="rx-group" data-rxl-srv><div class="rx-col"><span class="rx-label">Serveur RoNova</span><p class="rx-hint">Le serveur Cloudflare qui gère les bannières, les badges, la traduction et la boîte à idées.</p><div class="rxl-srv-grid" data-rxl-srv-stats></div><div class="rx-actions"><button type="button" class="rx-sec" data-rxl-srv-act="refresh">Actualiser</button><button type="button" class="rx-sec" data-rxl-srv-act="copy">Copier le code du serveur</button><a class="rx-sec" href="https://dash.cloudflare.com/" target="_blank" rel="noopener">Ouvrir Cloudflare</a><a class="rx-sec" href="https://github.com/itssnyrozz/RobloxCustomizer" target="_blank" rel="noopener">Dépôt GitHub</a></div><p class="rx-hint">Pour mettre le serveur à jour : copie son code, puis dans Cloudflare > rbx-banners > Edit code, Ctrl+A, colle et Deploy.</p></div></div>`;
}

function rbxlMsg(msg) {
  return new Promise((res) => {
    chrome.runtime.sendMessage(msg, (r) => res(chrome.runtime.lastError ? null : r || null));
  });
}

// cards : [nom, valeur, état] avec état "ok", "bad" ou "" (neutre).
function rbxlSrvDraw(cards) {
  const box = document.querySelector("#rx-panel [data-rxl-srv-stats]");
  if (!box) return;
  box.textContent = "";
  cards.forEach(([label, value, state]) => {
    const c = sxEl("div", "rxl-srv-card" + (state ? " rxl-srv-" + state : ""));
    c.appendChild(sxEl("span", "rxl-srv-k", label));
    c.appendChild(sxEl("b", "rxl-srv-v", String(value)));
    box.appendChild(c);
  });
}

async function rbxlSrvLoad() {
  if (rbxlSrv.busy || !document.querySelector("#rx-panel [data-rxl-srv-stats]")) return;
  rbxlSrv.busy = true;
  rbxlSrvDraw([["Serveur", "Vérification…", ""]]);
  try {
    const admin = (await rbxStoreGet([RBX_BV_ADMIN_KEY]))[RBX_BV_ADMIN_KEY] || "";
    const t0 = performance.now();
    // Tout est demandé en même temps : le temps d'attente est celui de la requête la plus lente.
    const [ping, stats, local, sync] = await Promise.all([
      rbxBvApi("GET", "/titles").then((r) => Object.assign(r, { ms: Math.round(performance.now() - t0) })),
      admin ? rbxBvApi("GET", "/admin/stats", undefined, { admin }) : null,
      rbxlMsg({ type: "workerCode" }),
      rbxlMsg({ type: "devSync" })
    ]);
    const m = /const WORKER_VERSION = "([^"]+)"/.exec((local && local.code) || "");
    const want = m ? m[1] : "";
    const s = stats && stats.ok && stats.data ? stats.data : null;
    let code = ["—", ""];
    if (!admin) code = ["Clé de modération manquante (Admin > En ligne)", "bad"];
    else if (stats && stats.status === 401) code = ["Clé de modération refusée", "bad"];
    else if (stats && stats.status === 404) code = ["À redéployer (version trop ancienne)", "bad"];
    else if (s) code = !want || s.version === want ? ["À jour", "ok"] : [`À redéployer (${s.version} → ${want})`, "bad"];
    const num = (v) => (s && v >= 0 ? v : "—");
    const yes = (v, ok, bad) => (s ? (v ? [ok, "ok"] : [bad, "bad"]) : ["—", ""]);
    rbxlSrvDraw([
      ["Serveur", ping.ok ? `En ligne · ${ping.ms} ms` : "Injoignable", ping.ok ? "ok" : "bad"],
      ["Code du serveur", ...code],
      ["Synchro GitHub", sync ? (sync.err ? sync.err : "OK") : "Indisponible", sync ? (sync.err ? "bad" : "ok") : ""],
      ["Idées et bugs reçus", num(s && s.feedback), ""],
      ["Bannières publiées", num(s && s.banners), ""],
      ["Jeux préférés publics", num(s && s.favs), ""],
      ["Badges offerts", num(s && s.titles), ""],
      ["IA (modération, traduction)", ...yes(s && s.config.ai, "Branchée", "Absente")],
      ["Webhook Discord", ...yes(s && s.config.webhook, "Configuré", "Manquant")]
    ]);
  } finally {
    rbxlSrv.busy = false;
  }
}

async function rbxlSrvCopy() {
  const r = await rbxlMsg({ type: "workerCode" });
  if (!r || !r.code) return rbxToast("Code du serveur introuvable dans le dossier de l'extension", 4000);
  rbxCopyText(r.code, "Code du serveur copié : colle-le dans Cloudflare > Edit code");
}

document.addEventListener("click", (e) => {
  const t = e.target && e.target.closest && e.target.closest("#rx-panel [data-rxl-srv-act]");
  if (!t) return;
  if (t.dataset.rxlSrvAct === "copy") rbxlSrvCopy();
  else rbxlSrvLoad();
});

// ---------- Badges offerts en ligne (serveur worker/, route /titles) ----------

const RBXL_TITLES_KEY = "rbxCustomizerTitles";
const RBXL_TITLES_TTL = 600000;
const RBXL_BASE_TITLES = RBX_TITLES.slice();
const rbxlTitles = { list: [], at: 0, busy: false };

function rbxlTitlesUse(list) {
  rbxlTitles.list = Array.isArray(list) ? list : [];
  // Un badge désactivé masque aussi le titre écrit dans le code pour le même joueur (ex. « E-boy »).
  const online = new Set(rbxlTitles.list.concat(rbxlTitlesOff()).map((t) => Number(t.id)));
  RBX_TITLES.length = 0;
  RBX_TITLES.push(...RBXL_BASE_TITLES.filter((t) => !online.has(Number(t.id))), ...rbxlTitles.list);
  rbxBadgeBump();
}

// Badges désactivés : retirés de la liste en ligne (plus personne ne les voit), gardés ici pour les remettre d'un clic.
RBX_DEFAULTS.titlesOff = [];

function rbxlTitlesOff() {
  return Array.isArray(rbxSaved.titlesOff) ? rbxSaved.titlesOff : [];
}

// ver : version annoncée par /ping ; la liste n'est relue que si elle a changé (ou après 10 min sans signal).
async function rbxlTitlesLoad(force, ver) {
  if (rbxlTitles.busy) return;
  rbxlTitles.busy = true;
  try {
    let c = (await rbxStoreGet([RBXL_TITLES_KEY]))[RBXL_TITLES_KEY];
    if (ver && c && ver <= (c.v || 0)) return;
    if (force || ver || !c || Date.now() - c.at > RBXL_TITLES_TTL) {
      const r = await rbxBvApi("GET", "/titles");
      if (r.ok && Array.isArray(r.data)) {
        c = { at: Date.now(), list: r.data, v: ver || (c && c.v) || 0 };
        await rbxStoreSet({ [RBXL_TITLES_KEY]: c });
      }
    }
    if (c) rbxlTitlesUse(c.list);
  } finally {
    rbxlTitles.busy = false;
  }
}

rbxlTitlesLoad().catch(() => {});

const rbxlAdminHtmlPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  const colors = RBXL_TITLE_COLORS.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  return (
    rbxlAdminHtmlPrev(store) +
    `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Badge certifié à donner</span>
<p class="rx-hint">Le joueur le reçoit en quelques secondes, sans clé à entrer. Il faut GitHub connecté (Licences, Premium automatique).</p>
<div class="rx-inline"><input type="text" placeholder="Pseudo ou ID du joueur" data-admin-input="rxlCertUser"><select data-admin-input="rxlCertDays"><option value="0">À vie</option><option value="365">1 an</option><option value="30">30 jours</option></select><button type="button" class="rx-sec rx-cert-btn" data-act="rxlCertGive">Donner la certif</button></div></div></div>
<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Badges offerts</span>
<p class="rx-hint">Donne un badge à n'importe quel joueur : tous ceux qui ont l'extension le voient à côté de son pseudo, en quelques secondes. Utilise la clé de modération enregistrée dans En ligne.</p>
<div class="rx-inline"><input type="text" placeholder="Pseudo ou ID du joueur" data-admin-input="rxlTitleUser"><input type="text" maxlength="24" placeholder="Texte du badge" data-admin-input="rxlTitleLabel"><select data-admin-input="rxlTitleColor">${colors}</select><button type="button" class="rx-sec" data-act="rxlTitleGive">Donner le badge</button></div>
<div class="rx-list" data-rxl-titles></div></div></div>`
  );
};

function rbxlTitlesRender() {
  const box = document.querySelector("#rx-panel [data-rxl-titles]");
  if (!box) return;
  box.textContent = "";
  const online = new Set(rbxlTitles.list.map((t) => Number(t.id)));
  const rows = rbxlTitles.list.map((t) => ({ ...t, on: true })).concat(rbxlTitlesOff().filter((t) => !online.has(Number(t.id))).map((t) => ({ ...t, on: false })));
  if (!rows.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun badge offert pour l'instant."));
    return;
  }
  rows.forEach((t) => {
    const row = sxEl("div", "rx-li" + (t.on ? "" : " rxl-title-off"));
    row.appendChild(rbxCreatorBadge({ id: t.id, label: t.label, color: t.color, title: true }, true));
    row.appendChild(sxEl("span", "rx-li-name", "ID " + t.id + (t.on ? "" : " · désactivé")));
    const sw = sxEl("label", "rx-switch");
    sw.title = t.on ? "Désactiver ce badge pour tout le monde" : "Réactiver ce badge pour tout le monde";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = t.on;
    input.dataset.rxlTitleToggle = String(t.id);
    sw.appendChild(input);
    sw.appendChild(document.createElement("i"));
    row.appendChild(sw);
    const del = sxBtn("Retirer", "rx-sec rx-danger");
    del.dataset.rxlTitleDel = String(t.id);
    row.appendChild(del);
    box.appendChild(row);
  });
}

async function rbxlAdminKey() {
  const k = (await rbxStoreGet([RBX_BV_ADMIN_KEY]))[RBX_BV_ADMIN_KEY];
  if (!k) rbxToast("Enregistre d'abord la clé de modération (Admin > En ligne)", 4000);
  return k || "";
}

async function rbxlTitlesSave(list) {
  const admin = await rbxlAdminKey();
  if (!admin) return false;
  const r = await rbxBvApi("PUT", "/admin/titles", list, { admin });
  if (!r.ok) {
    rbxToast(r.status === 401 ? "Clé de modération refusée" : "Serveur injoignable, réessaie", 4000);
    return false;
  }
  await rbxlTitlesLoad(true);
  rbxlTitlesRender();
  return true;
}

function rbxlResolveUser(input) {
  const v = String(input || "").trim();
  if (/^\d+$/.test(v)) return Promise.resolve(Number(v));
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "resolveUser", username: v }, (res) => {
      const d = !chrome.runtime.lastError && res && res.ok && res.data && Array.isArray(res.data.data) ? res.data.data[0] : null;
      resolve(d && d.id ? Number(d.id) : 0);
    });
  });
}

// Même liste en ligne que « Chercher un joueur » (Licences), en un seul formulaire.
async function rbxlCertGive(input, days) {
  if (!(await rbxCloudAdminState()).token) return rbxToast("Connecte d'abord GitHub : Licences, Premium automatique", 5000);
  const v = input.value.trim().replace(/^@/, "");
  const id = await rbxlResolveUser(v);
  if (!id) return rbxToast("Joueur introuvable");
  try {
    await rbxCloudGive(id, /^\d+$/.test(v) ? "" : v, days, "cert");
    input.value = "";
    rbxToast(`Certif donnée à ${v} : active chez lui en quelques secondes`, 4500);
    rbxCloudRender();
  } catch (e) {
    rbxToast(e.message || "Erreur", 5000);
  }
}

async function rbxlTitleRemove(id) {
  if (!rbxAdmin || !confirm(`Retirer le badge du joueur ${id} ?`)) return;
  rbxSet({ titlesOff: rbxlTitlesOff().filter((t) => String(t.id) !== String(id)) });
  await rbxlTitlesLoad(true);
  if (!rbxlTitles.list.some((t) => String(t.id) === String(id))) return rbxlTitlesRender();
  if (await rbxlTitlesSave(rbxlTitles.list.filter((t) => String(t.id) !== String(id)))) rbxToast("Badge retiré");
}

// Activer / désactiver un badge offert (par exemple Co-creator) sans perdre son texte ni sa couleur.
async function rbxlTitleToggle(input) {
  const id = Number(input.dataset.rxlTitleToggle);
  if (!rbxAdmin || !id) return;
  input.disabled = true;
  try {
    await rbxlTitlesLoad(true);
    const cur = rbxlTitles.list.find((t) => Number(t.id) === id);
    if (!input.checked && cur) {
      if (!(await rbxlTitlesSave(rbxlTitles.list.filter((t) => Number(t.id) !== id)))) return;
      rbxSet({ titlesOff: [...rbxlTitlesOff().filter((t) => Number(t.id) !== id), cur] });
      rbxlTitlesUse(rbxlTitles.list);
      rbxToast(`Badge « ${cur.label} » désactivé pour tout le monde`);
    } else if (input.checked) {
      const off = rbxlTitlesOff().find((t) => Number(t.id) === id);
      if (off && !cur && !(await rbxlTitlesSave([...rbxlTitles.list, { id, label: off.label, color: off.color }]))) return;
      rbxSet({ titlesOff: rbxlTitlesOff().filter((t) => Number(t.id) !== id) });
      rbxlTitlesUse(rbxlTitles.list);
      if (off) rbxToast(`Badge « ${off.label} » réactivé pour tout le monde`);
    }
  } finally {
    input.disabled = false;
    rbxlTitlesRender();
  }
}

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches("#rx-panel [data-rxl-title-toggle]")) rbxlTitleToggle(t).catch(() => rbxlTitlesRender());
});

const rbxlActionPrev = rbxAction;
rbxAction = async function (name) {
  if (name !== "rxlTitleGive" && name !== "rxlCertGive") return rbxlActionPrev(name);
  if (!rbxAdmin) return;
  const inp = (k) => document.querySelector(`#rx-panel [data-admin-input="${k}"]`);
  if (name === "rxlCertGive") return rbxlCertGive(inp("rxlCertUser"), Number(inp("rxlCertDays").value));
  const label = inp("rxlTitleLabel").value.trim().slice(0, 24);
  if (!label) return rbxToast("Écris le texte du badge");
  const id = await rbxlResolveUser(inp("rxlTitleUser").value);
  if (!id) return rbxToast("Joueur introuvable");
  await rbxlTitlesLoad(true);
  const list = rbxlTitles.list.filter((t) => Number(t.id) !== id);
  list.push({ id, label, color: inp("rxlTitleColor").value });
  if (await rbxlTitlesSave(list)) {
    inp("rxlTitleUser").value = "";
    inp("rxlTitleLabel").value = "";
    rbxToast("Badge donné : visible par tous en quelques secondes");
  }
};

// ---------- Premium et certif reçus en quelques secondes (signal du serveur worker/, route /ping) ----------
// La liste GitHub ne peut être relue qu'une fois par minute ; le serveur prévient juste le joueur concerné.

const RBXL_PING_KEY = "rbxCustomizerPing";
const rbxlPing = { seen: null, busy: false };

async function rbxlPingSend(uid) {
  const admin = (await rbxStoreGet([RBX_BV_ADMIN_KEY]))[RBX_BV_ADMIN_KEY];
  if (admin && Number(uid) > 0) await rbxBvApi("PUT", "/admin/ping/" + Number(uid), undefined, { admin });
}

const rbxlCloudAddPrev = rbxCloudAdd;
rbxCloudAdd = async function (key, payload) {
  const r = await rbxlCloudAddPrev(key, payload);
  rbxlPingSend(payload && payload.uid).catch(() => {});
  return r;
};

const rbxlCloudRemovePrev = rbxCloudRemove;
rbxCloudRemove = async function (uid, tier) {
  const r = await rbxlCloudRemovePrev(uid, tier);
  rbxlPingSend(uid).catch(() => {});
  return r;
};

// Une petite requête toutes les 10 s, seulement quand l'onglet Roblox est affiché :
// elle dit si ce joueur a reçu un Premium ou une certif, et si les badges offerts ont changé.
async function rbxlPingTick() {
  const me = rbxMyIdNow();
  if (document.hidden || rbxlPing.busy || rbxCloud.busy || !me) return;
  rbxlPing.busy = true;
  try {
    if (!rbxlPing.seen) rbxlPing.seen = (await rbxStoreGet([RBXL_PING_KEY]))[RBXL_PING_KEY] || {};
    const r = await rbxBvApi("GET", "/ping/" + me);
    if (!r.ok || !r.data) return;
    const v = Number(r.data.v) || 0;
    if (v) await rbxlTitlesLoad(false, v);
    const t = Number(r.data.t) || 0;
    if (!rbxAdmin && t > (Number(rbxlPing.seen[me]) || 0)) {
      rbxlPing.seen = { [me]: t };
      rbxStoreSet({ [RBXL_PING_KEY]: rbxlPing.seen });
      await rbxCloudSync(true);
    }
  } finally {
    rbxlPing.busy = false;
  }
}

rbxEvery(() => rbxlPingTick().catch(() => {}), 10000);

// Synchro GitHub entre développeurs : l'arrière-plan recharge l'extension quand le code a changé
// et renvoie l'erreur éventuelle de la synchro. Inutile pour une extension installée depuis une boutique.
const rbxlDev = { on: !chrome.runtime.getManifest().update_url, err: "" };
rbxEvery(() => {
  if (!rbxlDev.on || document.hidden) return;
  try {
    chrome.runtime.sendMessage({ type: "devSync" }, (r) => {
      if (chrome.runtime.lastError || !r) return;
      if (r.err && r.err !== rbxlDev.err) rbxToast(`Synchro GitHub : ${r.err}`, 8000);
      rbxlDev.err = r.err;
    });
  } catch (e) {
    rbxlDev.on = false;
  }
}, 15000);

// ---------- Police : n'importe quel nom de Google Fonts, chargée une fois puis gardée en cache ----------

const RBXL_FONT_KEY = "rbxCustomizerFont";
const rbxlFont = { name: "", timer: 0 };

function rbxlFontName() {
  return rbxState.enabled ? String(rbxState.font || "").replace(/["';{}<>\\]/g, "").trim() : "";
}

// Police installée sur l'ordinateur : le texte mesuré change par rapport aux polices génériques.
function rbxlFontLocal(name) {
  const ctx = document.createElement("canvas").getContext("2d");
  const w = (f) => {
    ctx.font = "32px " + f;
    return ctx.measureText("mmmmmmmmmmlli1WQ@#").width;
  };
  return ["monospace", "serif", "sans-serif"].some((g) => w(`"${name}", ${g}`) !== w(g));
}

async function rbxlFontLoad(name) {
  const key = name.toLowerCase();
  let c = (await rbxStoreGet([RBXL_FONT_KEY]))[RBXL_FONT_KEY];
  if (!c || c.key !== key) {
    const r = rbxlFontLocal(name) ? { ok: false } : await new Promise((res) => chrome.runtime.sendMessage({ type: "fontLoad", name }, (x) => res(chrome.runtime.lastError ? null : x)));
    if (!r) return;
    // Même vide (police installée sur l'ordinateur), le résultat est gardé pour ne pas redemander.
    c = { key, faces: r.ok ? r.faces : [] };
    await rbxStoreSet({ [RBXL_FONT_KEY]: c });
  }
  if (name !== rbxlFontName()) return;
  for (const f of c.faces) {
    const bin = Uint8Array.from(atob(f.b64), (ch) => ch.charCodeAt(0));
    const face = new FontFace(name, bin.buffer, { weight: f.weight, style: f.style, unicodeRange: f.range || "U+0-10FFFF" });
    document.fonts.add(await face.load());
  }
}

function rbxlFontCheck() {
  const name = rbxlFontName();
  if (name === rbxlFont.name) return;
  rbxlFont.name = name;
  clearTimeout(rbxlFont.timer);
  // Attente pendant la frappe : pas de téléchargement pour chaque lettre.
  if (name) rbxlFont.timer = setTimeout(() => rbxlFontLoad(name).catch(() => {}), 700);
}

// ---------- Modération IA (serveur worker/, route /moderate) ----------
// Verdicts gardés dans ce navigateur : un même contenu n'est jamais envoyé deux fois.

const RBXL_MOD_KEY = "rbxCustomizerModeration";

async function rbxlModKey(kind, value) {
  if (value.length < 300) return kind + ":" + value;
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return kind + "#" + rbxBytesToB64u(new Uint8Array(d));
}

// true = autorisé, false = refusé, null = serveur injoignable.
async function rbxlModerate(kind, value) {
  if (!rbxlMod.ok) rbxlMod.ok = new Map(Object.entries((await rbxStoreGet([RBXL_MOD_KEY]))[RBXL_MOD_KEY] || {}));
  const key = await rbxlModKey(kind, value);
  if (rbxlMod.ok.has(key)) return rbxlMod.ok.get(key);
  // Deux demandes pour le même contenu attendent la même réponse.
  if (!rbxlMod.pending.has(key)) rbxlMod.pending.set(key, rbxlModAsk(kind, value).finally(() => rbxlMod.pending.delete(key)));
  const safe = await rbxlMod.pending.get(key);
  if (safe === null || rbxlMod.ok.has(key)) return safe;
  rbxlMod.ok.set(key, safe);
  while (rbxlMod.ok.size > 500) rbxlMod.ok.delete(rbxlMod.ok.keys().next().value);
  rbxStoreSet({ [RBXL_MOD_KEY]: Object.fromEntries(rbxlMod.ok) });
  return safe;
}

// Sans réponse en 20 s, le serveur est considéré comme injoignable.
async function rbxlModAsk(kind, value) {
  const body = kind === "t" ? { text: value } : { url: /^data:/.test(value) ? await rbxlThumb(value) : value };
  const r = await Promise.race([rbxBvApi("POST", "/moderate", body), new Promise((res) => setTimeout(res, 20000, { ok: false }))]);
  return r.ok && r.data && typeof r.data.safe === "boolean" ? r.data.safe : null;
}

// Image (première image d'un GIF) réduite à 512 px en JPEG : envoi léger, format lu par le modèle.
function rbxlThumb(data) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 512 / Math.max(img.naturalWidth, img.naturalHeight, 1));
      const c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.naturalWidth * k));
      c.height = Math.max(1, Math.round(img.naturalHeight * k));
      try {
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.85));
      } catch (e) {
        resolve(data);
      }
    };
    img.onerror = () => resolve(data);
    img.src = data;
  });
}

// Une image plus petite que l'écran est agrandie par le navigateur, qui la lisse : elle paraît floue.
function rbxlBgSizeHint(bg) {
  const z = rbxlBg.size;
  if (!z || z.for !== bg || !z.w || !z.h) return "";
  const dpr = window.devicePixelRatio || 1;
  const k = Math.max((innerWidth * dpr) / z.w, (innerHeight * dpr) / z.h);
  if (k < 1.5) return ` (${z.w} × ${z.h})`;
  const need = `${Math.round(innerWidth * dpr)} × ${Math.round(innerHeight * dpr)}`;
  return ` Elle est petite (${z.w} × ${z.h}) : agrandie ×${k.toFixed(1).replace(".", ",")} pour remplir ton écran, elle paraît floue. Active « Rendu net » ou choisis une image d'au moins ${need}.`;
}

// Ligne d'état sous le bouton : aucune image, vérification en cours, ou image affichée.
function rbxlBgStatus() {
  const el = document.querySelector("#rx-panel [data-rxl-bgstatus]");
  if (!el) return;
  const bg = String(rbxSaved.bgImage || "");
  const name = bg.replace(/^fichier : /, "").replace(/ \([a-z0-9]{1,4}\)$/, "");
  if (rbxlMod.err) el.textContent = `Erreur : ${rbxlMod.err}`;
  else if (!/^fichier : /.test(bg)) el.textContent = "Aucune image de fond.";
  else if (rbxState.bgImage === RBX_BG_VAR) el.textContent = `✓ « ${name} » est affichée en fond.${rbxlBgSizeHint(bg)}`;
  else el.textContent = `Vérification de « ${name} »… (${rbxlMod.step || "pas démarrée"})`;
}

const rbxlSyncPrev = rbxSyncInputs;
rbxSyncInputs = function () {
  rbxlSyncPrev();
  rbxlBgStatus();
};

// Enregistré tout de suite : un autre onglet Roblox ne peut plus écraser le choix avec ses anciens réglages.
function rbxlBgSet(src) {
  rbxlQuiet(() => rbxSet({ bgImage: src }));
  rbxlQuiet(rbxSave);
  rbxlBgStatus();
}

// Seul « Retirer l'image » (ou un refus de la modération) supprime le fichier gardé.
async function rbxlBgClear() {
  rbxlBg.for = rbxlBg.data = rbxlMod.err = "";
  await rbxlBgDrop();
  rbxlBgSet("");
}

// Fichier gardé en morceaux de 512 Ko : Opera GX perd sans erreur les gros enregistrements d'un seul bloc.
// Index { for, n } sous RBXL_BG_KEY, morceaux sous RBXL_BG_KEY + numéro ; l'index est écrit en dernier.
const RBXL_BG_CHUNK = 512 * 1024;
const rbxlBgKeys = (n) => Array.from({ length: n }, (_, i) => RBXL_BG_KEY + i);

function rbxlBgPut(obj) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("délai dépassé")), 20000);
    chrome.storage.local.set(obj, () => {
      clearTimeout(t);
      const err = chrome.runtime.lastError;
      err ? reject(new Error(err.message)) : resolve();
    });
  });
}

async function rbxlBgDrop() {
  const st = (await rbxStoreGet([RBXL_BG_KEY]))[RBXL_BG_KEY];
  await rbxStoreRemove([RBXL_BG_KEY, ...rbxlBgKeys((st && st.n) || 0)]);
}

let rbxlBgWriting = Promise.resolve();
function rbxlBgStore(src, data) {
  // Écritures à la suite : deux choix rapides ne mélangent pas leurs morceaux.
  return (rbxlBgWriting = rbxlBgWriting.catch(() => {}).then(async () => {
    await rbxlBgDrop();
    const n = Math.ceil(data.length / RBXL_BG_CHUNK);
    for (let i = 0; i < n; i++) {
      if (rbxlBg.for !== src) return;
      await rbxlBgPut({ [RBXL_BG_KEY + i]: data.slice(i * RBXL_BG_CHUNK, (i + 1) * RBXL_BG_CHUNK) });
    }
    if (rbxlBg.for === src) await rbxlBgPut({ [RBXL_BG_KEY]: { for: src, n } });
  }));
}

// { for, data } du fichier gardé, ou null s'il manque un morceau ; l'ancien format d'un seul bloc reste lu.
async function rbxlBgRead() {
  const st = (await rbxStoreGet([RBXL_BG_KEY]))[RBXL_BG_KEY];
  if (!st || !st.for) return null;
  if (st.data) return st;
  const keys = rbxlBgKeys(st.n || 0);
  const parts = await rbxStoreGet(keys);
  if (!keys.length || keys.some((k) => typeof parts[k] !== "string")) return null;
  return { for: st.for, data: keys.map((k) => parts[k]).join("") };
}

document.addEventListener("change", (e) => {
  const t = e.target;
  if (!t || !t.matches || !t.matches("[data-rxl-bgfile]") || !t.files || !t.files[0]) return;
  const file = t.files[0];
  t.value = "";
  rbxlMod.err = "";
  rbxlBgFile(file).catch((err) => rbxlBgErr("lecture du fichier", err));
});

async function rbxlBgFile(file) {
  if (!/^image\/(png|jpeg|gif|webp)$/.test(file.type)) return rbxToast("Choisis une image PNG, JPG, GIF ou WEBP");
  if (file.size > RBXL_BG_MAX) return rbxToast("Image trop lourde : 4 Mo maximum", 4000);
  const data = await new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(String(fr.result));
    fr.onerror = reject;
    fr.readAsDataURL(file);
  });
  // Un identifiant court rend chaque fichier unique : un nouveau fichier du même nom est revérifié.
  const src = `fichier : ${Array.from(file.name).slice(0, 40).join("")} (${Date.now().toString(36).slice(-4)})`;
  // Affichage d'abord, depuis la mémoire ; l'écriture du fichier (jusqu'à 4 Mo) n'est pas attendue : Opera GX peut la confirmer très tard.
  rbxlBg.for = src;
  rbxlBg.data = data;
  rbxlMod.bg = src;
  rbxlBgSet(src);
  rbxToast("Image choisie : vérification en cours…");
  rbxlModBgNow();
  rbxlBgStore(src, data).catch((err) => rbxlBgErr("enregistrement", err));
}

// Image intégrée correspondant à bgImage : en mémoire, sinon dans le stockage.
async function rbxlBgData(src) {
  if (rbxlBg.for === src) return rbxlBg.data;
  const st = await rbxlBgRead();
  const data = st && st.for === src ? st.data : "";
  if (!data) return "";
  rbxlBg.for = src;
  rbxlBg.data = data;
  return data;
}

let rbxlBgShown = "";

function rbxlPalette(src, data) {
  if (rbxlPal.for === src) return;
  rbxlPal.for = src;
  rbxlPal.c = null;
  const img = new Image();
  img.onload = () => {
    if (rbxlPal.for !== src) return;
    rbxlBg.size = { for: src, w: img.naturalWidth, h: img.naturalHeight };
    rbxlBgStatus();
    try {
      rbxlPal.c = rbxlPalFrom(img);
    } catch (e) {
      rbxlPal.c = null;
    }
    if (rbxlPal.c) rbxlRefresh();
  };
  img.src = data;
}

// Image (première image d'un GIF) réduite à 40 × 40 : couleurs regroupées par teinte proche,
// la plus présente donne le fond et les cartes, la plus vive et présente donne l'accent.
function rbxlPalFrom(img) {
  const n = 40;
  const cv = document.createElement("canvas");
  cv.width = cv.height = n;
  const g = cv.getContext("2d", { willReadFrequently: true });
  g.drawImage(img, 0, 0, n, n);
  const px = g.getImageData(0, 0, n, n).data;
  const bins = new Map();
  let lum = 0;
  let count = 0;
  for (let i = 0; i < px.length; i += 4) {
    if (px[i + 3] < 128) continue;
    const r = px[i], gr = px[i + 1], b = px[i + 2];
    const k = ((r >> 4) << 8) | ((gr >> 4) << 4) | (b >> 4);
    let e = bins.get(k);
    if (!e) bins.set(k, (e = { n: 0, r: 0, g: 0, b: 0 }));
    e.n++;
    e.r += r;
    e.g += gr;
    e.b += b;
    lum += (0.2126 * r + 0.7152 * gr + 0.0722 * b) / 255;
    count++;
  }
  if (!count) return null;
  let base = null;
  let acc = null;
  let best = 0;
  for (const e of bins.values()) {
    const rgb = [e.r / e.n, e.g / e.n, e.b / e.n];
    const mx = Math.max(...rgb);
    const sat = mx ? (mx - Math.min(...rgb)) / mx : 0;
    e.hex = rbxToHex(rgb);
    if (!base || e.n > base.n) base = e;
    // Vivacité avant tout : une petite tache vive l'emporte sur une grande zone terne.
    const score = sat * sat * (mx / 255) ** 2 * e.n ** 0.3;
    if (score > best) {
      best = score;
      acc = e;
    }
  }
  const light = lum / count > 0.62;
  let accent = acc && best > 0.15 ? acc.hex : base.hex;
  // Accent toujours lisible sur le fond choisi.
  if (!light && rbxLum(accent) < 0.4) accent = rbxlTone(accent, 0.45);
  if (light && rbxLum(accent) > 0.5) accent = rbxlTone(accent, 0.4);
  return light
    ? { bg: rbxlTone(base.hex, 0.93), card: rbxlTone(base.hex, 0.97), accent }
    : { bg: rbxlTone(base.hex, 0.07), card: rbxlTone(base.hex, 0.12), accent };
}

// Même teinte, ramenée à la luminosité voulue.
function rbxlTone(hex, target) {
  const l = rbxLum(hex);
  if (l > target) return rbxMixHex(hex, "#000000", 1 - target / l);
  return rbxMixHex(hex, "#ffffff", (target - l) / (1 - l || 1));
}

async function rbxlModBg() {
  let bg = String(rbxSaved.bgImage || "").trim();
  if (!bg) {
    // Fond vidé par d'anciens réglages (autre onglet) alors qu'un fichier est gardé : le fichier fait foi.
    // Lu dans le stockage (pas en mémoire) : un « Retirer l'image » fait dans un autre onglet est respecté.
    const st = await rbxlBgRead();
    if (st && !String(rbxSaved.bgImage || "").trim()) {
      rbxlBg.for = st.for;
      rbxlBg.data = st.data;
      bg = rbxlMod.bg = st.for;
      rbxlBgSet(bg);
    }
  }
  const data = bg ? await rbxlBgData(bg) : "";
  if (bg !== String(rbxSaved.bgImage || "").trim()) return;
  // L'image n'est copiée dans la page qu'une fois, quand elle change.
  if (data !== rbxlBgShown) {
    rbxlBgShown = data;
    if (data) document.documentElement.style.setProperty("--rx-bg-img", `url("${data}")`);
    else document.documentElement.style.removeProperty("--rx-bg-img");
  }
  if (data) rbxlPalette(bg, data);
  // Fichier perdu (enregistrement jamais terminé) : on le dit au lieu de rester sur « Vérification… ».
  if (/^fichier : /.test(bg) && !data) rbxlMod.err = "image introuvable, choisis-la à nouveau";
  if (!data) return rbxState.bgImage && rbxlRefresh();
  if (bg === rbxSaved.bgImageOk || rbxlMod.session.has(bg)) return rbxState.bgImage !== RBX_BG_VAR && rbxlRefresh();
  rbxlMod.step = "envoi au serveur";
  rbxlBgStatus();
  const safe = await rbxlModerate("i", data);
  rbxlMod.step = "réponse reçue";
  if (bg !== String(rbxSaved.bgImage || "").trim()) return;
  if (safe === true) {
    rbxlQuiet(() => rbxSet({ bgImageOk: bg }));
  } else if (safe === false) {
    rbxlBgClear();
    rbxToast("Image de fond refusée par la modération : choisis-en une autre", 6000);
  } else {
    rbxlMod.session.add(bg);
    rbxlRefresh();
  }
  rbxlBgStatus();
}

// Lancée directement : ne dépend pas des autres réglages qui changent sur la page.
function rbxlModBgNow() {
  rbxlMod.bg = String(rbxSaved.bgImage || "");
  rbxlMod.step = "chargement de l'image";
  rbxlModBg()
    .catch((err) => rbxlBgErr("vérification", err))
    .then(rbxlBgStatus);
}

// Erreur affichée sous le bouton : plus besoin de la console pour savoir où ça bloque.
function rbxlBgErr(step, err) {
  rbxlMod.err = `${step} (${(err && (err.message || err.name)) || err || "inconnue"})`.slice(0, 160);
  rbxlBgStatus();
}

async function rbxlModTexts() {
  const notes = rbxSaved.userNotes || {};
  const bad = [];
  for (const id of Object.keys(notes)) {
    const n = notes[id];
    if (!n || !n.t || rbxlMod.notes.get(id) === n.t) continue;
    const safe = await rbxlModerate("t", n.t);
    if (safe !== null) rbxlMod.notes.set(id, n.t);
    if (safe === false) bad.push(id);
  }
  const links = Array.isArray(rbxSaved.navLinks) ? rbxSaved.navLinks : [];
  const keep = [];
  for (const l of links) {
    if (l && l.n && (await rbxlModerate("t", String(l.n))) === false) continue;
    keep.push(l);
  }
  const patch = {};
  if (bad.length) {
    const all = { ...(rbxSaved.userNotes || {}) };
    bad.forEach((id) => delete all[id]);
    patch.userNotes = all;
  }
  if (keep.length !== links.length) patch.navLinks = keep;
  if (Object.keys(patch).length) {
    rbxSet(patch);
    rbxToast("Contenu inapproprié supprimé par la modération", 6000);
  }
}

async function rbxlModBanner(b) {
  if (!b || !b.url) return;
  if ((await rbxlModerate("i", b.url)) !== false) return;
  await rbxStoreRemove(RBX_BANNER_KEY);
  rbxToast("Bannière refusée par la modération : choisis une autre image", 6000);
}

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[RBX_BANNER_KEY]) rbxlModBanner(changes[RBX_BANNER_KEY].newValue).catch(() => {});
});

// Seuls les changements de l'image, des notes ou des liens relancent une vérification.
rbxOnChange(() => {
  rbxlFontCheck();
  rbxlBgStatus();
  if (String(rbxSaved.bgImage || "") !== rbxlMod.bg) rbxlModBgNow();
  const texts = [rbxSaved.userNotes, rbxSaved.navLinks];
  if (rbxlMod.texts && texts[0] === rbxlMod.texts[0] && texts[1] === rbxlMod.texts[1]) return;
  rbxlMod.texts = texts;
  clearTimeout(rbxlMod.timer);
  rbxlMod.timer = setTimeout(() => rbxlModTexts().catch(() => {}), 1200);
});

// Premier passage une fois les réglages chargés (le reste suit les changements).
(function rbxlStart() {
  if (!rbxReady) return setTimeout(rbxlStart, 200);
  rbxlFontCheck();
  rbxlModBgNow();
  rbxlMod.texts = [rbxSaved.userNotes, rbxSaved.navLinks];
  rbxlModTexts().catch(() => {});
  rbxStoreGet([RBX_BANNER_KEY]).then((st) => rbxlModBanner(st[RBX_BANNER_KEY])).catch(() => {});
})();

// ---------- Nombre de demandes d'amis à côté de « Friends » (menu de gauche) : retiré ----------

const rbxlCssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const css = rbxlCssPrev(s);
  return s.enabled ? css + "#nav-friends .notification, #nav-friends .notification-blue, [data-rx-fc] { display: none !important; }" : css;
};

// Même chose sur l'accueil : le nombre collé au titre « Friends » de la ligne d'amis (« Friends70 »).
// Titre repéré par son lien vers la page Amis, ou par son texte dans les langues les plus courantes.
const RBXL_FRIENDS_TITLE = /^(friends|amis|amigos|freunde|amici|vrienden|znajomi|arkada[sş]lar|друзья|友達|친구|好友)/i;

function rbxlFriendsCount() {
  if (!rbxState.enabled || !rbxlIsHome() || !document.body) return;
  document.querySelectorAll("h2, h3").forEach((h) => {
    const head = h.parentElement;
    if (!head || head.closest("#rx-overlay, nav, #header") || head.getElementsByTagName("*").length > 40) return;
    if (!RBXL_FRIENDS_TITLE.test(h.textContent.trim()) && !head.querySelector('a[href*="/friends"]')) return;
    head.querySelectorAll("span, div, a").forEach((el) => {
      if (!el.children.length && /^\(?\s*\d[\d\s.,+]*\)?$/.test(el.textContent.trim()) && !el.hasAttribute("data-rx-fc")) el.setAttribute("data-rx-fc", "");
    });
    // Nombre écrit dans le même texte que le titre : « Friends (70) ».
    h.childNodes.forEach((n) => {
      if (n.nodeType === 3 && /\D\s*\(?\s*\d[\d\s.,]*\)?\s*$/.test(n.data)) n.data = n.data.replace(/\s*\(?\s*\d[\d\s.,]*\)?\s*$/, "");
    });
  });
}

rbxEvery(rbxlFriendsCount, 1500);

// ---------- Ligne d'amis de l'accueil : flèches pour la faire défiler sur le côté ----------
// Posées sur l'élément qui défile vraiment (repéré une fois, puis gardé), cachées au bout de la ligne.
const rbxlFr = { sc: null };

function rbxlFrScroller(car) {
  for (const el of [car, ...car.querySelectorAll("div, ul")]) {
    if (el.clientWidth < 200 || el.scrollWidth <= el.clientWidth + 8) continue;
    const ox = getComputedStyle(el).overflowX;
    if (ox === "auto" || ox === "scroll" || ox === "hidden") return el;
  }
  return null;
}

function rbxlFrUpdate() {
  const sc = rbxlFr.sc;
  const host = sc && sc.parentElement;
  if (!host) return;
  const prev = host.querySelector(":scope > .rxl-fr-prev");
  const next = host.querySelector(":scope > .rxl-fr-next");
  if (!prev || !next) return;
  const max = sc.scrollWidth - sc.clientWidth;
  prev.hidden = sc.scrollLeft <= 4;
  next.hidden = sc.scrollLeft >= max - 4;
}

function rbxlFrArrows() {
  const car = rbxState.enabled && document.querySelector("[class*='friends-carousel' i]");
  if (!car) return;
  // Roblox affiche déjà ses propres flèches : on n'en ajoute pas d'autres.
  const native = car.querySelector("button[class*='scroll' i], button[class*='arrow' i], [class*='carousel-button' i]");
  if (native && native.offsetWidth && !native.classList.contains("rxl-fr-arrow")) return;
  let sc = rbxlFr.sc && rbxlFr.sc.isConnected && car.contains(rbxlFr.sc) ? rbxlFr.sc : null;
  if (!sc) {
    sc = rbxlFr.sc = rbxlFrScroller(car);
    if (!sc) return;
    sc.addEventListener("scroll", rbxlFrUpdate, { passive: true });
  }
  const host = sc.parentElement;
  if (!host.querySelector(":scope > .rxl-fr-arrow")) {
    host.classList.add("rxl-fr-host");
    [["prev", "‹", -1, "Amis précédents"], ["next", "›", 1, "Amis suivants"]].forEach(([k, t, dir, label]) => {
      const b = sxEl("button", "rxl-fr-arrow rxl-fr-" + k, t);
      b.type = "button";
      b.setAttribute("aria-label", label);
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (rbxlFr.sc) rbxlFr.sc.scrollBy({ left: dir * rbxlFr.sc.clientWidth * 0.8, behavior: "smooth" });
        setTimeout(rbxlFrUpdate, 450);
      });
      host.appendChild(b);
    });
  }
  rbxlFrUpdate();
}

rbxEvery(rbxlFrArrows, 1500);

// ---------- Page « Tous mes amis » : avatars tous ronds, de la même taille et avec le même anneau ----------

// Repère la page Amis (/users/…/friends, /users/friends) sur la racine : le CSS ne vise que cette page.
rbxEvery(() => {
  const on = /\/users\/(\d+\/)?friends/i.test(location.pathname);
  if (document.documentElement.hasAttribute("data-rx-fp") !== on) document.documentElement.toggleAttribute("data-rx-fp", on);
}, 500);

const rbxlCardsCssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const css = rbxlCardsCssPrev(s);
  if (!s.enabled || !s.uiFriends) return css;
  // La ligne d'amis de l'accueil a déjà son propre anneau : elle n'est pas touchée.
  const box = [".avatar-card .avatar-card-image", ".avatar-card-container .avatar-card-image", ".avatar-card-fullbody .thumbnail-2d-container"].map(
    (x) => x + ":not([class*='friends-carousel' i] *)"
  );
  // Page Amis : plus de cases grises derrière chaque ami, le fond (image, GIF, couleur) passe à travers.
  // Une ombre douce garde les noms lisibles sur une image claire.
  const FP = "html[data-rx-fp]:root:root:root body";
  const cards = [".avatar-card", ".avatar-card-container", ".avatar-card-content", ".avatar-card-fullbody", ".avatar-card-caption", ".list-item.avatar-card"];
  const cardCss =
    `${cards.map((x) => `${FP} ${x}`).join(",")} { background: transparent !important; background-color: transparent !important; background-image: none !important; border-color: transparent !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }` +
    `${FP} .avatar-card .avatar-card-caption, ${FP} .avatar-card .avatar-card-caption * { text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75); }`;
  return (
    css +
    cardCss +
    `${rbxSoc3Sel(box)} { position: relative !important; isolation: isolate; aspect-ratio: 1; border-radius: 50% !important; overflow: hidden !important; background: transparent !important; box-shadow: none !important; border: 0 !important; }` +
    `${rbxSoc3Sel(box.map((x) => x + " img"))} { width: 100% !important; height: 100% !important; object-fit: cover !important; border-radius: 50% !important; box-shadow: none !important; border: 0 !important; }` +
    `${rbxSoc3Sel(box.map((x) => x + "::after"))} { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 50%; pointer-events: none; box-shadow: inset 0 0 0 2px color-mix(in srgb, var(--rx-accent, #335fff) 55%, transparent); }`
  );
};

// ---------- Temps de jeu : celui de Roblox (Paramètres > Confidentialité > Temps d'écran) ----------
// Application et site compris, 7 derniers jours, par jeu. Le compteur de l'extension (site seulement) est arrêté.

RBX_DEFAULTS.trackPlaytime = false;
const RBXL_SCREEN_URL = "https://apis.roblox.com/parental-controls-api/v1/parental-controls/get-top-weekly-screentime-by-universe";
const rbxlScreen = { at: 0, list: null, busy: null };

function rbxlScreenLoad() {
  if (rbxlScreen.list && Date.now() - rbxlScreen.at < 300000) return Promise.resolve(rbxlScreen.list);
  if (!rbxlScreen.busy) {
    rbxlScreen.busy = (async () => {
      const r = await rbxFetchJson(RBXL_SCREEN_URL);
      const raw = Array.isArray(r) ? r : r && Array.isArray(r.data) ? r.data : null;
      if (!raw) return null;
      const rows = raw
        .map((x) => ({ id: Number(x && x.universeId) || 0, min: Number(x && x.weeklyMinutes) || 0 }))
        .filter((x) => x.id > 0 && x.min > 0)
        .sort((a, b) => b.min - a.min)
        .slice(0, 20);
      // Noms des jeux en une seule requête.
      if (rows.length) {
        const g = await rbxFetchJson("https://games.roblox.com/v1/games?universeIds=" + rows.map((x) => x.id).join(","));
        const byId = new Map(((g && g.data) || []).map((x) => [Number(x.id), x]));
        rows.forEach((x) => {
          const d = byId.get(x.id);
          x.name = (d && d.name) || "Jeu " + x.id;
          x.place = d && d.rootPlaceId;
        });
      }
      rbxlScreen.list = rows;
      rbxlScreen.at = Date.now();
      return rows;
    })().finally(() => (rbxlScreen.busy = null));
  }
  return rbxlScreen.busy;
}

async function rbxlScreenRender() {
  const box = document.querySelector("#rx-panel [data-rxl-screen]");
  if (!box) return;
  if (!rbxlScreen.list) box.textContent = "Chargement…";
  const list = await rbxlScreenLoad().catch(() => null);
  box.textContent = "";
  if (!list) return box.appendChild(sxEl("p", "rx-empty", "Roblox n'a pas répondu : vérifie que tu es connecté, puis rouvre cet onglet."));
  if (!list.length) return box.appendChild(sxEl("p", "rx-empty", "Aucune partie ces 7 derniers jours."));
  const total = list.reduce((a, x) => a + x.min, 0) * 60;
  box.appendChild(rbxStatRow("Total sur 7 jours", rbxFmtDuration(total), true));
  box.appendChild(rbxStatRow("Moyenne par jour", rbxFmtDuration(Math.round(total / 7)), false));
  const ul = sxEl("div", "rx-list rx-spaced");
  list.forEach((x) => {
    const row = sxEl("div", "rx-li");
    const a = sxEl("a", "rx-li-name", x.name);
    if (x.place) a.href = `https://www.roblox.com/games/${x.place}`;
    row.appendChild(a);
    row.appendChild(sxEl("span", "rx-tag", rbxFmtDuration(x.min * 60)));
    ul.appendChild(row);
  });
  box.appendChild(ul);
}

// Volet Temps de jeu : les chiffres de Roblox remplacent le compteur local (et son bouton de remise à zéro).
const rbxlActivityHtmlPrev = rbx6ActivityHtml;
rbx6ActivityHtml = function () {
  return rbxlActivityHtmlPrev().replace(
    /<p class="rx-hint">Temps passé sur le site[\s\S]*?data-act="clearPlaytime">[^<]*<\/button><\/div>/,
    `<p class="rx-hint">Ton temps de jeu des 7 derniers jours, tel que Roblox le compte (application et site), par jeu. Les mêmes chiffres que dans <a href="https://www.roblox.com/my/account#!/privacy/Screentime">Paramètres › Temps d'écran</a>.</p><div data-rxl-screen></div>`
  );
};

const rbxlStatsPrev = rbx6RenderStats;
rbx6RenderStats = function () {
  rbxlStatsPrev();
  rbxlScreenRender();
};

// ---------- Aller à un ID : depuis la recherche du panneau (Ctrl K), en tapant un nombre ----------

const RBXL_GOTO = [
  ["Profil", "users/%/profile"],
  ["Jeu", "games/%"],
  ["Objet", "catalog/%"],
  ["Groupe", "groups/%"]
];

const rbxlSearchPrev = rbx5Search;
rbx5Search = function (q) {
  const hits = rbxlSearchPrev(q);
  const id = /^\d{1,19}$/.test(q) ? q : "";
  if (!id) return hits;
  const go = RBXL_GOTO.map(([label, path]) => ({ label: `${label} n° ${id}`, path: "Aller à un ID", url: "https://www.roblox.com/" + path.replace("%", id) }));
  return go.concat(hits).slice(0, 12);
};

const rbxlGoPrev = rbx5Go;
rbx5Go = function (it) {
  if (it && it.url) location.href = it.url;
  else rbxlGoPrev(it);
};

// ---------- Avatar : bac à sable pour essayer n'importe quel objet du catalogue ----------
// Aperçu dessiné par Roblox (avatar/render) : rien n'est acheté ni changé sur le vrai avatar.

RBX_DEFAULTS.avatarSandbox = false;
const RBXL_SB_RENDER = "https://avatar.roblox.com/v1/avatar/render";
// Types qui s'empilent (accessoires, vêtements 3D) ; les autres remplacent l'objet du même type.
const RBXL_SB_STACK = new Set([8, 41, 42, 43, 44, 45, 46, 47, 57, 58, 64, 65, 66, 67, 68, 69, 70, 71, 72]);
const RBXL_SB_CLOTHES = new Set([2, 11, 12]);
const rbxlSb = { base: null, worn: [], results: [], thumbs: new Map(), img: "", seq: 0, timer: 0, err: "", undo: [] };
// Recherches rapides : le catalogue cherche par mot-clé anglais.
const RBXL_SB_CATS = [["Cheveux", "hair"], ["Chapeaux", "hat"], ["Visages", "face"], ["Hauts", "shirt"], ["Bas", "pants"], ["Accessoires", "accessory"], ["Ailes", "wings"], ["Épées", "sword"]];

function rbxlSbHtml() {
  return `<div class="rxl-block" data-rxl-sb><div class="rxl-sb-head"><div class="rx9-heading">Bac à sable</div><button type="button" class="rx-sec" data-rxl-sb-act="toggle"></button></div>
<p class="rx-hint">Essaie n'importe quel objet du catalogue sur ton avatar, sans l'acheter. Ton vrai avatar ne change pas.</p>
<div class="rxl-sb-body" data-rxl-sb-body hidden><div class="rxl-sb-view" data-rxl-sb-view><div class="rxl-sb-stage"><img data-rxl-sb-img alt="Aperçu de l'avatar"><i class="rxl-sb-spin"></i></div><p class="rxl-sb-state" data-rxl-sb-state></p>
<div class="rxl-sb-tools"><button type="button" class="rx-sec" data-rxl-sb-act="undo" title="Annuler la dernière modification">↶ Annuler</button><button type="button" class="rx-sec" data-rxl-sb-act="reset" title="Revenir à ton vrai avatar">Mon avatar</button><button type="button" class="rx-sec rx-danger" data-rxl-sb-act="clear" title="Retirer les accessoires et vêtements">Tout retirer</button></div></div>
<div class="rxl-sb-side"><div class="rxl-sb-search"><input type="search" placeholder="Chercher un objet, ou coller son lien ou son ID" data-rxl-sb-q autocomplete="off"><button type="button" class="rx-sec" data-rxl-sb-act="search">Chercher</button></div>
<div class="rxl-sb-cats">${RBXL_SB_CATS.map(([t, q]) => `<button type="button" class="rx11-chip" data-rxl-sb-cat="${q}">${t}</button>`).join("")}</div>
<div class="rxl-sb-label"><span class="rx-label">Porté</span><small data-rxl-sb-wcount></small></div><div class="rxl-sb-items rxl-sb-worn" data-rxl-sb-worn></div>
<div class="rxl-sb-label"><span class="rx-label">Résultats</span><small data-rxl-sb-rcount></small></div><div class="rxl-sb-items" data-rxl-sb-results><p class="rx-empty">Choisis une catégorie ou cherche un objet.</p></div></div></div></div>`;
}

const rbxlSbQ = (s) => document.querySelector(`#rx-panel [data-rxl-sb-${s}]`);

// Ouvert ou fermé selon le réglage ; l'avatar n'est chargé qu'à la première ouverture.
function rbxlSbShow() {
  const body = rbxlSbQ("body");
  if (!body) return;
  const open = !!rbxSaved.avatarSandbox;
  body.hidden = !open;
  const t = document.querySelector('#rx-panel [data-rxl-sb-act="toggle"]');
  if (t) t.textContent = open ? "Masquer" : "Afficher";
  if (!open) return;
  if (!rbxlSb.base) rbxlSbLoad();
  else rbxlSbDraw();
}

async function rbxlSbLoad() {
  rbxlSbState("Chargement de ton avatar…", true);
  const av = await rbxFetchJson("https://avatar.roblox.com/v2/avatar/avatar");
  if (!av || !Array.isArray(av.assets)) return rbxlSbState("Impossible de lire ton avatar : connecte-toi à Roblox.");
  const c = av.bodyColor3s || {};
  const hex = (k) => "#" + String(c[k + "3"] || "F5CD30").replace("#", "");
  rbxlSb.base = {
    type: av.playerAvatarType === "R6" ? "R6" : "R15",
    scales: av.scales || {},
    colors: Object.fromEntries(["headColor", "torsoColor", "rightArmColor", "leftArmColor", "rightLegColor", "leftLegColor"].map((k) => [k, hex(k)])),
    assets: av.assets.map((a) => ({ id: Number(a.id), name: a.name || "Objet " + a.id, type: Number(a.assetType && a.assetType.id) || 0 }))
  };
  rbxlSb.worn = rbxlSb.base.assets.slice();
  rbxlSbChanged();
}

// Ligne d'état sous l'aperçu ; « busy » estompe l'aperçu et affiche la roue de chargement.
function rbxlSbState(t, busy) {
  const el = rbxlSbQ("state");
  if (el) el.textContent = t;
  const v = rbxlSbQ("view");
  if (v) v.classList.toggle("rx-loading", !!busy);
}

function rbxlSbChanged() {
  rbxlSbDraw();
  clearTimeout(rbxlSb.timer);
  rbxlSb.timer = setTimeout(() => rbxlSbRender().catch(() => rbxlSbState("Aperçu impossible pour le moment.")), 250);
}

// Prix des objets ajoutés par rapport au vrai avatar (ceux dont le prix est connu).
function rbxlSbCost() {
  const mine = new Set(rbxlSb.base ? rbxlSb.base.assets.map((a) => a.id) : []);
  const added = rbxlSb.worn.filter((a) => !mine.has(a.id));
  if (!added.length) return "";
  const sum = added.reduce((n, a) => n + (Number(a.price) || 0), 0);
  const unknown = added.some((a) => a.price == null);
  return ` Ajoutés : ${added.length}, pour ${rbxNum(sum)} Robux${unknown ? " (sans les objets hors vente)" : ""}.`;
}

// Garde l'état d'avant pour « Annuler » (20 pas).
function rbxlSbKeep() {
  rbxlSb.undo.push(rbxlSb.worn.slice());
  if (rbxlSb.undo.length > 20) rbxlSb.undo.shift();
}

function rbxlSbWear(item) {
  rbxlSbKeep();
  const i = rbxlSb.worn.findIndex((a) => a.id === item.id);
  if (i !== -1) rbxlSb.worn.splice(i, 1);
  else {
    if (!RBXL_SB_STACK.has(item.type)) rbxlSb.worn = rbxlSb.worn.filter((a) => a.type !== item.type);
    rbxlSb.worn.push(item);
  }
  rbxlSbChanged();
}

// L'image de Roblox peut demander quelques secondes : on redemande tant qu'elle est en préparation.
async function rbxlSbRender() {
  const b = rbxlSb.base;
  if (!b) return;
  const seq = ++rbxlSb.seq;
  const body = {
    thumbnailConfig: { thumbnailId: 1, thumbnailType: "2d", size: "420x420" },
    avatarDefinition: {
      assets: rbxlSb.worn.map((a) => ({ id: a.id })),
      bodyColors: b.colors,
      scales: b.scales,
      playerAvatarType: { playerAvatarType: b.type }
    }
  };
  rbxlSbState("Préparation de l'aperçu…", true);
  for (let i = 0; i < 10; i++) {
    const r = await new Promise((res) => chrome.runtime.sendMessage({ type: "postJson", url: RBXL_SB_RENDER, body }, (x) => res(chrome.runtime.lastError ? null : x)));
    if (seq !== rbxlSb.seq) return;
    if (!r || !r.ok) return rbxlSbState(`Aperçu refusé par Roblox (code ${(r && r.status) || 0}).`);
    if (r.data && r.data.state === "Completed" && r.data.imageUrl) {
      rbxlSb.img = r.data.imageUrl;
      const img = rbxlSbQ("img");
      if (img) img.src = rbxlSb.img;
      return rbxlSbState(`${rbxlSb.worn.length} objet(s) porté(s).${rbxlSbCost()}`);
    }
    if (r.data && r.data.state && r.data.state !== "Pending") return rbxlSbState("Roblox ne peut pas dessiner cette combinaison : retire un objet.");
    await rbxSleep(1500);
    if (seq !== rbxlSb.seq) return;
  }
  rbxlSbState("Roblox met du temps à préparer l'aperçu : réessaie dans un instant.");
}

// Lien du catalogue ou ID collé : l'objet est essayé directement, sans passer par la recherche.
async function rbxlSbTryId(id) {
  const d = await rbxFetchJson(`https://economy.roblox.com/v2/assets/${id}/details`);
  if (!d || !d.AssetTypeId) return rbxToast("Objet introuvable : vérifie l'ID ou le lien");
  const it = { id, name: d.Name || "Objet " + id, type: Number(d.AssetTypeId) || 0, price: d.IsForSale ? Number(d.PriceInRobux) || 0 : null };
  if (!rbxlSb.results.some((a) => a.id === id)) rbxlSb.results.unshift(it);
  if (!rbxlSb.worn.some((a) => a.id === id)) rbxlSbWear(it);
  else rbxlSbDraw();
}

async function rbxlSbSearch(cat) {
  const q = cat || (rbxlSbQ("q") || {}).value || "";
  if (!q.trim()) return;
  const idm = /(?:catalog|library|store\/asset)\/(\d+)|^\s*(\d{3,})\s*$/.exec(q);
  if (idm && rbxlSb.base) return rbxlSbTryId(Number(idm[1] || idm[2]));
  const box = rbxlSbQ("results");
  if (box) box.textContent = "Recherche…";
  const qs = `Keyword=${encodeURIComponent(q.trim().slice(0, 50))}&Limit=30&salesTypeFilter=1`;
  const r = (await rbxFetchJson("https://catalog.roblox.com/v2/search/items/details?" + qs)) || (await rbxFetchJson("https://catalog.roblox.com/v1/search/items/details?" + qs));
  rbxlSb.results = ((r && r.data) || [])
    .filter((x) => x && x.itemType === "Asset" && x.id)
    .map((x) => ({ id: Number(x.id), name: x.name || "Objet " + x.id, type: Number(x.assetType) || 0, price: x.lowestPrice != null ? x.lowestPrice : x.price }));
  if (!rbxlSb.results.length && box) box.textContent = r ? "Aucun objet trouvé." : "Le catalogue n'a pas répondu, réessaie.";
  rbxlSbDraw();
}

// Miniatures des objets affichés, en une requête pour ceux qui manquent.
async function rbxlSbThumbs(ids) {
  const need = ids.filter((id) => !rbxlSb.thumbs.has(id)).slice(0, 100);
  if (!need.length) return;
  need.forEach((id) => rbxlSb.thumbs.set(id, ""));
  const r = await rbxFetchJson(`https://thumbnails.roblox.com/v1/assets?assetIds=${need.join(",")}&size=110x110&format=Png&isCircular=false`);
  ((r && r.data) || []).forEach((t) => t.imageUrl && rbxlSb.thumbs.set(Number(t.targetId), t.imageUrl));
  rbxlSbDraw(true);
}

function rbxlSbDraw(noFetch) {
  const worn = rbxlSbQ("worn");
  const res = rbxlSbQ("results");
  if (!worn || !res) return;
  const on = new Set(rbxlSb.worn.map((a) => a.id));
  const price = (p) => (p == null ? "" : p ? rbxNum(p) + " R$" : "Gratuit");
  // Vignette : image, nom, prix ; ✓ si porté. Dans « Porté », un clic retire l'objet (× au survol).
  const tile = (it, inWorn) => {
    const b = sxEl("button", "rxl-sb-item" + (on.has(it.id) && !inWorn ? " rx-active" : ""));
    b.type = "button";
    b.title = (inWorn ? "Retirer : " : on.has(it.id) ? "Retirer : " : "Essayer : ") + it.name + (it.price != null ? ` · ${price(it.price)}` : "");
    b.dataset.rxlSbId = it.id;
    const pic = sxEl("span", "rxl-sb-pic");
    const src = rbxlSb.thumbs.get(it.id);
    if (src) {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "";
      img.loading = "lazy";
      pic.appendChild(img);
    }
    b.appendChild(pic);
    b.appendChild(sxEl("span", "rxl-sb-name", it.name));
    if (it.price != null) b.appendChild(sxEl("em", "rxl-sb-price", price(it.price)));
    b.appendChild(sxEl("i", inWorn ? "rxl-sb-x" : "rxl-sb-check", inWorn ? "×" : "✓"));
    return b;
  };
  worn.replaceChildren(...rbxlSb.worn.map((it) => tile(it, true)));
  if (rbxlSb.results.length) res.replaceChildren(...rbxlSb.results.map((it) => tile(it, false)));
  const wc = rbxlSbQ("wcount");
  if (wc) wc.textContent = String(rbxlSb.worn.length);
  const rc = rbxlSbQ("rcount");
  if (rc) rc.textContent = rbxlSb.results.length ? String(rbxlSb.results.length) : "";
  const img = rbxlSbQ("img");
  if (img && rbxlSb.img && img.src !== rbxlSb.img) img.src = rbxlSb.img;
  if (!noFetch) rbxlSbThumbs(rbxlSb.worn.concat(rbxlSb.results).map((a) => a.id)).catch(() => {});
}

document.addEventListener("click", (e) => {
  const t = e.target.closest && e.target.closest("#rx-panel [data-rxl-sb-act], #rx-panel [data-rxl-sb-id], #rx-panel [data-rxl-sb-cat]");
  if (!t) return;
  if (t.dataset.rxlSbCat) {
    document.querySelectorAll("#rx-panel [data-rxl-sb-cat]").forEach((c) => c.classList.toggle("rx11-chip-on", c === t));
    return rbxlSbSearch(t.dataset.rxlSbCat).catch(() => {});
  }
  const act = t.dataset.rxlSbAct;
  if (act === "toggle") {
    rbxSet({ avatarSandbox: !rbxSaved.avatarSandbox });
    rbxlSbShow();
  } else if (act === "search") rbxlSbSearch().catch(() => {});
  else if (act === "undo") {
    if (!rbxlSb.undo.length) return rbxToast("Rien à annuler");
    rbxlSb.worn = rbxlSb.undo.pop();
    rbxlSbChanged();
  } else if (act === "reset" && rbxlSb.base) {
    rbxlSbKeep();
    rbxlSb.worn = rbxlSb.base.assets.slice();
    rbxlSbChanged();
  } else if (act === "clear") {
    rbxlSbKeep();
    rbxlSb.worn = rbxlSb.worn.filter((a) => !RBXL_SB_STACK.has(a.type) && !RBXL_SB_CLOTHES.has(a.type));
    rbxlSbChanged();
  } else if (t.dataset.rxlSbId) {
    const id = Number(t.dataset.rxlSbId);
    const it = rbxlSb.worn.find((a) => a.id === id) || rbxlSb.results.find((a) => a.id === id);
    if (it && rbxlSb.base) rbxlSbWear(it);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && e.target && e.target.matches && e.target.matches("#rx-panel [data-rxl-sb-q]")) {
    e.preventDefault();
    rbxlSbSearch().catch(() => {});
  }
});

// ---------- Traduction automatique dans la langue du Roblox du joueur ----------
// Textes de l'extension (écrits en français) traduits par le serveur une fois par langue, gardés sur l'ordinateur.
// Seuls les éléments de l'extension sont touchés (identifiants et classes rx… / sx…), jamais la page de Roblox.

const RBXL_TR_LANGS = ["en", "es", "pt", "de", "it", "nl", "pl", "tr", "ru", "uk", "ja", "ko", "zh", "id", "th", "vi", "ar", "sv", "da", "no", "fi", "cs", "ro", "hu", "el", "he", "hi", "ms"];
// « Tr2 » : les traductions gardées de l'ancien modèle (mot à mot) sont oubliées.
const RBXL_TR_KEY = "rbxCustomizerTr2_";
const RBXL_TR_ROOT = '[id^="rx-"], [class^="rx"], [class*=" rx"], [class^="sx"], [class*=" sx"]';
// Noms de joueurs, de jeux et d'objets, et champs de saisie : laissés tels quels.
// Les badges (Créateur, Co-créateur…) sont traduits par leur propre code (rbxlTrNow, plus bas) : s'ils l'étaient
// aussi ici, le badge remettrait son texte français à chaque passage et clignoterait entre les deux langues.
const RBXL_TR_SKIP = "script, style, textarea, input, code, kbd, [contenteditable], .rx-li-name, .rxl-sb-item, .rx-creator, [data-rx-notr]";
const rbxlTr = { lang: "", map: new Map(), out: new WeakMap(), wait: new Set(), queue: new Set(), tries: new Map(), dirty: new Set(), timer: 0, busy: false, pause: 0, saveTimer: 0 };

function rbxlTrLang() {
  const m = document.querySelector('meta[name="locale-data"]');
  const raw = (m && m.getAttribute("data-language-code")) || document.documentElement.lang || "";
  const l = raw.toLowerCase().split(/[-_]/)[0];
  return RBXL_TR_LANGS.indexOf(l) !== -1 ? l : "";
}

function rbxlTrWant(key) {
  return key.length <= 500 && /\p{L}{2}/u.test(key) && key[0] !== "@";
}

// Un texte : déjà traduit, traduit maintenant depuis la mémoire, ou mis en attente du serveur.
function rbxlTrText(n) {
  const cur = n.data;
  if (rbxlTr.out.get(n) === cur) return;
  const key = cur.trim();
  if (!key || !rbxlTrWant(key)) return;
  const tr = rbxlTr.map.get(key);
  if (tr) {
    const next = cur.replace(key, tr);
    rbxlTr.out.set(n, next);
    if (next !== cur) n.data = next;
  } else {
    rbxlTr.queue.add(key);
    rbxlTr.wait.add(n);
  }
}

// Traduction immédiate d'un texte écrit par le code : depuis la mémoire, sinon le texte d'origine en attendant
// que le serveur réponde (le prochain passage du code qui l'affiche prendra la traduction).
// Textes des badges fixés à la main en anglais : la même phrase pour le créateur et le co-créateur, quoi que dise l'IA.
const RBXL_TR_FIXED = {
  en: {
    "Créateur de l'extension RoNova": "Creator of the RoNova extension",
    "Co-créateur de l'extension RoNova": "Co-creator of the RoNova extension"
  }
};

function rbxlTrNow(text) {
  const key = String(text || "").trim();
  if (!rbxlTr.lang || !rbxlTrWant(key)) return text;
  const tr = (RBXL_TR_FIXED[rbxlTr.lang] && RBXL_TR_FIXED[rbxlTr.lang][key]) || rbxlTr.map.get(key);
  if (tr) return tr;
  rbxlTr.queue.add(key);
  if (!rbxlTr.timer) rbxlTr.timer = setTimeout(rbxlTrFlush, 40);
  return text;
}

const rbxlBadgeNewPrev = rbxCreatorBadge;
rbxCreatorBadge = function (c, small) {
  const b = rbxlBadgeNewPrev(c, small);
  const label = b.lastElementChild;
  if (label) label.textContent = rbxlTrNow(label.textContent);
  b.title = rbxlTrNow(b.title);
  return b;
};

rbxCreatorRefresh = function (b, c) {
  const label = b.lastElementChild;
  const txt = rbxlTrNow(rbxCreatorText(c));
  if (label && label.textContent !== txt) label.textContent = txt;
  rbxCreatorPaint(b, c);
};

function rbxlTrAttrs(el) {
  ["placeholder", "title", "aria-label"].forEach((a) => {
    const v = el.getAttribute(a);
    if (!v) return;
    const src = el.getAttribute("data-rx-tr-" + a);
    const key = (src !== null && el.getAttribute("data-rx-tr-out-" + a) === v ? src : v).trim();
    if (!rbxlTrWant(key)) return;
    const tr = rbxlTr.map.get(key);
    if (!tr) return rbxlTr.queue.add(key);
    if (v === tr) return;
    el.setAttribute("data-rx-tr-" + a, key);
    el.setAttribute("data-rx-tr-out-" + a, tr);
    el.setAttribute(a, tr);
  });
}

function rbxlTrNode(node) {
  if (!node.isConnected) return;
  if (node.nodeType === 3) {
    const p = node.parentElement;
    if (p && !p.closest(RBXL_TR_SKIP)) rbxlTrText(node);
    return;
  }
  if (node.nodeType !== 1 || node.closest(RBXL_TR_SKIP)) return;
  const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode: (t) => (t.parentElement && t.parentElement.closest(RBXL_TR_SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT)
  });
  for (let t = w.nextNode(); t; t = w.nextNode()) rbxlTrText(t);
  rbxlTrAttrs(node);
  node.querySelectorAll("[placeholder], [title], [aria-label]").forEach(rbxlTrAttrs);
}

// Passage groupé : les changements de plusieurs dizaines d'éléments ne coûtent qu'un passage toutes les 40 ms.
function rbxlTrFlush() {
  rbxlTr.timer = 0;
  const list = [...rbxlTr.dirty];
  rbxlTr.dirty.clear();
  list.forEach(rbxlTrNode);
  if (rbxlTr.queue.size) rbxlTrFetch();
}

function rbxlTrMark(node) {
  rbxlTr.dirty.add(node);
  if (!rbxlTr.timer) rbxlTr.timer = setTimeout(rbxlTrFlush, 40);
}

async function rbxlTrFetch() {
  if (rbxlTr.busy || Date.now() < rbxlTr.pause) return;
  const texts = [...rbxlTr.queue].slice(0, 60);
  if (!texts.length) return;
  rbxlTr.busy = true;
  texts.forEach((t) => rbxlTr.queue.delete(t));
  const r = await rbxBvApi("POST", "/translate", { lang: rbxlTr.lang, texts }).catch(() => null);
  rbxlTr.busy = false;
  if (!r || !r.ok || !r.data || !Array.isArray(r.data.t)) {
    // Serveur indisponible : on réessaie dans une minute, sans boucler.
    rbxlTr.pause = Date.now() + 60000;
    texts.forEach((t) => rbxlTr.queue.add(t));
    return;
  }
  let got = 0;
  r.data.t.forEach((t, i) => {
    const key = texts[i];
    if (typeof t === "string" && t) {
      rbxlTr.map.set(key, t);
      got++;
    } else {
      // Pas encore traduit (le serveur en traduit quelques-uns à la fois) : redemandé, 4 fois au plus.
      const n = (rbxlTr.tries.get(key) || 0) + 1;
      rbxlTr.tries.set(key, n);
      if (n < 4) rbxlTr.queue.add(key);
    }
  });
  if (got) {
    const waiting = [...rbxlTr.wait];
    rbxlTr.wait.clear();
    waiting.forEach((n) => n.isConnected && rbxlTrText(n));
    document.querySelectorAll("[placeholder], [title], [aria-label]").forEach((el) => el.closest(RBXL_TR_ROOT) && rbxlTrAttrs(el));
    rbxlTrSave();
  }
  if (rbxlTr.queue.size) setTimeout(rbxlTrFetch, got ? 300 : 3000);
}

function rbxlTrSave() {
  clearTimeout(rbxlTr.saveTimer);
  rbxlTr.saveTimer = setTimeout(() => {
    const obj = {};
    [...rbxlTr.map].slice(-5000).forEach(([k, v]) => (obj[k] = v));
    rbxStoreSet({ [RBXL_TR_KEY + rbxlTr.lang]: obj });
  }, 2000);
}

// Fenêtres de confirmation de l'extension : traduites aussi quand la traduction est déjà connue.
const rbxlConfirm = window.confirm.bind(window);
window.confirm = (msg) => {
  const key = String(msg || "").trim();
  if (rbxlTr.lang && rbxlTrWant(key) && !rbxlTr.map.has(key)) rbxlTr.queue.add(key);
  return rbxlConfirm((rbxlTr.lang && rbxlTr.map.get(key)) || msg);
};

(async function rbxlTrStart() {
  if (!document.body) return setTimeout(rbxlTrStart, 300);
  rbxlTr.lang = rbxlTrLang();
  if (!rbxlTr.lang) return;
  const st = (await rbxStoreGet([RBXL_TR_KEY + rbxlTr.lang]))[RBXL_TR_KEY + rbxlTr.lang];
  if (st && typeof st === "object") Object.entries(st).forEach(([k, v]) => typeof v === "string" && rbxlTr.map.set(k, v));
  document.querySelectorAll(RBXL_TR_ROOT).forEach((el) => {
    if (!el.parentElement || !el.parentElement.closest(RBXL_TR_ROOT)) rbxlTrMark(el);
  });
  new MutationObserver((ms) => {
    for (const m of ms) {
      if (m.type === "characterData") {
        const p = m.target.parentElement;
        if (p && p.closest(RBXL_TR_ROOT)) rbxlTrMark(m.target);
        continue;
      }
      for (const n of m.addedNodes) {
        const el = n.nodeType === 1 ? n : n.parentElement;
        if (el && el.closest(RBXL_TR_ROOT)) rbxlTrMark(n);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, characterData: true });
})();
