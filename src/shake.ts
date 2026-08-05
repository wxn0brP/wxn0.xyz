const page = document.querySelector<HTMLDivElement>("#page");
const terminal = document.querySelector<HTMLDivElement>("#terminal");
const container = document.querySelector<HTMLDivElement>("#container");

const textStory = [
	"Go away.",
	"Don’t stay here.",
	"Leave.",
	"Why are you still here?",
	"Stop looking.",
	"I told you to go.",
	"You don’t listen.",
	"...fine",
	"Don’t leave. Darling~~~",
];

const textRandom = [
	"Don’t look away.",
	"I’m right here.",
	"Stay close.",
	"You’re not leaving.",
	"I found you again.",
	"Mine.",
	"💜💜💜",
	"Don’t disappear.",
	"I won’t let you go.",
];

let clicked = 0;
const GLITCH_TIME = 1_600;

function randomColor(el: HTMLElement) {
	el.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}

function loadTerminal() {
	terminal.style.display = "";
	page.remove();

	document.querySelector<HTMLCanvasElement>("#bg-effect")?.remove();
	document.querySelector<HTMLLinkElement>("#style").href = "terminal.css";
	document.querySelector<HTMLDivElement>("title").innerHTML =
		"Explorer - wxn0.xyz";

	const script = document.createElement("script");
	script.src = "./dist/index.js";
	document.body.appendChild(script);
}

function loadAnimation() {
	page.classList.add("glitch", "shake");
	document.querySelectorAll<HTMLElement>("*").forEach(el => {
		if (Math.random() < 0.5) {
			el.classList.add("glitch-color");
			randomColor(el);
		}
	});

	setTimeout(() => {
		page.classList.remove("shake");
	}, 500);

	setTimeout(() => {
		loadTerminal();
		localStorage.setItem("run", String(Date.now()));
		document.querySelectorAll<HTMLElement>(".glitch-color").forEach(el => {
			el.classList.remove("glitch-color");
			el.style.color = "";
		});
		setTimeout(() => {
			document.querySelector<HTMLDivElement>(
				"#small-paper-button",
			).style.display = "";
		}, 4000);
	}, GLITCH_TIME);
}

function addRandomText(i: number) {
	const p = document.createElement("p");
	p.innerHTML = textRandom[i % textRandom.length];
	container.appendChild(p);

	const scale = 1 + Math.pow(i / 60, 2) * 4;

	Object.assign(p.style, {
		position: "fixed",
		top: `${Math.random() * (window.innerHeight - 100)}px`,
		left: `${Math.random() * (window.innerWidth - 100)}px`,
		fontSize: `${scale}rem`,
	});

	if (Math.random() < 0.8) randomColor(p);
}

container.addEventListener("click", () => {
	if (clicked > textStory.length) return;
	if (clicked === textStory.length) {
		for (let i = 0; i < 60; i++) {
			const t = Math.round(4500 * Math.pow((i + 1) / 60, 0.92));
			setTimeout(() => addRandomText(i), t);
		}

		setTimeout(() => {
			loadAnimation();
		}, 4_600);
	} else {
		const p = document.createElement("p");
		p.innerHTML = textStory[clicked];
		container.appendChild(p);
	}
	clicked++;
	if (clicked === 5) {
		if (document.fullscreenElement) return;
		const e = document.documentElement as any;
		if (e.requestFullscreen) e.requestFullscreen();
		else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
		else if (e.msRequestFullscreen) e.msRequestFullscreen();
	}

	if (clicked === 2) {
		document.querySelector<HTMLDivElement>(
			"#small-paper-button",
		).style.display = "none";
	}
});

export {};
