// Serveur des bannières publiques de Roblox Customizer (Cloudflare Worker + stockage KV « BANNERS »).
// N'importe quel utilisateur de l'extension peut publier SA bannière, après avoir prouvé que le compte Roblox
// est à lui : il colle un code dans sa description Roblox, le serveur le lit sur l'API publique de Roblox.
//
// Routes :
//   POST   /verify/start   { uid }            -> { code }            code à coller dans la description (15 min)
//   POST   /verify/check   { uid }            -> { token }           si la description contient le code
//   GET    /banner/:uid                       -> { url, pos, ts }    ou 404
//   PUT    /banner/:uid    { url, pos }       (Authorization: Bearer <token>)
//   DELETE /banner/:uid                       (Authorization: Bearer <token>, ou X-Admin-Key pour la modération)
//   GET    /admin/list                        (X-Admin-Key) -> [{ uid, ts, size }]
//   GET    /admin/stats                       (X-Admin-Key) -> { version, feedback, banners, favs, titles, config }
//   POST   /admin/check   { url }            (X-Admin-Key) -> { safe, answer }  test de la vérification IA
//   POST   /moderate      { text } | { url } -> { safe }            vérification IA (notes, images de fond…)
//   GET    /titles                           -> [{ id, label, color }] badges offerts par le créateur
//   PUT    /admin/titles  [{ id, label, color }] (X-Admin-Key)
//   GET    /ping/:uid                         -> { t, v }            dernier Premium ou certif donné à ce joueur, version des badges
//   PUT    /admin/ping/:uid                   (X-Admin-Key)          prévient le joueur : il relit sa liste tout de suite
//   POST   /translate     { lang, texts }    -> { t }               textes de l'extension traduits (null si pas encore)
//   POST   /feedback      { kind, text, uid?, name?, ver, page?, nav? } -> { ok, n }  idée ou bug, transmis au Discord
//   GET    /favs/:uid                         -> { list: [{ p, u }] } jeux préférés publics du joueur, ou 404
//   PUT    /favs/:uid     { list: [{ p, u }] } (Authorization: Bearer <token>)  seulement des numéros de jeux
//   DELETE /favs/:uid                         (Authorization: Bearer <token>, ou X-Admin-Key)
//
// Variables : ADMIN_KEY (secret, pour la modération), FEEDBACK_WEBHOOK (secret, webhook Discord des idées et bugs). Stockage : KV lié sous le nom BANNERS.
// Vérification IA : chaque bannière est regardée par un modèle de vision (Workers AI, liaison « AI ») avant
// d'être publiée. En cas de doute ou si l'IA ne répond pas, la bannière est refusée.

const MAX_URL = 1000000;
// Les GIF animés sont plus lourds : jusqu'à environ 4 Mo d'image.
const MAX_GIF = 5600000;
const CODE_TTL = 900;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Key",
  "Access-Control-Max-Age": "86400"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...CORS, ...extra } });
}

function fail(msg, status) {
  return json({ error: msg }, status);
}

function validUid(v) {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 && n < 1e13 ? String(n) : "";
}

function randomHex(bytes) {
  const a = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function sha256(text) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}

function sameText(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function bearerOk(env, uid, request) {
  const m = /^Bearer\s+([a-f0-9]{64})$/i.exec(request.headers.get("Authorization") || "");
  if (!m) return false;
  const saved = await env.BANNERS.get("tok:" + uid);
  return !!saved && sameText(saved, await sha256(m[1]));
}

function adminOk(env, request) {
  const k = request.headers.get("X-Admin-Key") || "";
  return !!env.ADMIN_KEY && k.length >= 16 && sameText(k, env.ADMIN_KEY);
}

async function readJson(request, max) {
  const len = Number(request.headers.get("Content-Length") || 0);
  if (len > max) return null;
  const text = await request.text();
  if (text.length > max) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    return null;
  }
}

async function verifyStart(env, request) {
  const body = await readJson(request, 200);
  const uid = validUid(body && body.uid);
  if (!uid) return fail("Compte invalide", 400);
  const code = "RBXC-" + randomHex(4).toUpperCase();
  await env.BANNERS.put("code:" + uid, code, { expirationTtl: CODE_TTL });
  return json({ code, ttl: CODE_TTL });
}

