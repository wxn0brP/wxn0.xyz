import { createStore } from "@wxn0brp/flanker-ui";

export const links = [
    { level: 1, name: "Homepage/Developer Website", url: "https://wxn0brp.github.io", displayed: false },
    { level: 2, name: "GitHub Profile", url: "https://github.com/wxn0brP", displayed: false },
    { level: 3, name: "ValtheraDB", url: "https://github.com/wxn0brP/ValtheraDB", displayed: false },
    { level: 4, name: "VQL", url: "https://github.com/wxn0brP/VQL", displayed: false },
];

export const $store = createStore({
    xp: 0,
    level: 0,
    achievements: [] as string[],
    credits: 0,
    xpMultiplier: 1,
});

export function getXpToNextLevel(level: number) {
    return 100 + (level * 50);
}

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