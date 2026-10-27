const rbx8 = { cleared: new Set(), gif: { key: "", url: "" } };

function rbx8IsGif(ban) {
  return !!(ban && typeof ban.url === "string" && ban.url.indexOf("data:image/gif;") === 0);
}

// Adresse blob: plutôt que l'énorme adresse data: dans la page ; une seule à la fois, libérée au changement.
function rbx8GifUrl(ban) {
  const key = ban.ts + "|" + ban.url.length;
  if (rbx8.gif.key === key) return rbx8.gif.url;
  if (rbx8.gif.url) URL.revokeObjectURL(rbx8.gif.url);
  const blob = rbxDataUrlToBlob(ban.url);
  rbx8.gif = { key, url: blob ? URL.createObjectURL(blob) : "" };
  return rbx8.gif.url;
}

const rbx8Dbg = { why: "", stage: null, media: [] };

// Nom du profil : le repère trouvé par js/badges.js (nouveau design de Roblox), sinon le premier titre.
function rbx8Heading(mount) {
  const page = rbxPageInfo(location.pathname);
  const h = page && page.k === "user" && typeof rbxProfileHeading === "function" ? rbxProfileHeading(page.id) : null;
  return h || mount.querySelector("h1");
}

function rbx8Stage() {
  const mount = rbxMountPoint();
  rbx8Dbg.media = [];
  if (!mount) {
    rbx8Dbg.why = "pas de zone de contenu";
    return null;
  }
  const h1 = rbx8Heading(mount);
  if (!h1) {
    rbx8Dbg.why = "nom du profil introuvable";
    return null;
  }
  const hTop = h1.getBoundingClientRect().top;
  let best = null;
  let bestArea = 0;
  mount.querySelectorAll("canvas, img, video").forEach((c) => {
    if (c.closest("#rx-banner, #rx-soc, #rx-bar, #rx-req, #rx-panel")) return;
    const r = c.getBoundingClientRect();
    if (r.height >= 100 && r.top < hTop && rbx8Dbg.media.length < 8) rbx8Dbg.media.push(`${c.tagName.toLowerCase()} ${Math.round(r.width)}x${Math.round(r.height)} y${Math.round(r.top - hTop)}`);
    if (r.height < 160 || r.width < 90 || r.top >= hTop) return;
    const a = r.width * r.height;
    if (a > bestArea) {
      best = c;
      bestArea = a;
    }
  });
  if (!best) {
    rbx8Dbg.why = "aucune image d'avatar au-dessus du nom";
    return null;
  }
  // On garde le plus grand parent qui a encore la taille d'une scène : il contient le décor ET l'avatar.
  let found = null;
  let el = best.parentElement;
  for (let i = 0; i < 9 && el && el !== mount && el !== document.body; i++, el = el.parentElement) {
    if (el.contains(h1)) break;
    const r = el.getBoundingClientRect();
    if (r.width >= 480 && r.height >= 180 && r.height <= 640) found = el;
    else if (found) break;
  }
  rbx8Dbg.why = found ? "scène trouvée" : "aucun bloc de la taille d'une scène";
  rbx8Dbg.stage = found;
  return found;
}

// Vue 2D : décor et skin sont deux grandes images de la taille de la scène. Le skin est celui dont l'adresse
// parle d'avatar, sinon le dernier dans la page (dessiné par-dessus le décor). Seul le reste est masqué.
function rbx8AvatarImg(big) {
  if (!big.length) return null;
  const named = big.find((n) => /avatar/i.test(n.currentSrc || n.src || ""));
  if (named) return named;
  return big.length > 1 ? big[big.length - 1] : null;
}

function rbx8ClearStageBg(host) {
  const hr = host.getBoundingClientRect();
  const isBig = (n) => {
    const r = n.getBoundingClientRect();
    return r.width >= hr.width * 0.8 && r.height >= hr.height * 0.8;
  };
  const big = Array.from(host.querySelectorAll("img, video")).filter((n) => !n.closest("#rx-banner") && isBig(n));
  const avatar = rbx8AvatarImg(big);
  if (avatar && avatar.hasAttribute("data-rx8c")) {
    avatar.style.removeProperty("opacity");
    avatar.removeAttribute("data-rx8c");
    rbx8.cleared.delete(avatar);
  }
  host.querySelectorAll("*").forEach((n) => {
    if (n.closest("#rx-banner") || n.tagName === "CANVAS" || n === avatar) return;
    const r = n.getBoundingClientRect();
    if (r.width < hr.width * 0.8 || r.height < hr.height * 0.8) return;
    if (n.tagName === "IMG" || n.tagName === "VIDEO") {
      if (!n.hasAttribute("data-rx8c")) {
        n.style.setProperty("opacity", "0", "important");
        n.setAttribute("data-rx8c", "1");
        rbx8.cleared.add(n);
      }
      return;
    }
    const cs = getComputedStyle(n);
    if (cs.backgroundImage !== "none" || rbx7Color(cs.backgroundColor).a > 0) {
      n.style.setProperty("background", "transparent", "important");
      n.setAttribute("data-rx8c", "1");
      rbx8.cleared.add(n);
    }
  });
}

