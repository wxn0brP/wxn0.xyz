import { $store, links, getXpToNextLevel } from "../vars";
import { print } from "../ui";

export function showStatus() {
    print(`Level: <span class="success">${$store.level.get()}</span>`);
    print(`XP: <span class="success">${$store.xp.get()}/${getXpToNextLevel($store.level.get())}</span>`);
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
