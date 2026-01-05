import { input, output, print } from "../ui";
import { addXp } from "../xp";
import { unlockAchievement } from "../achievements";

export function startPong() {
    const originalOutputDisplay = output.style.display;
    const inputLine = qs("#input-line");
    const originalInputLineDisplay = inputLine.style.display;

    output.style.display = "none";
    inputLine.style.display = "none";
    input.blur();

    const canvas = document.createElement("canvas");
    canvas.id = "pong-canvas";
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

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const PADDLE_WIDTH = 15;
    const PADDLE_HEIGHT = 150;
    const BALL_SIZE = 10;
    const PLAYER_SPEED = 12;
    const AI_SPEED = 10;

    let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;
    let ballX = canvas.width / 2;
    let ballY = canvas.height / 2;
    let ballSpeedX = 10;
    let ballSpeedY = 10;
    let playerScore = 0;
    let aiScore = 0;
    let gameLoopId: number;

    const keys = {
        ArrowUp: false,
        ArrowDown: false
    };

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp") keys.ArrowUp = true;
        if (e.key === "ArrowDown") keys.ArrowDown = true;
        if (e.key === "Escape") cleanup();
    }

    function handleKeyUp(e: KeyboardEvent) {
        if (e.key === "ArrowUp") keys.ArrowUp = false;
        if (e.key === "ArrowDown") keys.ArrowDown = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function resetBall() {
        ballX = canvas.width / 2;
        ballY = canvas.height / 2;
        ballSpeedX = -ballSpeedX;
        ballSpeedY = (Math.random() - 0.5) * 20;
    }

    function update() {
        if (keys.ArrowUp && playerY > 0) playerY -= PLAYER_SPEED;
        if (keys.ArrowDown && playerY < canvas.height - PADDLE_HEIGHT) playerY += PLAYER_SPEED;

        if (ballSpeedX > 0) {
            const aiCenter = aiY + PADDLE_HEIGHT / 2;
            if (aiCenter < ballY) {
                aiY += AI_SPEED;
            } else if (aiCenter > ballY) {
                aiY -= AI_SPEED;
            }
        }

        aiY = Math.max(0, Math.min(canvas.height - PADDLE_HEIGHT, aiY));

        ballX += ballSpeedX;
        ballY += ballSpeedY;

        if (ballY < 0 || ballY > canvas.height - BALL_SIZE) {
            ballSpeedY = -ballSpeedY;
        }

        if (
            ballX < PADDLE_WIDTH + 10 &&
            ballX > 10 &&
            ballY + BALL_SIZE > playerY &&
            ballY < playerY + PADDLE_HEIGHT
        ) {
            ballSpeedX = -ballSpeedX;
            const deltaY = ballY - (playerY + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;

            if (Math.abs(ballSpeedX) < 15) {
                ballSpeedX *= 1.05;
            }
        }

        if (
            ballX > canvas.width - PADDLE_WIDTH - 10 - BALL_SIZE &&
            ballX < canvas.width - 10 &&
            ballY + BALL_SIZE > aiY &&
            ballY < aiY + PADDLE_HEIGHT
        ) {
            ballSpeedX = -ballSpeedX;
            const deltaY = ballY - (aiY + PADDLE_HEIGHT / 2);
            ballSpeedY = deltaY * 0.35;
        }

        if (ballX < 0) {
            aiScore++;
            resetBall();
        }
        else if (ballX > canvas.width) {
            playerScore++;
            addXp(10);
            resetBall();
        }

        draw();
    }

    function draw() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "#444";
        ctx.setLineDash([10, 15]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = "#fff";
        ctx.fillRect(10, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillRect(canvas.width - PADDLE_WIDTH - 10, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillRect(ballX, ballY, BALL_SIZE, BALL_SIZE);

        ctx.font = "40px monospace";
        ctx.fillText(playerScore.toString(), canvas.width / 4, 50);
        ctx.fillText(aiScore.toString(), canvas.width * 3 / 4, 50);

        ctx.font = "16px monospace";
        const msg = "Arrow Up/Down to move | Esc to exit";
        const metrics = ctx.measureText(msg);
        ctx.fillText(msg, canvas.width / 2 - metrics.width / 2, canvas.height - 20);
    }

    function loop() {
        update();
        gameLoopId = requestAnimationFrame(loop);
    }

    function cleanup() {
        cancelAnimationFrame(gameLoopId);
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
        window.removeEventListener("resize", resizeCanvas);
        if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
        output.style.display = originalOutputDisplay;
        inputLine.style.display = originalInputLineDisplay;
        input.focus();
        print(`Game Over! Player: ${playerScore} | AI: ${aiScore}`);
        const xp = playerScore * 5 - aiScore;
        print(`You earned ${xp} XP!`);
        addXp(xp);
        if (playerScore >= 10) {
            unlockAchievement("pong_winner");
        }
    }

    gameLoopId = requestAnimationFrame(loop);
}