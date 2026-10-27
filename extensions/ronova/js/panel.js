const RBX_TABS = [
  { id: "themes", label: "Thèmes" },
  {
    id: "colors",
    label: "Couleurs",
    fields: [
      { key: "forceNative", type: "checkbox", label: "Forcer sur les thèmes Roblox (Sombre, Clair, Roblox+)" },
      { key: "useBgColor", type: "checkbox", label: "Activer la couleur de fond" },
      { key: "bgColor", type: "color", label: "Couleur de fond" },
      { key: "cardColor", type: "color", label: "Couleur des cartes et menus", clearable: true },
      { key: "textColor", type: "color", label: "Couleur du texte", clearable: true },
      { key: "accent", type: "color", label: "Couleur d'accent", clearable: true },
      { key: "bgImage", type: "text", label: "Image de fond (URL)", placeholder: "https://..." }
    ]
  },
  {
    id: "text",
    label: "Texte et forme",
    fields: [
      { key: "font", type: "text", label: "Police", placeholder: "Comic Sans MS" },
      { key: "fontSize", type: "range", label: "Taille du texte", min: 70, max: 150, step: 5 }
    ]
  },
  {
    id: "effects",
    label: "Effets",
    fields: [
      { key: "customScroll", type: "checkbox", label: "Barre de défilement colorée" },
      { key: "smoothScroll", type: "checkbox", label: "Défilement doux" },
      { key: "noAnimations", type: "checkbox", label: "Désactiver les animations" }
    ]
  },
  {
    id: "hide",
    label: "Masquer",
    fields: [
      { key: "hideChat", type: "checkbox", label: "Masquer le chat" },
      { key: "hideAds", type: "checkbox", label: "Masquer les pubs" },
      { key: "hideSidebar", type: "checkbox", label: "Masquer le menu de gauche" },
      { key: "hideFooter", type: "checkbox", label: "Masquer le pied de page" },
      { key: "hideFriendsRow", type: "checkbox", label: "Masquer la barre d'amis" },
      { key: "hidePremiumBtn", type: "checkbox", label: "Masquer le bouton Premium" }
    ]
  },
  {
    id: "privacy",
    label: "Confidentialité",
    fields: [
      { key: "blurRobux", type: "checkbox", label: "Flouter le solde de Robux" },
      { key: "blurName", type: "checkbox", label: "Flouter tous les pseudos, le tien, ceux de tes amis et des autres joueurs" }
    ]
  },
  {
    id: "buttons",
    label: "Boutons",
    fields: [
      { key: "showFab", type: "checkbox", label: "Bouton Réglages flottant" },
      { key: "showScrollTop", type: "checkbox", label: "Bouton retour en haut" },
      { key: "showCopyButtons", type: "checkbox", label: "Boutons copier sur les profils, jeux, objets et groupes" }
    ]
  },
  {
    id: "profile",
    label: "Profil",
    fields: [
      { key: "showProfileInfo", type: "checkbox", label: "Afficher les infos sur les profils" },
      { key: "infoUsername", type: "checkbox", label: "Pseudo et nom affiché" },
      { key: "infoId", type: "checkbox", label: "ID du compte" },
      { key: "infoAge", type: "checkbox", label: "Date de création et ancienneté" },
      { key: "infoFriends", type: "checkbox", label: "Nombre d'amis" },
      { key: "infoFollowers", type: "checkbox", label: "Nombre d'abonnés" },
      { key: "infoFollowing", type: "checkbox", label: "Nombre d'abonnements" },
      { key: "infoGroups", type: "checkbox", label: "Nombre de groupes" },
      { key: "infoInventory", type: "checkbox", label: "Inventaire public ou privé" },
      { key: "infoStatus", type: "checkbox", label: "Statut du compte" }
    ]
  },
  {
    id: "premium",
    label: "Premium",
    subs: [
      {
        id: "themes",
        label: "Thèmes exclusifs",
        fields: [
          { key: "neonGlow", type: "checkbox", label: "Lueur néon sur les boutons" },
          { key: "accentBorders", type: "checkbox", label: "Bordures d'accent sur les cartes" },
          { key: "autoTheme", type: "checkbox", label: "Thème automatique jour et nuit" },
          { key: "dayTheme", type: "select", label: "Thème de jour", options: "themes" },
          { key: "nightTheme", type: "select", label: "Thème de nuit", options: "themes" },
          { key: "dayStart", type: "number", label: "Début du jour (heure)", min: 0, max: 23, step: 1 },
          { key: "nightStart", type: "number", label: "Début de la nuit (heure)", min: 0, max: 23, step: 1 }
        ]
      },
      {
        id: "gradient",
        label: "Dégradé",
        fields: [
          { key: "gradEnabled", type: "checkbox", label: "Activer mon dégradé personnalisé" },
          { key: "gradType", type: "select", label: "Type de dégradé", options: [["linear", "Linéaire"], ["radial", "Radial"], ["conic", "Conique"]] },
          { key: "gradCount", type: "select", label: "Nombre de couleurs", options: [[2, "2 couleurs"], [3, "3 couleurs"], [4, "4 couleurs"]] },
          { key: "gradA", type: "color", label: "Couleur 1" },
          { key: "gradB", type: "color", label: "Couleur 2" },
          { key: "gradC", type: "color", label: "Couleur 3" },
          { key: "gradD", type: "color", label: "Couleur 4" },
          { key: "gradAngle", type: "range", label: "Angle du dégradé", min: 0, max: 360, step: 5, unit: "°" },
          { key: "gradDim", type: "range", label: "Assombrir le fond", min: 0, max: 70, step: 5 },
          { key: "gradAnimated", type: "checkbox", label: "Dégradé animé, linéaire et radial uniquement" },
          { key: "gradSpeed", type: "range", label: "Durée d'un cycle d'animation", min: 5, max: 60, step: 5, unit: " s" }
        ]
      },
      {
        id: "glass",
        label: "Effet verre",
        fields: [
          { key: "glassIntensity", type: "range", label: "Intensité de l'effet verre", min: 0, max: 100, step: 5 },
          { key: "glassCards", type: "checkbox", label: "Cartes, menus et fenêtres en verre" },
          { key: "glassNav", type: "checkbox", label: "Barre du haut et menu de gauche en verre" },
          { key: "glassButtons", type: "checkbox", label: "Boutons et champs de saisie en verre" },
          { key: "glassPanel", type: "checkbox", label: "Panneau de l'extension en verre" }
        ]
      },
      {
        id: "info",
        label: "Infos",
        fields: [
          { key: "showGameStats", type: "checkbox", label: "Stats détaillées sur les jeux" },
          { key: "showGameExtra", type: "checkbox", label: "Stats avancées des jeux (visites par jour, âge, favoris)" },
          { key: "showItemInfo", type: "checkbox", label: "Infos détaillées sur les objets du catalogue" },
          { key: "showItemExtra", type: "checkbox", label: "Stats avancées des objets (ventes par jour, revenu estimé)" },
          { key: "showGroupInfo", type: "checkbox", label: "Infos détaillées sur les groupes" },
          { key: "showUsernameHistory", type: "checkbox", label: "Historique des pseudos sur les profils" }
        ]
      },
      {
        id: "robux",
        label: "Robux",
        fields: [
          { key: "showDevex", type: "checkbox", label: "Valeur DevEx de ton solde de Robux en euros" },
          { key: "devexRate", type: "number", label: "Taux DevEx en dollars par Robux", min: 0, max: 1, step: 0.0001 },
          { key: "usdToEur", type: "number", label: "Taux de change dollar vers euro", min: 0, max: 5, step: 0.01 },
          { key: "showRobuxConvert", type: "checkbox", label: "Convertir le prix des objets en argent réel" },
          { key: "robuxRate", type: "number", label: "Prix d'achat d'un Robux dans ta devise", min: 0, max: 1, step: 0.0001 },
          { key: "currency", type: "text", label: "Symbole de la devise", placeholder: "€" }
        ]
      },
      {
        id: "tracking",
        label: "Suivi",
        fields: [
          { key: "trackPlaytime", type: "checkbox", label: "Mesurer le temps passé sur Roblox" },
          { key: "dailyLimit", type: "number", label: "Limite de temps par jour en minutes (0 = off)", min: 0, max: 1440, step: 5 },
          { key: "breakReminder", type: "number", label: "Rappel de pause toutes les X minutes (0 = off)", min: 0, max: 240, step: 5 }
        ]
      },
      {
        id: "comfort",
        label: "Confort",
        fields: [
          { key: "enableShortcuts", type: "checkbox", label: "Raccourcis clavier (Alt + S U Q J H G C A)" },
          { key: "openNewTab", type: "checkbox", label: "Ouvrir les jeux dans un nouvel onglet" },
          { key: "quickLinks", type: "textarea", label: "Liens rapides (un par ligne : Nom|https://...)", placeholder: "Catalogue|https://www.roblox.com/catalog" }
        ]
      }
    ]
  },
  { id: "tools", label: "Outils" },
  { id: "admin", label: "Admin", admin: true }
];

