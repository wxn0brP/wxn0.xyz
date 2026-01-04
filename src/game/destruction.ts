import { delay } from "@wxn0brp/flanker-ui/utils";
import { reloadWithParams } from "../start";
import { input, print } from "../ui";

export async function systemDestroy() {
    input.disabled = true;
    print("WARNING: You are about to delete the entire filesystem.", "error");
    print("This action cannot be undone.", "error");
    await delay(2000);
    print("Initiating deletion sequence...", "system");
    await delay(1000);

    const dirs = ["/home/guest", "/var/log", "/usr/bin", "/etc", "/tmp", "/usr/share/locale/fr"];
    for (const dir of dirs) {
        print(`Deleting ${dir}... [OK]`, "dim");
        await delay(300);
    }

    await delay(500);
    print("Deleting /boot... [FATAL ERROR]", "error");
    await delay(1000);
    print("KERNEL PANIC: SYSTEM HALTED", "error");
    await delay(1000);

    // Fake BSOD
    document.body.style.backgroundColor = "#0078d7";
    document.body.style.color = "#ffffff";
    document.body.style.fontFamily = "'Segoe UI', sans-serif";
    document.body.innerHTML = `
        <div style="padding: 10% 20%; font-size: 1.5rem;">
            <p style="font-size: 8rem; margin: 0;">:(</p>
            <p style="margin-top: 2rem;">Your device ran into a problem and needs to restart. We're just collecting some error info, and then we'll restart for you.</p>
            <p id="bsod-status" style="margin-top: 2rem;">0% complete</p>
            <p style="font-size: 1rem; margin-top: 2rem; opacity: 0.8;">Stop key: CRITICAL_PROCESS_DIED</p>
        </div>
    `;

    const funnyMessages = [
        "Analyzing emotional damage...",
        "Deleting System32 (wait, this is Linux)...",
        "Converting Windows BSOD to Linux Kernel Panic...",
        "Installing Gentoo (Component 1 of 4096)...",
        "Compiling physics engine...",
        "Questioning life choices...",
        "Cleaning up broken dreams...",
        "Rebooting into reality..."
    ];

    const statusEl = qs("#bsod-status")!;
    for (let i = 0; i < funnyMessages.length; i++) {
        await delay(800 + Math.random() * 1000);
        statusEl.textContent = `${Math.floor((i / funnyMessages.length) * 100)}% complete - ${funnyMessages[i]}`;
    }

    await delay(1000);
    statusEl.textContent = "100% complete - Restarting...";
    await delay(1000);
    reloadWithParams([
        "reset",
        "echo 'System was corrupted. Save data destroyed. Starting from a clean state.'",
    ]);
}
