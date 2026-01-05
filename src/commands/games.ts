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
