import { rand } from "@wxn0brp/flanker-ui/utils";
import { input, output, print } from "../ui";
import { $store } from "../vars";
import { addXp } from "../xp";
import { unlockAchievement } from "../achievements";

interface Point {
    x: number;
    y: number;
}

interface Wall {
    x: number;
    y: number;
    width: number;
    height: number;
    text: string;
}

export function startSnake() {
    const originalOutputDisplay = output.style.display;
    const inputLine = qs("#input-line")!;
    const originalInputLineDisplay = inputLine.style.display;

    output.style.display = "none";
    inputLine.style.display = "none";
    input.blur();

    const canvas = document.createElement("canvas");
    canvas.id = "snake-canvas";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "2000";
    canvas.style.backgroundColor = "#000";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    if (!ctx) {
        alert("Canvas not supported!");
        cleanup();
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const CELL_SIZE = 20;
    const FONT_SIZE = 16;
    ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
    ctx.textBaseline = "top";

    let snake: Point[] = [{
        x: Math.floor((canvas.width / 2) / CELL_SIZE) * CELL_SIZE,
        y: Math.floor((canvas.height / 2) / CELL_SIZE) * CELL_SIZE
    }];

    let direction: Point = { x: CELL_SIZE, y: 0 };
    let nextDirection: Point = { x: CELL_SIZE, y: 0 };
    let score = 0;
    let gameLoopId: number;
    let apple: Point = { x: 0, y: 0 };
    const walls: Wall[] = [];

    const terminalText = output.innerText || "VOID ERROR NULL SYSTEM FAILURE";
    const words = terminalText
        .split(" ")
        .filter(w => w.length > 3 && w.length < 20)
        .sort(() => Math.random() - 0.5)
        .slice(0, 150);

    words.forEach(word => {
        const metrics = ctx.measureText(word);
        const w = metrics.width;
        const h = FONT_SIZE;

        for (let i = 0; i < 10; i++) {
            const wx = Math.random() * (canvas.width - w);
            const wy = Math.random() * (canvas.height - h);

            const snapX = Math.floor(wx / CELL_SIZE) * CELL_SIZE;
            const snapY = Math.floor(wy / CELL_SIZE) * CELL_SIZE;

            const overlap = walls.some(wall =>
                snapX < wall.x + wall.width &&
                snapX + w > wall.x &&
                snapY < wall.y + wall.height &&
                snapY + h > wall.y
            );

            const onSnake = (Math.abs(snapX - snake[0].x) < 100 && Math.abs(snapY - snake[0].y) < 100);

            if (!overlap && !onSnake) {
                walls.push({
                    x: snapX,
                    y: snapY,
                    width: w,
                    height: h,
                    text: word
                });
                break;
            }
        }
    });

    spawnApple();

    function handleKey(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowUp":
                if (direction.y === 0) nextDirection = { x: 0, y: -CELL_SIZE };
                break;
            case "ArrowDown":
                if (direction.y === 0) nextDirection = { x: 0, y: CELL_SIZE };
                break;
            case "ArrowLeft":
                if (direction.x === 0) nextDirection = { x: -CELL_SIZE, y: 0 };
                break;
            case "ArrowRight":
                if (direction.x === 0) nextDirection = { x: CELL_SIZE, y: 0 };
                break;
            case "Escape":
                cleanup();
                break;
        }
    }
    window.addEventListener("keydown", handleKey);
    let growthRemaining = 0;

    function update() {
        direction = nextDirection;
        const head = snake[0];
        const newHead = { x: head.x + direction.x, y: head.y + direction.y };

        if (newHead.x < 0 || newHead.x >= canvas.width || newHead.y < 0 || newHead.y >= canvas.height) {
            gameOver();
            return;
        }

        if (snake.some((s, i) => i !== 0 && rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, s.x, s.y, CELL_SIZE, CELL_SIZE))) {
            gameOver();
            return;
        }

        const hitWall = walls.some(wall =>
            rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, wall.x, wall.y, wall.width, wall.height)
        );
        if (hitWall) {
            gameOver();
            return;
        }

        snake.unshift(newHead);

        if (rectIntersect(newHead.x, newHead.y, CELL_SIZE, CELL_SIZE, apple.x, apple.y, CELL_SIZE, CELL_SIZE)) {
            score++;
            addXp(2);
            spawnApple();
            growthRemaining += rand(1, 8);
        } else if (!growthRemaining) {
            snake.pop();
        } else {
            growthRemaining--;
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#444";
        ctx.font = `${FONT_SIZE}px 'Courier New', monospace`;
        walls.forEach(w => {
            ctx.fillText(w.text, w.x, w.y);
        });

        ctx.fillStyle = "#f00";
        ctx.fillRect(apple.x, apple.y, CELL_SIZE, CELL_SIZE);
        ctx.fillStyle = "#fff";
        ctx.fillText("@", apple.x + 2, apple.y - 2);

        ctx.fillStyle = "#0f0";
        snake.forEach(s => {
            ctx.fillRect(s.x, s.y, CELL_SIZE - 2, CELL_SIZE - 2);
        });

        ctx.fillStyle = "#fff";
        ctx.fillText(`Score: ${score} | XP: ${$store.xp.get()}`, 10, 10);
    }

    function spawnApple() {
        const WALL_MARGIN = 2 * CELL_SIZE;
        let valid = false;

        while (!valid) {
            const rx = Math.floor(Math.random() * (canvas.width - CELL_SIZE));
            const ry = Math.floor(Math.random() * (canvas.height - CELL_SIZE));

            apple.x = Math.floor(rx / CELL_SIZE) * CELL_SIZE;
            apple.y = Math.floor(ry / CELL_SIZE) * CELL_SIZE;

            const collideWall = walls.some(w =>
                rectIntersect(
                    apple.x,
                    apple.y,
                    CELL_SIZE,
                    CELL_SIZE,
                    w.x - WALL_MARGIN,
                    w.y - WALL_MARGIN,
                    w.width + WALL_MARGIN * 2,
                    w.height + WALL_MARGIN * 2
                )
            );

            const collideSnake = snake.some(s =>
                rectIntersect(
                    apple.x,
                    apple.y,
                    CELL_SIZE,
                    CELL_SIZE,
                    s.x,
                    s.y,
                    CELL_SIZE,
                    CELL_SIZE
                )
            );

            if (!collideWall && !collideSnake) {
                valid = true;
            }
        }

        // 20% chance of teleporting the apple in 5 seconds
        if (Math.random() < 0.2) {
            setTimeout(spawnApple, 5_000);
        }
    }

    function rectIntersect(x1: number, y1: number, w1: number, h1: number, x2: number, y2: number, w2: number, h2: number) {
        return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
    }

    function gameOver() {
        clearInterval(gameLoopId);
        ctx.fillStyle = "rgba(0,0,0,0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#f00";
        ctx.font = "40px monospace";
        const msg = "GAME OVER";
        const metrics = ctx.measureText(msg);
        ctx.fillText(msg, (canvas.width - metrics.width) / 2, canvas.height / 2 - 40);

        ctx.fillStyle = "#fff";
        ctx.font = "20px monospace";
        const scoreMsg = `Score: ${score} | Press ENTER to Continue`;
        const smMetrics = ctx.measureText(scoreMsg);
        ctx.fillText(scoreMsg, (canvas.width - smMetrics.width) / 2, canvas.height / 2 + 10);

        const closeHandler = (e: KeyboardEvent) => {
            if (e.key === "Enter" || e.key === "Escape") {
                window.removeEventListener("keydown", closeHandler);
                cleanup();
            }
        };
        window.removeEventListener("keydown", handleKey);
        window.addEventListener("keydown", closeHandler);

        print("Snake Game Over! Gained " + score * 2 + " xp!");
        if (score >= 20) {
            unlockAchievement("snake_master");
        }
    }

    function cleanup() {
        clearInterval(gameLoopId);
        window.removeEventListener("keydown", handleKey);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        output.style.display = originalOutputDisplay;
        inputLine.style.display = originalInputLineDisplay;
        input.focus();
    }

    gameLoopId = window.setInterval(update, 100);
    draw();
}
