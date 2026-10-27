// Outils 9.6 : alertes quand un ami se connecte (gratuit), annonces du créateur à tous les utilisateurs,
// entretien de la liste en ligne (Admin).

// ---------- Alertes d'amis (gratuit, désactivé par défaut) ----------

Object.assign(RBX_DEFAULTS, { friendAlerts: false, friendAlertsBest: false, friendAlertsGame: true });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

const RBX_ALERT_KEY = "rbxCustomizerFriendAlerts";
const rbxAlerts = { busy: false, listAt: 0 };

const rbxToolsTabPrev = rbxTabFriends;
rbxTabFriends = function () {
  const f = rbxFieldHtml;
  const group =
    `<div class="rx-group">` +
    f({ key: "friendAlerts", type: "checkbox", label: "Me prévenir quand un ami se connecte" }) +
    f({ key: "friendAlertsGame", type: "checkbox", label: "Me prévenir aussi quand un ami lance un jeu" }) +
    f({ key: "friendAlertsBest", type: "checkbox", label: "Seulement pour mes meilleurs amis" }) +
    `</div><p class="rx-hint">Vérifié toutes les minutes tant qu'un onglet Roblox est ouvert.</p>`;
  return group + rbxToolsTabPrev();
};

async function rbxAlertsTick() {
  const s = rbxState;
  if (!rbxReady || !s.enabled || !s.friendAlerts || rbxAlerts.busy) return;
  const me = rbxMyIdNow();
  if (!me) return;
  // Un seul onglet vérifie ; l'état précédent est partagé pour ne pas prévenir deux fois.
  const st = await rbxStoreGet([RBX_ALERT_KEY]);
  const prev = st[RBX_ALERT_KEY] && typeof st[RBX_ALERT_KEY] === "object" ? st[RBX_ALERT_KEY] : null;
  if (prev && Date.now() - (prev.at || 0) < 50000) return;
  rbxAlerts.busy = true;
  try {
    if (!rbxFriendsList.length || Date.now() - rbxAlerts.listAt > 600000) {
      await rbxFetchFriendsList(me, null);
      rbxAlerts.listAt = Date.now();
    }
    let list = rbxFriendsList;
    if (s.friendAlertsBest) {
      const best = rbxBestIds();
      list = list.filter((f) => best.has(f.id));
    }
    list = list.slice(0, 200);
    if (!list.length) return;
    const pres = new Map();
    for (let i = 0; i < list.length; i += 100) {
      const part = await rbxPresence(list.slice(i, i + 100).map((f) => f.id));
      part.forEach((p, id) => pres.set(id, p));
    }
    const now = {};
    pres.forEach((p, id) => {
      now[id] = [p.userPresenceType || 0, p.lastLocation || ""];
    });
    const old = prev && prev.uid === me ? prev.map || {} : null;
    await rbxStoreSet({ [RBX_ALERT_KEY]: { uid: me, at: Date.now(), map: now } });
    // Premier passage : on mémorise seulement, sans alerte.
    if (!old) return;
    const msgs = [];
    list.forEach((f) => {
      const a = old[f.id] || [0, ""];
      const b = now[f.id];
      if (!b) return;
      const who = f.displayName || f.name || "Un ami";
      if (a[0] === 0 && b[0] > 0) msgs.push(b[0] === 2 && b[1] && s.friendAlertsGame ? `${who} est en ligne et joue à ${b[1]}` : `${who} vient de se connecter`);
      else if (s.friendAlertsGame && b[0] === 2 && (a[0] !== 2 || a[1] !== b[1]) && b[1]) msgs.push(`${who} joue à ${b[1]}`);
    });
    if (!msgs.length) return;
    rbxToast(msgs.length > 3 ? `${msgs.slice(0, 2).join(" · ")} · et ${msgs.length - 2} autres` : msgs.join(" · "), 6000);
  } finally {
    rbxAlerts.busy = false;
  }
}

rbxEvery(() => {
  rbxAlertsTick().catch(() => {
    rbxAlerts.busy = false;
  });
}, 60000);

// ---------- Annonces du créateur (lues par toutes les extensions) ----------

const RBX_ANNOUNCE_FILE = "rbx-announce.json";
const RBX_ANNOUNCE_KEY = "rbxCustomizerAnnounce";
const RBX_ANNOUNCE_SEEN = "rbxCustomizerAnnounceSeen";

function rbxAnnounceParse(gist) {
  const f = gist && gist.files ? gist.files[RBX_ANNOUNCE_FILE] : null;
  if (!f || typeof f.content !== "string") return null;
  try {
    const d = JSON.parse(f.content);
    if (!d || typeof d.text !== "string" || !d.text.trim() || !d.id) return null;
    return { id: String(d.id).slice(0, 40), text: d.text.trim().slice(0, 300), at: Number(d.at) || 0 };
  } catch (e) {
    return null;
  }
}

// Appelé par rbxCloudSync (js/cloud.js) à chaque lecture complète du gist.
async function rbxAnnounceStore(gist) {
  await rbxStoreSet({ [RBX_ANNOUNCE_KEY]: rbxAnnounceParse(gist), [RBX_SHARED_BANNERS_KEY]: rbxBannersParse(gist) });
}

// ---------- Bannières publiques (fichier rbx-banners.json du gist, écrit par le créateur) ----------

const RBX_BANNERS_FILE = "rbx-banners.json";
const RBX_SHARED_BANNERS_KEY = "rbxCustomizerSharedBanners";
let rbxSharedBanners = {};

function rbxBannersParse(gist) {
  const f = gist && gist.files ? gist.files[RBX_BANNERS_FILE] : null;
  if (!f || typeof f.content !== "string") return {};
  try {
    const d = JSON.parse(f.content);
    const out = {};
    Object.entries((d && d.banners) || {}).forEach(([uid, b]) => {
      if (!/^\d+$/.test(uid) || !b || typeof b.url !== "string") return;
      if (b.url.indexOf("data:image/") !== 0 || b.url.length > 950000) return;
      out[uid] = { url: b.url, ts: Number(b.ts) || 0, pos: rbxSocClamp(b.pos, 0, 100) };
    });
    return out;
  } catch (e) {
    return {};
  }
}

function rbxSharedBannerFor(uid) {
  return rbxSharedBanners[String(uid)] || null;
}

chrome.storage.local.get(RBX_SHARED_BANNERS_KEY, (res) => {
  rbxSharedBanners = (res && res[RBX_SHARED_BANNERS_KEY]) || {};
});
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[RBX_SHARED_BANNERS_KEY]) rbxSharedBanners = changes[RBX_SHARED_BANNERS_KEY].newValue || {};
});

Object.assign(RBX_DEFAULTS, { sharedBanners: true });
if (rbxSaved.sharedBanners === undefined) rbxSaved.sharedBanners = true;
rbxSocAddField("profile", "socMutual", { key: "sharedBanners", type: "checkbox", label: "Voir les bannières publiées sur les profils des autres joueurs" });

