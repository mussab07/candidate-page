document.addEventListener('DOMContentLoaded', () => {
  const copyBtn = document.getElementById('copyLinkBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(window.location.href).then(() => {
        const span = copyBtn.querySelector('span');
        const original = span.textContent;
        span.textContent = 'Copied!';
        setTimeout(() => { span.textContent = original; }, 2000);
      });
    });
  }

  // Badges collapse/expand
  const badgesCard = document.getElementById('badgesCard');
  const badgesToggle = document.getElementById('badgesToggle');
  const badgesRow = document.getElementById('badgesRow');

  var badgesWrap = document.getElementById('badgesWrap');

  if (badgesCard && badgesToggle && badgesRow && badgesWrap) {
    var badgeSize = 80;
    var gap = 12;
    var rowPadding = 16; // 8px padding on each side of badges-row

    function getPerRow() {
      var rowWidth = badgesRow.clientWidth - rowPadding;
      var count = Math.floor((rowWidth + gap) / (badgeSize + gap));
      return count < 1 ? 1 : count;
    }

    function getCollapsedHeight() {
      return badgeSize + rowPadding + 16; // one row + padding
    }

    function getExpandedHeight() {
      var items = badgesRow.querySelectorAll('.badge-item').length;
      var perRow = getPerRow();
      var rows = Math.ceil(items / perRow);
      return rows * badgeSize + (rows - 1) * gap + rowPadding + 16;
    }

    function applyCollapsed(animate) {
      var items = Array.from(badgesRow.querySelectorAll('.badge-item'));
      var perRow = getPerRow();
      var totalCount = items.length;

      // Reset all
      items.forEach(function(item) {
        item.classList.remove('hidden-badge', 'more-badge');
        item.removeAttribute('data-remaining');
        item.style.opacity = '';
        item.style.transform = '';
      });

      if (badgesCard.classList.contains('collapsed')) {
        var visibleCount = perRow;

        // Set collapsed height on wrapper
        badgesWrap.style.maxHeight = getCollapsedHeight() + 'px';

        if (totalCount > visibleCount) {
          // Mark overflow badges as hidden
          for (var i = visibleCount; i < totalCount; i++) {
            items[i].classList.add('hidden-badge');
          }
          // "+X" overlay on last visible
          var lastVisible = items[visibleCount - 1];
          var remaining = totalCount - (visibleCount - 1);
          lastVisible.classList.add('more-badge');
          lastVisible.setAttribute('data-remaining', '+' + remaining);
        }
      } else {
        // Expanding — set max-height to full content
        badgesWrap.style.maxHeight = getExpandedHeight() + 'px';

        // Stagger fade-in for previously hidden badges
        if (animate) {
          var perRowCount = getPerRow();
          items.forEach(function(item, i) {
            if (i >= perRowCount) {
              item.style.opacity = '0';
              item.style.transform = 'scale(0.8) translateY(10px)';
              var delay = (i - perRowCount) * 40;
              setTimeout(function() {
                item.style.opacity = '1';
                item.style.transform = 'scale(1) translateY(0)';
              }, delay + 50);
            }
          });
        }
      }
    }

    badgesToggle.addEventListener('click', function() {
      var wasCollapsed = badgesCard.classList.contains('collapsed');

      if (wasCollapsed) {
        // EXPANDING
        badgesWrap.classList.add('animating');
        badgesCard.classList.remove('collapsed');
        var items = Array.from(badgesRow.querySelectorAll('.badge-item'));
        items.forEach(function(item) {
          item.classList.remove('hidden-badge', 'more-badge');
          item.removeAttribute('data-remaining');
        });
        applyCollapsed(true);

        badgesWrap.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'max-height') {
            badgesWrap.removeEventListener('transitionend', handler);
            badgesWrap.classList.remove('animating');
          }
        });
      } else {
        // COLLAPSING — smooth height shrink
        badgesWrap.classList.add('animating');
        badgesWrap.style.maxHeight = getExpandedHeight() + 'px';
        badgesWrap.offsetHeight; // force reflow
        badgesCard.classList.add('collapsed');
        badgesWrap.style.maxHeight = getCollapsedHeight() + 'px';

        badgesWrap.addEventListener('transitionend', function handler(e) {
          if (e.propertyName === 'max-height') {
            badgesWrap.removeEventListener('transitionend', handler);
            badgesWrap.classList.remove('animating');
            applyCollapsed(false);
          }
        });
      }
    });

    // Initial state (collapsed)
    applyCollapsed(false);

    window.addEventListener('resize', function() {
      applyCollapsed(false);
    });
  }

  // Animated grid background
  const canvas = document.getElementById('gridCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const heroCard = canvas.closest('.hero-card');

  const GRID_SIZE = 35;
  const PULSE_COUNT = 12;
  const SPEED = 1.4;
  const GRID_COLOR = 'rgba(255, 255, 255, 0.06)';
  const NODE_COUNT = 4;

  let width, height, pulses = [], nodes = [], mouseX = -1, mouseY = -1;

  // Mouse interaction — subtle glow follows cursor
  heroCard.addEventListener('mousemove', function(e) {
    var rect = heroCard.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  heroCard.addEventListener('mouseleave', function() {
    mouseX = -1;
    mouseY = -1;
  });

  function init() {
    const dpr = window.devicePixelRatio || 1;
    width = heroCard.clientWidth;
    height = heroCard.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    pulses = [];
    for (let i = 0; i < PULSE_COUNT; i++) {
      pulses.push(createPulse(true));
    }

    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(createNode());
    }
  }

  function createPulse(randomStart) {
    const isH = Math.random() > 0.5;
    const maxLines = isH ? Math.floor(height / GRID_SIZE) : Math.floor(width / GRID_SIZE);
    const lineIndex = Math.floor(Math.random() * maxLines) + 1;
    const maxPos = isH ? width : height;
    return {
      axis: isH ? 'h' : 'v',
      lineIndex: lineIndex,
      position: randomStart ? Math.random() * maxPos : -(80 + Math.random() * 160),
      speed: (0.3 + Math.random() * 0.7) * SPEED,
      length: 80 + Math.random() * 160,
      opacity: 0.3 + Math.random() * 0.4,
    };
  }

  // Intersection sparkle nodes — glow at grid intersections
  function createNode() {
    var cols = Math.floor(width / GRID_SIZE);
    var rows = Math.floor(height / GRID_SIZE);
    return {
      x: (Math.floor(Math.random() * cols) + 1) * GRID_SIZE,
      y: (Math.floor(Math.random() * rows) + 1) * GRID_SIZE,
      phase: Math.random() * Math.PI * 2,
      speed: 0.02 + Math.random() * 0.02,
      maxRadius: 2 + Math.random() * 2,
      maxOpacity: 0.15 + Math.random() * 0.2,
      life: 0,
      lifespan: 200 + Math.random() * 300,
    };
  }

  function drawGrid() {
    ctx.strokeStyle = GRID_COLOR;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    for (let x = GRID_SIZE; x < width; x += GRID_SIZE) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = GRID_SIZE; y < height; y += GRID_SIZE) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }

  function drawMouseGlow() {
    if (mouseX < 0 || mouseY < 0) return;
    var gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 120);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(mouseX - 120, mouseY - 120, 240, 240);
  }

  function drawNodes() {
    nodes.forEach(function(node) {
      var progress = node.life / node.lifespan;
      // Fade in then fade out
      var fade = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;
      fade = Math.max(0, Math.min(1, fade));
      var pulse = (Math.sin(node.phase + node.life * node.speed) + 1) * 0.5;
      var radius = node.maxRadius * (0.5 + pulse * 0.5) * fade;
      var opacity = node.maxOpacity * fade * (0.6 + pulse * 0.4);

      if (radius > 0.2 && opacity > 0.01) {
        // Outer glow
        var glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
        glow.addColorStop(0, 'rgba(255, 255, 255, ' + (opacity * 0.4) + ')');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(node.x - radius * 4, node.y - radius * 4, radius * 8, radius * 8);

        // Core dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
        ctx.fill();
      }
    });
  }

  function updateNodes() {
    nodes.forEach(function(node, i) {
      node.life++;
      if (node.life >= node.lifespan) {
        nodes[i] = createNode();
      }
    });
  }

  function drawPulses() {
    pulses.forEach(function(pulse) {
      const pos = pulse.lineIndex * GRID_SIZE;

      var layers = [
        { width: 0.8, alpha: pulse.opacity * 0.4, color: 'rgba(255, 255, 255, 0.25)' },
        { width: 0.5, alpha: pulse.opacity, color: 'rgba(255, 255, 255, 0.6)' },
      ];

      layers.forEach(function(layer) {
        var gradient;
        if (pulse.axis === 'h') {
          gradient = ctx.createLinearGradient(
            pulse.position - pulse.length, pos,
            pulse.position + pulse.length, pos
          );
        } else {
          gradient = ctx.createLinearGradient(
            pos, pulse.position - pulse.length,
            pos, pulse.position + pulse.length
          );
        }
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
        gradient.addColorStop(0.5, layer.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.strokeStyle = gradient;
        ctx.lineWidth = layer.width;
        ctx.globalAlpha = layer.alpha;
        ctx.beginPath();
        if (pulse.axis === 'h') {
          ctx.moveTo(pulse.position - pulse.length, pos);
          ctx.lineTo(pulse.position + pulse.length, pos);
        } else {
          ctx.moveTo(pos, pulse.position - pulse.length);
          ctx.lineTo(pos, pulse.position + pulse.length);
        }
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
    });
  }

  function updatePulses() {
    pulses.forEach(function(pulse, i) {
      pulse.position += pulse.speed;
      const maxPos = pulse.axis === 'h' ? width : height;
      if (pulse.position - pulse.length > maxPos) {
        pulses[i] = createPulse(false);
      }
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    drawGrid();
    drawMouseGlow();
    drawNodes();
    drawPulses();
    updatePulses();
    updateNodes();
    requestAnimationFrame(animate);
  }

  init();
  animate();
  window.addEventListener('resize', init);
});
