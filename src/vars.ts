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
    mails: [] as Mail[],
    storyProgress: 0,
    busy: false,
});

export interface Mail {
    id: string;
    from: string;
    subject: string;
    body: string;
    read: boolean;
    timestamp: number;
}

export function getXpToNextLevel(level: number) {
    return 100 + (level * 50);
}