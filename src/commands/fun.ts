import { achievementCounters, unlockAchievement } from "../achievements";
import { fileSystem } from "../filesystem";
import { systemDestroy } from "../game";
import { resetDash } from "../input";
import { output, print, terminal } from "../ui";

export function cmdSudo(args: string[], fullArgs: string) {
    const firstArg = args[0];

    if (firstArg === "cat") {
        fileSystem.cat(args[1], true);
        return;
    }
    if (fullArgs === "make me a sandwich") {
        print("Okay.", "success");
        unlockAchievement("curious");
        return;
    }
    if (firstArg === "rm" && ["-rf", "-fr"].includes(args[1]) && args[2] === "/") {
        systemDestroy();
        return;
    }
    print("nice try, but you have no power here.", "error");
}

export function cmdEcho(fullArgs: string) {
    print(fullArgs || " ");
    achievementCounters.echoCount++;
    if (achievementCounters.echoCount >= 10) unlockAchievement("echo_chamber");
}

export function cmdMake(args: string[]) {
    if (args.join(" ") === "me a sandwich") {
        print("What? Make it yourself.", "system");
    } else {
        print("make: *** No targets specified and no makefile found. Stop.", "error");
    }
}

export function cmdMatrix() {
    print("The Matrix has you...", "success");
    unlockAchievement("matrix_fan");
}

export function cmdCoinflip() {
    print(Math.random() > 0.5 ? "Heads" : "Tails", "success");
    achievementCounters.coinflipCount++;
    if (achievementCounters.coinflipCount >= 10) unlockAchievement("coin_flipper");
}

export function cmd42() {
    print("The answer to life, the universe, and everything.", "success");
    unlockAchievement("answer_seeker");
}

export function cmdKonami() {
    document.body.classList.toggle("god-mode");
    const isGod = document.body.classList.contains("god-mode");
    const box = qs(".prompt");

    if (isGod) {
        print("GOD MODE ACTIVATED", "system");
        print("Unlimited power...", "dim");
        unlockAchievement("god_mode");
        if (box) {
            box.textContent = "GOD#";
            box.style.color = "#fff";
        }
    } else {
        print("God mode... disabled due to budget cuts.", "dim");
        if (box) {
            resetDash();
            box.style.color = "";
        }
    }
}

export function cmdHello() {
    print("Hello there!", "system");
    unlockAchievement("hello_world");
}

export function cmdApt(args: string[]) {
    if (args[0] === "moo") {
        print(`
         (__) 
         (oo) 
   /------\\/ 
  / |    ||   
 *  /\\---/\\ 
    ~~   ~~   
...."Have you mooed today?"...
`, "success");
        unlockAchievement("apt_fan");
    } else {
        print("E: Invalid operation " + (args[0] || ""), "error");
    }
}

export function cmdCowSay(fullArgs: string) {
    if (!fullArgs) fullArgs = "Moo";
    const len = fullArgs.length + 2;
    const top = " " + "_".repeat(len);
    const bot = " " + "-".repeat(len);

    print(`
 ${top}
( ${fullArgs} )
 ${bot}
        o   ^__^
         o  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`, "success");
    unlockAchievement("cow_fan");
}

export function cmdFortune() {
    const fortunes = [
        "A computer once beat me at chess, but it was no match for me at kick boxing.",
        "To err is human, to forgive is divine. To persist in error is diabolical.",
        "There are 10 types of people in the world: those who understand binary, and those who don't.",
        "The best thing about a boolean is even if you are wrong, you are only off by a bit.",
        "It works on my machine.",
        "Have you tried turning it off and on again?",
        "Linux is free only if your time has no value.",
        "I'd tell you a UDP joke, but you might not get it.",
        "Real programmers count from 0.",
        "Eunuchs Programmers use vi.",
        "Don't worry if it doesn't work right. If everything did, you'd be out of a job.",
        "It's not a bug, it's a feature.",
        "Software and cathedrals are much the same - first we build them, then we pray.",
        "Code is like humor. When you have to explain it, it's bad.",
        "Optimism is an occupational hazard of programming: feedback is the treatment.",
        "T E L N E T ... The next best thing to being there.",
        "You can't spell 'geek' without 'ee'."
    ];
    print(fortunes[Math.floor(Math.random() * fortunes.length)], "dim");
    unlockAchievement("fortune_teller");
}

export function cmdArch() {
    print("I use Arch btw", "success");
    unlockAchievement("arch_user");
}

export function cmdSl() {
    print(`
          (  ) (@@) ( )  (@)  ()    @@    O     @     O     @      O
        (@@@)
       (    )
      (@@@@)
    (   )
     ====        ________                ___________
 _D _|  |_______/        \\__I_I_____===__|_________|
  | (_)---  |   H\\________/ |   |        =|___ ___|      _________________
  /     |  |   H  |  |     |   |         ||_| |_||     _|                \\_____A
 |      |  |   H  |__--------------------| [___] |   =|                        |
 | ________|___H__/__|_____/[][]~\\_______|       |   -|                        |
 |/ |   |-----------I_____I [][] []  D   |=======|____|________________________|_
__/ =| o |=-~\\  /~=|_| =| =|___________|__     |___________________________|
 |/-=|___|=    ||  |/=|___|=   /|\\   /|\\   /|\\   /|\\   /|\\   /|\\   /|\\   /|\\
  \\_/      \\_ /  \\_/      \\_ /   \\_/   \\_/   \\_/   \\_/   \\_/   \\_/   \\_/   \\_/
`, "system");
    print("Choo choo!", "dim");
    unlockAchievement("train_spotter");
}

export function cmdPacman(args: string[]) {
    if (args[0] === "-Syu" || args[0] === "-Sy") {
        print(":: Synchronizing package databases...", "system");
        print(" core is up to date", "dim");
        print(" extra is up to date", "dim");
        print(" community is up to date", "dim");
        print(":: Starting full system upgrade...", "system");
        print(" there is nothing to do", "dim");
        unlockAchievement("pkg_master");
    } else if (args[0] === "-S") {
        print(`error: target not found: ${args[1] || ""}`, "error");
    } else {
        print(`
 .--.
/ _.-' .-.  .-.  .-.
\\  '-. '-'  '-'  '-'
 '--'
`.slice(1), "system");
    }
}

export function cmdNyanCat() {
    print("Nyan cat...", "system");

    const p = document.createElement("p");
    const img = document.createElement("img");
    img.src = `nyancat.gif`;
    img.alt = `Nyan cat`;
    img.addEventListener("load", () => {
        terminal.scrollTop = terminal.scrollHeight;
    });
    img.addEventListener("click", () => {
        window.open("https://nyan.cat", "_blank");
    });
    p.appendChild(img);
    output.appendChild(p);
    unlockAchievement("nyan_cat");
}