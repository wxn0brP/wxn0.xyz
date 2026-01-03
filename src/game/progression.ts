import { $store, links } from "../vars";
import { print } from "../ui";
import { saveGame } from "../save";

export function checkUnlocks() {
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
