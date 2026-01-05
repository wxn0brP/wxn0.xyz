import { print, clear as uiClear } from "../ui";
import { unlockAchievement, achievementCounters } from "../achievements";
import { resetGame } from "../save";
import { welcome as gameWelcome } from "../game";

export function cmdClear() {
    uiClear();
    achievementCounters.clearCount++;
    if (achievementCounters.clearCount >= 10) unlockAchievement("clean_freak");
}

export function cmdReset() {
    resetGame();
}

export function cmdWelcome() {
    gameWelcome();
}

export function cmdExit() {
    print("There is no escape.", "error");
    achievementCounters.exitCount++;
    if (achievementCounters.exitCount >= 5) unlockAchievement("escape_artist");
}

export function cmdSuglite() {
    print("Suglite is watching...", "system");
}

export function cmdReturn() {
    localStorage.setItem("notHappened", "true");
    location.reload();
}

export function cmdRun() {
    localStorage.removeItem("run");
    location.reload();
}
