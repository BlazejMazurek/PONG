const canv = document.getElementById('can');
const ctx = canv.getContext('2d');

// Funkcja zmieniająca rozmiar canvas w zależności od rozdzielczości
function resizeCanvas() {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', () => {
    canv.width = window.innerWidth;
    canv.height = window.innerHeight;
    
    player1y = canv.height / 2 - paddleH / 2;
    player2x = canv.width - 192 - paddleW;
    player2y = canv.height / 2 - paddleH / 2;
    table();
    drawScores();
});

// Wymiary paletek i piłki
const paddleW = 20; // Szerokość paletek
const paddleH = 150; // Wysokość paletek
const ballSize = 30; // Wielkość piłki

// Pozycje i prędkość paletek
let player1x = 192; // Pozycja X gracza pierwszego
let player1y = canv.height / 2 - paddleH / 2; // Pozycja Y gracza pierwszego
let player2x = canv.width - 192 - paddleW; // Pozycja X gracza drugiego
let player2y = canv.height / 2 - paddleH / 2; // Pozycja Y gracza drugiego
const paddleSpeed = 6;

// Pozycja i prędkość piłki
let ballx = canv.width / 2 - ballSize / 2;
let bally = canv.height / 2 - ballSize / 2;
let ballSpeedx = 2; // Prędkość piłki w osi X
let ballSpeedy = 1.5; // Prędkość piłki w osi Y
const acceleration = 1.05; // Zwiększenie prędkości piłki
const maxSpeed = 10; // Maksymalna prędkość piłki

// Klawisze
const keys = {
    W: false,
    S: false,
    ArrowUp: false,
    ArrowDown: false,
};

// Wynik graczy
let player1Score = 0; // Punkty gracza pierwszego
let player2Score = 0; // Punkty gracza drugiego
const winningScore = 10; // Liczba punktów potrzebnych do wygranej

// Flaga wskazująca na skończenie gry
let gameOver = false;

//  Menu główne
let gameState = 'menu';
let menuSelection = 0; // 0 - Multipayer 1 -Singleplayer

//Dźwięki
const hitSound =  new Audio('hitSound.mp3'); // Dźwięk odbicia piłki
const scoreSound = new Audio('scoreSound.mp3'); // Dźwięk zdobycia punktu


// Funkcja rysująca stół
function table() {
    const cw = canv.width;
    const ch = canv.height;

    // Tło
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, cw, ch);

    // Linia na środku
    ctx.fillStyle = 'gray';
    for (let linePosition = 10; linePosition < ch; linePosition += 30) {
        ctx.fillRect(cw / 2 - 5, linePosition, 6, 16);
    }
}

// Funkcja rysująca piłkę
function Ball() {
    ctx.fillStyle = 'white';
    ctx.fillRect(ballx, bally, ballSize, ballSize);

    // Prędkość piłki
    ballx += ballSpeedx;
    bally += ballSpeedy;

    // Kolizja z górną i dolną krawędzią canvas
    if (bally <= 0 || bally + ballSize >= canv.height) {
        ballSpeedy = -ballSpeedy; // Zmiana kierunku ruchu

        hitSound.play(); //Dźwięk odbicia się piłki od ściany
    }

    // Kolizja z paletką po lewej stronie (gracz pierwszy)
    if (
        ballx <= player1x + paddleW && // Przód paletki
        ballx + ballSize >= player1x && // Tył paletki
        bally + ballSize >= player1y && // Dolna krawędź paletki
        bally <= player1y + paddleH // Górna krawędź paletki
    ) {
        ballSpeedx = -ballSpeedx * acceleration; // Odbicie piłki i jej przyspieszenie względem osi X
        ballSpeedy *= acceleration // Przyspieszenie piłki względem osi Y

        //zmiana kątu odbicia piłki
        const paddleCenter = player1y + paddleH / 2;
        const impactPoint = bally + ballSize / 2 - paddleCenter;
        ballSpeedy += impactPoint * 0.05; // Dodanie efektu

        hitSound.play();// Dźwięk odicia się piłki od gracza
    }

    // Kolizja z paletki po prawej stronie (gracz drugi)
    if (
        ballx + ballSize >= player2x && // Przód paletki
        ballx <= player2x + paddleW && // Tył paletki
        bally + ballSize >= player2y && // Dolna krawędź paletki
        bally <= player2y + paddleH // Górna krawędź paletki
    ) {
        ballSpeedx = -ballSpeedx * acceleration; // Odbicie piłki i jej przyspieszenie względem osi X
        ballSpeedy *= acceleration // Przyspieszenie piłki względem osi Y

        // Zmiana kątu odbicia piłki
        const paddleCenter = player2y + paddleH / 2;
        const impactPoint = bally + ballSize / 2 - paddleCenter;
        ballSpeedy += impactPoint * 0.05;
        
        hitSound.play();// Dźwięk odicia się piłki od gracza
    }
    // Ograniczenie prędkości piłki
    if (Math.abs(ballSpeedx) > maxSpeed) {
        ballSpeedx = Math.sign(ballSpeedx) * maxSpeed;
    }
    if (Math.abs(ballSpeedy) > maxSpeed) {
        ballSpeedy = Math.sign(ballSpeedy) * maxSpeed;
    }
    // Przekroczenie prawej krawędzi (punkt dla gracza pierwszego)
    if (ballx + ballSize >= canv.width) {
        player1Score++;
        scoreSound.play(); //Dźwięk zdobycia punktu
        checkWin(); // Sprawdzanie wygranej
        resetBall();
    }
    // Przekroczenie lewej krawędzi (punkt dla gracza drugiego)
    if (ballx + ballSize < 0) {
        player2Score++;
        scoreSound.play(); //Dźwięk zdobycia punktu
        checkWin(); // Sprawdzanie wygranej
        resetBall();
    }
}

