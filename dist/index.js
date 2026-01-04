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

// node_modules/@wxn0brp/flanker-ui/dist/utils.js
function debounce(func, wait = 100) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
function delay(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// src/ui.ts
var terminal = document.getElementById("terminal");
var output = document.getElementById("output");
var input = document.getElementById("input");
function print(message, className) {
  const p = document.createElement("p");
  p.innerHTML = message;
  if (className) {
    p.className = className;
  }
  output.appendChild(p);
  terminal.scrollTop = terminal.scrollHeight;
}
function printCommand(command) {
  if (!command.trim())
    return;
  const p = document.createElement("p");
  p.innerHTML = `<span class="prompt'>></span> ${command}`;
  output.appendChild(p);
}
function clear() {
  output.innerHTML = "";
}

// src/filesystem.ts
class VirtualFileSystem {
  root = null;
  currentPath = ["home", "guest"];
  loaded = false;
  constructor() {
    this.load();
  }
  async load() {
    try {
      const res = await fetch("./system.json");
      const raw = await res.json();
      this.root = this.parseNode(raw, "root");
      this.loaded = true;
    } catch (e) {
      console.error("Failed to load VFS", e);
      print("System Error: Filesystem corruption detected.", "error");
    }
  }
  parseNode(raw, name) {
    if (typeof raw === "string") {
      return { type: "file", src: raw, name };
    }
    const children = {};
    const isHidden = raw["$hidden"] === true;
    for (const [key, value] of Object.entries(raw)) {
      if (key === "$hidden")
        continue;
      const childNode = this.parseNode(value, key);
      childNode.parent = undefined;
      children[key] = childNode;
    }
    return { type: "dir", children, hidden: isHidden, name };
  }
  getCWD() {
    return "/" + this.currentPath.join("/");
  }
  resolvePath(path) {
    if (!this.loaded || !this.root)
      return null;
    let parts = path.split("/").filter(Boolean);
    let p = path.startsWith("/") ? [] : [...this.currentPath];
    const normalizedPath = [];
    for (const part of p) {
      normalizedPath.push(part);
    }
    for (const part of parts) {
      if (part === ".")
        continue;
      if (part === "..") {
        if (normalizedPath.length > 0)
          normalizedPath.pop();
      } else {
        normalizedPath.push(part);
      }
    }
    let current = this.root;
    if (normalizedPath.length === 0)
      return this.root;
    for (const part of normalizedPath) {
      if (current.type !== "dir" || !current.children)
        return null;
      if (current.children[part]) {
        current = current.children[part];
      } else {
        return null;
      }
    }
    return current;
  }
  ls(args) {
    if (!this.loaded)
      return;
    let target;
    if (!args || args.trim() === "") {
      target = this.resolvePath(this.getCWD());
    } else {
      target = this.resolvePath(args);
    }
    if (!target) {
      print(`ls: cannot access '${args || ""}': No such file or directory`, "error");
      return;
    }
    if (target.type === "file") {
      print(target.src || target.name || "file");
      return;
    }
    if (!target.children)
      return;
    const names = Object.keys(target.children).filter((k) => !target.children[k].hidden);
    if (names.length === 0) {
      print("(empty)", "dim");
    } else {
      names.sort((a, b) => {
        const nodeA = target.children[a];
        const nodeB = target.children[b];
        const typeA = nodeA.type === "dir" ? 0 : 1;
        const typeB = nodeB.type === "dir" ? 0 : 1;
        if (typeA !== typeB)
          return typeA - typeB;
        return a.localeCompare(b);
      });
      names.forEach((name) => {
        const node = target.children[name];
        const suffix = node.type === "dir" ? "/" : "";
        const style = node.type === "dir" ? "system" : "";
        print(`<span class="${style}">${name}${suffix}</span>`);
      });
    }
  }
  cd(path) {
    if (!this.loaded)
      return;
    if (!path) {
      this.currentPath = ["home", "guest"];
      return;
    }
    const target = this.resolvePath(path);
    if (!target) {
      print(`cd: ${path}: No such file or directory`, "error");
      return;
    }
    if (target.type !== "dir") {
      print(`cd: ${path}: Not a directory`, "error");
      return;
    }
    let p = path.startsWith("/") ? [] : [...this.currentPath];
    const parts = path.split("/").filter(Boolean);
    for (const part of parts) {
      if (part === ".")
        continue;
      if (part === "..") {
        if (p.length > 0)
          p.pop();
      } else {
        p.push(part);
      }
    }
    this.currentPath = p;
  }
  async cat(path, isSudo = false) {
    if (!this.loaded)
      return;
    if (!path) {
      print("Usage: cat <filename>", "error");
      return;
    }
    const target = this.resolvePath(path);
    if (!target) {
      print(`cat: ${path}: No such file or directory`, "error");
      return;
    }
    if (target.type !== "file") {
      print(`cat: ${path}: Is a directory`, "error");
      return;
    }
    let src = target.src;
    if (src) {
      try {
        if (src.startsWith("sudo:")) {
          if (!isSudo) {
            print("******** [PERMISSION DENIED] ********", "error");
            return;
          }
          src = src.split(":")[1];
        }
        const response = await fetch(`./files/${src}`);
        if (!response.ok)
          throw new Error("404");
        const text = await response.text();
        print(text.replace(/\n/g, "<br>"));
      } catch (e) {
        print("Error reading file: IO Error", "error");
      }
    } else {
      print("(empty)");
    }
  }
}
var fileSystem = new VirtualFileSystem;

// node_modules/@wxn0brp/flanker-ui/dist/store.js
var storeKeys = ["listeners", "value", "notify", "get", "set", "subscribe", "parent", "isStore"];
function createStore(schema, parent) {
  const store = {};
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const isStore = typeof schema[key] === "object" && !Array.isArray(schema[key]) && schema[key] !== null;
      if (isStore) {
        store[key] = createStore(schema[key], store);
      } else {
        store[key] = new ReactiveCell(schema[key], store);
      }
    }
  }
  store.isStore = true;
  store.listeners = [];
  store.value = undefined;
  store.parent = parent;
  store.notify = (propagate = 0) => {
    store.listeners.forEach((listener) => listener(store));
    if (propagate > 0 && parent && typeof parent.notify === "function") {
      parent.notify(propagate - 1);
    }
    return store;
  };
  store.get = () => {
    const obj = {};
    for (const key in store) {
      if (storeKeys.includes(key))
        continue;
      if (store.hasOwnProperty(key)) {
        obj[key] = store[key].get();
      }
    }
    return obj;
  };
  store.getPointer = () => {
    const obj = {};
    for (const key in store) {
      if (storeKeys.includes(key))
        continue;
      if (store.hasOwnProperty(key)) {
        obj[key] = store[key];
      }
    }
    return obj;
  };
  store.set = (data, propagate = 0) => {
    for (const key in data) {
      if (storeKeys.includes(key)) {
        throw new Error(`Reserved key: ${key}`);
      }
      if (!store.hasOwnProperty(key)) {
        throw new Error(`Unknown key: ${key}`);
      }
      const target = store[key];
      if (target.isStore) {
        throw new Error(`Cannot set nested store: ${key}`);
      }
      const value = data[key];
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        throw new Error(`Invalid value for key: ${key}`);
      }
    }
    for (const key in data) {
      store[key].set(data[key], propagate);
    }
    return store;
  };
  store.subscribe = (listener) => {
    store.listeners.push(listener);
    return store;
  };
  return store;
}
class ReactiveCell {
  value;
  parent;
  listeners = [];
  isStore = false;
  constructor(value, parent) {
    this.value = value;
    this.parent = parent;
  }
  get() {
    return this.value;
  }
  set(newVal, propagation = 0) {
    this.value = newVal;
    this.notify(propagation);
    return this;
  }
  notify(propagation = 0) {
    this.listeners.forEach((listener) => listener(this.value));
    if (propagation > 0 && this.parent && typeof this.parent.notify === "function") {
      this.parent.notify(propagation - 1);
    }
    return this;
  }
  subscribe(listener) {
    this.listeners.push(listener);
    return this;
  }
}
// node_modules/@wxn0brp/flanker-ui/dist/component/index.js
var fetchVQL = window?.VQLClient?.fetchVQL;
// node_modules/@wxn0brp/flanker-ui/dist/storeUtils.js
function incrementCell(cell, by = 1) {
  cell.set(cell.get() + by);
  return cell;
}
function decrementCell(cell, by = 1) {
  cell.set(cell.get() - by);
  return cell;
}

