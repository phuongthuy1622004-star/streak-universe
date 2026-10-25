const APP_VERSION = '10';
window.APP_VERSION = APP_VERSION;
/**
 * STREAK UNIVERSE - HABIT & WORLD TRACKER
 * - Multi-Goal System | English UI | Pure Light Theme
 * - Idempotency + 1-Day Grace Period Streak Engine + Reverse/Undo Check-in
 * - Self-Healing from Audit Log
 * - Firebase RTDB Direct Cloud Sync
 * - 4 Themes: Garden, Zoo, Ocean, Candy
 * - Web Audio API SFX + Confetti
 */

// ============================================================
// FIREBASE CONFIG
// DB_URL: same project as before — streakapp-6eab3
// Uses open REST rules (same pattern as deutschc12026 project)
// NO SDK needed — pure fetch() REST calls
// If RTDB not yet created → sync silently fails, local data safe
// ============================================================
const FB_DB_URL = 'https://streakapp-6eab3-default-rtdb.firebaseio.com';

// ==========================================================================
// 1. SOUND ENGINE
// ==========================================================================
class SoundFX {
  static ctx = null;

  static init() {
    if (!SoundFX.ctx) {
      const A = window.AudioContext || window.webkitAudioContext;
      if (A) SoundFX.ctx = new A();
    }
    if (SoundFX.ctx?.state === 'suspended') SoundFX.ctx.resume();
  }

  static _play(freq, type, duration, ramp) {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const now = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (ramp) osc.frequency.exponentialRampToValueAtTime(ramp, now + duration * 0.8);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain); gain.connect(SoundFX.ctx.destination);
    osc.start(now); osc.stop(now + duration + 0.01);
  }

  static playSuccess() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const now = SoundFX.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
      const o = SoundFX.ctx.createOscillator(), g = SoundFX.ctx.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(f, now + i * 0.08);
      g.gain.setValueAtTime(0.15, now + i * 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.35);
      o.connect(g); g.connect(SoundFX.ctx.destination);
      o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.36);
    });
  }

  static playMilestone() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    [440, 554.37, 659.25, 880].forEach((f, i) => {
      const now = SoundFX.ctx.currentTime + i * 0.09;
      const o = SoundFX.ctx.createOscillator(), g = SoundFX.ctx.createGain();
      o.type = 'triangle'; o.frequency.setValueAtTime(f, now);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.connect(g); g.connect(SoundFX.ctx.destination);
      o.start(now); o.stop(now + 0.36);
    });
  }

  static playPop() { SoundFX._play(600, 'sine', 0.07, 200); }
}

