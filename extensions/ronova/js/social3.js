Object.assign(RBX_DEFAULTS, { themePopups: true, friendNames: true });

delete RBX_PREMIUM_OFF.socJoin;

rbxState = rbxEffective(rbxSaved);

(function rbxSoc3Setup() {
  rbxSocAddField("interface", "uiFriends", {
    key: "themePopups",
    type: "checkbox",
    label: "Fenêtre des amis en jeu (Join / Chat) aux couleurs du thème"
  });
  rbxSocAddField("interface", "themePopups", {
    key: "friendNames",
    type: "checkbox",
    label: "Afficher les pseudos des amis sous les jeux où ils jouent"
  });
  const ui = RBX_TABS.find((t) => t.id === "interface");
  const hf = ui && ui.fields ? ui.fields.find((f) => f.key === "showHandles") : null;
  if (hf) hf.label = "Afficher le @pseudo sous chaque nom affiché (hors liste d'amis)";
})();

let rbxFreeCtx = 0;

const rbxNeedPremiumBase = rbxNeedPremium;
rbxNeedPremium = function () {
  return rbxFreeCtx > 0 ? false : rbxNeedPremiumBase();
};

function rbxFreeCall(fn) {
  return function () {
    rbxFreeCtx++;
    try {
      return fn.apply(this, arguments);
    } finally {
      rbxFreeCtx--;
    }
  };
}

rbxJoinUser = rbxFreeCall(rbxJoinUser);
rbxWearOutfit = rbxFreeCall(rbxWearOutfit);

const rbxSocActionFree = rbxSocAction;
rbxSocAction = function (name) {
  if (name === "oLoad" || name === "oRandom") {
    rbxFreeCtx++;
    try {
      return rbxSocActionFree(name);
    } finally {
      rbxFreeCtx--;
    }
  }
  return rbxSocActionFree(name);
};

function rbxUnlockHtml(html) {
  return html.replace(/<p class="sx-lock" data-soc-lock hidden><\/p>\s*/g, "").replace(/ data-soc-premium/g, "");
}

const rbxTabFriendsPrev = rbxTabFriends;
rbxTabFriends = function () {
  return rbxUnlockHtml(rbxTabFriendsPrev());
};

const rbxTabOutfitsPrev = rbxTabOutfits;
rbxTabOutfits = function () {
  return rbxUnlockHtml(rbxTabOutfitsPrev());
};

const rbxSocOnTabPrev = rbxSocOnTab;
rbxSocOnTab = function (id) {
  rbxSocOnTabPrev(id);
  if (id === "outfits" && !rbxPremium.active && !rbxOutfits.length && !rbxOutfitsLoading) rbxLoadOutfits();
};

rbxSocHandleOne = (function (base) {
  return function (a, id) {
    if (a.closest("[class*='friend' i]")) return;
    base(a, id);
  };
})(rbxSocHandleOne);

