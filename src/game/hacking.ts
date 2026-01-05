import { incrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { delay } from "@wxn0brp/flanker-ui/utils";
import { achievementCounters, unlockAchievement } from "../achievements";
import { print } from "../ui";
import { $store } from "../vars";
import { addXp } from "../xp";

export const targets = [
    "corporate-mainframe-j7",
    "government-server-omega",
    "bank-of-world-main",
    "crypto-exchange-alpha",
    "research-lab-gamma",
];

export const vulnerabilities = [
    { name: "buffer overflow", command: "exploit buffer_overflow" },
    { name: "SQL injection", command: "exploit sql_injection" },
    { name: "cross-site scripting", command: "exploit xss" },
    { name: "rootkit", command: "install rootkit" },
    { name: "zero-day", command: "deploy zero_day" },
    { name: "malware", command: "install malware" },
    { name: "System32", command: "remove System32" },
    { name: "kernel panic", command: "crash kernel" },
    { name: "blue screen of death", command: "crash blue_screen" },
    { name: "virus", command: "reinstall virus" },
    { name: "worm", command: "feed worm" },
];

export interface HackingMission {
    active: boolean;
    target: string | null;
    vulnerability: string | null;
    command: string | null;
    timer?: number;
}

export let hackingMission: HackingMission = {
    active: false,
    target: null,
    vulnerability: null,
    command: null,
};

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
        const creditsGained = Math.floor(Math.random() * 30) + 20; // 20-50 Credits

        print(`Hacking... success! Gained <span class="success">${xpGained}</span> XP, <span class="warning">${creditsGained}</span> Credits.`);
        incrementCell($store.credits, creditsGained);
        addXp(xpGained);

        unlockAchievement("hacker");
        achievementCounters.hackCount++;
        if (achievementCounters.hackCount >= 10) unlockAchievement("hacker_pro");
        if (achievementCounters.hackCount >= 50) unlockAchievement("elite_hacker");
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
