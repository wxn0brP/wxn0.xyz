import { print } from "../ui";
import { unlockAchievement } from "../achievements";
import { addXp } from "../xp";

export function cmdXp(arg: string) {
    if (!isNaN(+arg)) {
        addXp(+arg);
        print("Gained " + arg + " XP! Cheater :/", "success");
    }
}

export function cmdSetAchievement(id: string) {
    if (id) {
        unlockAchievement(id);
    }
}
