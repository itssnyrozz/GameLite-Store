const RBX_FREE_THEMES = {
  graphite: { label: "Graphite", bgColor: "#17181b", cardColor: "#222428", textColor: "#e9eaee", accent: "#8b95a7" },
  lavande: { label: "Lavande", bgColor: "#f4f1fb", cardColor: "#ffffff", textColor: "#2a2140", accent: "#7c5cff" },
  saphir: { label: "Saphir", bgColor: "#0a1330", cardColor: "#11204a", textColor: "#e3ecff", accent: "#2563eb" },
  rubis: { label: "Rubis", bgColor: "#240812", cardColor: "#3a0f1d", textColor: "#ffe3ea", accent: "#e11d48" },
  ardoise: { label: "Ardoise", bgColor: "#1e293b", cardColor: "#273449", textColor: "#e2e8f0", accent: "#38bdf8" },
  peche: { label: "Pêche", bgColor: "#fff4ec", cardColor: "#ffffff", textColor: "#4a2a1a", accent: "#fb7c3c" },
  citron: { label: "Citron", bgColor: "#fbfbe9", cardColor: "#ffffff", textColor: "#2f3216", accent: "#84cc16" },
  corail: { label: "Corail", bgColor: "#2b1517", cardColor: "#402022", textColor: "#ffe8e4", accent: "#ff6f61" },
  nuage: { label: "Nuage", bgColor: "#eef2f7", cardColor: "#ffffff", textColor: "#1c2733", accent: "#0ea5e9" },
  mocha: { label: "Mocha", bgColor: "#1c1512", cardColor: "#2a201b", textColor: "#f0e3d9", accent: "#c08457" },
  cosmos: { label: "Cosmos", bgColor: "#0d0b1e", cardColor: "#1a1633", textColor: "#ece9ff", accent: "#a78bfa" },
  emeraude: { label: "Émeraude", bgColor: "#06201a", cardColor: "#0b2f26", textColor: "#dcfff3", accent: "#34d399" }
};

Object.assign(RBX_THEMES, RBX_FREE_THEMES);
Object.assign(RBX_ALL_THEMES, RBX_FREE_THEMES);

Object.assign(RBX_DEFAULTS, {
  uiModern: true,
  uiFriends: true,
  showHandles: true,
  bestFirst: true,
  hoverJoin: true,
  hideFriendGames: false,
  socV2: false
});

Object.assign(RBX_PREMIUM_OFF, { hoverJoin: false });

RBX_POST_OK.push(/^https:\/\/users\.roblox\.com\/v1\/users$/);

rbxState = rbxEffective(rbxSaved);

(function rbxSoc2Setup() {
  rbxSocAddField("interface", "uiPolish", {
    key: "uiModern",
    type: "checkbox",
    label: "Design moderne : sans cadres gris ni lignes de séparation (menu, en-tête, sections)"
  });
  rbxSocAddField("interface", "uiModern", {
    key: "uiFriends",
    type: "checkbox",
    label: "Liste d'amis améliorée (avatars ronds, noms propres)"
  });
  rbxSocAddField("interface", "uiFriends", {
    key: "showHandles",
    type: "checkbox",
    label: "Afficher le @pseudo sous chaque nom affiché"
  });
  rbxSocAddField("interface", "showHandles", {
    key: "bestFirst",
    type: "checkbox",
    label: "Best friends en premier dans la ligne d'amis de l'accueil"
  });
  const prem = RBX_TABS.find((x) => x.id === "premium");
  const comfort = prem && prem.subs ? prem.subs.find((s) => s.id === "comfort") : null;
  if (comfort && !comfort.fields.some((f) => f.key === "hoverJoin")) {
    const k = comfort.fields.findIndex((f) => f.key === "quickJoinMode");
    comfort.fields.splice(k < 0 ? comfort.fields.length : k + 1, 0, {
      key: "hoverJoin",
      type: "checkbox",
      label: "Bouton Rejoindre au survol d'un jeu"
    });
  }
})();

