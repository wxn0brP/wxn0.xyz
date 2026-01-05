let activeMatrixInterval: any = null;
let activeCanvas: HTMLCanvasElement | null = null;

export function stopMatrixEffect() {
    if (activeMatrixInterval) {
        clearInterval(activeMatrixInterval);
        activeMatrixInterval = null;
    }
    if (activeCanvas) {
        const canvas = activeCanvas;
        canvas.style.transition = "opacity 0.5s";
        canvas.style.opacity = "0";
        setTimeout(() => {
            canvas.remove();
        }, 500);
        activeCanvas = null;
    }
}

export function startMatrixEffect(duration: number = 0) {
    if (activeCanvas) return;

    const canvas = document.createElement("canvas");
    canvas.classList.add("matrix");
    document.body.appendChild(canvas);
    activeCanvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "01WXN0XYZ";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
    }

    activeMatrixInterval = setInterval(() => {
        if (!activeCanvas) return;

        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#0F0";
        ctx.font = fontSize + "px monospace";

        for (let i = 0; i < drops.length; i++) {
            const text = chars.charAt(Math.floor(Math.random() * chars.length));
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);

            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        }
    }, 33);

    if (duration > 0) {
        setTimeout(stopMatrixEffect, duration);
    }
}