// node_modules/@wxn0brp/flanker-ui/dist/index.js
globalThis.lo = console.log;

// src/vars.ts
var links = [
  { level: 1, name: "Homepage/Developer Website", url: "https://wxn0brp.github.io", displayed: false },
  { level: 2, name: "GitHub Profile", url: "https://github.com/wxn0brP", displayed: false },
  { level: 3, name: "ValtheraDB", url: "https://github.com/wxn0brP/ValtheraDB", displayed: false },
  { level: 4, name: "VQL", url: "https://github.com/wxn0brP/VQL", displayed: false }
];
var $store = createStore({
  xp: 0,
  level: 0
});
var xpToNextLevel = 100;
var targets = [
  "corporate-mainframe-j7",
  "government-server-omega",
  "bank-of-world-main",
  "crypto-exchange-alpha",
  "research-lab-gamma"
];
var vulnerabilities = [
  { name: "buffer overflow", command: "exploit buffer_overflow" },
  { name: "SQL injection", command: "exploit sql_injection" },
  { name: "cross-site scripting", command: "exploit xss" },
  { name: "rootkit", command: "install rootkit" },
  { name: "zero-day", command: "deploy zero_day" }
];
var hackingMission = {
  active: false,
  target: null,
  vulnerability: null,
  command: null
};

