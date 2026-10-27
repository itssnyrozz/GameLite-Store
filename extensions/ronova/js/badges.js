// Compte du créateur de l'extension : son badge est visible par tous les utilisateurs.
// Pour changer le texte ou la couleur pour tout le monde : onglet Admin > Badge Créateur > Copier la ligne,
// puis remplacer la ligne ci-dessous et publier une nouvelle version.
const RBX_CREATOR = { id: 2971935184, on: true, label: "Créateur", color: "gold" };

// Co-créateur de l'extension : même badge que le créateur (icône clé), vu par tous. Passe avant les titres offerts.
const RBX_COCREATOR = { id: 1675753236, on: true, label: "Co-créateur", color: "gold" }; // Noah_646467

// Titres offerts à d'autres joueurs, visibles par tous ceux qui ont l'extension.
// Couleurs possibles : gold, accent, red, purple, green,
// ou un dégradé : galaxy, rainbow, sunset, ocean, fire, ou une liste comme ["#ff0080", "#7928ca"].
const RBX_TITLES = [];

// Fans : les abonnés des comptes du créateur et du co-créateur ont un badge « Fan », vu par tous.
const RBX_FAN_OF = [2971935184, 1675753236];
const RBX_FAN = { label: "Fan", color: ["#ff4d8d", "#ff9a5c"] };

Object.assign(RBX_DEFAULTS, {
  certOn: true,
  certScale: 100,
  creatorOn: RBX_CREATOR.on,
  creatorLabel: RBX_CREATOR.label,
  creatorColor: RBX_CREATOR.color
});

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});

rbxState = rbxEffective(rbxSaved);

const RBX_CERT_SVG = '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true"><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="1.4" style="fill: var(--rx-cert, #0066ff)" transform="rotate(12 12 12)"/><path d="M7.4 12.4l3.2 3.2 6.2-6.6" fill="none" stroke="#ffffff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const RBX_CREATOR_SVG = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/></svg>';

const RBX_CREATOR_COLORS = {
  accent: ["var(--rx-accent, #335fff)", "var(--rx-on-accent, #ffffff)"],
  gold: ["#f5b301", "#1a1200"],
  red: ["#e5484d", "#ffffff"],
  purple: ["#8b5cf6", "#ffffff"],
  green: ["#00b06f", "#ffffff"]
};

const RBX_FAN_SVG = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8.2 3.6 4.8 7 4.6c2-.1 3.7 1 5 2.8 1.3-1.8 3-2.9 5-2.8 3.4.2 5.3 3.6 4.2 6.6-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>';

const RBX_TITLE_SVG = '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z"/></svg>';

const RBX_CREATOR_GRADS = {
  galaxy: ["#8b5cf6", "#ec4899", "#3b82f6"],
  rainbow: ["#ff4d4d", "#ffb84d", "#4ddb7a", "#4db8ff", "#b84dff"],
  sunset: ["#ff7a18", "#ff3d77", "#af002d"],
  ocean: ["#00c6ff", "#0072ff", "#00d4a0"],
  fire: ["#ffd200", "#ff6a00", "#ee0979"]
};

const RBX_HEX = /^#[0-9a-f]{3}([0-9a-f]{3})?$/i;

// Liste de couleurs du dégradé, ou null pour une couleur unie.
function rbxCreatorGrad(color) {
  const list = Array.isArray(color) ? color : RBX_CREATOR_GRADS[color];
  if (!list) return null;
  const ok = list.filter((x) => RBX_HEX.test(String(x))).slice(0, 6);
  return ok.length >= 2 ? ok : null;
}

const RBX_CREATOR_LINK_SKIP = "#rx-panel, #rx-overlay, #rx-toast, #rx-dock, #rx-bar, #navigation, #header, .rbx-header, .navbar-fixed-top";

const rbxBadge = { at: 0, dirty: true, obs: null, ver: 0, memo: null };

