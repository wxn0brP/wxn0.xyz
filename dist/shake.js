// node_modules/@wxn0brp/flanker-ui/dist/html.js
(() => {
  var M = Object.defineProperty;
  var a = (t, e) => M(t, "name", { value: e, configurable: true });
  var s = { html(t) {
    return t !== undefined ? (this.innerHTML = t, this) : this.innerHTML;
  }, v(t) {
    return t !== undefined ? (this.value = t, this) : this.value;
  }, on(t, e) {
    return this.addEventListener(t, e), this;
  }, css(t, e = null) {
    return typeof t == "string" ? e !== null ? this.style[t] = e : this.style.cssText = t : Object.assign(this.style, t), this;
  }, attrib(t, e = null) {
    return e !== null ? (this.setAttribute(t, e), this) : this.getAttribute(t) || "";
  }, clA(...t) {
    return this.classList.add(...t), this;
  }, clR(...t) {
    return this.classList.remove(...t), this;
  }, clT(t, e) {
    return this.classList.toggle(t, e), this;
  }, animateFade(t, e = {}) {
    let { time: n = 200, cb: i } = e, r = this, l = t === 0 ? 1 : 0, m = Math.min(1, Math.max(0, t)), u = performance.now();
    r.style.opacity = m.toString();
    function h(d) {
      let T = d - u, o = Math.min(T / n, 1), L = m + (l - m) * o;
      r.style.opacity = L.toString(), o < 1 ? requestAnimationFrame(h) : (r.style.opacity = l.toString(), i?.());
    }
    return a(h, "step"), requestAnimationFrame(h), this;
  }, fadeIn(...t) {
    let e = c({ display: "string", cb: "function", time: "number" }, t), { display: n = "block" } = e;
    return this.css("display", n), this.animateFade(0, e), this.fade = true, this;
  }, fadeOut(...t) {
    let e = c({ cb: "function", time: "number" }, t), n = e.time ?? 300;
    return e.time = n, this.animateFade(1, { ...e, cb: a(() => {
      this.css("display", "none"), e.cb?.();
    }, "cb") }), this.fade = false, this;
  }, async fadeInP(...t) {
    return new Promise((e) => {
      this.fadeIn(...t, () => e(this));
    });
  }, async fadeOutP(...t) {
    return new Promise((e) => {
      this.fadeOut(...t, () => e(this));
    });
  }, fade: true, fadeToggle() {
    return this.fade ? this.fadeOut() : this.fadeIn(), this;
  }, add(t) {
    return this.appendChild(t), this;
  }, addUp(t) {
    return this.insertBefore(t, this.firstChild), this;
  }, qs(t, e = 0) {
    return e && (t = `[data-id="${t}"]`), this.querySelector(t);
  } };
  s.qi = s.qs;
  function c(t, e) {
    let n = {};
    if (e.length === 0)
      return n;
    if (e.every((i) => typeof i == "object"))
      return Object.assign({}, ...e);
    for (let i of e)
      for (let [r, l] of Object.entries(t))
        if (typeof i === l) {
          n[r] = i;
          break;
        }
    return n;
  }
  a(c, "convert");
  Object.assign(HTMLElement.prototype, s);
  Object.assign(document, s);
  Object.assign(document.body, s);
  Object.assign(document.documentElement, s);
  window.qs = window.qi = s.qs.bind(document);
})();

// src/shake.ts
var page = qs("#page");
var terminal = qs("#terminal");
var START_DELAY = 30000;
var GLITCH_TIME = 2000;
var firstRunOfTheDayTimeout;
function loadTerminal() {
  terminal.style.display = "";
  page.remove();
  qs("#bg-effect")?.remove();
  qs("#style").href = "terminal.css";
  qs("#glitch-style")?.remove();
  qs("title").html("Explorer - wxn0.xyz");
  const script = document.createElement("script");
  script.src = "./dist/index.js";
  document.body.appendChild(script);
}
function loadAnimation() {
  page.classList.add("glitch", "shake");
  document.querySelectorAll(".glitch-color").forEach((el) => {
    el.style.color = "red";
  });
  document.querySelectorAll("*").forEach((el) => {
    if (Math.random() < 0.5) {
      el.classList.add("glitch-color");
      el.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
    }
  });
  setTimeout(() => {
    page.classList.remove("shake");
  }, 500);
  setTimeout(() => {
    loadTerminal();
    localStorage.setItem("run", String(Date.now()));
    document.querySelectorAll(".glitch-color").forEach((el) => {
      el.classList.remove("glitch-color");
      el.style.color = "";
    });
  }, GLITCH_TIME);
}
function typeWriter(text, element, speed = 100) {
  let i = 0;
  element.innerHTML = "";
  function type() {
    if (i < text.length) {
      element.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, speed + (Math.random() * 50 - 25));
    }
  }
  type();
}
function initCanvas() {
  const canvas = qs("#bg-effect");
  if (!canvas)
    return;
  const ctx = canvas.getContext("2d");
  if (!ctx)
    return;
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;
  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });
  const particles = [];
  const particleCount = 50;
  for (let i = 0;i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      s: Math.random() * 2 + 1,
      v: Math.random() * 0.5 + 0.1
    });
  }
  function draw() {
    ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
    particles.forEach((p) => {
      p.y += p.v;
      if (p.y > height)
        p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
}
var run = localStorage.getItem("run");
var firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;
initCanvas();
var titleElement = qs("#typewriter");
if (titleElement)
  typeWriter("wxn0.xyz", titleElement);
if (localStorage.getItem("notHappened")) {
  document.addEventListener("dblclick", () => loadAnimation(), { once: true });
  const stick = qs("#stick");
  if (stick)
    stick.innerHTML = "Double-click to initialize protocol...";
  localStorage.removeItem("notHappened");
  console.log("Mode", "Not happened");
} else if (firstRunOfTheDay) {
  firstRunOfTheDayTimeout = setTimeout(loadAnimation, START_DELAY);
  console.log("Mode", "First run of the day");
  qs(".glitch-hover")?.addEventListener("mouseover", () => {
    loadAnimation();
    clearTimeout(firstRunOfTheDayTimeout);
  }, { once: true });
} else {
  loadTerminal();
}
