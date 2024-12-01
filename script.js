const canv = document.getElementById('can');
const ctx = canv.getContext('2d');

// Funkcja zmieniająca rozmiar canvas w zależności od rozdzielczości
function resizeCanvas() {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
    resizeCanvas();
    player1y = canv.height / 2 - paddleH / 2;
    player2x = canv.width - 192 - paddleW;
    player2y = canv.height / 2 - paddleH / 2;
    table();
    drawScores();
});

// Wymiary paletek i piłki
const paddleW = 20;
const paddleH = 150;
const ballSize = 30;

// Pozycje i prędkość paletek
let player1x = 192;
let player1y = canv.height / 2 - paddleH / 2;
let player2x = canv.width - 192 - paddleW;
let player2y = canv.height / 2 - paddleH / 2;
const paddleSpeed = 5;

// Pozycja i prędkość piłki
let ballx = canv.width / 2 - ballSize / 2;
let bally = canv.height / 2 - ballSize / 2;
let ballSpeedx = 2;
let ballSpeedy = 1.5;
const initialBallSpeedX = 2;
const initialBallSpeedY = 1.5;
const maxSpeed = 10;

// Klawisze
const keys = {
    W: false,
    S: false,
    ArrowUp: false,
    ArrowDown: false,
};

// Wynik graczy
let player1Score = 0;
let player2Score = 0;
const winningScore = 10;

// Flagi gry
let gameOver = false;
let gameState = 'menu';
let menuSelection = 0; // 0 - Multiplayer, 1 - Singleplayer

// Dźwięki
const hitSound = new Audio('hitSound.mp3');
const scoreSound = new Audio('scoreSound.mp3');

// Funkcja rysująca stół
function table() {
    const cw = canv.width;
    const ch = canv.height;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cw, ch);

    ctx.fillStyle = 'gray';
    for (let linePosition = 10; linePosition < ch; linePosition += 30) {
        ctx.fillRect(cw / 2 - 5, linePosition, 6, 16);
    }
}

// Funkcja rysująca piłkę
function Ball() {
    ctx.fillStyle = 'white';
    ctx.fillRect(ballx, bally, ballSize, ballSize);

    ballx += ballSpeedx;
    bally += ballSpeedy;

    // Odbicie piłki od ściany górnej i dolnej
    if (bally <= 0 || bally + ballSize >= canv.height) {
        ballSpeedy = -ballSpeedy;
        hitSound.play();
    }

    // Odbicie piłki od lewej paletki
    if (
        ballx <= player1x + paddleW &&
        ballx + ballSize >= player1x &&
        bally + ballSize >= player1y &&
        bally <= player1y + paddleH
    ) {
        ballSpeedx = Math.min(maxSpeed, -ballSpeedx * 1.1);
        ballSpeedy = Math.min(maxSpeed, ballSpeedy * 1.1);

        const paddleCenter = player1y + paddleH / 2;
        const impactPoint = bally + ballSize / 2 - paddleCenter;
        ballSpeedy += impactPoint * 0.05;

        hitSound.play();
    }

    // Odbicie piłki od prawej paletki
    if (
        ballx + ballSize >= player2x &&
        ballx <= player2x + paddleW &&
        bally + ballSize >= player2y &&
        bally <= player2y + paddleH
    ) {
        ballSpeedx = Math.min(maxSpeed, -ballSpeedx * 1.1);
        ballSpeedy = Math.min(maxSpeed, ballSpeedy * 1.1);

        const paddleCenter = player2y + paddleH / 2;
        const impactPoint = bally + ballSize / 2 - paddleCenter;
        ballSpeedy += impactPoint * 0.05;

        hitSound.play();
    }

    // Przejście piłki poza ekran od prawej strony (punkt dla gracza pierwszego)
    if (ballx + ballSize >= canv.width) {
        player1Score++;
        scoreSound.play();
        checkWin();
        resetBall();
    }

    // Przejście piłki poza ekran od lewej strony (punkt dla gracza drugiego)
    if (ballx + ballSize < 0) {
        player2Score++;
        scoreSound.play();
        checkWin();
        resetBall();
    }
}