rbxRenderBest = async function () {
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
    row.appendChild(sxEl("span", "rx-li-name", `${b.d || b.n} (@${b.n})`));
    row.appendChild(sxEl("span", "rx-li-date", rbxPresenceText(p)));
    if (rbxCanJoin(p)) {
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
};

rbxLoadOnline = async function () {
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
  if (!list.length) list = await rbxFetchFriendsList(id, box);
  if (!list.length) {
    box.textContent = "Impossible de charger ta liste d'amis.";
    rbxOnlineBusy = false;
    return;
  }
  const pres = new Map();
  for (let i = 0; i < list.length; i += 100) {
    const m = await rbxPresence(list.slice(i, i + 100).map((f) => f.id));
    m.forEach((v, k) => pres.set(k, v));
  }
  const best = rbxBestIds();
  const online = list.filter((f) => {
    const p = pres.get(f.id);
    return p && p.userPresenceType >= 1;
  });
  const rank = (f) => (best.has(f.id) ? 0 : 2) + (pres.get(f.id).userPresenceType === 2 ? 0 : 1);
  online.sort((a, b) => rank(a) - rank(b) || rbxFriendSortKey(a).localeCompare(rbxFriendSortKey(b)));
  await rbxThumbBatch(RBX_HEAD_URL, online.map((f) => f.id), rbxHeadCache, 100);
  rbxOnlineBusy = false;
  box.textContent = "";
  if (count) count.textContent = `${online.length} ami(s) en ligne sur ${list.length}`;
  if (!online.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun ami en ligne pour l'instant."));
    return;
  }
  let group = "";
  online.forEach((f) => {
    const isBest = best.has(f.id);
    const g = isBest ? "best" : "all";
    if (g !== group) {
      group = g;
      box.appendChild(sxEl("p", "sx-heading", isBest ? "Best friends" : "Autres amis"));
    }
    const p = pres.get(f.id);
    const row = sxEl("div", "rx-li");
    row.appendChild(sxImg(rbxHeadCache.get(f.id), "sx-head"));
    row.appendChild(sxEl("span", "rx-li-name", rbxFriendLabel(f)));
    if (isBest) row.appendChild(sxEl("span", "rx-tag", "Best friend"));
    row.appendChild(sxEl("span", "rx-li-date", rbxPresenceText(p)));
    if (rbxCanJoin(p)) {
      const j = sxBtn("Rejoindre", "rx-sec");
      j.addEventListener("click", () => rbxJoinPresence(p));
      row.appendChild(j);
    }
    const a = sxEl("a", "rx-sec", "Profil");
    a.href = `https://www.roblox.com/users/${f.id}/profile`;
    row.appendChild(a);
    box.appendChild(row);
  });
};

const RBX_SEAM_SKIP = "#rx-panel, #rx-overlay, #rx-dock, #rx-toast, #rx-hover-join2, #rx-bg-layer, #rx-banner";
const RBX_SEAM_TAGS = ["DIV", "NAV", "ASIDE", "SECTION", "MAIN", "HEADER", "FOOTER"];

let rbxSeamAt = 0;

function rbxSeamClear() {
  document.querySelectorAll("[data-rx-seam]").forEach((n) => n.removeAttribute("data-rx-seam"));
}

const rbxSideMemo = { at: 0, el: null };

function rbxFindSidebar() {
  const now = Date.now();
  if (now - rbxSideMemo.at < 1000 && (!rbxSideMemo.el || rbxSideMemo.el.isConnected)) return rbxSideMemo.el;
  rbxSideMemo.at = now;
  rbxSideMemo.el = rbxFindSidebarNow();
  return rbxSideMemo.el;
}

function rbxFindSidebarNow() {
  const links = document.querySelectorAll('a[href*="/home"], a[href*="/my/avatar"], a[href*="/users/friends"]');
  for (const a of links) {
    if (a.closest("#rx-panel, #header, .rbx-header, .navbar-fixed-top")) continue;
    let el = a;
    let found = null;
    for (let i = 0; i < 14 && el && el !== document.body; i++, el = el.parentElement) {
      const r = el.getBoundingClientRect();
      if (r.left <= 6 && r.width >= 120 && r.width <= 420 && r.height >= window.innerHeight * 0.5) found = el;
    }
    if (found) return found;
  }
  return null;
}

function rbxSocSeam() {
  const on = rbxState.enabled && rbxState.uiModern && !rbxState.glassNav;
  if (!on) {
    if (document.querySelector("[data-rx-seam]")) rbxSeamClear();
    return;
  }
  const now = Date.now();
  if (now - rbxSeamAt < 1500) return;
  rbxSeamAt = now;
  const side = rbxFindSidebar();
  if (!side) return;
  const marks = new Set();
  const sr = side.getBoundingClientRect();
  const vh = window.innerHeight;

  let el = side;
  while (el && el !== document.body && el !== document.documentElement) {
    marks.add(el);
    el = el.parentElement;
  }

  side.querySelectorAll("*").forEach((n) => {
    if (!RBX_SEAM_TAGS.includes(n.tagName)) return;
    const r = n.getBoundingClientRect();
    if (r.width >= sr.width * 0.6 && r.height >= vh * 0.4) marks.add(n);
  });

  [sr.right + 1, sr.right + 4, sr.right + 10].forEach((x) => {
    [vh * 0.25, vh * 0.5, vh * 0.75].forEach((y) => {
      document.elementsFromPoint(x, y).forEach((e) => {
        if (e === document.documentElement || e === document.body) return;
        if (!RBX_SEAM_TAGS.includes(e.tagName)) return;
        if (e.closest(RBX_SEAM_SKIP)) return;
        const r = e.getBoundingClientRect();
        if (r.width >= 400 && r.height >= 150) marks.add(e);
      });
    });
  });

  document.querySelectorAll("[data-rx-seam]").forEach((n) => {
    if (!marks.has(n)) n.removeAttribute("data-rx-seam");
  });
  // Réécrire un attribut identique sur <body> et ses parents relançait le calcul des styles de toute la page.
  marks.forEach((n) => {
    if (n.getAttribute("data-rx-seam") !== "1") n.setAttribute("data-rx-seam", "1");
  });
}

const rbxFG = { at: 0, busy: false, map: new Map() };

async function rbxFriendGamesLoad() {
  const now = Date.now();
  if (rbxFG.busy || now - rbxFG.at < 60000) return;
  rbxFG.busy = true;
  rbxFG.at = now;
  try {
    const me = await rbxMyId();
    if (!me) {
      rbxFG.at = Date.now() - 45000;
      return;
    }
    let list = rbxFriendsList;
    if (!list.length) list = await rbxFetchFriendsList(me, null);
    if (!list.length) {
      rbxFG.at = Date.now() - 45000;
      return;
    }
    const map = new Map();
    for (let i = 0; i < list.length; i += 100) {
      const part = list.slice(i, i + 100);
      const pres = await rbxPresence(part.map((f) => f.id));
      part.forEach((f) => {
        const p = pres.get(f.id);
        if (!p || p.userPresenceType !== 2) return;
        [p.rootPlaceId, p.placeId].forEach((pid) => {
          if (!pid) return;
          const k = String(pid);
          if (!map.has(k)) map.set(k, []);
          const arr = map.get(k);
          if (!arr.some((x) => x.id === f.id)) arr.push(f);
        });
      });
      await rbxSleep(200);
    }
    rbxFG.map = map;
    rbxFG.at = Date.now();
  } finally {
    rbxFG.busy = false;
  }
}

function rbxCardFriendRows() {
  const out = [];
  document.querySelectorAll('a[href*="/games/"]').forEach((a) => {
    if (out.length >= 80) return;
    if (a.closest("#rx-panel, #rx-bar, #rx-soc, #rx-overlay, #rx-dock, #rx-hover-join2")) return;
    const m = /\/games\/(\d+)/.exec(a.getAttribute("href") || "");
    if (!m) return;
    const card = a.closest(".game-card-container, [class*='game-card' i], li") || a.parentElement;
    if (!card || out.some((x) => x.card === card)) return;
    if (card.closest("[class*='friends-carousel' i], [class*='friend-tile' i]")) return;
    const imgs = Array.from(card.querySelectorAll("img"));
    if (imgs.length < 2) return;
    let big = imgs[0];
    let bw = big.getBoundingClientRect().width;
    imgs.forEach((i) => {
      const w = i.getBoundingClientRect().width;
      if (w > bw) {
        big = i;
        bw = w;
      }
    });
    if (bw < 80) return;
    const small = imgs.filter((i) => {
      if (i === big) return false;
      const w = i.getBoundingClientRect().width;
      return w > 0 && w <= 56;
    });
    if (!small.length) return;
    let row = small[0];
    while (row.parentElement && row.parentElement !== card && !row.parentElement.contains(big)) row = row.parentElement;
    out.push({ card, pid: m[1], row });
  });
  return out;
}

function rbxSocFriendNames() {
  const on = rbxState.enabled && rbxState.friendNames;
  if (!on) {
    document.querySelectorAll(".rx-fnames").forEach((n) => n.remove());
    return;
  }
  const rows = rbxCardFriendRows();
  if (!rows.length) return;
  rbxFriendGamesLoad().catch(() => {});
  rows.forEach(({ card, pid, row }) => {
    const friends = rbxFG.map.get(pid) || [];
    let el = card.querySelector(".rx-fnames");
    if (!friends.length) {
      if (el) el.remove();
      return;
    }
    const sig = friends.map((f) => f.id).join(",");
    if (el && el.dataset.sig === sig && el.previousElementSibling === row) return;
    if (el) el.remove();
    el = document.createElement("div");
    el.className = "rx-fnames";
    el.dataset.sig = sig;
    const shown = friends.slice(0, 3);
    shown.forEach((f, i) => {
      const sp = document.createElement("span");
      sp.textContent = "@" + (f.name || f.displayName || f.id);
      el.appendChild(sp);
      if (i < shown.length - 1) el.appendChild(document.createTextNode(", "));
    });
    if (friends.length > shown.length) el.appendChild(document.createTextNode(" +" + (friends.length - shown.length)));
    row.insertAdjacentElement("afterend", el);
  });
}

function rbxSoc3Css(s) {
  let css = "";
  if (s.blurName) {
    css += `${RBX_P3} .rx-fnames span { filter: blur(7px) !important; transition: filter 0.15s; }`;
    if (s.blurReveal !== false) css += `${RBX_P3} .rx-fnames span:hover { filter: none !important; }`;
  }
  if (!s.themePopups) return css;
  const d = rbxDerive(s);
  if (!d.page && !d.accent) return css;
  const pop = `${RBX_P3} [data-rx-fpop='1']`;
  css += `${pop} { background: var(--rx-surface) !important; background-image: none !important; color: var(--rx-text) !important; border: 1px solid var(--rx-border) !important; border-radius: 14px !important; box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4) !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`;
  css += `${pop} a, ${pop} p, ${pop} span, ${pop} div, ${pop} h1, ${pop} h2, ${pop} h3 { color: var(--rx-text) !important; }`;
  css += `${pop} [data-rx-fpbtn='primary'] { background: var(--rx-accent) !important; background-color: var(--rx-accent) !important; background-image: none !important; border: 0 !important; border-radius: 10px !important; }`;
  css += `${pop} [data-rx-fpbtn='primary'], ${pop} [data-rx-fpbtn='primary'] * { color: var(--rx-on-accent) !important; }`;
  css += `${pop} [data-rx-fpbtn='secondary'] { background: var(--rx-surface-2) !important; background-color: var(--rx-surface-2) !important; background-image: none !important; border: 1px solid var(--rx-border) !important; border-radius: 10px !important; }`;
  css += `${pop} [data-rx-fpbtn='secondary'], ${pop} [data-rx-fpbtn='secondary'] * { color: var(--rx-text) !important; }`;
  css += `${pop} [data-rx-fpbtn]:hover { filter: brightness(1.1); }`;
  return css;
}

const rbxSoc3CssBase = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbxSoc3CssBase(s);
  if (!s.enabled) return base;
  return base + rbxSoc3Css(s);
};