// Réglages en vigueur : ceux du code pour tout le monde, ceux de l'onglet Admin en direct pour le créateur.
function rbxCreatorConf() {
  const s = rbxState;
  if (rbxAdmin) return { id: RBX_CREATOR.id, on: !!s.creatorOn, label: s.creatorLabel, color: s.creatorColor };
  return RBX_CREATOR;
}

// Tous les badges à afficher : le créateur, les titres offerts, puis les fans (un seul badge par joueur).
// Recalculé seulement quand les réglages, les titres ou les fans changent (rbxBadge.ver) : il peut y avoir des milliers de fans.
function rbxBadgeConfs() {
  if (!rbxState.enabled) return [];
  const m = rbxBadge.memo;
  if (m && m.state === rbxState && m.admin === rbxAdmin && m.ver === rbxBadge.ver) return m.list;
  const c = rbxCreatorConf();
  const out = c.on && c.id ? [c] : [];
  if (RBX_COCREATOR.on && Number(RBX_COCREATOR.id) !== Number(c.id)) out.push(Object.assign({ co: true }, RBX_COCREATOR));
  const has = new Set(out.map((x) => Number(x.id)));
  // Un seul badge par joueur : un titre offert au créateur ou au co-créateur est ignoré.
  RBX_TITLES.forEach((t) => {
    if (t && t.id && !has.has(Number(t.id))) out.push({ id: t.id, on: true, label: t.label, color: t.color, title: true });
  });
  out.forEach((x) => has.add(Number(x.id)));
  rbxFans.ids.forEach((id) => {
    if (!has.has(id)) out.push({ id, on: true, label: RBX_FAN.label, color: RBX_FAN.color, title: true, fan: true });
  });
  rbxBadge.memo = { state: rbxState, admin: rbxAdmin, ver: rbxBadge.ver, list: out, map: new Map(out.map((x) => [String(x.id), x])) };
  return out;
}

function rbxBadgeConfFor(id) {
  rbxBadgeConfs();
  return (rbxState.enabled && rbxBadge.memo && rbxBadge.memo.map.get(String(id))) || null;
}

// Badges changés hors des réglages (titres en ligne, fans) : la liste est recalculée et la page repassée.
function rbxBadgeBump() {
  rbxBadge.ver++;
  rbxBadge.dirty = true;
  rbxBadge.at = 0;
}

// Abonnés des comptes de RBX_FAN_OF, gardés 30 minutes (partagés entre les onglets Roblox).
const RBX_FAN_KEY = "rbxCustomizerFans";
const RBX_FAN_TTL = 30 * 60 * 1000;
const rbxFans = { ids: new Set(), at: 0, busy: false };