const RBX_ADMIN_FIELDS = [
  { key: "showServerBrowser", type: "checkbox", label: "Navigateur de serveurs sur les jeux" },
  { key: "serverPages", type: "number", label: "Pages de serveurs à charger (100 par page)", min: 1, max: 5, step: 1 },
  { key: "serverShow", type: "number", label: "Nombre de serveurs affichés", min: 5, max: 100, step: 5 },
  { key: "serverMinPlayers", type: "number", label: "Nombre minimum de joueurs par serveur", min: 0, max: 100, step: 1 },
  { key: "customCss", type: "textarea", label: "CSS personnalisé", placeholder: ".mon-element { display: none; }" }
];

const RBX_GRAD_PRESETS = {
  neon: { label: "Néon", colors: ["#1e1b4b", "#7c3aed", "#ec4899"] },
  sunset: { label: "Coucher de soleil", colors: ["#1e1b4b", "#9d174d", "#f97316"] },
  ocean: { label: "Océan", colors: ["#0f172a", "#0e7490", "#22d3ee"] },
  foret: { label: "Forêt", colors: ["#052e16", "#166534", "#a3e635"] },
  feu: { label: "Feu", colors: ["#450a0a", "#dc2626", "#fbbf24"] },
  aurore: { label: "Aurore", colors: ["#0b1b2b", "#134e4a", "#4c1d95", "#2dd4bf"] },
  bonbon: { label: "Bonbon", colors: ["#fbcfe8", "#c4b5fd", "#93c5fd"] },
  nuit: { label: "Nuit", colors: ["#020617", "#1e293b", "#475569"] }
};

const RBX_GRAD_KEYS = ["gradA", "gradB", "gradC", "gradD", "gradCount", "gradType", "gradAngle", "gradDim", "gradAnimated", "gradSpeed"];

let rbxWheelAt = 0;
let rbxSecretOpen = false;
let rbxSecretCount = 0;
let rbxSecretTimer = 0;

