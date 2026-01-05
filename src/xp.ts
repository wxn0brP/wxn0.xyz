import { decrementCell, incrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { $store, getXpToNextLevel } from "./vars";
import { checkUnlocks } from "./game";
import { saveGame } from "./save";
import { print } from "./ui";
import { checkLevelAchievements } from "./achievements";

export function addXp(xp: number) {
    incrementCell($store.xp, xp);

    while (true) {
        const currentLevel = $store.level.get();
        const required = getXpToNextLevel(currentLevel);

        if ($store.xp.get() >= required) {
            decrementCell($store.xp, required);
            incrementCell($store.level, 1);

            const newLevel = $store.level.get();
            print(`Level up! You are now level <span class="success">${newLevel}</span>.`, "system");
            print(`Check 'help' for new commands!`, "system");
            checkUnlocks();
            checkLevelAchievements(newLevel);
        } else {
            break;
        }
    }
    saveGame();
}