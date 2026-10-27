Object.assign(RBX_DEFAULTS, {
  gradType: "linear",
  gradCount: 2,
  gradC: "#ec4899",
  gradD: "#f59e0b",
  gradAnimated: false,
  gradSpeed: 20,
  gradDim: 0
});

Object.assign(RBX_PREMIUM_OFF, { gradAnimated: false, gradDim: 0 });

RBX_LOCK_ONLY.push("gradC", "gradD", "gradCount", "gradType", "gradSpeed");

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

const rbxStyle = document.createElement("style");
rbxStyle.id = "rbx-customizer-style";
document.documentElement.appendChild(rbxStyle);

const RBX_P = "html:root body";

const RBX_X = "html:root";

const RBX_ROOT = "#wrap, .rbx-body, #content, .container-main, .page-content, .content";

const RBX_CARDS = ".section-content, .game-card-info, .modal-content, .modal-window, .modal-dialog, .popover-content, .dropdown-menu, .rbx-popover-content, .profile-about-content, .rbx-tabs-horizontal, .tab-content, .rbx-tab-content, .item-card-container, .game-description-wrapper, .game-container";

const RBX_NAV = "#navigation, #header, .rbx-header, .navbar-fixed-top, .rbx-left-col, .rbx-navbar-right-search";

const RBX_PAINT_FOOT = "#footer-container, footer, .footer, .container-footer, [id*='footer' i]";

const RBX_PAINT = "#navigation, #header, .rbx-header, .navbar-fixed-top, .rbx-left-col, .left-col-list, #left-navigation-container, [class*='left-col' i], [class*='left-nav' i], " + RBX_PAINT_FOOT;

const RBX_GLASS_CARDS = ".section-content, .game-card-info, .item-card-container, .profile-about-content, .game-description-wrapper, .game-container, .modal-content, .popover-content, .dropdown-menu, .rbx-popover-content";

const RBX_TEXT = "p, h1, h2, h3, h4, h5, h6, li, label, td, th, dt, dd, span:not([class*='icon']), .text-label, .text-lead, .text-header, .text-emphasis, .text-name, .font-header-1, .font-header-2, .game-card-name, .rbx-tab-heading, .rbx-header a, #header a, #navigation a, .rbx-left-col a, .menu-vertical a";

const RBX_MUTED = ".text-secondary, .text-footer, .game-card-users-count, .xsmall";

const RBX_SECONDARY_BTN = ".btn-control-md, .btn-control-sm, .btn-control-lg, .btn-secondary-md, .btn-secondary-sm, .btn-secondary-lg";

const RBX_PRIMARY_BTN = ".btn-primary-md, .btn-primary-sm, .btn-primary-lg, .btn-growth-md, .btn-growth-sm, .btn-growth-lg, .btn-cta-md, .btn-cta-sm, .btn-cta-lg";

const RBX_INPUTS = "input:not([type='checkbox']):not([type='radio']):not([type='range']):not([type='color']):not([type='file']), textarea, select, .form-control, .input-field";

const RBX_BLUR_ROBUX = "#nav-robux-amount, #nav-robux-balance, #rx-robux-eur, [id*='robux-amount'], [class*='robux-amount']";


// Floutage limité à toi et à tes amis : éléments marqués par rbxMarkNames (features.js),
// plus l'en-tête du profil quand c'est le tien ou celui d'un ami (classe rx-blur-mine).
const RBX_BLUR_MINE = [".rx-blur-name"]
  .concat(["#rx-bar .rx-name-val", ".profile-name", ".profile-display-name", "[data-testid='profile-header-username']", "[class*='profile-name']"].map((x) => "html.rx-blur-mine " + x))
  .join(", ");

// Image de fond intégrée (fichier ou lien converti par js/layout.js) : posée une seule fois dans --rx-bg-img,
// pour ne pas recopier plusieurs Mo dans le CSS à chaque réglage.
const RBX_BG_VAR = "var:rx-bg-img";

function rbxSel(list) {
  return list.split(",").map((x) => `${RBX_P} ${x.trim()}`).join(",");
}

