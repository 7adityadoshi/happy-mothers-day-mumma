/* ═══════════════════════════════════════════════
   START SCREEN
═══════════════════════════════════════════════ */
document.getElementById('start-screen').addEventListener('click', function () {
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch(e => console.log(e));
  }
  this.style.opacity = '0';
  setTimeout(() => {
    this.classList.add('hidden');
    document.getElementById('main-content').classList.remove('hidden');
  }, 500);
  const audio = document.getElementById('bg-music');
  audio.volume = 0.5;
  audio.play().catch(e => console.log(e));
});

/* ═══════════════════════════════════════════════
   AUDIO
═══════════════════════════════════════════════ */
const audio = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
let isMuted = false;

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  audio.muted = isMuted;
  muteBtn.innerText = isMuted ? '🔇 Unmute' : '🔊 Mute';
});

/* ═══════════════════════════════════════════════
   HEARTS
═══════════════════════════════════════════════ */
function spawnHeart() {
  const container = document.getElementById('hearts-overlay');
  const heart = document.createElement('div');
  const icons = ['🤍', '💖', '💗', '🌸', '🌺', '✨'];
  heart.innerText = icons[Math.floor(Math.random() * icons.length)];
  heart.className = 'heart';
  heart.style.left = Math.random() * 100 + 'vw';
  heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
  container.appendChild(heart);
  setTimeout(() => heart.remove(), 7000);
}
setInterval(spawnHeart, 350);

/* ═══════════════════════════════════════════════
   CAROUSEL
═══════════════════════════════════════════════ */
const carousel = document.getElementById('carousel');
const dotsContainer = document.getElementById('carousel-dots');
const imageCount = carousel.querySelectorAll('.carousel-image').length;
let carouselInterval;
let currentSlide = 0;

// Build dots
for (let i = 0; i < imageCount; i++) {
  const dot = document.createElement('div');
  dot.className = 'dot' + (i === 0 ? ' active' : '');
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
}

function goToSlide(index) {
  currentSlide = index;
  carousel.scrollTo({ left: carousel.clientWidth * index, behavior: 'smooth' });
  updateDots();
}

