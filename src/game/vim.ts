import { input, output } from "../ui";
import { unlockAchievement } from "../achievements";

let vimActive = false;

export function openVim() {
    if (vimActive) return;
    vimActive = true;
    input.blur();

    const originalDisplay = output.style.display;
    const inputLine = document.getElementById("input-line")!;
    const originalInputDisplay = inputLine.style.display;

    output.style.display = "none";
    inputLine.style.display = "none";

    const vim = document.createElement("div");
    vim.style.height = "100vh";
    vim.style.backgroundColor = "#111";
    vim.style.color = "#ccc";
    vim.style.fontFamily = "monospace";
    vim.style.display = "flex";
    vim.style.flexDirection = "column";
    vim.style.padding = "5px";
    vim.style.zIndex = "1000";
    vim.style.position = "fixed";
    vim.style.top = "0";
    vim.style.left = "0";
    vim.style.width = "100%";

    vim.innerHTML = `
        <div style="flex: 1; white-space: pre-wrap; color: #4488ff;">~
~
~
~       VIM - Vi IMproved
~
~       version 9.0.1234
~       by Bram Moolenaar et al.
~       Vim is open source and freely distributable
~
~       You seem to be stuck in vim.
~       If you don't know how to exit, and you're not a superhuman,
~       you may need to restart the session.
~
~       For real pros: mash keys to prove you're not a bot.
~
~
~
~
~
~
</div>
        <div id="vim-status" style="background: #333; color: white; padding: 2px;">[No Name]                                                                                                        0,0-1          All</div>
        <div id="vim-cmd" style="height: 20px;"></div>
    `;

    document.body.appendChild(vim);

    let keyPresses = 0;
    let firstKeyPressTime = 0;

    const closeVim = () => {
        vim.remove();
        output.style.display = originalDisplay;
        inputLine.style.display = originalInputDisplay;
        window.removeEventListener("keydown", handleKey);
        vimActive = false;
        input.focus();
        unlockAchievement("vim_survivor");
    };

    const handleKey = (e: KeyboardEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (firstKeyPressTime === 0) {
            firstKeyPressTime = Date.now();
        }

        keyPresses++;
        const timeDiff = Date.now() - firstKeyPressTime;

        if (timeDiff > 1000) {
            keyPresses = 0;
            firstKeyPressTime = 0;
        }

        if (keyPresses > 10 && timeDiff < 1000) {
            closeVim();
        }
    };

    window.addEventListener("keydown", handleKey);
    unlockAchievement("vim_brave");
}