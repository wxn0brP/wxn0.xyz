import { print } from "./ui";

export let level = 0;
export let xp = 0;
export const xpToNextLevel = 100;

export const links = [
    { level: 1, name: "Homepage/Blog", url: "https://wxn0brp.github.io", unlocked: false },
    { level: 2, name: "GitHub Profile", url: "https://github.com/wxn0brP", unlocked: false },
    { level: 3, name: "ValtheraDB", url: "https://github.com/wxn0brP/ValtheraDB", unlocked: false },
    { level: 4, name: "VQL", url: "https://github.com/wxn0brP/VQL", unlocked: false },
];

function saveGame() {
    const gameState = {
        level,
        xp,
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
}

function loadGame() {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        const gameState = JSON.parse(savedState);
        level = gameState.level;
        xp = gameState.xp;
    }
    checkUnlocks(true);
}

export function resetGame() {
    localStorage.removeItem("gameState");
    level = 0;
    xp = 0;
    links.forEach(link => {
        link.unlocked = false;
    });
    print("Game progress has been reset.", "system");
}

function checkUnlocks(silent = false) {
    links.forEach(link => {
        const wasUnlocked = link.unlocked;
        link.unlocked = level >= link.level
        if (!wasUnlocked && link.unlocked && !silent) {
            print(`New link unlocked: <a href="${link.url}" target="_blank">${link.name}</a>`, "success");
        }
    });
    saveGame();
}

export function hack() {
    const xpGained = Math.floor(Math.random() * 30) + 10;
    xp += xpGained;
    print(`Hacking... success! Gained <span class="success">${xpGained}</span> XP.`);
    if (xp >= xpToNextLevel) {
        level++;
        xp -= xpToNextLevel;
        print(`Level up! You are now level <span class="success">${level}</span>.`, "system");
        checkUnlocks();
    }
    saveGame();
}

export function showStatus() {
    print(`Level: <span class="success">${level}</span>`);
    print(`XP: <span class="success">${xp}/${xpToNextLevel}</span>`);
}

export function showLinks() {
    print("Unlocked links:");
    const unlockedLinks = links.filter(l => l.unlocked);
    if (unlockedLinks.length === 0) {
        print("  No links unlocked yet. Keep hacking!", "dim");
    } else {
        unlockedLinks.forEach(l => {
            print(`  <a href="${l.url}" target="_blank">${l.name}</a> - Level ${l.level}`);
        });
    }
}

export function welcome() {
    print("Welcome to <span class='system'>wxn0.xyz</span>", "system");
    print("This is a mini-game to discover the ecosystem.");
    print("Type 'help' to see available commands.");
}

loadGame();