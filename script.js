// --- INITIALIZATION & UI ---
document.getElementById('click-to-start').addEventListener('click', function() {
  // Request fullscreen for true web app feel
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().catch((e) => console.log(e));
  } else if (document.documentElement.webkitRequestFullscreen) { /* Safari */
    document.documentElement.webkitRequestFullscreen();
  }

  this.style.opacity = '0';
  
  setTimeout(() => {
    this.classList.add('hidden');
    const landing = document.getElementById('landing-page');
    landing.classList.remove('hidden');
    setTimeout(() => { landing.classList.remove('opacity-0'); }, 50);
    document.getElementById('games-section').classList.remove('hidden');
  }, 800);
  
  const bgMusic = document.getElementById('bg-music');
  bgMusic.volume = 0.5;
  bgMusic.play().catch(e => console.log("Audio play blocked"));
});

// --- AUDIO CONTROLS & SCROLL LOGIC ---
const bgMusic = document.getElementById('bg-music');
const muteBtn = document.getElementById('mute-btn');
let isMuted = false;

muteBtn.addEventListener('click', () => {
  isMuted = !isMuted;
  bgMusic.muted = isMuted;
  muteBtn.innerText = isMuted ? "🔇 Unmute" : "🎵 Mute";
});

window.addEventListener('scroll', () => {
  // Stop music when user scrolls past landing page
  if (window.scrollY > window.innerHeight * 0.7) {
    bgMusic.pause();
  } else {
    if (!isMuted) bgMusic.play().catch(e=>console.log(e));
  }
});

// --- HEARTS ANIMATION (TOP TO BOTTOM) ---
function createHearts() {
  const container = document.getElementById('hearts-container');
  for (let i = 0; i < 25; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = ['💖', '💕', '💗', '💓', '🌸'][Math.floor(Math.random() * 5)];
    heart.className = 'heart';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 4 + 6) + 's';
    heart.style.animationDelay = Math.random() * 5 + 's';
    heart.style.fontSize = (Math.random() * 15 + 15) + 'px';
    container.appendChild(heart);
  }
}
createHearts();

// --- 9:16 CAROUSEL LOGIC ---
const images = document.querySelectorAll('.carousel-img');
let currentIndex = 0;
let carouselTimer;

function showSlide(index) {
  images.forEach(img => img.classList.remove('active'));
  currentIndex = (index + images.length) % images.length;
  images[currentIndex].classList.add('active');
}

function startCarousel() {
  carouselTimer = setInterval(() => showSlide(currentIndex + 1), 2500);
}

function resetCarouselTimer() {
  clearInterval(carouselTimer);
  setTimeout(startCarousel, 30000); // Wait 30s before auto-resuming if clicked
}

document.getElementById('next-btn').addEventListener('click', () => {
  showSlide(currentIndex + 1);
  resetCarouselTimer();
});
document.getElementById('prev-btn').addEventListener('click', () => {
  showSlide(currentIndex - 1);
  resetCarouselTimer();
});

startCarousel();

// --- SOUND EFFECTS ENGINE (Synthesizer) ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playSound(type) {
  if (isMuted || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  if (type === 'jump') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'coin') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
    osc.start(); osc.stop(audioCtx.currentTime + 0.1);
  } else if (type === 'crash') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    osc.start(); osc.stop(audioCtx.currentTime + 0.3);
  }
}

// --- GAME LOGIC ENGINE ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const avatarImg = document.getElementById('avatar-img');
const scoreDisplay = document.getElementById('current-score');

let gameLoopId;
let currentGame = '';
let isPlaying = false;
let score = 0;
let frames = 0;

// Game State Variables
let player = { x: 50, y: 300, width: 40, height: 40, velocityY: 0, velocityX: 0, lane: 1 };
let entities = []; // Obstacles and coins

const instructions = {
  'Escape Work': 'Tap to fly. Dodge the laptops and folders 📁💻. Collect tea ☕ for points.',
  'Subway Surfers': 'Tap left or right side of screen to switch lanes. Dodge carts 🛒, collect bags 🛍️.',
  'Angry Birds': 'Tap to launch the avatar at the laundry baskets 🧺.',
  'Flappy Bird': 'Tap to jump between desks 🪑. Dodge the alarm clocks ⏰.'
};

function openGame(gameName) {
  currentGame = gameName;
  document.getElementById('game-modal').classList.remove('hidden');
  document.getElementById('game-title').innerText = gameName;
  document.getElementById('game-instructions').innerText = instructions[gameName];
  document.getElementById('start-game-btn').style.display = 'block';
  document.getElementById('game-over-screen').classList.add('hidden');
  canvas.style.display = 'none';
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
}

function closeGame() {
  document.getElementById('game-modal').classList.add('hidden');
  isPlaying = false;
  if (gameLoopId) cancelAnimationFrame(gameLoopId);
}

function restartGame() {
  document.getElementById('game-over-screen').classList.add('hidden');
  startGameEngine();
}

document.getElementById('start-game-btn').addEventListener('click', function() {
  this.style.display = 'none';
  canvas.style.display = 'block';
  if (audioCtx.state === 'suspended') audioCtx.resume();
  startGameEngine();
});