// src/save.ts
function saveGame() {
  const gameState = {
    xp: $store.xp.get(),
    level: $store.level.get()
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}
function loadGame() {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    const gameState = JSON.parse(savedState);
    $store.xp.set(gameState.xp);
    $store.level.set(gameState.level);
    links.forEach((link) => link.displayed = link.level <= gameState.level);
  }
}
function resetGame() {
  localStorage.removeItem("gameState");
  $store.level.set(0);
  $store.xp.set(0);
  links.forEach((link) => link.displayed = false);
  print("Game progress has been reset.", "system");
}

// src/game/progression.ts
function checkUnlocks() {
  const level = $store.level.get();
  links.forEach((link) => {
    if (link.displayed)
      return;
    const wasUnlocked = level >= link.level;
    if (!wasUnlocked)
      return;
    link.displayed = true;
    print(`New link unlocked: <a href="${link.url}" target="_blank">${link.name}</a>`, "success");
  });
  saveGame();
}
// src/xp.ts
function addXp(xp) {
  incrementCell($store.xp, xp);
  if ($store.xp.get() >= xpToNextLevel) {
    incrementCell($store.level, 1);
    decrementCell($store.xp, xpToNextLevel);
    print(`Level up! You are now level <span class="success">${$store.level.get()}</span>.`, "system");
    print(`Check 'help' for new commands!`, "system");
    checkUnlocks();
  }
  saveGame();
}

// src/game/hacking.ts
function failHack() {
  print("Hack failed. Connection lost.", "error");
  if (hackingMission.timer)
    clearTimeout(hackingMission.timer);
  hackingMission.active = false;
}
function tryHack(input2) {
  if (!hackingMission.active)
    return;
  print("$ " + input2, "executed");
  if (input2.toLowerCase() === hackingMission.command) {
    const xpGained = Math.floor(Math.random() * 30) + 20;
    print(`Hacking... success! Gained <span class="success">${xpGained}</span> XP.`);
    addXp(xpGained);
  } else {
    print(`Incorrect command. Expected '<span class="system">${hackingMission.command}</span>'.`, "error");
    failHack();
  }
  if (hackingMission.timer) {
    clearTimeout(hackingMission.timer);
  }
  hackingMission.active = false;
}
async function startHack() {
  if (hackingMission.active) {
    print("A hack is already in progress. Complete it or let it time out.", "system");
    return;
  }
  hackingMission.active = true;
  const target = targets[Math.floor(Math.random() * targets.length)];
  const vulnerability = vulnerabilities[Math.floor(Math.random() * vulnerabilities.length)];
  hackingMission.target = target;
  hackingMission.vulnerability = vulnerability.name;
  hackingMission.command = vulnerability.command;
  print("Scanning for targets...", "system");
  await delay(1000);
  print(`Found target: <span class="dim">${target}</span>`, "system");
  await delay(1000);
  print("Analyzing vulnerabilities...", "system");
  await delay(1000);
  print(`Found vulnerability: <span class="dim">${vulnerability.name}</span>`, "system");
  print(`To exploit, type: <span class="success">${vulnerability.command}</span>`);
  hackingMission.timer = setTimeout(() => {
    if (hackingMission.active) {
      print("Timeout! Hack failed.", "error");
      hackingMission.active = false;
    }
  }, 1e4);
}
// src/game/mining.ts
var isBusy = false;
async function startMining() {
  if (isBusy || hackingMission.active) {
    print("System is busy.", "error");
    return;
  }
  isBusy = true;
  input.disabled = true;
  print("Initiating crypto-mining sequence...", "system");
  await delay(1000);
  print("Allocating resources... [CPU: 100%]", "dim");
  await delay(1500);
  print("Hashing block...", "dim");
  await delay(2000);
  const success = Math.random() > 0.3;
  if (success) {
    const xpGained = Math.floor(Math.random() * 15) + 5;
    print(`Block found! Hash: 0x${Math.random().toString(16).substring(2, 8)}`, "success");
    print(`Reward: <span class="success">${xpGained}</span> XP`);
    addXp(xpGained);
  } else {
    print("Mining failed. Invalid share.", "error");
  }
  input.disabled = false;
  isBusy = false;
  input.focus();
}
// src/start.ts
async function startParams() {
  const params = new URLSearchParams(location.search);
  const i = params.get("i");
  if (!i)
    return;
  window.history.replaceState(null, "", "/");
  const instructions = i.replaceAll(",", " ").split(";");
  for (const instruction of instructions) {
    if (instruction === "")
      continue;
    if (instruction.split(" ")[0] === "sleep") {
      await delay(+instruction.split(" ")[1]);
      continue;
    }
    await delay(1000);
    handleCommand(instruction);
  }
}
function reloadWithParams(commands) {
  commands = commands.map((cmd) => cmd.replaceAll(" ", ","));
  location.href = "/?i=" + commands.join(";");
}

