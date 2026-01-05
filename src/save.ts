import { print } from "./ui";
import { $store, links } from "./vars";

export function saveGame() {
    const gameState = {
        xp: $store.xp.get(),
        level: $store.level.get(),
        achievements: $store.achievements.get(),
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
}

export function loadGame() {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        const gameState = JSON.parse(savedState);
        $store.xp.set(gameState.xp);
        $store.level.set(gameState.level);
        if (gameState.achievements) {
            $store.achievements.set(gameState.achievements);
        }
        links.forEach(link => link.displayed = link.level <= gameState.level);
    }
}

export function resetGame() {
    localStorage.removeItem("gameState");
    $store.level.set(0);
    $store.level.set(0);
    $store.xp.set(0);
    $store.achievements.set([]);
    links.forEach(link => link.displayed = false);
    print("Game progress has been reset.", "system");
}