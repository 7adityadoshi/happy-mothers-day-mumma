document.getElementById('click-to-start').addEventListener('click', function() {
  this.style.opacity = '0';
  
  setTimeout(() => {
    this.classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    setTimeout(() => {
      document.getElementById('landing-page').classList.remove('opacity-0');
    }, 100);
    document.getElementById('games-section').classList.remove('hidden');
  }, 1000);
  
  const bgMusic = document.getElementById('bg-music');
  bgMusic.play().catch(e => console.log("Audio play failed, user may need to interact more directly."));
});

// Carousel Logic
const images = document.querySelectorAll('.carousel-img');
let currentIndex = 0;
setInterval(() => {
  images[currentIndex].classList.remove('active');
  currentIndex = (currentIndex + 1) % images.length;
  images[currentIndex].classList.add('active');
}, 2000);

// Falling Hearts Logic
function createHearts() {
  const container = document.getElementById('hearts-container');
  for (let i = 0; i < 20; i++) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.className = 'heart';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.animationDuration = (Math.random() * 3 + 4) + 's';
    heart.style.animationDelay = Math.random() * 5 + 's';
    container.appendChild(heart);
  }
}
createHearts();

// Game Logic Variables
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const avatarImg = document.getElementById('avatar-img');
let gameLoopId;
let currentGame = '';

const instructions = {
  'Fablife': 'Tap to fly upwards. Avoid office paperwork and collect tea for points.',
  'subway surfers': 'Swipe left or right to change lanes. Avoid carts and collect groceries.',
  'angry birds': 'Drag and release to launch the avatar at the laundry baskets.',
  'Flappy bird': 'Tap to bounce on desks. Avoid the alarm clocks.'
};

function openGame(gameName) {
  currentGame = gameName;
  document.getElementById('game-modal').classList.remove('hidden');
  document.getElementById('game-title').innerText = gameName;
  document.getElementById('game-instructions').innerText = instructions[gameName];
  
  // Reset game view
  document.getElementById('start-game-btn').style.display = 'block';
  canvas.style.display = 'none';
  
  // Ensure any previous game loop is completely dead before starting a new one
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }
}

function closeGame() {
  document.getElementById('game-modal').classList.add('hidden');
  if (gameLoopId) {
    cancelAnimationFrame(gameLoopId);
  }
}

document.getElementById('start-game-btn').addEventListener('click', function() {
  this.style.display = 'none';
  canvas.style.display = 'block';
  startGameLoop();
});

function startGameLoop() {
  let y = 300;
  let velocity = 0;
  let gravity = 0.5;

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    velocity += gravity;
    y += velocity;
    
    // Floor & Ceiling collision
    if (y > canvas.height - 50) {
      y = canvas.height - 50;
      velocity = 0;
    }
    if (y < 0) {
      y = 0;
      velocity = 0;
    }

    // Draw the avatar
    ctx.drawImage(avatarImg, 150, y, 50, 50);

    // Draw current game mode text
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(currentGame + ' Mode Active', 100, 50);

    gameLoopId = requestAnimationFrame(loop);
  }
  
  // Start the loop
  loop();

  // Jump mechanic
  canvas.onclick = () => {
    velocity = -8;
  };
}