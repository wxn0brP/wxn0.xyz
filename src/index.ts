import { handleCommand } from "./commands";
import { welcome } from "./game";
import { input } from "./ui";

const commandHistory: string[] = [];
let historyIndex = -1;

function moveCursorToEnd() {
    setTimeout(() => {
        input.setSelectionRange(input.value.length, input.value.length);
    }, 50)
}

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

welcome();