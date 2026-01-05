import { cmdHelp } from "./help";
import { cmdStatus, cmdAchievements } from "./info";
import { cmdLinks, cmdWhoami, cmdDate, cmdGithub } from "./social";
import { cmdLs, cmdDir, cmdCd, cmdPwd, cmdCat, cmdRm } from "./filesystem";
import { cmdSudo, cmdEcho, cmdMake, cmdMatrix, cmdCoinflip, cmd42, cmdKonami, cmdHello } from "./fun";
import { cmdHack, cmdMine, cmdShop, cmdVim, cmdSnake, cmdPong, cmdZhiva } from "./games";
import { cmdClear, cmdReset, cmdWelcome, cmdExit, cmdSuglite, cmdReturn, cmdRun } from "./system";
import { cmdXp, cmdSetAchievement } from "./developer";
import { cmdMail } from "./mail";

import { print, printCommand } from "../ui";
import { unlockAchievement, achievementCounters } from "../achievements";
import { hackingMission } from "../vars";
import { tryHack } from "../game";
import { fileSystem } from "../filesystem";

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
    links: { fn: () => cmdLinks() },
    whoami: { fn: () => cmdWhoami() },
    date: { fn: () => cmdDate() },
    github: { aliases: ["git", "source"], fn: () => cmdGithub() },
    hello: { aliases: ["hi"], fn: () => cmdHello() },

    // Filesystem
    ls: { aliases: ["ll"], fn: ({ args }) => cmdLs(args[0]) },
    dir: { fn: () => cmdDir() },
    cd: { fn: ({ args }) => cmdCd(args[0]) },
    pwd: { fn: () => cmdPwd() },
    cat: { fn: ({ args }) => cmdCat(args[0]) },
    rm: { fn: () => cmdRm() },

    // Games
    hack: { fn: () => cmdHack() },
    mine: { fn: () => cmdMine() },
    shop: { aliases: ["store"], fn: ({ fullArgs }) => cmdShop(fullArgs) },
    vim: { aliases: ["vi"], fn: () => cmdVim() },
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
    xp: { fn: ({ args }) => cmdXp(args[0]) },
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
