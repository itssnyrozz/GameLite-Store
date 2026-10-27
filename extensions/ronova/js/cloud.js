// Liste Premium en ligne (GitHub Gist) : chaque entrée est une clé de licence signée avec la clé admin,
// donc personne ne peut s'ajouter lui-même. Une seule fois : coller ici l'ID du gist créé depuis l'onglet Admin.
const RBX_PREMIUM_GIST = "c146f73930c1d2990ac98462f6f1040d";

const RBX_CLOUD_KEY = "rbxCustomizerCloud";
const RBX_GH_TOKEN_KEY = "rbxCustomizerGhToken";
const RBX_GIST_LOCAL_KEY = "rbxCustomizerGistId";
const RBX_CLOUD_FILE = "rbx-premium.json";
// Une vérification par minute : les réponses « rien n'a changé » (304) ne comptent pas dans la limite de GitHub.
const RBX_CLOUD_EVERY = 60000;

const rbxCloud = { busy: false, admin: null, lookup: null };

function rbxGh(method, path, body, token, etag) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type: "ghApi", method, path, body, token, etag }, (res) => {
      if (chrome.runtime.lastError || !res) resolve({ ok: false, status: 0, data: null });
      else resolve(res);
    });
  });
}

async function rbxCloudGistId() {
  if (RBX_PREMIUM_GIST) return RBX_PREMIUM_GIST;
  const st = await rbxStoreGet([RBX_GIST_LOCAL_KEY]);
  return rbxAdmin && typeof st[RBX_GIST_LOCAL_KEY] === "string" ? st[RBX_GIST_LOCAL_KEY] : "";
}

function rbxCloudParse(gist) {
  const f = gist && gist.files ? gist.files[RBX_CLOUD_FILE] : null;
  if (!f || typeof f.content !== "string") return null;
  try {
    const d = JSON.parse(f.content);
    return Array.isArray(d.grants) ? d.grants.filter((g) => g && typeof g.key === "string" && Number(g.uid) > 0) : [];
  } catch (e) {
    return null;
  }
}

function rbxMyIdNow() {
  const m = document.querySelector('meta[name="user-data"]');
  const id = m ? Number(m.getAttribute("data-userid")) : 0;
  return id || (rbxMe ? Number(rbxMe.id) : 0);
}

async function rbxCloudGrant() {
  const me = rbxMyIdNow();
  if (!me) return null;
  const st = await rbxStoreGet([RBX_CLOUD_KEY]);
  const c = st[RBX_CLOUD_KEY];
  const grants = c && Array.isArray(c.grants) ? c.grants.filter((g) => Number(g.uid) === me) : [];
  for (const g of grants) {
    const r = await rbxVerifyLicense(g.key, false);
    if (r.ok && !r.info.t && Number(r.info.uid) === me) return r.info;
  }
  return null;
}

async function rbxCloudSync(force) {
  const id = await rbxCloudGistId();
  if (!id || rbxCloud.busy) return;
  const st = await rbxStoreGet([RBX_CLOUD_KEY]);
  const prev = st[RBX_CLOUD_KEY];
  if (!force && prev && prev.id === id && Date.now() - prev.at < RBX_CLOUD_EVERY) return;
  rbxCloud.busy = true;
  try {
    const same = prev && prev.id === id && Array.isArray(prev.grants);
    const r = await rbxGh("GET", "/gists/" + id, undefined, undefined, same ? prev.etag : "");
    if (r.status === 304 && same) {
      await rbxStoreSet({ [RBX_CLOUD_KEY]: { ...prev, at: Date.now() } });
      return;
    }
    const grants = r.ok ? rbxCloudParse(r.data) : null;
    if (!grants) return;
    // Le même gist peut porter une annonce du créateur (fichier rbx-announce.json), lue par js/tools.js.
    if (typeof rbxAnnounceStore === "function") await rbxAnnounceStore(r.data);
    const sig = grants.map((g) => g.key).join("|");
    const old = same ? prev.grants.map((g) => g.key).join("|") : null;
    await rbxStoreSet({ [RBX_CLOUD_KEY]: { id, at: Date.now(), grants, etag: r.etag || "" } });
    if (sig !== old) await rbxRefreshPremium();
  } finally {
    rbxCloud.busy = false;
  }
}