// src/game/destruction.ts
async function systemDestroy() {
  input.disabled = true;
  print("WARNING: You are about to delete the entire filesystem.", "error");
  print("This action cannot be undone.", "error");
  await delay(2000);
  print("Initiating deletion sequence...", "system");
  await delay(1000);
  const dirs = ["/home/guest", "/var/log", "/usr/bin", "/etc", "/tmp", "/usr/share/locale/fr"];
  for (const dir of dirs) {
    print(`Deleting ${dir}... [OK]`, "dim");
    await delay(300);
  }
  await delay(500);
  print("Deleting /boot... [FATAL ERROR]", "error");
  await delay(1000);
  print("KERNEL PANIC: SYSTEM HALTED", "error");
  await delay(1000);
  document.body.style.backgroundColor = "#0078d7";
  document.body.style.color = "#ffffff";
  document.body.style.fontFamily = "'Segoe UI', sans-serif";
  document.body.innerHTML = `
        <div style="padding: 10% 20%; font-size: 1.5rem;">
            <p style="font-size: 8rem; margin: 0;">:(</p>
            <p style="margin-top: 2rem;">Your device ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</p>
            <p id="bsod-status" style="margin-top: 2rem;">0% complete</p>
            <p style="font-size: 1rem; margin-top: 2rem; opacity: 0.8;">Stop key: CRITICAL_PROCESS_DIED</p>
        </div>
    `;
  const funnyMessages = [
    "Analyzing emotional damage...",
    "Deleting System32 (wait, this is Linux)...",
    "Converting Windows BSOD to Linux Kernel Panic...",
    "Installing Gentoo (Component 1 of 4096)...",
    "Compiling physics engine...",
    "Questioning life choices...",
    "Cleaning up broken dreams...",
    "Rebooting into reality..."
  ];
  const statusEl = qs("#bsod-status");
  for (let i = 0;i < funnyMessages.length; i++) {
    await delay(800 + Math.random() * 1000);
    statusEl.textContent = `${Math.floor(i / funnyMessages.length * 100)}% complete - ${funnyMessages[i]}`;
  }
  await delay(1000);
  statusEl.textContent = "100% complete - Restarting...";
  await delay(1000);
  reloadWithParams([
    "reset",
    "echo 'System was corrupted. Save data destroyed. Starting from a clean state.'"
  ]);
}
// src/game/status.ts
function showStatus() {
  print(`Level: <span class="success">${$store.level.get()}</span>`);
  print(`XP: <span class="success">${$store.xp.get()}/${xpToNextLevel}</span>`);
}
function showLinks() {
  print("Unlocked links:");
  const level = $store.level.get();
  const unlockedLinks = links.filter((l) => l.level <= level);
  if (unlockedLinks.length === 0) {
    print("  No links unlocked yet. Keep hacking!", "dim");
  } else {
    unlockedLinks.forEach((l) => {
      print(`  <a href="${l.url}" target="_blank">${l.name}</a> - Level ${l.level}`);
    });
  }
}
// src/game/welcome.ts
async function welcome() {
  input.disabled = true;
  print("CONNECTION ESTABLISHED.", "success");
  await delay(600);
  print("CRITICAL: SYSTEM BREACH DETECTED...", "error");
  await delay(800);
  print("BYPASSING SECURITY PROTOCOLS...", "system");
  await delay(1200);
  print("ACCESS GRANTED.", "success");
  await delay(500);
  print("----------------------------------------", "dim");
  print("Welcome to <span class='system'>wxn0.xyz</span> Terminal Interface", "system");
  print("Kernel v2.0.4-build.99 loaded.");
  print("System Shell v0.0.6 loaded.");
  print("----------------------------------------", "dim");
  await delay(300);
  print("Type '<span class='success'>help</span>' to list available commands.");
  input.disabled = false;
}
// src/game/vim.ts
var vimActive = false;
function openVim() {
  if (vimActive)
    return;
  vimActive = true;
  input.blur();
  const originalDisplay = output.style.display;
  const inputLine = document.getElementById("input-line");
  const originalInputDisplay = inputLine.style.display;
  output.style.display = "none";
  inputLine.style.display = "none";
  const vim = document.createElement("div");
  vim.style.height = "100vh";
  vim.style.backgroundColor = "#111";
  vim.style.color = "#ccc";
  vim.style.fontFamily = "monospace";
  vim.style.display = "flex";
  vim.style.flexDirection = "column";
  vim.style.padding = "5px";
  vim.style.zIndex = "1000";
  vim.style.position = "fixed";
  vim.style.top = "0";
  vim.style.left = "0";
  vim.style.width = "100%";
  vim.innerHTML = `
        <div style="flex: 1; white-space: pre-wrap; color: #4488ff;">~
~
~
~       VIM - Vi IMproved
~
~       version 9.0.1234
~       by Bram Moolenaar et al.
~       Vim is open source and freely distributable
~
~       You seem to be stuck in vim.
~       If you don't know how to exit, and you're not a superhuman,
~       you may need to restart the session.
~
~       For real pros: mash keys to prove you're not a bot.
~
~
~
~
~
~
</div>
        <div id="vim-status" style="background: #333; color: white; padding: 2px;">[No Name]                                                                                                        0,0-1          All</div>
        <div id="vim-cmd" style="height: 20px;"></div>
    `;
  document.body.appendChild(vim);
  let keyPresses = 0;
  let firstKeyPressTime = 0;
  const closeVim = () => {
    vim.remove();
    output.style.display = originalDisplay;
    inputLine.style.display = originalInputDisplay;
    window.removeEventListener("keydown", handleKey);
    vimActive = false;
    input.focus();
  };
  const handleKey = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (firstKeyPressTime === 0) {
      firstKeyPressTime = Date.now();
    }
    keyPresses++;
    const timeDiff = Date.now() - firstKeyPressTime;
    if (timeDiff > 1000) {
      keyPresses = 0;
      firstKeyPressTime = 0;
    }
    if (keyPresses > 10 && timeDiff < 1000) {
      closeVim();
    }
  };
  window.addEventListener("keydown", handleKey);
}
// src/game/cat.ts
var codes = [
  0,
  100,
  101,
  102,
  103,
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  214,
  226,
  300,
  301,
  302,
  303,
  304,
  305,
  307,
  308,
  400,
  401,
  402,
  403,
  404,
  405,
  406,
  407,
  408,
  409,
  410,
  411,
  412,
  413,
  414,
  415,
  416,
  417,
  418,
  419,
  420,
  421,
  422,
  423,
  424,
  425,
  426,
  428,
  429,
  431,
  444,
  450,
  451,
  495,
  496,
  497,
  498,
  499,
  500,
  501,
  502,
  503,
  504,
  506,
  507,
  508,
  509,
  510,
  511,
  521,
  522,
  523,
  525,
  530,
  599
];
function cat(code) {
  if (!code || !codes.includes(code)) {
    code = codes[Math.floor(Math.random() * codes.length)];
  }
  print(`HTTP cat ${code}`);
  const p = document.createElement("p");
  const img = document.createElement("img");
  img.src = `https://http.cat/images/${code}.jpg`;
  img.alt = `HTTP cat ${code}`;
  img.addEventListener("load", () => {
    terminal.scrollTop = terminal.scrollHeight;
  });
  img.addEventListener("click", () => {
    window.open(`https://http.cat/status/${code}`, "_blank");
  });
  p.appendChild(img);
  output.appendChild(p);
}