function rbxEsc(t) {
  return String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function rbxFieldHtml(f) {
  const k = rbxEsc(f.key);
  const l = rbxEsc(f.label);
  const ph = rbxEsc(f.placeholder || "");
  if (f.type === "checkbox") {
    return `<label class="rx-row"><span class="rx-label">${l}</span><span class="rx-switch"><input type="checkbox" data-key="${k}"><i></i></span></label>`;
  }
  if (f.type === "color") {
    const clear = f.clearable ? `<button type="button" class="rx-sec" data-clear="${k}">Effacer</button>` : "";
    return `<div class="rx-row"><span class="rx-label">${l}</span><span class="rx-inline"><input type="color" data-key="${k}">${clear}</span></div>`;
  }
  if (f.type === "range") {
    return `<label class="rx-row"><span class="rx-label">${l} : <b data-out="${k}"></b>${rbxEsc(f.unit === undefined ? "%" : f.unit)}</span><input type="range" min="${f.min}" max="${f.max}" step="${f.step || 1}" data-key="${k}"></label>`;
  }
  if (f.type === "number") {
    const min = f.min === undefined ? 0 : f.min;
    const max = f.max === undefined ? 60 : f.max;
    const step = f.step === undefined ? 1 : f.step;
    return `<label class="rx-row"><span class="rx-label">${l}</span><input type="number" min="${min}" max="${max}" step="${step}" placeholder="${ph}" data-key="${k}"></label>`;
  }
  if (f.type === "select") {
    const list = f.options === "themes" ? Object.entries(RBX_ALL_THEMES).map(([id, th]) => [id, th.label]) : f.options;
    const opts = list.map(([v, lab]) => `<option value="${rbxEsc(v)}">${rbxEsc(lab)}</option>`).join("");
    return `<label class="rx-row"><span class="rx-label">${l}</span><select data-key="${k}">${opts}</select></label>`;
  }
  if (f.type === "textarea") {
    return `<div class="rx-col"><span class="rx-label">${l}</span><textarea data-key="${k}" placeholder="${ph}"></textarea></div>`;
  }
  return `<label class="rx-row"><span class="rx-label">${l}</span><input type="text" placeholder="${ph}" data-key="${k}"></label>`;
}

function rbxThemeCard(id, th, premium) {
  const g = th.gradient ? ` data-gradient="${rbxEsc(th.gradient)}"` : "";
  const p = premium ? ' data-premium="1"' : "";
  return `<button type="button" class="rx-theme" data-theme="${id}"${p}><span class="rx-prev" data-bg="${th.bgColor}"${g}><span class="rx-prev-card" data-bg="${th.cardColor}"><i class="rx-line" data-bg="${th.textColor}"></i><i class="rx-line rx-short" data-bg="${th.textColor}"></i></span><span class="rx-prev-btn" data-bg="${th.accent}"></span></span><span class="rx-theme-name">${rbxEsc(th.label)}</span></button>`;
}

function rbxToolsHtml() {
  return `<div class="rx-group"><div class="rx-col"><span class="rx-label">Convertisseur Robux</span><div class="rx-inline"><input type="number" min="0" step="1" placeholder="Robux" data-conv="robux"><span>=</span><input type="number" min="0" step="0.01" placeholder="Prix" data-conv="money"><span data-out-cur></span></div></div><div class="rx-col"><span class="rx-label">Chercher un joueur par pseudo</span><div class="rx-inline"><input type="text" placeholder="Pseudo" data-tool-input="user"><button type="button" class="rx-sec" data-tool="user">Ouvrir le profil</button></div></div><div class="rx-col"><span class="rx-label">Aller directement à un ID</span><div class="rx-inline"><select data-tool-input="kind"><option value="users">Profil</option><option value="games">Jeu</option><option value="catalog">Objet</option><option value="groups">Groupe</option></select><input type="text" placeholder="ID" data-tool-input="id"><button type="button" class="rx-sec" data-tool="go">Aller</button></div></div></div><div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Temps passé sur Roblox</span><div data-list="playtime"></div></div><div class="rx-actions"><button type="button" class="rx-sec rx-danger" data-act="clearPlaytime">Réinitialiser le temps</button></div></div>`;
}

function rbxGlassPreviewHtml() {
  return `<div style="position:relative;height:130px;border-radius:10px;overflow:hidden;margin-bottom:14px;background:linear-gradient(135deg,#7c3aed,#ec4899 55%,#f59e0b)"><span style="position:absolute;left:12%;top:18%;width:70px;height:70px;border-radius:50%;background:#22d3ee"></span><span style="position:absolute;right:14%;bottom:12%;width:90px;height:90px;border-radius:50%;background:#34d399"></span><span data-glass-chip style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:14px 28px;border-radius:12px;font-weight:800;white-space:nowrap;border:1px solid rgba(255,255,255,0.3)">Aperçu du verre</span></div>`;
}

function rbxGradientBody(sub) {
  const chips = Object.entries(RBX_GRAD_PRESETS)
    .map(([id, p]) => `<button type="button" class="rx-chip" data-grad-preset="${id}"><span class="rx-chip-bar" data-gradient="linear-gradient(90deg, ${p.colors.join(", ")})"></span>${rbxEsc(p.label)}</button>`)
    .join("");
  const fields = sub.fields.map(rbxFieldHtml).join("");
  return `<p class="rx-hint">Choisis un préréglage ou crée le tien. Les couleurs des cartes, du texte et l'accent s'adaptent automatiquement au dégradé.</p><div class="rx-grad-preview" data-grad-preview><span data-grad-preview-text></span></div><div class="rx-presets">${chips}</div><div class="rx-group rx-spaced">${fields}</div><div class="rx-actions"><button type="button" class="rx-sec" data-act="gradSwap">Inverser les couleurs</button><button type="button" class="rx-sec" data-act="gradRandom">Dégradé aléatoire</button></div>`;
}

function rbxSubBody(sub) {
  if (sub.id === "themes") {
    const items = Object.entries(RBX_PREMIUM_THEMES).map(([id, th]) => rbxThemeCard(id, th, true)).join("");
    return `<p class="rx-hint">Thèmes exclusifs Premium avec fond dégradé. Clique sur un thème pour l'appliquer. Tu peux ensuite le modifier dans l'onglet Dégradé.</p><div class="rx-themes">${items}</div><div class="rx-group rx-spaced">${sub.fields.map(rbxFieldHtml).join("")}</div>`;
  }
  if (sub.id === "gradient") return rbxGradientBody(sub);
  if (sub.id === "glass") {
    return `<p class="rx-hint">Règle l'intensité puis choisis les zones à passer en verre. L'effet est plus visible avec un dégradé ou une image de fond, et demande un thème ou une couleur de fond actifs.</p>${rbxGlassPreviewHtml()}<div class="rx-group">${sub.fields.map(rbxFieldHtml).join("")}</div>`;
  }
  return `<div class="rx-group">${sub.fields.map(rbxFieldHtml).join("")}</div>`;
}

function rbxPremiumBody(tab) {
  const nav = tab.subs.map((s) => `<button type="button" class="rx-subtab" data-sub="${s.id}">${rbxEsc(s.label)}</button>`).join("");
  const body = tab.subs.map((s) => `<div class="rx-sub" data-sub-section="${s.id}">${rbxSubBody(s)}</div>`).join("");
  return `<div class="rx-lic" data-lic></div><nav class="rx-subtabs">${nav}</nav>${body}`;
}

function rbxSectionBody(tab) {
  if (tab.admin) return `<div data-admin-body></div>`;
  if (tab.subs) return rbxPremiumBody(tab);
  if (tab.id === "themes") {
    const items = Object.entries(RBX_THEMES).map(([id, th]) => rbxThemeCard(id, th, false)).join("");
    return `<p class="rx-hint">Clique sur un thème pour l'appliquer, puis ajuste les couleurs dans l'onglet Couleurs. Les thèmes exclusifs sont dans Premium.</p><div class="rx-themes">${items}</div>`;
  }
  if (tab.id === "tools") return rbxToolsHtml();
  return `<div class="rx-group">${tab.fields.map(rbxFieldHtml).join("")}</div>`;
}

function rbxStylePreviews(root) {
  root.querySelectorAll("[data-bg]").forEach((el) => {
    el.style.backgroundColor = el.dataset.bg;
  });
  root.querySelectorAll("[data-gradient]").forEach((el) => {
    el.style.backgroundImage = el.dataset.gradient;
  });
}

function rbxMarkTheme() {
  document.querySelectorAll("#rx-panel .rx-theme").forEach((b) => {
    b.classList.toggle("rx-current", b.dataset.theme === rbxState.theme);
  });
}

function rbxUpdateGlassPreview() {
  const chip = document.querySelector("#rx-panel [data-glass-chip]");
  if (!chip) return;
  const I = Math.min(100, Math.max(0, Number(rbxState.glassIntensity) || 0));
  const a = Math.round(90 - I * 0.65);
  const bf = `blur(${Math.round(2 + I * 0.28)}px) saturate(${(1 + I / 120).toFixed(2)})`;
  chip.style.backgroundColor = `color-mix(in srgb, var(--rx-surface) ${a}%, transparent)`;
  chip.style.backdropFilter = bf;
  chip.style.webkitBackdropFilter = bf;
}

function rbxUpdateGradPreview() {
  const el = document.querySelector("#rx-panel [data-grad-preview]");
  if (!el) return;
  const t = el.querySelector("[data-grad-preview-text]");
  const core = rbxGradient(rbxState);
  if (!core) {
    el.style.backgroundImage = "none";
    if (t) t.textContent = "Aucun dégradé actif";
    return;
  }
  const dim = rbxClamp(rbxState.gradDim, 0, 70) / 100;
  const o = `rgba(0, 0, 0, ${dim.toFixed(2)})`;
  el.style.backgroundImage = dim > 0 ? `linear-gradient(${o}, ${o}), ${core}` : core;
  if (t) t.textContent = "";
}

function rbxUpdateGradRows() {
  const n = Math.min(4, Math.max(2, Number(rbxState.gradCount) || 2));
  ["gradC", "gradD"].forEach((k, i) => {
    const el = document.querySelector(`#rx-panel [data-key="${k}"]`);
    const row = el && el.closest(".rx-row");
    if (row) row.style.display = n < i + 3 ? "none" : "";
  });
}

function rbxUpdateOutputs() {
  document.querySelectorAll("#rx-panel [data-out]").forEach((el) => {
    el.textContent = rbxState[el.dataset.out];
  });
  document.querySelectorAll("#rx-panel [data-out-cur]").forEach((el) => {
    el.textContent = rbxState.currency || "";
  });
  rbxUpdateGlassPreview();
  rbxUpdateGradPreview();
  rbxUpdateGradRows();
}

function rbxSetInput(el, v) {
  if (el.type === "checkbox") el.checked = !!v;
  else if (el.type === "color") el.value = v || "#888888";
  else el.value = v === undefined || v === null ? "" : v;
}

function rbxApplyLocks() {
  const off = !rbxPremium.active;
  document.querySelectorAll("#rx-panel [data-key]").forEach((el) => {
    const locked = off && rbxIsLockedKey(el.dataset.key);
    el.disabled = locked;
    const row = el.closest(".rx-row, .rx-col");
    if (row) row.classList.toggle("rx-locked", locked);
  });
  document.querySelectorAll("#rx-panel .rx-theme[data-premium]").forEach((b) => b.classList.toggle("rx-locked", off));
  document.querySelectorAll('#rx-panel [data-grad-preset], #rx-panel [data-act="gradSwap"], #rx-panel [data-act="gradRandom"]').forEach((b) => b.classList.toggle("rx-locked", off));
}

function rbxSyncInputs() {
  document.querySelectorAll("#rx-panel [data-key]").forEach((el) => {
    rbxSetInput(el, rbxState[el.dataset.key]);
  });
  rbxUpdateOutputs();
  rbxMarkTheme();
  rbxApplyLocks();
}

function rbxSyncKeys(keys) {
  keys.forEach((k) => {
    document.querySelectorAll(`#rx-panel [data-key="${k}"]`).forEach((el) => rbxSetInput(el, rbxState[k]));
  });
}

function rbxFmtDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h ? `${h} h ${m} min` : `${m} min`;
}