function startGameEngine() {
  isPlaying = true;
  score = 0;
  frames = 0;
  scoreDisplay.innerText = score;
  entities = [];
  
  // Reset player based on game
  if (currentGame === 'Subway Surfers') {
    player = { x: 200, y: 500, width: 40, height: 40, lane: 1 }; // lanes 0,1,2
  } else {
    player = { x: 50, y: 300, width: 40, height: 40, velocityY: 0 };
  }

  function loop() {
    if (!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frames++;
    
    // Core Mechanics Route
    if (currentGame === 'Escape Work') runEscapeWork();
    if (currentGame === 'Subway Surfers') runSubwaySurfers();
    if (currentGame === 'Angry Birds') runAngryBirds();
    if (currentGame === 'Flappy Bird') runFlappyBird();

    // Draw Player
    ctx.drawImage(avatarImg, player.x, player.y, player.width, player.height);
    
    if (isPlaying) gameLoopId = requestAnimationFrame(loop);
  }
  
  loop();
}

function gameOver() {
  isPlaying = false;
  playSound('crash');
  document.getElementById('game-over-screen').classList.remove('hidden');
}

// --- SPECIFIC GAME MECHANICS ---

function runEscapeWork() {
  // Gravity
  player.velocityY += 0.4;
  player.y += player.velocityY;
  if (player.y > canvas.height - player.height || player.y < 0) gameOver();

  // Spawner
  if (frames % 100 === 0) {
    let type = Math.random() > 0.3 ? 'obstacle' : 'coin';
    let icon = type === 'obstacle' ? (Math.random()>0.5?'💻':'📁') : '☕';
    entities.push({ x: canvas.width, y: Math.random() * (canvas.height - 50), w: 40, h: 40, type: type, icon: icon });
  }

  processEntities(-3, 0); // Move left
}

function runSubwaySurfers() {
  // Lanes: x = 80, x = 180, x = 280
  const lanes = [80, 180, 280];
  player.x = lanes[player.lane];

  // Spawner
  if (frames % 60 === 0) {
    let lane = Math.floor(Math.random() * 3);
    let type = Math.random() > 0.4 ? 'obstacle' : 'coin';
    let icon = type === 'obstacle' ? '🛒' : '🛍️';
    entities.push({ x: lanes[lane], y: -50, w: 40, h: 40, type: type, icon: icon });
  }

  // Draw lines
  ctx.strokeStyle = 'white';
  ctx.beginPath(); ctx.moveTo(150, 0); ctx.lineTo(150, 600); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(250, 0); ctx.lineTo(250, 600); ctx.stroke();

  processEntities(0, 5); // Move down
}

function runAngryBirds() {
  // Simplified version: Target practice
  if (frames === 1) {
    entities.push({ x: 300, y: 400, w: 50, h: 50, type: 'obstacle', icon: '🧺' });
    player.x = 50; player.y = 400; player.velocityX = 0; player.velocityY = 0;
  }
  
  player.velocityY += 0.2; // gravity
  player.x += player.velocityX;
  player.y += player.velocityY;

  if (player.y > canvas.height) { player.y = 400; player.velocityX = 0; player.velocityY = 0;} // reset

  processEntities(0, 0);
}

function runFlappyBird() {
  player.velocityY += 0.4;
  player.y += player.velocityY;
  if (player.y > canvas.height || player.y < 0) gameOver();

  if (frames % 120 === 0) {
    entities.push({ x: canvas.width, y: Math.random() * 500, w: 60, h: 60, type: 'obstacle', icon: '⏰' });
    entities.push({ x: canvas.width, y: Math.random() * 500, w: 60, h: 20, type: 'platform', icon: '🪑' });
  }
  
  processEntities(-2.5, 0);
}

function processEntities(speedX, speedY) {
  for (let i = 0; i < entities.length; i++) {
    let e = entities[i];
    e.x += speedX;
    e.y += speedY;

    // Draw
    ctx.font = '35px Arial';
    ctx.fillText(e.icon, e.x, e.y + 35); // Emoji offset

    // Collision
    if (player.x < e.x + e.w && player.x + player.width > e.x &&
        player.y < e.y + e.h && player.y + player.height > e.y) {
      if (e.type === 'obstacle') {
        gameOver();
      } else if (e.type === 'coin') {
        score += 10;
        scoreDisplay.innerText = score;
        playSound('coin');
        entities.splice(i, 1);
        i--;
      } else if (e.type === 'platform') { // Flappy bounce
        player.velocityY = -8;
        playSound('jump');
      }
    }
  }
}

// --- INPUT HANDLING ---
canvas.addEventListener('mousedown', handleInput);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(e.touches[0]); }, {passive: false});

function handleInput(e) {
  if (!isPlaying) return;
  playSound('jump');
  
  let rect = canvas.getBoundingClientRect();
  let clickX = (e.clientX || e.pageX) - rect.left;

  if (currentGame === 'Escape Work' || currentGame === 'Flappy Bird') {
    player.velocityY = -8;
  } 
  else if (currentGame === 'Subway Surfers') {
    if (clickX < canvas.width / 2 && player.lane > 0) player.lane--;
    if (clickX > canvas.width / 2 && player.lane < 2) player.lane++;
  }
  else if (currentGame === 'Angry Birds') {
    player.velocityX = 8;
    player.velocityY = -6;
  }
}