const RBX_P3 = "html:root:root:root body";

const RBX_SIDEBAR = [
  "#navigation",
  ".rbx-left-col",
  ".left-col-list",
  "#left-navigation-container",
  "[class*='left-col' i]",
  "[class*='left-nav' i]"
];

const RBX_HEADER = ["#header", ".rbx-header", ".navbar-fixed-top"];

const RBX_FOOT = ["#footer-container", "footer", ".footer", ".container-footer", "[id*='footer' i]"];

const RBX_MOD_ROOT = ["#content", ".content", ".container-main", ".rbx-body", "#wrap"];

const RBX_MOD_BG = [
  ".section-content",
  ".section-content-off",
  ".rbx-tabs-horizontal",
  ".tab-content",
  ".rbx-tab-content",
  ".game-card-info",
  ".profile-about-content",
  ".game-description-wrapper",
  "[class*='best-friend' i]",
  "[class*='friends-carousel' i]",
  "[class*='friend-carousel' i]",
  ".avatar-card-image",
  ".thumbnail-2d-container"
];

function rbxSoc3Sel(list) {
  return list.map((x) => `${RBX_P3} ${x}`).join(",");
}

function rbxSoc2Css(s) {
  let css = "";
  const d = rbxDerive(s);
  const grad = rbxGradient(s);
  const layered = !!(s.bgImage || grad);
  const base = d.page || (d.dark ? "#121212" : "#ffffff");
  const A = "var(--rx-accent, #335fff)";

  if (layered) {
    let L;
    let pos = "center";
    let anim = "";
    if (s.bgImage) {
      const url = String(s.bgImage).replace(/"/g, "%22");
      L = rbxBgLayers(s, { image: s.bgImage === RBX_BG_VAR ? "var(--rx-bg-img)" : `url("${url}")`, size: "cover" });
    } else {
      const animated = !!(s.gradEnabled && s.gradAnimated && s.gradType !== "conic");
      L = rbxBgLayers(s, { image: grad, size: animated ? "300% 300%" : "cover" });
      if (animated) {
        pos = "0% 50%";
        anim = `animation: rxGradShift2 ${rbxSocClamp(s.gradSpeed, 4, 90)}s ease-in-out infinite;`;
      }
    }
    // « Rendu net » : une petite image agrandie garde des bords francs au lieu d'être lissée (floue).
    const sharp = s.bgImage && s.bgSharp ? "image-rendering: pixelated;" : "";
    css += `html:root:root #rx-bg-layer { display: block; background-image: ${L.image}; background-size: ${L.size}; background-position: ${pos}; background-repeat: no-repeat; ${anim} ${sharp} }`;
    css += `html:root:root { background-color: ${base} !important; background-image: none !important; animation: none !important; }`;
    css += `${RBX_P2} { background: transparent !important; background-image: none !important; animation: none !important; }`;
    css += `${rbxSocSel(RBX_FOOT)} { background: transparent !important; background-image: none !important; animation: none !important; }`;
    if (!s.glassNav) {
      css += `${rbxSocSel(RBX_SIDEBAR)} { background: transparent !important; background-image: none !important; animation: none !important; }`;
      css += `${rbxSocSel(RBX_HEADER)} { background: ${rbxAlpha(base, 62)} !important; background-image: none !important; animation: none !important; backdrop-filter: blur(14px) !important; -webkit-backdrop-filter: blur(14px) !important; }`;
    }
  }

  if (s.uiModern) {
    css += `${rbxSocSel(RBX_MOD_BG)} { background: transparent !important; background-color: transparent !important; border-color: transparent !important; box-shadow: none !important; backdrop-filter: none !important; -webkit-backdrop-filter: none !important; }`;
    css += `${rbxSocSel([...RBX_SIDEBAR, ...RBX_HEADER, ...RBX_FOOT, ...RBX_MOD_ROOT])} { border: 0 !important; box-shadow: none !important; outline: 0 !important; border-image: none !important; }`;
    const pseudo = [...RBX_SIDEBAR, ...RBX_HEADER].reduce((a, x) => a.concat([x + "::before", x + "::after"]), []);
    css += `${rbxSocSel(pseudo)} { border: 0 !important; box-shadow: none !important; background: transparent !important; }`;
    css += `${rbxSocSel(RBX_SIDEBAR)} { scrollbar-width: none !important; }`;
    css += `${rbxSocSel(RBX_SIDEBAR.map((x) => x + "::-webkit-scrollbar"))} { display: none !important; width: 0 !important; }`;
    css += `${rbxSocSel(["hr"])} { border-color: transparent !important; background: transparent !important; }`;
    css += `html:root:root #rx-bar .rx-card, html:root:root #rx-soc .sx-card, html:root:root #rx-req, html:root:root #rx-mutual, html:root:root #rx-price { background: transparent !important; border-color: transparent !important; }`;
    if (d.page && !layered && !s.glassNav) {
      css += `${rbxSocSel([...RBX_SIDEBAR, ...RBX_HEADER])} { background-color: ${d.page} !important; }`;
    }
  }

  if (s.uiFriends) {
    const circles = [
      "[class*='friends-carousel' i] img",
      "[class*='friends-carousel' i] .thumbnail-2d-container",
      "[class*='friends-carousel' i] .avatar-card-image",
      "[class*='friend-tile' i] img",
      "[class*='friend-tile' i] .thumbnail-2d-container",
      ".avatar-headshot .thumbnail-2d-container",
      "[class*='headshot' i] .thumbnail-2d-container"
    ];
    css += `${rbxSoc3Sel(circles)} { border-radius: 50% !important; }`;
    css += `${rbxSoc3Sel(["[class*='friends-carousel' i] [data-rx-av]"])} { box-shadow: none !important; position: relative; isolation: isolate; overflow: hidden !important; }`;
    css += `${rbxSoc3Sel(["[class*='friends-carousel' i] [data-rx-av]::after"])} { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 50%; pointer-events: none; box-shadow: inset 0 0 0 2px color-mix(in srgb, ${A} 55%, transparent); }`;
    // Le zoom se fait sur l'image, à l'intérieur du cercle : la ligne d'amis rognait l'avatar agrandi.
    css += `${rbxSoc3Sel(["[class*='friends-carousel' i] [data-rx-av] img"])} { transition: transform 0.2s ease; }`;
    css += `${rbxSoc3Sel(["[class*='friends-carousel' i] a:hover [data-rx-av] img"])} { transform: scale(1.1); }`;
    css += `${rbxSoc3Sel(["[class*='friends-carousel-tile-name' i]", "[class*='friend-tile-name' i]"])} { font-weight: 700 !important; max-width: 104px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }`;
    css += `${rbxSoc3Sel(["[class*='friends-carousel-tile-experience' i]"])} { max-width: 108px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 11px !important; padding: 1px 8px; border-radius: 999px; background: color-mix(in srgb, ${A} 16%, transparent) !important; }`;
    css += `${rbxSoc3Sel(["[data-rx-best='1'] [data-rx-av]"])} { position: relative; isolation: isolate; box-shadow: none !important; }`;
    css += `${rbxSoc3Sel(["[data-rx-best='1'] [data-rx-av]::after"])} { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 50%; pointer-events: none; box-shadow: inset 0 0 0 3px #facc15, inset 0 0 12px rgba(250, 204, 21, 0.5) !important; }`;
  }
  css += `${rbxSoc3Sel(["[data-rx-best='1']"])} { position: relative; }`;
  css += `${rbxSoc3Sel(["[data-rx-best='1']::after"])} { content: "★"; position: absolute; top: -2px; right: 4px; z-index: 2; color: #facc15; font-size: 16px; line-height: 1; text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6); pointer-events: none; }`;

  return css;
}

const rbxSocBuildCssBase = rbxSocBuildCss;

rbxSocBuildCss = function (s) {
  const base = rbxSocBuildCssBase(s);
  if (!s.enabled) return base;
  return base + rbxSoc2Css(s);
};

function rbxSocLayer() {
  if (!document.body || document.getElementById("rx-bg-layer")) return;
  const el = document.createElement("div");
  el.id = "rx-bg-layer";
  el.setAttribute("aria-hidden", "true");
  document.documentElement.insertBefore(el, document.body);
}

function rbxFindProfileHeader() {
  const mount = rbxMountPoint();
  if (!mount) return null;
  const direct = mount.querySelector("[data-testid*='profile-header' i], [class*='profile-header' i]");
  if (direct) {
    const r = direct.getBoundingClientRect();
    if (r.width > 350 && r.height < 520 && direct.querySelector("img, canvas")) return direct;
  }
  const h1 = mount.querySelector("h1");
  if (!h1) return null;
  let el = h1;
  for (let i = 0; i < 8; i++) {
    el = el.parentElement;
    if (!el || el === mount || el === document.body) break;
    const r = el.getBoundingClientRect();
    if (r.width > 350 && r.height < 520 && el.querySelector("img, canvas")) return el;
  }
  return null;
}

function rbxSocUnhost(h) {
  h.classList.remove("rx-banner-host");
  h.style.minHeight = "";
  h.style.borderRadius = "";
}

rbxSocBannerEl = function () {
  const s = rbxState;
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-banner");
  const oldHost = document.querySelector(".rx-banner-host");
  const me = rbxMe;
  const has = rbxBanner && typeof rbxBanner.url === "string" && rbxBanner.url.indexOf("data:image/") === 0;
  const want = s.enabled && s.socBanner && has && page && page.k === "user" && me && String(me.id) === page.id && mount;
  if (!want) {
    if (el) el.remove();
    if (oldHost) rbxSocUnhost(oldHost);
    return;
  }
  const host = rbxFindProfileHeader();
  const pos = rbxSocClamp(s.bannerPos, 0, 100);
  const height = rbxSocClamp(s.bannerHeight, 100, 420);
  const radius = rbxSocClamp(s.bannerRadius, 0, 30);
  if (!el) {
    el = sxEl("div", "");
    el.id = "rx-banner";
    el.appendChild(document.createElement("canvas"));
  }
  if (host) {
    if (oldHost && oldHost !== host) rbxSocUnhost(oldHost);
    host.classList.add("rx-banner-host");
    host.style.minHeight = height + "px";
    host.style.borderRadius = radius + "px";
    el.classList.add("rx-banner-bg");
    el.style.height = "";
    el.style.borderRadius = "";
    if (host.firstChild !== el) host.insertBefore(el, host.firstChild);
  } else {
    if (oldHost) rbxSocUnhost(oldHost);
    el.classList.remove("rx-banner-bg");
    el.style.height = height + "px";
    el.style.borderRadius = radius + "px";
    if (mount.firstChild !== el) mount.insertBefore(el, mount.firstChild);
  }
  const canvas = el.firstChild;
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
};

const rbxPostBodyBase = rbxPostBody;
rbxPostBody = function (url, body) {
  if (/^https:\/\/users\.roblox\.com\/v1\/users$/.test(String(url))) {
    const ids = body && Array.isArray(body.userIds) ? body.userIds.map(Number).filter((n) => n > 0).slice(0, 100) : [];
    return { userIds: ids, excludeBannedUsers: false };
  }
  return rbxPostBodyBase(url, body);
};

async function rbxFillNames(list) {
  for (let i = 0; i < list.length; i += 100) {
    const part = list.slice(i, i + 100);
    const r = await rbxPostJson("https://users.roblox.com/v1/users", { userIds: part.map((f) => f.id) });
    if (r.ok && r.data && Array.isArray(r.data.data)) {
      const m = new Map(r.data.data.map((u) => [u.id, u]));
      part.forEach((f) => {
        const u = m.get(f.id);
        if (u) {
          f.name = u.name;
          f.displayName = u.displayName;
        }
      });
    }
    await rbxSleep(250);
  }
}

async function rbxFriendsFind(id) {
  const out = [];
  let cursor = "";
  for (let i = 0; i < 12; i++) {
    const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/friends/find?limit=100${cursor ? "&cursor=" + encodeURIComponent(cursor) : ""}`);
    const items = r && (r.PageItems || r.data);
    if (!Array.isArray(items)) break;
    items.forEach((f) => {
      if (f && f.id) out.push({ id: f.id, name: f.name || "", displayName: f.displayName || "", isOnline: !!f.isOnline });
    });
    cursor = r.NextCursor || r.nextPageCursor || "";
    if (!cursor) break;
    await rbxSleep(250);
  }
  return out;
}

function rbxFriendLabel(f) {
  const n = f.name || "";
  const d = f.displayName || "";
  if (!n && !d) return "Joueur " + f.id;
  if (d && n && d !== n) return `${d} (@${n})`;
  return n || d;
}

function rbxFriendSortKey(f) {
  return String(f.displayName || f.name || f.id).toLowerCase();
}

async function rbxFetchFriendsList(id, box) {
  const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${id}/friends`);
  let list = r && Array.isArray(r.data)
    ? r.data.filter((f) => f && f.id).map((f) => ({ id: f.id, name: f.name || "", displayName: f.displayName || "", isOnline: !!f.isOnline }))
    : [];
  if (!list.length) list = await rbxFriendsFind(id);
  const need = list.filter((f) => !f.name);
  if (need.length) {
    if (box) box.textContent = `Chargement des pseudos de ${need.length} amis…`;
    await rbxFillNames(need);
  }
  list.sort((a, b) => rbxFriendSortKey(a).localeCompare(rbxFriendSortKey(b)));
  rbxFriendsList = list;
  return list;
}

function rbxFriendRow(f, isBest) {
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
  row.appendChild(sxEl("span", "rx-li-name", rbxFriendLabel(f)));
  if (isBest) row.appendChild(sxEl("span", "rx-tag", "Best friend"));
  if (f.isOnline) row.appendChild(sxEl("span", "rx-li-date", "En ligne"));
  row.addEventListener("click", (e) => {
    if (e.target === cb) return;
    cb.checked = !cb.checked;
    cb.dispatchEvent(new Event("change"));
  });
  return row;
}

rbxRenderFriends = function () {
  const box = document.querySelector('#rx-panel [data-soc-list="friends"]');
  if (!box) return;
  const count = document.querySelector('#rx-panel [data-soc-out="uCount"]');
  if (count) count.textContent = rbxFriendsList.length ? `${rbxFriendsList.length} amis chargés` : "";
  box.textContent = "";
  const rows = rbxVisibleFriends();
  if (!rows.length) {
    box.appendChild(sxEl("p", "rx-empty", rbxFriendsList.length ? "Aucun ami ne correspond au filtre." : "Clique sur « Charger mes amis »."));
    rbxUpdateRemoveBtn();
    return;
  }
  const best = rbxBestIds();
  const bestRows = rows.filter((f) => best.has(f.id));
  const otherRows = rows.filter((f) => !best.has(f.id));
  if (bestRows.length) {
    box.appendChild(sxEl("p", "sx-heading", `Best friends (${bestRows.length})`));
    bestRows.forEach((f) => box.appendChild(rbxFriendRow(f, true)));
  }
  if (otherRows.length) {
    box.appendChild(sxEl("p", "sx-heading", bestRows.length ? `Tous les autres amis (${otherRows.length})` : `Tous les amis (${otherRows.length})`));
    otherRows.forEach((f) => box.appendChild(rbxFriendRow(f, false)));
  }
  rbxUpdateRemoveBtn();
};

rbxLoadFriends = async function () {
  const box = document.querySelector('#rx-panel [data-soc-list="friends"]');
  if (!box) return;
  box.textContent = "Chargement de tes amis…";
  const id = await rbxMyId();
  if (!id) {
    box.textContent = "Connecte-toi à Roblox.";
    return;
  }
  const list = await rbxFetchFriendsList(id, box);
  if (!list.length) {
    box.textContent = "Impossible de charger ta liste d'amis : Roblox n'a pas répondu.";
    return;
  }
  rbxFriendSel.clear();
  rbxRenderFriends();
  rbxThumbBatch(RBX_HEAD_URL, list.map((f) => f.id), rbxHeadCache, 100).then(rbxRenderFriends);
};

async function rbxFriendStatus(uid) {
  const me = await rbxMyId();
  if (!me) return null;
  const r = await rbxFetchJson(`https://friends.roblox.com/v1/users/${me}/friends/statuses?userIds=${uid}`);
  const d = r && Array.isArray(r.data) ? r.data[0] : null;
  return d && d.status ? String(d.status) : null;
}

async function rbxCancelRequest(uid) {
  const st = await rbxFriendStatus(uid);
  const low = st ? st.toLowerCase() : "";
  if (low !== "requestsent") {
    if (low === "friends") rbxToast("C'est déjà ton ami : rien n'a été annulé");
    else if (!st) rbxToast("Impossible de vérifier la demande : rien n'a été annulé");
    else rbxToast("Aucune demande envoyée trouvée pour cette personne");
    return false;
  }
  let r = await rbxPostJson(`https://friends.roblox.com/v1/users/${uid}/unfriend`, undefined);
  if (r.status === 429) {
    await rbxSleep(4000);
    r = await rbxPostJson(`https://friends.roblox.com/v1/users/${uid}/unfriend`, undefined);
  }
  if (r.ok) {
    rbxToast("Demande annulée");
    return true;
  }
  rbxToast("Roblox a refusé l'annulation de la demande");
  return false;
}

const rbxTabFriendsBase = rbxTabFriends;
rbxTabFriends = function () {
  let h = rbxTabFriendsBase();
  h = h.replace(
    '<button type="button" class="sx-subtab" data-soc-sub="unfriend">Retirer des amis</button>',
    '<button type="button" class="sx-subtab" data-soc-sub="unfriend">Retirer des amis</button><button type="button" class="sx-subtab" data-soc-sub="requests">Demandes envoyées</button>'
  );
  h = h.replace(
    '<div class="rx-list rx-spaced" data-soc-list="friends"></div>',
    '<p class="rx-hint rx-spaced" data-soc-out="uCount"></p><div class="rx-list" data-soc-list="friends"></div>'
  );
  h += `<div class="sx-sub" data-soc-pane="requests">
<p class="rx-hint">Annule une demande d'ami que tu as envoyée. Entre le pseudo de la personne. L'extension vérifie d'abord qu'il s'agit bien d'une demande en attente et jamais d'un ami déjà accepté.</p>
<div class="rx-inline"><input type="text" placeholder="Pseudo ou ID" data-soc-in="reqUser"><button type="button" class="rx-sec" data-soc="reqCancel">Annuler la demande</button></div>
<p class="rx-hint" data-soc-out="req"></p>
<p class="rx-hint">Tu peux aussi annuler directement depuis le profil de la personne : un bouton apparaît si ta demande est en attente.</p>
</div>`;
  return h;
};

const rbxSocActionBase = rbxSocAction;
rbxSocAction = async function (name) {
  if (name === "reqCancel") {
    const inp = document.querySelector('#rx-panel [data-soc-in="reqUser"]');
    const out = document.querySelector('#rx-panel [data-soc-out="req"]');
    const v = (inp ? inp.value : "").trim().replace(/^@/, "");
    if (!v) {
      rbxToast("Entre un pseudo");
      return;
    }
    let id = 0;
    if (/^\d+$/.test(v)) {
      id = Number(v);
    } else {
      const u = await rbxResolveUser(v);
      if (u) id = u.id;
    }
    if (!id) {
      if (out) out.textContent = "Joueur introuvable.";
      return;
    }
    if (out) out.textContent = "Vérification…";
    const ok = await rbxCancelRequest(id);
    if (out) out.textContent = ok ? "Demande annulée." : "Rien n'a été annulé.";
    return;
  }
  return rbxSocActionBase(name);
};

let rbxReqPage = "";
let rbxReqStatus = null;
let rbxReqAt = 0;
let rbxReqBusy = false;

async function rbxSocReqRender() {
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-req");
  const me = rbxMe;
  if (!rbxState.enabled || !page || page.k !== "user" || !me || String(me.id) === page.id || !mount) {
    if (el) el.remove();
    rbxReqPage = "";
    return;
  }
  const now = Date.now();
  if (rbxReqPage !== page.id || now - rbxReqAt > 20000) {
    if (rbxReqBusy) return;
    rbxReqBusy = true;
    rbxReqPage = page.id;
    rbxReqAt = now;
    rbxReqStatus = await rbxFriendStatus(page.id);
    rbxReqBusy = false;
  }
  if (rbxReqPage !== page.id || !rbxReqStatus || rbxReqStatus.toLowerCase() !== "requestsent") {
    if (el) el.remove();
    return;
  }
  if (el && mount.contains(el)) return;
  el = sxEl("div", "");
  el.id = "rx-req";
  el.appendChild(sxEl("span", "", "Tu as envoyé une demande d'ami à cette personne."));
  const b = sxBtn("Annuler la demande", "sx-btn");
  b.addEventListener("click", async () => {
    b.disabled = true;
    const ok = await rbxCancelRequest(page.id);
    b.disabled = false;
    if (ok) {
      rbxReqStatus = "NotFriends";
      el.remove();
    }
  });
  el.appendChild(b);
  const soc = document.getElementById("rx-soc");
  const bar = document.getElementById("rx-bar");
  const anchor = soc && soc.parentElement === mount ? soc : bar && bar.parentElement === mount ? bar : null;
  if (anchor) anchor.insertAdjacentElement("afterend", el);
  else mount.insertBefore(el, mount.firstChild);
}

const rbxHandleCache = new Map();
let rbxHandleBusy = false;
let rbxHandleAt = 0;
let rbxHandleWait = 0;
let rbxBestAt = 0;

function rbxHandleAnchors() {
  const out = [];
  document.querySelectorAll('a[href*="/users/"]').forEach((a) => {
    if (a.closest(RBX_NAME_LINK_SKIP + ", #rx-soc, #rx-req")) return;
    const m = /\/users\/(\d+)\/profile/.exec(a.getAttribute("href") || "");
    if (m) out.push({ a, id: Number(m[1]) });
  });
  return out;
}

function rbxSocHandleOne(a, id) {
  const info = rbxHandleCache.get(id);
  if (!info || !info.n || a.querySelector(".rx-handle")) return;
  const leaves = [];
  rbxLeafTextEls(a, leaves);
  const leaf = leaves.find((l) => {
    const t = (l.textContent || "").trim();
    return t && t.length <= 40 && t.charAt(0) !== "@" && !l.classList.contains("rx-handle");
  });
  if (!leaf) return;
  const shown = (leaf.textContent || "").trim().toLowerCase();
  if (shown === String(info.n).toLowerCase()) return;
  let ref = leaf;
  const par = leaf.parentElement;
  if (par && par !== a && a.contains(par)) {
    const disp = getComputedStyle(par).display;
    if (disp.indexOf("flex") !== -1 || disp.indexOf("grid") !== -1) ref = par;
  }
  const h = document.createElement("span");
  h.className = "rx-handle";
  h.textContent = "@" + info.n;
  ref.insertAdjacentElement("afterend", h);
}

async function rbxSocHandles() {
  const on = rbxState.enabled && rbxState.showHandles;
  if (!on) {
    document.querySelectorAll(".rx-handle").forEach((n) => n.remove());
    return;
  }
  const now = Date.now();
  if (rbxHandleBusy || now < rbxHandleWait || now - rbxHandleAt < 1500) return;
  rbxHandleAt = now;
  const items = rbxHandleAnchors();
  if (!items.length) return;
  const need = Array.from(new Set(items.map((x) => x.id))).filter((id) => !rbxHandleCache.has(id)).slice(0, 100);
  if (need.length) {
    rbxHandleBusy = true;
    let r = { ok: false };
    try {
      r = await rbxPostJson("https://users.roblox.com/v1/users", { userIds: need });
    } catch (e) {
      r = { ok: false };
    } finally {
      rbxHandleBusy = false;
    }
    if (r.ok && r.data && Array.isArray(r.data.data)) {
      r.data.data.forEach((u) => rbxHandleCache.set(u.id, { n: u.name, d: u.displayName }));
      need.forEach((id) => {
        if (!rbxHandleCache.has(id)) rbxHandleCache.set(id, null);
      });
    } else {
      rbxHandleWait = Date.now() + 15000;
    }
  }
  items.forEach((x) => rbxSocHandleOne(x.a, x.id));
}

function rbxFindTile(a) {
  let el = a;
  for (let i = 0; i < 6; i++) {
    const p = el.parentElement;
    if (!p || p === document.body) return null;
    const kids = Array.from(p.children).filter((k) => k.matches('a[href*="/users/"]') || k.querySelector('a[href*="/users/"]'));
    if (kids.length >= 3) return { tile: el, parent: p };
    el = p;
  }
  return null;
}

function rbxSocBestFirst() {
  const best = rbxBestIds();
  const on = rbxState.enabled && rbxState.bestFirst && best.size > 0;
  if (!on) {
    document.querySelectorAll("[data-rx-best]").forEach((el) => {
      el.style.order = "";
      el.removeAttribute("data-rx-best");
    });
    return;
  }
  const now = Date.now();
  if (now - rbxBestAt < 1200 || !rbxDomChanged("best")) return;
  rbxBestAt = now;
  const seen = new Set();
  rbxHandleAnchors().forEach(({ a, id }) => {
    if (!a.closest("[class*='friend' i]")) return;
    const f = rbxFindTile(a);
    if (!f || seen.has(f.tile)) return;
    const disp = getComputedStyle(f.parent).display;
    if (disp.indexOf("flex") === -1 && disp.indexOf("grid") === -1) return;
    seen.add(f.tile);
    if (best.has(id)) {
      if (f.tile.getAttribute("data-rx-best") !== "1") {
        f.tile.style.order = "-1";
        f.tile.setAttribute("data-rx-best", "1");
      }
    } else if (f.tile.getAttribute("data-rx-best")) {
      f.tile.style.order = "";
      f.tile.removeAttribute("data-rx-best");
    }
  });
}

function rbxSoc2Migrate() {
  if (!rbxReady || rbxSaved.socV2) return;
  rbxSet({ socV2: true, hideFriendGames: false });
}

function rbxSoc2Tick() {
  if (!document.body) return;
  rbxSoc2Migrate();
  rbxSocLayer();
  rbxSocReqRender();
  rbxSocHandles().catch(() => {});
  rbxSocBestFirst();
}

rbxEvery(rbxSoc2Tick, 1000);
rbxOnChange(rbxSoc2Tick);