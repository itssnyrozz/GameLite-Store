Object.assign(RBX_DEFAULTS, {
  uiSeeAll: true,
  uiChips: true,
  uiBadgeFix: true,
  hidePlusPromo: false
});

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

RBX5_LOOK.push("uiSeeAll", "uiChips", "uiBadgeFix");

RBX5_NEWS.length = 0;
RBX5_NEWS.push(
  "Ligne de séparation du menu de gauche : détection automatique et suppression",
  "Ligne d'amis redessinée : avatars propres, noms sans soulignement, pastille de jeu discrète",
  "Mode test gratuit corrigé, avec pastille rouge et raccourci Ctrl+Alt+F",
  "Compteurs du menu à nouveau lisibles, boutons Voir tout et évaluations en pastilles"
);

const RBX_P4 = "html:root:root:root:root body";
const RBX7_UI = "#rx-panel, #rx-overlay, #rx-dock, #rx-toast, #rx-notifs, #rx-hover-join2, #rx-hover-hide, #rx-bg-layer, #rx-test-pill, #rx-progress, #rx-banner";

const rbx7T = { decor: 0, badge: 0 };
let rbx7Boot = false;

(function rbx7Setup() {
  try {
    rbxSocAddField("interface", "uiDensity", { key: "uiSeeAll", type: "checkbox", label: "Boutons Voir tout en pastille" });
    rbxSocAddField("interface", "uiSeeAll", { key: "uiChips", type: "checkbox", label: "Évaluations des jeux en pastilles" });
    rbxSocAddField("interface", "uiChips", { key: "uiBadgeFix", type: "checkbox", label: "Corriger les compteurs invisibles du menu" });
    rbxSocAddField("interface", "uiBadgeFix", { key: "hidePlusPromo", type: "checkbox", label: "Masquer la carte de promotion Roblox Plus du menu" });
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
})();

function rbx7Sel(list) {
  return list.map((x) => `${RBX_P4} ${x}`).join(",");
}

function rbx7Alpha(tok) {
  if (tok === undefined) return 1;
  return String(tok).indexOf("%") !== -1 ? parseFloat(tok) / 100 : parseFloat(tok);
}

function rbx7Color(c) {
  const s = String(c || "").trim();
  if (!s || s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  let m = /^rgba?\(([^)]+)\)$/.exec(s);
  if (m) {
    const p = m[1].split(/[\s,\/]+/).filter(Boolean);
    if (p.length >= 3) return { r: parseFloat(p[0]), g: parseFloat(p[1]), b: parseFloat(p[2]), a: rbx7Alpha(p[3]) };
  }
  m = /^color\(srgb ([^)]+)\)$/.exec(s);
  if (m) {
    const p = m[1].split(/[\s\/]+/).filter(Boolean);
    if (p.length >= 3) return { r: parseFloat(p[0]) * 255, g: parseFloat(p[1]) * 255, b: parseFloat(p[2]) * 255, a: rbx7Alpha(p[3]) };
  }
  return { r: 0, g: 0, b: 0, a: 1 };
}

function rbx7Lum(o) {
  return (0.2126 * o.r + 0.7152 * o.g + 0.0722 * o.b) / 255;
}

rbxComputePremium = async function () {
  const store = await rbxStoreGet([RBX_LIC_KEY, RBX_ADMIN_KEY, RBX_PREVIEW_KEY]);
  const admin = await rbxCheckAdmin(store[RBX_ADMIN_KEY]);
  if (admin) {
    if (store[RBX_PREVIEW_KEY]) return { admin, premium: { active: false, preview: true } };
    return { admin, premium: { active: true, source: "admin" } };
  }
  const lic = store[RBX_LIC_KEY];
  if (lic) {
    const r = await rbxVerifyLicense(lic, false);
    if (r.ok) return { admin, premium: { active: true, source: "license", info: r.info } };
    return { admin, premium: { active: false, error: r.error } };
  }
  return { admin, premium: { active: false } };
};

async function rbx7TogglePreview() {
  if (!rbxAdmin) return;
  const st = await rbxStoreGet([RBX_PREVIEW_KEY]);
  const next = !st[RBX_PREVIEW_KEY];
  await rbxSetPreview(next);
  rbxToast(next ? "Mode test : tu vois la version gratuite" : "Mode admin rétabli");
  if (document.querySelector("#rx-panel [data-admin-body]")) rbxRenderAdmin();
}

