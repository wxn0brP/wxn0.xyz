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

function checkUnlocks() {
    links.forEach(link => {
        if (!link.unlocked && level >= link.level) {
            link.unlocked = true;
            print(`New link unlocked: <a href="${link.url}" target="_blank">${link.name}</a>`, "success");
        }
    });
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