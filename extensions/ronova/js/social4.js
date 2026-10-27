Object.assign(RBX_DEFAULTS, { socV4: false });

["quickJoin", "hoverJoin", "rememberServers", "showServerBrowser"].forEach((k) => {
  delete RBX_PREMIUM_OFF[k];
});

["quickJoinMode", "serverPages", "serverShow", "serverMinPlayers"].forEach((k) => {
  const i = RBX_LOCK_ONLY.indexOf(k);
  if (i >= 0) RBX_LOCK_ONLY.splice(i, 1);
});

rbxState = rbxEffective(rbxSaved);

rbxNotify = function () {
  rbxListeners.forEach((fn) => {
    try {
      fn(rbxState);
    } catch (e) {
      console.error("Roblox Customizer :", e);
    }
  });
};

function rbxMakeThrottle(fn, ms) {
  let timer = 0;
  let last = 0;
  return function () {
    const now = Date.now();
    if (now - last >= ms) {
      last = now;
      fn();
      return;
    }
    if (timer) return;
    timer = setTimeout(() => {
      timer = 0;
      last = Date.now();
      fn();
    }, ms - (now - last));
  };
}

(function rbxSoc4Throttle() {
  const slow = ["rbxTick", "rbxSocTick", "rbxSoc2Tick", "rbxSoc3Tick", "rbxSocOnState"];
  for (let i = 0; i < rbxListeners.length; i++) {
    const fn = rbxListeners[i];
    if (fn && slow.indexOf(fn.name) !== -1) rbxListeners[i] = rbxMakeThrottle(fn, 700);
  }
})();

const rbxInTimers = new WeakMap();

document.addEventListener(
  "input",
  (e) => {
    const t = e.target;
    if (e.rxPassed || !t || !t.matches || !t.matches('#rx-panel input[type="color"], #rx-panel input[type="range"]')) return;
    e.stopImmediatePropagation();
    if (rbxInTimers.has(t)) return;
    rbxInTimers.set(
      t,
      setTimeout(() => {
        rbxInTimers.delete(t);
        const ev = new Event("input", { bubbles: true });
        ev.rxPassed = true;
        t.dispatchEvent(ev);
      }, 100)
    );
  },
  true
);

let rbxHJ2El = null;
let rbxHJ2Pid = "";
let rbxHJ2Timer = 0;

function rbxHJ2Hide() {
  if (rbxHJ2El) rbxHJ2El.hidden = true;
  rbxHJ2Pid = "";
}

function rbxHJ2Schedule() {
  clearTimeout(rbxHJ2Timer);
  rbxHJ2Timer = setTimeout(rbxHJ2Hide, 250);
}

function rbxHJ2Btn() {
  if (rbxHJ2El) return rbxHJ2El;
  const b = document.createElement("button");
  b.id = "rx-hover-join2";
  b.type = "button";
  b.textContent = "Rejoindre";
  b.hidden = true;
  b.addEventListener("mouseenter", () => clearTimeout(rbxHJ2Timer));
  b.addEventListener("mouseleave", () => rbxHJ2Schedule());
  b.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (rbxHJ2Pid) rbxQuickJoinGame(rbxHJ2Pid);
  });
  document.body.appendChild(b);
  rbxHJ2El = b;
  return b;
}

document.addEventListener("mouseover", (e) => {
  const s = rbxState;
  if (!s.enabled || !s.hoverJoin || !document.body) return;
  const t = e.target;
  if (!t || !t.closest) return;
  if (t.closest("#rx-hover-join2")) {
    clearTimeout(rbxHJ2Timer);
    return;
  }
  if (t.closest("#rx-panel, #rx-overlay, #rx-bar, #rx-soc")) return;
  const a = t.closest('a[href*="/games/"]');
  if (!a) {
    if (rbxHJ2El && !rbxHJ2El.hidden) rbxHJ2Schedule();
    return;
  }
  const m = /\/games\/(\d+)/.exec(a.getAttribute("href") || "");
  if (!m) return;
  const tile = rbxGameTile(a);
  if (!tile) return;
  const r = tile.rect;
  clearTimeout(rbxHJ2Timer);
  const b = rbxHJ2Btn();
  rbxHJ2Pid = m[1];
  b.style.left = r.left + r.width / 2 + "px";
  b.style.top = r.bottom - 10 + "px";
  b.hidden = false;
});

document.addEventListener("mouseout", () => {
  if (rbxHJ2El && !rbxHJ2El.hidden) rbxHJ2Schedule();
});

window.addEventListener("scroll", () => rbxHJ2Hide(), { passive: true, capture: true });

rbxRenderBadge = function () {
  const b = document.querySelector("#rx-panel [data-badge]");
  if (!b) return;
  const on = !!rbxPremium.active;
  b.textContent = on ? (rbxAdmin ? "Admin" : "Premium") : rbxAdmin ? "Gratuit (test)" : "Gratuit";
  b.classList.toggle("rx-on", on);
  b.classList.toggle("rx-clickable", !!rbxAdmin);
  b.title = rbxAdmin ? "Clique pour passer du mode admin au mode gratuit (test)" : "";
};

document.addEventListener("click", async (e) => {
  const t = e.target;
  const b = t && t.closest ? t.closest("#rx-panel [data-badge]") : null;
  if (!b || !rbxAdmin) return;
  const st = await rbxStoreGet([RBX_PREVIEW_KEY]);
  const next = !st[RBX_PREVIEW_KEY];
  await rbxSetPreview(next);
  rbxToast(next ? "Mode test : tu vois l'extension en version gratuite" : "Mode admin rétabli");
  if (document.querySelector("#rx-panel [data-admin-body]")) rbxRenderAdmin();
});

function rbxSoc4Tick() {
  if (!document.body) return;
  if (rbxReady && !rbxSaved.socV4) rbxSet({ socV4: true });
}

rbxEvery(rbxSoc4Tick, 1000);
rbxOnChange(rbxSoc4Tick);