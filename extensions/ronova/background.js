const RBX_POST_ALLOW = [
  /^https:\/\/presence\.roblox\.com\/v1\/presence\/users$/,
  /^https:\/\/users\.roblox\.com\/v1\/users$/,
  /^https:\/\/friends\.roblox\.com\/v1\/users\/\d+\/(unfriend|accept-friend-request|decline-friend-request)$/,
  /^https:\/\/avatar\.roblox\.com\/v1\/outfits\/\d+\/wear$/,
  /^https:\/\/avatar\.roblox\.com\/v1\/avatar\/render$/
];

// Aperçu du bac à sable d'avatar : corps reconstruit, seulement des nombres et des couleurs.
function rbxRenderBody(b) {
  const d = (b && b.avatarDefinition) || {};
  const colors = {};
  Object.entries(d.bodyColors || {}).slice(0, 6).forEach(([k, v]) => {
    if (/^[a-z]+Color$/.test(k) && /^#[0-9a-f]{6}$/i.test(v)) colors[k] = v;
  });
  const scales = {};
  Object.entries(d.scales || {}).slice(0, 8).forEach(([k, v]) => {
    if (/^[a-z]+$/i.test(k) && Number.isFinite(Number(v))) scales[k] = Number(v);
  });
  return {
    thumbnailConfig: { thumbnailId: 1, thumbnailType: "2d", size: "420x420" },
    avatarDefinition: {
      assets: (Array.isArray(d.assets) ? d.assets : []).slice(0, 60).map((a) => ({ id: Number(a && a.id) || 0 })).filter((a) => a.id > 0),
      bodyColors: colors,
      scales,
      playerAvatarType: { playerAvatarType: d.playerAvatarType && d.playerAvatarType.playerAvatarType === "R6" ? "R6" : "R15" }
    }
  };
}

let rbxCsrf = "";

async function rbxPost(url, body) {
  const send = () =>
    fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json;charset=UTF-8", "x-csrf-token": rbxCsrf },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  let r = await send();
  if (r.status === 403) {
    const t = r.headers.get("x-csrf-token");
    if (t) {
      rbxCsrf = t;
      r = await send();
    }
  }
  let data = null;
  try {
    data = await r.json();
  } catch (e) {
    data = null;
  }
  return { ok: r.ok, status: r.status, data };
}

function rbxB64(buf) {
  const bytes = new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function rbxFontLoad(name) {
  name = name.replace(/["';{}<>\\]/g, "").trim().slice(0, 60);
  if (!name) return { ok: false, faces: [] };
  const fam = encodeURIComponent(name).replace(/%20/g, "+");
  let r = await fetch(`https://fonts.googleapis.com/css2?family=${fam}:wght@400;700&display=swap`);
  // Polices sans graisse 700 : on retente avec la graisse par défaut.
  if (!r.ok) r = await fetch(`https://fonts.googleapis.com/css2?family=${fam}&display=swap`);
  if (!r.ok) return { ok: false, faces: [] };
  const css = await r.text();
  const blocks = css.indexOf("/*") === -1 ? ["*/" + css] : css.split("/*").slice(1);
  const faces = [];
  for (const b of blocks) {
    const subset = b.slice(0, b.indexOf("*/")).trim();
    if (subset !== "latin" && subset !== "latin-ext" && blocks.length > 1) continue;
    const src = /src:\s*url\(([^)]+)\)/.exec(b);
    if (!src) continue;
    const f = await fetch(src[1]);
    if (!f.ok) continue;
    faces.push({
      b64: rbxB64(await f.arrayBuffer()),
      weight: (/font-weight:\s*(\d+)/.exec(b) || [0, "400"])[1],
      style: (/font-style:\s*(\w+)/.exec(b) || [0, "normal"])[1],
      range: (/unicode-range:\s*([^;]+);/.exec(b) || [0, ""])[1]
    });
  }
  return { ok: faces.length > 0, faces };
}

// Synchro GitHub entre développeurs (synchro/synchro.ps1) : le script écrit sync-stamp.json à chaque changement
// du code ; l'extension se recharge alors toute seule, puis recharge les onglets Roblox.
async function rbxDevStamp() {
  try {
    const r = await fetch(chrome.runtime.getURL("sync-stamp.json"), { cache: "no-store" });
    return r.ok ? await r.json() : null;
  } catch (e) {
    return null;
  }
}

async function rbxDevSync() {
  const st = await rbxDevStamp();
  if (!st || !st.head) return st;
  const { rbxDevHead } = await chrome.storage.session.get("rbxDevHead");
  if (!rbxDevHead) await chrome.storage.session.set({ rbxDevHead: st.head });
  else if (rbxDevHead !== st.head) {
    await chrome.storage.local.set({ rbxDevReloadTabs: true });
    setTimeout(() => chrome.runtime.reload(), 100);
  }
  return st;
}

chrome.runtime.onInstalled.addListener(async () => {
  const st = await rbxDevStamp();
  if (st && st.head) chrome.storage.session.set({ rbxDevHead: st.head });
  const { rbxDevReloadTabs } = await chrome.storage.local.get("rbxDevReloadTabs");
  if (!rbxDevReloadTabs) return;
  chrome.storage.local.remove("rbxDevReloadTabs");
  for (const t of await chrome.tabs.query({ url: "https://*.roblox.com/*" })) chrome.tabs.reload(t.id);
});

chrome.action.onClicked.addListener((tab) => {
  const url = tab && tab.url ? tab.url : "";
  if (tab && tab.id && /^https:\/\/([a-z0-9-]+\.)*roblox\.com\//.test(url)) {
    chrome.tabs.sendMessage(tab.id, { type: "openPanel" }, () => {
      void chrome.runtime.lastError;
    });
  } else {
    chrome.tabs.create({ url: "https://www.roblox.com/home" });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg) return false;

  if (msg.type === "postJson") {
    const url = String(msg.url || "");
    if (!RBX_POST_ALLOW.some((re) => re.test(url))) {
      sendResponse({ ok: false, status: 0, data: null });
      return false;
    }
    let body = msg.body;
    const ids = body && Array.isArray(body.userIds) ? body.userIds.map(Number).filter((n) => n > 0).slice(0, 100) : [];
    if (url.indexOf("presence.roblox.com") !== -1) {
      body = { userIds: ids };
    } else if (url === "https://users.roblox.com/v1/users") {
      body = { userIds: ids, excludeBannedUsers: false };
    } else if (url === "https://avatar.roblox.com/v1/avatar/render") {
      body = rbxRenderBody(body);
    } else {
      body = undefined;
    }
    rbxPost(url, body)
      .then(sendResponse)
      .catch(() => sendResponse({ ok: false, status: 0, data: null }));
    return true;
  }

  if (msg.type === "resolveUser") {
    const name = String(msg.username || "").trim().slice(0, 40);
    if (!name) {
      sendResponse({ ok: false });
      return false;
    }
    fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [name], excludeBannedUsers: false })
    })
      .then((r) => r.json())
      .then((data) => sendResponse({ ok: true, data }))
      .catch(() => sendResponse({ ok: false }));
    return true;
  }

  if (msg.type === "ghApi") {
    const path = String(msg.path || "");
    const method = ["GET", "POST", "PATCH"].includes(msg.method) ? msg.method : "GET";
    const okPath = /^\/gists(\/[0-9a-f]{20,40})?$/.test(path) || (path === "/user" && method === "GET");
    if (!okPath || (method === "GET" && path === "/gists")) {
      sendResponse({ ok: false, status: 0, data: null });
      return false;
    }
    const headers = { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    if (msg.token) headers.Authorization = "Bearer " + String(msg.token).trim();
    if (msg.body !== undefined) headers["Content-Type"] = "application/json";
    if (msg.etag && method === "GET") headers["If-None-Match"] = String(msg.etag);
    fetch("https://api.github.com" + path, {
      method,
      headers,
      cache: "no-store",
      body: msg.body === undefined ? undefined : JSON.stringify(msg.body)
    })
      .then(async (r) => {
        let data = null;
        try {
          data = await r.json();
        } catch (e) {
          data = null;
        }
        sendResponse({ ok: r.ok, status: r.status, data, etag: r.headers.get("etag") || "" });
      })
      .catch(() => sendResponse({ ok: false, status: 0, data: null }));
    return true;
  }

  // Serveur des bannières publiques (Cloudflare Worker, dossier worker/) : seulement les adresses *.workers.dev.
  if (msg.type === "bannerApi") {
    let url;
    try {
      url = new URL(String(msg.url || ""));
    } catch (e) {
      sendResponse({ ok: false, status: 0, data: null });
      return false;
    }
    const method = ["GET", "POST", "PUT", "DELETE"].includes(msg.method) ? msg.method : "GET";
    if (url.protocol !== "https:" || !url.hostname.endsWith(".workers.dev") || !/^\/(verify\/(start|check)|banner\/\d+|admin\/(list|titles|stats|ping\/\d+)|titles|moderate|translate|feedback|ping\/\d+|favs\/\d+)$/.test(url.pathname)) {
      sendResponse({ ok: false, status: 0, data: null });
      return false;
    }
    const headers = {};
    if (msg.body !== undefined) headers["Content-Type"] = "application/json";
    if (msg.token) headers.Authorization = "Bearer " + String(msg.token);
    if (msg.admin) headers["X-Admin-Key"] = String(msg.admin);
    fetch(url.href, { method, headers, body: msg.body === undefined ? undefined : JSON.stringify(msg.body) })
      .then(async (r) => {
        let data = null;
        try {
          data = await r.json();
        } catch (e) {
          data = null;
        }
        sendResponse({ ok: r.ok, status: r.status, data });
      })
      .catch(() => sendResponse({ ok: false, status: 0, data: null }));
    return true;
  }

  // Police Google Fonts : seuls les fichiers des alphabets latins sont téléchargés, renvoyés en base64.
  if (msg.type === "fontLoad") {
    rbxFontLoad(String(msg.name || ""))
      .then(sendResponse)
      .catch(() => sendResponse({ ok: false, faces: [] }));
    return true;
  }

  if (msg.type === "devSync") {
    rbxDevSync()
      .then((st) => sendResponse({ err: (st && st.err) || "" }))
      .catch(() => sendResponse({ err: "" }));
    return true;
  }

  // Code du serveur (dossier worker/), pour le copier depuis l'onglet Admin > Serveur et le coller dans Cloudflare.
  if (msg.type === "workerCode") {
    fetch(chrome.runtime.getURL("worker/banner-worker.js"))
      .then((r) => (r.ok ? r.text() : ""))
      .then((code) => sendResponse({ code }))
      .catch(() => sendResponse({ code: "" }));
    return true;
  }

  // Liste de tous les limiteds (RAP, valeur, demande) : API publique de Rolimons, en lecture seule.
  if (msg.type === "rolimonsItems") {
    fetch("https://api.rolimons.com/items/v2/itemdetails")
      .then((r) => r.json())
      .then((d) => sendResponse({ ok: !!(d && d.success && d.items), items: (d && d.items) || null }))
      .catch(() => sendResponse({ ok: false, items: null }));
    return true;
  }

  if (msg.type === "reloadExtension") {
    sendResponse({ ok: true });
    setTimeout(() => chrome.runtime.reload(), 100);
    return false;
  }

  if (msg.type !== "fetchJson") return false;
  let url;
  try {
    url = new URL(msg.url);
  } catch (e) {
    sendResponse({ ok: false });
    return false;
  }
  if (url.protocol !== "https:" || !url.hostname.endsWith(".roblox.com")) {
    sendResponse({ ok: false });
    return false;
  }
  fetch(url.href, { credentials: "include" })
    .then(async (r) => {
      let data = null;
      try {
        data = await r.json();
      } catch (e) {
        data = null;
      }
      sendResponse({ ok: r.ok && data !== null, status: r.status, data });
    })
    .catch(() => sendResponse({ ok: false, status: 0 }));
  return true;
});