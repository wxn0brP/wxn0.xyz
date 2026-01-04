import { fileSystem } from "./filesystem";
import {
    openVim,
    showLinks,
    showStatus,
    startHack,
    startMining,
    systemDestroy,
    tryHack,
    welcome
} from "./game";
import { cat } from "./game/cat";
import { startSnake } from "./game/snake";
import { resetGame } from "./save";
import { clear, print, printCommand } from "./ui";
import { $store, hackingMission } from "./vars";
import { addXp } from "./xp";

const box = qs(".prompt");

function printAvailable(name: string, description: string) {
    print(`  <span class="success">${name}</span> - ${description}`);
}

export const commandsList = [
    "help",
    "status",
    "hack",
    "links",
    "ls",
    "dir",
    "cd",
    "cat",
    "pwd",
    "clear",
    "reset",
    "welcome",
    "return",
    "run",
    "sudo",
    "echo",
    "date",
    "whoami",
    "exit",
    "suglite",
    "matrix",
    "coinflip",
    "hello",
    "zhiva",
    "mine",
    "make",
    "vim",
    "vi",
    "rm",
    "snake",
]

export function handleCommand(command: string) {
    if (!command.trim()) {
        return;
    }

    printCommand(command);

    if (hackingMission.active) {
        tryHack(command);
        return;
    }

    const [cmd, ...args] = command.split(" ");
    const fullArgs = command.substring(cmd.length + 1);
    let firstArg = args[0];

    print("$ " + command);

    switch (cmd.toLowerCase()) {
        case "help":
            let userLevel = $store.level.get();
            print("Available commands:");

            printAvailable("help", "Show this help message");
            printAvailable("status", "Show your current level and XP");
            printAvailable("hack", "Start a hacking mission to gain XP");
            printAvailable("links", "Show unlocked links");
            printAvailable("clear", "Clear the terminal");
            if (userLevel < 1) break;

            printAvailable("mine", "Mine for XP (Process intensive)");
            printAvailable("date", "Show current system time");
            printAvailable("ls/dir", "List directory contents");
            printAvailable("cd", "Change directory");
            printAvailable("cat", "Read file content");
            if (userLevel < 2) break;

            printAvailable("reset", "Reset your game progress");
            printAvailable("zhiva [name]", "Run Zhiva app");
            printAvailable("snake", "Play Snake (Earn XP!)");

            break;
        case "status":
            showStatus();
            break;
        case "hack":
            startHack();
            break;
        case "mine":
            startMining();
            break;
        case "links":
            showLinks();
            break;
        case "vim":
        case "vi":
            openVim();
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
        case "snake":
            startSnake();
            break;
        case "return":
            localStorage.setItem("notHappened", "true");
            location.reload();
            break;
        case "run":
            localStorage.removeItem("run");
            location.reload();
            break;
        case "sudo":
            if (firstArg === "cat") {
                fileSystem.cat(args[1], true);
                break;
            }
            if (fullArgs === "make me a sandwich") {
                print("Okay.", "success");
                break;
            }
            if (firstArg === "rm" && ["-rf", "-fr"].includes(args[1]) && args[2] === "/") {
                systemDestroy();
                break;
            }
            print("nice try, but you have no power here.", "error");
            break;
        case "echo":
            print(fullArgs || " ");
            break;
        case "date":
            print(new Date().toString());
            break;
        case "whoami":
            print("guest@wxn0.xyz");
            break;
        case "make":
            if (args.join(" ") === "me a sandwich") {
                print("What? Make it yourself.", "system");
            } else {
                print("make: *** No targets specified and no makefile found. Stop.", "error");
            }
            break;
        case "exit":
            print("There is no escape.", "error");
            break;
        case "rm":
            print("Permission denied.", "error");
            break;
        case "suglite":
            print("Suglite is watching...", "system");
            break;
        case "matrix":
            print("The Matrix has you...", "success");
            break;
        case "coinflip":
            print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
            break;
        case "42":
            print("The answer to life, the universe, and everything.", "success");
            break;
        case "konami":
            document.body.classList.toggle("god-mode");
            const isGod = document.body.classList.contains("god-mode");
            if (isGod) {
                print("GOD MODE ACTIVATED", "system");
                print("Unlimited power...", "dim");
                box.textContent = "GOD#";
                box.style.color = "#fff";
            } else {
                print("God mode... disabled due to budget cuts.", "dim");
                box.textContent = ">";
                box.style.color = "";
            }
            break;
        case "hello":
        case "hi":
            print("Hello there!", "system");
            break;
        case "ls":
        case "ll":
            fileSystem.ls(firstArg);
            break;
        case "dir":
            print("Windows sucks.", "error");
            break;
        case "cd":
            fileSystem.cd(firstArg);
            break;
        case "cat":
            if (!firstArg || !isNaN(+firstArg)) {
                cat(+firstArg);
                break;
            }
            fileSystem.cat(firstArg);
            break;
        case "pwd":
            print(fileSystem.getCWD());
            break;
        case "zhiva":
            if (!firstArg) {
                print("Usage: zhiva [name]", "error");
                break;
            }
            if (!firstArg.includes("/")) firstArg = `wxn0brP/${firstArg}`;
            location.href = `zhiva://start/${firstArg}`;
            break;
        case "xp":
            if (!isNaN(+firstArg)) {
                addXp(+firstArg);
                print("Gained " + firstArg + " XP! Cheater :/", "success");
                break;
            }
            break;
        default:
            print(`Command not found: <span class="error">${command}</span>`, "error");
            break;
    }
}
