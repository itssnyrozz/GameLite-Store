Object.assign(RBX_DEFAULTS, {
  uiMotion: true,
  uiGlassHeader: true
});

Object.keys(RBX_DEFAULTS).forEach((k) => {
  if (rbxSaved[k] === undefined) rbxSaved[k] = RBX_DEFAULTS[k];
});
rbxState = rbxEffective(rbxSaved);

RBX5_LOOK.push("uiMotion", "uiGlassHeader");

const RBX10_CARDS = ".game-card-container, .item-card-container, .catalog-item-container, .list-item.game-card, .avatar-card";
const RBX10_HEADER = ["#header", ".rbx-header", ".navbar-fixed-top"];
const RBX10_POP = [".dropdown-menu", ".popover", ".rbx-popover-content", "[role='menu']", "[role='listbox']"];
const RBX10_EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const RBX10_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

(function rbx10Setup() {
  try {
    rbxSocAddField("interface", "uiAppear", { key: "uiMotion", type: "checkbox", label: "Animations fluides : pages, menus déroulants et fenêtres" });
    rbxSocAddField("interface", "uiProgress", { key: "uiGlassHeader", type: "checkbox", label: "En-tête en verre flouté, avec une ombre quand tu défiles" });
    const ui = RBX_TABS.find((t) => t.id === "interface");
    const ap = ui && ui.fields ? ui.fields.find((f) => f.key === "uiAppear") : null;
    if (ap) ap.label = "Cartes de jeux et d'objets qui apparaissent au défilement";
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
})();

function rbx10Reduced() {
  return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
}

function rbx10Moving(s) {
  return !!(s.enabled && !s.noAnimations && !rbx10Reduced());
}

let rbx10Obs = null;

function rbx10Observer() {
  if (rbx10Obs || typeof IntersectionObserver !== "function") return rbx10Obs;
  rbx10Obs = new IntersectionObserver(
    (entries) => {
      let n = 0;
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        rbx10Obs.unobserve(el);
        el.style.setProperty("--rx-rv-delay", (n++ % 8) * 45 + "ms");
        el.setAttribute("data-rx-rv", "1");
      });
    },
    { rootMargin: "0px 0px -4% 0px", threshold: 0.04 }
  );
  return rbx10Obs;
}

function rbx10Reveal() {
  const s = rbxState;
  const on = rbx10Moving(s) && s.uiAppear;
  if (!on) {
    if (rbx10Obs) {
      rbx10Obs.disconnect();
      rbx10Obs = null;
    }
    document.querySelectorAll('[data-rx-rv="0"]').forEach((el) => el.setAttribute("data-rx-rv", "1"));
    return;
  }
  const obs = rbx10Observer();
  if (!obs) return;
  const vh = window.innerHeight;
  let count = 0;
  for (const el of document.querySelectorAll(`:is(${RBX10_CARDS}):not([data-rx-rv])`)) {
    if (count++ > 400) break;
    if (el.closest("#rx-panel, #rx-overlay")) continue;
    // Cards already on screen stay visible: hiding them would flicker.
    if (el.getBoundingClientRect().top < vh) {
      el.setAttribute("data-rx-rv", "s");
      continue;
    }
    el.setAttribute("data-rx-rv", "0");
    obs.observe(el);
  }
}

let rbx10ScrollRaf = 0;

function rbx10ScrollMark() {
  rbx10ScrollRaf = 0;
  document.documentElement.classList.toggle("rx-scrolled", window.scrollY > 6);
}

window.addEventListener(
  "scroll",
  () => {
    if (!rbx10ScrollRaf) rbx10ScrollRaf = requestAnimationFrame(rbx10ScrollMark);
  },
  { passive: true }
);

