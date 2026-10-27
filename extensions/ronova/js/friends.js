const RBX11_FILTERS = [
  ["all", "Tous"],
  ["online", "En ligne"],
  ["game", "En jeu"],
  ["best", "Best friends"]
];

const RBX11_STATUS = ["off", "web", "game", "studio"];

const rbx11 = { list: [], pres: new Map(), at: 0, busy: false, filter: "all", sort: "status", q: "", reqAt: 0 };

function rbx11Box() {
  return document.querySelector('#rx-panel [data-rx11="grid"]');
}

function rbx11PaneOn() {
  const ov = document.getElementById("rx-overlay");
  return !!(ov && ov.classList.contains("rx-open") && ov.querySelector('.rx-section[data-section="friends"].rx-active .sx-sub.sx-active[data-soc-pane="all"]'));
}

function rbx11Type(f) {
  const p = rbx11.pres.get(f.id);
  return p ? Number(p.userPresenceType) || 0 : 0;
}

function rbx11StatusText(f) {
  const p = rbx11.pres.get(f.id);
  const t = rbx11Type(f);
  if (t === 2) return p.lastLocation ? p.lastLocation : "En jeu";
  if (t === 3) return "Dans Roblox Studio";
  if (t === 1) return "En ligne";
  if (p && p.lastOnline) {
    const ago = rbxAgo(p.lastOnline);
    if (ago) return "Vu " + ago;
  }
  return "Hors ligne";
}

function rbx11Visible() {
  const best = rbxBestIds();
  const q = rbx5Norm(rbx11.q);
  let rows = rbx11.list.filter((f) => {
    const t = rbx11Type(f);
    if (rbx11.filter === "online" && t < 1) return false;
    if (rbx11.filter === "game" && t !== 2) return false;
    if (rbx11.filter === "best" && !best.has(f.id)) return false;
    if (q && rbx5Norm(`${f.displayName || ""} ${f.name || ""}`).indexOf(q) === -1) return false;
    return true;
  });
  const rank = (f) => {
    const t = rbx11Type(f);
    return (t === 2 ? 0 : t === 3 ? 1 : t === 1 ? 2 : 4) - (best.has(f.id) ? 0.5 : 0);
  };
  rows = rows.slice().sort((a, b) => {
    if (rbx11.sort === "status") {
      const d = rank(a) - rank(b);
      if (d) return d;
    }
    return rbxFriendSortKey(a).localeCompare(rbxFriendSortKey(b));
  });
  return rows;
}

function rbx11Counts() {
  const best = rbxBestIds();
  const c = { all: rbx11.list.length, online: 0, game: 0, best: 0 };
  rbx11.list.forEach((f) => {
    const t = rbx11Type(f);
    if (t >= 1) c.online++;
    if (t === 2) c.game++;
    if (best.has(f.id)) c.best++;
  });
  return c;
}

function rbx11Card(f, isBest) {
  const t = rbx11Type(f);
  const p = rbx11.pres.get(f.id);
  const card = sxEl("div", "rx11-card rx11-" + RBX11_STATUS[t]);
  const av = sxEl("a", "rx11-av");
  av.href = `https://www.roblox.com/users/${f.id}/profile`;
  av.title = "Voir le profil";
  const img = sxImg(rbxHeadCache.get(f.id), "");
  img.loading = "lazy";
  av.appendChild(img);
  av.appendChild(sxEl("i", "rx11-dot"));
  card.appendChild(av);

  const info = sxEl("div", "rx11-info");
  const head = sxEl("div", "rx11-head");
  head.appendChild(sxEl("strong", "rx11-name", f.displayName || f.name || "Joueur " + f.id));
  const cb = typeof rbxCreatorMini === "function" ? rbxCreatorMini(f.id) : null;
  if (cb) head.appendChild(cb);
  info.appendChild(head);
  if (f.name && f.name !== f.displayName) info.appendChild(sxEl("small", "rx11-name", "@" + f.name));
  info.appendChild(sxEl("span", "rx11-st", rbx11StatusText(f)));
  card.appendChild(info);

  const act = sxEl("div", "rx11-act");
  if (rbxCanJoin(p)) {
    const j = sxBtn("Rejoindre", "rx11-join");
    j.addEventListener("click", () => rbxJoinPresence(p));
    act.appendChild(j);
  }
  const star = sxBtn("", isBest ? "rx11-star rx11-on" : "rx11-star");
  star.title = isBest ? "Retirer des best friends" : "Ajouter aux best friends";
  star.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  star.addEventListener("click", () => rbxToggleBest(f.id, f.name, f.displayName));
  act.appendChild(star);
  card.appendChild(act);
  return card;
}