// Version allégée de ta bannière pour la liste en ligne (chaque extension la télécharge).
// GitHub coupe les fichiers de gist au-delà de 1 Mo : la version publique vise 1800 px en WebP, sous 900 Ko.
async function rbxBannerCompact() {
  const blob = rbxBanner && rbxDataUrlToBlob(rbxBanner.url);
  if (!blob) throw new Error("Choisis d'abord une bannière dans Premium > Profil+");
  // GIF : envoyé tel quel pour rester animé (le serveur accepte jusqu'à 4 Mo).
  if (blob.type === "image/gif") return rbxBanner.url;
  return rbxResizeImage(blob, 1800, 0.9, 900000);
}

async function rbxBannerPublish(remove) {
  const a = await rbxCloudAdminState();
  if (!a.token || !a.id) throw new Error("Connecte d'abord GitHub dans Premium automatique");
  const me = rbxMyIdNow();
  if (!me) throw new Error("Connecte-toi à Roblox");
  const r = await rbxGh("GET", "/gists/" + a.id, undefined, a.token);
  if (!r.ok) throw new Error("GitHub ne répond pas");
  const map = rbxBannersParse(r.data);
  if (remove) delete map[me];
  else map[me] = { url: await rbxBannerCompact(), ts: Date.now(), pos: rbxSocClamp(rbxState.bannerPos, 0, 100) };
  await rbxToolsPatch({ [RBX_BANNERS_FILE]: { content: JSON.stringify({ v: 1, banners: map }) } });
}

async function rbxAnnounceShow() {
  if (!rbxReady || !rbxState.enabled) return;
  const st = await rbxStoreGet([RBX_ANNOUNCE_KEY, RBX_ANNOUNCE_SEEN]);
  const a = st[RBX_ANNOUNCE_KEY];
  if (!a || !a.id || st[RBX_ANNOUNCE_SEEN] === a.id) return;
  await rbxStoreSet({ [RBX_ANNOUNCE_SEEN]: a.id });
  rbxToast("📢 " + a.text, 12000);
}

rbxEvery(() => {
  rbxAnnounceShow().catch(() => {});
}, 5000);

// ---------- Panneau Admin ----------

function rbxToolsAdminHtml() {
  return `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Annonce à tous les utilisateurs</span>
<p class="rx-hint">Le message s'affiche une fois chez tous ceux qui ont l'extension, d'ici 1 minute (300 caractères max). Il passe par ta liste en ligne GitHub.</p>
<textarea data-admin-input="announce" maxlength="300" placeholder="Nouvelle version disponible !"></textarea>
<p class="rx-hint" data-tools-out="announce"></p>
<div class="rx-actions"><button type="button" class="rx-sec" data-act="toolsAnnounce">Publier l'annonce</button><button type="button" class="rx-sec rx-danger" data-act="toolsAnnounceClear">Retirer l'annonce</button></div></div>
<div class="rx-col"><span class="rx-label">Ma bannière visible par tous</span>
<p class="rx-hint">Publie ta bannière (Premium > Profil+) : tous ceux qui ont l'extension la verront sur ton profil, à la place du décor de Roblox, d'ici 1 minute.</p>
<div class="rx-actions"><button type="button" class="rx-sec" data-act="toolsBannerPub">Publier ma bannière</button><button type="button" class="rx-sec rx-danger" data-act="toolsBannerDel">Retirer ma bannière publique</button><button type="button" class="rx-sec" data-act="toolsBannerDiag">Diagnostic de la bannière</button></div>
<textarea readonly data-admin-out="bannerDiag" placeholder="Ouvre ton profil en vue 2D, puis clique sur Diagnostic de la bannière"></textarea></div>
<div class="rx-col"><span class="rx-label">Entretien de la liste en ligne</span>
<p class="rx-hint">Premium et abonnements secrets donnés depuis cet onglet.</p>
<div class="rx-actions"><button type="button" class="rx-sec" data-act="toolsPurge">Retirer les abonnements expirés</button><button type="button" class="rx-sec" data-act="toolsBackup">Copier une sauvegarde de la liste</button></div>
<textarea data-admin-input="restore" placeholder="Colle ici une sauvegarde pour la restaurer"></textarea>
<div class="rx-actions"><button type="button" class="rx-sec rx-danger" data-act="toolsRestore">Restaurer cette sauvegarde</button></div></div></div>`;
}

const rbxToolsAdminPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  return rbxToolsAdminPrev(store) + rbxToolsAdminHtml();
};

async function rbxToolsAnnounceOut() {
  const out = document.querySelector('#rx-panel [data-tools-out="announce"]');
  if (!out) return;
  const st = await rbxStoreGet([RBX_ANNOUNCE_KEY]);
  const a = st[RBX_ANNOUNCE_KEY];
  out.textContent = a ? `En ligne : « ${a.text} »` : "Aucune annonce en ligne.";
}

const rbxToolsRenderAdminPrev = rbxRenderAdmin;
rbxRenderAdmin = async function () {
  await rbxToolsRenderAdminPrev();
  if (rbxAdmin) rbxToolsAnnounceOut();
};

async function rbxToolsPatch(files) {
  const a = await rbxCloudAdminState();
  if (!a.token || !a.id) throw new Error("Connecte d'abord GitHub dans Premium automatique");
  const r = await rbxGh("PATCH", "/gists/" + a.id, { files }, a.token);
  if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "Token GitHub refusé" : "Écriture sur GitHub impossible");
  await rbxCloudSync(true);
}

const rbxToolsActionPrev = rbxAction;
rbxAction = async function (name) {
  if (!/^tools/.test(name)) return rbxToolsActionPrev(name);
  if (!rbxAdmin) return;
  const val = (k) => {
    const el = document.querySelector(`#rx-panel [data-admin-input="${k}"]`);
    return el ? el.value.trim() : "";
  };
  try {
    if (name === "toolsAnnounce") {
      const text = val("announce").slice(0, 300);
      if (!text) {
        rbxToast("Écris d'abord le message");
        return;
      }
      if (!confirm(`Envoyer cette annonce à tous les utilisateurs ?\n\n${text}`)) return;
      await rbxToolsPatch({ [RBX_ANNOUNCE_FILE]: { content: JSON.stringify({ id: rbxRandHex(6), text, at: Date.now() }) } });
      rbxToast("Annonce publiée : visible chez tout le monde d'ici 1 min");
    } else if (name === "toolsAnnounceClear") {
      await rbxToolsPatch({ [RBX_ANNOUNCE_FILE]: null });
      rbxToast("Annonce retirée");
    } else if (name === "toolsBannerPub") {
      await rbxBannerPublish(false);
      rbxToast("Bannière publiée : visible chez tous d'ici 1 min");
    } else if (name === "toolsBannerDiag") {
      const out = document.querySelector('#rx-panel [data-admin-out="bannerDiag"]');
      if (out) out.value = rbxBannerDiag();
      return;
    } else if (name === "toolsBannerDel") {
      await rbxBannerPublish(true);
      rbxToast("Bannière publique retirée");
    } else if (name === "toolsPurge") {
      const { a, grants } = await rbxCloudRead();
      const now = Date.now();
      const keep = grants.filter((g) => !g.exp || g.exp > now);
      if (keep.length === grants.length) {
        rbxToast("Aucun abonnement expiré");
        return;
      }
      await rbxCloudWrite(a, keep);
      rbxToast(`${grants.length - keep.length} abonnement(s) expiré(s) retiré(s)`);
      rbxCloudRender();
    } else if (name === "toolsBackup") {
      const { grants } = await rbxCloudRead();
      rbxCopyText(JSON.stringify({ v: 1, saved: new Date().toISOString(), grants }), `Sauvegarde copiée (${grants.length} entrée(s))`);
    } else if (name === "toolsRestore") {
      let d = null;
      try {
        d = JSON.parse(val("restore"));
      } catch (e) {
        d = null;
      }
      const list = d && Array.isArray(d.grants) ? d.grants.filter((g) => g && typeof g.key === "string" && Number(g.uid) > 0) : null;
      if (!list) {
        rbxToast("Sauvegarde illisible", 4000);
        return;
      }
      if (!confirm(`Remplacer la liste en ligne par cette sauvegarde (${list.length} entrée(s)) ?`)) return;
      const { a } = await rbxCloudRead();
      await rbxCloudWrite(a, list);
      rbxToast("Liste restaurée");
      rbxCloudRender();
    }
  } catch (e) {
    rbxToast(e.message || "Erreur", 5000);
  }
  rbxToolsAnnounceOut();
};