function rbx8Unstage() {
  document.querySelectorAll(".rx8-stage, .rx-banner-host").forEach((n) => {
    n.classList.remove("rx8-stage");
    n.classList.remove("rx-banner-host");
    n.style.minHeight = "";
    n.style.borderRadius = "";
  });
  rbx8.cleared.forEach((n) => {
    n.style.removeProperty("background");
    n.style.removeProperty("opacity");
    n.removeAttribute("data-rx8c");
  });
  rbx8.cleared.clear();
}

rbxSocBannerEl = function () {
  const s = rbxState;
  const page = rbxPageInfo(location.pathname);
  const mount = rbxMountPoint();
  let el = document.getElementById("rx-banner");
  const me = rbxMe;
  const ok = (b) => !!(b && typeof b.url === "string" && b.url.indexOf("data:image/") === 0);
  // Ton profil : ta bannière locale. Les autres profils : la bannière publiée par le créateur pour ce compte (js/tools.js).
  const mine = !!(page && page.k === "user" && me && String(me.id) === page.id);
  const shared = page && page.k === "user" && typeof rbxSharedBannerFor === "function" ? rbxSharedBannerFor(page.id) : null;
  let ban = null;
  if (mine && s.socBanner && ok(rbxBanner)) ban = rbxBanner;
  else if (s.sharedBanners !== false && ok(shared)) ban = shared;
  rbxBannerActive = ban;
  const want = s.enabled && ban && mount;
  document.querySelectorAll(".rx-banner-host").forEach((n) => {
    n.classList.remove("rx-banner-host");
    n.style.minHeight = "";
    n.style.borderRadius = "";
  });
  if (!want) {
    if (el) el.remove();
    rbx8Unstage();
    return;
  }
  const stage = rbx8Stage();
  const pos = rbxSocClamp(ban !== rbxBanner && ban.pos !== undefined ? ban.pos : s.bannerPos, 0, 100);
  const height = rbxSocClamp(s.bannerHeight, 100, 420);
  const radius = rbxSocClamp(s.bannerRadius, 0, 30);
  if (!el) {
    el = sxEl("div", "");
    el.id = "rx-banner";
    el.appendChild(document.createElement("canvas"));
  }
  if (stage) {
    const prev = document.querySelector(".rx8-stage");
    if (prev && prev !== stage) rbx8Unstage();
    stage.classList.add("rx8-stage");
    // Coins arrondis de la scène (réglage « Arrondi des coins » de la bannière).
    if (stage.style.borderRadius !== radius + "px") stage.style.borderRadius = radius + "px";
    el.style.height = "";
    el.style.borderRadius = "";
    if (stage.firstChild !== el) stage.insertBefore(el, stage.firstChild);
    rbx8ClearStageBg(stage);
  } else {
    rbx8Unstage();
    el.style.height = height + "px";
    el.style.borderRadius = radius + "px";
    if (mount.firstChild !== el) mount.insertBefore(el, mount.firstChild);
  }
  const canvas = el.firstChild;
  // GIF : une vraie image animée (un dessin sur canvas n'en garderait que la première image).
  let gif = el.querySelector(":scope > img.rx-banner-gif");
  if (rbx8IsGif(ban)) {
    canvas.style.display = "none";
    if (!gif) {
      gif = document.createElement("img");
      gif.className = "rx-banner-gif";
      gif.alt = "";
      gif.decoding = "async";
      el.appendChild(gif);
    }
    const src = rbx8GifUrl(ban);
    // Invisible tant que le GIF n'est pas chargé (voir css/layout.css) : pas de cadre vide ni d'image à moitié dessinée.
    if (gif.src !== src) {
      el.classList.remove("rx-ready");
      gif.onload = () => el.classList.add("rx-ready");
      gif.src = src;
    } else if (gif.complete && gif.naturalWidth) el.classList.add("rx-ready");
    gif.style.objectPosition = `50% ${pos}%`;
    return;
  }
  if (gif) {
    gif.remove();
    el.classList.remove("rx-ready");
  }
  canvas.style.display = "";
  rbxBannerBitmap().then((bmp) => {
    if (!bmp || !el.isConnected || !rbxBannerActive) return;
    const w = el.clientWidth;
    const h = el.clientHeight;
    if (!w || !h) return;
    const sig = [rbxBannerActive.ts, rbxBannerActive.url.length, w, h, pos].join("|");
    if (canvas.dataset.sig !== sig) {
      canvas.dataset.sig = sig;
      rbxDrawCover(canvas, bmp, pos, w, h);
    }
    el.classList.add("rx-ready");
  });
};