function rbx11Render(anim) {
  const box = rbx11Box();
  if (!box) return;
  box.dataset.anim = anim ? "1" : "0";
  const c = rbx11Counts();
  document.querySelectorAll("#rx-panel [data-rx11-filter]").forEach((b) => {
    const id = b.dataset.rx11Filter;
    b.classList.toggle("rx11-chip-on", id === rbx11.filter);
    const n = b.querySelector("b");
    if (n) n.textContent = rbx11.list.length ? String(c[id]) : "";
  });
  const sum = document.querySelector('#rx-panel [data-rx11="sum"]');
  if (sum) sum.textContent = rbx11.list.length ? `${c.online} en ligne · ${c.game} en jeu · ${c.all} amis` : "";
  box.textContent = "";
  if (rbx11.busy && !rbx11.list.length) {
    for (let i = 0; i < 6; i++) box.appendChild(sxEl("div", "rx11-card rx11-skel"));
    return;
  }
  if (!rbx11.list.length) {
    box.appendChild(sxEl("p", "rx-empty", "Impossible de charger ta liste d'amis. Vérifie que tu es connecté à Roblox."));
    return;
  }
  const rows = rbx11Visible();
  if (!rows.length) {
    box.appendChild(sxEl("p", "rx-empty", rbx11.q ? "Aucun ami ne correspond à ta recherche." : "Personne dans cette catégorie pour l'instant."));
    return;
  }
  const best = rbxBestIds();
  rows.forEach((f, i) => {
    const card = rbx11Card(f, best.has(f.id));
    if (i < 24) card.style.setProperty("--rx11-i", String(i));
    box.appendChild(card);
  });
}

async function rbx11Load(force) {
  if (rbx11.busy) return;
  const first = !rbx11.list.length || force;
  rbx11.busy = true;
  rbx11Render(first);
  try {
    const me = await rbxMyId();
    if (!me) return;
    let list = rbxFriendsList;
    if (force || !list.length) list = await rbxFetchFriendsList(me, null);
    rbx11.list = list.slice();
    const ids = rbx11.list.map((f) => f.id);
    const pres = new Map();
    for (let i = 0; i < ids.length; i += 100) {
      const m = await rbxPresence(ids.slice(i, i + 100));
      m.forEach((v, k) => pres.set(k, v));
    }
    rbx11.pres = pres;
    rbx11.at = Date.now();
    rbx11.busy = false;
    rbx11Render(first);
    await rbxThumbBatch(RBX_HEAD_URL, ids, rbxHeadCache, 100);
  } finally {
    rbx11.busy = false;
    rbx11.at = Date.now();
  }
  rbx11Render();
}

async function rbx11Requests() {
  const now = Date.now();
  if (now - rbx11.reqAt < 30000) return;
  rbx11.reqAt = now;
  const r = await rbxFetchJson("https://friends.roblox.com/v1/user/friend-requests/count");
  const n = r && typeof r.count === "number" ? r.count : 0;
  const tab = document.querySelector('#rx-panel .sx-subtab[data-soc-sub="incoming"]');
  if (!tab) return;
  let b = tab.querySelector(".rx11-count");
  if (!n) {
    if (b) b.remove();
    return;
  }
  if (!b) {
    b = sxEl("span", "rx11-count");
    tab.appendChild(b);
  }
  b.textContent = n > 99 ? "99+" : String(n);
}