function rbxStatRow(label, value, bold) {
  const row = document.createElement("div");
  row.className = "rx-stat";
  const l = document.createElement("span");
  l.textContent = label;
  const v = document.createElement("span");
  v.textContent = value;
  if (bold) {
    l.style.fontWeight = "800";
    v.style.fontWeight = "800";
  }
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

function rbxRenderLists() {
  const overlay = document.getElementById("rx-overlay");
  if (!overlay) return;

  const box = overlay.querySelector('[data-list="playtime"]');
  if (box) {
    box.textContent = "";
    const pt = rbxState.playtime || {};
    let week = 0;
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000);
      const sec = pt[d.toLocaleDateString("sv-SE")] || 0;
      week += sec;
      rows.push([i === 0 ? "Aujourd'hui" : d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "short" }), sec]);
    }
    box.appendChild(rbxStatRow("Total sur 7 jours", rbxFmtDuration(week), true));
    rows.forEach(([label, sec]) => box.appendChild(rbxStatRow(label, rbxFmtDuration(sec), false)));
  }
}

function rbxRenderBadge() {
  const b = document.querySelector("#rx-panel [data-badge]");
  if (!b) return;
  const on = !!rbxPremium.active;
  b.textContent = on ? (rbxAdmin ? "Admin" : "Premium") : "Gratuit";
  b.classList.toggle("rx-on", on);
}

function rbxRenderLicense() {
  const box = document.querySelector("#rx-panel [data-lic]");
  if (!box) return;
  box.textContent = "";
  const p = rbxPremium;
  const title = document.createElement("strong");
  const text = document.createElement("p");
  text.className = "rx-hint";
  box.appendChild(title);
  box.appendChild(text);

  if (p.active) {
    if (p.source === "admin") {
      title.textContent = "Mode admin : Premium actif";
      text.textContent = "Toutes les fonctions sont débloquées sur cet appareil.";
      return;
    }
    const i = p.info || {};
    title.textContent = "Premium actif";
    text.textContent = `${i.name ? "Compte : " + i.name + " · " : ""}${i.exp ? "expire le " + new Date(i.exp).toLocaleDateString("fr-FR") : "à vie"}`;
    const row = document.createElement("div");
    row.className = "rx-actions";
    const b = document.createElement("button");
    b.type = "button";
    b.className = "rx-sec";
    b.dataset.act = "deactivate";
    b.textContent = "Retirer la licence";
    row.appendChild(b);
    box.appendChild(row);
    return;
  }

  title.textContent = "Fonctions réservées au Premium";
  text.textContent = p.error ? p.error : "Entre ta clé de licence pour débloquer les thèmes exclusifs, le dégradé personnalisé, l'effet verre, les stats avancées et plus.";
  const row = document.createElement("div");
  row.className = "rx-inline";
  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "RBXC1.…";
  input.dataset.licInput = "1";
  const b = document.createElement("button");
  b.type = "button";
  b.className = "rx-sec";
  b.dataset.act = "activate";
  b.textContent = "Activer";
  row.appendChild(input);
  row.appendChild(b);
  box.appendChild(row);
}