// Funkcja która będzie resetować położenie piłki gdy ta wyjdzie poza ekran
function resetBall() {
    ballx = canv.width / 2 - ballSize / 2;
    bally = canv.height / 2 - ballSize / 2;

    ballSpeedx = Math.random() > 0.5 ? 4 : -4;
    ballSpeedy = Math.random() > 0.5 ? 3 : -3;
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

// Funkcja rysująca pierwszego gracza
function Player1() {
    // Zaprzestanie rysowania paletki gdy gra się skończy
    if (gameOver) return;

    // Ruch dla gracza pierwszego (W, S)
    if (keys.w) {
        player1y = Math.max(0, player1y - paddleSpeed);
    }
    if (keys.s) {
        player1y = Math.min(canv.height - paddleH, player1y + paddleSpeed);
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(player1x, player1y, paddleW, paddleH);
}

// Funkcja rysująca drugiego gracza
function Player2() {
    // Zaprzestanie rysowania paletki gdy gra się skończy
    if (gameOver) return;

    // Ruch dla gracza drugiego (strzałka w góre i dół)
    if (keys.ArrowUp) {
        player2y = Math.max(0, player2y - paddleSpeed);
    }
    if (keys.ArrowDown) {
        player2y = Math.min(canv.height - paddleH, player2y + paddleSpeed);
    }

    ctx.fillStyle = 'white';
    ctx.fillRect(player2x, player2y, paddleW, paddleH);
}

// Funkcja rysująca drugiego gracza (AI)
function Player2AI() {
    // Zaprzestanie rysowania paletki gdy gra się skończy
    if (gameOver) return;
    
    const centerAI = player2y + paddleH / 2;
    const ballCenter = bally + ballSize / 2;
    // Poruszanie się AI za piłką
    if (Math.abs(centerAI - ballCenter) > paddleSpeed) {
        player2y += ballCenter > centerAI ? paddleSpeed - 2 : -paddleSpeed + 2;
    }
    player2y = Math.max(0, Math.min(canv.height - paddleH, player2y)); // Ograniczenie ruchu AI do obszaru gry

    // Rysowanie paletki AI
    ctx.fillStyle = 'white';
    ctx.fillRect(player2x, player2y, paddleW, paddleH);
}

// Funkcja rysująca menu główne
function drawMenu() {
    //Tło
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = 'white';
    ctx.font = '96px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText("PONG", canv.width / 2, canv.height / 4);

    ctx.font = '32px "Press Start 2P"';

    // Podświetlenie opcji
    ctx.fillStyle = menuSelection === 0 ? 'yellow' : 'white';
    ctx.fillText("Multi player", canv.width / 2, canv.height / 2 - 50);

    ctx.fillStyle = menuSelection === 1 ? 'yellow' : 'white';
    ctx.fillText("Single player", canv.width / 2, canv.height / 2 + 50);
}


// Funkcja rysująca punkty na ekranie
function drawScores() {

    if (gameOver) return; // Skończenie rysowania wyników gdy gra się skończy


    ctx.fillStyle = 'white';
    ctx.font = '48px "Press Start 2P"';
    ctx.textAlign = 'center';

    // Punkty gracza pierwszego (po lewej)
    ctx.fillText(player1Score, canv.width / 4, 100);

    // Punkty gracza drugiego (po prawej)
    ctx.fillText(player2Score, (canv.width / 4) * 3, 100);
}

// Funkcja rysująca napis "WINNER" po tym jak jakiś gracz wygra
function drawWinner(winner) {
    gameOver = true;

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = 'white';
    ctx.font = '64px "Press Start 2P"';
    ctx.textAlign = 'center';
    ctx.fillText(`Player ${winner} Wins!`, canv.width / 2, canv.height / 2);

    setTimeout(() => {
        gameState = 'menu';
        gameOver = false;
        resetGame();
    }, 5000); // Powrót do menu po 5 sekundach
}

// Funkcja sprawdzająca, czy ktoś wygrał
function checkWin() {
    if (player1Score === winningScore) {
        drawWinner(1);
    } else if (player2Score === winningScore) {
        drawWinner(2);
    }
}

// Funkcja resetująca grę po wygranej
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
