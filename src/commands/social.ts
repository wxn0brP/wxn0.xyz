import { print } from "../ui";
import { unlockAchievement } from "../achievements";
import { showLinks } from "../game";

export function cmdLinks() {
    showLinks();
    unlockAchievement("link_finder");
}

export function cmdWhoami() {
    print("guest@wxn0.xyz");
    unlockAchievement("self_aware");
}

export function cmdDate() {
    print(new Date().toString());
    unlockAchievement("time_traveler");
}

export function cmdGithub() {
    window.open("https://github.com/wxn0brP/wxn0.xyz", "_blank");
}