// src/game/snake.ts
function startSnake() {
  const originalOutputDisplay = output.style.display;
  const inputLine = qs("#input-line");
  const originalInputLineDisplay = inputLine.style.display;
  output.style.display = "none";
  inputLine.style.display = "none";
  input.blur();
  const canvas = document.createElement("canvas");
  canvas.id = "snake-canvas";
  canvas.style.position = "fixed";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.zIndex = "2000";
  canvas.style.backgroundColor = "#000";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    alert("Canvas not supported!");
    cleanup();
    return;
  }
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const CELL_SIZE = 20;
  const FONT_SIZE = 16;
  ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
  ctx.textBaseline = "top";
  let snake = [{
    x: Math.floor(canvas.width / 2 / CELL_SIZE) * CELL_SIZE,
    y: Math.floor(canvas.height / 2 / CELL_SIZE) * CELL_SIZE
  }];
  let direction = { x: CELL_SIZE, y: 0 };
  let nextDirection = { x: CELL_SIZE, y: 0 };
  let score = 0;
  let gameLoopId;
  let apple = { x: 0, y: 0 };
  const walls = [];
  const terminalText = output.innerText || "VOID ERROR NULL SYSTEM FAILURE";
  const words = terminalText.split(" ").filter((w) => w.length > 3 && w.length < 20);
  words.forEach((word) => {
    const metrics = ctx.measureText(word);
    const w = metrics.width;
    const h = FONT_SIZE;
    for (let i = 0;i < 10; i++) {
      const wx = Math.random() * (canvas.width - w);
      const wy = Math.random() * (canvas.height - h);
      const snapX = Math.floor(wx / CELL_SIZE) * CELL_SIZE;
      const snapY = Math.floor(wy / CELL_SIZE) * CELL_SIZE;
      const overlap = walls.some((wall) => snapX < wall.x + wall.width && snapX + w > wall.x && snapY < wall.y + wall.height && snapY + h > wall.y);
      const onSnake = Math.abs(snapX - snake[0].x) < 100 && Math.abs(snapY - snake[0].y) < 100;
      if (!overlap && !onSnake) {
        walls.push({
          x: snapX,
          y: snapY,
          width: w,
          height: h,
          text: word
        });
        break;
      }
    }
  });
  spawnApple();
  function handleKey(e) {
    switch (e.key) {
      case "ArrowUp":
        if (direction.y === 0)
          nextDirection = { x: 0, y: -CELL_SIZE };
        break;
      case "ArrowDown":
        if (direction.y === 0)
          nextDirection = { x: 0, y: CELL_SIZE };
        break;
      case "ArrowLeft":
        if (direction.x === 0)
          nextDirection = { x: -CELL_SIZE, y: 0 };
        break;
      case "ArrowRight":
        if (direction.x === 0)
          nextDirection = { x: CELL_SIZE, y: 0 };
        break;
      case "Escape":
        cleanup();
        break;
    }
  }
  window.addEventListener("keydown", handleKey);
  function update() {
    direction = nextDirection;
    const head = snake[0];
    const newHead = { x: head.x + direction.x, y: head.y + direction.y };
    if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {
      gameOver();
      return;
    }
    if (snake.some((s, i) => i !== 0 && rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, s.x, s.y, CELL_SIZE, CELL_SIZE))) {
      gameOver();
      return;
    }
    const hitWall = walls.some((wall) => rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, wall.x, wall.y, wall.width, wall.height));
    if (hitWall) {
      gameOver();
      return;
    }
    snake.unshift(newHead);
    if (rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, apple.x, apple.y, CELL_SIZE, CELL_SIZE)) {
      score++;
      addXp(2);
      spawnApple();
    } else {
      snake.pop();
    }
    draw();
  }
  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#444";
    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
    walls.forEach((w) => {
      ctx.fillText(w.text, w.x, w.y);
    });
    ctx.fillStyle = "#f00";
    ctx.fillRect(apple.x, apple.y, CELL_SIZE, CELL_SIZE);
    ctx.fillStyle = "#fff";
    ctx.fillText("@", apple.x + 2, apple.y - 2);
    ctx.fillStyle = "#0f0";
    snake.forEach((s) => {
      ctx.fillRect(s.x, s.y, CELL_SIZE - 2, CELL_SIZE - 2);
    });
    ctx.fillStyle = "#fff";
    ctx.fillText(`Score: ${score} | XP: ${$store.xp.get()}`, 10, 10);
  }
  function spawnApple() {
    const WALL_MARGIN = 2 * CELL_SIZE;
    let valid = false;
    while (!valid) {
      const rx = Math.floor(Math.random() * (canvas.width - CELL_SIZE));
      const ry = Math.floor(Math.random() * (canvas.height - CELL_SIZE));
      apple.x = Math.floor(rx / CELL_SIZE) * CELL_SIZE;
      apple.y = Math.floor(ry / CELL_SIZE) * CELL_SIZE;
      const collideWall = walls.some((w) => rectIntersect(apple.x, apple.y, CELL_SIZE, CELL_SIZE, w.x - WALL_MARGIN, w.y - WALL_MARGIN, w.width + WALL_MARGIN * 2, w.height + WALL_MARGIN * 2));
      const collideSnake = snake.some((s) => rectIntersect(apple.x, apple.y, CELL_SIZE, CELL_SIZE, s.x, s.y, CELL_SIZE, CELL_SIZE));
      if (!collideWall && !collideSnake) {
        valid = true;
      }
    }
  }
  function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
  }
  function gameOver() {
    clearInterval(gameLoopId);
    ctx.fillStyle = "rgba(0,0,0,0.8)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#f00";
    ctx.font = "40px monospace";
    const msg = "GAME OVER";
    const metrics = ctx.measureText(msg);
    ctx.fillText(msg, (canvas.width - metrics.width) / 2, canvas.height / 2 - 40);
    ctx.fillStyle = "#fff";
    ctx.font = "20px monospace";
    const scoreMsg = `Score: ${score} | Press ENTER to Continue`;
    const smMetrics = ctx.measureText(scoreMsg);
    ctx.fillText(scoreMsg, (canvas.width - smMetrics.width) / 2, canvas.height / 2 + 10);
    const closeHandler = (e) => {
      if (e.key === "Enter" || e.key === "Escape") {
        window.removeEventListener("keydown", closeHandler);
        cleanup();
      }
    };
    window.removeEventListener("keydown", handleKey);
    window.addEventListener("keydown", closeHandler);
    print("Snake Game Over! Gained " + score * 2 + " xp!");
  }
  function cleanup() {
    clearInterval(gameLoopId);
    window.removeEventListener("keydown", handleKey);
    if (canvas && canvas.parentNode)
      canvas.parentNode.removeChild(canvas);
    output.style.display = originalOutputDisplay;
    inputLine.style.display = originalInputLineDisplay;
    input.focus();
  }
  gameLoopId = window.setInterval(update, 100);
  draw();
}

