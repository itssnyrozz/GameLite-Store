// Onglet Développeurs (tout en bas du menu) : outils pour les créateurs Roblox.
// Identifiants et infos de la page ouverte, liens Studio et Creator Hub, calcul des gains.

RBX_TABS.push({ id: "dev", label: "Développeurs", fields: [] });
RBX6_ICONS.dev = '<path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>';
RBX9_DESC.dev = "Pour les créateurs Roblox : identifiants de la page, liens Studio et Creator Hub, infos détaillées et calcul des gains.";

// Part du vendeur après la commission Roblox, et taux du Developer Exchange (dollars par Robux).
const RBXDEV_SHARE = 0.7;
const RBXDEV_DEVEX = 0.0038;
const RBXDEV_LINKS = [
  ["Creator Hub", "https://create.roblox.com/dashboard/creations"],
  ["Documentation", "https://create.roblox.com/docs"],
  ["Creator Store", "https://create.roblox.com/store"],
  ["Open Cloud (API)", "https://create.roblox.com/docs/cloud"],
  ["DevForum", "https://devforum.roblox.com"],
  ["État des serveurs Roblox", "https://status.roblox.com"]
];
const rbxDev = { for: "", seq: 0 };

function rbxDevHtml() {
  const links = RBXDEV_LINKS.map(([t, u]) => `<a class="rx-sec" href="${u}" target="_blank" rel="noopener">${t}</a>`).join("");
  return `<div class="rx9-heading">Cette page</div><div data-dev-page></div>
<div class="rxl-block"><div class="rx9-heading">Calcul des gains</div><div class="rx-group"><div class="rx-col"><span class="rx-label">Prix de vente (Robux)</span><div class="rx-inline"><input type="number" min="0" step="1" placeholder="100" data-dev-in="price"></div><p class="rx-hint" data-dev-out="price">Roblox garde 30 % de chaque vente. Le DevEx convertit tes Robux gagnés en dollars (${RBXDEV_DEVEX} $ par Robux).</p></div></div></div>
<div class="rxl-block"><div class="rx9-heading">Liens utiles</div><div class="rx-actions rxdev-links">${links}</div></div>`;
}

const rbxDevBodyPrev = rbxSectionBody;
rbxSectionBody = function (tab) {
  return tab.id === "dev" ? rbxDevHtml() : rbxDevBodyPrev(tab);
};

function rbxDevRow(label, value, copy) {
  const row = sxEl("div", "rx-li");
  row.appendChild(sxEl("span", "rx-li-name", label));
  row.appendChild(sxEl("span", "rx-tag", value === undefined || value === null || value === "" ? "—" : String(value)));
  if (copy) {
    const b = sxBtn("Copier", "rx-sec");
    b.addEventListener("click", () => rbxCopy(String(copy), b));
    row.appendChild(b);
  }
  return row;
}

function rbxDevLinks(list) {
  const box = sxEl("div", "rx-actions rxdev-links");
  list.forEach(([t, u]) => {
    const a = sxEl("a", "rx-sec", t);
    a.href = u;
    if (!/^roblox-studio:/.test(u)) {
      a.target = "_blank";
      a.rel = "noopener";
    }
    box.appendChild(a);
  });
  return box;
}

// Jeu : identifiants (place, univers), statistiques publiques et accès directs à Studio et au tableau de bord.
async function rbxDevGame(id, out) {
  const u = await rbxFetchJson(`https://apis.roblox.com/universes/v1/places/${id}/universe`);
  const uid = u && u.universeId;
  const g = uid ? await rbxFetchJson(`https://games.roblox.com/v1/games?universeIds=${uid}`) : null;
  const d = g && g.data && g.data[0];
  const rows = [rbxDevRow("Place ID", id, id), rbxDevRow("Universe ID", uid, uid)];
  if (d) {
    rows.push(
      rbxDevRow("Nom", d.name),
      rbxDevRow("Créateur", d.creator ? `${d.creator.name} (${d.creator.type === "Group" ? "groupe" : "joueur"} ${d.creator.id})` : ""),
      rbxDevRow("Joueurs en ce moment", rbxNum(d.playing)),
      rbxDevRow("Visites", rbxNum(d.visits)),
      rbxDevRow("Favoris", rbxNum(d.favoritedCount)),
      rbxDevRow("Joueurs max par serveur", d.maxPlayers),
      rbxDevRow("Créé le", rbxDate(d.created)),
      rbxDevRow("Mis à jour le", rbxDate(d.updated))
    );
  }
  out.push(...rows);
  const links = [["Ouvrir dans Studio", `roblox-studio:1+task:EditPlace+placeId:${id}${uid ? "+universeId:" + uid : ""}`]];
  if (uid) {
    const dash = `https://create.roblox.com/dashboard/creations/experiences/${uid}`;
    links.push(["Tableau de bord", dash + "/overview"], ["Analytique", dash + "/analytics/overview"], ["Produits développeur", dash + "/monetization/developer-products"]);
  }
  out.push(rbxDevLinks(links));
}

