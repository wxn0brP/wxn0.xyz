import { print } from "./ui";
import { $store, links } from "./vars";

export function saveGame() {
    const gameState = {
        xp: $store.xp.get(),
        level: $store.level.get(),
    };
    localStorage.setItem("gameState", JSON.stringify(gameState));
}

export function loadGame() {
    const savedState = localStorage.getItem("gameState");
    if (savedState) {
        const gameState = JSON.parse(savedState);
        $store.xp.set(gameState.xp);
        $store.level.set(gameState.level);
        links.forEach(link => link.displayed = link.level <= gameState.level);
    }
}

export function resetGame() {
    localStorage.removeItem("gameState");
    $store.level.set(0);
    $store.xp.set(0);
    links.forEach(link => link.displayed = false);
    print("Game progress has been reset.", "system");
}