const rbxCloudComputePrev = rbxComputePremium;
rbxComputePremium = async function () {
  const r = await rbxCloudComputePrev();
  if (r.premium.active || r.premium.preview) return r;
  const info = await rbxCloudGrant();
  if (info) return { admin: r.admin, premium: { active: true, source: "cloud", info } };
  return r;
};

const rbxCloudLicensePrev = rbxRenderLicense;
rbxRenderLicense = function () {
  const p = rbxPremium;
  const box = document.querySelector("#rx-panel [data-lic]");
  if (!box || !p.active || p.source !== "cloud") return rbxCloudLicensePrev();
  box.textContent = "";
  box.appendChild(sxEl("strong", "", "Premium actif"));
  const i = p.info || {};
  box.appendChild(sxEl("p", "rx-hint", `Offert par le créateur de l'extension · ${i.exp ? "jusqu'au " + new Date(i.exp).toLocaleDateString("fr-FR") : "à vie"}`));
};

// ---------- Côté admin ----------

async function rbxCloudAdminState() {
  const st = await rbxStoreGet([RBX_GH_TOKEN_KEY, RBX_GIST_LOCAL_KEY]);
  return { token: st[RBX_GH_TOKEN_KEY] || "", id: RBX_PREMIUM_GIST || st[RBX_GIST_LOCAL_KEY] || "", inCode: !!RBX_PREMIUM_GIST };
}

async function rbxCloudRead() {
  const a = await rbxCloudAdminState();
  if (!a.token || !a.id) throw new Error("Connecte d'abord GitHub : Admin, Licences, Premium automatique");
  const r = await rbxGh("GET", "/gists/" + a.id, undefined, a.token);
  const grants = r.ok ? rbxCloudParse(r.data) : null;
  if (!grants) throw new Error(r.status === 401 ? "Token GitHub refusé" : r.status === 404 ? "Liste introuvable sur GitHub" : "GitHub ne répond pas");
  return { a, grants };
}

async function rbxCloudWrite(a, grants) {
  const content = JSON.stringify({ v: 1, updated: new Date().toISOString(), grants }, null, 1);
  const r = await rbxGh("PATCH", "/gists/" + a.id, { files: { [RBX_CLOUD_FILE]: { content } } }, a.token);
  if (!r.ok) throw new Error(r.status === 401 || r.status === 403 ? "Token GitHub refusé (il faut la permission gist)" : "Écriture sur GitHub impossible");
  await rbxStoreSet({ [RBX_CLOUD_KEY]: { id: a.id, at: Date.now(), grants, etag: "" } });
  await rbxRefreshPremium();
  return grants;
}

async function rbxCloudAdd(key, payload) {
  const { a, grants } = await rbxCloudRead();
  const t = payload.t || "";
  const next = grants.filter((g) => Number(g.uid) !== Number(payload.uid) || (g.t || "") !== t);
  next.unshift({ key, uid: payload.uid, name: payload.name, exp: payload.exp || 0, iat: payload.iat || Date.now(), t });
  return rbxCloudWrite(a, next);
}

async function rbxCloudRemove(uid, tier) {
  const { a, grants } = await rbxCloudRead();
  return rbxCloudWrite(a, grants.filter((g) => Number(g.uid) !== Number(uid) || (g.t || "") !== (tier || "")));
}

async function rbxCloudGive(uid, name, days, tier) {
  const r = await rbxCloudIssuePrev({ uid, name, days, tier });
  await rbxCloudAdd(r.key, r.payload);
  return r;
}