function rbxBlur(list) {
  const base = list.split(",").map((x) => x.trim());
  return `${base.join(",")} { filter: blur(7px) !important; transition: filter 0.15s; } ${base.map((x) => x + ":hover").join(",")} { filter: none !important; }`;
}

function rbxHexToRgb(hex) {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(String(hex || "").trim());
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}

function rbxToHex(rgb) {
  return "#" + rgb.map((n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0")).join("");
}

function rbxLum(hex) {
  const rgb = rbxHexToRgb(hex);
  if (!rgb) return 0;
  return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
}

function rbxSat(hex) {
  const c = rbxHexToRgb(hex);
  if (!c) return 0;
  const mx = Math.max(c[0], c[1], c[2]);
  const mn = Math.min(c[0], c[1], c[2]);
  return mx === 0 ? 0 : (mx - mn) / mx;
}

function rbxMix(a, b, pct) {
  return `color-mix(in srgb, ${a} ${100 - pct}%, ${b} ${pct}%)`;
}

function rbxMixHex(a, b, t) {
  const x = rbxHexToRgb(a);
  const y = rbxHexToRgb(b);
  if (!x || !y) return a;
  return rbxToHex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * t));
}

function rbxAvgStops(list) {
  const rgbs = list.map(rbxHexToRgb).filter(Boolean);
  if (!rgbs.length) return "#000000";
  return rbxToHex([0, 1, 2].map((i) => rgbs.reduce((a, c) => a + c[i], 0) / rgbs.length));
}

function rbxAccentFromGradient(a, b) {
  const l = rbxLum(b);
  if (l < 0.35) return rbxMixHex(b, "#ffffff", 0.45);
  if (l > 0.8) return rbxMixHex(b, "#000000", 0.3);
  return b;
}

function rbxAccentFromStops(stops) {
  const list = stops.filter((c) => rbxHexToRgb(c));
  if (!list.length) return "#335fff";
  let best = list[0];
  list.forEach((c) => {
    if (rbxSat(c) > rbxSat(best) + 0.05) best = c;
  });
  return rbxAccentFromGradient(best, best);
}

function rbxClamp(n, lo, hi) {
  let v = Number(n);
  if (isNaN(v)) v = lo;
  return Math.min(hi, Math.max(lo, v));
}

function rbxAlpha(color, pct) {
  return `color-mix(in srgb, ${color} ${Math.round(pct)}%, transparent)`;
}

