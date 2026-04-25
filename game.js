
let score = 0;
let gameActive = false;
let totalSpawnedBalls = 0;
const maxBalls = 25; 
let balls = [];
let finalDiscountCode = ""; 
let isCodeGenerated = false;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const gameBtn = document.getElementById('game-btn');
const gameOverlay = document.getElementById('game-overlay');




const scoreElement = document.getElementById('score');
const discountElement = document.getElementById('discount-text');

let basket = { x: 0, y: 0, w: 150, h: 80, r: 0 };


const basketImg = new Image();
basketImg.src = 'cubuk.png';

const imageSources = ['tus1.png', 'tus2.png', 'tus3.png']; 
const loadedImages = [];
let imagesToLoad = imageSources.length;

imageSources.forEach(src => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        loadedImages.push(img);
        imagesToLoad--;
        if (imagesToLoad === 0) gameBtn.disabled = false;
    };
});


function generateDiscountCode(length = 7) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let res = '';
    for (let i = 0; i < length; i++) res += chars.charAt(Math.floor(Math.random() * chars.length));
    return res;
}

function drawBasket(x, y, w, h) {
    ctx.drawImage(basketImg, x, y, w, h);
}

function updateGame() {
    if (!gameActive) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBasket(basket.x, basket.y, basket.w, basket.h);

    if (totalSpawnedBalls < maxBalls && loadedImages.length > 0 && Math.random() < 0.03) {
        const randomImg = loadedImages[Math.floor(Math.random() * loadedImages.length)];
        balls.push({ 
            x: Math.random() * (canvas.width - 60) + 30, 
            y: -50, 
            r: 25, 
            speed: 4 + Math.random() * 3,
            image: randomImg 
        });
        totalSpawnedBalls++;
    }

    balls.forEach((ball, index) => {
        ball.y += ball.speed;
        if (ball.image) ctx.drawImage(ball.image, ball.x - ball.r, ball.y - ball.r, ball.r * 2, ball.r * 2);

        if (ball.y + ball.r > basket.y && ball.x > basket.x && ball.x < basket.x + basket.w) {
            balls.splice(index, 1);
            score++;
            scoreElement.innerText = score;
            discountElement.innerText = `İndirim: %${score}`;
        }
        if (ball.y > canvas.height + 50) balls.splice(index, 1);
    });

    if (totalSpawnedBalls >= maxBalls && balls.length === 0) {
        showGameOver();
    }
    requestAnimationFrame(updateGame);
}

function showGameOver() {
    if (!isCodeGenerated) {
        finalDiscountCode = generateDiscountCode();
        isCodeGenerated = true;
        localStorage.setItem('gameDiscount', JSON.stringify({ code: finalDiscountCode, discount: score }));
    }
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 35px Arial";
    ctx.textAlign = "center";
    ctx.fillText("OYUN BİTTİ!", canvas.width / 2, canvas.height / 2 - 60);
    ctx.font = "24px Arial";
    ctx.fillText(`Toplam İndirim: %${score}`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.fillStyle = "#ffcc00"; 
    ctx.font = "bold 45px Courier New";
    ctx.fillText(finalDiscountCode, canvas.width / 2, canvas.height / 2 + 40);
    ctx.fillStyle = "#00ff00";
    ctx.font = "16px Arial";
    ctx.fillText("Kopyalamak için tıkla!", canvas.width / 2, canvas.height / 2 + 80);
}


window.addEventListener('mousemove', (e) => {
    basket.x = e.clientX - basket.w / 2;
    basket.y = window.innerHeight - (basket.h + 20);

    if (isCodeGenerated) {
        canvas.style.cursor = 'pointer';
    } else if (gameActive) {
        canvas.style.cursor = 'none'; 
    } else {
        canvas.style.cursor = 'default';
    }
});

canvas.addEventListener('click', () => {
    if (isCodeGenerated && finalDiscountCode !== "") {
        navigator.clipboard.writeText(finalDiscountCode).then(() => {
            alert("Kod kopyalandı: " + finalDiscountCode);
            
            
            gameOverlay.style.display = 'none'; 
            gameActive = false;                 
            enableScroll();                     
            
           
            score = 0;
            totalSpawnedBalls = 0;
            balls = [];
            isCodeGenerated = false;
        });
    }
});


gameBtn.onclick = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gameOverlay.style.display = 'block';
    gameActive = true;
    score = 0;
    totalSpawnedBalls = 0;
    balls = [];
    isCodeGenerated = false;
    finalDiscountCode = "";
    scoreElement.innerText = "0";
    discountElement.innerText = "İndirim: %0";
    disableScroll();
    updateGame();
};


function preventDefaultScroll(e) { e.preventDefault(); }
function disableScroll() {
    window.addEventListener('wheel', preventDefaultScroll, { passive: false });
    window.addEventListener('touchmove', preventDefaultScroll, { passive: false });
}
function enableScroll() {
    window.removeEventListener('wheel', preventDefaultScroll);
    window.removeEventListener('touchmove', preventDefaultScroll);
}
