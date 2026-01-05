import { fileSystem } from "../filesystem";
import { input, print } from "../ui";
import { delay } from "@wxn0brp/flanker-ui/utils";

export async function welcome() {
    input.disabled = true;
    print("CONNECTION ESTABLISHED.", "success");
    await delay(600);
    print("CRITICAL: SYSTEM BREACH DETECTED...", "error");
    await delay(800);
    print("BYPASSING SECURITY PROTOCOLS...", "system");
    await delay(1200);
    print("ACCESS GRANTED.", "success");
    await delay(500);
    print("----------------------------------------", "dim");
    print("Welcome to <span class='system'>wxn0.xyz</span> Terminal Interface", "system");
    print("Kernel v2.0.4-build.99 loaded.");
    print("System Shell v0.0.8 loaded.")
    print("----------------------------------------", "dim");
    await delay(300);
    print("Type '<span class='success'>help</span>' to list available commands.");
    input.disabled = false;
    qs(".prompt").innerHTML = fileSystem.getCWD() + " $ ";
}