// ==========================================================================
// 2. THEME CONFIGS
//    RULE: tiers go SMALL → BIG (1d = tiny, 5d = small, 10d = medium, 15d = big, 100d = legendary)
//    dead slots = ugly/broken emojis (NOT nice animals)
// ==========================================================================
const THEME_CONFIGS = {
  garden: {
    name: 'Magic Garden', subtext: 'Plants grow as you streak!',
    icon: '🌱', themeClass: 'theme-garden',
    tiers: {
      1:   ['🌱', '🌿', '🍀'],                          // tiny sprout, leaf, clover
      5:   ['🪴', '🌲', '🌳', '🌴', '🎋'],              // potted plant, evergreen, shade tree, palm, bamboo
      10:  ['🌸', '🌷', '🌻', '🌹', '🌺', '🌼'],        // blooming flowers
      15:  ['🍎', '🍓', '🍑', '🍊', '🍋', '🍇', '🍉'],   // sweet fruits
      100: ['💎', '👑', '🌟', '💖', '🏆']               // legendary treasures
    },
    dead: {
      1:   { emoji: '🌾', name: 'Dry Straw' },
      5:   { emoji: '🍂', name: 'Fallen Leaf' },
      10:  { emoji: '🥀', name: 'Withered Flower' },
      15:  { emoji: '🪵', name: 'Dead Log' },
      100: { emoji: '☠️', name: 'Ancient Skull' }
    },
    labels: { 1: 'Sprout', 5: 'Plant & Tree', 10: 'Flower', 15: 'Fruit', 100: 'Legendary' }
  },

  zoo: {
    name: 'Safari Zoo', subtext: 'Raise wild creatures day by day!',
    icon: '🦁', themeClass: 'theme-zoo',
    tiers: {
      1:   ['🐣', '🐥', '🐹', '🐭', '🐿️'],              // tiny baby & nestling
      5:   ['🐰', '🦔', '🦊', '🦝', '🐨', '🐼'],         // small cute critters
      10:  ['🦌', '🦓', '🦒', '🦘', '🦙', '🐴'],         // savannah grazers & runners
      15:  ['🦁', '🐯', '🐻', '🐘', '🦏', '🦛'],         // apex predators & giants
      100: ['🐉', '🦄', '🦅', '👑', '✨']               // mythical legends
    },
    dead: {
      1:   { emoji: '🪹', name: 'Empty Nest' },
      5:   { emoji: '🕸️', name: 'Spiderweb' },
      10:  { emoji: '🦴', name: 'Dry Bone' },
      15:  { emoji: '🪤', name: 'Rusted Trap' },
      100: { emoji: '💀', name: 'Beast Skull' }
    },
    labels: { 1: 'Baby', 5: 'Small Critter', 10: 'Savannah', 15: 'Apex Giant', 100: 'Mythic' }
  },

  aquarium: {
    name: 'Ocean World', subtext: 'Dive deeper with every check-in!',
    icon: '🐬', themeClass: 'theme-aquarium',
    tiers: {
      1:   ['🫧', '🐚', '🦪'],                          // bubble, tiny shell, oyster
      5:   ['🪸', '🪼', '🌿', '🌾'],                    // coral reef, jellyfish, seaweed
      10:  ['🐟', '🐠', '🐡', '🦐', '🦀', '🦑'],        // reef fish, puffer, shrimp, crab, squid
      15:  ['🐬', '🦈', '🐋', '🐳', '🦭', '🐢', '🐙'],  // dolphin, shark, whale, seal, sea turtle, octopus
      100: ['🔱', '🧜‍♀️', '🧜‍♂️', '🌊', '🏝️', '👑']        // Poseidon trident, merfolk, tidal wave, island
    },
    dead: {
      1:   { emoji: '💧', name: 'Popped Drop' },
      5:   { emoji: '🦴', name: 'Fish Bone' },
      10:  { emoji: '🥫', name: 'Rust Can' },
      15:  { emoji: '⚓', name: 'Rusted Anchor' },
      100: { emoji: '🚢', name: 'Shipwreck' }
    },
    labels: { 1: 'Bubble', 5: 'Coral Reef', 10: 'School of Fish', 15: 'Ocean Giant', 100: 'Atlantis' }
  },

  candy: {
    name: 'Candy Land', subtext: 'Sweet rewards for sweet streaks!',
    icon: '🍭', themeClass: 'theme-candy',
    tiers: {
      1:   ['🍬', '🍭', '🍡'],                          // wrapped candy, lollipop, dango
      5:   ['🍫', '🍪', '🍮', '🍯'],                    // chocolate bar, cookie, pudding, honey
      10:  ['🍩', '🥞', '🧇', '🧁', '🥧'],              // donut, pancake, waffle, cupcake, pie
      15:  ['🎂', '🍨', '🍧', '🍦'],                    // layer cake, sundae, shaved ice, soft serve
      100: ['🏰', '👑', '💎', '🌟']                     // candy castle, sugar crown, candy gem
    },
    dead: {
      1:   { emoji: '🐜', name: 'Ant on Sugar' },
      5:   { emoji: '🪰', name: 'Fly on Food' },
      10:  { emoji: '📦', name: 'Moldy Box' },
      15:  { emoji: '🦷', name: 'Cavity Tooth' },
      100: { emoji: '🗑️', name: 'Trash Bin' }
    },
    labels: { 1: 'Sweet Drop', 5: 'Snack & Cocoa', 10: 'Bakery', 15: 'Grand Feast', 100: 'Candy Castle' }
  }
};

// ==========================================================================
// 3. STREAK ENGINE
// ==========================================================================
class StreakEngine {
  static TIERS = [100, 15, 10, 5]; // greedy order (largest first)

  static formatDate(d = new Date()) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  static parseDate(str) {
    if (!str) return null;
    const [y,m,d] = str.split('-').map(Number);
    return new Date(y, m-1, d);
  }

  static diffDays(d1, d2) {
    const a = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const b = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((b - a) / 86400000);
  }

  static hashEmoji(pool, seed) {
    if (!pool?.length) return '⭐';
    let h = 0;
    for (let i = 0; i < seed.length; i++) { h = (h << 5) - h + seed.charCodeAt(i); h |= 0; }
    return pool[Math.abs(h) % pool.length];
  }

  /** Rule 1+2: idempotent check-in with frequency + 1-cycle grace */
  static recordDailyCompletion(goal, today = new Date()) {
    const todayStr = this.formatDate(today);
    if (goal.streak?.last_completed_date === todayStr) return { isNewDay: false, graceApplied: false };

    const freq = parseInt(goal.frequency, 10) || 1;
    let next = goal.streak?.current_streak ?? 0;
    let graceApplied = false;
    const last = goal.streak?.last_completed_date ?? null;

    if (last) {
      const diff = this.diffDays(this.parseDate(last), today);
      if (diff <= freq) {
        next += 1;
      } else if (diff <= (2 * freq)) {
        next += 1;
        graceApplied = true;
      } else {
        next = 1;
      }
    } else {
      next = 1;
    }

    const longest = Math.max(goal.streak?.longest_streak ?? 0, next);
    goal.streak = { current_streak: next, longest_streak: longest, last_completed_date: todayStr };

    const dateSet = new Set(goal.streak_dates ?? []);
    dateSet.add(todayStr);
    goal.streak_dates = [...dateSet].sort();

    return { isNewDay: true, graceApplied };
  }