// ---------- Jeux récents (gratuit) ----------

const RBX_RECENT_KEY = "rbxCustomizerRecentGames";
let rbxRecentLast = "";

// Retient le jeu ouvert une fois son vrai titre chargé (le titre générique « Roblox » est ignoré).
async function rbxRecentTrack() {
  const page = rbxPageInfo(location.pathname);
  if (!page || page.k !== "game") return;
  const name = rbxPageTitle();
  if (!name || /^roblox$/i.test(name)) return;
  const sig = page.id + "|" + name;
  if (sig === rbxRecentLast) return;
  rbxRecentLast = sig;
  const st = await rbxStoreGet([RBX_RECENT_KEY]);
  const list = (Array.isArray(st[RBX_RECENT_KEY]) ? st[RBX_RECENT_KEY] : []).filter((g) => g.id !== page.id);
  list.unshift({ id: page.id, name: name.slice(0, 80), at: Date.now() });
  await rbxStoreSet({ [RBX_RECENT_KEY]: list.slice(0, 20) });
}

rbxEvery(() => {
  rbxRecentTrack().catch(() => {});
}, 2000);

function rbxRecentAgo(at) {
  const m = Math.round((Date.now() - at) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}

async function rbxRecentRender() {
  const box = document.querySelector("#rx-panel [data-tools-recent]");
  if (!box) return;
  const st = await rbxStoreGet([RBX_RECENT_KEY]);
  const list = Array.isArray(st[RBX_RECENT_KEY]) ? st[RBX_RECENT_KEY] : [];
  box.textContent = "";
  if (!list.length) {
    box.appendChild(sxEl("p", "rx-empty", "Aucun jeu visité pour l'instant."));
    return;
  }
  list.forEach((g) => {
    const row = sxEl("div", "rx-li");
    const a = sxEl("a", "rx-li-name", g.name);
    a.href = `https://www.roblox.com/games/${encodeURIComponent(g.id)}`;
    row.appendChild(a);
    row.appendChild(sxEl("span", "rx-li-date", rbxRecentAgo(g.at)));
    box.appendChild(row);
  });
}

const rbxRecentBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  const h = rbxRecentBodyPrev(tab);
  if (tab.id !== "tools") return h;
  return h + `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Jeux récents</span><p class="rx-hint">Les 20 derniers jeux ouverts dans ce navigateur.</p><div class="rx-list" data-tools-recent></div><div class="rx-actions"><button type="button" class="rx-sec rx-danger" data-tools-act="recentClear">Effacer la liste</button></div></div></div>`;
};

const rbxRecentShowPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxRecentShowPrev(id);
  if (id === "tools") rbxRecentRender();
  return r;
};

document.addEventListener("click", async (e) => {
  const b = e.target && e.target.closest ? e.target.closest('#rx-panel [data-tools-act="recentClear"]') : null;
  if (!b) return;
  await rbxStoreRemove(RBX_RECENT_KEY);
  rbxRecentRender();
});

// ---------- Notes perso sur les joueurs : la « Note privée » existante devient gratuite ----------

delete RBX_PREMIUM_OFF.socNotes;
rbxState = rbxEffective(rbxSaved);

// Les notes écrites avec la pastille de la 9.7 rejoignent la Note privée du profil, puis la pastille disparaît.
const RBX_NOTES_KEY = "rbxCustomizerPlayerNotes";

async function rbxNotesMigrate() {
  if (!rbxReady || rbxSaved.notesV2) return;
  const st = await rbxStoreGet([RBX_NOTES_KEY]);
  const old = st[RBX_NOTES_KEY] && typeof st[RBX_NOTES_KEY] === "object" ? st[RBX_NOTES_KEY] : {};
  const all = { ...(rbxSaved.userNotes || {}) };
  Object.keys(old).forEach((id) => {
    if (!all[id] && old[id]) all[id] = { t: String(old[id]).slice(0, 500), ts: Date.now() };
  });
  rbxSet({ notesV2: true, userNotes: all });
  await rbxStoreRemove(RBX_NOTES_KEY);
  const pill = document.getElementById("rx-note");
  if (pill) pill.remove();
}

rbxEvery(() => {
  rbxNotesMigrate().catch(() => {});
}, 3000);

// ---------- Best friends 2.0 ----------

Object.assign(RBX_DEFAULTS, { bfStars: true, bfOnline: true, uiImages: true });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);
rbxSocAddField("interface", "bestFirst", { key: "bfStars", type: "checkbox", label: "Étoile au survol des amis de l'accueil pour les mettre en best friends" });
rbxSocAddField("interface", "bfStars", { key: "bfOnline", type: "checkbox", label: "Nombre de best friends en ligne à côté du titre Friends" });
rbxSocAddField("interface", "uiButtons", { key: "uiImages", type: "checkbox", label: "Miniatures qui apparaissent en fondu, avec un effet de chargement" });
if (typeof RBX9_UI_GROUPS !== "undefined") {
  const amis = RBX9_UI_GROUPS.find((g) => g[0] === "Amis");
  if (amis) amis[1].splice(amis[1].indexOf("bestFirst") + 1, 0, "bfStars", "bfOnline");
  const anim = RBX9_UI_GROUPS.find((g) => g[0] === "Animations");
  if (anim) anim[1].push("uiImages");
}

// On retient la date d'ajout pour afficher « best friend depuis … ».
const rbxBfTogglePrev = rbxToggleBest;
rbxToggleBest = async function (id, name, dn) {
  const added = await rbxBfTogglePrev(id, name, dn);
  if (added) rbxSet({ bestFriends: rbxBestList().map((b) => (b.id === id && !b.t ? { ...b, t: Date.now() } : b)) });
  rbxBfMark(true);
  return added;
};

const RBX_BF_STAR = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M12 2.8l2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4-4.7-4.4 6.4-.8z" fill="currentColor"/></svg>';

