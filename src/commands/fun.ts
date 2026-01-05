import { print } from "../ui";
import { unlockAchievement, achievementCounters } from "../achievements";
import { fileSystem } from "../filesystem";
import { systemDestroy } from "../game";

export function cmdSudo(args: string[], fullArgs: string) {
    const firstArg = args[0];

    if (firstArg === "cat") {
        fileSystem.cat(args[1], true);
        return;
    }
    if (fullArgs === "make me a sandwich") {
        print("Okay.", "success");
        unlockAchievement("curious");
        return;
    }
    if (firstArg === "rm" && ["-rf", "-fr"].includes(args[1]) && args[2] === "/") {
        systemDestroy();
        return;
    }
    print("nice try, but you have no power here.", "error");
}

export function cmdEcho(fullArgs: string) {
    print(fullArgs || " ");
    achievementCounters.echoCount++;
    if (achievementCounters.echoCount >= 10) unlockAchievement("echo_chamber");
}

export function cmdMake(args: string[]) {
    if (args.join(" ") === "me a sandwich") {
        print("What? Make it yourself.", "system");
    } else {
        print("make: *** No targets specified and no makefile found. Stop.", "error");
    }
}

export function cmdMatrix() {
    print("The Matrix has you...", "success");
    unlockAchievement("matrix_fan");
}

export function cmdCoinflip() {
    print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
    achievementCounters.coinflipCount++;
    if (achievementCounters.coinflipCount >= 10) unlockAchievement("coin_flipper");
}

export function cmd42() {
    print("The answer to life, the universe, and everything.", "success");
    unlockAchievement("answer_seeker");
}

export function cmdKonami() {
    document.body.classList.toggle("god-mode");
    const isGod = document.body.classList.contains("god-mode");
    const box = document.querySelector(".prompt") as HTMLElement;

    if (isGod) {
        print("GOD MODE ACTIVATED", "system");
        print("Unlimited power...", "dim");
        unlockAchievement("god_mode");
        if (box) {
            box.textContent = "GOD#";
            box.style.color = "#fff";
        }
    } else {
        print("God mode... disabled due to budget cuts.", "dim");
        if (box) {
            box.textContent = ">";
            box.style.color = "";
        }
    }
}

export function cmdHello() {
    print("Hello there!", "system");
    unlockAchievement("hello_world");
}
