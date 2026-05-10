// START SCREEN

document.getElementById("start-screen").addEventListener("click", function () {

  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(() => {});
  }

  this.style.opacity = "0";

  setTimeout(() => {
    this.classList.add("hidden");
    document.getElementById("main-content").classList.remove("hidden");
  }, 500);

  audio.volume = 0.5;
  audio.play().catch(() => {});
});

// AUDIO

const audio = document.getElementById("bg-music");
const muteBtn = document.getElementById("mute-btn");

let isMuted = false;

muteBtn.addEventListener("click", () => {

  isMuted = !isMuted;

  audio.muted = isMuted;

  muteBtn.innerText = isMuted
    ? "Unmute Audio"
    : "Mute Audio";
});

// HEARTS

function spawnHeart() {

  const container = document.getElementById("hearts-overlay");

  const heart = document.createElement("div");

  const icons = ["🤍", "💖", "💗", "🌸"];

  heart.innerText =
    icons[Math.floor(Math.random() * icons.length)];

  heart.className = "heart";

  heart.style.left = Math.random() * 100 + "vw";

  heart.style.animationDuration =
    Math.random() * 3 + 4 + "s";

  container.appendChild(heart);

  setTimeout(() => {
    heart.remove();
  }, 7000);
}

setInterval(spawnHeart, 300);

// CAROUSEL

const carousel = document.getElementById("carousel");

let carouselInterval;

function startCarouselAutoScroll() {

  carouselInterval = setInterval(() => {

    if (
      carousel.scrollLeft + carousel.clientWidth >=
      carousel.scrollWidth - 10
    ) {

      carousel.scrollTo({
        left: 0,
        behavior: "smooth",
      });

    } else {

      carousel.scrollBy({
        left: carousel.clientWidth,
        behavior: "smooth",
      });
    }

  }, 3000);
}

startCarouselAutoScroll();

// GAME

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const avatar = document.getElementById("player-avatar");

const scoreDisplay =
  document.getElementById("score-display");

const highScoreDisplay =
  document.getElementById("high-score-display");

const leftBtn =
  document.getElementById("left-btn");

const rightBtn =
  document.getElementById("right-btn");

let animationId;

let activeGame = "";

let gameScore = 0;

let frameCount = 0;

let isGameRunning = false;

let gameEntities = [];

let playerObj = {};

const gameRules = {

  "Subway Surfers":
    "Controls: Use left/right buttons or tap left/right side of screen. Avoid carts and collect gems 💎.",

  "Flappy Bird":
    "Controls: Tap anywhere to fly upwards. Survive as long as possible."
};

function resizeCanvas() {

  canvas.width = window.innerWidth - 30;

  canvas.height = window.innerHeight - 280;
}

resizeCanvas();

window.addEventListener("resize", resizeCanvas);

// INIT GAME

function initializeGame(name) {

  activeGame = name;

  document
    .getElementById("game-screen")
    .classList.remove("hidden");

  document.getElementById(
    "game-title-display"
  ).innerText = name;

  document.getElementById(
    "game-instruction"
  ).innerText = gameRules[name];

  document.getElementById(
    "start-play-btn"
  ).style.display = "block";

  document.getElementById(
    "game-over-message"
  ).classList.add("hidden");

  canvas.style.display = "none";

  loadHighScore();

  if (name === "Subway Surfers") {

    document
      .getElementById("control-panel")
      .classList.remove("hidden");

  } else {

    document
      .getElementById("control-panel")
      .classList.add("hidden");
  }

  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}

// EXIT

function exitGame() {

  document
    .getElementById("game-screen")
    .classList.add("hidden");

  isGameRunning = false;

  if (animationId) {
    cancelAnimationFrame(animationId);
  }
}

// START

document.getElementById("start-play-btn")
.addEventListener("click", function () {

  this.style.display = "none";

  canvas.style.display = "block";

  startGameLoop();
});

// GAME LOOP

