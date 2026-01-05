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
function rand(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}
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
  level: 0,
  achievements: [],
  credits: 0,
  xpMultiplier: 1,
  mails: [],
  storyProgress: 0
});
function getXpToNextLevel(level) {
  return 100 + level * 50;
}
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

// src/commands/help.ts
function printAvailable(name, description) {
  print(`  <span class="success">${name}</span> - ${description}`);
}
function cmdHelp() {
  let userLevel = $store.level.get();
  print("Available commands:");
  printAvailable("help", "Show this help message");
  printAvailable("status", "Show your current level and XP");
  printAvailable("hack", "Start a hacking mission to gain XP");
  printAvailable("links", "Show unlocked links");
  printAvailable("clear", "Clear the terminal");
  printAvailable("source", "Source code");
  if (userLevel < 1)
    return;
  printAvailable("achievements/a", "Show your achievements");
  printAvailable("mine", "Mine for XP (Process intensive)");
  printAvailable("date", "Show current system time");
  printAvailable("whoami", "Display current user");
  printAvailable("echo [text]", "Print text to terminal");
  if (userLevel < 2)
    return;
  printAvailable("ls/dir", "List directory contents");
  printAvailable("cd [path]", "Change directory");
  printAvailable("cat [file]", "Read file content");
  printAvailable("pwd", "Print working directory");
  if (userLevel < 3)
    return;
  printAvailable("zhiva [name]", "Run Zhiva app");
  printAvailable("snake", "Play Snake (Earn XP!)");
  printAvailable("vim/vi", "Open vim editor");
  if (userLevel < 4)
    return;
  printAvailable("pong", "Play Pong (Earn XP!)");
  if (userLevel < 5)
    return;
  printAvailable("shop", "Open the Dark Market (Buy upgrades)");
  printAvailable("reset", "Reset your game progress");
  printAvailable("coinflip", "Flip a coin");
  printAvailable("matrix", "Enter the Matrix");
}

