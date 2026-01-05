import { debounce } from "@wxn0brp/flanker-ui/utils";
import { commandsList, handleCommand } from "./commands";
import { handleAutoComplete } from "./complete";
import { fileSystem } from "./filesystem";
import { clear, input } from "./ui";

const commandHistory: string[] = [];
let historyIndex = -1;

export const moveCursorToEnd = debounce(() => {
    input.setSelectionRange(input.value.length, input.value.length);
}, 50);

function setInputWidth() {
    const width = input.value.length * 10 + 200;
    input.style.width = Math.min(width, window.innerWidth - 20) + "px";
}
setTimeout(setInputWidth, 20);
input.addEventListener("input", setInputWidth);

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
        setInputWidth();

    } else if (e.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
            moveCursorToEnd();
        } else {
            historyIndex = commandHistory.length;
            input.value = "";
        }
        setInputWidth();

    } else if (e.ctrlKey && e.key === "l") {
        clear();
        e.preventDefault();

    } else if (e.key === "Tab") {
        e.preventDefault();
        const split = input.value.split(" ");
        const cmd = split[0].toLowerCase();
        if (split.length > 1) {
            handleAutoComplete(cmd, split);
        } else {
            const matchingCommands = commandsList.filter((command) => command.startsWith(cmd));
            if (matchingCommands.length === 1) {
                split[0] = matchingCommands[0];
                input.value = split.join(" ");
                moveCursorToEnd();
            }
        }
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

function colorCommand() {
    const cmd = input.value.split(" ")[0].toLowerCase();
    input.style.color = commandsList.includes(cmd) ? "#0f0" : "";
}

window.addEventListener("keyup", colorCommand);
window.addEventListener("input", colorCommand);

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

export function resetDash() {
    qs(".prompt").innerHTML = fileSystem.getCWD() + " $ ";
}