// Tuiles de la ligne d'amis : attribut data-rx-bf sur les best friends (anneau et nom dorés) et étoile au survol.
function rbxBfMark(force) {
  if (!document.body || (!force && !rbxDomChanged("bfMark"))) return;
  const s = rbxState;
  const best = rbxBestIds();
  const seen = new Set();
  if (s.enabled) {
    document.querySelectorAll("[class*='friends-carousel' i] a[href*='/users/']").forEach((a) => {
      const m = /\/users\/(\d+)\/profile/.exec(a.getAttribute("href") || "");
      if (!m) return;
      const f = rbxFindTile(a);
      if (!f || seen.has(f.tile)) return;
      seen.add(f.tile);
      if (!f.tile.hasAttribute("data-rx-bft")) f.tile.setAttribute("data-rx-bft", "");
      const id = Number(m[1]);
      const isBest = best.has(id);
      if (isBest !== f.tile.hasAttribute("data-rx-bf")) f.tile.toggleAttribute("data-rx-bf", isBest);
      let star = f.tile.querySelector(":scope > .rx-bf-star");
      if (!s.bfStars) {
        if (star) star.remove();
        return;
      }
      if (!star) {
        star = document.createElement("button");
        star.type = "button";
        star.className = "rx-bf-star";
        star.innerHTML = RBX_BF_STAR;
        star.addEventListener("click", (e) => {
          e.preventDefault();
          e.stopPropagation();
          const name = (f.tile.querySelector("[class*='tile-name' i]") || a).textContent.trim();
          rbxToggleBest(id, name, name);
        });
        f.tile.appendChild(star);
      }
      if (star.classList.contains("rx-on") !== isBest) star.classList.toggle("rx-on", isBest);
      star.title = isBest ? "Retirer des best friends" : "Ajouter aux best friends";
    });
  }
  document.querySelectorAll("[data-rx-bf], [data-rx-bft]").forEach((t) => {
    if (!seen.has(t)) {
      t.removeAttribute("data-rx-bf");
      t.removeAttribute("data-rx-bft");
    }
  });
  document.querySelectorAll(".rx-bf-star").forEach((st) => {
    if (!seen.has(st.parentElement)) st.remove();
  });
}

rbxEvery(() => rbxBfMark(false), 1000);
rbxOnChange(() => rbxBfMark(true));

// « ★ 2 en ligne · 1 en jeu » à côté du titre de la ligne d'amis (une requête par minute, best friends seulement).
const rbxBfOn = { at: 0, busy: false, text: "", pres: new Map() };

async function rbxBfOnlineTick() {
  const s = rbxState;
  const ids = rbxBestList().map((b) => b.id).slice(0, 30);
  const head = s.enabled && s.bfOnline && ids.length ? rbxBfHeader() : null;
  let pill = document.querySelector(".rx-bf-online");
  if (!head) {
    if (pill) pill.remove();
    return;
  }
  if (!rbxBfOn.busy && Date.now() - rbxBfOn.at > 60000) {
    rbxBfOn.busy = true;
    rbxBfOn.at = Date.now();
    try {
      const pres = await rbxPresence(ids);
      rbxBfOn.pres = pres;
      let on = 0;
      let game = 0;
      pres.forEach((p) => {
        if (p.userPresenceType > 0) on++;
        if (p.userPresenceType === 2) game++;
      });
      rbxBfOn.text = on ? `★ ${on} best friend${on > 1 ? "s" : ""} en ligne${game ? ` · ${game} en jeu` : ""}` : "";
    } finally {
      rbxBfOn.busy = false;
    }
  }
  if (!rbxBfOn.text) {
    if (pill) pill.remove();
    return;
  }
  if (!pill || pill.parentElement !== head) {
    if (pill) pill.remove();
    pill = sxEl("button", "rx-bf-online", "");
    pill.type = "button";
    pill.title = "Voir tes best friends en ligne et les rejoindre";
    pill.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      rbxBfPopToggle(pill);
    });
    head.appendChild(pill);
  }
  if (pill.textContent !== rbxBfOn.text) pill.textContent = rbxBfOn.text;
}

function rbxBfHeader() {
  const car = document.querySelector("[class*='friends-carousel' i]");
  if (!car) return null;
  let el = car;
  for (let i = 0; i < 4 && el; i++, el = el.parentElement) {
    const h = el.querySelector(".container-header h2, .container-header h3, h2");
    if (h && /friends|amis/i.test(h.textContent || "")) return h;
  }
  return null;
}

rbxEvery(() => {
  rbxBfOnlineTick().catch(() => {
    rbxBfOn.busy = false;
  });
}, 2000);

// ---------- Interface : miniatures en fondu ----------

function rbxImagesCss(s) {
  if (!s.uiImages) return "";
  const sel = rbxSoc3Sel;
  let css = "";
  css += `${sel([".thumbnail-2d-container img", ".avatar-card-image img", ".game-card-thumb img"])} { animation: rxImgIn 0.35s ease-out both; }`;
  css += `${sel([".thumbnail-2d-container:empty", ".thumbnail-2d-container.shimmer"])} { background: linear-gradient(100deg, color-mix(in srgb, var(--rx-text, #fff) 6%, transparent) 30%, color-mix(in srgb, var(--rx-text, #fff) 14%, transparent) 50%, color-mix(in srgb, var(--rx-text, #fff) 6%, transparent) 70%) 0 0 / 300% 100% !important; animation: rxShimmer 1.2s linear infinite; }`;
  css += `@keyframes rxImgIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: none; } }`;
  css += `@keyframes rxShimmer { from { background-position: 100% 0; } to { background-position: -200% 0; } }`;
  return css;
}

function rbxBfCss(s) {
  let css = "";
  if (s.uiFriends) {
    css += `${rbxSoc3Sel(["[data-rx-bf] [data-rx-av]"])} { position: relative; isolation: isolate; }`;
    css += `${rbxSoc3Sel(["[data-rx-bf] [data-rx-av]::after"])} { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 50%; pointer-events: none; box-shadow: inset 0 0 0 3px #facc15, inset 0 0 12px rgba(250, 204, 21, 0.5) !important; }`;
    css += `${rbxSoc3Sel(["[data-rx-bf] [class*='tile-name' i]"])} { color: #facc15 !important; }`;
  }
  css += `${rbxSoc3Sel(["[data-rx-bft]"])} { position: relative; }`;
  css += `html:root:root .rx-bf-star { position: absolute; top: 0; left: 6px; z-index: 3; display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; border-radius: 50%; background: rgba(0, 0, 0, 0.55); color: #ffffff; cursor: pointer; opacity: 0; transform: scale(0.8); transition: opacity 0.15s ease, transform 0.15s ease, color 0.15s ease; }`;
  css += `html:root:root :hover > .rx-bf-star, html:root:root .rx-bf-star:focus-visible { opacity: 1; transform: none; }`;
  css += `html:root:root .rx-bf-star.rx-on { color: #facc15; }`;
  css += `html:root:root .rx-bf-star:hover { transform: scale(1.12); }`;
  css += `html:root:root .rx-bf-online { display: inline-flex; align-items: center; margin-left: 12px; padding: 2px 10px; border-radius: 999px; vertical-align: middle; font-size: 13px; font-weight: 700; color: #1a1200; background: linear-gradient(110deg, #facc15, #fde68a); box-shadow: 0 2px 10px rgba(250, 204, 21, 0.35); }`;
  return css;
}

const rbxBfCssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbxBfCssPrev(s);
  if (!s.enabled) return base;
  return base + rbxBfCss(s) + rbxImagesCss(s);
};
rbxOnChange(rbxSocStyleRefresh);

// ---------- Best friends : fenêtre « qui est en ligne » avec Rejoindre en un clic ----------

function rbxBfPopClose() {
  const pop = document.getElementById("rx-bf-pop");
  if (pop) pop.remove();
}

async function rbxBfPopToggle(pill) {
  if (document.getElementById("rx-bf-pop")) {
    rbxBfPopClose();
    return;
  }
  const pres = rbxBfOn.pres;
  const rank = (p) => (p.userPresenceType === 2 ? (rbxCanJoin(p) ? 0 : 1) : 2);
  const list = rbxBestList()
    .map((b) => ({ b, p: pres.get(b.id) }))
    .filter((x) => x.p && x.p.userPresenceType > 0)
    .sort((x, y) => rank(x.p) - rank(y.p));
  const pop = sxEl("div", "", "");
  pop.id = "rx-bf-pop";
  pop.addEventListener("click", (e) => e.stopPropagation());
  pop.appendChild(sxEl("strong", "rx-bf-pop-title", "★ Best friends en ligne"));
  if (!list.length) pop.appendChild(sxEl("p", "rx-bf-pop-empty", "Personne pour l'instant."));
  await rbxThumbBatch(RBX_HEAD_URL, list.map((x) => x.b.id), rbxHeadCache, 100).catch(() => {});
  list.forEach(({ b, p }) => {
    const row = sxEl("div", "rx-bf-pop-row");
    row.appendChild(sxImg(rbxHeadCache.get(b.id), "rx-bf-pop-head"));
    const txt = sxEl("div", "rx-bf-pop-txt");
    txt.appendChild(sxEl("b", "", b.d || b.n || String(b.id)));
    txt.appendChild(sxEl("span", p.userPresenceType === 2 ? "rx-bf-pop-game" : "", rbxPresenceText(p)));
    row.appendChild(txt);
    if (rbxCanJoin(p)) {
      const join = sxEl("a", "rx-bf-pop-join", "Rejoindre");
      join.href = rbxJoinUrl(p.placeId, p.gameId);
      row.appendChild(join);
    }
    const prof = sxEl("a", "rx-bf-pop-prof", "Profil");
    prof.href = `https://www.roblox.com/users/${b.id}/profile`;
    row.appendChild(prof);
    pop.appendChild(row);
  });
  document.body.appendChild(pop);
  const r = pill.getBoundingClientRect();
  pop.style.top = Math.round(r.bottom + 8) + "px";
  pop.style.left = Math.round(Math.min(r.left, window.innerWidth - pop.offsetWidth - 12)) + "px";
}

document.addEventListener("click", rbxBfPopClose);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") rbxBfPopClose();
});
window.addEventListener("scroll", rbxBfPopClose, { passive: true });

// ---------- Dépenses de Robux (gratuit) : mois et année, données de Roblox ----------

const RBX_SPEND_URL = (id, tf) => `https://economy.roblox.com/v2/users/${id}/transaction-totals?timeFrame=${tf}&transactionType=summary`;
const rbxSpend = { at: 0, data: null };

const rbxSpendHtmlPrev = rbx6ActivityHtml;
rbx6ActivityHtml = function () {
  const box = `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Mes Robux dépensés et gagnés</span><p class="rx-hint">Chiffres officiels de Roblox pour ton compte.</p><div data-spend-box><p class="rx-hint">Chargement…</p></div></div></div>`;
  return rbxSpendHtmlPrev().replace('<div class="rx-spaced" data-s6-box="robux"></div>', box + '<div class="rx-spaced" data-s6-box="robux"></div>');
};

async function rbxSpendRender() {
  const box = document.querySelector("#rx-panel [data-spend-box]");
  if (!box) return;
  const me = rbxMyIdNow();
  if (!me) {
    box.textContent = "Connecte-toi à Roblox pour voir tes dépenses.";
    return;
  }
  if (!rbxSpend.data || Date.now() - rbxSpend.at > 300000) {
    const [m, y] = await Promise.all([rbxFetchJson(RBX_SPEND_URL(me, "Month")), rbxFetchJson(RBX_SPEND_URL(me, "Year"))]);
    if (!m && !y) {
      box.textContent = "Roblox n'a pas répondu, réessaie plus tard.";
      return;
    }
    rbxSpend.data = { m, y };
    rbxSpend.at = Date.now();
  }
  const { m, y } = rbxSpend.data;
  const spent = (d) => Math.abs(Number(d && d.purchasesTotal) || 0);
  const got = (d) => Math.abs(Number(d && d.incomingRobuxTotal) || 0);
  const rate = Number(rbxState.robuxRate) || 0.0125;
  const money = (n) => `≈ ${(n * rate).toFixed(2).replace(".", ",")} ${rbxState.currency || "€"}`;
  box.textContent = "";
  const grid = sxEl("div", "rx12-stats");
  [
    [rbxNum(spent(m)), `Dépensés ce mois · ${money(spent(m))}`],
    [rbxNum(spent(y)), `Dépensés cette année · ${money(spent(y))}`],
    [rbxNum(got(m)), "Gagnés ce mois"],
    [rbxNum(got(y)), "Gagnés cette année"]
  ].forEach(([v, l]) => {
    const c = sxEl("div", "rx12-stat");
    c.appendChild(sxEl("strong", "", v));
    c.appendChild(sxEl("span", "", l));
    grid.appendChild(c);
  });
  box.appendChild(grid);
}

const rbxSpendShowPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxSpendShowPrev(id);
  if (id === "activity") rbxSpendRender().catch(() => {});
  return r;
};


function rbxBannerDiag() {
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  const stage = rbx8Stage();
  const head = mount ? rbx8Heading(mount) : null;
  const ban = document.getElementById("rx-banner");
  const desc = (el) => (el ? rbxBadgeDesc(el) : "aucun");
  return [
    `Version : ${chrome.runtime.getManifest().version}`,
    `Page : ${location.pathname} (${page ? page.k + " " + page.id : "autre"})`,
    `Mon compte : ${rbxMe ? rbxMe.id : "inconnu"} · mon profil : ${rbxMe && page && String(rbxMe.id) === page.id ? "oui" : "non"}`,
    `Bannière locale : ${rbxBanner && rbxBanner.url ? Math.round(rbxBanner.url.length / 1024) + " Ko" : "aucune"} · Afficher ma bannière : ${rbxState.socBanner ? "oui" : "non"} · Premium : ${rbxPremium.active ? "oui" : "non"}`,
    `Bannière publique pour ce profil : ${page && rbxSharedBannerFor(page.id) ? "oui" : "non"}`,
    `Nom du profil : ${desc(head)}`,
    `Scène : ${rbx8Dbg.why} · ${desc(stage)}`,
    `Images : ${rbx8Dbg.media.join(" | ") || "aucune"}`,
    `Bannière posée dans : ${ban ? desc(ban.parentElement) + " " + ban.clientWidth + "x" + ban.clientHeight : "nulle part"}`,
    `Éléments masqués : ${rbx8.cleared.size}`
  ].join("\n");
}