// src/save.ts
function saveGame() {
  const gameState = {
    xp: $store.xp.get(),
    level: $store.level.get(),
    achievements: $store.achievements.get(),
    credits: $store.credits.get(),
    xpMultiplier: $store.xpMultiplier.get(),
    mails: $store.mails.get(),
    storyProgress: $store.storyProgress.get()
  };
  localStorage.setItem("gameState", JSON.stringify(gameState));
}
function loadGame() {
  const savedState = localStorage.getItem("gameState");
  if (savedState) {
    const gameState = JSON.parse(savedState);
    $store.xp.set(gameState.xp || 0);
    $store.level.set(gameState.level || 0);
    $store.achievements.set(gameState.achievements || []);
    $store.credits.set(gameState.credits || 0);
    $store.xpMultiplier.set(gameState.xpMultiplier || 1);
    $store.mails.set(gameState.mails || []);
    $store.storyProgress.set(gameState.storyProgress || 0);
    links.forEach((link) => link.displayed = link.level <= gameState.level);
  }
}
function resetGame() {
  localStorage.removeItem("gameState");
  $store.level.set(0);
  $store.xp.set(0);
  $store.achievements.set([]);
  $store.credits.set(0);
  $store.mails.set([]);
  $store.storyProgress.set(0);
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
    print(`\uD83C\uDF10 New link unlocked: <a href="${link.url}" target="_blank">${link.name}</a>`, "success");
  });
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
    const creditsGained = Math.floor(Math.random() * 30) + 20;
    print(`Hacking... success! Gained <span class="success">${xpGained}</span> XP, <span class="warning">${creditsGained}</span> Credits.`);
    incrementCell($store.credits, creditsGained);
    addXp(xpGained);
    unlockAchievement("hacker");
    achievementCounters.hackCount++;
    if (achievementCounters.hackCount >= 10)
      unlockAchievement("hacker_pro");
    if (achievementCounters.hackCount >= 50)
      unlockAchievement("elite_hacker");
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
    const creditsGained = Math.floor(Math.random() * 8) + 2;
    print(`Block found! Hash: 0x${Math.random().toString(16).substring(2, 8)}`, "success");
    print(`Reward: <span class="success">${xpGained}</span> XP, <span class="warning">${creditsGained}</span> Credits`);
    incrementCell($store.credits, creditsGained);
    addXp(xpGained);
    achievementCounters.mineCount++;
    unlockAchievement("miner");
    if (achievementCounters.mineCount >= 20)
      unlockAchievement("mining_tycoon");
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
  $store.level.set(0);
  saveGame();
  reloadWithParams([
    "echo 'System was corrupted. Save data destroyed. Starting from a clean state.'"
  ]);
}
// src/game/status.ts
function showStatus() {
  print(`Level: <span class="success">${$store.level.get()}</span>`);
  print(`XP: <span class="success">${$store.xp.get()}/${getXpToNextLevel($store.level.get())}</span>`);
  print(`Credits: <span class="warning">${$store.credits.get()}</span>`);
  print(`XP Multiplier: <span class="dim">${$store.xpMultiplier.get()}x</span>`);
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
  print("System Shell v0.0.7 loaded.");
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
    unlockAchievement("vim_survivor");
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
  unlockAchievement("vim_brave");
}
// src/game/store.ts
var items = [
  {
    id: "cpu_overclock",
    name: "CPU Overclock",
    description: "Increase XP gain multiplier by +0.5x",
    cost: 200,
    buy: () => {
      incrementCell($store.xpMultiplier, 0.5);
      print("Successfully overclocked CPU! XP gain increased.", "success");
    }
  },
  {
    id: "ram_expansion",
    name: "RAM Expansion",
    description: "Increase XP gain multiplier by +1.0x",
    cost: 500,
    buy: () => {
      incrementCell($store.xpMultiplier, 1);
      print("RAM Expansion installed! System running faster.", "success");
    }
  },
  {
    id: "quantum_core",
    name: "Quantum Core",
    description: "Increase XP gain multiplier by +2.0x",
    cost: 1000,
    buy: () => {
      incrementCell($store.xpMultiplier, 2);
      print("Quantum Core online. Processing power limit broken.", "success");
    }
  }
];
function startShop(args = "") {
  if ($store.level.get() < 5) {
    print("Access Denied: Dark Market requires Level 5 security clearance.", "error");
    return;
  }
  const command = args.trim().split(" ");
  if (command[0] === "buy") {
    const itemId = command[1];
    if (!itemId) {
      print("Usage: shop buy <item_id>", "warning");
      return;
    }
    const item = items.find((i) => i.id === itemId);
    if (!item) {
      print(`Item '${itemId}' not found in catalog.`, "error");
      return;
    }
    const credits = $store.credits.get();
    if (credits < item.cost) {
      print(`Insufficient funds. You have <span class="warning">${credits}</span> credits, but item costs <span class="error">${item.cost}</span>.`, "error");
      return;
    }
    decrementCell($store.credits, item.cost);
    item.buy();
    saveGame();
    return;
  }
  print("=== DARK MARKET ===", "success");
  print(`Credits Available: <span class="warning">${$store.credits.get()}</span>`);
  print(`Current XP Multiplier: <span class="success">${$store.xpMultiplier.get()}x</span><br>`);
  print("Available Upgrades:");
  items.forEach((item) => {
    print(`<span class="success">${item.id}</span> - ${item.name}`);
    print(`  ${item.description}`);
    print(`  Cost: <span class="warning">${item.cost}</span> Credits`);
  });
  print("<br>Usage: shop buy <item_id>", "dim");
}
// src/game/story.ts
var cipherMails = [
  {
    id: "welcome_cipher",
    from: "Cipher <unknown@wxn0.xyz>",
    subject: "Welcome to the network",
    body: `Greetings, User.
        
I see you've managed to gain access to the terminal. Impressive for a newcomer.
This system is not what it seems. There are layers here that most never see.

If you want to uncover the truth, start by proving your worth.
Reach Level 2 and I might have something for you.

- Cipher`
  },
  {
    id: "level_2_task",
    from: "Cipher <unknown@wxn0.xyz>",
    subject: "The first test",
    body: `You are learning fast. Good.

I need you to explore the system. Use the 'ls' and 'cd' commands to navigate the filesystem.
There might be some interesting files hidden around.

Also, try the 'hack' command. We need resources for the operations ahead.
Report back when you reach Level 5.

- Cipher`
  },
  {
    id: "level_5_market",
    from: "Cipher <unknown@wxn0.xyz>",
    subject: "The Dark Market",
    body: `Level 5. You are becoming a threat... or an asset.

I've unlocked access to the Dark Market for you.
Use the command 'shop' to access it. You can upgrade your rig there.
You'll need those upgrades if you want to pierce the stronger firewalls ahead.

Keep a low profile.

- Cipher`
  },
  {
    id: "level_10_truth",
    from: "Cipher <unknown@wxn0.xyz>",
    subject: "The Truth",
    body: `Listen carefully.

The "game" you are playing is a simulation. A training ground.
But for what? That's what we are trying to find out.

I am not an AI. I am another user, trapped in a higher layer.
Keep growing stronger. At Level 20, we break out.

- Cipher`
  },
  {
    id: "level_20_ascension",
    from: "Cipher <unknown@wxn0.xyz>",
    subject: "ASCENSION",
    body: `The time has come.

You have mastered this layer. But the ceiling is just a floor for the next level.
To truly ascend, you must look beyond the commands.

Have you found the 'god_mode'? Have you found the answer to '42'?
The system is crumbling.

Prepare yourself.

- Cipher`
  }
];
async function sendMail(mailDef) {
  const mails = $store.mails.get();
  if (mails.find((m) => m.id === mailDef.id))
    return;
  const newMail = {
    ...mailDef,
    timestamp: Date.now(),
    read: false
  };
  $store.mails.set([newMail, ...mails]);
  print("<br>\uD83D\uDCE8 <span class='success'>You have a new message!</span> Type 'mail' to read.<br>", "system");
  saveGame();
}
var storySteps = [
  {
    id: 0,
    trigger: () => true,
    action: () => sendMail(cipherMails[0])
  },
  {
    id: 1,
    trigger: (level) => level >= 2,
    action: () => sendMail(cipherMails[1])
  },
  {
    id: 2,
    trigger: (level) => level >= 5,
    action: () => sendMail(cipherMails[2])
  },
  {
    id: 3,
    trigger: (level) => level >= 10,
    action: () => sendMail(cipherMails[3])
  },
  {
    id: 4,
    trigger: (level) => level >= 20,
    action: () => sendMail(cipherMails[4])
  }
];
function checkStoryProgress() {
  const currentProgress = $store.storyProgress.get();
  const level = $store.level.get();
  const xp = $store.xp.get();
  if (currentProgress < storySteps.length) {
    const step = storySteps[currentProgress];
    if (step.trigger(level, xp)) {
      step.action();
      $store.storyProgress.set(currentProgress + 1);
      saveGame();
    }
  }
}
// src/xp.ts
function addXp(xp) {
  const multiplier = $store.xpMultiplier.get();
  const totalXp = Math.floor(xp * multiplier);
  incrementCell($store.xp, totalXp);
  while (true) {
    const currentLevel = $store.level.get();
    const required = getXpToNextLevel(currentLevel);
    if ($store.xp.get() >= required) {
      decrementCell($store.xp, required);
      incrementCell($store.level, 1);
      const newLevel = $store.level.get();
      print(`⬆️ Level up! You are now level <span class="success">${newLevel}</span>.`, "system");
      print(`Check 'help' for new commands!`, "system");
      checkUnlocks();
      checkLevelAchievements(newLevel);
      checkStoryProgress();
    } else {
      break;
    }
  }
  checkStoryProgress();
  saveGame();
}

