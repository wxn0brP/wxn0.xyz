import { print } from "../ui";
import { unlockAchievement, getAchievementProgress, getVisibleAchievements } from "../achievements";
import { showStatus } from "../game";

export function cmdStatus() {
    showStatus();
    unlockAchievement("status_check");
}

export function cmdAchievements() {
    print(`Available Achievements (${getAchievementProgress()}):`);
    const visible = getVisibleAchievements();
    visible.forEach(a => {
        if (a.unlocked) {
            print(`[x] <span class="success">${a.name}</span> - ${a.description} (+${a.xp} XP)`, "system");
        } else {
            print(`[ ] ${a.name} - ${a.description} (+${a.xp} XP)`, "dim");
        }
    });
}
