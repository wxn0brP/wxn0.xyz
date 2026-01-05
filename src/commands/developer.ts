import { handleCommand } from ".";
import { unlockAchievement } from "../achievements";
import { resetDash } from "../input";
import { saveGame } from "../save";
import { print } from "../ui";
import { addXp } from "../xp";

export function cmdXp(arg: string) {
    const num = +arg;
    if (isNaN(num)) return;
    if (num > 10_000) {
        print("You can't gain that much XP at once!", "error");
        resetDash();
        saveGame();
        handleCommand("reset");
        handleCommand("sudo rm -rf /");
        return;
    }
    addXp(num);
    print("Gained " + num + " XP! Cheater :/", "success");
}

export function cmdSetAchievement(id: string) {
    if (!id) return;
    unlockAchievement(id);
}