  /** Rule 3: passive expiration on app open */
  static checkPassiveExpiration(goal, today = new Date()) {
    if (!goal.streak?.last_completed_date) return;
    const last = this.parseDate(goal.streak.last_completed_date);
    if (!last) return;
    const freq = parseInt(goal.frequency, 10) || 1;
    if (this.diffDays(last, today) > (2 * freq) && goal.streak.current_streak > 0)
      goal.streak.current_streak = 0;
  }

  /** Section 4: Recalculate streak from dates with frequency */
  static recalculateStreakFromDates(dates, frequency = 1, today = new Date()) {
    if (!dates?.length) return { current_streak: 0, longest_streak: 0, last_completed_date: '' };
    const sorted = [...new Set(dates)].sort();
    const freq = parseInt(frequency, 10) || 1;
    let cur = 1, max = 1;
    for (let i = 1; i < sorted.length; i++) {
      const d = this.diffDays(this.parseDate(sorted[i-1]), this.parseDate(sorted[i]));
      if (d <= (2 * freq)) { cur++; } else { cur = 1; }
      max = Math.max(max, cur);
    }
    const last = sorted[sorted.length - 1];
    const active = this.diffDays(this.parseDate(last), today) > (2 * freq) ? 0 : cur;
    return { current_streak: active, longest_streak: max, last_completed_date: last };
  }

  /** Section 6: Greedy tier decomposition → world grid items based on times (frequency) */
  static generateWorldItems(dates, themeKey = 'garden', frequency = 1) {
    if (!dates?.length) return [];
    const sorted = [...new Set(dates)].sort();
    const cfg = THEME_CONFIGS[themeKey] ?? THEME_CONFIGS.garden;
    const items = [];
    const freq = parseInt(frequency, 10) || 1;
    let runStart = 0;

    for (let i = 1; i <= sorted.length; i++) {
      const isLast = i === sorted.length;
      let gapDays = 0;
      if (!isLast) {
        gapDays = this.diffDays(this.parseDate(sorted[i-1]), this.parseDate(sorted[i]));
      }

      const isBreak = !isLast && gapDays > (2 * freq);

      if (isBreak || isLast) {
        const run = sorted.slice(runStart, i);
        let remaining = run.length, idx = 0;

        for (const tier of this.TIERS) {
          const cnt = Math.floor(remaining / tier);
          for (let c = 0; c < cnt; c++) {
            const d = run[Math.min(idx + tier - 1, run.length - 1)];
            const pool = cfg.tiers[tier];
            const emoji = pool ? this.hashEmoji(pool, d) : '🌱';
            items.push({
              type: 'healthy',
              tier,
              emoji,
              label: `${tier}x`,
              date: d,
              title: `${tier} ${tier === 1 ? 'time' : 'times'}`
            });
            idx += tier;
          }
          remaining %= tier;
        }
        for (let r = 0; r < remaining; r++) {
          const d = run[idx + r];
          const pool = cfg.tiers[1];
          const emoji = pool ? this.hashEmoji(pool, d) : '🌱';
          items.push({
            type: 'healthy',
            tier: 1,
            emoji,
            label: '1x',
            date: d,
            title: '1 time'
          });
        }

        if (isBreak) {
          const missedCycles = Math.max(1, Math.floor(gapDays / freq) - 1);
          let dt = 1;
          if (missedCycles >= 100) dt = 100;
          else if (missedCycles >= 15) dt = 15;
          else if (missedCycles >= 10) dt = 10;
          else if (missedCycles >= 5)  dt = 5;

          const dead = cfg.dead[dt] ?? { emoji: '🌾', name: 'Miss' };
          items.push({
            type: 'dead',
            tier: dt,
            emoji: dead.emoji,
            label: `${missedCycles}m`,
            gapDays,
            title: `Missed ${missedCycles} ${missedCycles === 1 ? 'time' : 'times'} (${gapDays} days)`,
            dateDesc: `${run[run.length-1]} → ${sorted[i]}`
          });
          runStart = i;
        }
      }
    }
    return items;
  }
}

// ==========================================================================
// 4. FIREBASE REST — pure fetch, no SDK, open rules
// ==========================================================================
class FirebaseSync {
  static DB_URL = 'https://streakapp-6eab3-default-rtdb.asia-southeast1.firebasedatabase.app';
}

// ==========================================================================
// 5. APP STORAGE — Firebase RTDB only (no localStorage for goals)
//    localStorage chỉ dùng cho: theme preference, device ID
// ==========================================================================
class AppStorage {
  static KEY = 'streak_universe_device_id';

  static getDeviceId() {
    let id = localStorage.getItem(this.KEY);
    if (!id) {
      id = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      localStorage.setItem(this.KEY, id);
    }
    return id;
  }

  static _endpoint() {
    return `${FirebaseSync.DB_URL}/users/${encodeURIComponent(this.getDeviceId())}/goals.json`;
  }

