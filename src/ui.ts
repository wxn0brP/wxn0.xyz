export const terminal = document.getElementById("terminal") as HTMLDivElement;
export const output = document.getElementById("output") as HTMLDivElement;
export const input = document.getElementById("input") as HTMLInputElement;

export function print(message: string, className?: string) {
    const p = document.createElement("p");
    p.innerHTML = message;
    if (className) {
        p.className = className;
    }
    output.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
}

export function printCommand(command: string) {
    const p = document.createElement("p");
    p.innerHTML = `<span class="prompt'>></span> ${command}`;
    output.appendChild(p);
}

export function clear() {
    output.innerHTML = "";
}