// ---------- Bannières publiques pour tout le monde (serveur Cloudflare, dossier worker/) ----------
// Adresse du serveur une fois en ligne, par exemple "https://rbx-banners.pseudo.workers.dev" (vide = désactivé).
const RBX_BANNER_API = "https://rbx-banners.rbx-customizer-nyrozz.workers.dev";

const RBX_BV_TOKEN_KEY = "rbxCustomizerBannerToken";
const RBX_BV_ADMIN_KEY = "rbxCustomizerBannerAdmin";
const rbxBv = { cache: new Map(), pending: new Set(), pubTimer: 0, lastPub: "" };

function rbxBvApi(method, path, body, extra) {
  return new Promise((resolve) => {
    if (!RBX_BANNER_API) return resolve({ ok: false, status: 0, data: null });
    chrome.runtime.sendMessage({ type: "bannerApi", method, url: RBX_BANNER_API + path, body, ...(extra || {}) }, (res) => {
      if (chrome.runtime.lastError || !res) resolve({ ok: false, status: 0, data: null });
      else resolve(res);
    });
  });
}

// Lecture : la bannière publiée par le joueur (serveur), sinon celle du créateur (gist). Mise en cache 10 min.
const rbxBvSharedPrev = rbxSharedBannerFor;
rbxSharedBannerFor = function (uid) {
  const k = String(uid);
  const hit = rbxBv.cache.get(k);
  const fresh = hit && Date.now() - hit.at < (hit.ban ? 600000 : 300000);
  if (!fresh && RBX_BANNER_API && !rbxBv.pending.has(k)) {
    rbxBv.pending.add(k);
    rbxBvApi("GET", "/banner/" + k).then((r) => {
      rbxBv.pending.delete(k);
      const d = r.ok && r.data;
      const ok = d && typeof d.url === "string" && d.url.indexOf("data:image/") === 0;
      rbxBv.cache.set(k, { at: Date.now(), ban: ok ? { url: d.url, pos: rbxSocClamp(d.pos, 0, 100), ts: Number(d.ts) || 1 } : null });
    });
  }
  return (hit && hit.ban) || rbxBvSharedPrev(uid);
};

async function rbxBvToken() {
  const st = await rbxStoreGet([RBX_BV_TOKEN_KEY]);
  const t = st[RBX_BV_TOKEN_KEY];
  const me = rbxMyIdNow();
  return t && t.token && me && Number(t.uid) === me ? t : null;
}

// Publication automatique : à chaque nouvelle bannière ou changement de position, si le compte est vérifié.
async function rbxBvPublish() {
  const t = await rbxBvToken();
  if (!t) return;
  const s = rbxState;
  const want = s.enabled && s.socBanner && rbxBanner && rbxBanner.url;
  const sig = want ? `${rbxBanner.ts}|${s.bannerPos}` : "off";
  if (sig === rbxBv.lastPub) return;
  if (!want) {
    const r = await rbxBvApi("DELETE", "/banner/" + t.uid, undefined, { token: t.token });
    if (r.ok) rbxBv.lastPub = sig;
    return;
  }
  const url = await rbxBannerCompact();
  const r = await rbxBvApi("PUT", "/banner/" + t.uid, { url, pos: rbxSocClamp(s.bannerPos, 0, 100) }, { token: t.token });
  if (r.ok) {
    rbxBv.lastPub = sig;
    rbxBv.cache.delete(String(t.uid));
  } else if (r.status === 401) {
    await rbxStoreRemove(RBX_BV_TOKEN_KEY);
    rbxToast("Bannière publique : vérifie à nouveau ton compte", 5000);
  } else if (r.status === 422) {
    // Refusée par la vérification IA du serveur : on ne réessaie pas la même image.
    rbxBv.lastPub = sig;
    rbxToast((r.data && r.data.error) || "Bannière refusée par la vérification automatique", 7000);
  } else if (r.data && r.data.error) {
    rbxToast("Bannière publique : " + r.data.error, 6000);
  }
}

function rbxBvSchedule() {
  clearTimeout(rbxBv.pubTimer);
  rbxBv.pubTimer = setTimeout(() => {
    rbxBvPublish().catch(() => {});
  }, 3000);
}

rbxOnChange(rbxBvSchedule);
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && (changes[RBX_BANNER_KEY] || changes[RBX_BV_TOKEN_KEY])) rbxBvSchedule();
});

// ---------- Interface : « Rendre ma bannière publique » (Premium > Profil+) ----------

const rbxBvTabPrev = rbxTabSocial;
rbxTabSocial = function () {
  return rbxBvTabPrev() + `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Ma bannière visible par les autres</span><div data-bv-box></div></div></div>`;
};

async function rbxBvRender(box, code) {
  box.dataset.bvDone = "1";
  box.textContent = "";
  const hint = (t) => box.appendChild(sxEl("p", "rx-hint", t));
  const btn = (label, act, cls) => {
    const b = sxBtn(label, cls || "rx-sec");
    b.dataset.bv = act;
    return b;
  };
  if (!RBX_BANNER_API) {
    hint("Bientôt disponible : le créateur doit encore mettre le serveur des bannières en ligne.");
    return;
  }
  const t = await rbxBvToken();
  if (t) {
    hint("✓ Compte vérifié. Ta bannière est publiée automatiquement : les autres utilisateurs de l'extension la voient sur ton profil.");
    const row = sxEl("div", "rx-actions");
    row.appendChild(btn("Ne plus la publier", "stop", "rx-sec rx-danger"));
    box.appendChild(row);
    return;
  }
  if (code) {
    hint(`1. Copie ce code et colle-le n'importe où dans ta description Roblox (Profil > Modifier) : ${code}`);
    hint("2. Enregistre ta description, puis clique sur « J'ai collé le code ». Tu pourras l'enlever juste après.");
    const row = sxEl("div", "rx-actions");
    const copy = btn("Copier le code", "copy");
    copy.dataset.code = code;
    row.appendChild(copy);
    row.appendChild(btn("J'ai collé le code", "check"));
    box.appendChild(row);
    return;
  }
  hint("Pour que les autres voient ta bannière, prouve une seule fois que ce compte Roblox est à toi.");
  const row = sxEl("div", "rx-actions");
  row.appendChild(btn("Rendre ma bannière publique", "start"));
  box.appendChild(row);
}

rbxEvery(() => {
  const box = document.querySelector("#rx-panel [data-bv-box]");
  if (box && !box.dataset.bvDone) rbxBvRender(box).catch(() => {});
}, 1000);