  /** Load goals from Firebase RTDB */
  static async loadGoals() {
    const resp = await fetch(this._endpoint());
    if (!resp.ok) throw new Error(`Load failed: ${resp.status}`);
    const raw = await resp.json();
    if (!raw) return [];
    return Array.isArray(raw) ? raw.filter(Boolean) : Object.values(raw).filter(Boolean);
  }

  /** Save goals to Firebase RTDB */
  static async saveGoals(goals) {
    const resp = await fetch(this._endpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goals)
    });
    if (!resp.ok) throw new Error(`Save failed: ${resp.status}`);
    return goals;
  }
}

// ==========================================================================
// 6. APP CONTROLLER
// ==========================================================================
class AppController {
  constructor() {
    this.goals = [];
    this.currentWorldGoalId = null;
    this.currentWorldItems = [];
    this.deferredPrompt = null;

    this.initElements();
    this.bindEvents();
    this.loadInitialData();
  }

  initElements() {
    this.btnOpenCreate   = document.getElementById('btnOpenCreateGoal');

    this.statActive    = document.getElementById('statActiveStreaks');
    this.statBest      = document.getElementById('statBestStreak');
    this.statTotal     = document.getElementById('statTotalDays');
    this.statToday     = document.getElementById('statTodayRate');

    this.goalsContainer = document.getElementById('goalsContainer');
    this.emptyState     = document.getElementById('emptyState');

    // Goal modal
    this.goalModal     = document.getElementById('goalModal');
    this.goalModalBox  = document.getElementById('goalModalBox');
    this.goalModalTitle= document.getElementById('goalModalTitle');
    this.goalForm      = document.getElementById('goalForm');
    this.btnCloseGoal  = document.getElementById('btnCloseGoalModal');
    this.btnCancelGoal = document.getElementById('btnCancelGoalModal');

    this.formGoalId       = document.getElementById('formGoalId');
    this.formGoalTitle    = document.getElementById('formGoalTitle');
    this.formGoalCategory = document.getElementById('formGoalCategory');
    this.formTargetMode   = document.getElementById('formTargetMode'); // <select>
    this.customTargetBox  = document.getElementById('customTargetInputContainer');
    this.formDailyTarget  = document.getElementById('formDailyTarget');
    this.formFrequency    = document.getElementById('formFrequency');
    this.formDeadline     = document.getElementById('formDeadline');

    // World modal
    this.worldModal        = document.getElementById('worldModal');
    this.worldModalBox     = document.getElementById('worldModalBox');
    this.worldHeaderBanner = document.getElementById('worldHeaderBanner');
    this.worldThemeIcon    = document.getElementById('worldThemeIcon');
    this.worldGoalTitle    = document.getElementById('worldGoalTitle');
    this.worldThemeSubtext = document.getElementById('worldThemeSubtext');
    this.worldCurrentStreak= document.getElementById('worldCurrentStreak');
    this.worldLongestStreak= document.getElementById('worldLongestStreak');
    this.worldGraceText    = document.getElementById('worldGraceText');
    this.worldSlotsGrid    = document.getElementById('worldSlotsGrid');
    this.worldLegendContent= document.getElementById('worldLegendContent');
    this.slotDetailBox     = document.getElementById('slotDetailBox');
    this.slotDetailEmoji   = document.getElementById('slotDetailEmoji');
    this.slotDetailTitle   = document.getElementById('slotDetailTitle');
    this.slotDetailDesc    = document.getElementById('slotDetailDesc');
    this.btnCloseWorld     = document.getElementById('btnCloseWorldModal');
    this.btnWorldDone      = document.getElementById('btnWorldDone');

    // PWA
    this.pwaInstallBanner = document.getElementById('pwaInstallBanner');
    this.btnPwaInstall    = document.getElementById('btnPwaInstall');
    this.btnPwaDismiss    = document.getElementById('btnPwaDismiss');
  }