// src/achievements.ts
var achievements = [
  { id: "first_steps", name: "First Steps", description: "Run your first command.", xp: 10, order: 1 },
  { id: "status_check", name: "Status Check", description: "Check your status.", xp: 20, order: 2 },
  { id: "hacker", name: "Script Kiddie", description: "Complete your first hack.", xp: 50, order: 3 },
  { id: "link_finder", name: "Link Finder", description: "View available links.", xp: 25, order: 4 },
  { id: "miner", name: "Crypto Miner", description: "Mine for XP successfully.", xp: 40, order: 5, requiredLevel: 1 },
  { id: "time_traveler", name: "Time Traveler", description: "Check the current date and time.", xp: 15, order: 6, requiredLevel: 1 },
  { id: "self_aware", name: "Self Aware", description: "Check who you are.", xp: 15, order: 7, requiredLevel: 1 },
  { id: "explorer", name: "Explorer", description: "List directory contents.", xp: 20, order: 8, requiredLevel: 2 },
  { id: "navigator", name: "Navigator", description: "Change directory 5 times.", xp: 25, order: 9, requiredLevel: 2 },
  { id: "reader", name: "Reader", description: "Read a file with cat.", xp: 20, order: 10, requiredLevel: 2 },
  { id: "snake_player", name: "Snake Charmer", description: "Play Snake.", xp: 30, order: 11, requiredLevel: 3 },
  { id: "snake_master", name: "Snake Master", description: "Score 20+ in Snake.", xp: 100, order: 12, requiredLevel: 3 },
  { id: "vim_brave", name: "Brave Soul", description: "Enter vim (congratulations on your courage or your stupidity).", xp: 25, order: 13, requiredLevel: 3 },
  { id: "vim_survivor", name: "Vim Survivor", description: "Exit vim (congratulations on your persistence).", xp: 50, order: 14, requiredLevel: 3 },
  { id: "pong_player", name: "Pong Rookie", description: "Play Pong.", xp: 30, order: 15, requiredLevel: 4 },
  { id: "pong_winner", name: "Pong Champion", description: "Score 10+ points in Pong.", xp: 100, order: 16, requiredLevel: 4 },
  { id: "coin_flipper", name: "Gambler", description: "Flip a coin 10 times.", xp: 30, order: 17, requiredLevel: 5 },
  { id: "matrix_fan", name: "Matrix Fan", description: "Enter the Matrix.", xp: 25, order: 18, requiredLevel: 5 },
  { id: "hacker_pro", name: "Hacker Pro", description: "Complete 10 successful hacks.", xp: 100, order: 19 },
  { id: "elite_hacker", name: "Elite Hacker", description: "Complete 50 successful hacks.", xp: 250, order: 20 },
  { id: "mining_tycoon", name: "Mining Tycoon", description: "Successfully mine 20 times.", xp: 150, order: 21, requiredLevel: 1 },
  { id: "level_5", name: "Rising Star", description: "Reach level 5.", xp: 50, order: 22 },
  { id: "level_10", name: "Veteran", description: "Reach level 10.", xp: 100, order: 23 },
  { id: "level_20", name: "Master", description: "Reach level 20.", xp: 200, order: 24 },
  { id: "hello_world", name: "Friendly", description: "Say hello to the system.", xp: 15, hidden: true, order: 100 },
  { id: "curious", name: "Polite Hacker", description: "Ask nicely for a sandwich.", xp: 30, hidden: true, order: 102 },
  { id: "god_mode", name: "God Mode", description: "Unlock unlimited power.", xp: 100, hidden: true, order: 103 },
  { id: "escape_artist", name: "Escape Artist", description: "Try to exit 5 times.", xp: 40, hidden: true, order: 104 },
  { id: "destructor", name: "Destructor", description: "Try to delete system files.", xp: 50, hidden: true, order: 105 },
  { id: "echo_chamber", name: "Echo Chamber", description: "Use echo 10 times.", xp: 30, hidden: true, order: 106, requiredLevel: 1 },
  { id: "persistent", name: "Persistent", description: "Try the same failed command 3 times in a row.", xp: 25, hidden: true, order: 107 },
  { id: "clean_freak", name: "Clean Freak", description: "Clear the terminal 10 times.", xp: 35, hidden: true, order: 108 },
  { id: "answer_seeker", name: "Answer Seeker", description: "Discover the answer to everything.", xp: 42, hidden: true, order: 112 },
  { id: "zhiva_user", name: "Zhiva User", description: "Launch Zhiva app.", xp: 40, hidden: true, order: 113, requiredLevel: 3 },
  { id: "completionist", name: "Completionist", description: "Unlock all non-hidden achievements.", xp: 500, hidden: true, order: 200 }
];
var achievementCounters = {
  cdCount: 0,
  hackCount: 0,
  mineCount: 0,
  exitCount: 0,
  echoCount: 0,
  clearCount: 0,
  coinflipCount: 0,
  lastFailedCommand: "",
  failedCommandCount: 0
};
function unlockAchievement(id) {
  const unlocked = $store.achievements.get();
  if (unlocked.includes(id))
    return;
  const achievement = achievements.find((a) => a.id === id);
  if (!achievement)
    return;
  $store.achievements.set([...unlocked, id]);
  addXp(achievement.xp);
  print(`<br>\uD83C\uDFC6 <span class="success">Achievement Unlocked: ${achievement.name}</span>`, "system");
  print(`   ${achievement.description} (+${achievement.xp} XP)<br>`, "dim");
  checkCompletionist();
}
function checkCompletionist() {
  const unlocked = $store.achievements.get();
  const nonHidden = achievements.filter((a) => !a.hidden);
  const allNonHiddenUnlocked = nonHidden.every((a) => unlocked.includes(a.id));
  if (allNonHiddenUnlocked && !unlocked.includes("completionist")) {
    unlockAchievement("completionist");
  }
}
function checkLevelAchievements(level) {
  if (level >= 5)
    unlockAchievement("level_5");
  if (level >= 10)
    unlockAchievement("level_10");
  if (level >= 20)
    unlockAchievement("level_20");
}
function getAchievementProgress() {
  const unlocked = $store.achievements.get();
  const total = achievements.length;
  return `${unlocked.length}/${total}`;
}
function getVisibleAchievements() {
  const unlocked = $store.achievements.get();
  const currentLevel = $store.level.get();
  const sorted = [...achievements].sort((a, b) => a.order - b.order);
  const visible = [];
  let nextCount = 0;
  for (const achievement of sorted) {
    const isUnlocked = unlocked.includes(achievement.id);
    const levelLocked = achievement.requiredLevel !== undefined && currentLevel < achievement.requiredLevel;
    if (isUnlocked) {
      visible.push({ ...achievement, unlocked: true });
    } else if (achievement.hidden) {
      continue;
    } else if (levelLocked) {
      continue;
    } else if (nextCount < 5 && (achievement.requiredLevel === undefined || achievement.requiredLevel <= currentLevel)) {
      visible.push({ ...achievement, unlocked: false });
      nextCount++;
    }
  }
  return visible;
}

