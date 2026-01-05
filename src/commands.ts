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
import { startPong } from "./game/pong";
import { resetGame } from "./save";
import { clear, print, printCommand } from "./ui";
import { $store, hackingMission } from "./vars";
import { addXp } from "./xp";
import { achievements, unlockAchievement, getAchievementProgress, achievementCounters, getVisibleAchievements } from "./achievements";

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
    "pong",
    "source",
    "achievements",
    "a",
]

export function handleCommand(command: string) {
    if (!command.trim()) {
        return;
    }

    printCommand(command);
    unlockAchievement("first_steps");

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

            // Level 0 - Basic commands
            printAvailable("help", "Show this help message");
            printAvailable("status", "Show your current level and XP");
            printAvailable("hack", "Start a hacking mission to gain XP");
            printAvailable("links", "Show unlocked links");
            printAvailable("clear", "Clear the terminal");
            printAvailable("source", "Source code");
            if (userLevel < 1) break;

            // Level 1
            printAvailable("achievements/a", "Show your achievements");
            printAvailable("mine", "Mine for XP (Process intensive)");
            printAvailable("date", "Show current system time");
            printAvailable("whoami", "Display current user");
            printAvailable("echo [text]", "Print text to terminal");
            if (userLevel < 2) break;

            // Level 2
            printAvailable("ls/dir", "List directory contents");
            printAvailable("cd [path]", "Change directory");
            printAvailable("cat [file]", "Read file content");
            printAvailable("pwd", "Print working directory");
            if (userLevel < 3) break;

            // Level 3
            printAvailable("zhiva [name]", "Run Zhiva app");
            printAvailable("snake", "Play Snake (Earn XP!)");
            printAvailable("vim/vi", "Open vim editor");
            if (userLevel < 4) break;

            // Level 4
            printAvailable("pong", "Play Pong (Earn XP!)");
            if (userLevel < 5) break;

            // Level 5
            printAvailable("reset", "Reset your game progress");
            printAvailable("coinflip", "Flip a coin");
            printAvailable("matrix", "Enter the Matrix");

            break;
        case "status":
            showStatus();
            unlockAchievement("status_check");
            break;
        case "hack":
            startHack();
            break;
        case "mine":
            startMining();
            break;
        case "links":
            showLinks();
            unlockAchievement("link_finder");
            break;
        case "vim":
        case "vi":
            openVim();
            break;
        case "clear":
            clear();
            achievementCounters.clearCount++;
            if (achievementCounters.clearCount >= 10) unlockAchievement("clean_freak");
            break;
        case "reset":
            resetGame();
            break;
        case "welcome":
            welcome();
            break;
        case "snake":
            startSnake();
            unlockAchievement("snake_player");
            break;
        case "pong":
        case "ping":
            startPong();
            unlockAchievement("pong_player");
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
                unlockAchievement("curious");
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
            achievementCounters.echoCount++;
            if (achievementCounters.echoCount >= 10) unlockAchievement("echo_chamber");
            break;
        case "date":
            print(new Date().toString());
            unlockAchievement("time_traveler");
            break;
        case "whoami":
            print("guest@wxn0.xyz");
            unlockAchievement("self_aware");
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
            achievementCounters.exitCount++;
            if (achievementCounters.exitCount >= 5) unlockAchievement("escape_artist");
            break;
        case "rm":
            print("Permission denied.", "error");
            unlockAchievement("destructor");
            break;
        case "suglite":
            print("Suglite is watching...", "system");
            break;
        case "matrix":
            print("The Matrix has you...", "success");
            unlockAchievement("matrix_fan");
            break;
        case "coinflip":
            print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
            achievementCounters.coinflipCount++;
            if (achievementCounters.coinflipCount >= 10) unlockAchievement("coin_flipper");
            break;
        case "42":
            print("The answer to life, the universe, and everything.", "success");
            unlockAchievement("answer_seeker");
            break;
        case "konami":
            document.body.classList.toggle("god-mode");
            const isGod = document.body.classList.contains("god-mode");
            if (isGod) {
                print("GOD MODE ACTIVATED", "system");
                print("Unlimited power...", "dim");
                unlockAchievement("god_mode");
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
            unlockAchievement("hello_world");
            break;
        case "ls":
        case "ll":
            fileSystem.ls(firstArg);
            unlockAchievement("explorer");
            break;
        case "dir":
            print("Windows sucks.", "error");
            break;
        case "cd":
            fileSystem.cd(firstArg);
            achievementCounters.cdCount++;
            if (achievementCounters.cdCount >= 5) unlockAchievement("navigator");
            break;
        case "cat":
            if (!firstArg || !isNaN(+firstArg)) {
                cat(+firstArg);
                break;
            }
            fileSystem.cat(firstArg);
            unlockAchievement("reader");
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
            unlockAchievement("zhiva_user");
            location.href = `zhiva://start/${firstArg}`;
            break;
        case "xp":
            if (!isNaN(+firstArg)) {
                addXp(+firstArg);
                print("Gained " + firstArg + " XP! Cheater :/", "success");
                break;
            }
            break;
        case "github":
        case "git":
        case "source":
            window.open("https://github.com/wxn0brP/wxn0.xyz", "_blank");
            break;
        case "set-achievement":
            if (firstArg) {
                unlockAchievement(firstArg);
            }
            break;
        case "a":
        case "achievements":
            print(`Available Achievements (${getAchievementProgress()}):`);
            const visible = getVisibleAchievements();
            visible.forEach(a => {
                if (a.unlocked) {
                    print(`[x] <span class="success">${a.name}</span> - ${a.description} (+${a.xp} XP)`, "system");
                } else {
                    print(`[ ] ${a.name} - ${a.description} (+${a.xp} XP)`, "dim");
                }
            });
            break;
        default:
            // Track failed commands for persistent achievement
            if (achievementCounters.lastFailedCommand === command) {
                achievementCounters.failedCommandCount++;
                if (achievementCounters.failedCommandCount >= 3) {
                    unlockAchievement("persistent");
                }
            } else {
                achievementCounters.lastFailedCommand = command;
                achievementCounters.failedCommandCount = 1;
            }
            print(`Command not found: <span class="error">${command}</span>`, "error");
            break;
    }
}
