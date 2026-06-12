/* ============================================================
   Switch Hands - app.js
   ============================================================ */

(function () {
  'use strict';

  /* ---------- AGE GATE ---------- */
  var gate    = document.getElementById('ageGate');
  var site    = document.getElementById('site');
  var agree   = document.getElementById('agreeBox');
  var enter   = document.getElementById('enterBtn');

  if (localStorage.getItem('sh_accepted') === '1') {
    showSite();
  }

  agree.addEventListener('change', function () {
    enter.disabled = !agree.checked;
  });
  enter.addEventListener('click', function () {
    if (!agree.checked) return;
    localStorage.setItem('sh_accepted', '1');
    showSite();
  });

  function showSite() {
    gate.style.display = 'none';
    site.hidden = false;
    initBrainDiagram();
    initChallenges();
    initTabs();
    initDrawing();
    initClickGame();
    initReactGame();
    initTypeGame();
  }

  /* ---------- BRAIN DIAGRAM ---------- */
  function initBrainDiagram() {
    var info = document.getElementById('brainInfo');
    var hemL = document.getElementById('hemL');
    var hemR = document.getElementById('hemR');

    var L_TEXT = 'Left hemisphere: controls your right hand, usually houses language (Broca’s & Wernicke’s areas), and tends to specialize in sequential, analytic processing. In ~95% of right-handers, this side is language-dominant.';
    var R_TEXT = 'Right hemisphere: controls your left hand, specializes in spatial reasoning, face recognition, music perception and the &quot;big-picture&quot; gestalt of a scene. Training your left hand recruits this side’s motor cortex.';

    function select(side) {
      hemL.classList.remove('selected');
      hemR.classList.remove('selected');
      if (side === 'L') { hemL.classList.add('selected'); info.innerHTML = L_TEXT; }
      else              { hemR.classList.add('selected'); info.innerHTML = R_TEXT; }
    }
    hemL.addEventListener('click', function () { select('L'); });
    hemR.addEventListener('click', function () { select('R'); });
  }

  /* ---------- 30-DAY CHALLENGES ---------- */
  var CHALLENGES = [
    'Brush your teeth with your left hand',
    'Eat one meal using only your left hand',
    'Write your name 10 times with your left hand',
    'Use the mouse with your left hand for 30 minutes',
    'Drink coffee/tea left-handed all morning',
    'Unlock your phone with your left thumb only',
    'Open every door with your left hand today',
    'Stir a pot for 2 minutes with your left hand',
    'Comb / style your hair left-handed',
    'Pour a glass of water with your left hand',
    'Sign 3 documents with your left hand',
    'Send 10 text messages using only your left thumb',
    'Draw a self-portrait left-handed',
    'Eat soup left-handed (over a sink — trust us)',
    'Hold the steering wheel only with your left hand (parked!)',
    'Tie your shoes left-hand-dominant',
    'Use a fork left-handed for an entire dinner',
    'Throw &amp; catch a soft ball 20 times left-handed',
    'Cut soft fruit with a butter knife, left-handed',
    'Play 10 minutes of any game with reversed controls',
    'Apply moisturizer / lotion left-handed',
    'Write a one-paragraph journal entry left-handed',
    'Carry your bag on the left side all day',
    'Take notes in a meeting left-handed',
    'Use chopsticks left-handed (start with crayons)',
    'Brush your hair / shave with left hand',
    'Operate the TV remote with only your left thumb',
    'Practice writing the alphabet left-handed, 3 times',
    'Spend 1 hour browsing the web mouse-left',
    'Final boss: write a short letter to yourself, left-handed.'
  ];

  function initChallenges() {
    var grid  = document.getElementById('challengeGrid');
    var fill  = document.getElementById('progressFill');
    var label = document.getElementById('progressLabel');
    var reset = document.getElementById('resetChallenges');

    var saved = JSON.parse(localStorage.getItem('sh_challenges') || '[]');

    function save() { localStorage.setItem('sh_challenges', JSON.stringify(saved)); }
    function refresh() {
      var done = saved.length;
      fill.style.width = (done / CHALLENGES.length * 100) + '%';
      label.textContent = done + ' / ' + CHALLENGES.length + ' complete';
    }

    grid.innerHTML = '';
    CHALLENGES.forEach(function (txt, i) {
      var div = document.createElement('label');
      div.className = 'challenge';
      var id = 'ch_' + i;
      var checked = saved.indexOf(i) > -1;
      if (checked) div.classList.add('done');
      div.innerHTML = '<input type="checkbox" id="' + id + '"' + (checked ? ' checked' : '') + '>' +
                      '<span class="ch-text"><span class="ch-day">Day ' + (i + 1) + '.</span>' + txt + '</span>';
      var cb = div.querySelector('input');
      cb.addEventListener('change', function () {
        if (cb.checked) {
          if (saved.indexOf(i) === -1) saved.push(i);
          div.classList.add('done');
        } else {
          saved = saved.filter(function (n) { return n !== i; });
          div.classList.remove('done');
        }
        save();
        refresh();
      });
      grid.appendChild(div);
    });
    refresh();

    reset.addEventListener('click', function () {
      if (!confirm('Reset all 30 days of progress?')) return;
      saved = [];
      save();
      initChallenges();
    });
  }

  /* ---------- TABS ---------- */
  function initTabs() {
    var btns   = document.querySelectorAll('.tab-btn');
    var panels = document.querySelectorAll('.tab-panel');
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.remove('active'); });
        panels.forEach(function (p) { p.classList.remove('active'); });
        b.classList.add('active');
        document.querySelector('.tab-panel[data-panel="' + b.dataset.tab + '"]').classList.add('active');
      });
    });
  }

  /* ---------- DRAWING GAME ---------- */
  function initDrawing() {
    var c    = document.getElementById('drawCanvas');
    var ctx  = c.getContext('2d');
    var mirr = document.getElementById('mirrorToggle');
    var size = document.getElementById('brushSize');
    var col  = document.getElementById('brushColor');
    var clr  = document.getElementById('clearCanvas');
    var load = document.getElementById('loadShape');
    var drawing = false;
    var last = null;

    function reset() {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    reset();

    function pt(e) {
      var r = c.getBoundingClientRect();
      var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
      var y = (e.touches ? e.touches[0].clientY : e.clientY) - r.top;
      x = x * (c.width / r.width);
      y = y * (c.height / r.height);
      if (mirr.checked) x = c.width - x;
      return { x: x, y: y };
    }
    function start(e) { e.preventDefault(); drawing = true; last = pt(e); }
    function move(e)  {
      if (!drawing) return;
      e.preventDefault();
      var p = pt(e);
      ctx.strokeStyle = col.value;
      ctx.lineWidth   = +size.value;
      ctx.lineCap     = 'round';
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    }
    function end() { drawing = false; last = null; }

    c.addEventListener('mousedown', start);
    c.addEventListener('mousemove', move);
    c.addEventListener('mouseup',   end);
    c.addEventListener('mouseleave', end);
    c.addEventListener('touchstart', start, { passive: false });
    c.addEventListener('touchmove',  move,  { passive: false });
    c.addEventListener('touchend',   end);

    clr.addEventListener('click', reset);

    load.addEventListener('click', function () {
      reset();
      ctx.strokeStyle = '#bbb';
      ctx.lineWidth   = 3;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(80, 260);
      ctx.lineTo(250, 50);
      ctx.lineTo(420, 260);
      ctx.lineTo(80, 260);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(250, 170, 70, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#aaa';
      ctx.font = '13px sans-serif';
      ctx.fillText('Trace these shapes with your left hand!', 110, 30);
    });
  }

  /* ---------- CLICK TARGETS ---------- */
  function initClickGame() {
    var arena    = document.getElementById('clickArena');
    var startBtn = document.getElementById('startClick');
    var elT      = document.getElementById('clickTime');
    var elH      = document.getElementById('clickHit');
    var elB      = document.getElementById('clickBest');

    var TOTAL = 20;
    var hit = 0;
    var t0  = 0;
    var ticker;
    var running = false;

    var best = parseFloat(localStorage.getItem('sh_clickBest') || '0');
    if (best > 0) elB.textContent = best.toFixed(2) + 's';

    function spawn() {
      arena.innerHTML = '';
      var d = document.createElement('div');
      d.className = 'target';
      var w = arena.clientWidth - 50;
      var h = arena.clientHeight - 50;
      d.style.left = Math.random() * w + 'px';
      d.style.top  = Math.random() * h + 'px';
      d.addEventListener('click', onHit);
      d.addEventListener('touchstart', onHit);
      arena.appendChild(d);
    }
    function onHit(e) {
      e.preventDefault();
      if (!running) return;
      hit++;
      elH.textContent = hit + ' / ' + TOTAL;
      if (hit >= TOTAL) {
        running = false;
        clearInterval(ticker);
        var t = (Date.now() - t0) / 1000;
        elT.textContent = t.toFixed(2) + 's';
        arena.innerHTML = '<div style="text-align:center;padding:40px;color:#5a2a44;"><h3>Done! ' + t.toFixed(2) + 's</h3><p>That’s with your left hand. Try to beat it tomorrow.</p></div>';
        if (!best || t < best) {
          best = t;
          localStorage.setItem('sh_clickBest', t.toString());
          elB.textContent = t.toFixed(2) + 's';
        }
        startBtn.textContent = 'Play again';
      } else {
        spawn();
      }
    }
    startBtn.addEventListener('click', function () {
      hit = 0;
      running = true;
      t0 = Date.now();
      elH.textContent = '0 / ' + TOTAL;
      startBtn.textContent = 'Running...';
      clearInterval(ticker);
      ticker = setInterval(function () {
        elT.textContent = ((Date.now() - t0) / 1000).toFixed(2) + 's';
      }, 50);
      spawn();
    });
  }

  /* ---------- REACTION TIME ---------- */
  function initReactGame() {
    var box  = document.getElementById('reactBox');
    var elL  = document.getElementById('reactLast');
    var elA  = document.getElementById('reactAvg');
    var elB  = document.getElementById('reactBest');

    var TRIALS = 5;
    var trial  = 0;
    var times  = [];
    var t0     = 0;
    var state  = 'idle';
    var timer;

    var best = parseFloat(localStorage.getItem('sh_reactBest') || '0');
    if (best > 0) elB.textContent = best.toFixed(0) + ' ms';

    function nextTrial() {
      state = 'wait';
      box.className = 'react-box wait';
      box.textContent = 'Wait for green... (trial ' + (trial + 1) + '/' + TRIALS + ')';
      var delay = 1000 + Math.random() * 2500;
      timer = setTimeout(function () {
        state = 'go';
        box.className = 'react-box ready';
        box.textContent = 'CLICK!';
        t0 = Date.now();
      }, delay);
    }
    function finish() {
      var avg = times.reduce(function (s, n) { return s + n; }, 0) / times.length;
      elA.textContent = avg.toFixed(0) + ' ms';
      if (!best || avg < best) {
        best = avg;
        localStorage.setItem('sh_reactBest', avg.toString());
        elB.textContent = avg.toFixed(0) + ' ms';
      }
      box.className = 'react-box';
      box.textContent = 'Done! avg ' + avg.toFixed(0) + ' ms. Click to retry.';
      state = 'idle';
      trial = 0;
      times = [];
    }
    box.addEventListener('click', function () {
      if (state === 'idle') {
        trial = 0; times = [];
        nextTrial();
      } else if (state === 'wait') {
        clearTimeout(timer);
        box.className = 'react-box';
        box.textContent = 'Too early! Click to restart.';
        state = 'idle';
      } else if (state === 'go') {
        var dt = Date.now() - t0;
        times.push(dt);
        elL.textContent = dt + ' ms';
        trial++;
        if (trial >= TRIALS) finish();
        else nextTrial();
      }
    });
  }

  /* ---------- TYPE GAME ---------- */
  function initTypeGame() {
    // Words biased toward the LEFT side of QWERTY (q w e r t a s d f g z x c v b)
    var WORDS = [
      'craft', 'water', 'beast', 'staff', 'react', 'card', 'verb', 'tree', 'edge',
      'great', 'badge', 'face', 'sweet', 'agave', 'scarf', 'verge', 'serve', 'badger',
      'crab', 'absent', 'detect', 'gather', 'wager', 'feast', 'state', 'data', 'safe',
      'trade', 'reefs', 'cabbage', 'beard', 'sage', 'vest', 'fade', 'savage', 'targets'
    ];
    var promptEl = document.getElementById('typePrompt');
    var inp      = document.getElementById('typeInput');
    var elT      = document.getElementById('typeTime');
    var elW      = document.getElementById('typeWpm');
    var elB      = document.getElementById('typeBest');
    var newBtn   = document.getElementById('newPrompt');

    var current = '';
    var t0 = 0;
    var started = false;

    var best = parseFloat(localStorage.getItem('sh_typeBest') || '0');
    if (best > 0) elB.textContent = best.toFixed(1) + ' wpm';

    function newPrompt() {
      var words = [];
      for (var i = 0; i < 6; i++) {
        words.push(WORDS[Math.floor(Math.random() * WORDS.length)]);
      }
      current = words.join(' ');
      promptEl.textContent = current;
      inp.value = '';
      started  = false;
      elT.textContent = '0.00s';
      elW.textContent = '—';
      inp.focus();
    }
    inp.addEventListener('input', function () {
      if (!started) { started = true; t0 = Date.now(); }
      if (inp.value === current) {
        var t = (Date.now() - t0) / 1000;
        elT.textContent = t.toFixed(2) + 's';
        var wpm = (current.split(' ').length / t) * 60;
        elW.textContent = wpm.toFixed(1) + ' wpm';
        if (!best || wpm > best) {
          best = wpm;
          localStorage.setItem('sh_typeBest', wpm.toString());
          elB.textContent = wpm.toFixed(1) + ' wpm';
        }
      } else {
        elT.textContent = ((Date.now() - t0) / 1000).toFixed(2) + 's';
      }
    });
    newBtn.addEventListener('click', newPrompt);
    newPrompt();
  }
})();
