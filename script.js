var canvas = document.getElementById("myCanvas");
var context = canvas.getContext('2d');

var popSound = document.getElementById("popSound");
var soundEnabled = false;

var gameOverPanel = document.getElementById("gameOverPanel");
var restartBtn = document.getElementById("restartBtn");
var finalScoreText = document.getElementById("finalScoreText");

var bubbles = [];
var mouseX = null, mouseY = null;
var endFrame = 600;
var count = 5;

var score = 0;      // ОНОО
var level = 1;      // ҮЕ

// -------- Бөмбөлөг хөдөлгөх --------
function moveBubble(bubble) {

    // Хагарах анимэйшн
    if (bubble.exploding) {
        bubble.explodeFrame++;
        var r = bubble.r + bubble.explodeFrame * 2;

        context.beginPath();
        context.fillStyle = bubble.color;
        context.arc(bubble.x, bubble.y, r, 0, 2 * Math.PI);
        context.fill();

        if (bubble.explodeFrame > 5) bubble.removed = true;
        return;
    }

    // Энгийн бөмбөлөг
    context.beginPath();
    context.fillStyle = bubble.color;
    context.arc(bubble.x, bubble.y, bubble.r, 0, 2 * Math.PI);

    // Хулгана дарсан уу?
    if (mouseX !== null && mouseY !== null && context.isPointInPath(mouseX, mouseY)) {

        score++;

        if (popSound && soundEnabled) {
            popSound.currentTime = 0;
            popSound.play().catch(function (err) {
                console.log("play алдаа:", err);
            });
        }

        bubble.exploding = true;
        bubble.explodeFrame = 0;
        mouseX = null;
        mouseY = null;
        return;
    }

    context.fill();

    // гэрэл
    context.beginPath();
    context.fillStyle = "#FFFFFF";
    context.arc(bubble.x - bubble.r / 3, bubble.y - bubble.r / 3, bubble.r / 5, 0, 2 * Math.PI);
    context.fill();

    // хананаас ойх
    if (bubble.y <= bubble.r || bubble.y >= canvas.height - bubble.r) bubble.my *= -1;
    if (bubble.x <= bubble.r || bubble.x >= canvas.width - bubble.r) bubble.mx *= -1;

    bubble.x += bubble.mx;
    bubble.y += bubble.my;
}

// -------- Game over --------
function setGameOver() {
    clearInterval(loopId);
    finalScoreText.textContent = "Таны авсан оноо: " + score;
    gameOverPanel.style.display = "block";
}

// -------- Frame render --------
function renderFrame() {
    context.fillStyle = '#000066';
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Бөмбөлгүүдийг дүрслэх
    for (var i = 0; i < bubbles.length; i++) {
        moveBubble(bubbles[i]);
    }

    // устсан бөмбөлгүүдийг хасна
    bubbles = bubbles.filter(function (b) { return !b.removed; });

    // бүх бөмбөлөг дууссан → дараагийн үе
    if (bubbles.length === 0) {
        count += 2;
        level++;
        createBubbles();
    }

    // 10 сек дууссан + бөмбөлөг үлдсэн бол Game Over
    if (--endFrame === 0) {
        if (bubbles.length > 0) {
            setGameOver();
            return;
        }
    }

    drawText();
}

// -------- Текст гаргах --------
function drawText() {
    context.save();

    context.fillStyle = "white";
    context.font = "18px Arial";
    context.textAlign = "left";
    context.textBaseline = "top";

    var scoreText = "Оноо: " + score;
    var levelText = "Үе: " + level;
    var timeText = "Үлдсэн хугацаа: " + Math.floor(endFrame / 60) + " сек";

    // Зүүн дээд булан
    context.fillText(scoreText, 10, 10);
    context.fillText(levelText, 10, 35);

    // Баруун дээд булан
    var timeWidth = context.measureText(timeText).width;
    context.fillText(timeText, canvas.width - timeWidth - 10, 10);

    context.restore();
}

// -------- Бөмбөлөг үүсгэх --------
function createBubbles() {
    bubbles = [];
    for (var i = 0; i < count; i++) {
        var radius = 20 + Math.random() * 20;

        var mx = Math.floor(Math.random() * 6) - 3;
        var my = Math.floor(Math.random() * 6) - 3;
        if (mx === 0 && my === 0) mx = 1;

        bubbles.push({
            x: radius + Math.random() * (canvas.width - 2 * radius),
            y: radius + Math.random() * (canvas.height - 2 * radius),
            mx: mx,
            my: my,
            r: radius,
            color: 'rgb(' +
                Math.floor(Math.random() * 255) + ',' +
                Math.floor(Math.random() * 255) + ',' +
                Math.floor(Math.random() * 255) + ')',
            removed: false,
            exploding: false,
            explodeFrame: 0
        });
    }
    endFrame = 600;
}

// -------- Эхлүүлэх --------
createBubbles();
var loopId = setInterval(renderFrame, 16);

// --- Canvas дээр click хийхэд дууг unlock хийх + координат авах ---
canvas.addEventListener('mousedown', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (!soundEnabled && popSound) {
        popSound.play()
            .then(function () {
                popSound.pause();
                popSound.currentTime = 0;
                soundEnabled = true;
            })
            .catch(function (err) {
                console.log("Sound unlock алдаа: ", err);
            });
    }
});

// --- Шинээр эхлэх товч ---
restartBtn.addEventListener("click", function () {
    score = 0;
    level = 1;
    count = 5;
    bubbles = [];
    endFrame = 600;

    gameOverPanel.style.display = "none";

    createBubbles();
    loopId = setInterval(renderFrame, 16);
});