function rbx7TestPill() {
  let p = document.getElementById("rx-test-pill");
  const on = !!(rbxAdmin && !rbxPremium.active && document.body);
  if (!on) {
    if (p) p.remove();
    return;
  }
  if (!p) {
    p = sxBtn("Mode test gratuit actif : cliquer pour quitter", "");
    p.id = "rx-test-pill";
    p.addEventListener("click", () => rbx7TogglePreview());
    document.body.appendChild(p);
  }
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.altKey && !e.shiftKey && e.key && e.key.toLowerCase() === "f" && rbxAdmin) {
    e.preventDefault();
    rbx7TogglePreview();
  }
});

window.addEventListener("resize", () => {
  rbxSideMemo.at = 0;
});

function rbx7Mark() {
  const on = rbxState.enabled;
  const side = on ? rbxFindSidebar() : null;
  document.querySelectorAll(".rx7-side").forEach((n) => {
    if (n !== side) n.classList.remove("rx7-side");
  });
  if (side) side.classList.add("rx7-side");

  let head = null;
  if (on) {
    document.elementsFromPoint(Math.round(window.innerWidth / 2), 18).some((el) => {
      if (el.closest(RBX7_UI)) return false;
      const r = el.getBoundingClientRect();
      if (r.width >= window.innerWidth * 0.9 && r.height <= 90 && r.top <= 1) {
        head = el;
        return true;
      }
      return false;
    });
  }
  document.querySelectorAll(".rx7-head").forEach((n) => {
    if (n !== head) n.classList.remove("rx7-head");
  });
  if (head) head.classList.add("rx7-head");
  return side;
}

function rbx7Badges(side) {
  const on = rbxState.enabled && rbxState.uiBadgeFix !== false;
  if (!on) {
    document.querySelectorAll("[data-rx7b]").forEach((el) => {
      el.style.removeProperty("color");
      el.removeAttribute("data-rx7b");
    });
    return;
  }
  if (!side) return;
  side.querySelectorAll("span, div, p, b, strong").forEach((el) => {
    if (el.hasAttribute("data-rx7b")) return;
    // Only real counters: short numeric text. Icons are painted with currentColor,
    // so recoloring them flipped them between black and white on every pass.
    const txt = (el.textContent || "").trim();
    if (!/^\d{1,4}\+?$|^\d+(\.\d)?k\+?$/i.test(txt)) return;
    if (el.matches("[class*='icon' i]") || el.querySelector("svg, img, [class*='icon' i]")) return;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.width > 90 || r.height < 14 || r.height > 34) return;
    const cs = getComputedStyle(el);
    const mask = cs.webkitMaskImage || cs.maskImage;
    if (mask && mask !== "none") return;
    const bg = rbx7Color(cs.backgroundColor);
    if (bg.a < 0.4) return;
    const fg = rbx7Lum(bg) > 0.55 ? "#111111" : "#ffffff";
    el.style.setProperty("color", fg, "important");
    el.querySelectorAll("*").forEach((c) => c.style.setProperty("color", fg, "important"));
    el.setAttribute("data-rx7b", "1");
  });
}

function rbx7Promo(side) {
  const want = rbxState.enabled && rbxState.hidePlusPromo;
  if (!want) {
    document.querySelectorAll(".rx7-hide").forEach((n) => n.classList.remove("rx7-hide"));
    return;
  }
  const a = document.querySelector('a[href*="plus?referrals"]');
  if (a && !a.closest(RBX7_UI)) {
    let t = a;
    while (t.parentElement && t.parentElement !== side && t.parentElement !== document.body && t.parentElement.children.length === 1) t = t.parentElement;
    t.classList.add("rx7-hide");
    return;
  }
  const card = rbx7PromoByText(side);
  if (card) card.classList.add("rx7-hide");
}

// Nouvelle carte « Share Plus to get 100 Robux » : ce n'est plus un lien, on la repère à son texte.
function rbx7PromoByText(side) {
  if (!side) return null;
  for (const el of side.querySelectorAll("span, p, div")) {
    if (el.children.length) continue;
    const txt = (el.textContent || "").trim();
    if (txt.length > 60 || !/^(share|partage[rz]?)\b.*\bplus\b/i.test(txt)) continue;
    let c = el;
    while (c.parentElement && c.parentElement !== side && (c.parentElement.textContent || "").trim().length <= 90) c = c.parentElement;
    return c;
  }
  return null;
}