function rbxSocPopupMark() {
  const s = rbxState;
  if (!s.enabled || !s.themePopups) {
    document.querySelectorAll("[data-rx-fpop]").forEach((n) => n.removeAttribute("data-rx-fpop"));
    document.querySelectorAll("[data-rx-fpbtn]").forEach((n) => n.removeAttribute("data-rx-fpbtn"));
    return;
  }
  if (!document.body) return;
  const skip = "#rx-panel, #rx-bar, #rx-soc, #rx-overlay, #rx-req, #rx-hover-join2, #rx-dock";
  const hint = "[class*='friend' i], [role='dialog'], [class*='popover' i], [class*='dropdown' i], [class*='tooltip' i], [class*='popper' i]";
  const btnSel = "button, [role='button'], a[class*='btn' i]";
  // Les centaines de cartes de jeu de l'accueil ne sont jamais des menus : on les écarte d'emblée.
  const cards = ".game-card-container, .game-card, .list-item.game-card, [class*='game-tile' i], .game-grid, [class*='game-carousel' i]";
  document.querySelectorAll('a[href*="/games/"]').forEach((g) => {
    if (g.closest(skip) || g.closest(cards)) return;
    let el = g.parentElement;
    for (let i = 0; i < 6 && el && el !== document.body; i++, el = el.parentElement) {
      if (el.hasAttribute("data-rx-fpop")) return;
      // Test de taille d'abord (rapide) : les gros parents sont écartés avant toute recherche dans leur contenu.
      const r = el.getBoundingClientRect();
      if (r.width > 480 || r.height > 440) break;
      if (r.width < 150 || r.height < 60) continue;
      if (!el.querySelector('a[href*="/users/"]')) continue;
      const btns = Array.from(el.querySelectorAll(btnSel)).filter((b) => b.offsetParent !== null);
      if (btns.length < 2) continue;
      const pos = getComputedStyle(el).position;
      const popish = !!el.closest(hint) || pos === "fixed" || pos === "absolute";
      if (!popish) continue;
      el.setAttribute("data-rx-fpop", "1");
      btns.forEach((b, k) => b.setAttribute("data-rx-fpbtn", k === 0 ? "primary" : "secondary"));
      return;
    }
  });
}

let rbxPopMarkPending = false;

document.addEventListener("mouseover", (e) => {
  const t = e.target;
  if (!t || !t.closest || !rbxState.enabled || !rbxState.themePopups) return;
  if (!t.closest("[class*='friend' i], [role='dialog']")) return;
  if (rbxPopMarkPending) return;
  rbxPopMarkPending = true;
  [60, 250, 700].forEach((ms) => setTimeout(rbxSocPopupMark, ms));
  setTimeout(() => {
    rbxPopMarkPending = false;
  }, 700);
});

function rbxSoc3Tick() {
  if (!document.body || !rbxDomChanged("soc3")) return;
  document.querySelectorAll("[class*='friend' i] .rx-handle").forEach((n) => n.remove());
  rbxSocPopupMark();
  rbxSocSeam();
  rbxSocFriendNames();
}

rbxEvery(rbxSoc3Tick, 2500);
rbxOnChange(rbxSoc3Tick);
rbxOnChange(rbxSocStyleRefresh);