async function verifyCheck(env, request) {
  const body = await readJson(request, 200);
  const uid = validUid(body && body.uid);
  if (!uid) return fail("Compte invalide", 400);
  const code = await env.BANNERS.get("code:" + uid);
  if (!code) return fail("Code expiré : recommence la vérification", 410);
  const r = await fetch(`https://users.roblox.com/v1/users/${uid}`, { headers: { Accept: "application/json" } });
  if (!r.ok) return fail("Roblox ne répond pas, réessaie", 502);
  const user = await r.json();
  if (!user || typeof user.description !== "string" || user.description.indexOf(code) === -1) {
    return fail("Code introuvable dans ta description Roblox (elle peut mettre 1 minute à se mettre à jour)", 403);
  }
  const token = randomHex(32);
  await env.BANNERS.put("tok:" + uid, await sha256(token));
  await env.BANNERS.delete("code:" + uid);
  return json({ token });
}

async function bannerGet(env, uid) {
  const v = await env.BANNERS.get("ban:" + uid);
  if (!v) return json({ error: "none" }, 404, { "Cache-Control": "public, max-age=120" });
  return new Response(v, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120", ...CORS } });
}

const AI_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";
const AI_PROMPT =
  "You moderate profile banners on a gaming website used by teenagers. Look at the image. " +
  "Answer UNSAFE if it contains nudity, sexual or suggestive content, gore, graphic violence, self-harm, " +
  "hate symbols, drugs, or insulting or harassing text. Otherwise answer SAFE. Reply with exactly one word: SAFE or UNSAFE.";

function dataUrlBytes(url) {
  const b64 = url.slice(url.indexOf(",") + 1);
  const bin = atob(b64);
  const out = new Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function aiRun(env, image) {
  return env.AI.run(AI_MODEL, { prompt: AI_PROMPT, image, max_tokens: 5 });
}

// { safe: true | false | null } : null = l'IA n'a pas pu trancher (on refuse alors par prudence).
async function aiCheck(env, url) {
  if (!env.AI) return { safe: null, answer: "IA non configurée" };
  const image = dataUrlBytes(url);
  let res;
  let err = "";
  try {
    res = await aiRun(env, image);
  } catch (e) {
    err = String((e && e.message) || e);
    // Première utilisation du modèle Llama : il faut accepter sa licence une fois.
    if (/agree/i.test(err)) {
      await env.AI.run(AI_MODEL, { prompt: "agree" }).catch(() => {});
      res = await aiRun(env, image).catch((e2) => {
        err = String((e2 && e2.message) || e2);
        return null;
      });
    }
  }
  const answer = String((res && (res.response || res.description)) || "").trim().toUpperCase();
  if (!answer && err) return { safe: null, answer: "erreur IA : " + err.slice(0, 200) };
  if (/UNSAFE/.test(answer)) return { safe: false, answer };
  if (/^SAFE/.test(answer)) return { safe: true, answer };
  return { safe: null, answer: answer || "pas de réponse" };
}

async function adminCheck(env, request) {
  if (!adminOk(env, request)) return fail("Non autorisé", 401);
  const body = await readJson(request, MAX_GIF + 2000);
  const url = body && body.url;
  if (typeof url !== "string" || !/^data:image\/(webp|jpeg|png|gif);base64,/.test(url)) return fail("Image invalide", 400);
  return json(await aiCheck(env, url));
}

async function bannerPut(env, uid, request) {
  if (!(await bearerOk(env, uid, request))) return fail("Vérifie d'abord ton compte", 401);
  const body = await readJson(request, MAX_GIF + 2000);
  const url = body && body.url;
  const isGif = typeof url === "string" && url.indexOf("data:image/gif;") === 0;
  if (typeof url !== "string" || url.length > (isGif ? MAX_GIF : MAX_URL) || !/^data:image\/(webp|jpeg|png|gif);base64,[A-Za-z0-9+/=]+$/.test(url)) {
    return fail(isGif ? "GIF invalide ou trop lourd (4 Mo maximum)" : "Image invalide ou trop lourde", 400);
  }
  const verdict = await aiCheck(env, url);
  if (verdict.safe === false) return fail("Bannière refusée par la vérification automatique : choisis une autre image", 422);
  if (verdict.safe !== true) return fail("Vérification automatique indisponible, réessaie dans quelques minutes", 503);
  const pos = Math.max(0, Math.min(100, Math.round(Number(body.pos) || 50)));
  const rec = JSON.stringify({ url, pos, ts: Date.now() });
  await env.BANNERS.put("ban:" + uid, rec);
  return json({ ok: true });
}

// ---------- Modération IA de tout ce que les utilisateurs écrivent ou affichent ----------
const AI_TEXT_MODEL = "@cf/meta/llama-guard-3-8b";
const AI_IMAGE_PROMPT =
  "You moderate images shown on a gaming website used by teenagers. Look at the image. " +
  "Answer UNSAFE if it contains nudity, sexual or suggestive content, gore, graphic violence, self-harm, " +
  "hate symbols, drugs, or insulting or harassing text. Otherwise answer SAFE. Reply with exactly one word: SAFE or UNSAFE.";
const MAX_TEXT = 2000;
const MOD_TTL = 2592000;

async function aiText(env, text) {
  if (!env.AI) return { safe: null };
  try {
    const res = await env.AI.run(AI_TEXT_MODEL, { messages: [{ role: "user", content: text }] });
    const r = res && res.response;
    if (r && typeof r === "object" && typeof r.safe === "boolean") return { safe: r.safe };
    const t = String(r || "").trim().toLowerCase();
    if (t.indexOf("unsafe") === 0) return { safe: false };
    if (t.indexOf("safe") === 0) return { safe: true };
  } catch (e) {}
  return { safe: null };
}

async function imageBytes(url) {
  if (/^data:image\/(webp|jpeg|png|gif);base64,/.test(url)) return url.length <= MAX_GIF ? dataUrlBytes(url) : null;
  let u;
  try {
    u = new URL(url);
  } catch (e) {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const r = await fetch(u.href, { cf: { cacheTtl: 3600 } });
  const type = r.headers.get("Content-Type") || "";
  if (!r.ok || !/^image\//.test(type) || Number(r.headers.get("Content-Length") || 0) > MAX_GIF) return null;
  const buf = new Uint8Array(await r.arrayBuffer());
  return buf.length <= MAX_GIF ? Array.from(buf) : null;
}

async function aiImage(env, url) {
  if (!env.AI) return { safe: null };
  const image = await imageBytes(url).catch(() => null);
  if (!image) return { safe: false, error: "Image illisible ou trop lourde (4 Mo maximum)" };
  try {
    const res = await env.AI.run(AI_MODEL, { prompt: AI_IMAGE_PROMPT, image, max_tokens: 5 });
    const a = String((res && (res.response || res.description)) || "").trim().toUpperCase();
    if (/UNSAFE/.test(a)) return { safe: false };
    if (/^SAFE/.test(a)) return { safe: true };
  } catch (e) {}
  return { safe: null };
}

// Le même contenu n'est jamais vérifié deux fois : le verdict est gardé 30 jours dans le cache du serveur.
async function moderate(env, request) {
  const body = await readJson(request, MAX_GIF + 2000);
  const text = body && typeof body.text === "string" ? body.text.trim().slice(0, MAX_TEXT) : "";
  const url = body && typeof body.url === "string" ? body.url : "";
  if (!text && !url) return fail("Rien à vérifier", 400);
  const key = new Request("https://mod.cache/" + (await sha256((text ? "t:" : "i:") + (text || url))));
  const hit = await caches.default.match(key);
  if (hit) return json(await hit.json());
  const verdict = text ? await aiText(env, text) : await aiImage(env, url);
  if (verdict.safe !== null) {
    await caches.default.put(key, new Response(JSON.stringify(verdict), { headers: { "Cache-Control": "max-age=" + MOD_TTL } }));
  }
  return json(verdict);
}

// ---------- Traduction de l'extension dans la langue du Roblox du joueur ----------
// Chaque texte n'est traduit qu'une fois par langue : la traduction est gardée pour tous les joueurs.
// Modèle de langage (pas un simple traducteur) : il sait qu'il traduit les menus d'une extension Roblox,
// et traduit tout un lot de textes en un seul appel.
const TR_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const TR_LANGS = {
  en: "English", es: "Spanish", pt: "Brazilian Portuguese", de: "German", it: "Italian", nl: "Dutch", pl: "Polish",
  tr: "Turkish", ru: "Russian", uk: "Ukrainian", ja: "Japanese", ko: "Korean", zh: "Simplified Chinese",
  id: "Indonesian", th: "Thai", vi: "Vietnamese", ar: "Arabic", sv: "Swedish", da: "Danish", no: "Norwegian",
  fi: "Finnish", cs: "Czech", ro: "Romanian", hu: "Hungarian", el: "Greek", he: "Hebrew", hi: "Hindi", ms: "Malay"
};
const TR_MAX = 60;
const TR_NEW = 25;
// « tr2 » : les traductions de l'ancien modèle (mot à mot) sont ignorées et refaites.
const TR_PREFIX = "tr2:";

async function aiTranslate(env, lang, texts) {
  const system =
    `You translate the user interface of "Roblox Customizer", a browser extension for the Roblox website, from French to ${TR_LANGS[lang]}. ` +
    "Write short, natural interface text, as a native app would, using the usual Roblox terms (Robux, Premium, Friends, Avatar, Experience). " +
    "Translate the meaning, never word by word (for example « Bac à sable » is « Sandbox » in English). " +
    "Keep numbers, punctuation, emojis, symbols and proper names unchanged. " +
    "The input is a JSON array of strings. Reply with only a JSON array of the translated strings, same order, same length, nothing else.";
  const r = await env.AI.run(TR_MODEL, {
    messages: [
      { role: "system", content: system },
      { role: "user", content: JSON.stringify(texts) }
    ],
    max_tokens: 4096,
    temperature: 0.2
  });
  // Workers AI renvoie parfois la liste déjà lue (tableau), parfois du texte qui la contient.
  let list = r && r.response;
  if (!Array.isArray(list)) {
    const raw = typeof list === "string" ? list : JSON.stringify(list || "");
    const a = raw.indexOf("[");
    const b = raw.lastIndexOf("]");
    if (a === -1 || b <= a) throw new Error("réponse sans liste : " + raw.slice(0, 120));
    list = JSON.parse(raw.slice(a, b + 1));
  }
  if (!Array.isArray(list) || list.length !== texts.length) throw new Error(`liste de ${list && list.length} au lieu de ${texts.length}`);
  return list.map((t) => (typeof t === "string" ? t.trim().slice(0, 600) : ""));
}

async function translate(env, request) {
  const body = await readJson(request, 60000);
  const lang = body && Object.prototype.hasOwnProperty.call(TR_LANGS, body.lang) ? body.lang : "";
  const texts = body && Array.isArray(body.texts) ? body.texts.slice(0, TR_MAX).map((t) => String(t || "").slice(0, 500)) : [];
  if (!lang || !texts.length) return fail("Langue ou textes invalides", 400);
  const keys = await Promise.all(texts.map(async (t) => TR_PREFIX + lang + ":" + (await sha256(t)).slice(0, 32)));
  const out = await Promise.all(keys.map((k) => env.BANNERS.get(k, { cacheTtl: 86400 })));
  // Textes encore jamais traduits : un lot par requête, l'extension redemande les autres ensuite.
  const miss = [];
  for (let i = 0; i < texts.length && miss.length < TR_NEW; i++) if (out[i] === null && texts[i].trim()) miss.push(i);
  let err;
  if (miss.length && env.AI) {
    const got = await aiTranslate(env, lang, miss.map((i) => texts[i])).catch((e) => {
      err = String((e && e.message) || e).slice(0, 200);
      return null;
    });
    if (got) {
      await Promise.all(
        miss.map((i, j) => {
          if (!got[j]) return null;
          out[i] = got[j];
          return env.BANNERS.put(keys[i], got[j]);
        })
      );
    }
  }
  // Raison d'un échec de l'IA, pour la diagnostiquer sans ouvrir Cloudflare.
  return json(err ? { t: out, err } : { t: out });
}

// ---------- Badges offerts : liste gérée depuis l'onglet Admin, lue par toutes les extensions ----------
const TITLE_COLORS = ["gold", "accent", "red", "purple", "green", "galaxy", "rainbow", "sunset", "ocean", "fire"];

// Version de la liste, renvoyée avec chaque /ping : les extensions ne relisent /titles que quand elle change.
// Gardée 10 s en mémoire pour ne pas lire le stockage à chaque requête.
const titlesVer = { v: 0, at: 0 };

async function titlesVersion(env) {
  if (Date.now() - titlesVer.at > 10000) {
    titlesVer.v = Number(await env.BANNERS.get("titles:v", { cacheTtl: 30 })) || 0;
    titlesVer.at = Date.now();
  }
  return titlesVer.v;
}

async function titlesGet(env) {
  const v = (await env.BANNERS.get("titles")) || "[]";
  return new Response(v, { headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...CORS } });
}

async function titlesPut(env, request) {
  if (!adminOk(env, request)) return fail("Non autorisé", 401);
  const body = await readJson(request, 50000);
  if (!Array.isArray(body)) return fail("Liste invalide", 400);
  const seen = new Set();
  const list = [];
  for (const t of body.slice(0, 200)) {
    const id = validUid(t && t.id);
    const label = String((t && t.label) || "").trim().slice(0, 24);
    if (!id || !label || seen.has(id)) continue;
    seen.add(id);
    list.push({ id: Number(id), label, color: TITLE_COLORS.indexOf(t.color) !== -1 ? t.color : "gold" });
  }
  const now = Date.now();
  await env.BANNERS.put("titles", JSON.stringify(list));
  await env.BANNERS.put("titles:v", String(now));
  titlesVer.v = now;
  titlesVer.at = now;
  return json({ ok: true, count: list.length });
}

// ---------- Signal par joueur : un Premium ou une certif arrive en quelques secondes au lieu d'une minute ----------
async function pingGet(env, uid) {
  const [t, v] = await Promise.all([env.BANNERS.get("ping:" + uid, { cacheTtl: 30 }), titlesVersion(env)]);
  return json({ t: Number(t) || 0, v }, 200, { "Cache-Control": "no-store" });
}

async function pingPut(env, uid, request) {
  if (!adminOk(env, request)) return fail("Non autorisé", 401);
  await env.BANNERS.put("ping:" + uid, String(Date.now()), { expirationTtl: 7 * 86400 });
  return json({ ok: true });
}

async function bannerDelete(env, uid, request) {
  if (!adminOk(env, request) && !(await bearerOk(env, uid, request))) return fail("Non autorisé", 401);
  await env.BANNERS.delete("ban:" + uid);
  return json({ ok: true });
}

// ---------- Jeux préférés publics : seulement les numéros des jeux (place, univers), jamais de texte ----------
const MAX_FAVS = 10;

async function favsGet(env, uid) {
  const v = await env.BANNERS.get("fav:" + uid);
  if (!v) return json({ error: "none" }, 404, { "Cache-Control": "public, max-age=120" });
  return new Response(v, { headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120", ...CORS } });
}

async function favsPut(env, uid, request) {
  if (!(await bearerOk(env, uid, request))) return fail("Vérifie d'abord ton compte", 401);
  const body = await readJson(request, 5000);
  if (!body || !Array.isArray(body.list)) return fail("Liste invalide", 400);
  const seen = new Set();
  const list = [];
  for (const g of body.list.slice(0, MAX_FAVS)) {
    const p = validUid(g && g.p);
    const u = validUid(g && g.u);
    if (!p || !u || seen.has(p)) continue;
    seen.add(p);
    list.push({ p: Number(p), u: Number(u) });
  }
  if (!list.length) {
    await env.BANNERS.delete("fav:" + uid);
    return json({ ok: true, count: 0 });
  }
  await env.BANNERS.put("fav:" + uid, JSON.stringify({ list, ts: Date.now() }));
  return json({ ok: true, count: list.length });
}

async function favsDelete(env, uid, request) {
  if (!adminOk(env, request) && !(await bearerOk(env, uid, request))) return fail("Non autorisé", 401);
  await env.BANNERS.delete("fav:" + uid);
  return json({ ok: true });
}

// ---------- Idées et bugs envoyés depuis l'extension, transmis au salon Discord ----------
// L'adresse du webhook reste dans Cloudflare (secret FEEDBACK_WEBHOOK) : elle n'est jamais dans l'extension,
// donc personne ne peut la récupérer pour spammer ou supprimer le salon.
const FB_MAX = 1500;
const FB_GAP = 30000;
const FB_HOUR = 5;
// Rôle Discord pingé à chaque idée ou bug.
const FB_ROLE = "1526725552982200403";

async function feedback(env, request) {
  // Espaces ou guillemets collés avec l'adresse dans Cloudflare : retirés.
  const hook = String(env.FEEDBACK_WEBHOOK || "").trim().replace(/^["'<]+|["'>]+$/g, "");
  if (!hook) return fail("La boîte à idées n'est pas encore configurée", 503);
  if (!/^https:\/\/(canary\.|ptb\.)?discord(app)?\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(hook)) {
    return fail("Adresse du webhook invalide dans Cloudflare (FEEDBACK_WEBHOOK)", 503);
  }
  const body = await readJson(request, 8000);
  const kind = body && (body.kind === "bug" ? "bug" : body.kind === "idea" ? "idea" : "");
  const text = body ? String(body.text || "").trim().slice(0, FB_MAX) : "";
  if (!kind || text.length < 10) return fail("Message trop court (10 caractères minimum)", 400);

  // Anti-spam : 30 s entre deux messages et 5 par heure, par adresse IP (gardée hachée, jamais en clair).
  const key = "fb:" + (await sha256(request.headers.get("CF-Connecting-IP") || "?")).slice(0, 24);
  const now = Date.now();
  let rec = null;
  try {
    rec = JSON.parse((await env.BANNERS.get(key)) || "null");
  } catch (e) {
    rec = null;
  }
  if (!rec || now - rec.first > 3600000) rec = { first: now, n: 0, at: 0 };
  if (now - rec.at < FB_GAP) return fail("Attends 30 secondes avant d'envoyer un autre message", 429);
  if (rec.n >= FB_HOUR) return fail("5 messages par heure maximum, réessaie plus tard", 429);

  const uid = validUid(body.uid);
  const name = /^[A-Za-z0-9_]{3,20}$/.test(String(body.name || "")) ? body.name : "";
  const ver = /^[\d.]{1,16}$/.test(String(body.ver || "")) ? body.ver : "?";
  const page = kind === "bug" && /^\/[^\s<>`]{0,200}$/.test(String(body.page || "")) ? body.page : "";
  const nav = kind === "bug" && /^[\w .()-]{1,40}$/.test(String(body.nav || "")) ? body.nav : "";

  // Photo du joueur et numéro du message, demandés en même temps. Un échec n'empêche pas l'envoi.
  const [avatar, count] = await Promise.all([
    uid
      ? fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${uid}&size=150x150&format=Png`)
          .then((x) => (x.ok ? x.json() : null))
          .then((d) => {
            const u = d && d.data && d.data[0] && d.data[0].imageUrl;
            return typeof u === "string" && /^https:\/\/[\w.-]+\.rbxcdn\.com\//.test(u) ? u : "";
          })
          .catch(() => "")
      : "",
    env.BANNERS.get("fb:count").catch(() => null)
  ]);
  const num = (Number(count) || 0) + 1;

  const isBug = kind === "bug";
  const profile = uid ? `https://www.roblox.com/users/${uid}/profile` : "";
  const embed = {
    author: uid ? { name: name || "Joueur " + uid, url: profile } : { name: "Joueur anonyme" },
    title: `${isBug ? "Bug signalé" : "Nouvelle idée"} · n°${num}`,
    // Le texte du joueur en citation : il se distingue des infos ajoutées par RoNova.
    description: text
      .split("\n")
      .map((l) => "> " + l)
      .join("\n"),
    color: isBug ? 0xef4444 : 0xa855f7,
    fields: [],
    footer: { text: `RoNova ${ver}` + (uid ? " · pseudo envoyé par l'extension, non vérifié" : "") },
    timestamp: new Date(now).toISOString()
  };
  if (avatar) {
    embed.author.icon_url = avatar;
    embed.thumbnail = { url: avatar };
  }
  if (uid) embed.fields.push({ name: "Profil", value: `[Ouvrir sur Roblox](${profile})`, inline: true }, { name: "ID Roblox", value: "`" + uid + "`", inline: true });
  if (page) embed.fields.push({ name: "Page", value: `[roblox.com${page}](https://www.roblox.com${page.replace(/[()]/g, (c) => (c === "(" ? "%28" : "%29"))})`, inline: true });
  if (nav) embed.fields.push({ name: "Navigateur", value: nav, inline: true });

  const r = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "RoNova",
      // Seul le rôle de l'équipe est pingé : le texte du joueur (dans l'encadré) ne peut faire sonner ni @everyone ni un autre rôle.
      content: `<@&${FB_ROLE}>`,
      allowed_mentions: { parse: [], roles: [FB_ROLE] },
      embeds: [embed]
    })
  }).catch((e) => ({ ok: false, status: 0, err: String((e && e.message) || e).slice(0, 120) }));
  if (!r.ok) return fail(`Discord n'a pas accepté le message (${r.status || r.err}), réessaie plus tard`, 502);
  rec.n++;
  rec.at = now;
  // Le message est déjà sur Discord : si le stockage refuse l'écriture (quota du jour), l'envoi reste réussi.
  await Promise.all([
    env.BANNERS.put(key, JSON.stringify(rec), { expirationTtl: 3600 }),
    env.BANNERS.put("fb:count", String(num))
  ]).catch(() => null);
  return json({ ok: true, n: num });
}

// ---------- Onglet Admin > Serveur : ce qui est configuré et quelques chiffres ----------
// Version du code : à changer à chaque modification, l'onglet Serveur dit si Cloudflare a bien la dernière.
const WORKER_VERSION = "2026-10-27";

async function adminStats(env, request) {
  if (!adminOk(env, request)) return fail("Non autorisé", 401);
  const count = async (prefix) => {
    let n = 0;
    let cursor;
    do {
      const page = await env.BANNERS.list({ prefix, cursor });
      n += page.keys.length;
      cursor = page.list_complete ? undefined : page.cursor;
    } while (cursor && n < 5000);
    return n;
  };
  const [feedback, banners, favs, titles] = await Promise.all([
    env.BANNERS.get("fb:count").catch(() => null),
    count("ban:").catch(() => -1),
    count("fav:").catch(() => -1),
    env.BANNERS.get("titles").catch(() => null)
  ]);
  let nTitles = 0;
  try {
    nTitles = JSON.parse(titles || "[]").length;
  } catch (e) {
    nTitles = 0;
  }
  return json(
    {
      version: WORKER_VERSION,
      feedback: Number(feedback) || 0,
      banners,
      favs,
      titles: nTitles,
      config: { ai: !!env.AI, webhook: !!env.FEEDBACK_WEBHOOK }
    },
    200,
    { "Cache-Control": "no-store" }
  );
}

async function adminList(env, request) {
  if (!adminOk(env, request)) return fail("Non autorisé", 401);
  const out = [];
  let cursor;
  do {
    const page = await env.BANNERS.list({ prefix: "ban:", cursor });
    page.keys.forEach((k) => out.push({ uid: k.name.slice(4) }));
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor && out.length < 2000);
  return json(out);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    const parts = url.pathname.split("/").filter(Boolean);
    try {
      if (request.method === "POST" && url.pathname === "/verify/start") return await verifyStart(env, request);
      if (request.method === "POST" && url.pathname === "/verify/check") return await verifyCheck(env, request);
      if (request.method === "GET" && url.pathname === "/admin/list") return await adminList(env, request);
      if (request.method === "GET" && url.pathname === "/admin/stats") return await adminStats(env, request);
      if (request.method === "POST" && url.pathname === "/admin/check") return await adminCheck(env, request);
      if (request.method === "POST" && url.pathname === "/moderate") return await moderate(env, request);
      if (request.method === "POST" && url.pathname === "/translate") return await translate(env, request);
      if (request.method === "POST" && url.pathname === "/feedback") return await feedback(env, request);
      if (request.method === "GET" && url.pathname === "/titles") return await titlesGet(env);
      if (request.method === "PUT" && url.pathname === "/admin/titles") return await titlesPut(env, request);
      if (parts[0] === "ping" && parts.length === 2 && request.method === "GET") {
        const uid = validUid(parts[1]);
        return uid ? await pingGet(env, uid) : fail("Compte invalide", 400);
      }
      if (parts[0] === "admin" && parts[1] === "ping" && parts.length === 3 && request.method === "PUT") {
        const uid = validUid(parts[2]);
        return uid ? await pingPut(env, uid, request) : fail("Compte invalide", 400);
      }
      if (parts[0] === "favs" && parts.length === 2) {
        const uid = validUid(parts[1]);
        if (!uid) return fail("Compte invalide", 400);
        if (request.method === "GET") return await favsGet(env, uid);
        if (request.method === "PUT") return await favsPut(env, uid, request);
        if (request.method === "DELETE") return await favsDelete(env, uid, request);
      }
      if (parts[0] === "banner" && parts.length === 2) {
        const uid = validUid(parts[1]);
        if (!uid) return fail("Compte invalide", 400);
        if (request.method === "GET") return await bannerGet(env, uid);
        if (request.method === "PUT") return await bannerPut(env, uid, request);
        if (request.method === "DELETE") return await bannerDelete(env, uid, request);
      }
      return fail("Introuvable", 404);
    } catch (e) {
      return fail("Erreur du serveur", 500);
    }
  }
};