function rbx7Decor() {
  const on = rbxState.enabled;

  if (!on || !rbxState.uiSeeAll) {
    document.querySelectorAll(".rx7-seeall").forEach((a) => a.classList.remove("rx7-seeall"));
  } else {
    document.querySelectorAll("a:not(.rx7-seeall)").forEach((a) => {
      if (a.closest(RBX7_UI)) return;
      const t = (a.textContent || "").trim().toLowerCase();
      if (t.length <= 14 && /^(see all|tout voir|voir tout)$/.test(t)) a.classList.add("rx7-seeall");
    });
  }

  if (!on || !rbxState.uiChips) {
    document.querySelectorAll(".rx7-rating").forEach((n) => n.classList.remove("rx7-rating"));
    return;
  }
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      const t = n.nodeValue;
      return t && t.length <= 24 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  let n;
  let count = 0;
  while ((n = w.nextNode()) && count < 120) {
    if (!/^\s*\d{1,3}\s?%\s*(rating|like|likes|évaluation|évaluations|j'aime)?\s*$/i.test(n.nodeValue)) continue;
    const p = n.parentElement;
    if (!p || p.closest(RBX7_UI + ", .rx7-side, .rx7-head")) continue;
    if ((p.textContent || "").trim().length > 28) continue;
    let target = p;
    const pp = p.parentElement;
    if (pp && pp.children.length <= 3 && (pp.textContent || "").trim().length <= 28 && !pp.matches("a, li, ul")) target = pp;
    if (!target.classList.contains("rx7-rating")) target.classList.add("rx7-rating");
    count++;
  }
}

// Marque la vraie photo de chaque ami, pas la petite icône de jeu posée dessus :
// l'anneau et le zoom ne visent que ces éléments.
function rbx7MarkAvatars() {
  const sel = ".thumbnail-2d-container, .avatar-card-image";
  document.querySelectorAll("[class*='friends-carousel' i], [data-rx-best]").forEach((root) => {
    root.querySelectorAll(sel).forEach((el) => {
      const ok = el.offsetWidth >= 48 && !(el.parentElement && el.parentElement.closest(sel));
      if (ok && !el.hasAttribute("data-rx-av")) el.setAttribute("data-rx-av", "");
      else if (!ok && el.hasAttribute("data-rx-av")) el.removeAttribute("data-rx-av");
    });
  });
}

function rbx7Css(s) {
  const sel = rbx7Sel;
  const FR = "[class*='friends-carousel' i]";
  let css = "";

  if (s.uiFriends) {
    css += `${sel([`${FR} .thumbnail-2d-container`, `${FR} .avatar-card-image`])} { box-shadow: none !important; }`;
    css += `${sel([`${FR} a`, "[class*='friend-tile' i] a"])} { text-decoration: none !important; }`;
    css += `${sel(["[class*='friends-carousel-tile-name' i]", "[class*='friend-tile-name' i]"])} { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px !important; font-weight: 700 !important; text-decoration: none !important; }`;
    css += `${sel(["[class*='friends-carousel-tile-experience' i]"])} { max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 9px; border-radius: 999px; background: color-mix(in srgb, var(--rx-text, #ffffff) 9%, transparent) !important; font-size: 11px !important; font-weight: 600 !important; text-decoration: none !important; }`;
    css += `${sel(["[class*='friends-carousel-tile-experience' i] *"])} { color: inherit !important; text-decoration: none !important; }`;
    css += `${sel(["[data-rx-best='1'] [data-rx-av]"])} { position: relative; isolation: isolate; box-shadow: none !important; }`;
    css += `${sel(["[data-rx-best='1'] [data-rx-av]::after"])} { content: ""; position: absolute; inset: 0; z-index: 1; border-radius: 50%; pointer-events: none; box-shadow: inset 0 0 0 3px #facc15, inset 0 0 12px rgba(250, 204, 21, 0.5) !important; }`;
    css += `${sel(["[data-rx-best='1']::after"])} { content: none !important; width: 0 !important; height: 0 !important; background: none !important; box-shadow: none !important; }`;
  }

  return css;
}

const rbx7CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx7CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx7Css(s);
};

function rbx7Tick() {
  if (!document.body) return;
  if (rbxReady && !rbx7Boot) {
    rbx7Boot = true;
    rbxRefreshPremium();
  }
  const now = Date.now();
  const steps = [
    rbx7TestPill,
    () => {
      if (!rbxDomChanged("rbx7")) return;
      rbx7MarkAvatars();
      const side = rbx7Mark();
      if (now - rbx7T.badge > 2000) {
        rbx7T.badge = now;
        rbx7Badges(side);
        rbx7Promo(side);
      }
    },
    () => {
      if (now - rbx7T.decor > 2500 && rbxDomChanged("rbx7d")) {
        rbx7T.decor = now;
        rbx7Decor();
      }
    }
  ];
  steps.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
}

rbxEvery(rbx7Tick, 1000);
rbxOnChange(rbxMakeThrottle(rbx7Tick, 800));