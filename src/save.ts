import { print } from "./ui";
import { $store, links } from "./vars";

export function saveGame() {
    const gameState = {
        xp: $store.xp.get(),
        level: $store.level.get(),
        achievements: $store.achievements.get(),
        credits: $store.credits.get(),
        xpMultiplier: $store.xpMultiplier.get(),
        mails: $store.mails.get(),
        storyProgress: $store.storyProgress.get(),
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
}

export function loadGame() {
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
        links.forEach(link => link.displayed = link.level <= gameState.level);
    }
}

export function resetGame() {
    localStorage.removeItem("gameState");
    $store.level.set(0);
    $store.xp.set(0);
    $store.achievements.set([]);
    $store.credits.set(0);
    $store.mails.set([]);
    $store.storyProgress.set(0);
    links.forEach(link => link.displayed = false);
    localStorage.removeItem("stats");
    print("Game progress has been reset.", "system");
}