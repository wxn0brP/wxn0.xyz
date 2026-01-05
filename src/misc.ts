import { rand } from "@wxn0brp/flanker-ui/utils";
import { startMatrixEffect, stopMatrixEffect } from "./matrix";
import { print, terminal } from "./ui";
import { $store } from "./vars";

setInterval(() => {
    if (Math.random() > 0.2) return;
    terminal.classList.add("glitch");
    setTimeout(() => {
        terminal.classList.remove("glitch");
    }, rand(100, 1_300));
}, 20_000);

let cursorTimeout: number;
let idleTimeout: number;
const IDLE_TIME = 20_000;
let isIdle = false;

function resetIdleTimer() {
    if (isIdle) {
        stopMatrixEffect();
        isIdle = false;
        print("User motion detected. Matrix simulation suspended.", "dim");
        document.title = originalTitle;
    }

    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(() => {
        if ($store.busy.get()) return;
        print("User idle. Engaging Matrix simulation...", "warning");
        isIdle = true;
        startMatrixEffect(0);
        document.title = "You are being watched...";
    }, IDLE_TIME);
}

const originalTitle = document.title;

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        document.title = "Signal Lost...";
    } else {
        document.title = originalTitle;
        resetIdleTimer();
    }
});

["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(event => {
    window.addEventListener(event, resetIdleTimer);
});

window.addEventListener("mousemove", () => {
    document.body.style.cursor = "";
    window.clearTimeout(cursorTimeout);
    cursorTimeout = window.setTimeout(() => {
        document.body.style.cursor = "none";
    }, 1000);
});
document.body.style.cursor = "none";
resetIdleTimer();