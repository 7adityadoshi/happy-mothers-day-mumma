document.getElementById('start-screen').addEventListener('click', function() {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch((e) => console.log(e));
  }
  this.style.opacity = '0';
  setTimeout(() => {
    this.classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
  }, 500);
  const audio = document.getElementById('bg-music');
  audio.volume = 0.5;
  audio.play().catch((e) => console.log(e));
});

const audio = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
let isMuted = false;

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.innerText = isMuted ? "Unmute Audio" : "Mute Audio";
});

window.addEventListener('scroll', () => {
  if (window.scrollY > window.innerHeight * 0.5) {
    audio.pause();
  } else {
    if (!isMuted) audio.play();
  }
});

function spawnHeart() {
  const container = document.getElementById('hearts-overlay');
  const heart = document.createElement('div');
  const icons = ['🤍', '💖', '💗', '🌸'];
  heart.innerText = icons[Math.floor(Math.random() * icons.length)];
  heart.className = 'heart';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = Math.random() * 3 + 4 + 's';
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 7000);
}
setInterval(spawnHeart, 300);

const carousel = document.getElementById('carousel');
let carouselInterval;

function startCarouselAutoScroll() {
  carouselInterval = setInterval(() => {
    if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth - 10) {
      carousel.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carousel.scrollBy({ left: carousel.clientWidth, behavior: 'smooth' });
    }
  }, 3000);
}

startCarouselAutoScroll();

carousel.addEventListener('touchstart', () => {
  clearInterval(carouselInterval);
});

carousel.addEventListener('touchend', () => {
  setTimeout(startCarouselAutoScroll, 30000);
});

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const avatar = document.getElementById('player-avatar');
const scoreDisplay = document.getElementById('score-display');
const highscoreDisplay = document.getElementById('highscore-display');
const controlsDiv = document.getElementById('game-controls');

let animationId;
let activeGame = '';
let isGameRunning = false;
let gameScore = 0;
let frameCount = 0;
let flappyScoreTimer = 0;
let playerObj = { x: 50, y: 150, size: 40, velocityY: 0, velocityX: 0, lane: 1 };
let gameEntities = [];

const gameRules = {
  'Subway Surfers': 'Use the Left and Right buttons to switch lanes. Avoid shopping carts and collect gift bags for points.',
  'Flappy Bird': 'Tap the game area to fly upwards. Avoid the alarm clocks. Points will increase automatically over time.'
};

function updateHighScore(score, gameName) {
  let currentHigh = localStorage.getItem(gameName + 'HighScore') || 0;
  if (score > currentHigh) {
    localStorage.setItem(gameName + 'HighScore', score);
    currentHigh = score;
  }
  highscoreDisplay.innerText = currentHigh;
}

function initializeGame(name) {
  activeGame = name;
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('game-title-display').innerText = name;
  document.getElementById('game-instruction').innerText = gameRules[name];
  document.getElementById('start-play-btn').style.display = 'block';
  document.getElementById('game-over-message').classList.add('hidden');
  canvas.style.display = 'none';
  controlsDiv.classList.add('hidden');
  
  let savedHigh = localStorage.getItem(name + 'HighScore') || 0;
  highscoreDisplay.innerText = savedHigh;
  scoreDisplay.innerText = 0;

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  if (animationId) cancelAnimationFrame(animationId);
}

function resizeCanvas() {
  const containerWidth = document.getElementById('game-screen').clientWidth - 40;
  const containerHeight = document.getElementById('game-screen').clientHeight * 0.6;
  canvas.width = containerWidth;
  canvas.height = containerHeight;
}

function exitGame() {
  document.getElementById('game-screen').classList.add('hidden');
  isGameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', resizeCanvas);
}

document.getElementById('start-play-btn').addEventListener('click', function() {
  this.style.display = 'none';
  canvas.style.display = 'block';
  if (activeGame === 'Subway Surfers') {
    controlsDiv.classList.remove('hidden');
  }
  startGameLoop();
});