// src/commands.ts
var box = qs(".prompt");
function printAvailable(name, description) {
  print(`  <span class="success">${name}</span> - ${description}`);
}
var commandsList = [
  "help",
  "status",
  "hack",
  "links",
  "ls",
  "dir",
  "cd",
  "cat",
  "pwd",
  "clear",
  "reset",
  "welcome",
  "return",
  "run",
  "sudo",
  "echo",
  "date",
  "whoami",
  "exit",
  "suglite",
  "matrix",
  "coinflip",
  "hello",
  "zhiva",
  "mine",
  "make",
  "vim",
  "vi",
  "rm",
  "snake"
];
function handleCommand(command) {
  if (!command.trim()) {
    return;
  }
  printCommand(command);
  if (hackingMission.active) {
    tryHack(command);
    return;
  }
  const [cmd, ...args] = command.split(" ");
  const fullArgs = command.substring(cmd.length + 1);
  let firstArg = args[0];
  print("$ " + command);
  switch (cmd.toLowerCase()) {
    case "help":
      let userLevel = $store.level.get();
      print("Available commands:");
      printAvailable("help", "Show this help message");
      printAvailable("status", "Show your current level and XP");
      printAvailable("hack", "Start a hacking mission to gain XP");
      printAvailable("links", "Show unlocked links");
      printAvailable("clear", "Clear the terminal");
      if (userLevel < 1)
        break;
      printAvailable("mine", "Mine for XP (Process intensive)");
      printAvailable("date", "Show current system time");
      printAvailable("ls/dir", "List directory contents");
      printAvailable("cd", "Change directory");
      printAvailable("cat", "Read file content");
      if (userLevel < 2)
        break;
      printAvailable("reset", "Reset your game progress");
      printAvailable("zhiva [name]", "Run Zhiva app");
      printAvailable("snake", "Play Snake (Earn XP!)");
      break;
    case "status":
      showStatus();
      break;
    case "hack":
      startHack();
      break;
    case "mine":
      startMining();
      break;
    case "links":
      showLinks();
      break;
    case "vim":
    case "vi":
      openVim();
      break;
    case "clear":
      clear();
      break;
    case "reset":
      resetGame();
      break;
    case "welcome":
      welcome();
      break;
    case "snake":
      startSnake();
      break;
    case "return":
      localStorage.setItem("notHappened", "true");
      location.reload();
      break;
    case "run":
      localStorage.removeItem("run");
      location.reload();
      break;
    case "sudo":
      if (firstArg === "cat") {
        fileSystem.cat(args[1], true);
        break;
      }
      if (fullArgs === "make me a sandwich") {
        print("Okay.", "success");
        break;
      }
      if (firstArg === "rm" && ["-rf", "-fr"].includes(args[1]) && args[2] === "/") {
        systemDestroy();
        break;
      }
      print("nice try, but you have no power here.", "error");
      break;
    case "echo":
      print(fullArgs || " ");
      break;
    case "date":
      print(new Date().toString());
      break;
    case "whoami":
      print("guest@wxn0.xyz");
      break;
    case "make":
      if (args.join(" ") === "me a sandwich") {
        print("What? Make it yourself.", "system");
      } else {
        print("make: *** No targets specified and no makefile found. Stop.", "error");
      }
      break;
    case "exit":
      print("There is no escape.", "error");
      break;
    case "rm":
      print("Permission denied.", "error");
      break;
    case "suglite":
      print("Suglite is watching...", "system");
      break;
    case "matrix":
      print("The Matrix has you...", "success");
      break;
    case "coinflip":
      print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
      break;
    case "42":
      print("The answer to life, the universe, and everything.", "success");
      break;
    case "konami":
      document.body.classList.toggle("god-mode");
      const isGod = document.body.classList.contains("god-mode");
      if (isGod) {
        print("GOD MODE ACTIVATED", "system");
        print("Unlimited power...", "dim");
        box.textContent = "GOD#";
        box.style.color = "#fff";
      } else {
        print("God mode... disabled due to budget cuts.", "dim");
        box.textContent = ">";
        box.style.color = "";
      }
      break;
    case "hello":
    case "hi":
      print("Hello there!", "system");
      break;
    case "ls":
    case "ll":
      fileSystem.ls(firstArg);
      break;
    case "dir":
      print("Windows sucks.", "error");
      break;
    case "cd":
      fileSystem.cd(firstArg);
      break;
    case "cat":
      if (!firstArg || !isNaN(+firstArg)) {
        cat(+firstArg);
        break;
      }
      fileSystem.cat(firstArg);
      break;
    case "pwd":
      print(fileSystem.getCWD());
      break;
    case "zhiva":
      if (!firstArg) {
        print("Usage: zhiva [name]", "error");
        break;
      }
      if (!firstArg.includes("/"))
        firstArg = `wxn0brP/${firstArg}`;
      location.href = `zhiva://start/${firstArg}`;
      break;
    case "xp":
      if (!isNaN(+firstArg)) {
        addXp(+firstArg);
        print("Gained " + firstArg + " XP! Cheater :/", "success");
        break;
      }
      break;
    default:
      print(`Command not found: <span class="error">${command}</span>`, "error");
      break;
  }
}