function rbx10Css(s) {
  const sel = rbxSoc3Sel;
  const A = "var(--rx-accent, #335fff)";
  const moving = rbx10Moving(s);
  const d = rbxDerive(s);
  let css = "";

  if (moving && s.uiAppear) {
    css += `${sel(["[data-rx-rv='0']"])} { opacity: 0 !important; }`;
    css += `${sel(["[data-rx-rv='1']"])} { animation: rx10Reveal 0.5s ${RBX10_EASE} var(--rx-rv-delay, 0ms) backwards; }`;
  }

  if (moving && s.uiMotion) {
    css += `${sel(["#content > .content", "#content > main", "main#content"])} { animation: rx10PageIn 0.45s ${RBX10_EASE} both; }`;
    css += `${sel(RBX10_POP)} { animation: rx10Pop 0.18s ${RBX10_EASE}; transform-origin: top center; }`;
    css += `${sel([".modal-dialog", "[role='dialog'] > div"])} { animation: rx10Modal 0.26s ${RBX10_SPRING}; }`;
    css += `${sel([".modal-backdrop"])} { animation: rx10Fade 0.2s ease-out; }`;
    css += `${sel(["a", ".rbx-tab", ".rbx-tab a", "[role='tab']"])} { transition: color 0.18s ease, background-color 0.2s ease, border-color 0.2s ease, opacity 0.18s ease; }`;
    css += `${sel([".rbx-tab.active", "[role='tab'][aria-selected='true']"])} { transition: border-color 0.25s ${RBX10_EASE}; }`;
  }

  if (moving && s.uiLift) {
    css += `${sel([".game-card-container", ".item-card-container"])} { transition: transform 0.28s ${RBX10_SPRING} !important; }`;
    css += `${sel([".game-card-thumb-container", ".item-card-thumb-container"])} { overflow: hidden !important; transition: box-shadow 0.28s ${RBX10_EASE} !important; }`;
    css += `${sel([".game-card-thumb-container img", ".item-card-thumb-container img"])} { transition: transform 0.45s ${RBX10_EASE} !important; }`;
    css += `${sel([".game-card-link:hover .game-card-thumb-container img", ".item-card-link:hover .item-card-thumb-container img", ".game-card-container:hover .game-card-thumb-container img", ".item-card-container:hover .item-card-thumb-container img"])} { transform: scale(1.06); }`;
    css += `${sel([".game-card-link:hover .game-card-thumb-container", ".item-card-link:hover .item-card-thumb-container"])} { box-shadow: 0 16px 32px -12px color-mix(in srgb, ${A} 55%, rgba(0, 0, 0, 0.6)) !important; }`;
  }

  if (moving && s.uiButtons) {
    const prim = [".btn-primary-md", ".btn-primary-sm", ".btn-primary-lg", ".btn-growth-md", ".btn-growth-sm", ".btn-growth-lg", ".btn-cta-md", ".btn-cta-lg"];
    css += `${sel(prim.map((x) => x + ":hover"))} { box-shadow: 0 8px 20px -8px color-mix(in srgb, ${A} 80%, transparent) !important; }`;
  }

  if (s.uiGlassHeader && !s.glassNav) {
    const base = d.page || (d.dark ? "#191b1d" : "#ffffff");
    css += `${sel(RBX10_HEADER)} { background-color: ${rbxAlpha(base, 74)} !important; backdrop-filter: blur(18px) saturate(1.4) !important; -webkit-backdrop-filter: blur(18px) saturate(1.4) !important; transition: box-shadow 0.25s ease, background-color 0.25s ease; }`;
    css += `html.rx-scrolled ${sel(RBX10_HEADER)} { box-shadow: 0 10px 28px -16px rgba(0, 0, 0, 0.7) !important; }`;
  }

  if (s.uiPolish && !s.customScroll) {
    css += `html:root { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, var(--rx-text, #8a8a8a) 30%, transparent) transparent; }`;
  }
  return css;
}

const rbx10CssPrev = rbxSocBuildCss;
rbxSocBuildCss = function (s) {
  const base = rbx10CssPrev(s);
  if (!s.enabled) return base;
  return base + rbx10Css(s);
};

const rbx10Close = { timer: 0 };

const rbx10ClosePrev = rbxClosePanel;
rbxClosePanel = function () {
  const ov = document.getElementById("rx-overlay");
  const anim = document.documentElement.dataset.rxAnim !== "off" && !rbx10Reduced();
  if (!ov || !ov.classList.contains("rx-open") || !anim) return rbx10ClosePrev();
  if (rbx10Close.timer) return;
  ov.classList.add("rx-closing");
  rbx10Close.timer = setTimeout(() => {
    rbx10Close.timer = 0;
    ov.classList.remove("rx-closing");
    rbx10ClosePrev();
  }, 170);
};

const rbx10OpenPrev = rbxOpenPanel;
rbxOpenPanel = function (tab) {
  if (rbx10Close.timer) {
    clearTimeout(rbx10Close.timer);
    rbx10Close.timer = 0;
    const ov = document.getElementById("rx-overlay");
    if (ov) ov.classList.remove("rx-closing");
  }
  return rbx10OpenPrev(tab);
};

function rbx10Tick() {
  if (!document.body || !rbxDomChanged("rbx10")) return;
  try {
    rbx10Reveal();
  } catch (e) {
    console.error("Roblox Customizer :", e);
  }
}

rbxEvery(rbx10Tick, 400);
rbxOnChange(rbxMakeThrottle(rbx10Tick, 300));
rbxOnChange(rbxSocStyleRefresh);