function rbxUpdateAdminTab() {
  const b = document.querySelector('#rx-panel .rx-tab[data-tab="admin"]');
  if (b) b.hidden = !(rbxAdmin || rbxSecretOpen);
}

function rbxPanelRefresh() {
  const overlay = document.getElementById("rx-overlay");
  if (!overlay) return;
  rbxSyncInputs();
  rbxRenderBadge();
  rbxRenderLicense();
  rbxUpdateAdminTab();
}

function rbxAdminSetupHtml(priv) {
  if (!RBX_PUBLIC_KEY) {
    if (!priv) {
      return `<div class="rx-group"><div class="rx-col"><span class="rx-label">Configuration admin (étape 1 sur 2)</span><p class="rx-hint">Génère ta paire de clés. La clé privée reste uniquement dans ce navigateur et sert à signer les licences. Tu colleras ensuite la clé publique dans core.js.</p><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminGen">Générer mes clés admin</button></div></div></div>`;
    }
    const line = `const RBX_PUBLIC_KEY = ${JSON.stringify(rbxPublicFromPrivate(priv))};`;
    return `<div class="rx-group"><div class="rx-col"><span class="rx-label">Configuration admin (étape 2 sur 2)</span><p class="rx-hint">Dans core.js, remplace la toute première ligne (const RBX_PUBLIC_KEY = null;) par la ligne ci-dessous. Recharge ensuite l'extension puis Roblox : l'onglet Admin sera débloqué.</p><textarea readonly data-admin-out="pub">${rbxEsc(line)}</textarea><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminCopyPub">Copier la ligne</button></div></div></div>`;
  }
  return `<div class="rx-group"><div class="rx-col"><span class="rx-label">Accès admin</span><p class="rx-hint">Cet appareil n'a pas la clé privée correspondant à l'extension. Si tu l'as sauvegardée, colle-la ici.</p><textarea data-admin-in="priv" placeholder="Clé privée (JSON)"></textarea><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminImport">Importer la clé privée</button></div></div></div>`;
}

function rbxAdminMainHtml(store) {
  const preview = !!store[RBX_PREVIEW_KEY];
  const priv = store[RBX_ADMIN_KEY];
  const pubLine = priv ? `const RBX_PUBLIC_KEY = ${JSON.stringify(rbxPublicFromPrivate(priv))};` : "";
  const issue = `<div class="rx-group"><div class="rx-col"><span class="rx-label">Donner le Premium</span><div class="rx-inline"><input type="text" placeholder="Pseudo Roblox" data-admin-input="user"><select data-admin-input="days"><option value="7">7 jours</option><option value="30" selected>30 jours</option><option value="90">90 jours</option><option value="365">1 an</option><option value="0">À vie</option></select></div><label class="rx-inline"><span class="rx-switch"><input type="checkbox" data-admin-input="bind" checked><i></i></span><span>Lier la clé à ce compte Roblox</span></label><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminIssue">Générer la clé</button></div><textarea readonly data-admin-out="key" placeholder="La clé apparaît ici"></textarea><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminCopyKey">Copier la clé</button></div></div></div>`;
  const issued = `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Clés émises</span><div class="rx-list" data-list="issued"></div></div></div>`;
  const test = `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Vérifier une clé</span><div class="rx-inline"><input type="text" placeholder="RBXC1.…" data-admin-input="testkey"><button type="button" class="rx-sec" data-act="adminTest">Vérifier</button></div><p class="rx-hint" data-admin-out="test"></p></div><div class="rx-col"><span class="rx-label">Mode test</span><p class="rx-hint">Vois l'extension comme un utilisateur sans Premium.</p><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminPreview">${preview ? "Revenir en mode admin" : "Simuler un utilisateur gratuit"}</button></div></div></div>`;
  const adv = `<div class="rx-group rx-spaced">${RBX_ADMIN_FIELDS.map(rbxFieldHtml).join("")}</div><div class="rx-actions"><button type="button" class="rx-sec" data-act="export">Exporter les réglages</button><button type="button" class="rx-sec" data-act="import">Importer des réglages</button><button type="button" class="rx-sec rx-danger" data-act="reset">Tout réinitialiser</button></div>`;
  const keys = `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Mes clés admin</span><textarea readonly data-admin-out="pub">${rbxEsc(pubLine)}</textarea><div class="rx-actions"><button type="button" class="rx-sec" data-act="adminCopyPub">Copier la clé publique</button><button type="button" class="rx-sec" data-act="adminBackup">Copier la clé privée (sauvegarde)</button><button type="button" class="rx-sec rx-danger" data-act="adminWipe">Supprimer mes clés admin</button></div></div></div>`;
  return issue + issued + test + adv + keys;
}

function rbxFillIssued(list) {
  const box = document.querySelector('#rx-panel [data-list="issued"]');
  if (!box) return;
  box.textContent = "";
  const arr = Array.isArray(list) ? list : [];
  if (!arr.length) {
    const p = document.createElement("p");
    p.className = "rx-empty";
    p.textContent = "Aucune clé émise pour l'instant.";
    box.appendChild(p);
    return;
  }
  arr.forEach((e) => {
    const row = document.createElement("div");
    row.className = "rx-li";
    const expired = e.exp && Date.now() > e.exp;
    const tag = document.createElement("span");
    tag.className = "rx-tag";
    tag.textContent = expired ? "Expirée" : e.exp ? "Temporaire" : "À vie";
    const name = document.createElement("span");
    name.className = "rx-li-name";
    name.textContent = `${e.name || "Sans nom"}${e.uid ? "" : " (tous comptes)"}`;
    const date = document.createElement("span");
    date.className = "rx-li-date";
    date.textContent = e.exp ? new Date(e.exp).toLocaleDateString("fr-FR") : "";
    const copy = document.createElement("button");
    copy.type = "button";
    copy.className = "rx-sec";
    copy.dataset.issuedCopy = e.id;
    copy.textContent = "Copier";
    const del = document.createElement("button");
    del.type = "button";
    del.className = "rx-sec rx-danger";
    del.dataset.issuedDel = e.id;
    del.textContent = "Retirer";
    row.appendChild(tag);
    row.appendChild(name);
    row.appendChild(date);
    row.appendChild(copy);
    row.appendChild(del);
    box.appendChild(row);
  });
}

async function rbxRenderAdmin() {
  const box = document.querySelector("#rx-panel [data-admin-body]");
  if (!box) return;
  const store = await rbxStoreGet([RBX_ADMIN_KEY, RBX_ISSUED_KEY, RBX_PREVIEW_KEY]);
  if (!rbxAdmin) {
    box.innerHTML = rbxAdminSetupHtml(store[RBX_ADMIN_KEY] || null);
    return;
  }
  box.innerHTML = rbxAdminMainHtml(store);
  rbxSyncInputs();
  rbxFillIssued(store[RBX_ISSUED_KEY]);
}

