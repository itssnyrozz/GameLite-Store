// Ajouts 9.x : masquage des jeux sponsorisés, refus automatique des demandes d'amis, liste des nouveautés.
// Les finitions de texte de la 9.1 sont rangées dans Interface > Typographie et Titres de cartes (js/social6.js).

Object.assign(RBX_DEFAULTS, { hideSponsored: false });
Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

RBX5_NEWS.length = 0;
RBX5_NEWS.push(
  "Bannières GIF animées (4 Mo maximum), aussi visibles par les autres une fois publiées",
  "Menu de gauche : cache les boutons que tu n'utilises pas et ajoute les tiens (Interface > Boutons du menu de gauche)",
  "La ligne de séparation entre le menu de gauche et la page est retirée",
  "Curseurs de souris gratuits pour tout le monde, avec 13 modèles (Interface > Général)",
  "Pseudo stylé animé (6 styles) dans Premium > Profil+, même sans badge certifié",
  "Les bannières publiques sont vérifiées automatiquement par une IA avant d'être visibles",
  "Bannières publiques pour tous : vérifie ton compte une fois (Premium > Profil+) et ta bannière est publiée automatiquement pour les autres utilisateurs",
  "Images plus nettes : bannière enregistrée en haute définition (WebP 2560 px), dessinée avec un lissage de qualité, avatars des listes en 150 px",
  "Bannière de profil : en vue 2D, elle remplace maintenant le décor de Roblox derrière ton avatar",
  "Bannières publiques : celle du créateur s'affiche sur son profil chez tous les utilisateurs de l'extension (désactivable dans Profil)",
  "Best friends : clique sur « ★ X best friends en ligne » pour voir qui joue à quoi et les rejoindre en un clic",
  "Activité > Robux : tes Robux dépensés et gagnés ce mois et cette année, avec l'équivalent en euros",
  "Best friends : étoile au survol des amis de l'accueil pour les ajouter en un clic, anneau et nom dorés",
  "Best friends : « ★ 2 best friends en ligne · 1 en jeu » à côté du titre Friends, et « best friend depuis … » sur leur profil",
  "Miniatures qui apparaissent en fondu, avec un effet de chargement à la place des carrés gris",
  "La Note privée sur les profils devient gratuite pour tout le monde",
  "Jeux récents : retrouve les 20 derniers jeux visités dans l'onglet Outils",
  "Encore plus fluide : l'extension attend que le navigateur soit libre et se met en pause pendant que tu fais défiler",
  "Options en double fusionnées : Finitions est rangé dans Typographie et Titres de cartes",
  "Alertes quand un ami se connecte ou lance un jeu (onglet Amis)",
  "Refus automatique des demandes d'amis (Amis > Demandes reçues, désactivé par défaut)",
  "Masquer les jeux sponsorisés (onglet Masquer)"
);

// Panneau ouvert : la page Roblox derrière ne défile plus (sinon la molette « traverse » le panneau).
function rbxScrollLock(on) {
  document.documentElement.classList.toggle("rx-lock", !!on);
}

const rbxLockOpenPrev = rbxOpenPanel;
rbxOpenPanel = function (tab) {
  const r = rbxLockOpenPrev(tab);
  const ov = document.getElementById("rx-overlay");
  rbxScrollLock(ov && ov.classList.contains("rx-open"));
  return r;
};

const rbxLockClosePrev = rbxClosePanel;
rbxClosePanel = function () {
  rbxScrollLock(false);
  return rbxLockClosePrev();
};

// Filet de sécurité si le panneau se ferme par un autre chemin.
rbxEvery(() => {
  if (!document.documentElement.classList.contains("rx-lock")) return;
  const ov = document.getElementById("rx-overlay");
  if (!ov || !ov.classList.contains("rx-open")) rbxScrollLock(false);
}, 1000);

// Jeux sponsorisés : la carte porte un petit libellé « Sponsored » ; on masque la carte entière.
(function rbxPolishHideTab() {
  const t = RBX_TABS.find((x) => x.id === "hide");
  if (t && t.fields && !t.fields.some((f) => f.key === "hideSponsored")) t.fields.push({ key: "hideSponsored", type: "checkbox", label: "Masquer les jeux sponsorisés (publicités)" });
})();

const RBX_SPONSOR_RE = /^(sponsored|sponsorisé|sponsorisée|publicité|ad)$/i;
// Du plus large au plus étroit : la tuile entière d'abord, pas seulement sa ligne d'infos.
const RBX_SPONSOR_CARD = ["li.list-item", "li[class*='game' i]", ".game-card-container", "[class*='game-tile' i]"];

