// src/shake.ts
var page = document.querySelector("#page");
var terminal = document.querySelector("#terminal");
var container = document.querySelector("#container");
var textStory = [
  "Go away.",
  "Don’t stay here.",
  "Leave.",
  "Why are you still here?",
  "Stop looking.",
  "I told you to go.",
  "You don’t listen.",
  "...fine",
  "Don’t leave. Darling~~~"
];
var textRandom = [
  "Don’t look away.",
  "I’m right here.",
  "Stay close.",
  "You’re not leaving.",
  "I found you again.",
  "Mine.",
  "\uD83D\uDC9C\uD83D\uDC9C\uD83D\uDC9C",
  "Don’t disappear.",
  "I won’t let you go."
];
var clicked = 0;
var GLITCH_TIME = 1600;
function randomColor(el) {
  el.style.color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
}
function loadTerminal() {
  terminal.style.display = "";
  page.remove();
  document.querySelector("#bg-effect")?.remove();
  document.querySelector("#style").href = "terminal.css";
  document.querySelector("title").innerHTML = "Explorer - wxn0.xyz";
  const script = document.createElement("script");
  script.src = "./dist/index.js";
  document.body.appendChild(script);
}
function loadAnimation() {
  page.classList.add("glitch", "shake");
  document.querySelectorAll("*").forEach((el) => {
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
    document.querySelectorAll(".glitch-color").forEach((el) => {
      el.classList.remove("glitch-color");
      el.style.color = "";
    });
    setTimeout(() => {
      document.querySelector("#small-paper-button").style.display = "";
    }, 4000);
  }, GLITCH_TIME);
}
function addRandomText(i) {
  const p = document.createElement("p");
  p.innerHTML = textRandom[i % textRandom.length];
  container.appendChild(p);
  const scale = 1 + Math.pow(i / 60, 2) * 4;
  Object.assign(p.style, {
    position: "fixed",
    top: `${Math.random() * (window.innerHeight - 100)}px`,
    left: `${Math.random() * (window.innerWidth - 100)}px`,
    fontSize: `${scale}rem`
  });
  if (Math.random() < 0.8)
    randomColor(p);
}
container.addEventListener("click", () => {
  if (clicked > textStory.length)
    return;
  if (clicked === textStory.length) {
    for (let i = 0;i < 60; i++) {
      const t = Math.round(4500 * Math.pow((i + 1) / 60, 0.92));
      setTimeout(() => addRandomText(i), t);
    }
    setTimeout(() => {
      loadAnimation();
    }, 4600);
  } else {
    const p = document.createElement("p");
    p.innerHTML = textStory[clicked];
    container.appendChild(p);
  }
  clicked++;
  if (clicked === 5) {
    if (document.fullscreenElement)
      return;
    const e = document.documentElement;
    if (e.requestFullscreen)
      e.requestFullscreen();
    else if (e.webkitRequestFullscreen)
      e.webkitRequestFullscreen();
    else if (e.msRequestFullscreen)
      e.msRequestFullscreen();
  }
  if (clicked === 2) {
    document.querySelector("#small-paper-button").style.display = "none";
  }
});