async function rbxFansLoad() {
  if (rbxFans.busy || Date.now() - rbxFans.at < RBX_FAN_TTL) return;
  rbxFans.busy = true;
  rbxFans.at = Date.now();
  try {
    let st = (await rbxStoreGet([RBX_FAN_KEY]))[RBX_FAN_KEY];
    if (!st || Date.now() - st.at > RBX_FAN_TTL) {
      const ids = new Set();
      let ok = true;
      for (const of of RBX_FAN_OF) {
        let cursor = "";
        for (let page = 0; page < 30; page++) {
          // Roblox ne donne cette liste qu'à un joueur connecté (cookie envoyé par background.js).
          const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${of}/followers?limit=100&sortOrder=Desc${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`);
          if (!r || !Array.isArray(r.data)) {
            if (!page) ok = false;
            break;
          }
          r.data.forEach((u) => u && u.id && ids.add(Number(u.id)));
          cursor = r.nextPageCursor;
          if (!cursor) break;
          await rbxSleep(250);
        }
      }
      if (ok) {
        st = { at: Date.now(), ids: Array.from(ids) };
        await rbxStoreSet({ [RBX_FAN_KEY]: st });
      } else {
        // Pas connecté ou Roblox injoignable : rien n'est gardé, nouvel essai dans 2 minutes.
        // En attendant : l'ancienne liste si elle existe, sinon ce qui a pu être lu.
        rbxFans.at = Date.now() - RBX_FAN_TTL + 120000;
        if (!st) st = { at: 0, ids: Array.from(ids) };
      }
    }
    rbxFans.ids = new Set((st.ids || []).map(Number));
    rbxBadgeBump();
  } finally {
    rbxFans.busy = false;
  }
}

function rbxCreatorText(c) {
  return String(c.label || "").trim().slice(0, 24) || (c.title ? "VIP" : "Créateur");
}

function rbxCreatorPaint(b, c) {
  const grad = rbxCreatorGrad(c.color);
  b.classList.toggle("rx-cb-grad", !!grad);
  if (grad) {
    // Le dégradé se termine par sa première couleur pour boucler sans saut.
    b.style.setProperty("--rx-cb-grad", `linear-gradient(110deg, ${grad.join(", ")}, ${grad[0]})`);
    b.style.setProperty("--rx-cb", grad[Math.floor(grad.length / 2)]);
    b.style.setProperty("--rx-cb-text", "#ffffff");
    return;
  }
  b.style.removeProperty("--rx-cb-grad");
  const col = RBX_CREATOR_COLORS[c.color] || RBX_CREATOR_COLORS.accent;
  b.style.setProperty("--rx-cb", col[0]);
  b.style.setProperty("--rx-cb-text", col[1]);
}

function rbxCreatorBadge(c, small) {
  const b = sxEl("span", small ? "rx-creator rx-creator-sm" : "rx-creator");
  b.title = c.fan ? "Fan : abonné au créateur de RoNova" : c.title ? "Titre offert par le créateur de RoNova" : c.co ? "Co-créateur de l'extension RoNova" : "Créateur de l'extension RoNova";
  b.innerHTML = c.fan ? RBX_FAN_SVG : c.title ? RBX_TITLE_SVG : RBX_CREATOR_SVG;
  b.dataset.rxUid = String(c.id);
  b.appendChild(sxEl("span", "", rbxCreatorText(c)));
  rbxCreatorPaint(b, c);
  return b;
}

function rbxCreatorRefresh(b, c) {
  const label = b.lastElementChild;
  const txt = rbxCreatorText(c);
  if (label && label.textContent !== txt) label.textContent = txt;
  rbxCreatorPaint(b, c);
}

function rbxCreatorMini(id) {
  const c = rbxBadgeConfFor(id);
  return c ? rbxCreatorBadge(c, true) : null;
}

function rbxOwnDisplay() {
  const out = [];
  const m = document.querySelector('meta[name="user-data"]');
  if (m) {
    const d = (m.getAttribute("data-displayname") || "").trim().toLowerCase();
    if (d) out.push(d);
  }
  if (!out.length && rbxMe && rbxMe.name) out.push(String(rbxMe.name).toLowerCase());
  return out;
}

function rbxSocCertBadge() {
  const badge = sxEl("span", "rx-cert");
  badge.title = "Badge certifié";
  badge.innerHTML = RBX_CERT_SVG;
  return badge;
}

const rbxDispCache = new Map();
const rbxBadgeDbg = { how: "", err: "" };

function rbxProfileDisplayName(uid) {
  const k = String(uid);
  if (rbxDispCache.has(k)) return rbxDispCache.get(k);
  rbxDispCache.set(k, null);
  rbxUserInfo(k)
    .then((i) => {
      const n = i && i.user ? String(i.user.displayName || i.user.name || "") : "";
      rbxDispCache.set(k, n);
      if (!n) setTimeout(() => rbxDispCache.delete(k), 30000);
      rbxBadge.dirty = true;
    })
    .catch(() => setTimeout(() => rbxDispCache.delete(k), 30000));
  return null;
}

const RBX_HEAD_SKIP = "#rx-panel, #rx-overlay, #rx-toast, #rx-dock, #rx-bar, #rx-soc, #rx-mutual, #rx-req, #rx-notifs, .rx-creator, .rx-cert";

function rbxHeadWhy(h) {
  if (!h) return "absent";
  const skip = h.closest(RBX_HEAD_SKIP);
  if (skip) return "dans " + rbxBadgeDesc(skip);
  if (!(h.textContent || "").trim()) return "vide";
  const r = h.getBoundingClientRect();
  if (!r.width || !r.height) return "invisible";
  if (r.top + window.scrollY > 1500) return "trop bas (" + Math.round(r.top + window.scrollY) + " px)";
  return "";
}

function rbxHeadOk(h) {
  return !rbxHeadWhy(h);
}

// Nom affiché en haut du profil : id connu du nouveau design, sinon le texte du nom affiché, sinon un titre.
function rbxProfileHeading(uid) {
  const page = rbxPageInfo(location.pathname);
  if (!page || page.k !== "user" || !uid || String(uid) !== page.id) return null;
  const byId = document.getElementById("profile-header-title-container-name");
  if (rbxHeadOk(byId)) {
    rbxBadgeDbg.how = "id";
    return byId;
  }
  const name = rbxProfileDisplayName(uid);
  if (name && document.body) {
    let best = null;
    let bestSize = 0;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.nodeValue && n.nodeValue.trim() === name ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT)
    });
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentElement;
      if (!rbxHeadOk(p)) continue;
      const size = parseFloat(getComputedStyle(p).fontSize) || 0;
      if (size > bestSize) {
        best = p;
        bestSize = size;
      }
    }
    if (best && bestSize >= 16) {
      rbxBadgeDbg.how = "texte";
      return best;
    }
  }
  const mount = rbxMountPoint();
  const h = [mount && mount.querySelector("h1"), ...document.querySelectorAll("#content h1, main h1, h1, #content [class*='text-heading-large'], main [class*='text-heading-large']")].find(rbxHeadOk) || null;
  rbxBadgeDbg.how = h ? "titre" : "introuvable";
  return h;
}

function rbxBadgeDesc(el) {
  if (!el) return "aucun";
  const cls = typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
  return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}${cls}`;
}

function rbxBadgeNameHits(page) {
  const name = page ? rbxDispCache.get(String(page.id)) : "";
  if (!name || !document.body) return "-";
  const out = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode()) && out.length < 6) {
    if (!n.nodeValue || n.nodeValue.trim() !== name) continue;
    const p = n.parentElement;
    out.push(`${rbxBadgeDesc(p)} ${Math.round(parseFloat(getComputedStyle(p).fontSize) || 0)}px ${rbxHeadWhy(p) || "ok"}`);
  }
  return out.length ? out.join(" | ") : "aucun texte identique trouvé";
}

function rbxBadgeDiag() {
  const c = rbxCreatorConf();
  const page = rbxPageInfo(location.pathname);
  const h = page && page.k === "user" ? rbxProfileHeading(page.id) : null;
  const badges = Array.from(document.querySelectorAll(".rx-creator"));
  return [
    `Version : ${chrome.runtime.getManifest().version}`,
    `Page : ${location.pathname} (${page ? page.k + " " + page.id : "autre"})`,
    `Extension activée : ${rbxState.enabled ? "oui" : "non"} · admin : ${rbxAdmin ? "oui" : "non"}`,
    `Badge : compte ${c.id}, ${c.on ? "activé" : "désactivé"}, texte « ${rbxCreatorText(c)} », couleur ${c.color}`,
    `Nom affiché attendu : ${page ? rbxDispCache.get(String(page.id)) || "(en cours)" : "-"}`,
    `Nom trouvé sur la page : ${rbxBadgeDesc(h)} (méthode : ${rbxBadgeDbg.how || "-"})`,
    `Élément id : ${rbxHeadWhy(document.getElementById("profile-header-title-container-name")) || "ok"}`,
    `Textes « ${page ? rbxDispCache.get(String(page.id)) || "?" : "?"} » : ${rbxBadgeNameHits(page)}`,
    `Badges présents : ${badges.length}${badges.length ? " dans " + badges.map((b) => rbxBadgeDesc(b.parentElement)).join(", ") : ""}`,
    `Dernière erreur : ${rbxBadgeDbg.err || "aucune"}`
  ].join("\n");
}

function rbxBadgeBox(el) {
  return el.tagName === "H1" ? el : el.parentElement;
}

function rbxBadgeCreatorHead() {
  const page = rbxPageInfo(location.pathname);
  const c = page && page.k === "user" ? rbxBadgeConfFor(page.id) : null;
  const el = c ? rbxProfileHeading(c.id) : null;
  const box = el ? rbxBadgeBox(el) : null;
  document.querySelectorAll(".rx-creator:not(.rx-creator-sm)").forEach((n) => {
    if (n.parentElement !== box || n.dataset.rxUid !== String(c.id)) n.remove();
  });
  if (!box) return;
  let b = box.querySelector(":scope > .rx-creator:not(.rx-creator-sm)");
  if (b) rbxCreatorRefresh(b, c);
  else b = rbxCreatorBadge(c, false);
  if (box === el) {
    if (box.lastElementChild !== b) box.appendChild(b);
    return;
  }
  const next = el.nextElementSibling;
  const ref = next && next.classList.contains("rx-cert") ? next : el;
  if (ref.nextElementSibling !== b) ref.insertAdjacentElement("afterend", b);
}

// Un seul parcours des liens de profils de la page, quel que soit le nombre de joueurs avec un badge.
function rbxBadgeCreatorLinks() {
  const keep = new Set();
  const byId = new Map();
  if (rbxBadgeConfs().length) {
    document.querySelectorAll('a[href*="/users/"]').forEach((a) => {
      const m = /\/users\/(\d+)\/profile\/?([?#]|$)/.exec(a.getAttribute("href") || "");
      if (!m || !rbxBadgeConfFor(m[1])) return;
      if (!byId.has(m[1])) byId.set(m[1], []);
      byId.get(m[1]).push(a);
    });
  }
  byId.forEach((links, id) => rbxBadgeLinksFor(rbxBadgeConfFor(id), links, keep));
  document.querySelectorAll(".rx-creator-sm").forEach((b) => {
    if (!keep.has(b) && !b.closest("#rx-panel")) b.remove();
  });
}

function rbxBadgeLinksFor(c, links, keep) {
  const head = rbxProfileHeading(c.id);
  let n = 0;
  for (const a of links) {
    if (n >= 40) break;
    if (a.closest(RBX_CREATOR_LINK_SKIP) || (head && (a.contains(head) || rbxBadgeBox(head).contains(a)))) continue;
    const leaves = [];
    rbxLeafTextEls(a, leaves);
    const leaf = leaves.find((l) => {
      const t = (l.textContent || "").trim();
      return t && t.length <= 40 && t.charAt(0) !== "@" && !l.closest(".rx-creator, .rx-handle, .rx-cert");
    });
    if (!leaf) continue;
    n++;
    let b = a.querySelector(`.rx-creator-sm[data-rx-uid="${c.id}"]`);
    if (!b) {
      b = rbxCreatorBadge(c, true);
      leaf.insertAdjacentElement("afterend", b);
    } else {
      rbxCreatorRefresh(b, c);
    }
    keep.add(b);
  }
}

function rbxBadgeCert() {
  const on = rbxState.enabled && rbxState.certOn;
  if (!on) {
    document.querySelectorAll(".rx-cert").forEach((n) => n.remove());
    return;
  }
  const h = rbxMe ? rbxProfileHeading(rbxMe.id) : null;
  if (h && h.tagName === "H1" && !h.querySelector(".rx-cert")) {
    const cr = h.querySelector(":scope > .rx-creator");
    if (cr) cr.insertAdjacentElement("beforebegin", rbxSocCertBadge());
    else h.appendChild(rbxSocCertBadge());
  } else if (h && h.tagName !== "H1" && !(h.nextElementSibling && h.nextElementSibling.classList.contains("rx-cert"))) {
    h.insertAdjacentElement("afterend", rbxSocCertBadge());
  }

  const names = rbxOwnDisplay();
  if (!names.length || !document.body) return;
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const t = node.nodeValue;
      if (!t || t.length > 60) return NodeFilter.FILTER_REJECT;
      // Comparaison du texte d'abord : le test de position (closest) ne sert que pour les vrais candidats.
      if (names.indexOf(t.trim().toLowerCase()) === -1) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || p === document.body || p === document.documentElement) return NodeFilter.FILTER_REJECT;
      if (p.closest("#rx-panel, #rx-toast, #rx-bar, #rx-soc, #rx-req, #rx-mutual, #rx-notifs, script, style, title, textarea, input, select, .rx-cert, .rx-creator, .rx-handle")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  let added = 0;
  let node;
  while ((node = walker.nextNode()) && added < 8) {
    const raw = node.nodeValue.trim();
    if (!raw || raw.charAt(0) === "@") continue;
    if (names.indexOf(raw.toLowerCase()) === -1) continue;
    const p = node.parentElement;
    const around = ((p.parentElement && p.parentElement.textContent) || "").trim();
    if (around.charAt(0) === "@") continue;
    if (p.nextElementSibling && p.nextElementSibling.classList.contains("rx-cert")) continue;
    const ph = p.closest("h1, .profile-name");
    if (ph && ph.querySelector(".rx-cert")) continue;
    if (p.parentElement && p.parentElement.querySelector('[class*="verified" i]')) continue;
    p.insertAdjacentElement("afterend", rbxSocCertBadge());
    added++;
  }
}

function rbxBadgeWatch() {
  if (rbxBadge.obs || !document.body) return;
  rbxBadge.obs = new MutationObserver((muts) => {
    if (rbxBadge.dirty) return;
    for (const m of muts) {
      const t = m.target;
      if (t.nodeType === 1 && t.closest && t.closest("#rx-panel, #rx-toast, #rx-notifs")) continue;
      rbxBadge.dirty = true;
      return;
    }
  });
  rbxBadge.obs.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function rbxBadgeTick() {
  if (!document.body) return;
  rbxBadgeWatch();
  const now = Date.now();
  if (!rbxBadge.dirty && now - rbxBadge.at < 5000) return;
  rbxBadge.dirty = false;
  rbxBadge.at = now;
  [rbxCreatorMigrate, rbxBadgeCreatorHead, rbxBadgeCreatorLinks, rbxBadgeCert].forEach((fn) => {
    try {
      fn();
    } catch (e) {
      rbxBadgeDbg.err = String((e && e.message) || e);
      console.error("Roblox Customizer :", e);
    }
  });
  // Nos propres insertions ne doivent pas relancer un passage.
  if (rbxBadge.obs) rbxBadge.obs.takeRecords();
}

function rbxBadgeCss(s) {
  return `html:root { --rx-cs: ${(rbxSocClamp(s.certScale, 60, 260) / 100).toFixed(2)}; }`;
}

const rbxBadgeCssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbxBadgeCssPrev(s);
  if (!s.enabled) return base;
  return base + rbxBadgeCss(s);
};

// Le badge certifié est réservé à l'abonnement secret : ses réglages sont dans js/secret.js.

function rbxCreatorLine() {
  const s = rbxState;
  const label = rbxCreatorText({ label: s.creatorLabel });
  const color = RBX_CREATOR_COLORS[s.creatorColor] || RBX_CREATOR_GRADS[s.creatorColor] ? s.creatorColor : "gold";
  return `const RBX_CREATOR = { id: ${RBX_CREATOR.id}, on: ${!!s.creatorOn}, label: ${JSON.stringify(label)}, color: ${JSON.stringify(color)} };`;
}

function rbxCreatorMigrate() {
  if (!rbxReady || rbxSaved.creatorV2) return;
  rbxSet({ creatorV2: true, creatorOn: RBX_CREATOR.on, creatorLabel: RBX_CREATOR.label, creatorColor: RBX_CREATOR.color });
}

const rbxBadgeAdminPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  const f = rbxFieldHtml;
  const me = rbxMe;
  const mine = me && Number(me.id) === RBX_CREATOR.id;
  const who = mine ? `Compte créateur : ${me.name} (${me.id}).` : `Compte créateur inscrit dans l'extension : ${RBX_CREATOR.id}.${me ? ` Tu es connecté avec ${me.name} (${me.id}).` : ""}`;
  const section =
    `<div class="rx-group"><div class="rx-col"><span class="rx-label">Badge Créateur</span>` +
    `<p class="rx-hint">${rbxEsc(who)} Le badge s'affiche sur ton profil et à côté de ton pseudo, chez tous ceux qui ont l'extension. Ici tu vois tes changements tout de suite. Pour que les autres les voient, copie la ligne, remplace-la en haut de js/badges.js et publie la nouvelle version.</p></div>` +
    f({ key: "creatorOn", type: "checkbox", label: "Activer le badge Créateur" }) +
    f({ key: "creatorLabel", type: "text", label: "Texte du badge", placeholder: "Créateur" }) +
    f({ key: "creatorColor", type: "select", label: "Couleur du badge", options: [["gold", "Or"], ["accent", "Couleur d'accent"], ["red", "Rouge"], ["purple", "Violet"], ["green", "Vert"], ["galaxy", "Dégradé galaxie"], ["rainbow", "Dégradé arc-en-ciel"], ["sunset", "Dégradé coucher de soleil"], ["ocean", "Dégradé océan"], ["fire", "Dégradé feu"]] }) +
    `<div class="rx-col"><textarea readonly data-admin-out="creator"></textarea><div class="rx-actions"><button type="button" class="rx-sec" data-act="creatorLine">Copier la ligne pour la prochaine version</button></div></div></div>`;
  return section + `<div class="rx-spaced"></div>` + rbxBadgeAdminPrev(store);
};

function rbxCreatorOut() {
  const ta = document.querySelector('#rx-panel [data-admin-out="creator"]');
  if (ta) ta.value = rbxCreatorLine();
  return ta;
}

const rbxBadgeActionPrev = rbxAction;
rbxAction = async function (name) {
  if (name === "badgeDiag") {
    const out = document.querySelector('#rx-panel [data-admin-out="badgeDiag"]');
    rbxBadge.dirty = true;
    rbxBadgeTick();
    if (out) out.value = rbxBadgeDiag();
    return;
  }
  if (name === "creatorLine") {
    if (!rbxAdmin) return;
    rbxCreatorOut();
    rbxCopyText(rbxCreatorLine(), "Ligne copiée : colle-la en haut de js/badges.js");
    return;
  }
  return rbxBadgeActionPrev(name);
};

const rbxBadgeRenderAdminPrev = rbxRenderAdmin;
rbxRenderAdmin = async function () {
  await rbxBadgeRenderAdminPrev();
  rbxCreatorOut();
};

rbxEvery(rbxBadgeTick, 1000);
rbxEvery(() => rbxFansLoad().catch(() => {}), 60000);
rbxFansLoad().catch(() => {});
rbxOnChange(() => {
  rbxBadge.dirty = true;
  rbxCreatorOut();
});
rbxOnChange(rbxMakeThrottle(rbxBadgeTick, 300));
rbxOnChange(rbxSocStyleRefresh);