async function rbxDevItem(id, out) {
  const d = await rbxFetchJson(`https://economy.roblox.com/v2/assets/${id}/details`);
  out.push(rbxDevRow("Asset ID", id, id), rbxDevRow("Pour un script", `rbxassetid://${id}`, `rbxassetid://${id}`));
  if (d) {
    out.push(
      rbxDevRow("Nom", d.Name),
      rbxDevRow("Type (AssetTypeId)", d.AssetTypeId),
      rbxDevRow("Créateur", d.Creator ? `${d.Creator.Name} (${d.Creator.CreatorType === "Group" ? "groupe" : "joueur"} ${d.Creator.CreatorTargetId})` : ""),
      rbxDevRow("Prix", d.IsForSale ? (d.PriceInRobux ? `${rbxNum(d.PriceInRobux)} Robux` : "Gratuit") : "Hors vente"),
      rbxDevRow("Ventes", rbxNum(d.Sales)),
      rbxDevRow("Créé le", rbxDate(d.Created)),
      rbxDevRow("Mis à jour le", rbxDate(d.Updated))
    );
  }
  out.push(rbxDevLinks([["Voir dans le Creator Store", `https://create.roblox.com/store/asset/${id}`]]));
}

async function rbxDevUser(id, out) {
  const d = await rbxFetchJson(`https://users.roblox.com/v1/users/${id}`);
  out.push(rbxDevRow("User ID", id, id));
  if (d) out.push(rbxDevRow("Pseudo", d.name, d.name), rbxDevRow("Nom affiché", d.displayName), rbxDevRow("Compte créé le", rbxDate(d.created)));
  out.push(rbxDevLinks([["Ses créations", `https://www.roblox.com/users/${id}/creations`]]));
}

async function rbxDevGroup(id, out) {
  const d = await rbxFetchJson(`https://groups.roblox.com/v1/groups/${id}`);
  out.push(rbxDevRow("Group ID", id, id));
  if (d) out.push(rbxDevRow("Nom", d.name), rbxDevRow("Membres", rbxNum(d.memberCount)), rbxDevRow("Propriétaire", d.owner ? `${d.owner.username} (${d.owner.userId})` : ""));
  out.push(rbxDevLinks([["Tableau de bord du groupe", `https://create.roblox.com/dashboard/creations?groupId=${id}`]]));
}

// Infos de la page ouverte : rechargées quand l'onglet s'ouvre sur une autre page.
async function rbxDevRender(force) {
  const box = document.querySelector("#rx-panel [data-dev-page]");
  if (!box) return;
  const page = rbxPageInfo(location.pathname);
  const key = page ? page.k + page.id : "";
  if (!force && key === rbxDev.for) return;
  rbxDev.for = key;
  const seq = ++rbxDev.seq;
  if (!page) {
    box.replaceChildren(sxEl("p", "rx-empty", "Ouvre la page d'un jeu, d'un objet, d'un profil ou d'un groupe : ses identifiants et ses infos s'affichent ici."));
    return;
  }
  box.replaceChildren(sxEl("p", "rx-empty", "Chargement…"));
  const out = [];
  const fn = { game: rbxDevGame, item: rbxDevItem, user: rbxDevUser, group: rbxDevGroup }[page.k];
  await fn(page.id, out);
  if (seq !== rbxDev.seq) return;
  const list = sxEl("div", "rx-list");
  out.forEach((el) => list.appendChild(el));
  box.replaceChildren(list);
}

function rbxDevPrice(v) {
  const out = document.querySelector('#rx-panel [data-dev-out="price"]');
  if (!out) return;
  const p = Math.max(0, Math.floor(Number(v) || 0));
  if (!p) return;
  const net = Math.floor(p * RBXDEV_SHARE);
  out.textContent = `Tu reçois ${rbxNum(net)} Robux par vente (70 %). En DevEx : environ ${(net * RBXDEV_DEVEX).toLocaleString("fr-FR", { style: "currency", currency: "USD" })} par vente, ${(net * 1000 * RBXDEV_DEVEX).toLocaleString("fr-FR", { style: "currency", currency: "USD" })} pour 1 000 ventes.`;
}

document.addEventListener("input", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches('#rx-panel [data-dev-in="price"]')) rbxDevPrice(t.value);
});

const rbxDevShowTabPrev = rbxShowTab;
rbxShowTab = function (id) {
  const r = rbxDevShowTabPrev(id);
  if (id === "dev") rbxDevRender(false).catch(() => {});
  return r;
};
