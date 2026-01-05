import { input, print } from "../ui";
import { unlockAchievement, achievementCounters } from "../achievements";
import { fileSystem } from "../filesystem";
import { cat as catGame } from "../game/cat";

export function cmdLs(arg: string) {
    fileSystem.ls(arg);
    unlockAchievement("explorer");
}

export function cmdDir() {
    print("Windows sucks.", "error");
}

export function cmdCd(arg: string) {
    fileSystem.cd(arg);
    qs(".prompt").innerHTML = fileSystem.getCWD() + " $ ";
    achievementCounters.cdCount++;
    if (achievementCounters.cdCount >= 5) unlockAchievement("navigator");
}

export function cmdPwd() {
    print(fileSystem.getCWD());
}

export function cmdCat(arg: string) {
    if (!arg || !isNaN(+arg)) {
        catGame(+arg);
        return;
    }
    fileSystem.cat(arg);
    unlockAchievement("reader");
}

export function cmdRm() {
    print("Permission denied.", "error");
    unlockAchievement("destructor");
}
