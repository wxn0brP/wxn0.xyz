const page = document.querySelector<HTMLDivElement>("#page");
const terminal = document.querySelector<HTMLDivElement>("#terminal");

const START_DELAY = 20_000;
const GLITCH_TIME = 1_200;

function loadTerminal() {
    terminal.style.display = "";
    page.remove();
    document.querySelector<HTMLLinkElement>("#style").href = "terminal.css";
    document.querySelector<HTMLLinkElement>("#glitch-style").remove();

    const script = document.createElement("script");
    script.src = "./dist/index.js";
    document.body.appendChild(script);
}

function loadAnimation() {
    setTimeout(() => {
        page.classList.add("glitch", "shake");

        setTimeout(() => {
            page.classList.remove("shake");
        }, 500);

        setTimeout(() => {
            loadTerminal();
            localStorage.setItem("run", String(Date.now()));
        }, GLITCH_TIME);
    }, START_DELAY);
}

const run = localStorage.getItem("run");
const firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;

if (localStorage.getItem("notHappened")) {
    document.addEventListener("dblclick", () => loadTerminal(), { once: true });
    document.querySelector("#stick").innerHTML = "Double-click to continue...";
    localStorage.removeItem("notHappened");
}
else if (firstRunOfTheDay) {
    loadAnimation();
} else {
    loadTerminal();
}