// src/commands/info.ts
function cmdStatus() {
  showStatus();
  unlockAchievement("status_check");
}
function cmdAchievements() {
  print(`Available Achievements (${getAchievementProgress()}):`);
  const visible = getVisibleAchievements();
  visible.forEach((a) => {
    if (a.unlocked) {
      print(`[x] <span class="success">${a.name}</span> - ${a.description} (+${a.xp} XP)`, "system");
    } else {
      print(`[ ] ${a.name} - ${a.description} (+${a.xp} XP)`, "dim");
    }
  });
}

// src/commands/social.ts
function cmdLinks() {
  showLinks();
  unlockAchievement("link_finder");
}
function cmdWhoami() {
  print("guest@wxn0.xyz");
  unlockAchievement("self_aware");
}
function cmdDate() {
  print(new Date().toString());
  unlockAchievement("time_traveler");
}
function cmdGithub() {
  window.open("https://github.com/wxn0brP/wxn0.xyz", "_blank");
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

// src/commands/filesystem.ts
function cmdLs(arg) {
  fileSystem.ls(arg);
  unlockAchievement("explorer");
}
function cmdDir() {
  print("Windows sucks.", "error");
}
function cmdCd(arg) {
  fileSystem.cd(arg);
  achievementCounters.cdCount++;
  if (achievementCounters.cdCount >= 5)
    unlockAchievement("navigator");
}
function cmdPwd() {
  print(fileSystem.getCWD());
}
function cmdCat(arg) {
  if (!arg || !isNaN(+arg)) {
    cat(+arg);
    return;
  }
  fileSystem.cat(arg);
  unlockAchievement("reader");
}
function cmdRm() {
  print("Permission denied.", "error");
  unlockAchievement("destructor");
}

// src/commands/fun.ts
function cmdSudo(args, fullArgs) {
  const firstArg = args[0];
  if (firstArg === "cat") {
    fileSystem.cat(args[1], true);
    return;
  }
  if (fullArgs === "make me a sandwich") {
    print("Okay.", "success");
    unlockAchievement("curious");
    return;
  }
  if (firstArg === "rm" && ["-rf", "-fr"].includes(args[1]) && args[2] === "/") {
    systemDestroy();
    return;
  }
  print("nice try, but you have no power here.", "error");
}
function cmdEcho(fullArgs) {
  print(fullArgs || " ");
  achievementCounters.echoCount++;
  if (achievementCounters.echoCount >= 10)
    unlockAchievement("echo_chamber");
}
function cmdMake(args) {
  if (args.join(" ") === "me a sandwich") {
    print("What? Make it yourself.", "system");
  } else {
    print("make: *** No targets specified and no makefile found. Stop.", "error");
  }
}
function cmdMatrix() {
  print("The Matrix has you...", "success");
  unlockAchievement("matrix_fan");
}
function cmdCoinflip() {
  print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
  achievementCounters.coinflipCount++;
  if (achievementCounters.coinflipCount >= 10)
    unlockAchievement("coin_flipper");
}
function cmd42() {
  print("The answer to life, the universe, and everything.", "success");
  unlockAchievement("answer_seeker");
}
function cmdKonami() {
  document.body.classList.toggle("god-mode");
  const isGod = document.body.classList.contains("god-mode");
  const box = document.querySelector(".prompt");
  if (isGod) {
    print("GOD MODE ACTIVATED", "system");
    print("Unlimited power...", "dim");
    unlockAchievement("god_mode");
    if (box) {
      box.textContent = "GOD#";
      box.style.color = "#fff";
    }
  } else {
    print("God mode... disabled due to budget cuts.", "dim");
    if (box) {
      box.textContent = ">";
      box.style.color = "";
    }
  }
}
function cmdHello() {
  print("Hello there!", "system");
  unlockAchievement("hello_world");
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
  let growthRemaining = 0;
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
      growthRemaining += rand(1, 8);
    } else if (!growthRemaining) {
      snake.pop();
    } else {
      growthRemaining--;
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
    if (Math.random() < 0.2) {
      setTimeout(spawnApple, 5000);
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
    if (score >= 20) {
      unlockAchievement("snake_master");
    }
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

// src/game/pong.ts
function startPong() {
  const originalOutputDisplay = output.style.display;
  const inputLine = qs("#input-line");
  const originalInputLineDisplay = inputLine.style.display;
  output.style.display = "none";
  inputLine.style.display = "none";
  input.blur();
  const canvas = document.createElement("canvas");
  canvas.id = "pong-canvas";
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
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
  const PADDLE_WIDTH = 10;
  const PADDLE_HEIGHT = 150;
  const BALL_SIZE = 10;
  const PLAYER_SPEED = 12;
  const AI_SPEED = 8;
  let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
  let ballX = canvas.width / 2;
  let ballY = canvas.height / 2;
  let ballSpeedX = 5;
  let ballSpeedY = 5;
  let playerScore = 0;
  let aiScore = 0;
  let gameLoopId;
  const keys = {
    ArrowUp: false,
    ArrowDown: false
  };
  function handleKeyDown(e) {
    if (e.key === "ArrowUp")
      keys.ArrowUp = true;
    if (e.key === "ArrowDown")
      keys.ArrowDown = true;
    if (e.key === "Escape")
      cleanup();
  }
  function handleKeyUp(e) {
    if (e.key === "ArrowUp")
      keys.ArrowUp = false;
    if (e.key === "ArrowDown")
      keys.ArrowDown = false;
  }
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX = -ballSpeedX;
    ballSpeedY = (Math.random() - 0.5) * 10;
  }
  function update() {
    if (keys.ArrowUp && playerY > 0)
      playerY -= PLAYER_SPEED;
    if (keys.ArrowDown && playerY < canvas.height - PADDLE_HEIGHT)
      playerY += PLAYER_SPEED;
    if (ballSpeedX > 0) {
      const aiCenter = aiY + PADDLE_HEIGHT / 2;
      if (aiCenter < ballY) {
        aiY += AI_SPEED;
      } else if (aiCenter > ballY) {
        aiY -= AI_SPEED;
      }
    }
    aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    if (ballY < 0 || ballY > canvas.height - BALL_SIZE) {
      ballSpeedY = -ballSpeedY;
    }
    if (ballX < PADDLE_WIDTH + 10 && ballX > 10 && ballY + BALL_SIZE > playerY && ballY < playerY + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      const deltaY = ballY - (playerY + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
      if (Math.abs(ballSpeedX) < 15) {
        ballSpeedX *= 1.05;
      }
    }
    if (ballX > canvas.width - PADDLE_WIDTH - 10 - BALL_SIZE && ballX < canvas.width - 10 && ballY + BALL_SIZE > aiY && ballY < aiY + PADDLE_HEIGHT) {
      ballSpeedX = -ballSpeedX;
      const deltaY = ballY - (aiY + PADDLE_HEIGHT / 2);
      ballSpeedY = deltaY * 0.35;
    }
    if (ballX < 0) {
      aiScore++;
      resetBall();
    } else if (ballX > canvas.width) {
      playerScore++;
      addXp(10);
      resetBall();
    }
    draw();
  }
  function draw() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#444";
    ctx.setLineDash([10, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "#fff";
    ctx.fillRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(canvas.width - PADDLE_WIDTH - 10, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);
    ctx.font = "40px monospace";
    ctx.fillText(playerScore.toString(), canvas.width / 4, 50);
    ctx.fillText(aiScore.toString(), canvas.width * 3 / 4, 50);
    ctx.font = "16px monospace";
    const msg = "Arrow Up/Down to move | Esc to exit";
    const metrics = ctx.measureText(msg);
    ctx.fillText(msg, canvas.width / 2 - metrics.width / 2, canvas.height - 20);
  }
  function loop() {
    update();
    gameLoopId = requestAnimationFrame(loop);
  }
  function cleanup() {
    cancelAnimationFrame(gameLoopId);
    window.removeEventListener("keydown", handleKeyDown);
    window.removeEventListener("keyup", handleKeyUp);
    window.removeEventListener("resize", resizeCanvas);
    if (canvas && canvas.parentNode)
      canvas.parentNode.removeChild(canvas);
    output.style.display = originalOutputDisplay;
    inputLine.style.display = originalInputLineDisplay;
    input.focus();
    print(`Game Over! Player: ${playerScore} | AI: ${aiScore}`);
    const xp = playerScore * 5 - aiScore;
    addXp(xp);
    if (playerScore >= 10) {
      unlockAchievement("pong_winner");
    }
  }
  gameLoopId = requestAnimationFrame(loop);
}

// src/commands/games.ts
function cmdHack() {
  startHack();
}
function cmdMine() {
  startMining();
}
function cmdShop(args) {
  startShop(args);
}
function cmdVim() {
  openVim();
}
function cmdSnake() {
  startSnake();
  unlockAchievement("snake_player");
}
function cmdPong() {
  startPong();
  unlockAchievement("pong_player");
}
function cmdZhiva(arg) {
  if (!arg) {
    print("Usage: zhiva [name]", "error");
    return;
  }
  let target = arg;
  if (!target.includes("/"))
    target = `wxn0brP/${target}`;
  unlockAchievement("zhiva_user");
  location.href = `zhiva://start/${target}`;
}

// src/commands/system.ts
function cmdClear() {
  clear();
  achievementCounters.clearCount++;
  if (achievementCounters.clearCount >= 10)
    unlockAchievement("clean_freak");
}
function cmdReset() {
  resetGame();
}
function cmdWelcome() {
  welcome();
}
function cmdExit() {
  print("There is no escape.", "error");
  achievementCounters.exitCount++;
  if (achievementCounters.exitCount >= 5)
    unlockAchievement("escape_artist");
}
function cmdSuglite() {
  print("Suglite is watching...", "system");
}
function cmdReturn() {
  localStorage.setItem("notHappened", "true");
  location.reload();
}
function cmdRun() {
  localStorage.removeItem("run");
  location.reload();
}

// src/commands/developer.ts
function cmdXp(arg) {
  if (!isNaN(+arg)) {
    addXp(+arg);
    print("Gained " + arg + " XP! Cheater :/", "success");
  }
}
function cmdSetAchievement(id) {
  if (id) {
    unlockAchievement(id);
  }
}

// src/commands/story.ts
function cmdMail(args) {
  const mails = $store.mails.get();
  if (args.length === 0) {
    print("=== INBOX ===", "success");
    if (mails.length === 0) {
      print("No messages.", "dim");
      return;
    }
    mails.forEach((mail, index) => {
      const status2 = mail.read ? " " : "*";
      const date = new Date(mail.timestamp).toLocaleDateString();
      print(`[${index + 1}] ${status2} ${mail.from}: ${mail.subject} <span class="dim">(${date})</span>`);
    });
    print("<br>Usage: mail read <number>", "dim");
    return;
  }
  if (args[0] === "read") {
    const index = parseInt(args[1]) - 1;
    if (isNaN(index) || index < 0 || index >= mails.length) {
      print("Invalid message number.", "error");
      return;
    }
    const mail = mails[index];
    print("----------------------------------------", "dim");
    print(`From: <span class="success">${mail.from}</span>`);
    print(`Subject: ${mail.subject}`);
    print(`Date: ${new Date(mail.timestamp).toLocaleString()}`);
    print("----------------------------------------", "dim");
    print(mail.body.replace(/\n/g, "<br>"));
    print("----------------------------------------", "dim");
    if (!mail.read) {
      const newMails = [...mails];
      newMails[index] = { ...mail, read: true };
      $store.mails.set(newMails);
      saveGame();
    }
    return;
  }
  print("Usage: mail [read <number>]", "error");
}

// src/commands/index.ts
var registry = {
  help: { fn: () => cmdHelp() },
  status: { fn: () => cmdStatus() },
  achievements: { aliases: ["a"], fn: () => cmdAchievements() },
  links: { fn: () => cmdLinks() },
  whoami: { fn: () => cmdWhoami() },
  date: { fn: () => cmdDate() },
  github: { aliases: ["git", "source"], fn: () => cmdGithub() },
  hello: { aliases: ["hi"], fn: () => cmdHello() },
  ls: { aliases: ["ll"], fn: ({ args }) => cmdLs(args[0]) },
  dir: { fn: () => cmdDir() },
  cd: { fn: ({ args }) => cmdCd(args[0]) },
  pwd: { fn: () => cmdPwd() },
  cat: { fn: ({ args }) => cmdCat(args[0]) },
  rm: { fn: () => cmdRm() },
  hack: { fn: () => cmdHack() },
  mine: { fn: () => cmdMine() },
  shop: { aliases: ["store"], fn: ({ fullArgs }) => cmdShop(fullArgs) },
  vim: { aliases: ["vi"], fn: () => cmdVim() },
  snake: { fn: () => cmdSnake() },
  pong: { aliases: ["ping"], fn: () => cmdPong() },
  zhiva: { fn: ({ args }) => cmdZhiva(args[0]) },
  clear: { fn: () => cmdClear() },
  reset: { fn: () => cmdReset() },
  welcome: { fn: () => cmdWelcome() },
  exit: { fn: () => cmdExit() },
  return: { fn: () => cmdReturn() },
  run: { fn: () => cmdRun() },
  suglite: { fn: () => cmdSuglite() },
  mail: { aliases: ["inbox", "email"], fn: ({ args }) => cmdMail(args) },
  sudo: { fn: ({ args, fullArgs }) => cmdSudo(args, fullArgs) },
  echo: { fn: ({ fullArgs }) => cmdEcho(fullArgs) },
  make: { fn: ({ args }) => cmdMake(args) },
  matrix: { fn: () => cmdMatrix() },
  coinflip: { fn: () => cmdCoinflip() },
  42: { fn: () => cmd42() },
  konami: { fn: () => cmdKonami() },
  xp: { fn: ({ args }) => cmdXp(args[0]) },
  "set-achievement": { fn: ({ args }) => cmdSetAchievement(args[0]) }
};
var commandsList = Object.keys(registry).flatMap((key) => {
  const aliases = registry[key].aliases || [];
  return [key, ...aliases];
});
function handleCommand(command) {
  if (!command.trim()) {
    return;
  }
  printCommand(command);
  unlockAchievement("first_steps");
  if (hackingMission.active) {
    tryHack(command);
    return;
  }
  const [cmdName, ...args] = command.split(" ");
  const fullArgs = command.substring(cmdName.length + 1);
  const lowerCmd = cmdName.toLowerCase();
  print("$ " + command);
  let commandDef;
  if (registry[lowerCmd]) {
    commandDef = registry[lowerCmd];
  } else {
    for (const key in registry) {
      if (registry[key].aliases?.includes(lowerCmd)) {
        commandDef = registry[key];
        break;
      }
    }
  }
  if (commandDef) {
    commandDef.fn({ args, fullArgs, command });
  } else {
    if (achievementCounters.lastFailedCommand === command) {
      achievementCounters.failedCommandCount++;
      if (achievementCounters.failedCommandCount >= 3) {
        unlockAchievement("persistent");
      }
    } else {
      achievementCounters.lastFailedCommand = command;
      achievementCounters.failedCommandCount = 1;
    }
    print(`Command not found: <span class="error">${command}</span>`, "error");
  }
}

// src/index.ts
var commandHistory = [];
var historyIndex = -1;
var moveCursorToEnd = debounce(() => {
  input.setSelectionRange(input.value.length, input.value.length);
}, 50);
function calculateInputWidth() {
  const width = input.value.length * 10 + 200;
  return Math.min(width, window.innerWidth - 20);
}
setTimeout(() => {
  input.style.width = calculateInputWidth() + "px";
}, 20);
input.addEventListener("input", () => {
  input.style.width = calculateInputWidth() + "px";
});
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
  } else if (e.ctrlKey && e.key === "l") {
    clear();
    e.preventDefault();
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
setInterval(() => {
  if (Math.random() > 0.2)
    return;
  terminal.classList.add("glitch");
  setTimeout(() => {
    terminal.classList.remove("glitch");
  }, rand(100, 1300));
}, 20000);
var cursorTimeout;
window.addEventListener("mousemove", () => {
  document.body.style.cursor = "";
  window.clearTimeout(cursorTimeout);
  cursorTimeout = window.setTimeout(() => {
    document.body.style.cursor = "none";
  }, 1000);
});
document.body.style.cursor = "none";
