import { debounce } from "@wxn0brp/flanker-ui/utils";
import { handleCommand, commandsList } from "./commands";
import { input, clear } from "./ui";

const commandHistory: string[] = [];
let historyIndex = -1;

const moveCursorToEnd = debounce(() => {
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
