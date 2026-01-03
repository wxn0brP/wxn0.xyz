import { decrementCell, incrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { loadGame, saveGame } from "./save";
import { input, print } from "./ui";
import { $store, hackingMission, links, targets, vulnerabilities, xpToNextLevel } from "./vars";
import { delay } from "@wxn0brp/flanker-ui/utils";

function checkUnlocks() {
    const level = $store.level.get();
    links.forEach(link => {
        if (link.displayed) return;

        const wasUnlocked = level >= link.level;
        if (!wasUnlocked) return;

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

export function tryHack(input: string) {
    if (!hackingMission.active)
        return;

    print("$ " + input, "executed");

    if (input.toLowerCase() === hackingMission.command) {
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

export async function startHack() {
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
    }, 10000) as any;
}

export function showStatus() {
    print(`Level: <span class="success">${$store.level.get()}</span>`);
    print(`XP: <span class="success">${$store.xp.get()}/${xpToNextLevel}</span>`);
}

export function showLinks() {
    print("Unlocked links:");
    const level = $store.level.get();
    const unlockedLinks = links.filter(l => l.level <= level);

    if (unlockedLinks.length === 0) {
        print("  No links unlocked yet. Keep hacking!", "dim");
    } else {
        unlockedLinks.forEach(l => {
            print(`  <a href="${l.url}" target="_blank">${l.name}</a> - Level ${l.level}`);
        });
    }
}

export async function welcome() {
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
    print("System Shell v0.0.6 loaded.")
    print("----------------------------------------", "dim");
    await delay(300);
    print("Type '<span class='success'>help</span>' to list available commands.");
    input.disabled = false;
}

let isBusy = false;

export async function startMining() {
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
        incrementCell($store.xp, xpGained);
        print(`Block found! Hash: 0x${Math.random().toString(16).substring(2, 8)}`, "success");
        print(`Reward: <span class="success">${xpGained}</span> XP`);

        if ($store.xp.get() >= xpToNextLevel) {
            incrementCell($store.level, 1);
            decrementCell($store.xp, xpToNextLevel);
            print(`Level up! You are now level <span class="success">${$store.level.get()}</span>.`, "system");
            checkUnlocks();
        }
        saveGame();
    } else {
        print("Mining failed. Invalid share.", "error");
    }

    input.disabled = false;
    isBusy = false;
    input.focus();
}

export async function systemDestroy() {
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

    const statusEl = document.getElementById("bsod-status")!;
    for (let i = 0; i < funnyMessages.length; i++) {
        await delay(800 + Math.random() * 1000);
        statusEl.textContent = `${Math.floor((i / funnyMessages.length) * 100)}% complete - ${funnyMessages[i]}`;
    }

    await delay(1000);
    statusEl.textContent = "100% complete - Restarting...";
    await delay(5000);
    location.reload();
}

loadGame();