function rbxSafeGradient(g) {
  const v = String(g || "").trim();
  if (!/^(linear|radial)-gradient\([#0-9a-zA-Z%.,()\s-]+\)$/.test(v)) return "";
  return v;
}

function rbxGradStops(s) {
  const n = Math.min(4, Math.max(2, Number(s.gradCount) || 2));
  return [s.gradA, s.gradB, s.gradC, s.gradD].slice(0, n).filter((c) => rbxHexToRgb(c));
}

function rbxGradient(s) {
  if (s.gradEnabled) {
    const stops = rbxGradStops(s);
    if (stops.length >= 2) {
      const ang = Number(s.gradAngle) || 0;
      if (s.gradType === "radial") return `radial-gradient(circle at 50% 35%, ${stops.join(", ")})`;
      if (s.gradType === "conic") return `conic-gradient(from ${ang}deg at 50% 50%, ${stops.concat([stops[0]]).join(", ")})`;
      return `linear-gradient(${ang}deg, ${stops.join(", ")})`;
    }
  }
  return rbxSafeGradient(s.bgGradient);
}

function rbxBgLayers(s, top) {
  const dim = rbxClamp(s.gradDim, 0, 70) / 100;
  const images = [];
  const sizes = [];
  if (dim > 0) {
    const o = `rgba(0, 0, 0, ${dim.toFixed(2)})`;
    images.push(`linear-gradient(${o}, ${o})`);
    sizes.push("100% 100%");
  }
  images.push(top.image);
  sizes.push(top.size);
  return { image: images.join(", "), size: sizes.join(", ") };
}

function rbxNativeDark() {
  const b = document.body;
  if (b && b.classList.contains("light-theme")) return false;
  if (b && b.classList.contains("dark-theme")) return true;
  return !(window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches);
}

function rbxDerive(s) {
  const stops = s.gradEnabled ? rbxGradStops(s) : [];
  const customGrad = stops.length >= 2;
  let bg = "";
  if (customGrad) {
    bg = rbxAvgStops(stops);
    const dim = rbxClamp(s.gradDim, 0, 70) / 100;
    if (dim > 0) bg = rbxMixHex(bg, "#000000", dim);
  } else if (s.useBgColor && rbxHexToRgb(s.bgColor)) {
    bg = s.bgColor;
  }
  const card = rbxHexToRgb(s.cardColor) ? s.cardColor : "";
  const accent = rbxHexToRgb(s.accent) ? s.accent : "";
  const pageHex = bg || card;
  let text = rbxHexToRgb(s.textColor) ? s.textColor : "";
  if (!text && pageHex) text = rbxLum(pageHex) < 0.5 ? "#f7f7f8" : "#1b1d1f";
  const d = {
    active: !!(s.enabled && pageHex),
    text,
    accent,
    onAccent: accent && rbxLum(accent) > 0.62 ? "#111111" : "#ffffff",
    dark: pageHex ? rbxLum(pageHex) < 0.5 : rbxNativeDark()
  };
  if (pageHex) {
    d.page = pageHex;
    d.surf = card || rbxMix(bg, text, 7);
    d.surf2 = rbxMix(d.surf, text, 8);
    d.surf3 = rbxMix(d.surf, text, 14);
    d.border = rbxMix(d.surf, text, 18);
    d.muted = rbxMix(text, d.surf, 40);
  }
  return d;
}

function rbxBuildCss(s) {
  if (!s.enabled) return "";
  const d = rbxDerive(s);
  const force = s.forceNative !== false;
  const grad = rbxGradient(s);
  const layered = !!(s.bgImage || grad);
  const I = rbxClamp(s.glassIntensity, 0, 100);
  const glassAlpha = 90 - I * 0.65;
  const blur = Math.round(2 + I * 0.28);
  const bf = `blur(${blur}px) saturate(${(1 + I / 120).toFixed(2)})`;
  const glassCss = `backdrop-filter: ${bf} !important; -webkit-backdrop-filter: ${bf} !important;`;
  const edge = `color-mix(in srgb, ${d.dark ? "#ffffff" : "#000000"} ${Math.round(10 + I * 0.12)}%, transparent)`;
  const shine = `inset 0 1px 0 color-mix(in srgb, #ffffff ${Math.round(6 + I * 0.2)}%, transparent)`;
  const soft = layered ? 78 : 100;
  const cardA = s.glassCards ? glassAlpha : soft;
  const navA = s.glassNav ? glassAlpha : soft;
  const fill = (c, a) => (a >= 100 ? c : rbxAlpha(c, a));
  let css = "";

  if (d.page) {
    css += `html:root { color-scheme: ${d.dark ? "dark" : "light"}; }`;
    if (force) {
      css += `html:root, ${RBX_P}, ${RBX_P}.dark-theme, ${RBX_P}.light-theme { --color-surface-0: ${d.page} !important; --color-surface-100: ${d.surf} !important; --color-surface-200: ${d.surf2} !important; --color-surface-300: ${d.surf3} !important; --color-content-default: ${d.text} !important; --color-content-emphasis: ${d.text} !important; --color-content-muted: ${d.muted} !important; --color-stroke-default: ${d.border} !important; }`;
    }
    css += `${RBX_P}, ${rbxSel(RBX_ROOT)} { background-color: ${d.page} !important; }`;
    css += `${rbxSel(RBX_CARDS)} { background-color: ${fill(d.surf, cardA)} !important; border-color: ${d.border} !important; }`;
    css += `${rbxSel(RBX_NAV)} { background-color: ${fill(d.surf, navA)} !important; border-color: ${d.border} !important; }`;
    css += `${rbxSel(RBX_SECONDARY_BTN)} { background-color: ${d.surf3} !important; border-color: ${d.border} !important; color: ${d.text} !important; }`;
    css += `${rbxSel(RBX_SECONDARY_BTN.split(",").map((x) => x.trim() + ":hover").join(","))} { background-color: ${rbxMix(d.surf, d.text, 22)} !important; }`;
    css += `${rbxSel(RBX_INPUTS)} { background-color: ${d.surf2} !important; color: ${d.text} !important; border-color: ${d.border} !important; }`;
    css += `${rbxSel("input::placeholder, textarea::placeholder")} { color: ${d.muted} !important; }`;
    css += `${rbxSel("hr")} { border-color: ${d.border} !important; background-color: ${d.border} !important; }`;
  }

  if (d.text) {
    css += `${RBX_P}, ${rbxSel(RBX_TEXT)} { color: ${d.text} !important; }`;
    if (d.muted) css += `${rbxSel(RBX_MUTED)} { color: ${d.muted} !important; }`;
  }

  if (d.accent) {
    css += `${RBX_P} { --rx-accent: ${d.accent}; }`;
    css += `${rbxSel(".text-link, a.text-link, .text-link:hover")} { color: ${d.accent} !important; }`;
    css += `${rbxSel(RBX_PRIMARY_BTN)} { background-color: ${d.accent} !important; border-color: ${d.accent} !important; color: ${d.onAccent} !important; }`;
    css += `${rbxSel(RBX_PRIMARY_BTN.split(",").map((x) => x.trim() + ":hover").join(","))} { filter: brightness(1.1); }`;
    css += `${rbxSel(".rbx-tab.active, .rbx-tab.active a, .rbx-tab.active .rbx-tab-heading")} { border-bottom-color: ${d.accent} !important; }`;
    css += `${rbxSel(".rbx-tab.active .rbx-tab-heading .text-lead, .rbx-tab.active .text-lead")} { color: ${d.accent} !important; }`;
    css += `::selection { background: ${d.accent}; color: ${d.onAccent}; }`;
  }

  if (d.page) {
    if (s.glassCards) {
      css += `${rbxSel(RBX_GLASS_CARDS)} { ${glassCss} border-color: ${edge} !important; box-shadow: ${shine} !important; }`;
    }
    if (s.glassNav) {
      css += `${rbxSel(RBX_NAV)} { ${glassCss} border-color: ${edge} !important; box-shadow: ${shine} !important; }`;
    }
    if (s.glassButtons) {
      css += `${rbxSel(RBX_SECONDARY_BTN)} { background-color: ${rbxAlpha(d.surf3, glassAlpha)} !important; ${glassCss} border-color: ${edge} !important; box-shadow: ${shine} !important; }`;
      css += `${rbxSel(RBX_SECONDARY_BTN.split(",").map((x) => x.trim() + ":hover").join(","))} { background-color: ${rbxAlpha(rbxMix(d.surf, d.text, 22), Math.min(96, glassAlpha + 18))} !important; }`;
      css += `${rbxSel(RBX_INPUTS)} { background-color: ${rbxAlpha(d.surf2, glassAlpha)} !important; ${glassCss} border-color: ${edge} !important; }`;
      if (d.accent) {
        css += `${rbxSel(RBX_PRIMARY_BTN)} { background-color: ${rbxAlpha(d.accent, 95 - I * 0.5)} !important; ${glassCss} border-color: color-mix(in srgb, ${d.accent} 55%, #ffffff) !important; box-shadow: ${shine} !important; }`;
      }
    }

    if (cardA < 100) {
      const g = s.glassCards ? glassCss : "";
      const b = s.glassCards ? `border-color: ${edge} !important;` : "";
      css += `${RBX_X} #rx-bar .rx-card { background-color: ${fill(d.surf, cardA)} !important; ${g} ${b} }`;
      css += `${RBX_X} #rx-bar .rx-srv { background-color: ${fill(d.surf2, cardA)} !important; ${g} ${b} }`;
    }
    if (s.glassButtons) {
      css += `${RBX_X} #rx-bar .rx-btn, ${RBX_X} #rx-bar .rx-select, ${RBX_X} #rx-dock button { background-color: ${rbxAlpha(d.surf3, glassAlpha)} !important; ${glassCss} border-color: ${edge} !important; box-shadow: ${shine}; }`;
      css += `${RBX_X} #rx-bar .rx-btn:hover, ${RBX_X} #rx-dock button:hover { background-color: ${rbxAlpha(rbxMix(d.surf3, d.text, 20), Math.min(96, glassAlpha + 20))} !important; }`;
      if (d.accent) {
        css += `${RBX_X} #rx-bar .rx-servers .rx-btnrow button.rx-btn { background-color: ${rbxAlpha(d.accent, 95 - I * 0.5)} !important; }`;
      }
      css += `${RBX_X} #rx-bar .rx-srv a.rx-btn { background-color: ${rbxAlpha("#00b06f", 90 - I * 0.45)} !important; }`;
    }
    if (s.glassPanel) {
      const pa = Math.min(96, Math.max(55, glassAlpha + 15));
      css += `${RBX_X} #rx-overlay { backdrop-filter: blur(${Math.round(blur / 2)}px); -webkit-backdrop-filter: blur(${Math.round(blur / 2)}px); }`;
      css += `${RBX_X} #rx-panel { background-color: ${rbxAlpha(d.surf, pa)} !important; ${glassCss} border-color: ${edge} !important; }`;
      css += `${RBX_X} #rx-panel .rx-group, ${RBX_X} #rx-panel .rx-sec, ${RBX_X} #rx-panel .rx-subtab:not(.rx-active) { background-color: ${rbxAlpha(d.surf2, pa)} !important; }`;
    }
  }

  if (d.accent && s.accentBorders) {
    css += `${rbxSel(RBX_GLASS_CARDS)} { box-shadow: inset 0 0 0 1px ${d.accent} !important; }`;
  }

  if (d.accent && s.neonGlow) {
    const glow = `color-mix(in srgb, ${d.accent} 70%, transparent)`;
    css += `${rbxSel(RBX_PRIMARY_BTN)} { box-shadow: 0 0 14px ${glow} !important; }`;
    css += `${RBX_X} #rx-dock button:hover, ${RBX_X} #rx-bar .rx-btn:hover { box-shadow: 0 0 14px ${glow} !important; }`;
  }

  if (s.bgImage || grad) {
    const animated = !!(!s.bgImage && s.gradEnabled && s.gradAnimated && s.gradType !== "conic");
    let layers;
    let pos = "center";
    if (s.bgImage) {
      const url = s.bgImage.replace(/"/g, "%22");
      layers = rbxBgLayers(s, { image: s.bgImage === RBX_BG_VAR ? "var(--rx-bg-img)" : `url("${url}")`, size: "cover" });
    } else {
      layers = rbxBgLayers(s, { image: grad, size: animated ? "300% 300%" : "cover" });
      if (animated) pos = "0% 50%";
    }
    const sec = rbxClamp(Number(s.gradSpeed) || 20, 4, 90);
    const anim = animated ? `animation: rxGradShift ${sec}s ease-in-out infinite !important;` : "";
    const base = d.page || (d.dark ? "#121212" : "#ffffff");
    const paint = `background-image: ${layers.image} !important; background-size: ${layers.size} !important; background-attachment: fixed !important; background-position: ${pos} !important; background-repeat: no-repeat !important; ${anim}`;
    if (animated) {
      css += `@keyframes rxGradShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }`;
    }
    css += `${RBX_X} { background-color: ${base} !important; ${paint} }`;
    css += `${RBX_P}, ${rbxSel(RBX_ROOT)} { background: transparent !important; }`;
    css += `${rbxSel(s.glassNav ? RBX_PAINT_FOOT : RBX_PAINT)} { background-color: ${base} !important; ${paint} }`;
  }

  const font = String(s.font || "").replace(/["';{}<>\\]/g, "").trim();
  if (font) {
    // Nom entre guillemets : les polices avec des chiffres ou des espaces marchent aussi (chargées par js/layout.js).
    css += `body, body *:not([class*="icon"]):not([class*="Icon"]):not(#rx-panel):not(#rx-panel *) { font-family: "${font}", system-ui, sans-serif !important; }`;
  }
  if (Number(s.fontSize) !== 100) {
    css += `html { font-size: ${Number(s.fontSize)}% !important; }`;
  }
  if (s.customScroll) {
    const sc = d.accent || "#335fff";
    css += `::-webkit-scrollbar { width: 10px; height: 10px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: ${sc}; border-radius: 6px; }`;
  }
  if (s.smoothScroll) {
    css += `html { scroll-behavior: smooth; }`;
  }
  if (s.noAnimations) {
    css += `*, *::before, *::after { animation: none !important; transition: none !important; }`;
  }
  if (s.blurRobux) css += rbxBlur(RBX_BLUR_ROBUX);
  if (s.blurName) css += rbxBlur(RBX_BLUR_MINE);

  if (s.hideChat) {
    css += `#chat-container, .chat-container, #chat-main, .dialog-container { display: none !important; }`;
  }
  if (s.hideAds) {
    css += `.ads-container, .abp, .ad-container, [id^="Skyscraper"], [id^="Leaderboard"], [class*="advertisement"], iframe[src*="ads"] { display: none !important; }`;
  }
  if (s.hideSidebar) {
    css += `#navigation, .rbx-left-col, .left-col-list { display: none !important; }`;
    css += `.content { margin-left: 0 !important; }`;
  }
  if (s.hideFooter) {
    css += `#footer-container, footer, .footer { display: none !important; }`;
  }
  if (s.hideFriendsRow) {
    css += `.friend-carousel-container, #friend-carousel, .friends-carousel-container, [data-testid="friends-carousel"] { display: none !important; }`;
  }
  if (s.hidePremiumBtn) {
    css += `#upgrade-now-button, a.upgrade-now-button, a[href*="/premium/membership"] { display: none !important; }`;
  }
  if (s.customCss) {
    css += s.customCss;
  }
  return css;
}

function rbxApplyVars(s) {
  const root = document.documentElement;
  const d = rbxDerive(s);
  const names = ["--rx-surface", "--rx-surface-2", "--rx-border", "--rx-text", "--rx-muted"];
  if (s.enabled && d.page) {
    root.style.setProperty("--rx-surface", d.surf);
    root.style.setProperty("--rx-surface-2", d.surf2);
    root.style.setProperty("--rx-border", d.border);
    root.style.setProperty("--rx-text", d.text);
    root.style.setProperty("--rx-muted", d.muted);
  } else {
    names.forEach((n) => root.style.removeProperty(n));
  }
  root.style.setProperty("--rx-accent", s.enabled && d.accent ? d.accent : "#335fff");
  root.style.setProperty("--rx-on-accent", s.enabled && d.accent ? d.onAccent : "#ffffff");
  const mode = d.dark ? "dark" : "light";
  if (root.dataset.rxMode !== mode) root.dataset.rxMode = mode;
}

let rbxRefreshedFor = null;

function rbxRefresh(s) {
  rbxRefreshedFor = s;
  rbxSetCss(rbxStyle, rbxBuildCss(s));
  rbxApplyVars(s);
}

rbxOnChange(rbxRefresh);

// Filet de sécurité : on ne reconstruit le thème que si les réglages ont changé
// ou si la page a retiré notre <style>, au lieu de tout refaire toutes les 1,5 s.
rbxEvery(() => {
  if (rbxRefreshedFor === rbxState && rbxStyle.isConnected) return;
  if (!rbxStyle.isConnected) document.documentElement.appendChild(rbxStyle);
  rbxRefreshedFor = rbxState;
  rbxRefresh(rbxState);
}, 1500);