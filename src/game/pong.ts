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
    let hardMode = false;

    const keys = {
        ArrowUp: false,
        ArrowDown: false
    };

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowUp") keys.ArrowUp = true;
        if (e.key === "ArrowDown") keys.ArrowDown = true;
        if (e.key === "Escape") cleanup();
        if (e.key === "h") {
            hardMode = true;
        }
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
            addXp(hardMode ? 20 : 10);
            resetBall();
        }

        draw();
    }

    function drawTrajectory() {
        ctx.strokeStyle = "rgba(195, 0, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();

        let simX = ballX + BALL_SIZE / 2;
        let simY = ballY + BALL_SIZE / 2;
        let simVX = ballSpeedX;
        let simVY = ballSpeedY;

        ctx.moveTo(simX, simY);

        for (let i = 0; i < 20; i++) {
            let timeX = Infinity;
            let timeY = Infinity;

            if (simVY < 0) {
                timeY = (simY - BALL_SIZE / 2) / -simVY;
            } else if (simVY > 0) {
                timeY = (canvas.height - BALL_SIZE / 2 - simY) / simVY;
            }

            if (simVX < 0) {
                const targetX = 10 + PADDLE_WIDTH + BALL_SIZE / 2;
                if (simX <= targetX) break;
                timeX = (simX - targetX) / -simVX;
            } else if (simVX > 0) {
                const targetX = canvas.width - PADDLE_WIDTH - 10 - BALL_SIZE / 2;
                if (simX >= targetX) break;
                timeX = (targetX - simX) / simVX;
            }

            const dt = Math.min(timeX, timeY);
            if (dt === Infinity || dt < 0) break;

            simX += simVX * dt;
            simY += simVY * dt;

            ctx.lineTo(simX, simY);

            if (timeX <= timeY) {
                break;
            } else {
                simVY = -simVY;
            }
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
    }

    function draw() {
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!hardMode) {
            drawTrajectory();
        }

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
        const msg = `Arrow Up/Down: move | Esc: exit | H: Hard Mode (${hardMode ? "ON" : "OFF"})`;
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
        let xp = playerScore * 5 - aiScore;
        if (hardMode) xp *= 2;
        print(`You earned ${xp} XP!`);
        addXp(xp);
        if (playerScore >= 10) {
            unlockAchievement("pong_winner");
        }
    }

    gameLoopId = requestAnimationFrame(loop);
}