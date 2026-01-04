function initCanvas() {
    const canvas = document.querySelector("#bg-effect");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
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
initCanvas();