import { $store, hackingMission, xpToNextLevel } from "../vars";
import { input, print } from "../ui";
import { saveGame } from "../save";
import { decrementCell, incrementCell } from "@wxn0brp/flanker-ui/storeUtils";
import { delay } from "@wxn0brp/flanker-ui/utils";
import { checkUnlocks } from "./progression";

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
        incrementCell($store.xp, xpGained);
        print(`Block found! Hash: 0x${Math.random().toString(16).substring(2, 8)}`, "success");
        print(`Reward: <span class="success">${xpGained}</span> XP`);

        if ($store.xp.get() >= xpToNextLevel) {
            incrementCell($store.level, 1);
            decrementCell($store.xp, xpToNextLevel);
            print(`Level up! You are now level <span class="success">${$store.level.get()}</span>.`, "system");
            checkUnlocks();
        }
        saveGame();
    } else {
        print("Mining failed. Invalid share.", "error");
    }

    input.disabled = false;
    isBusy = false;
    input.focus();
}
