import { print } from "../ui";
import { unlockAchievement } from "../achievements";
import { startHack, startMining, startShop, openVim } from "../game";
import { startSnake } from "../game/snake";
import { startPong } from "../game/pong";

export function cmdHack() {
    startHack();
}

export function cmdMine() {
    startMining();
}

export function cmdShop(args: string) {
    startShop(args);
}

export function cmdVim() {
    openVim();
}

export function cmdSnake() {
    startSnake();
    unlockAchievement("snake_player");
}

export function cmdPong() {
    startPong();
    unlockAchievement("pong_player");
}

export function cmdZhiva(arg: string) {
    if (!arg) {
        print("Usage: zhiva [name]", "error");
        return;
    }
    let target = arg;
    if (!target.includes("/")) target = `wxn0brP/${target}`;

    unlockAchievement("zhiva_user");
    location.href = `zhiva://start/${target}`;
}
