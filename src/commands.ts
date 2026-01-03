import { print, printCommand, clear } from "./ui";
import { hack, showStatus, showLinks, welcome, resetGame } from "./game";

function printAvailable(name: string, description: string) {
    print(`  <span class="success">${name}</span> - ${description}`);
}

export function handleCommand(command: string) {
    if (!command.trim()) {
        return;
    }

    printCommand(command);
    const [cmd, ...args] = command.toLowerCase().split(" ");
    print("$ " + cmd, "executed");

    switch (cmd) {
        case "help":
            print("Available commands:");
            printAvailable("help", "Show this help message");
            printAvailable("status", "Show your current level and XP");
            printAvailable("hack", "Gain XP to level up");
            printAvailable("links", "Show unlocked links");
            printAvailable("clear", "Clear the terminal");
            printAvailable("reset", "Reset your game progress");
            printAvailable("welcome", "Show the welcome message");
            break;
        case "status":
            showStatus();
            break;
        case "hack":
            hack();
            break;
        case "links":
            showLinks();
            break;
        case "clear":
            clear();
            break;
        case "reset":
            resetGame();
            break;
        case "welcome":
            welcome();
            break;
        default:
            print(`Command not found: <span class="error">${command}</span>`, "error");
            break;
    }
}