const rbxCloudIssuePrev = rbxIssueKey;
rbxIssueKey = async function (opts) {
  const r = await rbxCloudIssuePrev(opts);
  const cb = document.querySelector('#rx-panel [data-admin-input="cloud"]');
  if (!cb || !cb.checked) return r;
  if (!r.payload.uid) {
    rbxToast("Clé créée. Pour l'envoi automatique, lie la clé à un compte Roblox.", 4500);
    return r;
  }
  try {
    await rbxCloudAdd(r.key, r.payload);
    rbxToast(`Premium envoyé à ${r.payload.name} : actif chez lui en quelques secondes, sans clé`, 5000);
    rbxCloudRender();
  } catch (e) {
    rbxToast("Clé créée, mais envoi automatique impossible : " + e.message, 6000);
  }
  return r;
};

function rbxCloudFmtExp(exp) {
  if (!exp) return "À vie";
  if (Date.now() > exp) return "Expiré";
  return "Jusqu'au " + new Date(exp).toLocaleDateString("fr-FR");
}

function rbxCloudStatsHtml() {
  return `<div class="rx12-stats" data-cloud-stats></div>`;
}

async function rbxCloudStats() {
  const box = document.querySelector("#rx-panel [data-cloud-stats]");
  if (!box) return;
  const st = await rbxStoreGet([RBX_ISSUED_KEY, RBX_CLOUD_KEY]);
  const issued = Array.isArray(st[RBX_ISSUED_KEY]) ? st[RBX_ISSUED_KEY] : [];
  const now = Date.now();
  const active = issued.filter((e) => !e.exp || e.exp > now).length;
  const live = st[RBX_CLOUD_KEY] && Array.isArray(st[RBX_CLOUD_KEY].grants) ? st[RBX_CLOUD_KEY].grants.filter((g) => !g.exp || g.exp > now) : [];
  const cloud = live.filter((g) => !g.t).length;
  const secret = live.filter((g) => g.t === "cert" || g.t === "secret").length;
  box.textContent = "";
  [
    [String(issued.length), "Clés créées"],
    [String(active), "Clés valides"],
    [String(issued.length - active), "Clés expirées"],
    [String(cloud), "Premium automatique"],
    [String(secret), "Badges certifiés"]
  ].forEach(([v, l]) => {
    const c = sxEl("div", "rx12-stat");
    c.appendChild(sxEl("strong", "", v));
    c.appendChild(sxEl("span", "", l));
    box.appendChild(c);
  });
}

function rbxCloudSectionHtml() {
  return `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Premium automatique (sans clé)</span><div data-cloud-box><p class="rx-hint">Chargement…</p></div></div></div>`;
}

function rbxCloudToolsHtml() {
  return `<div class="rx-group rx-spaced"><div class="rx-col"><span class="rx-label">Chercher un joueur</span>
<div class="rx-inline"><input type="text" placeholder="Pseudo ou ID" data-admin-input="lookup"><button type="button" class="rx-sec" data-act="cloudLookup">Chercher</button></div>
<div data-cloud-lookup></div></div>
<div class="rx-col"><span class="rx-label">Maintenance</span><div class="rx-actions">
<button type="button" class="rx-sec" data-act="cloudReload">Recharger l'extension</button>
<button type="button" class="rx-sec" data-act="cloudClearCache">Vider le cache des données Roblox</button>
<button type="button" class="rx-sec" data-act="cloudExportIssued">Copier la liste des clés créées</button>
<button type="button" class="rx-sec" data-act="badgeDiag">Diagnostic du badge</button>
</div><textarea readonly data-admin-out="badgeDiag" placeholder="Ouvre ton profil Roblox, puis clique sur Diagnostic du badge"></textarea></div></div>`;
}

