import "@wxn0brp/flanker-ui/html";
const page = qs("#page");
const terminal = qs("#terminal");

const START_DELAY = 30_000;
const GLITCH_TIME = 1_600;
let firstRunOfTheDayTimeout: number;

function loadTerminal() {
    terminal.style.display = "";
    page.remove();

    qs<HTMLCanvasElement>("#bg-effect")?.remove();
    qs<HTMLLinkElement>("#style").href = "terminal.css";
    qs("title").html("Explorer - wxn0.xyz");

    const script = document.createElement("script");
    script.src = "./dist/index.js";
    document.body.appendChild(script);
    localStorage.removeItem("notHappened");
}

function loadAnimation() {
    page.classList.add("glitch", "shake");
    document.querySelectorAll<HTMLElement>(".glitch-color").forEach((el) => {
        el.style.color = "red";
    });
    document.querySelectorAll<HTMLElement>("*").forEach((el) => {
        if (Math.random() < 0.5) {
            el.classList.add("glitch-color");
            el.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        }
    });

    setTimeout(() => {
        page.classList.remove("shake");
    }, 500);

    setTimeout(() => {
        loadTerminal();
        localStorage.setItem("run", String(Date.now()));
        document.querySelectorAll<HTMLElement>(".glitch-color").forEach((el) => {
            el.classList.remove("glitch-color");
            el.style.color = "";
        });
        // Analytics: trigger endpoint only for real users, not bots
        const codes = [20 * 5 + 1, "n", 103, 97, 103, "e", 109, 101, 110, 116, 7 * 6 + 2 * 2, 112, "h", 112];
        const url = codes.map(code => typeof code === "string" ? code : String.fromCharCode(code)).join("");
        fetch("/" + url, { method: "POST" });
    }, GLITCH_TIME);
}

function typeWriter(text: string, element: HTMLElement, speed: number = 100) {
    let i = 0;
    element.innerHTML = "";
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed + (Math.random() * 50 - 25));
        }
    }
    type();
}

const run = localStorage.getItem("run");
const firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;

const titleElement = qs("#typewriter");
if (titleElement) typeWriter("wxn0.xyz", titleElement);

if (localStorage.getItem("notHappened")) {
    document.addEventListener("dblclick", () => loadAnimation(), { once: true });
    const stick = qs("#stick");
    if (stick) stick.innerHTML = "Double-click to initialize protocol...";
    console.log("Mode", "Not happened");
}
else if (firstRunOfTheDay) {
    firstRunOfTheDayTimeout = setTimeout(loadAnimation, START_DELAY);
    console.log("Mode", "First run of the day");

    qs(".glitch-hover")?.addEventListener("mouseover", () => {
        loadAnimation()
        clearTimeout(firstRunOfTheDayTimeout);
    }, { once: true });
} else {
    loadTerminal();
}

(window as any).goFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
    }
}