function updateDots() {
  dotsContainer.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

function startCarouselAutoScroll() {
  carouselInterval = setInterval(() => {
    currentSlide = (currentSlide + 1) % imageCount;
    goToSlide(currentSlide);
  }, 3000);
}

startCarouselAutoScroll();

carousel.addEventListener('touchstart', () => clearInterval(carouselInterval));
carousel.addEventListener('touchend', () => {
  // Sync currentSlide after manual swipe
  setTimeout(() => {
    currentSlide = Math.round(carousel.scrollLeft / carousel.clientWidth);
    updateDots();
    setTimeout(startCarouselAutoScroll, 5000);
  }, 400);
});

carousel.addEventListener('scroll', () => {
  const idx = Math.round(carousel.scrollLeft / carousel.clientWidth);
  if (idx !== currentSlide) { currentSlide = idx; updateDots(); }
});

/* ═══════════════════════════════════════════════
   HIGH SCORE STORAGE
═══════════════════════════════════════════════ */
function getHighScore(game) {
  return parseInt(localStorage.getItem('hs_' + game) || '0', 10);
}

function setHighScore(game, score) {
  if (score > getHighScore(game)) {
    localStorage.setItem('hs_' + game, score);
  }
}

/* ═══════════════════════════════════════════════
   GAME ENGINE GLOBALS
═══════════════════════════════════════════════ */
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const avatar = document.getElementById('player-avatar');
const scoreDisplay = document.getElementById('score-display');
const highscoreDisplay = document.getElementById('highscore-display');

let animationId;
let activeGame = '';
let isGameRunning = false;
let gameScore = 0;
let frameCount = 0;
let playerObj = {};
let gameEntities = [];
let flappyTimer = 0;

const gameInstructions = {
  'Subway Surfers': `
    <span class="inst-title">🏃 Subway Surfers</span>
    Dodge the shopping carts coming your way.<br>
    Collect 🌟 stars to earn points!<br><br>
    <b>Controls:</b><br>
    ◀ ▶ Buttons to switch lanes<br>
    or tap left / right side of screen
  `,
  'Flappy Bird': `
    <span class="inst-title">🐦 Flappy Bird</span>
    Stay airborne as long as possible!<br>
    Avoid the clocks falling from above.<br>
    Points increase every 2 seconds of survival.<br><br>
    <b>Controls:</b><br>
    Tap anywhere on screen to flap up
  `
};

/* ─── Resize canvas to full available screen space ─── */
function resizeCanvas() {
  const topbar = document.querySelector('.game-topbar');
  const controls = document.getElementById('subway-controls');
  const topbarH = topbar ? topbar.offsetHeight : 0;
  const controlsH = (controls && !controls.classList.contains('hidden')) ? controls.offsetHeight : 0;

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - topbarH - controlsH;
}

/* ═══════════════════════════════════════════════
   INIT / EXIT GAME
═══════════════════════════════════════════════ */
function initializeGame(name) {
  activeGame = name;
  const gameScreen = document.getElementById('game-screen');
  gameScreen.classList.remove('hidden');
  document.getElementById('game-title-display').innerText = name;
  document.getElementById('game-instruction-box').innerHTML = gameInstructions[name];
  document.getElementById('start-play-btn').style.display = 'block';
  document.getElementById('game-start-panel').style.display = 'flex';
  document.getElementById('game-over-message').classList.add('hidden');
  canvas.style.display = 'none';

  // Show/hide arrow buttons
  const subwayCtrl = document.getElementById('subway-controls');
  if (name === 'Subway Surfers') {
    subwayCtrl.classList.remove('hidden');
  } else {
    subwayCtrl.classList.add('hidden');
  }

  // Show high score
  highscoreDisplay.innerText = getHighScore(name);
  scoreDisplay.innerText = 0;

  if (animationId) cancelAnimationFrame(animationId);
}

function exitGame() {
  document.getElementById('game-screen').classList.add('hidden');
  isGameRunning = false;
  if (animationId) cancelAnimationFrame(animationId);
}

document.getElementById('start-play-btn').addEventListener('click', function () {
  document.getElementById('game-start-panel').style.display = 'none';
  canvas.style.display = 'block';
  resizeCanvas();
  startGameLoop();
});

/* ═══════════════════════════════════════════════
   GAME LOOP
═══════════════════════════════════════════════ */
function startGameLoop() {
  isGameRunning = true;
  gameScore = 0;
  frameCount = 0;
  flappyTimer = 0;
  scoreDisplay.innerText = 0;
  gameEntities = [];
  document.getElementById('game-over-message').classList.add('hidden');
  resizeCanvas();

  if (activeGame === 'Subway Surfers') {
    const lanes = getLanes();
    playerObj = { x: lanes[1], y: canvas.height - 80, size: 44, lane: 1 };
  } else {
    playerObj = { x: 60, y: canvas.height / 2, size: 44, velocityY: 0 };
  }

  function renderLoop() {
    if (!isGameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    if (activeGame === 'Subway Surfers') processSubwaySurfers();
    if (activeGame === 'Flappy Bird') processFlappyBird();

    // Draw player avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(playerObj.x + playerObj.size / 2, playerObj.y + playerObj.size / 2, playerObj.size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, playerObj.x, playerObj.y, playerObj.size, playerObj.size);
    ctx.restore();

    if (isGameRunning) animationId = requestAnimationFrame(renderLoop);
  }
  renderLoop();
}

function triggerGameOver() {
  isGameRunning = false;
  setHighScore(activeGame, gameScore);
  highscoreDisplay.innerText = getHighScore(activeGame);
  const goPanel = document.getElementById('game-over-message');
  document.getElementById('go-score-text').innerText = `Your score: ${gameScore}  •  Best: ${getHighScore(activeGame)}`;
  goPanel.classList.remove('hidden');
}

/* ═══════════════════════════════════════════════
   SUBWAY SURFERS
═══════════════════════════════════════════════ */
function getLanes() {
  const third = canvas.width / 3;
  return [third * 0.5 - 22, third * 1.5 - 22, third * 2.5 - 22];
}

function processSubwaySurfers() {
  const lanes = getLanes();
  const targetX = lanes[playerObj.lane];
  playerObj.x += (targetX - playerObj.x) * 0.18; // smooth lane transition

  // Draw road
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#1a0a2e');
  grad.addColorStop(1, '#2d1b4e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Lane dividers
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.setLineDash([30, 25]);
  ctx.lineWidth = 2;
  for (let lx of [canvas.width / 3, (canvas.width / 3) * 2]) {
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx, canvas.height);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Score every 2 seconds (120 frames at ~60fps)
  if (frameCount % 120 === 0) {
    gameScore += 5;
    scoreDisplay.innerText = gameScore;
  }

  // Spawn carts (danger)
  if (frameCount % 70 === 0) {
    const rl = Math.floor(Math.random() * 3);
    gameEntities.push({ x: lanes[rl], y: -50, size: 44, type: 'danger', symbol: '🛒', speed: 5 + Math.floor(gameScore / 50) * 0.5 });
  }

  // Spawn stars (collectible)
  if (frameCount % 90 === 0) {
    const rl = Math.floor(Math.random() * 3);
    gameEntities.push({ x: lanes[rl], y: -50, size: 36, type: 'item', symbol: '🌟', speed: 4 });
  }

  // Update and draw entities
  for (let i = gameEntities.length - 1; i >= 0; i--) {
    const e = gameEntities[i];
    e.y += e.speed;
    ctx.font = e.size + 'px Arial';
    ctx.fillText(e.symbol, e.x, e.y + e.size);

    // Off-screen cleanup
    if (e.y > canvas.height + 60) { gameEntities.splice(i, 1); continue; }

    // Collision
    if (rectsOverlap(playerObj, e)) {
      if (e.type === 'danger') {
        shakeCanvas();
        triggerGameOver();
        return;
      } else if (e.type === 'item') {
        gameScore += 20;
        scoreDisplay.innerText = gameScore;
        gameEntities.splice(i, 1);
        spawnCollectParticle(e.x + e.size / 2, e.y);
      }
    }
  }
}

/* ═══════════════════════════════════════════════
   FLAPPY BIRD
═══════════════════════════════════════════════ */
function processFlappyBird() {
  // Sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grad.addColorStop(0, '#0d0025');
  grad.addColorStop(1, '#1a0a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Gravity
  playerObj.velocityY += 0.38;
  playerObj.y += playerObj.velocityY;

  if (playerObj.y > canvas.height - playerObj.size || playerObj.y < 0) {
    triggerGameOver();
    return;
  }

  // Time-based scoring (every 2 seconds / 120 frames)
  flappyTimer++;
  if (flappyTimer % 120 === 0) {
    gameScore += 10;
    scoreDisplay.innerText = gameScore;
    spawnScorePopup(canvas.width / 2, 60, '+10');
  }

  // Spawn obstacles
  if (frameCount % 110 === 0) {
    gameEntities.push({ x: canvas.width, y: Math.random() * (canvas.height - 80), size: 40, type: 'danger', symbol: '⏰', speed: 3.5 });
  }

  // Update entities
  for (let i = gameEntities.length - 1; i >= 0; i--) {
    const e = gameEntities[i];
    e.x -= e.speed;
    ctx.font = e.size + 'px Arial';
    ctx.fillText(e.symbol, e.x, e.y + e.size);

    if (e.x + e.size < 0) { gameEntities.splice(i, 1); continue; }

    if (rectsOverlap(playerObj, e)) {
      triggerGameOver();
      return;
    }
  }

  // Score popup display
  updateScorePopups();
}

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
function rectsOverlap(a, b) {
  const margin = 10; // slight forgiveness
  return (
    a.x + margin < b.x + b.size - margin &&
    a.x + a.size - margin > b.x + margin &&
    a.y + margin < b.y + b.size - margin &&
    a.y + a.size - margin > b.y + margin
  );
}

// Canvas shake on death
let shaking = false;
function shakeCanvas() {
  if (shaking) return;
  shaking = true;
  let count = 0;
  const orig = { x: canvas.style.left, y: canvas.style.top };
  canvas.style.position = 'relative';
  const shake = setInterval(() => {
    canvas.style.left = (Math.random() * 10 - 5) + 'px';
    canvas.style.top = (Math.random() * 6 - 3) + 'px';
    count++;
    if (count > 10) {
      clearInterval(shake);
      canvas.style.left = '0';
      canvas.style.top = '0';
      shaking = false;
    }
  }, 40);
}

// Score popup (floating text)
let scorePopups = [];
function spawnScorePopup(x, y, text) {
  scorePopups.push({ x, y, text, life: 60, opacity: 1 });
}

function updateScorePopups() {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const p = scorePopups[i];
    p.y -= 1.2;
    p.life--;
    p.opacity = p.life / 60;
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.font = 'bold 22px Lato, sans-serif';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
    if (p.life <= 0) scorePopups.splice(i, 1);
  }
}

function spawnCollectParticle(x, y) {
  spawnScorePopup(x, y, '+20 ⭐');
}

/* ═══════════════════════════════════════════════
   INPUT HANDLERS
═══════════════════════════════════════════════ */
canvas.addEventListener('mousedown', executeAction);
canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  executeAction(e.touches[0]);
}, { passive: false });

function executeAction(e) {
  if (!isGameRunning) return;
  const rect = canvas.getBoundingClientRect();
  const touchX = (e.clientX || e.pageX) - rect.left;

  if (activeGame === 'Flappy Bird') {
    playerObj.velocityY = -7.5;
  } else if (activeGame === 'Subway Surfers') {
    if (touchX < canvas.width / 2 && playerObj.lane > 0) playerObj.lane--;
    if (touchX >= canvas.width / 2 && playerObj.lane < 2) playerObj.lane++;
  }
}

// Arrow buttons for Subway Surfers
document.getElementById('btn-left').addEventListener('click', () => {
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane > 0) playerObj.lane--;
});
document.getElementById('btn-right').addEventListener('click', () => {
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane < 2) playerObj.lane++;
});

// Touch on arrow buttons
document.getElementById('btn-left').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane > 0) playerObj.lane--;
}, { passive: false });
document.getElementById('btn-right').addEventListener('touchstart', (e) => {
  e.preventDefault();
  if (isGameRunning && activeGame === 'Subway Surfers' && playerObj.lane < 2) playerObj.lane++;
}, { passive: false });

/* ═══════════════════════════════════════════════
   RESIZE LISTENER
═══════════════════════════════════════════════ */
window.addEventListener('resize', () => {
  if (isGameRunning) resizeCanvas();
});
