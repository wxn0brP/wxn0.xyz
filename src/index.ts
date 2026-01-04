import "@wxn0brp/flanker-ui/html";
import { debounce, rand } from "@wxn0brp/flanker-ui/utils";
import { commandsList, handleCommand } from "./commands";
import { welcome } from "./game";
import { loadGame } from "./save";
import { startParams } from "./start";
import { clear, input, terminal } from "./ui";

const commandHistory: string[] = [];
let historyIndex = -1;

const moveCursorToEnd = debounce(() => {
    input.setSelectionRange(input.value.length, input.value.length);
}, 50);

function calculateInputWidth() {
    const width = input.value.length * 10 + 200;
    return Math.min(width, window.innerWidth - 20);
}
setTimeout(() => {
    input.style.width = calculateInputWidth() + "px";
}, 20);

input.addEventListener("input", () => {
    input.style.width = calculateInputWidth() + "px";
});

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const command = input.value;
        if (command) {
            commandHistory.push(command);
        }
        historyIndex = commandHistory.length;
        input.value = "";
        handleCommand(command);
    } else if (e.key === "ArrowUp") {
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
            moveCursorToEnd();
        }
    } else if (e.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
            moveCursorToEnd();
        } else {
            historyIndex = commandHistory.length;
            input.value = "";
        }
    } else if (e.ctrlKey && e.key === "l") {
        clear();
        e.preventDefault();
    }
});

window.addEventListener("keydown", (e) => {
    if (document.activeElement !== input) {
        if (e.target instanceof HTMLAnchorElement && (e.key === "Enter" || e.key === " ")) {
            return;
        }
        input.focus();
    }
});

window.addEventListener("keyup", (e) => {
    const cmd = input.value.split(" ")[0].toLowerCase();
    input.style.color = commandsList.includes(cmd) ? "#0f0" : "";
});

const konamiCode = [
    "ArrowUp", "ArrowUp",
    "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight",
    "ArrowLeft", "ArrowRight",
    "b", "a"
];
let konamiIndex = 0;

window.addEventListener("keydown", (e) => {
    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            handleCommand("konami");
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

loadGame();
welcome().then(startParams);

setInterval(() => {
    if (Math.random() > 0.2) return;
    terminal.classList.add("glitch");
    setTimeout(() => {
        terminal.classList.remove("glitch");
    }, rand(100, 1_300));
}, 20_000);

let cursorTimeout: number;

window.addEventListener("mousemove", () => {
    document.body.style.cursor = "";
    window.clearTimeout(cursorTimeout);
    cursorTimeout = window.setTimeout(() => {
        document.body.style.cursor = "none";
    }, 1000);
});
document.body.style.cursor = "none";