function startGameLoop() {
  isGameRunning = true;
  gameScore = 0;
  frameCount = 0;
  flappyScoreTimer = 0;
  scoreDisplay.innerText = gameScore;
  gameEntities = [];
  document.getElementById('game-over-message').classList.add('hidden');
  
  if (activeGame === 'Subway Surfers') {
    playerObj = { x: canvas.width / 2 - 20, y: canvas.height - 80, size: 40, lane: 1 };
  } else {
    playerObj = { x: canvas.width / 4, y: canvas.height / 2, size: 40, velocityY: 0 };
  }

  function renderLoop() {
    if (!isGameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;
    
    if (activeGame === 'Subway Surfers') processSubwaySurfers();
    if (activeGame === 'Flappy Bird') processFlappyBird();

    ctx.drawImage(avatar, playerObj.x, playerObj.y, playerObj.size, playerObj.size);
    
    if (isGameRunning) animationId = requestAnimationFrame(renderLoop);
  }
  renderLoop();
}

function triggerGameOver() {
  isGameRunning = false;
  document.getElementById('game-over-message').classList.remove('hidden');
  controlsDiv.classList.add('hidden');
  updateHighScore(gameScore, activeGame);
}

function processSubwaySurfers() {
  const laneWidth = canvas.width / 3;
  const lanePositions = [laneWidth / 2 - 20, laneWidth + laneWidth / 2 - 20, laneWidth * 2 + laneWidth / 2 - 20];
  playerObj.x = lanePositions[playerObj.lane];

  if (frameCount % 50 === 0) {
    let randomLane = Math.floor(Math.random() * 3);
    let isItem = Math.random() > 0.5;
    gameEntities.push({
      x: lanePositions[randomLane],
      y: -40,
      size: 40,
      type: isItem ? 'item' : 'danger',
      symbol: isItem ? '🛍️' : '🛒'
    });
  }
  
  ctx.strokeStyle = 'white';
  ctx.beginPath(); ctx.moveTo(laneWidth, 0); ctx.lineTo(laneWidth, canvas.height); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(laneWidth * 2, 0); ctx.lineTo(laneWidth * 2, canvas.height); ctx.stroke();

  updateEntities(0, 5 + (frameCount / 1000));
}

function processFlappyBird() {
  playerObj.velocityY += 0.4;
  playerObj.y += playerObj.velocityY;
  if (playerObj.y > canvas.height || playerObj.y < 0) triggerGameOver();

  flappyScoreTimer++;
  if (flappyScoreTimer >= 120) {
    gameScore += 1;
    scoreDisplay.innerText = gameScore;
    flappyScoreTimer = 0;
  }

  if (frameCount % 80 === 0) {
    gameEntities.push({ x: canvas.width, y: Math.random() * (canvas.height - 60), size: 40, type: 'danger', symbol: '⏰' });
  }
  updateEntities(-3 - (frameCount / 1000), 0);
}

function updateEntities(speedX, speedY) {
  for (let i = 0; i < gameEntities.length; i++) {
    let entity = gameEntities[i];
    entity.x += speedX;
    entity.y += speedY;

    ctx.font = '32px Arial';
    ctx.fillText(entity.symbol, entity.x, entity.y + 30);

    let collisionBuffer = 10;
    if (playerObj.x + collisionBuffer < entity.x + entity.size && 
        playerObj.x + playerObj.size - collisionBuffer > entity.x &&
        playerObj.y + collisionBuffer < entity.y + entity.size && 
        playerObj.y + playerObj.size - collisionBuffer > entity.y) {
      
      if (entity.type === 'danger') {
        triggerGameOver();
      } else if (entity.type === 'item') {
        gameScore += 10;
        scoreDisplay.innerText = gameScore;
        gameEntities.splice(i, 1);
        i--;
      }
    }
  }
}

document.getElementById('btn-left').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane > 0) playerObj.lane--;
});
document.getElementById('btn-left').addEventListener('click', () => {
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane > 0) playerObj.lane--;
});

document.getElementById('btn-right').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane < 2) playerObj.lane++;
});
document.getElementById('btn-right').addEventListener('click', () => {
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane < 2) playerObj.lane++;
});

canvas.addEventListener('mousedown', executeAction);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); executeAction(e.touches[0]); }, {passive: false});

function executeAction(e) {
  if (!isGameRunning) return;
  if (activeGame === 'Flappy Bird') {
    playerObj.velocityY = -8;
  }
}
