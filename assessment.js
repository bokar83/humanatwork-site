(function () {
  'use strict';

  const TITLES = [
    'an operations manager',
    'a finance analyst',
    'an HR professional',
    'a marketing director',
    'a project lead',
    'an account manager'
  ];

  const LETTERS = ['A', 'B', 'C', 'D', 'E'];

  const QUESTIONS = [
    {
      text: 'What best describes your primary work output?',
      options: [
        'I process, organize, or move information (reports, data entry, scheduling, admin)',
        'I analyze information and make recommendations (finance, ops, strategy, HR)',
        'I manage people, relationships, or accounts (management, sales, client-facing)',
        'I create or design things (marketing, communications, product, creative)',
        'I deliver services requiring physical presence or hands-on judgment'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'How much of your daily work follows a predictable, repeatable pattern?',
      options: [
        'Almost all of it — my days look similar week to week',
        'Most of it, with occasional exceptions',
        'About half predictable, half variable',
        'Mostly variable — each situation requires fresh judgment',
        'Almost entirely unpredictable — no two days are the same'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'Has your company announced, piloted, or discussed any AI initiative in the last 12 months?',
      options: [
        'Yes — there is an active named initiative or transformation program',
        'Yes — informal pilots or tool rollouts in my department',
        'Mentioned in leadership communications but nothing concrete yet',
        'Not that I am aware of',
        'My company has explicitly said AI is not a near-term priority'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'When your company has reduced headcount in the past, how did it typically happen?',
      options: [
        'Sudden announcements with little warning',
        'A period of quiet reorganization followed by announcements',
        'Performance management cycles that led to exits',
        'Voluntary separation or retirement incentive programs',
        'I have not witnessed significant headcount reduction at this company'
      ],
      scores: [3, 2, 1, 1, 0]
    },
    {
      text: 'How visible is the business value you personally create to your direct manager and leadership?',
      options: [
        'Very visible — I have clear metrics and they are tracked and discussed',
        'Somewhat visible — my contributions are recognized but not formally measured',
        'Vague — my impact is understood but not easily quantified',
        'Mostly invisible — I support others whose work is more visible',
        'I do not know how my value is perceived at the leadership level'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'How would you describe your relationship with AI tools today?',
      options: [
        'I use AI tools daily as part of my workflow',
        'I have experimented but do not use them consistently',
        'I am aware of AI tools but have not incorporated them into my work',
        'My company has restricted or not yet approved AI tool use',
        'I actively avoid AI tools'
      ],
      scores: [0, 1, 2, 2, 3]
    },
    {
      text: 'In the last 6 months, has your team lost headcount without being backfilled?',
      options: [
        'Yes — one or more roles were eliminated or left vacant intentionally',
        'Yes — someone left and the role was restructured rather than directly replaced',
        'No — all departures were replaced',
        'No departures in my team in the last 6 months',
        'I am not sure'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'How would your manager describe your role if asked to justify it in an AI-efficiency review?',
      options: [
        'Essential and clearly differentiated — I do things AI cannot replicate',
        'Valuable, but the justification would take some effort to articulate',
        'I am not sure they could articulate a strong justification',
        'Parts of my role are already being discussed as automation candidates',
        'I have never thought about this and I am now concerned'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'How connected are you to work that is strategic, revenue-generating, or directly tied to a company priority?',
      options: [
        'Directly — my work feeds into a named company priority or revenue line',
        'One degree removed — I support people who own strategic priorities',
        'Two or more degrees removed — my connection to strategy is indirect',
        'I primarily handle work that keeps operations running but is not strategic',
        'I do not know how my work connects to company priorities'
      ],
      scores: [0, 1, 2, 3, 4]
    },
    {
      text: 'If your role were eliminated tomorrow, how quickly could you make a case to leadership for why that decision was wrong?',
      options: [
        'Immediately — I have clear evidence of my value ready to articulate',
        'Within a few days — I would need to pull it together but it exists',
        'It would take effort — I would need to build the case from scratch',
        'I am not confident I could make a compelling case',
        'I have not thought about this before now'
      ],
      scores: [0, 1, 2, 3, 4]
    }
  ];

  const RESULTS = {
    low: {
      status: '// SIGNAL: MONITORED',
      headline: 'You are better positioned than most.',
      body: 'Your role, visibility, and company context put you in a lower-risk tier. That does not mean zero risk. It means you have time to move from reactive to proactive. Your three moves this week focus on locking in your advantage before the landscape shifts around the people around you.',
      cls: ''
    },
    medium: {
      status: '// SIGNAL: ELEVATED',
      headline: 'You have a window. Use it now.',
      body: 'Your score puts you in the zone where the outcome is genuinely undecided. Not by AI, but by the choices you make in the next 60 to 90 days. Workers in this tier who act strategically survive restructures. Workers who wait find out too late.',
      cls: 'medium'
    },
    high: {
      status: '// SIGNAL: CRITICAL',
      headline: 'The signals are real. Here is what to do.',
      body: 'Your score reflects a combination of role vulnerability, company context, and visibility gaps that HR takes seriously in restructure planning. This is not a verdict. It is a map. Workers who understand their exposure and move quickly consistently outperform their score.',
      cls: 'high'
    }
  };

  let currentQ = 0;
  let selectedAnswers = new Array(10).fill(null);

  const overlay    = document.getElementById('assessment-overlay');
  const qWrap      = document.getElementById('question-wrap');
  const resultWrap = document.getElementById('result-wrap');
  const progFill   = document.getElementById('progress-fill');
  const progBar    = document.querySelector('.progress-bar-wrap');
  const qCounter   = document.getElementById('q-counter');

  // ── OPEN / CLOSE ──

  function openAssessment() {
    currentQ = 0;
    selectedAnswers = new Array(10).fill(null);
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    resultWrap.style.display = 'none';
    resultWrap.classList.remove('visible', 'animated');
    qWrap.style.display = 'block';
    renderQuestion(0);
    document.getElementById('close-assessment').focus();
  }

  function closeAssessment() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ── RENDER QUESTION (DOM-safe) ──

  function el(tag, cls, text) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text !== undefined) e.textContent = text;
    return e;
  }

  function renderQuestion(idx) {
    qWrap.style.display = 'block';
    resultWrap.style.display = 'none';

    const progress = (idx / 10) * 100;
    progFill.style.width = progress + '%';
    progBar.setAttribute('aria-valuenow', Math.round(progress));
    qCounter.textContent = 'Question ' + (idx + 1) + ' of 10';

    // Clear
    while (qWrap.firstChild) qWrap.removeChild(qWrap.firstChild);

    const q = QUESTIONS[idx];

    const qNum = el('p', 'q-number', '// Q.' + String(idx + 1).padStart(2, '0'));
    const qText = el('p', 'q-text', q.text);

    const list = el('ul', 'answers-list');
    list.setAttribute('role', 'list');

    q.options.forEach((opt, i) => {
      const li = el('li');
      const btn = el('button', 'answer-option' + (selectedAnswers[idx] === i ? ' selected' : ''));
      btn.setAttribute('data-index', i);
      btn.setAttribute('aria-pressed', selectedAnswers[idx] === i ? 'true' : 'false');

      const letter = el('span', 'answer-letter', LETTERS[i]);
      letter.setAttribute('aria-hidden', 'true');
      const text = el('span', 'answer-text', opt);

      btn.appendChild(letter);
      btn.appendChild(text);

      btn.addEventListener('click', () => selectAnswer(idx, i));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectAnswer(idx, i); }
      });

      li.appendChild(btn);
      list.appendChild(li);
    });

    const nav = el('div', 'q-nav');

    const backBtn = el('button', 'btn-back', '');
    backBtn.textContent = '\u2190 BACK';
    if (idx === 0) backBtn.style.visibility = 'hidden';
    backBtn.addEventListener('click', () => {
      if (idx > 0) { currentQ = idx - 1; renderQuestion(currentQ); }
    });

    const nextBtn = el('button', 'btn-next' + (selectedAnswers[idx] !== null ? ' visible' : ''), '');
    nextBtn.id = 'btn-next';
    nextBtn.textContent = idx < 9 ? 'NEXT \u2192' : 'SEE MY SCORE \u2192';
    nextBtn.addEventListener('click', () => {
      if (selectedAnswers[idx] === null) return;
      if (idx < 9) { currentQ = idx + 1; renderQuestion(currentQ); }
      else showResult();
    });

    nav.appendChild(backBtn);
    nav.appendChild(nextBtn);

    qWrap.appendChild(qNum);
    qWrap.appendChild(qText);
    qWrap.appendChild(list);
    qWrap.appendChild(nav);
  }

  function selectAnswer(qIdx, ansIdx) {
    selectedAnswers[qIdx] = ansIdx;
    qWrap.querySelectorAll('.answer-option').forEach((b, i) => {
      const sel = i === ansIdx;
      b.classList.toggle('selected', sel);
      b.setAttribute('aria-pressed', sel ? 'true' : 'false');
    });
    const nextBtn = document.getElementById('btn-next');
    if (nextBtn) nextBtn.classList.add('visible');
  }

  // ── SHOW RESULT (DOM-safe) ──

  function showResult() {
    progFill.style.width = '100%';
    progBar.setAttribute('aria-valuenow', 100);
    qCounter.textContent = 'Complete';
    qWrap.style.display = 'none';

    const raw = selectedAnswers.reduce((sum, ans, i) => {
      return ans !== null ? sum + QUESTIONS[i].scores[ans] : sum;
    }, 0);
    const score = Math.round(raw / 4);
    const tier = score <= 3 ? 'low' : score <= 6 ? 'medium' : 'high';
    const r = RESULTS[tier];

    // Clear result wrap
    while (resultWrap.firstChild) resultWrap.removeChild(resultWrap.firstChild);

    // Result card
    const card = el('div', 'result-card ' + r.cls);

    const status = el('p', 'result-status', r.status);
    const scoreEl = el('div', 'result-score', score + '/10');
    const headline = el('h2', 'result-headline', r.headline);
    const body = el('p', 'result-body', r.body);

    card.appendChild(status);
    card.appendChild(scoreEl);
    card.appendChild(headline);
    card.appendChild(body);

    // Email section
    const emailSec = el('div', 'result-email-section');

    const emailLabel = el('span', 'result-email-label', '// Get Your Three Moves');
    const emailH = el('h3', 'result-email-headline', 'Get the personalized action plan for your score.');
    const emailSub = el('p', 'result-email-sub', 'Enter your email and I will send your three specific moves calibrated to your result, plus the weekly brief your leadership is not publishing.');

    // BEEHIIV EMBED 1: Replace the form below with your Beehiiv embed code
    const formDiv = el('div', 'beehiiv-result-placeholder');
    const emailLbl = el('label', 'sr-only', 'Your email address');
    emailLbl.setAttribute('for', 'result-email');
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.id = 'result-email';
    emailInput.name = 'email';
    emailInput.className = 'email-input';
    emailInput.placeholder = 'your@email.com\u2026';
    emailInput.autocomplete = 'email';
    emailInput.spellcheck = false;
    const submitBtn = el('button', 'form-btn', 'Send My Plan \u2192');
    submitBtn.type = 'button';

    formDiv.appendChild(emailLbl);
    formDiv.appendChild(emailInput);
    formDiv.appendChild(submitBtn);

    const micro = el('p', 'result-email-micro', 'NO SPAM \u00b7 UNSUBSCRIBE ANYTIME \u00b7 YOUR EMAIL IS NEVER SHARED');

    emailSec.appendChild(emailLabel);
    emailSec.appendChild(emailH);
    emailSec.appendChild(emailSub);
    emailSec.appendChild(formDiv);
    emailSec.appendChild(micro);

    resultWrap.appendChild(card);

    // Booking CTA for medium and high scores
    if (tier === 'medium' || tier === 'high') {
      const bookSec = document.createElement('div');
      bookSec.className = 'result-book-section';

      const bookText = document.createElement('div');
      bookText.className = 'result-book-text';

      const bookH = document.createElement('h4');
      bookH.textContent = 'Talk through your score with Boubacar.';

      const bookP = document.createElement('p');
      bookP.textContent = 'A free 30-minute AI Readiness Call. No pitch. Just a straight read on your situation and your next moves.';

      bookText.appendChild(bookH);
      bookText.appendChild(bookP);

      const bookBtn = document.createElement('a');
      bookBtn.href = 'https://calendly.com/boubacarbarry/ai-readiness-call-human-at-work';
      bookBtn.target = '_blank';
      bookBtn.rel = 'noopener';
      bookBtn.className = 'btn-book';
      bookBtn.textContent = 'Book Your Free 30-Min Call \u2192';

      bookSec.appendChild(bookText);
      bookSec.appendChild(bookBtn);
      resultWrap.appendChild(bookSec);
    }

    resultWrap.appendChild(emailSec);
    resultWrap.style.display = 'block';

    setTimeout(() => {
      resultWrap.classList.add('visible');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        resultWrap.classList.add('animated');
      }));
      resultWrap.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  }

  // ── FOCUS TRAP ──

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    const focusable = Array.from(overlay.querySelectorAll(
      'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])'
    ));
    if (!focusable.length) return;
    const first = focusable[0];
    const last  = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    if (e.key === 'Escape') closeAssessment();
  });

  // ── ROTATING TITLES ──

  const rotEl = document.getElementById('rotating-title');
  if (rotEl) {
    let titleIdx = 0;
    setInterval(() => {
      rotEl.style.opacity = '0';
      setTimeout(() => {
        titleIdx = (titleIdx + 1) % TITLES.length;
        rotEl.textContent = TITLES[titleIdx];
        rotEl.style.opacity = '1';
      }, 350);
    }, 2800);
  }

  // ── SCROLL REVEAL ──

  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObs.observe(el));

  // ── STATS COUNTER ──

  const statNums = document.querySelectorAll('.stat-number[data-target]');
  const statObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const target = parseInt(el.dataset.target, 10);
        const start = performance.now();
        const dur = 1200;
        const tick = (now) => {
          const t = Math.min((now - start) / dur, 1);
          const ease = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(ease * target);
          if (t < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        statObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  statNums.forEach(el => statObs.observe(el));

  // ── WIRE CTAs ──

  ['hero-cta-btn', 'nav-cta-btn', 'pitch-cta-btn', 'footer-assessment-btn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', (e) => { e.preventDefault(); openAssessment(); });
  });

  const closeBtn = document.getElementById('close-assessment');
  if (closeBtn) closeBtn.addEventListener('click', closeAssessment);

  // ── STICKY BOOKING BAR ──
  const bookingBar = document.getElementById('booking-bar');
  const dismissBar = document.getElementById('dismiss-bar');
  let barDismissed = false;

  if (bookingBar && dismissBar) {
    // Show after scrolling past the hero
    const showThreshold = window.innerHeight * 0.9;
    window.addEventListener('scroll', () => {
      if (barDismissed) return;
      if (window.scrollY > showThreshold) {
        bookingBar.classList.add('visible');
      } else {
        bookingBar.classList.remove('visible');
      }
    }, { passive: true });

    dismissBar.addEventListener('click', () => {
      barDismissed = true;
      bookingBar.classList.remove('visible');
    });
  }

  // ── TRACKER COUNTER ──
  const trackerEl = document.getElementById('tracker-count');
  if (trackerEl) {
    // 2025 confirmed US AI-related layoff total (update weekly)
    const TRACKER_TOTAL = 152000;
    const trackerObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1800;
          const tick = (now) => {
            const t = Math.min((now - start) / dur, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const val = Math.round(ease * TRACKER_TOTAL);
            trackerEl.textContent = val.toLocaleString('en-US');
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          trackerObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    trackerObs.observe(trackerEl);
  }

})();