document.addEventListener("click", async (e) => {
  const b = e.target && e.target.closest ? e.target.closest("#rx-panel [data-bv]") : null;
  if (!b) return;
  const box = b.closest("[data-bv-box]");
  const me = rbxMyIdNow();
  if (!me) {
    rbxToast("Connecte-toi à Roblox");
    return;
  }
  const act = b.dataset.bv;
  if (act === "start") {
    const r = await rbxBvApi("POST", "/verify/start", { uid: me });
    if (!r.ok || !r.data || !r.data.code) return rbxToast("Serveur des bannières injoignable, réessaie", 4000);
    rbxBvRender(box, r.data.code);
  } else if (act === "copy") {
    rbxCopyText(b.dataset.code, "Code copié : colle-le dans ta description Roblox");
  } else if (act === "check") {
    const r = await rbxBvApi("POST", "/verify/check", { uid: me });
    if (!r.ok || !r.data || !r.data.token) return rbxToast((r.data && r.data.error) || "Vérification impossible, réessaie", 6000);
    await rbxStoreSet({ [RBX_BV_TOKEN_KEY]: { uid: me, token: r.data.token } });
    rbxBv.lastPub = "";
    rbxToast("Compte vérifié : ta bannière est publiée. Tu peux retirer le code de ta description.", 6000);
    rbxBvRender(box);
  } else if (act === "stop") {
    const t = await rbxBvToken();
    if (t) await rbxBvApi("DELETE", "/banner/" + t.uid, undefined, { token: t.token });
    await rbxStoreRemove(RBX_BV_TOKEN_KEY);
    rbxBv.lastPub = "off";
    rbxToast("Ta bannière n'est plus publique");
    rbxBvRender(box);
  }
});

// ---------- Admin : modération des bannières publiques ----------

const rbxBvAdminPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  return (
    rbxBvAdminPrev(store) +
    `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Modération des bannières publiques</span>
<p class="rx-hint">Retire la bannière d'un joueur si elle est inappropriée. La clé de modération est celle choisie à la mise en ligne du serveur ; elle reste dans ce navigateur.</p>
<div class="rx-inline"><input type="password" placeholder="Clé de modération" data-admin-input="bvKey"><button type="button" class="rx-sec" data-act="toolsBvKey">Enregistrer la clé</button></div>
<div class="rx-inline"><input type="text" placeholder="ID du joueur" data-admin-input="bvUid"><button type="button" class="rx-sec rx-danger" data-act="toolsBvRemove">Retirer sa bannière</button><button type="button" class="rx-sec" data-act="toolsBvCount">Compter les bannières</button></div></div></div>`
  );
};

const rbxBvActionPrev = rbxAction;
rbxAction = async function (name) {
  if (!/^toolsBv/.test(name)) return rbxBvActionPrev(name);
  if (!rbxAdmin) return;
  const inp = (k) => document.querySelector(`#rx-panel [data-admin-input="${k}"]`);
  if (name === "toolsBvKey") {
    const v = (inp("bvKey") && inp("bvKey").value.trim()) || "";
    if (v.length < 16) return rbxToast("La clé fait au moins 16 caractères");
    await rbxStoreSet({ [RBX_BV_ADMIN_KEY]: v });
    inp("bvKey").value = "";
    return rbxToast("Clé de modération enregistrée");
  }
  const admin = (await rbxStoreGet([RBX_BV_ADMIN_KEY]))[RBX_BV_ADMIN_KEY];
  if (!admin) return rbxToast("Enregistre d'abord la clé de modération");
  if (name === "toolsBvRemove") {
    const uid = ((inp("bvUid") && inp("bvUid").value) || "").trim();
    if (!/^\d+$/.test(uid)) return rbxToast("ID de joueur invalide");
    if (!confirm(`Retirer la bannière publique du joueur ${uid} ?`)) return;
    const r = await rbxBvApi("DELETE", "/banner/" + uid, undefined, { admin });
    rbxToast(r.ok ? "Bannière retirée" : "Échec : vérifie la clé de modération", 4000);
    rbxBv.cache.delete(uid);
  } else if (name === "toolsBvCount") {
    const r = await rbxBvApi("GET", "/admin/list", undefined, { admin });
    rbxToast(r.ok && Array.isArray(r.data) ? `${r.data.length} bannière(s) publique(s)` : "Échec : vérifie la clé de modération", 4000);
  }
};

// ---------- Menu de gauche : cacher ou ajouter des boutons, retirer la séparation (gratuit) ----------

Object.assign(RBX_DEFAULTS, { navHidden: [], navLinks: [], navSeam: true });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);
rbxSocAddField("interface", "uiSidebar", { key: "navSeam", type: "checkbox", label: "Retirer la ligne de séparation entre le menu de gauche et la page" });
if (typeof RBX9_UI_GROUPS !== "undefined") {
  const g = RBX9_UI_GROUPS.find((x) => x[0] === "Menu et en-tête");
  if (g && !g[1].includes("navSeam")) g[1].splice(g[1].indexOf("uiSidebar") + 1, 0, "navSeam");
}

// Clé d'un bouton : son adresse sans les nombres (le lien Profil contient ton ID).
function rbxNavKey(a) {
  try {
    return new URL(a.href, location.href).pathname.replace(/\d+/g, "*").replace(/\/+$/, "").toLowerCase() || "/";
  } catch (e) {
    return "";
  }
}

function rbxNavItems() {
  const side = rbxFindSidebar();
  if (!side) return [];
  const out = [];
  const seen = new Set();
  side.querySelectorAll("a[href]").forEach((a) => {
    if (a.closest("[data-rx-navlink], #rx-panel")) return;
    const label = (a.textContent || "").replace(/\s+/g, " ").trim();
    const key = rbxNavKey(a);
    if (!label || label.length > 40 || !key || seen.has(key)) return;
    seen.add(key);
    const li = a.closest("li");
    out.push({ a, key, label, el: li && side.contains(li) ? li : a });
  });
  return out;
}

function rbxNavApply(force) {
  if (!document.body || (!force && !rbxDomChanged("navEdit"))) return;
  const s = rbxState;
  const items = s.enabled ? rbxNavItems() : [];
  const hidden = new Set(s.enabled && Array.isArray(s.navHidden) ? s.navHidden : []);
  const keep = new Set();
  items.forEach((it) => {
    const hide = hidden.has(it.key);
    if (hide) keep.add(it.el);
    if (hide !== it.el.hasAttribute("data-rx-navhide")) it.el.toggleAttribute("data-rx-navhide", hide);
  });
  document.querySelectorAll("[data-rx-navhide]").forEach((el) => {
    if (!keep.has(el)) el.removeAttribute("data-rx-navhide");
  });
  rbxNavLinks(items);
  rbxNavSeam();
}

