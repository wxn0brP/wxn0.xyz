import { $store } from "../vars";
import { print } from "../ui";

function printAvailable(name: string, description: string) {
    print(`  <span class="success">${name}</span> - ${description}`);
}

export function cmdHelp() {
    let userLevel = $store.level.get();
    print("Available commands:");

    // Level 0 - Basic commands
    printAvailable("help", "Show this help message");
    printAvailable("status", "Show your current level and XP");
    printAvailable("hack", "Start a hacking mission to gain XP");
    printAvailable("links", "Show unlocked links");
    printAvailable("clear", "Clear the terminal");
    printAvailable("source", "Source code");
    printAvailable("news", "Show latest news");
    printAvailable("mail", "See inbox / Send mail");

    if (userLevel < 1) return;

    // Level 1
    printAvailable("a (achievements)", "Show your achievements");
    printAvailable("mine", "Mine for XP (Process intensive)");
    printAvailable("date", "Show current system time");
    printAvailable("whoami", "Display current user");
    printAvailable("echo [text]", "Print text to terminal");

    if (userLevel < 2) return;

    // Level 2
    printAvailable("ls/dir", "List directory contents");
    printAvailable("cd [path]", "Change directory");
    printAvailable("cat [file]", "Read file content");
    printAvailable("pwd", "Print working directory");

    if (userLevel < 3) return;

    // Level 3
    printAvailable("zhiva [name]", "Run Zhiva app");
    printAvailable("snake", "Play Snake (Earn XP!)");
    printAvailable("vim/vi", "Open vim editor");

    if (userLevel < 4) return;

    // Level 4
    printAvailable("pong", "Play Pong (Earn XP!)");

    if (userLevel < 5) return;

    // Level 5
    printAvailable("shop", "Open the Dark Market (Buy upgrades)");
    printAvailable("reset", "Reset your game progress");
    printAvailable("coinflip", "Flip a coin");
    printAvailable("matrix", "Enter the Matrix");

    if (userLevel < 6) return;

    // Level 6
    printAvailable("stats", "How many times have you cleared the terminal?");
    printAvailable("apt [moo]", "Use apt");
    printAvailable("cowsay [text]", "Use cowsay");
    printAvailable("fortune", "Get a random fortune");
    printAvailable("sl", "Steam Locomotive");
    printAvailable("arch", "Use Arch");
    printAvailable("pacman [-Syu]", "Package Manager");
    printAvailable("nyan", "Nyan Cat");
}