async function rbxCloudRender() {
  const box = document.querySelector("#rx-panel [data-cloud-box]");
  rbxCloudStats();
  if (!box) return;
  const a = await rbxCloudAdminState();
  box.textContent = "";
  const hint = (t) => box.appendChild(sxEl("p", "rx-hint", t));

  if (!a.token) {
    hint("Donne le Premium à quelqu'un sans qu'il ait à entrer de clé. Il faut un compte GitHub (gratuit) :");
    const ol = document.createElement("ol");
    ol.className = "rx12-steps";
    const li1 = document.createElement("li");
    li1.appendChild(document.createTextNode("Ouvre "));
    const link = sxEl("a", "", "cette page GitHub");
    link.href = "https://github.com/settings/tokens/new?scopes=gist&description=Roblox%20Customizer";
    link.target = "_blank";
    link.rel = "noopener";
    li1.appendChild(link);
    li1.appendChild(document.createTextNode(", choisis une durée (« No expiration » si tu veux), puis « Generate token »."));
    ol.appendChild(li1);
    ol.appendChild(sxEl("li", "", "Copie le token (il commence par ghp_) et colle-le ci-dessous."));
    box.appendChild(ol);
    const row = sxEl("div", "rx-inline");
    const inp = document.createElement("input");
    inp.type = "password";
    inp.placeholder = "ghp_…";
    inp.dataset.adminInput = "ghtoken";
    row.appendChild(inp);
    const b = sxBtn("Connecter GitHub", "rx-sec");
    b.dataset.act = "cloudConnect";
    row.appendChild(b);
    box.appendChild(row);
    hint("Le token reste uniquement dans ce navigateur. Il ne sert qu'à modifier ta liste Premium.");
    return;
  }

  if (!a.id) {
    hint("GitHub est connecté. Crée maintenant ta liste Premium (un « gist » secret sur ton compte).");
    const b = sxBtn("Créer la liste Premium", "rx-sec");
    b.dataset.act = "cloudCreate";
    box.appendChild(b);
    return;
  }

  if (!a.inCode) {
    const warn = sxEl("div", "rx12-warn");
    warn.appendChild(sxEl("strong", "", "Dernière étape, une seule fois"));
    warn.appendChild(sxEl("p", "", "Remplace la ligne const RBX_PREMIUM_GIST = \"\"; en haut de js/cloud.js par celle-ci, puis publie la nouvelle version. Ensuite, plus jamais besoin de toucher au code pour donner le Premium."));
    const ta = document.createElement("textarea");
    ta.readOnly = true;
    ta.value = `const RBX_PREMIUM_GIST = "${a.id}";`;
    warn.appendChild(ta);
    const b = sxBtn("Copier la ligne", "rx-sec");
    b.dataset.act = "cloudCopyLine";
    warn.appendChild(b);
    box.appendChild(warn);
  }

  const list = sxEl("div", "rx-list");
  list.textContent = "Lecture de la liste…";
  box.appendChild(list);
  const actions = sxEl("div", "rx-actions");
  [["cloudRefresh", "Actualiser"], ["cloudDisconnect", "Déconnecter GitHub"]].forEach(([act, label]) => {
    const b = sxBtn(label, act === "cloudDisconnect" ? "rx-sec rx-danger" : "rx-sec");
    b.dataset.act = act;
    actions.appendChild(b);
  });
  box.appendChild(actions);

  let grants;
  try {
    grants = (await rbxCloudRead()).grants;
  } catch (e) {
    list.textContent = e.message;
    return;
  }
  rbxCloud.admin = grants;
  list.textContent = "";
  if (!grants.length) {
    list.appendChild(sxEl("p", "rx-empty", "Personne n'a encore le Premium automatique. Utilise « Donner le Premium » plus bas."));
    return;
  }
  grants.forEach((g) => {
    const row = sxEl("div", "rx-li");
    const expired = g.exp && Date.now() > g.exp;
    row.appendChild(sxEl("span", expired ? "rx-tag rx12-off" : "rx-tag", expired ? "Expiré" : "Actif"));
    if (g.t === "cert" || g.t === "secret") row.appendChild(sxEl("span", "rx-tag rx-cert-tag", "Certif"));
    const nm = sxEl("a", "rx-li-name", `${g.name || "Joueur"} (${g.uid})`);
    nm.href = `https://www.roblox.com/users/${g.uid}/profile`;
    row.appendChild(nm);
    row.appendChild(sxEl("span", "rx-li-date", rbxCloudFmtExp(g.exp)));
    const ext = sxBtn("+30 jours", "rx-sec");
    ext.dataset.cloudExtend = `${g.uid}|${g.t || ""}`;
    const del = sxBtn("Retirer", "rx-sec rx-danger");
    del.dataset.cloudRemove = `${g.uid}|${g.t || ""}`;
    row.appendChild(ext);
    row.appendChild(del);
    list.appendChild(row);
  });
}

