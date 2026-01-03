import { input, print } from "./ui.js";
import { handleCommand } from "./commands.js";
import { welcome } from "./game.js";

input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const command = input.value;
        input.value = "";
        handleCommand(command);
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