// Boutons ajoutés : copie d'un vrai bouton du menu (même style), avec ton nom, ton lien et ton émoji.
function rbxNavLinks(items) {
  const s = rbxState;
  const links = s.enabled && Array.isArray(s.navLinks) ? s.navLinks.filter((l) => l && l.n && l.u) : [];
  const sig = JSON.stringify(links);
  const old = document.querySelectorAll("[data-rx-navlink]");
  const template = items.find((it) => !it.el.hasAttribute("data-rx-navhide")) || items[0];
  if (old.length === links.length && old.length && old[0].dataset.rxNavsig === sig && old[0].isConnected) return;
  old.forEach((n) => n.remove());
  if (!links.length || !template) return;
  const last = items[items.length - 1].el;
  let after = last;
  links.forEach((l) => {
    const node = template.el.cloneNode(true);
    node.removeAttribute("data-rx-navhide");
    node.setAttribute("data-rx-navlink", "");
    node.dataset.rxNavsig = sig;
    node.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    const a = node.tagName === "A" ? node : node.querySelector("a");
    if (!a) return;
    a.href = l.u;
    if (!/^https:\/\/([a-z0-9-]+\.)*roblox\.com\//i.test(l.u)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    a.classList.remove("active");
    node.classList.remove("active");
    const icon = a.querySelector("svg, img, [class*='icon' i]");
    const ico = sxEl("span", "rx-navlink-ico", l.i || "★");
    if (icon) icon.replaceWith(ico);
    else a.insertBefore(ico, a.firstChild);
    const leaves = Array.from(a.querySelectorAll("*")).filter((n) => !n.children.length && (n.textContent || "").trim() && !n.classList.contains("rx-navlink-ico"));
    const label = leaves[leaves.length - 1];
    if (label) label.textContent = l.n;
    else a.appendChild(document.createTextNode(l.n));
    after.insertAdjacentElement("afterend", node);
    after = node;
  });
}

// Ligne verticale entre le menu et la page : bordure du menu ou fin élément posé sur son bord droit.
function rbxNavSeam() {
  const on = rbxState.enabled && rbxState.navSeam;
  const fixed = document.querySelectorAll("[data-rx-seamfix]");
  if (!on) {
    fixed.forEach((el) => {
      el.style.removeProperty("border-right-width");
      el.style.removeProperty("border-left-width");
      el.style.removeProperty("box-shadow");
      el.style.removeProperty("visibility");
      el.removeAttribute("data-rx-seamfix");
    });
    return;
  }
  const side = rbxFindSidebar();
  if (!side) return;
  const mark = (el, prop, val) => {
    if (el.style.getPropertyValue(prop) === val) return;
    el.style.setProperty(prop, val, "important");
    el.setAttribute("data-rx-seamfix", "");
  };
  let el = side;
  for (let i = 0; i < 4 && el && el !== document.body; i++, el = el.parentElement) {
    const cs = getComputedStyle(el);
    if (parseFloat(cs.borderRightWidth) > 0) mark(el, "border-right-width", "0px");
    if (cs.boxShadow && cs.boxShadow !== "none") mark(el, "box-shadow", "none");
  }
  const r = side.getBoundingClientRect();
  const ys = [0.3, 0.6, 0.85].map((k) => Math.round(window.innerHeight * k));
  [r.right - 1, r.right, r.right + 1].forEach((x) => {
    ys.forEach((y) => {
      document.elementsFromPoint(x, y).forEach((e) => {
        if (e === document.body || e === document.documentElement || e.closest("#rx-panel, #rx-overlay")) return;
        const er = e.getBoundingClientRect();
        if (er.width <= 3 && er.height >= window.innerHeight * 0.3) mark(e, "visibility", "hidden");
        else if (Math.abs(er.left - r.right) <= 2 && parseFloat(getComputedStyle(e).borderLeftWidth) > 0) mark(e, "border-left-width", "0px");
      });
    });
  });
}

rbxEvery(() => rbxNavApply(false), 1000);
rbxOnChange(() => rbxNavApply(true));

// ---------- Panneau : éditeur du menu de gauche (onglet Interface) ----------

const rbxNavBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  const h = rbxNavBodyPrev(tab);
  if (tab.id !== "interface") return h;
  return (
    h +
    `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Boutons du menu de gauche</span><p class="rx-hint">Décoche un bouton pour le cacher. Ajoute tes propres boutons en bas.</p><div class="rx-list" data-nav-list></div></div>
<div class="rx-col"><span class="rx-label">Ajouter un bouton</span><div class="rx-inline"><input type="text" maxlength="2" placeholder="🎮" data-nav-in="i" style="max-width:56px"><input type="text" maxlength="24" placeholder="Nom" data-nav-in="n"><input type="text" placeholder="https://www.roblox.com/..." data-nav-in="u"><button type="button" class="rx-sec" data-nav-act="add">Ajouter</button></div><div class="rx-list" data-nav-added></div></div></div>`
  );
};

function rbxNavEditorRender() {
  const list = document.querySelector("#rx-panel [data-nav-list]");
  const added = document.querySelector("#rx-panel [data-nav-added]");
  if (!list || !added) return;
  const s = rbxState;
  const hidden = new Set(Array.isArray(s.navHidden) ? s.navHidden : []);
  const items = rbxNavItems();
  list.textContent = "";
  if (!items.length) list.appendChild(sxEl("p", "rx-empty", "Ouvre une page Roblox où le menu de gauche est visible."));
  items.forEach((it) => {
    const row = sxEl("label", "rx-row");
    row.appendChild(sxEl("span", "rx-label", it.label));
    const sw = sxEl("span", "rx-switch");
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = !hidden.has(it.key);
    cb.dataset.navKey = it.key;
    sw.appendChild(cb);
    sw.appendChild(document.createElement("i"));
    row.appendChild(sw);
    list.appendChild(row);
  });
  added.textContent = "";
  (Array.isArray(s.navLinks) ? s.navLinks : []).forEach((l, i) => {
    const row = sxEl("div", "rx-li");
    row.appendChild(sxEl("span", "rx-li-name", `${l.i || "★"} ${l.n}`));
    row.appendChild(sxEl("span", "rx-li-date", l.u.replace(/^https:\/\//, "")));
    const del = sxBtn("Retirer", "rx-sec rx-danger");
    del.dataset.navAct = "del";
    del.dataset.navIdx = String(i);
    row.appendChild(del);
    added.appendChild(row);
  });
}

const rbxNavShowPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxNavShowPrev(id);
  if (id === "interface") rbxNavEditorRender();
  return r;
};

document.addEventListener("change", (e) => {
  const cb = e.target && e.target.matches && e.target.matches("#rx-panel [data-nav-key]") ? e.target : null;
  if (!cb) return;
  const set = new Set(Array.isArray(rbxState.navHidden) ? rbxState.navHidden : []);
  if (cb.checked) set.delete(cb.dataset.navKey);
  else set.add(cb.dataset.navKey);
  rbxSet({ navHidden: Array.from(set).slice(0, 60) });
});

document.addEventListener("click", (e) => {
  const b = e.target && e.target.closest ? e.target.closest("#rx-panel [data-nav-act]") : null;
  if (!b) return;
  const links = Array.isArray(rbxState.navLinks) ? rbxState.navLinks.slice() : [];
  if (b.dataset.navAct === "del") {
    links.splice(Number(b.dataset.navIdx), 1);
  } else {
    const val = (k) => {
      const el = document.querySelector(`#rx-panel [data-nav-in="${k}"]`);
      return el ? el.value.trim() : "";
    };
    const n = val("n").slice(0, 24);
    let u = val("u");
    if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
    let ok = false;
    try {
      ok = !!n && new URL(u).protocol === "https:";
    } catch (err) {
      ok = false;
    }
    if (!ok) return rbxToast("Donne un nom et un lien qui commence par https://");
    if (links.length >= 12) return rbxToast("12 boutons maximum");
    links.push({ n, u, i: Array.from(val("i")).slice(0, 2).join("") });
    document.querySelectorAll('#rx-panel [data-nav-in]').forEach((el) => {
      el.value = "";
    });
  }
  rbxSet({ navLinks: links });
  rbxNavEditorRender();
});