// src/index.ts
var commandHistory = [];
var historyIndex = -1;
var moveCursorToEnd = debounce(() => {
  input.setSelectionRange(input.value.length, input.value.length);
}, 50);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const command = input.value;
    if (command) {
      commandHistory.push(command);
    }
    historyIndex = commandHistory.length;
    input.value = "";
    handleCommand(command);
  } else if (e.key === "ArrowUp") {
    if (historyIndex > 0) {
      historyIndex--;
      input.value = commandHistory[historyIndex];
      moveCursorToEnd();
    }
  } else if (e.key === "ArrowDown") {
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      input.value = commandHistory[historyIndex];
      moveCursorToEnd();
    } else {
      historyIndex = commandHistory.length;
      input.value = "";
    }
  }
});
window.addEventListener("keydown", (e) => {
  if (document.activeElement !== input) {
    if (e.target instanceof HTMLAnchorElement && (e.key === "Enter" || e.key === " ")) {
      return;
    }
    input.focus();
  }
});
window.addEventListener("keyup", (e) => {
  const cmd = input.value.split(" ")[0].toLowerCase();
  input.style.color = commandsList.includes(cmd) ? "#0f0" : "";
});
var konamiCode = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a"
];
var konamiIndex = 0;
window.addEventListener("keydown", (e) => {
  if (e.key === konamiCode[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === konamiCode.length) {
      handleCommand("konami");
      konamiIndex = 0;
    }
  } else {
    konamiIndex = 0;
  }
});
loadGame();
welcome().then(startParams);