function rbxResolveUser(name) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "resolveUser", username: name }, (res) => {
      const u = res && res.ok && res.data && res.data.data && res.data.data[0];
      resolve(chrome.runtime.lastError || !u ? null : u);
    });
  });
}

function rbxCopyText(txt, msg) {
  return rbxClip(txt).then((ok) => {
    if (ok) rbxToast(msg || "Copié dans le presse-papiers");
  });
}

function rbxSecretClick() {
  rbxSecretCount++;
  clearTimeout(rbxSecretTimer);
  rbxSecretTimer = setTimeout(() => {
    rbxSecretCount = 0;
  }, 3000);
  if (rbxSecretCount >= 7) {
    rbxSecretCount = 0;
    rbxSecretOpen = true;
    rbxUpdateAdminTab();
    rbxShowTab("admin");
  }
}

function rbxCenterIn(container, el) {
  if (!container || !el) return;
  const c = container.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  container.scrollBy({ left: r.left - c.left - (c.width - r.width) / 2, behavior: "smooth" });
}

function rbxShowTab(id) {
  if (id === "admin" && !(rbxAdmin || rbxSecretOpen)) return;
  document.querySelectorAll("#rx-panel .rx-tab").forEach((b) => {
    const on = b.dataset.tab === id;
    b.classList.toggle("rx-active", on);
    if (on) rbxCenterIn(b.parentElement, b);
  });
  document.querySelectorAll("#rx-panel .rx-section").forEach((s) => s.classList.toggle("rx-active", s.dataset.section === id));
  if (id === "admin") rbxRenderAdmin();
}

function rbxShowSub(id) {
  document.querySelectorAll("#rx-panel .rx-subtab").forEach((b) => {
    const on = b.dataset.sub === id;
    b.classList.toggle("rx-active", on);
    if (on) rbxCenterIn(b.parentElement, b);
  });
  document.querySelectorAll("#rx-panel .rx-sub").forEach((s) => s.classList.toggle("rx-active", s.dataset.subSection === id));
  rbxUpdateGlassPreview();
  rbxUpdateGradPreview();
}

