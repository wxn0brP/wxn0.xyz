// src/shake.ts
var page = document.querySelector("#page");
var terminal = document.querySelector("#terminal");
var START_DELAY = 20000;
var GLITCH_TIME = 1200;
function loadTerminal() {
  terminal.style.display = "";
  page.remove();
  document.querySelector("#style").href = "terminal.css";
  document.querySelector("#glitch-style").remove();
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
var run = localStorage.getItem("run");
var firstRunOfTheDay = !run || Date.now() > Number(+run) + 24 * 60 * 60 * 1000;
if (localStorage.getItem("notHappened")) {
  document.addEventListener("dblclick", () => loadTerminal(), { once: true });
  document.querySelector("#stick").innerHTML = "Double-click to continue...";
  localStorage.removeItem("notHappened");
} else if (firstRunOfTheDay) {
  loadAnimation();
} else {
  loadTerminal();
}
