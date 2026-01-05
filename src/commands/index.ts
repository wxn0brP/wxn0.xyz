import { achievementCounters, unlockAchievement } from "../achievements";
import { fileSystem } from "../filesystem";
import { hackingMission, openVim, showLinks, startHack, startMining, startShop, tryHack } from "../game";
import { print, printCommand } from "../ui";
import { cmdSetAchievement, cmdXp } from "./developer";
import { cmdCat, cmdCd, cmdLs } from "./filesystem";
import { cmd42, cmdCoinflip, cmdEcho, cmdHello, cmdKonami, cmdMake, cmdMatrix, cmdSudo } from "./fun";
import { cmdPong, cmdSnake, cmdZhiva } from "./games";
import { cmdHelp } from "./help";
import { cmdAchievements, cmdStatus } from "./info";
import { cmdMail } from "./mail";
import { cmdNews } from "./news";
import { cmdClear, cmdExit, cmdReset, cmdReturn, cmdRun, cmdSuglite, cmdWelcome } from "./system";

interface CommandContext {
    args: string[];
    fullArgs: string;
    command: string;
}

interface CommandDefinition {
    fn: (ctx: CommandContext) => void;
    aliases?: string[];
    description?: string;
}

const registry: Record<string, CommandDefinition> = {
    // Help & Info
    help: { fn: () => cmdHelp() },
    status: { fn: () => cmdStatus() },
    achievements: { aliases: ["a"], fn: () => cmdAchievements() },

    // Social
    links: {
        fn: () => {
            showLinks();
            unlockAchievement("link_finder");
        }
    },
    whoami: {
        fn: () => {
            print("guest@wxn0.xyz");
            unlockAchievement("self_aware");
        }
    },
    date: {
        fn: () => {
            print(new Date().toString());
            unlockAchievement("time_traveler");
        }
    },
    github: {
        aliases: ["git", "source"], fn: () => {
            window.open("https://github.com/wxn0brP/wxn0.xyz", "_blank");
        }
    },
    news: { aliases: ["changelog", "updates"], fn: () => cmdNews() },
    hello: { aliases: ["hi"], fn: () => cmdHello() },

    // Filesystem
    ls: { aliases: ["ll"], fn: ({ args }) => cmdLs(args[0]) },
    dir: { fn: () => print("Windows sucks.", "error") },
    cd: { fn: ({ args }) => cmdCd(args[0]) },
    pwd: { fn: () => print(fileSystem.getCWD()) },
    cat: { fn: ({ args }) => cmdCat(args[0]) },
    rm: {
        fn: () => {
            print("Permission denied.", "error");
            unlockAchievement("destructor");
        }
    },

    // Games
    hack: { fn: () => startHack() },
    mine: { fn: () => startMining() },
    shop: { aliases: ["store"], fn: ({ fullArgs }) => startShop(fullArgs) },
    vim: { aliases: ["vi"], fn: () => openVim() },
    snake: { fn: () => cmdSnake() },
    pong: { aliases: ["ping"], fn: () => cmdPong() },
    zhiva: { fn: ({ args }) => cmdZhiva(args[0]) },

    // System
    clear: { fn: () => cmdClear() },
    reset: { fn: () => cmdReset() },
    welcome: { fn: () => cmdWelcome() },
    exit: { fn: () => cmdExit() },
    return: { fn: () => cmdReturn() },
    run: { fn: () => cmdRun() },
    suglite: { fn: () => cmdSuglite() },
    mail: { aliases: ["inbox", "email"], fn: ({ args, fullArgs }) => cmdMail(args, fullArgs) },

    // Fun
    sudo: { fn: ({ args, fullArgs }) => cmdSudo(args, fullArgs) },
    echo: { fn: ({ fullArgs }) => cmdEcho(fullArgs) },
    make: { fn: ({ args }) => cmdMake(args) },
    matrix: { fn: () => cmdMatrix() },
    coinflip: { fn: () => cmdCoinflip() },
    42: { fn: () => cmd42() },
    konami: { fn: () => cmdKonami() },

    // Developer
    "add-xp": { fn: ({ args }) => cmdXp(args[0]) },
    "set-achievement": { fn: ({ args }) => cmdSetAchievement(args[0]) },
};

export const commandsList = Object.keys(registry).flatMap(key => {
    const aliases = registry[key].aliases || [];
    return [key, ...aliases];
});

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

    const [cmdName, ...args] = command.split(" ");
    const fullArgs = command.substring(cmdName.length + 1);
    const lowerCmd = cmdName.toLowerCase();

    const commandId = Date.now();
    print(
        `<span style="color: magenta">${fileSystem.getCWD()} $</span> ` +
        `<span id="cmd_${commandId}">${command}</span>`
    );

    let commandDef: CommandDefinition | undefined;

    if (registry[lowerCmd]) {
        commandDef = registry[lowerCmd];
    } else {
        for (const key in registry) {
            if (registry[key].aliases?.includes(lowerCmd)) {
                commandDef = registry[key];
                break;
            }
        }
    }

    if (commandDef) {
        commandDef.fn({ args, fullArgs, command });
    } else {
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
        qs("#cmd_" + commandId).classList.add("error");
    }
}