// Funkcja resetująca piłkę
function resetBall() {
    ballx = canv.width / 2 - ballSize / 2;
    bally = canv.height / 2 - ballSize / 2;

    ballSpeedx = Math.random() > 0.5 ? initialBallSpeedX : -initialBallSpeedX;
    ballSpeedy = Math.random() > 0.5 ? initialBallSpeedY : -initialBallSpeedY;

    // Przywrócenie prędkości piłki po zdobyciu punktu lub po skończeniu
    console.log(`Reset ball: speedx=${ballSpeedx}, speedy=${ballSpeedy}`); 
}

// Wczytywanie zdarzeń z klawiatury
window.addEventListener('keydown', (e) => {
    if (e.key === 'w') keys.w = true;
    if (e.key === 's') keys.s = true;
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

window.addEventListener('keyup', (e) => {
    if (e.key === 'w') keys.w = false;
    if (e.key === 's') keys.s = false;
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

window.addEventListener('keydown', (e) => {
    if (gameState === 'menu') {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            menuSelection = 1 - menuSelection; // Przełączanie między 0 i 1
        }
        if (e.key === 'Enter') {
            if (menuSelection === 0) {
                gameState = 'pvp';
            } else if (menuSelection === 1) {
                gameState = 'ai';
            }
            gameLoop();
        }
    }
});

// Funkcja rysująca gracza pierwszego
function Player1() {
    if (keys.w) player1y = Math.max(0, player1y - paddleSpeed);
    if (keys.s) player1y = Math.min(canv.height - paddleH, player1y + paddleSpeed);

    ctx.fillStyle = 'white';
    ctx.fillRect(player1x, player1y, paddleW, paddleH);
}

// Funkcja rysująca gracza drugiego
function Player2() {
    if (keys.ArrowUp) player2y = Math.max(0, player2y - paddleSpeed);
    if (keys.ArrowDown) player2y = Math.min(canv.height - paddleH, player2y + paddleSpeed);

    ctx.fillStyle = 'white';
    ctx.fillRect(player2x, player2y, paddleW, paddleH);
}

// Funkcja rysująca gracza drugiego (AI)
function Player2AI() {
    const centerAI = player2y + paddleH / 2;
    const ballCenter = bally + ballSize / 2;
    if (Math.abs(centerAI - ballCenter) > paddleSpeed) {
        player2y += ballCenter > centerAI ? paddleSpeed - 2 : -paddleSpeed + 2;
    }
    player2y = Math.max(0, Math.min(canv.height - paddleH, player2y));

    ctx.fillStyle = 'white';
    ctx.fillRect(player2x, player2y, paddleW, paddleH);
}

// Funkcja rysująca menu główne
function drawMenu() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = 'white';
    ctx.font = '96px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("PONG", canv.width / 2, canv.height / 4);

    ctx.font = '32px "Press Start 2P"';
    ctx.fillStyle = menuSelection === 0 ? 'yellow' : 'white';
    ctx.fillText("Multi player", canv.width / 2, canv.height / 2 - 50);

    ctx.fillStyle = menuSelection === 1 ? 'yellow' : 'white';
    ctx.fillText("Single player", canv.width / 2, canv.height / 2 + 50);
}

// Funkcja rysująca wyniki obu graczy
function drawScores() {
    ctx.fillStyle = 'white';
    ctx.font = '48px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(player1Score, canv.width / 4, 100);
    ctx.fillText(player2Score, (canv.width / 4) * 3, 100);
}

// Funkcja rysująca napis o wygranej danego gracza
function drawWinner(winner) {
    gameOver = true;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = 'white';
    ctx.font = '64px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`Player ${winner} Wins!`, canv.width / 2, canv.height / 2);

    setTimeout(() => {
        resetGame();
        gameState = 'menu'; 
        gameOver = false;
    }, 5000); // Przeniesienie użytkownika do menu głównego po pięciu sekundach
}

// Funkcja sprawdzająca czy któryś z graczy wygrał
function checkWin() {
    if (player1Score === winningScore) {
        drawWinner(1);
    } else if (player2Score === winningScore) {
        drawWinner(2);
    }
}

// Funkcja resetująca grę
function resetGame() {
    player1Score = 0;
    player2Score = 0;
    resetBall();
}

function gameLoop() {
    if (gameState === 'menu') {
        drawMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    if (!gameOver) {
        table();
        Ball();
        Player1();
        if (gameState === 'pvp') {
            Player2();
        } else if (gameState === 'ai') {
            Player2AI();
        }
        drawScores();
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();