async function rbxCloudLookup() {
  const out = document.querySelector("#rx-panel [data-cloud-lookup]");
  const inp = document.querySelector('#rx-panel [data-admin-input="lookup"]');
  const v = (inp ? inp.value : "").trim().replace(/^@/, "");
  if (!out || !v) return;
  out.textContent = "Recherche…";
  let id = /^\d+$/.test(v) ? Number(v) : 0;
  if (!id) {
    const u = await rbxResolveUser(v);
    id = u ? u.id : 0;
  }
  const info = id ? await rbxUserInfo(String(id)) : null;
  if (!info || !info.user) {
    out.textContent = "Joueur introuvable.";
    return;
  }
  const u = info.user;
  await rbxThumbBatch(RBX_HEAD_URL, [u.id], rbxHeadCache, 100);
  const st = await rbxStoreGet([RBX_ISSUED_KEY, RBX_CLOUD_KEY]);
  const issued = (Array.isArray(st[RBX_ISSUED_KEY]) ? st[RBX_ISSUED_KEY] : []).filter((e) => Number(e.uid) === u.id);
  const all = (rbxCloud.admin || (st[RBX_CLOUD_KEY] && st[RBX_CLOUD_KEY].grants) || []).filter((g) => Number(g.uid) === u.id);
  const cloud = all.find((g) => !g.t);
  const secret = all.find((g) => g.t === "cert" || g.t === "secret");
  out.textContent = "";
  const card = sxEl("div", "rx12-player");
  card.appendChild(sxImg(rbxHeadCache.get(u.id), ""));
  const txt = sxEl("div", "rx12-player-txt");
  txt.appendChild(sxEl("strong", "", `${u.displayName} (@${u.name})`));
  txt.appendChild(sxEl("span", "", `ID ${u.id} · compte créé le ${rbxDate(u.created)} · ${rbxNum(info.friends)} amis`));
  let prem = "Pas de Premium";
  if (cloud) prem = "Premium automatique · " + rbxCloudFmtExp(cloud.exp);
  else if (issued.length) prem = `${issued.length} clé(s) créée(s) · ${rbxCloudFmtExp(issued[0].exp)}`;
  txt.appendChild(sxEl("span", cloud ? "rx12-ok" : "", prem));
  txt.appendChild(sxEl("span", secret ? "rx12-ok" : "", secret ? "Badge certifié · " + rbxCloudFmtExp(secret.exp) : "Pas de badge certifié"));
  card.appendChild(txt);
  const acts = sxEl("div", "rx-actions");
  const prof = sxEl("a", "rx-sec", "Profil");
  prof.href = `https://www.roblox.com/users/${u.id}/profile`;
  acts.appendChild(prof);
  [["30", "Donner 30 jours"], ["365", "Donner 1 an"], ["0", "Donner à vie"]].forEach(([d, l]) => {
    const b = sxBtn(l, "rx-sec");
    b.dataset.cloudGive = `${u.id}|${d}|${u.name}`;
    acts.appendChild(b);
  });
  if (cloud) {
    const b = sxBtn("Retirer le Premium", "rx-sec rx-danger");
    b.dataset.cloudRemove = `${u.id}|`;
    acts.appendChild(b);
  }
  card.appendChild(acts);
  const sec = sxEl("div", "rx-actions");
  [["30", "Certif 30 jours"], ["365", "Certif 1 an"], ["0", "Certif à vie"]].forEach(([d, l]) => {
    const b = sxBtn(l, "rx-sec rx-cert-btn");
    b.dataset.cloudGive = `${u.id}|${d}|${u.name}|cert`;
    sec.appendChild(b);
  });
  if (secret) {
    const b = sxBtn("Retirer le badge certifié", "rx-sec rx-danger");
    b.dataset.cloudRemove = `${u.id}|${secret.t}`;
    sec.appendChild(b);
  }
  card.appendChild(sec);
  out.appendChild(card);
}

