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

// node_modules/@wxn0brp/flanker-ui/dist/storeUtils.js
function incrementCell(cell, by = 1) {
  cell.set(cell.get() + by);
  return cell;
}
function decrementCell(cell, by = 1) {
  cell.set(cell.get() - by);
  return cell;
}

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

// node_modules/@wxn0brp/flanker-ui/dist/component/index.js
var fetchVQL = window?.VQLClient?.fetchVQL;

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

// src/game.ts
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
    incrementCell($store.xp, xpGained);
    print(`Hacking... success! Gained <span class="success">${xpGained}</span> XP.`);
    if ($store.xp.get() >= xpToNextLevel) {
      incrementCell($store.level, 1);
      decrementCell($store.xp, xpToNextLevel);
      print(`Level up! You are now level <span class="success">${$store.level.get()}</span>.`, "system");
      checkUnlocks();
    }
    saveGame();
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
loadGame();

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
  "ls",
  "cd",
  "cat",
  "pwd"
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
      print("Available commands:");
      printAvailable("help", "Show this help message");
      printAvailable("status", "Show your current level and XP");
      printAvailable("hack", "Start a hacking mission to gain XP");
      printAvailable("links", "Show unlocked links");
      printAvailable("ls", "List directory contents");
      printAvailable("cd", "Change directory");
      printAvailable("cat", "Read file content");
      printAvailable("clear", "Clear the terminal");
      printAvailable("reset", "Reset your game progress");
      printAvailable("date", "Show current system time");
      printAvailable("zhiva [name]", "Run Zhiva app");
      break;
    case "status":
      showStatus();
      break;
    case "hack":
      startHack();
      break;
    case "links":
      showLinks();
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
    case "exit":
      print("There is no escape.", "error");
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
    case "dir":
    case "ll":
      fileSystem.ls(firstArg);
      break;
    case "cd":
      fileSystem.cd(firstArg);
      break;
    case "cat":
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
welcome();