function rbxWheelRotate(bar, itemSel, pick) {
  if (!bar) return;
  bar.addEventListener(
    "wheel",
    (e) => {
      // La molette fait défiler la barre d'onglets, elle ne change plus d'onglet.
      // Barre verticale : défilement natif. Barre horizontale : la molette verticale devient horizontale.
      if (bar.scrollWidth <= bar.clientWidth + 1 || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      e.preventDefault();
      bar.scrollLeft += e.deltaY;
    },
    { passive: false }
  );
}

function rbxApplyTheme(id) {
  const th = RBX_ALL_THEMES[id];
  if (!th) return;
  if (RBX_PREMIUM_THEMES[id] && !rbxPremium.active) {
    rbxToast("Thème réservé au Premium");
    return;
  }
  rbxSet({
    bgColor: th.bgColor,
    cardColor: th.cardColor,
    textColor: th.textColor,
    accent: th.accent,
    accentAuto: true,
    bgGradient: th.gradient || "",
    gradEnabled: false,
    theme: id,
    useBgColor: true
  });
  rbxSyncInputs();
}

function rbxParseGradient(g) {
  const colors = String(g || "").match(/#[0-9a-fA-F]{6}\b/g) || [];
  const ang = /(\d+)deg/.exec(String(g || ""));
  return { colors: colors.slice(0, 4), angle: ang ? Number(ang[1]) : 135 };
}

function rbxColorsPatch(colors) {
  const keys = ["gradA", "gradB", "gradC", "gradD"];
  const p = { gradCount: Math.min(4, Math.max(2, colors.length)) };
  colors.slice(0, 4).forEach((c, i) => {
    p[keys[i]] = c;
  });
  return p;
}

function rbxCurrentStops() {
  const s = rbxState;
  if (s.theme !== "custom") {
    const th = RBX_ALL_THEMES[s.theme];
    if (th && th.gradient) {
      const g = rbxParseGradient(th.gradient);
      if (g.colors.length >= 2) return g.colors;
    }
  }
  return rbxGradStops(s);
}

function rbxHslToHex(h, s, l) {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rbxToHex([f(0) * 255, f(8) * 255, f(4) * 255]);
}

function rbxRandomColors(n) {
  const h = Math.floor(Math.random() * 360);
  const step = 25 + Math.floor(Math.random() * 40);
  const sat = 55 + Math.floor(Math.random() * 30);
  const out = [];
  for (let i = 0; i < n; i++) {
    out.push(rbxHslToHex((h + i * step) % 360, sat, 14 + i * (10 + Math.floor(Math.random() * 6))));
  }
  return out;
}

function rbxGradientEdit(patch) {
  const cur = rbxState;
  const fromPreset = cur.theme !== "custom";
  const sync = Object.keys(patch);
  let out = { ...patch };

  if (fromPreset) {
    const th = RBX_ALL_THEMES[cur.theme];
    let base = {};
    if (th && th.gradient) {
      const g = rbxParseGradient(th.gradient);
      if (g.colors.length >= 2) base = { ...rbxColorsPatch(g.colors), gradAngle: g.angle, gradType: "linear" };
    } else if (th) {
      base = { ...rbxColorsPatch([th.bgColor, rbxMixHex(th.bgColor, th.accent, 0.45)]), gradType: "linear" };
    }
    out = { ...base, ...out, cardColor: "", textColor: "", accentAuto: true };
    sync.push("cardColor", "textColor", "gradA", "gradB", "gradC", "gradD", "gradCount", "gradType", "gradAngle");
  }

  out.gradEnabled = true;
  out.theme = "custom";
  out.bgGradient = "";
  sync.push("gradEnabled");

  const next = { ...cur, ...out };
  const auto = fromPreset ? true : cur.accentAuto !== false;
  if (auto) {
    out.accent = rbxAccentFromStops(rbxGradStops(next));
    sync.push("accent");
  }
  return { patch: out, sync };
}

function rbxApplyGradient(patch, edited) {
  const r = rbxGradientEdit(patch);
  rbxSet(r.patch);
  rbxSyncKeys(r.sync.filter((k) => k !== edited));
  rbxUpdateOutputs();
  rbxMarkTheme();
}

async function rbxAction(name) {
  const q = (n) => document.querySelector(`#rx-panel [data-admin-input="${n}"]`);
  const out = (n) => document.querySelector(`#rx-panel [data-admin-out="${n}"]`);

  if (name === "gradSwap" || name === "gradRandom") {
    if (!rbxPremium.active) {
      rbxToast("Réservé au Premium");
      return;
    }
    if (name === "gradSwap") {
      rbxApplyGradient(rbxColorsPatch(rbxCurrentStops().slice().reverse()), "");
    } else {
      const n = Math.min(4, Math.max(2, rbxCurrentStops().length));
      rbxApplyGradient(rbxColorsPatch(rbxRandomColors(n)), "");
    }
    return;
  }

  if (name === "clearPlaytime") {
    if (confirm("Réinitialiser le temps passé ?")) {
      rbxSet({ playtime: {} });
      rbxRenderLists();
    }
    return;
  }
  if (name === "export") {
    rbxCopyText(JSON.stringify(rbxSaved, null, 2), "Réglages copiés dans le presse-papiers");
    return;
  }
  if (name === "import") {
    const txt = prompt("Colle ici tes réglages (JSON) :");
    if (!txt) return;
    try {
      const obj = JSON.parse(txt);
      const clean = typeof rbx6CleanSettings === "function" ? rbx6CleanSettings(obj) : obj;
      if (!clean || typeof clean !== "object" || !Object.keys(clean).length) throw new Error("vide");
      rbxSet({ ...RBX_DEFAULTS, ...clean });
      rbxSyncInputs();
      rbxRenderLists();
    } catch (e) {
      alert("Réglages invalides.");
    }
    return;
  }
  if (name === "reset") {
    if (confirm("Réinitialiser tous les réglages ?")) {
      rbxSet({ ...RBX_DEFAULTS });
      rbxSyncInputs();
      rbxRenderLists();
    }
    return;
  }

  if (name === "activate") {
    const input = document.querySelector("#rx-panel [data-lic-input]");
    const val = input ? input.value.trim() : "";
    if (!val) {
      rbxToast("Colle d'abord ta clé");
      return;
    }
    const r = await rbxActivateLicense(val);
    rbxToast(r.ok ? "Premium activé" : r.error, r.ok ? 2200 : 4000);
    return;
  }
  if (name === "deactivate") {
    if (confirm("Retirer la licence de cet appareil ?")) {
      await rbxRemoveLicense();
      rbxToast("Licence retirée");
    }
    return;
  }

  if (name === "adminGen") {
    await rbxGenerateAdminKeys();
    rbxToast("Clés générées");
    await rbxRenderAdmin();
    return;
  }
  if (name === "adminImport") {
    const ta = document.querySelector("#rx-panel [data-admin-in='priv']");
    let obj = null;
    try {
      obj = JSON.parse(ta ? ta.value : "");
    } catch (e) {
      obj = null;
    }
    const r = await rbxImportAdminKey(obj);
    rbxToast(r.ok ? "Clé admin importée" : r.error, 3500);
    await rbxRefreshPremium();
    await rbxRenderAdmin();
    return;
  }
  if (name === "adminCopyPub") {
    const el = out("pub");
    if (el && el.value) rbxCopyText(el.value, "Clé publique copiée");
    return;
  }
  if (name === "adminBackup") {
    const store = await rbxStoreGet([RBX_ADMIN_KEY]);
    if (!store[RBX_ADMIN_KEY]) return;
    if (confirm("La clé privée permet de créer des licences. Ne la partage avec personne. Copier la sauvegarde ?")) {
      rbxCopyText(JSON.stringify(store[RBX_ADMIN_KEY]), "Clé privée copiée : garde-la en lieu sûr");
    }
    return;
  }
  if (name === "adminWipe") {
    if (confirm("Supprimer tes clés admin de ce navigateur ? Sans sauvegarde, tu ne pourras plus créer de licences.")) {
      await rbxWipeAdmin();
      rbxSecretOpen = false;
      rbxUpdateAdminTab();
      rbxShowTab("themes");
      rbxToast("Clés admin supprimées");
    }
    return;
  }
  if (name === "adminIssue") {
    const userInput = q("user").value.trim();
    const days = Number(q("days").value);
    const bind = q("bind").checked;
    let uid = 0;
    let label = userInput;
    if (bind) {
      if (!userInput) {
        rbxToast("Entre un pseudo Roblox");
        return;
      }
      const u = await rbxResolveUser(userInput);
      if (!u) {
        rbxToast("Joueur introuvable");
        return;
      }
      uid = u.id;
      label = u.name;
    }
    try {
      const r = await rbxIssueKey({ uid, name: label, days });
      out("key").value = r.key;
      rbxToast("Clé générée");
      const store = await rbxStoreGet([RBX_ISSUED_KEY]);
      rbxFillIssued(store[RBX_ISSUED_KEY]);
    } catch (e) {
      rbxToast(e.message || "Erreur");
    }
    return;
  }
  if (name === "adminCopyKey") {
    const el = out("key");
    if (el && el.value) rbxCopyText(el.value, "Clé copiée");
    else rbxToast("Génère d'abord une clé");
    return;
  }
  if (name === "adminTest") {
    const r = await rbxVerifyLicense(q("testkey").value, false);
    const i = r.info;
    let txt;
    if (r.ok) {
      txt = `Valide · compte ${i.name || "?"} (${i.uid ? i.uid : "tous les comptes"}) · ${i.exp ? "expire le " + new Date(i.exp).toLocaleDateString("fr-FR") : "à vie"}`;
    } else {
      txt = r.error + (i ? ` · compte ${i.name || "?"}` : "");
    }
    out("test").textContent = txt;
    return;
  }
  if (name === "adminPreview") {
    const store = await rbxStoreGet([RBX_PREVIEW_KEY]);
    await rbxSetPreview(!store[RBX_PREVIEW_KEY]);
    await rbxRenderAdmin();
    return;
  }
}

async function rbxIssuedCopy(id) {
  const store = await rbxStoreGet([RBX_ISSUED_KEY]);
  const e = (Array.isArray(store[RBX_ISSUED_KEY]) ? store[RBX_ISSUED_KEY] : []).find((x) => x.id === id);
  if (e) rbxCopyText(e.key, "Clé copiée");
}

async function rbxIssuedDelete(id) {
  if (!confirm("Retirer cette clé de la liste ? Elle reste valide chez la personne jusqu'à son expiration.")) return;
  await rbxRemoveIssued(id);
  const store = await rbxStoreGet([RBX_ISSUED_KEY]);
  rbxFillIssued(store[RBX_ISSUED_KEY]);
}

function rbxTool(name) {
  const q = (n) => document.querySelector(`#rx-panel [data-tool-input="${n}"]`);
  if (name === "user") {
    const v = q("user").value.trim();
    if (!v) return;
    rbxResolveUser(v).then((u) => {
      if (!u) {
        rbxToast("Joueur introuvable");
        return;
      }
      location.href = `https://www.roblox.com/users/${u.id}/profile`;
    });
  }
  if (name === "go") {
    const id = q("id").value.trim();
    const kind = q("kind").value;
    if (!/^\d+$/.test(id) || !["users", "games", "catalog", "groups"].includes(kind)) {
      rbxToast("ID invalide");
      return;
    }
    const path = kind === "users" ? `/users/${id}/profile` : `/${kind}/${id}`;
    location.href = `https://www.roblox.com${path}`;
  }
}

function rbxConvert(el) {
  const rate = Number(rbxState.robuxRate) || 0;
  const other = el.dataset.conv === "robux" ? "money" : "robux";
  const target = document.querySelector(`#rx-panel [data-conv="${other}"]`);
  if (!target) return;
  if (el.value === "" || !rate) {
    target.value = "";
    return;
  }
  const v = Number(el.value);
  target.value = other === "money" ? (v * rate).toFixed(2) : Math.round(v / rate);
}

function rbxClosePanel() {
  const overlay = document.getElementById("rx-overlay");
  if (!overlay) return;
  overlay.classList.remove("rx-open");
  if (!rbxAdmin) {
    rbxSecretOpen = false;
    rbxUpdateAdminTab();
    const active = overlay.querySelector(".rx-tab.rx-active");
    if (active && active.dataset.tab === "admin") rbxShowTab("themes");
  }
}

function rbxBuildPanel() {
  if (document.getElementById("rx-overlay") || !document.body) return;
  const overlay = document.createElement("div");
  overlay.id = "rx-overlay";
  const tabs = RBX_TABS.map((t) => `<button type="button" class="rx-tab" data-tab="${t.id}"${t.admin ? " hidden" : ""}>${t.label}</button>`).join("");
  const sections = RBX_TABS.map((t) => `<section class="rx-section" data-section="${t.id}">${rbxSectionBody(t)}</section>`).join("");
  overlay.innerHTML = `<div id="rx-panel" role="dialog" aria-modal="true"><header class="rx-head"><div class="rx-title"><h2 data-secret>RoNova</h2><span>Personnalise ton Roblox</span></div><div class="rx-head-right"><span class="rx-badge" data-badge></span><label class="rx-inline"><span class="rx-label">Activée</span><span class="rx-switch"><input type="checkbox" data-key="enabled"><i></i></span></label><button type="button" class="rx-close" data-close="1" aria-label="Fermer">×</button></div></header><nav class="rx-tabs">${tabs}</nav><div class="rx-content">${sections}</div></div>`;
  document.body.appendChild(overlay);
  rbxStylePreviews(overlay);

  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t.closest("[data-secret]")) return rbxSecretClick();
    if (t === overlay || t.closest("[data-close]")) return rbxClosePanel();
    const tab = t.closest("[data-tab]");
    if (tab) return rbxShowTab(tab.dataset.tab);
    const sub = t.closest("[data-sub]");
    if (sub) return rbxShowSub(sub.dataset.sub);
    const gp = t.closest("[data-grad-preset]");
    if (gp) {
      if (!rbxPremium.active) return rbxToast("Réservé au Premium");
      const p = RBX_GRAD_PRESETS[gp.dataset.gradPreset];
      if (p) rbxApplyGradient(rbxColorsPatch(p.colors), "");
      return;
    }
    const th = t.closest("[data-theme]");
    if (th) return rbxApplyTheme(th.dataset.theme);
    const clr = t.closest("[data-clear]");
    if (clr) {
      rbxSet({ [clr.dataset.clear]: "", theme: "custom" });
      return rbxSyncInputs();
    }
    const tool = t.closest("[data-tool]");
    if (tool) return rbxTool(tool.dataset.tool);
    const ic = t.closest("[data-issued-copy]");
    if (ic) return rbxIssuedCopy(ic.dataset.issuedCopy);
    const id = t.closest("[data-issued-del]");
    if (id) return rbxIssuedDelete(id.dataset.issuedDel);
    const act = t.closest("[data-act]");
    if (act) rbxAction(act.dataset.act);
  });

  const onEdit = (e) => {
    const el = e.target;
    if (el.dataset && el.dataset.conv) return rbxConvert(el);
    const key = el.dataset && el.dataset.key;
    if (!key) return;
    let v;
    if (el.type === "checkbox") v = el.checked;
    else if (el.type === "range") v = Number(el.value);
    else if (el.type === "number") v = el.value === "" ? "" : Number(el.value);
    else v = el.value;

    if (RBX_GRAD_KEYS.includes(key) || (key === "gradEnabled" && v)) {
      if (key === "gradCount") v = Number(v);
      return rbxApplyGradient({ [key]: v }, key);
    }

    const patch = { [key]: v };
    const sync = [];

    if (["bgColor", "cardColor", "textColor"].includes(key)) patch.theme = "custom";
    if (key === "accent") {
      patch.theme = "custom";
      patch.accentAuto = false;
    }
    if (key === "bgColor") {
      patch.useBgColor = true;
      sync.push("useBgColor");
    }

    if (["autoTheme", "dayTheme", "nightTheme", "dayStart", "nightStart"].includes(key)) patch.autoPeriod = "";

    rbxSet(patch);
    rbxSyncKeys(sync);
    rbxUpdateOutputs();
    rbxMarkTheme();
  };
  overlay.addEventListener("input", onEdit);
  overlay.addEventListener("change", onEdit);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") rbxClosePanel();
  });

  rbxWheelRotate(overlay.querySelector(".rx-tabs"), ".rx-tab", (b) => rbxShowTab(b.dataset.tab));
  rbxWheelRotate(overlay.querySelector(".rx-subtabs"), ".rx-subtab", (b) => rbxShowSub(b.dataset.sub));

  rbxShowTab("themes");
  rbxShowSub("themes");
}

function rbxOpenPanel(tab) {
  try {
    rbxBuildPanel();
    rbxSyncInputs();
    rbxRenderLists();
    rbxRenderBadge();
    rbxRenderLicense();
    rbxUpdateAdminTab();
    if (typeof tab === "string") rbxShowTab(tab);
    const overlay = document.getElementById("rx-overlay");
    if (overlay) overlay.classList.add("rx-open");
  } catch (err) {
    console.error("Roblox Customizer :", err);
    alert("Erreur dans l'extension : " + err.message);
  }
}

rbxOnChange(() => {
  const overlay = document.getElementById("rx-overlay");
  if (overlay && overlay.classList.contains("rx-open")) rbxRenderLists();
});