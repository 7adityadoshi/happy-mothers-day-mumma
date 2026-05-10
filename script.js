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

let animationId;
let activeGame = '';
let isGameRunning = false;
let gameScore = 0;
let frameCount = 0;
let playerObj = { x: 50, y: 150, size: 30, velocityY: 0, velocityX: 0, lane: 1 };
let gameEntities = [];

const gameRules = {
  'Escape Work': 'Tap to fly upwards. Avoid laptops and folders. Collect tea.',
  'Subway Surfers': 'Tap left or right side to switch lanes. Avoid carts.',
  'Angry Birds': 'Tap to launch avatar at baskets.',
  'Flappy Bird': 'Tap to bounce on desks. Avoid clocks.'
};

function initializeGame(name) {
  activeGame = name;
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('game-title-display').innerText = name;
  document.getElementById('game-instruction').innerText = gameRules[name];
  document.getElementById('start-play-btn').style.display = 'block';
  document.getElementById('game-over-message').classList.add('hidden');
  canvas.style.display = 'none';
  if (animationId) cancelAnimationFrame(animationId);
}

function exitGame() {
  document.getElementById('game-screen').classList.add('hidden');
  isGameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
}

document.getElementById('start-play-btn').addEventListener('click', function() {
  this.style.display = 'none';
  canvas.style.display = 'block';
  startGameLoop();
});

function startGameLoop() {
  isGameRunning = true;
  gameScore = 0;
  frameCount = 0;
  scoreDisplay.innerText = gameScore;
  gameEntities = [];
  document.getElementById('game-over-message').classList.add('hidden');
  
  if (activeGame === 'Subway Surfers') {
    playerObj = { x: 135, y: 320, size: 30, lane: 1 };
  } else {
    playerObj = { x: 50, y: 150, size: 30, velocityY: 0 };
  }

  function renderLoop() {
    if (!isGameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;
    
    if (activeGame === 'Escape Work') processEscapeWork();
    if (activeGame === 'Subway Surfers') processSubwaySurfers();
    if (activeGame === 'Angry Birds') processAngryBirds();
    if (activeGame === 'Flappy Bird') processFlappyBird();

    ctx.drawImage(avatar, playerObj.x, playerObj.y, playerObj.size, playerObj.size);
    
    if (isGameRunning) animationId = requestAnimationFrame(renderLoop);
  }
  renderLoop();
}

function triggerGameOver() {
  isGameRunning = false;
  document.getElementById('game-over-message').classList.remove('hidden');
}

function processEscapeWork() {
  playerObj.velocityY += 0.3;
  playerObj.y += playerObj.velocityY;
  if (playerObj.y > canvas.height || playerObj.y < 0) triggerGameOver();

  if (frameCount % 90 === 0) {
    let isItem = Math.random() > 0.6;
    gameEntities.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - 40),
      size: 30,
      type: isItem ? 'item' : 'danger',
      symbol: isItem ? '☕' : '💻'
    });
  }
  updateEntities(-3, 0);
}

function processSubwaySurfers() {
  const lanePositions = [35, 135, 235];
  playerObj.x = lanePositions[playerObj.lane];

  if (frameCount % 60 === 0) {
    let randomLane = Math.floor(Math.random() * 3);
    gameEntities.push({
      x: lanePositions[randomLane],
      y: -30,
      size: 30,
      type: 'danger',
      symbol: '🛒'
    });
  }
  
  ctx.strokeStyle = 'white';
  ctx.beginPath(); ctx.moveTo(100, 0); ctx.lineTo(100, 400); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(200, 0); ctx.lineTo(200, 400); ctx.stroke();

  updateEntities(0, 4);
}

function processAngryBirds() {
  if (frameCount === 1) {
    gameEntities.push({ x: 220, y: 250, size: 40, type: 'danger', symbol: '🧺' });
    playerObj.x = 20; playerObj.y = 250; playerObj.velocityX = 0; playerObj.velocityY = 0;
  }
  
  playerObj.velocityY += 0.2;
  playerObj.x += playerObj.velocityX;
  playerObj.y += playerObj.velocityY;

  if (playerObj.y > canvas.height) {
    playerObj.y = 250; playerObj.x = 20; playerObj.velocityX = 0; playerObj.velocityY = 0;
  }

  updateEntities(0, 0);
}

function processFlappyBird() {
  playerObj.velocityY += 0.3;
  playerObj.y += playerObj.velocityY;
  if (playerObj.y > canvas.height || playerObj.y < 0) triggerGameOver();

  if (frameCount % 100 === 0) {
    gameEntities.push({ x: canvas.width, y: Math.random() * 300, size: 30, type: 'danger', symbol: '⏰' });
    gameEntities.push({ x: canvas.width, y: Math.random() * 300 + 50, size: 30, type: 'bounce', symbol: '🪑' });
  }
  updateEntities(-2, 0);
}

function updateEntities(speedX, speedY) {
  for (let i = 0; i < gameEntities.length; i++) {
    let entity = gameEntities[i];
    entity.x += speedX;
    entity.y += speedY;

    ctx.font = '28px Arial';
    ctx.fillText(entity.symbol, entity.x, entity.y + 25);

    if (playerObj.x < entity.x + entity.size && playerObj.x + playerObj.size > entity.x &&
        playerObj.y < entity.y + entity.size && playerObj.y + playerObj.size > entity.y) {
      if (entity.type === 'danger') {
        triggerGameOver();
      } else if (entity.type === 'item') {
        gameScore += 10;
        scoreDisplay.innerText = gameScore;
        gameEntities.splice(i, 1);
        i--;
      } else if (entity.type === 'bounce') {
        playerObj.velocityY = -6;
      }
    }
  }
}

canvas.addEventListener('mousedown', executeAction);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); executeAction(e.touches[0]); }, {passive: false});

function executeAction(e) {
  if (!isGameRunning) return;
  
  let rect = canvas.getBoundingClientRect();
  let touchX = (e.clientX || e.pageX) - rect.left;

  if (activeGame === 'Escape Work' || activeGame === 'Flappy Bird') {
    playerObj.velocityY = -6;
  } else if (activeGame === 'Subway Surfers') {
    if (touchX < canvas.width / 2 && playerObj.lane > 0) playerObj.lane--;
    if (touchX > canvas.width / 2 && playerObj.lane < 2) playerObj.lane++;
  } else if (activeGame === 'Angry Birds') {
    playerObj.velocityX = 6;
    playerObj.velocityY = -5;
  }
}
