import { delay } from "@wxn0brp/flanker-ui/utils";
import { input, print } from "../ui";
import { hackingMission } from "../vars";
import { addXp } from "../xp";
import { achievementCounters, unlockAchievement } from "../achievements";

let isBusy = false;

export async function startMining() {
    if (isBusy || hackingMission.active) {
        print("System is busy.", "error");
        return;
    }
    isBusy = true;
    input.disabled = true;

    print("Initiating crypto-mining sequence...", "system");
    await delay(1000);
    print("Allocating resources... [CPU: 100%]", "dim");
    await delay(1500);
    print("Hashing block...", "dim");
    await delay(2000);

    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
        const xpGained = Math.floor(Math.random() * 15) + 5; // 5-20 XP
        print(`Block found! Hash: 0x${Math.random().toString(16).substring(2, 8)}`, "success");
        print(`Reward: <span class="success">${xpGained}</span> XP`);
        addXp(xpGained);

        achievementCounters.mineCount++;
        unlockAchievement("miner");
        if (achievementCounters.mineCount >= 20) unlockAchievement("mining_tycoon");
    } else {
        print("Mining failed. Invalid share.", "error");
    }

    input.disabled = false;
    isBusy = false;
    input.focus();
}