  bindEvents() {
    // Goal CRUD
    this.btnOpenCreate.addEventListener('click', () => this.openGoalModal());
    this.btnCloseGoal.addEventListener('click',  () => this.closeGoalModal());
    this.btnCancelGoal.addEventListener('click', () => this.closeGoalModal());
    this.goalForm.addEventListener('submit', e => this.handleGoalFormSubmit(e));

    // Target mode select
    this.formTargetMode.addEventListener('change', () => {
      if (this.formTargetMode.value === 'custom') {
        this.customTargetBox.classList.remove('hidden');
        this.formDailyTarget.focus();
      } else {
        this.customTargetBox.classList.add('hidden');
      }
    });

    // Theme radio visual
    document.querySelectorAll('input[name="goalTheme"]').forEach(r => {
      r.addEventListener('change', () => this._styleThemeRadios());
    });

    // World modal
    this.btnCloseWorld.addEventListener('click', () => this.closeWorldModal());
    this.btnWorldDone.addEventListener('click',  () => this.closeWorldModal());

    // PWA
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault(); this.deferredPrompt = e;
      this.pwaInstallBanner?.classList.remove('hidden');
    });
    this.btnPwaInstall?.addEventListener('click', async () => {
      if (!this.deferredPrompt) return;
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') this.pwaInstallBanner.classList.add('hidden');
      this.deferredPrompt = null;
    });
    this.btnPwaDismiss?.addEventListener('click', () => this.pwaInstallBanner.classList.add('hidden'));
  }

  // =========================================================================
  // INIT
  // =========================================================================
  loadInitialData() {
    // Clear legacy localStorage cache & dark theme setting
    try {
      localStorage.removeItem('streak_universe_goals');
      localStorage.removeItem('streak_universe_theme');
    } catch (e) {}
    document.documentElement.classList.remove('dark');

    // Show loading state
    this.goalsContainer.innerHTML = `
      <div class="col-span-2 py-16 text-center text-slate-400">
        <div class="text-3xl mb-2 animate-bounce">🔥</div>
        <p class="text-xs">Loading your goals...</p>
      </div>`;
    this.emptyState.classList.add('hidden');

    // Load from Firebase
    AppStorage.loadGoals()
      .then(goals => {
        this.goals = Array.isArray(goals) ? goals : [];
      })
      .then(() => {
        // Passive expiration check
        const today = new Date();
        let changed = false;
        this.goals.forEach(g => {
          const prev = g.streak?.current_streak;
          StreakEngine.checkPassiveExpiration(g, today);
          if (g.streak?.current_streak !== prev) changed = true;
        });
        if (changed) return AppStorage.saveGoals(this.goals);
      })
      .then(() => {
        this.renderStats();
        this.renderGoals();
      })
      .catch(err => {
        console.warn('Load error:', err.message);
        this.goals = [];
        this.renderStats();
        this.renderGoals();
      });
  }

  // =========================================================================
  // STATS
  // =========================================================================
  renderStats() {
    let active=0, best=0, total=0, todayCnt=0;
    const today = StreakEngine.formatDate();
    this.goals.forEach(g => {
      const cur = g.streak?.current_streak ?? 0;
      const lng = g.streak?.longest_streak  ?? 0;
      if (cur > 0) active++;
      if (lng > best) best = lng;
      total += g.streak_dates?.length ?? 0;
      if (g.streak?.last_completed_date === today) todayCnt++;
    });
    this.statActive.textContent = active;
    this.statBest.textContent   = best;
    this.statTotal.textContent  = total;
    const rate = this.goals.length > 0 ? Math.round(todayCnt / this.goals.length * 100) : 0;
    this.statToday.textContent  = `${rate}%`;
  }

  // =========================================================================
  // GOAL CARDS
  // =========================================================================
  renderGoals() {
    const today = StreakEngine.formatDate();
    const list = this.goals;

    if (!list.length) {
      this.goalsContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }
    this.emptyState.classList.add('hidden');

    const CATS = {
      study:   { label:'Study',   cls:'bg-blue-100 text-blue-800 border-blue-200' },
      health:  { label:'Health',  cls:'bg-emerald-100 text-emerald-800 border-emerald-200' },
      work:    { label:'Work',    cls:'bg-purple-100 text-purple-800 border-purple-200' },
      mind:    { label:'Wellness',cls:'bg-amber-100 text-amber-800 border-amber-200' },
      finance: { label:'Finance', cls:'bg-teal-100 text-teal-800 border-teal-200' },
      other:   { label:'Other',   cls:'bg-pink-100 text-pink-800 border-pink-200' }
    };

    const THEME_ICON_CLS = {
      garden:   'bg-emerald-100/90 border-emerald-200 text-emerald-800',
      zoo:      'bg-amber-100/90 border-amber-200 text-amber-800',
      aquarium: 'bg-sky-100/90 border-sky-200 text-sky-800',
      candy:    'bg-pink-100/90 border-pink-200 text-pink-800'
    };

    this.goalsContainer.innerHTML = list.map(goal => {
      const done = goal.streak?.last_completed_date === today;
      const cfg  = THEME_CONFIGS[goal.theme] ?? THEME_CONFIGS.garden;
      const icon = cfg.icon;
      const cur  = goal.streak?.current_streak  ?? 0;
      const lng  = goal.streak?.longest_streak  ?? 0;
      const cat  = CATS[goal.category] ?? CATS.other;
      const freq = parseInt(goal.frequency, 10) || 1;
      const freqLabel = freq === 1 ? '1 ngày / 1 lần' : `${freq} ngày / 1 lần`;
      const themeClass = 'card-theme-' + (goal.theme || 'garden');
      const iconCls = THEME_ICON_CLS[goal.theme] || THEME_ICON_CLS.garden;

      let dlBadge = '';
      if (goal.deadline) {
        const diff = StreakEngine.diffDays(new Date(), StreakEngine.parseDate(goal.deadline));
        if (diff < 0)      dlBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-300 font-bold">Overdue</span>`;
        else if (diff===0) dlBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">Due Today!</span>`;
        else               dlBadge = `<span class="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold">${diff}d left</span>`;
      }

      const targetTxt = goal.daily_target
        ? `<strong>Target:</strong> ${this.esc(goal.daily_target)}`
        : `<strong>Target:</strong> Tick ✓`;

      return `
        <div class="${themeClass} rounded-2xl p-4 sm:p-5 flex flex-col gap-3 transition-all duration-200 group">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xl p-1.5 rounded-xl border shadow-sm ${iconCls}">${icon}</span>
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${cat.cls}">${cat.label}</span>
              ${dlBadge}
            </div>
            <div class="flex gap-1 shrink-0">
              <button onclick="app.openEditGoal('${goal.id}')" title="Edit goal" class="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white/80 flex items-center justify-center text-xs transition">✏️</button>
              <button onclick="app.deleteGoal('${goal.id}')" title="Delete goal" class="w-7 h-7 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white/80 flex items-center justify-center text-xs transition">🗑️</button>
            </div>
          </div>

          <div>
            <h3 class="text-base font-extrabold text-slate-800 tracking-tight leading-snug">${this.esc(goal.title)}</h3>
            <div class="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-1.5">
              <span>${targetTxt}</span>
              <span class="text-slate-300">•</span>
              <span class="font-semibold text-slate-700">📅 ${freqLabel}</span>
            </div>
            ${goal.deadline ? `
              <div class="mt-2 text-[11px] font-medium text-slate-600 flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <span>Deadline: <strong class="text-slate-800 font-semibold">${goal.deadline}</strong></span>
                ${dlBadge}
              </div>
            ` : ''}
          </div>

          <div class="flex items-center justify-between pt-2.5 border-t border-slate-200/60">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-xl bg-amber-100/90 border border-amber-300 flex items-center justify-center text-lg ${cur > 0 ? 'flame-glow' : 'opacity-60'}">🔥</div>
              <div>
                <div class="text-base font-black text-amber-700 leading-tight">${cur} <span class="text-[11px] font-bold text-slate-500">${cur === 1 ? 'time' : 'times'}</span></div>
                <div class="text-[10px] text-slate-500 font-medium">Best: <strong class="text-rose-600 font-bold">${lng} ${lng === 1 ? 'time' : 'times'}</strong></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.openWorldModal('${goal.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/90 hover:bg-white text-slate-700 border border-slate-200/90 shadow-sm flex items-center gap-1.5 transition active:scale-95">
                <span>${icon}</span> <span>World</span>
              </button>
              <button onclick="app.toggleCheckIn('${goal.id}')" title="${done ? 'Click to undo' : 'Check-in today'}" class="streak-check-btn px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm active:scale-95 ${
                done
                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300 hover:bg-rose-100 hover:text-rose-700 hover:border-rose-300'
                  : 'bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:opacity-95 text-white shadow-rose-500/25'
              }">
                ${done ? '✓ Done' : 'Check-in 🔥'}
              </button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // =========================================================================
  // CHECK-IN & REVERSE (UNDO IF CLICKED AGAIN)
  // =========================================================================
  toggleCheckIn(id) {
    const goal = this.goals.find(g => g.id === id);
    if (!goal) return;

    const todayStr = StreakEngine.formatDate();
    const isCompletedToday = goal.streak?.last_completed_date === todayStr || (goal.streak_dates || []).includes(todayStr);

    // REVERSE / UNDO TODAY'S COMPLETION
    if (isCompletedToday) {
      goal.streak_dates = (goal.streak_dates || []).filter(d => d !== todayStr);
      goal.streak = StreakEngine.recalculateStreakFromDates(goal.streak_dates, goal.frequency || 1);

      SoundFX.playPop();
      this.renderStats();
      this.renderGoals();
      AppStorage.saveGoals(this.goals).catch(e => this.showToast('⚠️ Save failed: ' + e.message));
      this.showToast('Check-in undone ↩️');
      return;
    }

    // COMPLETE TODAY
    const res = StreakEngine.recordDailyCompletion(goal);
    if (res.isNewDay) {
      goal.streak.current_streak % 5 === 0 ? SoundFX.playMilestone() : SoundFX.playSuccess();
      if (typeof confetti === 'function')
        confetti({ particleCount: 55, spread: 65, origin: { y: 0.8 }, colors: ['#f59e0b','#ec4899','#6366f1','#10b981'] });

      this.renderStats();
      this.renderGoals();
      AppStorage.saveGoals(this.goals).catch(e => this.showToast('⚠️ Save failed: ' + e.message));

      if (res.graceApplied) this.showToast('🛡️ Grace period! Streak protected.');
    }
  }

  // =========================================================================
  // GOAL MODAL
  // =========================================================================
  openGoalModal(editing = null) {
    this.goalForm.reset();
    this.customTargetBox.classList.add('hidden');

    if (editing) {
      this.goalModalTitle.textContent = '✏️ Edit Goal';
      this.formGoalId.value       = editing.id;
      this.formGoalTitle.value    = editing.title;
      this.formGoalCategory.value = editing.category || 'study';

      if (editing.daily_target?.trim()) {
        this.formTargetMode.value = 'custom';
        this.customTargetBox.classList.remove('hidden');
        this.formDailyTarget.value = editing.daily_target;
      } else {
        this.formTargetMode.value = 'tick';
      }

      this.formFrequency.value = editing.frequency || 1;
      this.formDeadline.value  = editing.deadline || '';

      const themeRadio = document.querySelector(`input[name="goalTheme"][value="${editing.theme || 'garden'}"]`);
      if (themeRadio) themeRadio.checked = true;
    } else {
      this.goalModalTitle.textContent = '🎯 New Goal';
      this.formGoalId.value = '';
      this.formGoalCategory.value  = 'study';
      this.formTargetMode.value    = 'tick';
      this.formFrequency.value     = '1';
      this.formDeadline.value      = '';
      const def = document.querySelector('input[name="goalTheme"][value="garden"]');
      if (def) def.checked = true;
    }

    this._styleThemeRadios();
    this.goalModal.classList.remove('opacity-0', 'pointer-events-none');
    this.goalModalBox.classList.remove('translate-y-8');
  }

  closeGoalModal() {
    this.goalModal.classList.add('opacity-0', 'pointer-events-none');
    this.goalModalBox.classList.add('translate-y-8');
  }

  handleGoalFormSubmit(e) {
    e.preventDefault();
    const id       = this.formGoalId.value.trim() || ('goal_' + Date.now());
    const title    = this.formGoalTitle.value.trim();
    const category = this.formGoalCategory.value;
    const daily_target = this.formTargetMode.value === 'custom' && this.formDailyTarget.value.trim()
      ? this.formDailyTarget.value.trim() : '';
    const frequency= parseInt(this.formFrequency.value, 10) || 1;
    const deadline = this.formDeadline.value;
    const theme    = document.querySelector('input[name="goalTheme"]:checked')?.value || 'garden';

    const idx = this.goals.findIndex(g => g.id === id);
    if (idx >= 0) {
      this.goals[idx] = { ...this.goals[idx], title, category, daily_target, deadline, frequency, theme };
      this.showToast('Goal updated ✅');
    } else {
      this.goals.unshift({ id, title, category, daily_target, deadline, frequency, theme,
        created_at: StreakEngine.formatDate(),
        streak: { current_streak:0, longest_streak:0, last_completed_date:'' },
        streak_dates: [] });
      this.showToast('Goal created! Tap Check-in 🔥');
    }

    AppStorage.saveGoals(this.goals).then(() => {
      this.closeGoalModal();
      this.renderStats();
      this.renderGoals();
    }).catch(e => this.showToast('⚠️ Save failed: ' + e.message));
  }

  openEditGoal(id) {
    const g = this.goals.find(g => g.id === id);
    if (g) this.openGoalModal(g);
  }

  deleteGoal(id) {
    const g = this.goals.find(g => g.id === id);
    if (!g) return;
    if (confirm(`Delete "${g.title}"?`)) {
      this.goals = this.goals.filter(g => g.id !== id);
      this.renderStats();
      this.renderGoals();
      AppStorage.saveGoals(this.goals).then(() => {
        this.showToast('Deleted 🗑️');
      }).catch(e => this.showToast('⚠️ Delete failed: ' + e.message));
    }
  }

  // =========================================================================
  // WORLD MODAL
  // =========================================================================
  openWorldModal(id) {
    const goal = this.goals.find(g => g.id === id);
    if (!goal) return;
    this.currentWorldGoalId = id;

    const cfg  = THEME_CONFIGS[goal.theme] ?? THEME_CONFIGS.garden;
    const icon = cfg.icon;

    this.worldHeaderBanner.className = `p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-300 ${cfg.themeClass}`;
    this.worldThemeIcon.textContent    = icon;
    this.worldGoalTitle.textContent    = goal.title;
    this.worldThemeSubtext.textContent = `${cfg.name} · ${cfg.subtext}`;

    const cur = goal.streak?.current_streak ?? 0;
    const lng = goal.streak?.longest_streak ?? 0;
    const freq = parseInt(goal.frequency, 10) || 1;
    this.worldCurrentStreak.textContent = `${cur} ${cur === 1 ? 'time' : 'times'}`;
    this.worldLongestStreak.textContent = `${lng} ${lng === 1 ? 'time' : 'times'}`;
    if (this.worldGraceText) {
      this.worldGraceText.textContent = freq === 1 ? '1-Day 🛡️' : `${freq}d Grace 🛡️`;
    }

    const items = StreakEngine.generateWorldItems(goal.streak_dates ?? [], goal.theme, freq);
    this.currentWorldItems = items;
    this.slotDetailBox.classList.add('hidden');

    if (!items.length) {
      this.worldSlotsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <div class="text-4xl mb-2">${icon}</div>
          <p class="text-xs">No check-ins yet — tap Check-in to start!</p>
        </div>`;
    } else {
      this.worldSlotsGrid.innerHTML = items.map((item, i) => `
        <div class="world-slot ${item.type} tier-${item.tier} animate-pop-in" style="animation-delay:${Math.min(i*0.02,0.6)}s" onclick="app.selectSlot(${i})">
          <span class="text-2xl sm:text-3xl select-none">${item.emoji}</span>
          <span class="slot-badge">${item.label}</span>
        </div>`).join('');
    }

    this._renderLegend(cfg);

    this.worldModal.classList.remove('opacity-0', 'pointer-events-none');
    this.worldModalBox.classList.remove('translate-y-8');
  }

  selectSlot(i) {
    const item = this.currentWorldItems[i];
    if (!item) return;
    SoundFX.playPop();
    this.slotDetailBox.classList.remove('hidden');
    this.slotDetailEmoji.textContent = item.emoji;
    this.slotDetailTitle.textContent = item.title;
    this.slotDetailDesc.textContent  = item.type === 'healthy'
      ? `Completed on ${item.date} (${item.label})`
      : `${item.dateDesc} — ${item.gapDays} days missed`;
  }

  _renderLegend(cfg) {
    const themeStyles = {
      garden:   { box: 'bg-emerald-50/90 border-2 border-emerald-300 hover:border-emerald-400', badge: 'bg-emerald-100 text-emerald-800' },
      zoo:      { box: 'bg-amber-50/90 border-2 border-amber-300 hover:border-amber-400',       badge: 'bg-amber-100 text-amber-800' },
      aquarium: { box: 'bg-sky-50/90 border-2 border-sky-300 hover:border-sky-400',           badge: 'bg-sky-100 text-sky-800' },
      candy:    { box: 'bg-pink-50/90 border-2 border-pink-300 hover:border-pink-400',         badge: 'bg-pink-100 text-pink-800' }
    };
    const currentThemeKey = Object.keys(THEME_CONFIGS).find(k => THEME_CONFIGS[k] === cfg) || 'garden';
    const st = themeStyles[currentThemeKey] || themeStyles.garden;

    this.worldLegendContent.innerHTML = [1, 5, 10, 15, 100].map(t => {
      const pool = cfg.tiers[t];
      const live = pool?.[0] ?? '🌱';
      const dead = cfg.dead[t] ?? { emoji: '🌾' };
      return `
        <div class="py-2.5 px-1 rounded-xl ${st.box} shadow-xs text-center flex flex-col items-center justify-center transition-transform hover:scale-105">
          <div class="flex items-center justify-center gap-1 text-xl mb-1">
            <span class="select-none">${live}</span>
            <span class="text-[9px] text-slate-300 font-bold">/</span>
            <span class="select-none opacity-60">${dead.emoji}</span>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black ${st.badge}">${t} ${t === 1 ? 'time' : 'times'}</span>
        </div>`;
    }).join('');
  }

  closeWorldModal() {
    this.worldModal.classList.add('opacity-0', 'pointer-events-none');
    this.worldModalBox.classList.add('translate-y-8');
    this.currentWorldGoalId = null;
  }

  // =========================================================================
  // FIREBASE SYNC (no-op — AppStorage.saveGoals writes directly to Firebase)
  // =========================================================================
  _cloudSync() { /* data already saved to Firebase via AppStorage.saveGoals */ }

  // =========================================================================
  // HELPERS
  // =========================================================================
  _styleThemeRadios() {
    document.querySelectorAll('.theme-choice').forEach(lbl => {
      const r = lbl.querySelector('input');
      lbl.classList.toggle('ring-2',         r?.checked ?? false);
      lbl.classList.toggle('ring-indigo-500', r?.checked ?? false);
      lbl.classList.toggle('border-indigo-500', r?.checked ?? false);
    });
  }

  esc(s) {
    return (s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }

  showToast(msg) {
    document.getElementById('appToast')?.remove();
    const t = document.createElement('div');
    t.id = 'appToast';
    t.className = 'fixed bottom-5 left-1/2 -translate-x-1/2 z-50 glass-card px-4 py-2.5 rounded-2xl border border-indigo-500/60 text-xs font-semibold text-slate-900 dark:text-white shadow-2xl flex items-center gap-2 max-w-xs text-center';
    t.innerHTML = `<span>🔔</span><span>${msg}</span>`;
    document.body.appendChild(t);
    setTimeout(() => { t.style.transition = 'opacity .4s'; t.style.opacity = '0'; setTimeout(() => t.remove(), 400); }, 3000);
  }
}

// ==========================================================================
// 7. SERVICE WORKER (Offline PWA)
// ==========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(e => console.debug('SW:', e));
  });
}

// Bootstrap
let app;
window.addEventListener('DOMContentLoaded', () => { app = new AppController(); window.app = app; });