function startGameLoop() {

  resizeCanvas();

  isGameRunning = true;

  gameScore = 0;

  frameCount = 0;

  gameEntities = [];

  scoreDisplay.innerText = gameScore;

  document
    .getElementById("game-over-message")
    .classList.add("hidden");

  if (activeGame === "Subway Surfers") {

    playerObj = {
      x: canvas.width / 2,
      y: canvas.height - 120,
      size: 55,
      lane: 1
    };

  } else {

    playerObj = {
      x: 80,
      y: 150,
      size: 55,
      velocityY: 0
    };
  }

  function renderLoop() {

    if (!isGameRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    frameCount++;

    if (activeGame === "Subway Surfers") {
      processSubwaySurfers();
    }

    if (activeGame === "Flappy Bird") {
      processFlappyBird();
    }

    ctx.save();

    ctx.beginPath();

    ctx.arc(
      playerObj.x + playerObj.size / 2,
      playerObj.y + playerObj.size / 2,
      playerObj.size / 2,
      0,
      Math.PI * 2
    );

    ctx.clip();

    ctx.drawImage(
      avatar,
      playerObj.x,
      playerObj.y,
      playerObj.size,
      playerObj.size
    );

    ctx.restore();

    animationId = requestAnimationFrame(renderLoop);
  }

  renderLoop();
}

// HIGH SCORE

function loadHighScore() {

  const score =
    localStorage.getItem(activeGame + "_highscore") || 0;

  highScoreDisplay.innerText = score;
}

function saveHighScore() {

  const current =
    localStorage.getItem(activeGame + "_highscore") || 0;

  if (gameScore > current) {

    localStorage.setItem(
      activeGame + "_highscore",
      gameScore
    );

    highScoreDisplay.innerText = gameScore;
  }
}

// GAME OVER

function triggerGameOver() {

  isGameRunning = false;

  saveHighScore();

  document
    .getElementById("game-over-message")
    .classList.remove("hidden");
}

// SUBWAY

function processSubwaySurfers() {

  const lanePositions = [
    canvas.width * 0.2,
    canvas.width * 0.5 - 25,
    canvas.width * 0.8 - 50
  ];

  playerObj.x = lanePositions[playerObj.lane];

  // SPAWN

  if (frameCount % 50 === 0) {

    const randomLane =
      Math.floor(Math.random() * 3);

    const reward =
      Math.random() > 0.5;

    gameEntities.push({

      x: lanePositions[randomLane],
      y: -40,
      size: 40,

      type: reward
        ? "reward"
        : "danger",

      symbol: reward
        ? "💎"
        : "🛒"
    });
  }

  // LANES

  ctx.strokeStyle = "rgba(255,255,255,0.3)";
  ctx.lineWidth = 4;

  ctx.beginPath();
  ctx.moveTo(canvas.width / 3, 0);
  ctx.lineTo(canvas.width / 3, canvas.height);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(canvas.width / 1.5, 0);
  ctx.lineTo(canvas.width / 1.5, canvas.height);
  ctx.stroke();

  updateEntities(0, 7);
}

// FLAPPY

function processFlappyBird() {

  playerObj.velocityY += 0.35;

  playerObj.y += playerObj.velocityY;

  if (
    playerObj.y > canvas.height ||
    playerObj.y < 0
  ) {

    triggerGameOver();
  }

  // SCORE EVERY 2 SECONDS

  if (frameCount % 120 === 0) {

    gameScore += 1;

    scoreDisplay.innerText = gameScore;
  }

  // OBSTACLES

  if (frameCount % 90 === 0) {

    gameEntities.push({

      x: canvas.width,
      y: Math.random() * (canvas.height - 120),

      size: 40,

      type: "danger",

      symbol: "⏰"
    });
  }

  updateEntities(-5, 0);
}

// ENTITIES

function updateEntities(speedX, speedY) {

  for (let i = 0; i < gameEntities.length; i++) {

    const entity = gameEntities[i];

    entity.x += speedX;

    entity.y += speedY;

    ctx.font = "38px Arial";

    ctx.fillText(
      entity.symbol,
      entity.x,
      entity.y + 30
    );

    // COLLISION

    if (
      playerObj.x < entity.x + entity.size &&
      playerObj.x + playerObj.size > entity.x &&
      playerObj.y < entity.y + entity.size &&
      playerObj.y + playerObj.size > entity.y
    ) {

      if (entity.type === "danger") {

        triggerGameOver();
      }

      if (entity.type === "reward") {

        gameScore += 10;

        scoreDisplay.innerText = gameScore;

        gameEntities.splice(i, 1);

        i--;
      }
    }
  }
}

// CONTROLS

canvas.addEventListener("mousedown", executeAction);

canvas.addEventListener(
  "touchstart",
  (e) => {

    e.preventDefault();

    executeAction(e.touches[0]);

  },
  { passive: false }
);

leftBtn.addEventListener("click", () => {

  if (
    activeGame === "Subway Surfers" &&
    playerObj.lane > 0
  ) {

    playerObj.lane--;
  }
});

rightBtn.addEventListener("click", () => {

  if (
    activeGame === "Subway Surfers" &&
    playerObj.lane < 2
  ) {

    playerObj.lane++;
  }
});

function executeAction(e) {

  if (!isGameRunning) return;

  const rect = canvas.getBoundingClientRect();

  const touchX =
    (e.clientX || e.pageX) - rect.left;

  if (activeGame === "Flappy Bird") {

    playerObj.velocityY = -7;
  }

  if (activeGame === "Subway Surfers") {

    if (
      touchX < canvas.width / 2 &&
      playerObj.lane > 0
    ) {

      playerObj.lane--;
    }

    if (
      touchX > canvas.width / 2 &&
      playerObj.lane < 2
    ) {

      playerObj.lane++;
    }
  }
}
