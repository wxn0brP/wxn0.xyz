import { delay } from "@wxn0brp/flanker-ui/utils";
import { handleCommand } from "./commands";

export async function startParams() {
    const params = new URLSearchParams(location.search);
    const i = params.get("i");
    if (!i) return;
    window.history.replaceState(null, "", "/");

    const instructions = i.replaceAll(",", " ").split(";");

    for (const instruction of instructions) {
        if (instruction === "") continue;

        if (instruction.split(" ")[0] === "sleep") {
            await delay(+instruction.split(" ")[1]);
            continue;
        }

        await delay(1000);
        handleCommand(instruction);
    }
}

export function reloadWithParams(commands: string[]) {
    commands = commands.map(cmd => cmd.replaceAll(" ", ","));
    location.href = "/?i=" + commands.join(";");
}
