import { unlockAchievement } from "../achievements";
import { startPong } from "../game/pong";
import { startSnake } from "../game/snake";
import { print } from "../ui";

export function cmdSnake() {
    startSnake();
    unlockAchievement("snake_player");
}

export function cmdPong() {
    startPong();
    unlockAchievement("pong_player");
}

export function cmdZhiva(...args: string[]) {
    if (!args[0]) {
        print("Usage: zhiva [name]", "error");
        return;
    }
    let target = args[0];
    if (target === "start" || target === "r" || target === "run") {
        if (args[1]) target = args[1];
        else {
            print("Usage: zhiva [name]", "error");
            return;
        }
    }
    if (!target.includes("/")) target = `wxn0brP/${target}`;

    unlockAchievement("zhiva_user");
    location.href = `zhiva://start/${target}`;
}
