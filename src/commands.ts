import { showLinks, showStatus, startHack, tryHack, welcome } from "./game";
import { resetGame } from "./save";
import { clear, print, printCommand } from "./ui";
import { hackingMission } from "./vars";

function printAvailable(name: string, description: string) {
    print(`  <span class="success">${name}</span> - ${description}`);
}

export function handleCommand(command: string) {
    if (!command.trim()) {
        return;
    }

    printCommand(command);

    if (hackingMission.active) {
        tryHack(command);
        return;
    }

    const [cmd, ...args] = command.toLowerCase().split(" ");
    print("$ " + cmd, "executed");

    switch (cmd) {
        case "help":
            print("Available commands:");
            printAvailable("help", "Show this help message");
            printAvailable("status", "Show your current level and XP");
            printAvailable("hack", "Start a hacking mission to gain XP");
            printAvailable("links", "Show unlocked links");
            printAvailable("clear", "Clear the terminal");
            printAvailable("reset", "Reset your game progress");
            printAvailable("welcome", "Show the welcome message");
            break;
        case "status":
            showStatus();
            break;
        case "hack":
            startHack();
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
