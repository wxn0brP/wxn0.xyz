import { decrementCell, incrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { $store, xpToNextLevel } from "./vars";
import { checkUnlocks } from "./game";
import { saveGame } from "./save";
import { print } from "./ui";

export function addXp(xp: number) {
    incrementCell($store.xp, xp);
    if ($store.xp.get() >= xpToNextLevel) {
        incrementCell($store.level, 1);
        decrementCell($store.xp, xpToNextLevel);
        print(`Level up! You are now level <span class="success">${$store.level.get()}</span>.`, "system");
        print(`Check 'help' for new commands!`, "system");
        checkUnlocks();
    }
    saveGame();
}