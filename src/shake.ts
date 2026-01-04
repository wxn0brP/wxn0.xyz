import "@wxn0brp/flanker-ui/html";
const page = qs("#page");
const terminal = qs("#terminal");

const START_DELAY = 30_000;
const GLITCH_TIME = 2_000;
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

function initCanvas() {
    const canvas = qs<HTMLCanvasElement>("#bg-effect");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles: { x: number; y: number; s: number; v: number }[] = [];
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            s: Math.random() * 2 + 1,
            v: Math.random() * 0.5 + 0.1
        });
    }

    function draw() {
        ctx.fillStyle = "rgba(5, 5, 5, 0.1)";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "rgba(0, 255, 0, 0.3)";

        particles.forEach(p => {
            p.y += p.v;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(draw);
    }
    draw();
}

const run = localStorage.getItem("run");
const firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;

initCanvas();
const titleElement = qs("#typewriter");
if (titleElement) typeWriter("wxn0.xyz", titleElement);

if (localStorage.getItem("notHappened")) {
    document.addEventListener("dblclick", () => loadAnimation(), { once: true });
    const stick = qs("#stick");
    if (stick) stick.innerHTML = "Double-click to initialize protocol...";
    localStorage.removeItem("notHappened");
    console.log("Mode", "Not happened")
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

function goFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
    } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
    }
}

document.addEventListener("click", goFullscreen, { once: true });