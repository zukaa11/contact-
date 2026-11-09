// Cyberpunk Particle Network & Circuit Canvas
(function initCyberCanvas() {
  const canvas = document.getElementById('cyber-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const nodes = [];
  const nodeCount = Math.min(Math.floor((width * height) / 18000), 70);

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(157, 78, 221, ',
      alpha: Math.random() * 0.5 + 0.3
    });
  }

  // Mouse interaction
  let mouse = { x: null, y: null, maxDist: 150 };
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting circuit lines
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const opacity = (1 - dist / 130) * 0.25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Mouse connection
      if (mouse.x !== null) {
        const dx = nodes[i].x - mouse.x;
        const dy = nodes[i].y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.maxDist) {
          const opacity = (1 - dist / mouse.maxDist) * 0.4;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 255, 157, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Update positions
      nodes[i].x += nodes[i].vx;
      nodes[i].y += nodes[i].vy;

      if (nodes[i].x < 0 || nodes[i].x > width) nodes[i].vx *= -1;
      if (nodes[i].y < 0 || nodes[i].y > height) nodes[i].vy *= -1;

      // Draw node
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, nodes[i].radius, 0, Math.PI * 2);
      ctx.fillStyle = nodes[i].color + nodes[i].alpha + ')';
      ctx.fill();
    }

    requestAnimationFrame(render);
  }
  render();
})();

// Web Audio API Sci-Fi Sound Synthesizer
let audioCtx = null;
let soundEnabled = true;

function playCyberSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'beep') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.setValueAtTime(1800, now + 0.04);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'access') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch (e) {
    // Audio context may not be allowed until user gesture
  }
}

// Sound toggle button setup
document.addEventListener('DOMContentLoaded', () => {
  const soundBtn = document.getElementById('sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.innerHTML = soundEnabled 
        ? '<i class="fas fa-volume-up text-cyan-400"></i> <span class="hidden sm:inline">AUDIO ON</span>'
        : '<i class="fas fa-volume-mute text-gray-500"></i> <span class="hidden sm:inline">AUDIO OFF</span>';
      if (soundEnabled) playCyberSound('beep');
    });
  }

  // Attach click sound to interactive buttons
  document.querySelectorAll('button, .cyber-btn, .nav-link').forEach(el => {
    el.addEventListener('mouseenter', () => {
      // subtle hover effect
    });
    el.addEventListener('click', () => {
      playCyberSound('click');
    });
  });

  // Mobile menu toggle
  const mobileToggle = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      playCyberSound('beep');
    });
  }

  // Live real-time clock HUD
  const liveClock = document.getElementById('live-clock');
  if (liveClock) {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      liveClock.textContent = `${h}:${m}:${s} UTC+4`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }
});

