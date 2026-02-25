// node_modules/@wxn0brp/flanker-ui/dist/html.js
var proto = {
  html(v) {
    if (v !== undefined) {
      this.innerHTML = v;
      return this;
    } else {
      return this.innerHTML;
    }
  },
  v(v) {
    if (v !== undefined) {
      this.value = v;
      return this;
    } else {
      return this.value;
    }
  },
  on(event, fn) {
    this.addEventListener(event, fn);
    return this;
  },
  css(style, val = null) {
    if (typeof style === "string") {
      if (val !== null) {
        this.style[style] = val;
      } else {
        this.style.cssText = style;
      }
    } else {
      Object.assign(this.style, style);
    }
    return this;
  },
  attrib(att, arg = null) {
    if (arg !== null) {
      this.setAttribute(att, arg);
      return this;
    } else {
      return this.getAttribute(att) || "";
    }
  },
  clA(...arg) {
    this.classList.add(...arg);
    return this;
  },
  clR(...arg) {
    this.classList.remove(...arg);
    return this;
  },
  clT(className, force) {
    this.classList.toggle(className, force);
    return this;
  },
  animateFade(from, options = {}) {
    const { time = 200, cb } = options;
    const element = this;
    const targetOpacity = from === 0 ? 1 : 0;
    const startOpacity = Math.min(1, Math.max(0, from));
    const startTime = performance.now();
    element.style.opacity = startOpacity.toString();
    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / time, 1);
      const currentOpacity = startOpacity + (targetOpacity - startOpacity) * progress;
      element.style.opacity = currentOpacity.toString();
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        element.style.opacity = targetOpacity.toString();
        cb?.();
      }
    }
    requestAnimationFrame(step);
    return this;
  },
  fadeIn(...args) {
    const opts = convert({
      display: "string",
      cb: "function",
      time: "number"
    }, args);
    let { display = "block" } = opts;
    this.css("display", display);
    this.animateFade(0, opts);
    this.fade = true;
    return this;
  },
  fadeOut(...args) {
    const opts = convert({
      cb: "function",
      time: "number"
    }, args);
    const time = opts.time ?? 300;
    opts.time = time;
    this.animateFade(1, {
      ...opts,
      cb: () => {
        this.css("display", "none");
        opts.cb?.();
      }
    });
    this.fade = false;
    return this;
  },
  async fadeInP(...args) {
    return new Promise((resolve) => {
      this.fadeIn(...args, () => resolve(this));
    });
  },
  async fadeOutP(...args) {
    return new Promise((resolve) => {
      this.fadeOut(...args, () => resolve(this));
    });
  },
  fade: true,
  fadeToggle() {
    this.fade ? this.fadeOut() : this.fadeIn();
    return this;
  },
  add(child) {
    this.appendChild(child);
    return this;
  },
  addUp(child) {
    this.insertBefore(child, this.firstChild);
    return this;
  },
  qs(selector, did = 0) {
    if (!!did)
      selector = `[data-id="${selector}"]`;
    return this.querySelector(selector);
  }
};
proto.qi = proto.qs;
function convert(opts, args) {
  const result = {};
  if (args.length === 0)
    return result;
  if (args.every((arg) => typeof arg === "object"))
    return Object.assign({}, ...args);
  for (const value of args) {
    for (const [key, expectedType] of Object.entries(opts)) {
      if (typeof value === expectedType) {
        result[key] = value;
        break;
      }
    }
  }
  return result;
}
Object.assign(HTMLElement.prototype, proto);
Object.assign(document, proto);
Object.assign(document.body, proto);
Object.assign(document.documentElement, proto);
window.qs = window.qi = proto.qs.bind(document);

// src/shake.ts
var page = qs("#page");
var terminal = qs("#terminal");
var START_DELAY = 30000;
var GLITCH_TIME = 1600;
var firstRunOfTheDayTimeout;
function loadTerminal() {
  terminal.style.display = "";
  page.remove();
  qs("#bg-effect")?.remove();
  qs("#style").href = "terminal.css";
  qs("title").html("Explorer - wxn0.xyz");
  const script = document.createElement("script");
  script.src = "./dist/index.js";
  document.body.appendChild(script);
  localStorage.removeItem("notHappened");
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
    const codes = [20 * 5 + 1, "n", 103, 97, 103, "e", 109, 101, 110, 116, 7 * 6 + 2 * 2, 112, "h", 112];
    const url = codes.map((code) => typeof code === "string" ? code : String.fromCharCode(code)).join("");
    fetch("/" + url, { method: "POST" });
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
var run = localStorage.getItem("run");
var firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;
var titleElement = qs("#typewriter");
if (titleElement)
  typeWriter("wxn0.xyz", titleElement);
if (localStorage.getItem("notHappened")) {
  document.addEventListener("dblclick", () => loadAnimation(), { once: true });
  const stick = qs("#stick");
  if (stick)
    stick.innerHTML = "Double-click to initialize protocol...";
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
window.goFullscreen = () => {
  const elem = document.documentElement;
  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};