const rbxCloudAdminHtmlPrev = rbxAdminMainHtml;
rbxAdminMainHtml = function (store) {
  let h = rbxCloudAdminHtmlPrev(store);
  const bind = "<span>Lier la clé à ce compte Roblox</span></label>";
  h = h.replace(bind, bind + '<label class="rx-inline"><span class="rx-switch"><input type="checkbox" data-admin-input="cloud" checked><i></i></span><span>Donner automatiquement, sans que la personne entre la clé</span></label>');
  return rbxCloudStatsHtml() + rbxCloudSectionHtml() + h + rbxCloudToolsHtml();
};

const rbxCloudRenderAdminPrev = rbxRenderAdmin;
rbxRenderAdmin = async function () {
  await rbxCloudRenderAdminPrev();
  if (rbxAdmin) rbxCloudRender();
};

const rbxCloudActionPrev = rbxAction;
rbxAction = async function (name) {
  if (!/^cloud/.test(name)) return rbxCloudActionPrev(name);
  if (!rbxAdmin) return;
  try {
    if (name === "cloudConnect") {
      const inp = document.querySelector('#rx-panel [data-admin-input="ghtoken"]');
      const tok = (inp ? inp.value : "").replace(/\s+/g, "").replace(/^["'`]+|["'`]+$/g, "");
      if (tok.length < 20) {
        rbxToast("Colle le token GitHub en entier", 4000);
        return;
      }
      const who = await rbxGh("GET", "/user", undefined, tok);
      if (!who.ok || !who.data || !who.data.login) {
        rbxToast(who.status === 401 ? "GitHub refuse ce token : vérifie que tu l'as copié en entier" : "GitHub ne répond pas, réessaie", 5000);
        return;
      }
      await rbxStoreSet({ [RBX_GH_TOKEN_KEY]: tok });
      rbxToast(`GitHub connecté : ${who.data.login}`);
    } else if (name === "cloudCreate") {
      const a = await rbxCloudAdminState();
      const r = await rbxGh("POST", "/gists", { description: "Roblox Customizer - liste Premium", public: false, files: { [RBX_CLOUD_FILE]: { content: JSON.stringify({ v: 1, grants: [] }) } } }, a.token);
      if (!r.ok || !r.data || !r.data.id) throw new Error(r.status === 401 || r.status === 403 ? "Token GitHub refusé (coche bien la case gist)" : "Création impossible sur GitHub");
      await rbxStoreSet({ [RBX_GIST_LOCAL_KEY]: r.data.id });
      rbxToast("Liste Premium créée");
    } else if (name === "cloudCopyLine") {
      const a = await rbxCloudAdminState();
      rbxCopyText(`const RBX_PREMIUM_GIST = "${a.id}";`, "Ligne copiée : colle-la en haut de js/cloud.js");
      return;
    } else if (name === "cloudDisconnect") {
      if (!confirm("Déconnecter GitHub de ce navigateur ? La liste Premium reste en ligne et continue de marcher.")) return;
      await rbxStoreRemove(RBX_GH_TOKEN_KEY);
    } else if (name === "cloudRefresh") {
      await rbxCloudSync(true);
    } else if (name === "cloudLookup") {
      await rbxCloudLookup();
      return;
    } else if (name === "cloudReload") {
      chrome.runtime.sendMessage({ type: "reloadExtension" }, () => void chrome.runtime.lastError);
      rbxToast("Extension rechargée, actualisation de la page…");
      setTimeout(() => location.reload(), 800);
      return;
    } else if (name === "cloudClearCache") {
      [rbxCache, rbxHeadCache, rbxIconCache, rbxRapCache, rbxHandleCache].forEach((m) => m.clear());
      rbxFriendsList = [];
      rbxToast("Cache vidé");
      return;
    } else if (name === "cloudExportIssued") {
      const st = await rbxStoreGet([RBX_ISSUED_KEY]);
      rbxCopyText(JSON.stringify(st[RBX_ISSUED_KEY] || [], null, 2), "Liste des clés copiée");
      return;
    }
  } catch (e) {
    rbxToast(e.message || "Erreur", 5000);
  }
  rbxCloudRender();
};

document.addEventListener("click", async (e) => {
  const t = e.target;
  if (!t || !t.closest || !rbxAdmin) return;
  const give = t.closest("#rx-panel [data-cloud-give]");
  const rem = t.closest("#rx-panel [data-cloud-remove]");
  const ext = t.closest("#rx-panel [data-cloud-extend]");
  if (!give && !rem && !ext) return;
  try {
    if (give) {
      const [uid, days, name, tier] = give.dataset.cloudGive.split("|");
      await rbxCloudGive(Number(uid), name, Number(days), tier || "");
      rbxToast(`${tier ? "Badge certifié" : "Premium"} donné à ${name} : actif chez lui en quelques secondes`, 4500);
      rbxCloudLookup();
    } else if (rem) {
      const [uid, tier] = rem.dataset.cloudRemove.split("|");
      const what = tier ? "le badge certifié" : "le Premium automatique";
      if (!confirm(`Retirer ${what} à ce joueur ? Il le perd en quelques secondes.`)) return;
      await rbxCloudRemove(Number(uid), tier || "");
      rbxToast(tier ? "Badge certifié retiré" : "Premium retiré");
      if (document.querySelector("#rx-panel [data-cloud-lookup] .rx12-player")) rbxCloudLookup();
    } else {
      const [uidStr, tier] = ext.dataset.cloudExtend.split("|");
      const uid = Number(uidStr);
      const g = (rbxCloud.admin || []).find((x) => Number(x.uid) === uid && (x.t || "") === (tier || ""));
      const base = g && g.exp ? Math.max(Date.now(), g.exp) : Date.now();
      if (g && !g.exp) {
        rbxToast("Déjà à vie");
        return;
      }
      const days = Math.ceil((base + 30 * 86400000 - Date.now()) / 86400000);
      await rbxCloudGive(uid, g ? g.name : "", days, tier || "");
      rbxToast(`${tier ? "Badge certifié" : "Premium"} prolongé de 30 jours`);
    }
  } catch (err) {
    rbxToast(err.message || "Erreur", 5000);
  }
  rbxCloudRender();
});

function rbxCloudTick() {
  rbxCloudSync(false).catch(() => {});
  const p = rbxPremium;
  if (p.active && p.source === "cloud" && p.info && p.info.exp && Date.now() > p.info.exp) rbxRefreshPremium();
}

rbxEvery(rbxCloudTick, 15000);

// Retour sur l'onglet ou ouverture du panneau : on vérifie tout de suite (au plus toutes les 15 s).
let rbxCloudQuickAt = 0;
function rbxCloudQuick() {
  if (Date.now() - rbxCloudQuickAt < 15000) return;
  rbxCloudQuickAt = Date.now();
  rbxCloudSync(true).catch(() => {});
}
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) rbxCloudQuick();
});
window.addEventListener("focus", rbxCloudQuick);
const rbxCloudOpenPrev = rbxOpenPanel;
rbxOpenPanel = function (tab) {
  rbxCloudQuick();
  return rbxCloudOpenPrev(tab);
};