function rbxPolishSponsored() {
  const on = rbxState.enabled && rbxState.hideSponsored;
  if (!on) {
    document.querySelectorAll("[data-rx-sponsor]").forEach((n) => {
      n.removeAttribute("data-rx-sponsor");
      n.style.removeProperty("display");
    });
    return;
  }
  if (!rbxDomChanged("sponsor")) return;
  document.querySelectorAll("#content span, #content div, main span, main div").forEach((el) => {
    if (el.children.length || (el.textContent || "").length > 14) return;
    if (!RBX_SPONSOR_RE.test((el.textContent || "").trim())) return;
    let card = null;
    for (const sel of RBX_SPONSOR_CARD) {
      card = el.closest(sel);
      if (card) break;
    }
    if (!card || card.hasAttribute("data-rx-sponsor")) return;
    card.setAttribute("data-rx-sponsor", "");
    card.style.setProperty("display", "none", "important");
  });
}

rbxEvery(rbxPolishSponsored, 1500);
rbxOnChange(() => rbxPolishSponsored());

// ---------- Refus automatique des demandes d'amis (désactivé par défaut) ----------

Object.assign(RBX_DEFAULTS, { autoDeclineReqs: false });
if (rbxSaved.autoDeclineReqs === undefined) rbxSaved.autoDeclineReqs = false;

const RBX_AUTODECLINE_LOCK = "rbxCustomizerAutoDecline";
const rbxAutoDecline = { busy: false, wait: 0, was: false };

const rbxAutoDeclineTabPrev = rbxTabFriends;
rbxTabFriends = function () {
  const h = rbxAutoDeclineTabPrev();
  const field = rbxFieldHtml({ key: "autoDeclineReqs", type: "checkbox", label: "Refuser automatiquement toutes les demandes d'amis reçues" });
  const pane = '<div class="sx-sub" data-soc-pane="incoming">';
  return h.replace(pane, `${pane}<div class="rx-group">${field}</div><p class="rx-hint">Quand c'est activé, chaque nouvelle demande est refusée en moins d'une minute, tant qu'un onglet Roblox est ouvert. Refuser est définitif.</p>`);
};

// Activation : on demande confirmation, car les refus ne se rattrapent pas.
rbxOnChange((s) => {
  const on = !!(s.enabled && s.autoDeclineReqs);
  if (on && !rbxAutoDecline.was && rbxReady && document.getElementById("rx-overlay")) {
    if (!confirm("Refuser automatiquement toutes les demandes d'amis, y compris celles déjà en attente ? Un refus est définitif.")) {
      rbxAutoDecline.was = false;
      rbxSet({ autoDeclineReqs: false });
      if (typeof rbxSyncInputs === "function") rbxSyncInputs();
      return;
    }
  }
  rbxAutoDecline.was = on;
});

async function rbxAutoDeclineTick() {
  const s = rbxState;
  if (!rbxReady || !s.enabled || !s.autoDeclineReqs || rbxAutoDecline.busy || Date.now() < rbxAutoDecline.wait) return;
  // Un seul onglet travaille à la fois : les autres voient le passage récent et attendent.
  const st = await rbxStoreGet([RBX_AUTODECLINE_LOCK]);
  if (Date.now() - (Number(st[RBX_AUTODECLINE_LOCK]) || 0) < 50000) return;
  await rbxStoreSet({ [RBX_AUTODECLINE_LOCK]: Date.now() });
  rbxAutoDecline.busy = true;
  let done = 0;
  try {
    const c = await rbxFetchJson("https://friends.roblox.com/v1/user/friend-requests/count");
    if (!c || !c.count) return;
    const r = await rbxFetchJson("https://friends.roblox.com/v1/my/friends/requests?limit=100&sortOrder=Desc");
    const ids = r && Array.isArray(r.data) ? r.data.map((it) => it.id || (it.friendRequest && it.friendRequest.senderId)).filter(Boolean) : [];
    for (const id of ids) {
      if (!rbxState.autoDeclineReqs) break;
      const res = await rbxPostJson(`https://friends.roblox.com/v1/users/${id}/decline-friend-request`, undefined);
      if (res.status === 429 || (!res.ok && res.status !== 400)) {
        // Roblox freine : on réessaie dans 5 minutes au lieu d'insister.
        rbxAutoDecline.wait = Date.now() + 300000;
        break;
      }
      if (res.ok) done++;
      await rbxSleep(1000);
    }
  } finally {
    rbxAutoDecline.busy = false;
  }
  if (done) rbxToast(`${done} demande(s) d'amis refusée(s) automatiquement`, 4500);
}

rbxEvery(() => {
  rbxAutoDeclineTick().catch(() => {
    rbxAutoDecline.busy = false;
  });
}, 60000);
