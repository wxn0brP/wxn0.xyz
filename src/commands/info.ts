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

export function cmdStats() {
    const statsRaw = localStorage.getItem("stats") || "{}";
    const stats: Record<string, number> = JSON.parse(statsRaw);
    print("Stats:", "system");
    const sorted = Object.entries(stats).sort((a, b) => b[1] - a[1]);
    for (const [cmd, count] of sorted) {
        print(`${cmd}: ${count}`, "dim");
    }
    unlockAchievement("stats_check");
}

export function incrementStats(cmd: string) {
    const statsRaw = localStorage.getItem("stats") || "{}";
    const stats = JSON.parse(statsRaw);
    stats[cmd] = (stats[cmd] || 0) + 1;
    localStorage.setItem("stats", JSON.stringify(stats));
}