function rbx11PaneHtml() {
  const chips = RBX11_FILTERS.map(([id, label]) => `<button type="button" class="rx11-chip" data-rx11-filter="${id}">${label}<b></b></button>`).join("");
  return `<div class="sx-sub sx-active" data-soc-pane="all">
<div class="rx11-bar"><div class="rx11-search"><input type="search" placeholder="Chercher un ami…" data-rx11-in="q" autocomplete="off"></div>
<select data-rx11-in="sort"><option value="status">Trier par statut</option><option value="name">Trier par nom</option></select>
<button type="button" class="rx-sec" data-rx11-act="refresh">Actualiser</button></div>
<div class="rx11-chips">${chips}</div>
<p class="rx-hint rx11-sum" data-rx11="sum"></p>
<div class="rx11-grid" data-rx11="grid"></div>
</div>`;
}

const rbx11TabPrev = rbxTabFriends;
rbxTabFriends = function () {
  let h = rbx11TabPrev();
  const navBtn = '<button type="button" class="sx-subtab sx-active" data-soc-sub="join">Rejoindre</button>';
  if (h.indexOf(navBtn) === -1) return h;
  h = h.replace(navBtn, '<button type="button" class="sx-subtab sx-active" data-soc-sub="all">Mes amis</button><button type="button" class="sx-subtab" data-soc-sub="join">Rejoindre</button>');
  h = h.replace('<button type="button" class="sx-subtab" data-soc-sub="online">En ligne</button>', "");
  h = h.replace('<div class="sx-sub sx-active" data-soc-pane="join">', '<div class="sx-sub" data-soc-pane="join">');
  h = h.replace(/<div class="sx-sub" data-soc-pane="online">[\s\S]*?(?=<div class="sx-sub" data-soc-pane="best">)/, "");
  const nav = h.indexOf("</nav>") + "</nav>".length;
  return h.slice(0, nav) + "\n" + rbx11PaneHtml() + h.slice(nav);
};

const rbx11ShowSubPrev = rbxSocShowSub;
rbxSocShowSub = function (btn) {
  rbx11ShowSubPrev(btn);
  if (btn.dataset.socSub === "all" && (!rbx11.list.length || Date.now() - rbx11.at > 60000)) rbx11Load(false);
};

const rbx11ShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  rbx11ShowTabPrev(id);
  if (id !== "friends") return;
  rbx11Requests().catch(() => {});
  if (rbx11PaneOn()) {
    if (!rbx11.list.length || Date.now() - rbx11.at > 60000) rbx11Load(false);
    else rbx11Render(true);
  }
};

document.addEventListener("click", (e) => {
  const t = e.target;
  if (!t || !t.closest) return;
  const chip = t.closest("#rx-panel [data-rx11-filter]");
  if (chip) {
    rbx11.filter = chip.dataset.rx11Filter;
    rbx11Render(true);
    return;
  }
  const act = t.closest("#rx-panel [data-rx11-act]");
  if (act && act.dataset.rx11Act === "refresh") rbx11Load(true);
});

document.addEventListener("input", (e) => {
  const t = e.target;
  if (!t || !t.matches || !t.matches("#rx-panel [data-rx11-in]")) return;
  if (t.dataset.rx11In === "q") rbx11.q = t.value;
  else if (t.dataset.rx11In === "sort") rbx11.sort = t.value === "name" ? "name" : "status";
  rbx11Render(t.dataset.rx11In === "sort");
});

function rbx11Css(s) {
  if (!s.blurName) return "";
  let css = `html:root:root:root #rx-panel .rx11-name { filter: blur(6px) !important; transition: filter 0.15s; }`;
  if (s.blurReveal !== false) css += `html:root:root:root #rx-panel .rx11-card:hover .rx11-name { filter: none !important; }`;
  return css;
}

const rbx11CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx11CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx11Css(s);
};

let rbx11BestSig = "";

function rbx11Tick() {
  if (!rbx11PaneOn()) return;
  const sig = rbxBestList().map((b) => b.id).join(",");
  if (sig !== rbx11BestSig) {
    rbx11BestSig = sig;
    rbx11Render();
  }
  if (!rbx11.busy && Date.now() - rbx11.at > 60000) rbx11Load(false);
}

rbxEvery(rbx11Tick, 1000);
rbxOnChange(rbxSocStyleRefresh);
