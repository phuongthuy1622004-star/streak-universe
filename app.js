/**
 * STREAK UNIVERSE - HABIT & WORLD TRACKER
 * Architecture based on Deutsch C1 Technical Specification
 * Features:
 * - Multi-Goal / Multi-Habit System (English UI)
 * - Bright, Light Theme by default with Day/Night toggle
 * - Daily Target Modes: "Just Tick (✓)" vs "Specific Amount"
 * - Linked Milestone Target & Deadline with ⚡ Auto-Calculation
 * - Idempotency & 1-Day Automatic Grace Period
 * - Self-Healing Engine from Audit Log (streak_dates)
 * - Offline-First with silent background Firebase RTDB Union Merge Sync
 * - 5 Themes: Garden, Zoo, Aquarium, Candy, Custom Emoji
 * - Web Audio API Sound FX & Confetti
 */

// ==========================================================================
// 1. SOUND ENGINE (Web Audio API - 100% Offline, Zero external files)
// ==========================================================================
class SoundFX {
  static ctx = null;

  static init() {
    if (!SoundFX.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) SoundFX.ctx = new AudioCtx();
    }
    if (SoundFX.ctx && SoundFX.ctx.state === 'suspended') {
      SoundFX.ctx.resume();
    }
  }

  static playSuccess() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const now = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  static playMilestone() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const now = SoundFX.ctx.currentTime + idx * 0.09;
      const osc = SoundFX.ctx.createOscillator();
      const gain = SoundFX.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(SoundFX.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);
    });
  }

  static playPop() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const now = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

// ==========================================================================
// 2. THEMES CONFIGURATION (Garden, Zoo, Aquarium, Candy, Custom)
// ==========================================================================
const THEME_CONFIGS = {
  garden: {
    id: 'garden',
    name: 'Magic Garden',
    subtext: 'Lush plants, blooming flowers & sweet fruits',
    icon: '🌱',
    themeClass: 'theme-garden',
    tiers: {
      100: ['❤️', '🧡', '💛', '💚', '💙', '💜', '💖', '💝'],
      15:  ['🍑', '🍓', '🍎', '🍏', '🍐', '🍊', '🍋', '🍒', '🍇', '🍉'],
      10:  ['🌸', '🌷', '🪷', '🌻', '🌹', '🌺', '🌼'],
      5:   ['🌳', '🌲', '🌴', '🎋'],
      1:   ['🌱']
    },
    dead: {
      100: { emoji: '👻', name: 'Ghost' },
      15:  { emoji: '☠️', name: 'Skull' },
      10:  { emoji: '🪵', name: 'Dry Log' },
      5:   { emoji: '🍂', name: 'Fallen Leaves' },
      1:   { emoji: '🌾', name: 'Dry Straw' }
    },
    labels: {
      100: 'Diamond Heart (100d)',
      15:  'Juicy Fruit (15d)',
      10:  'Blooming Flower (10d)',
      5:   'Majestic Tree (5d)',
      1:   'Sprout (1d)'
    }
  },

  zoo: {
    id: 'zoo',
    name: 'Safari Zoo',
    subtext: 'Wild beasts, prairie wildlife & mythic dragon',
    icon: '🦁',
    themeClass: 'theme-zoo',
    tiers: {
      100: ['🦄', '🐉', '🐲', '✨'],
      15:  ['🦁', '🐯', '🐻', '🐘', '🦏', '🦛'],
      10:  ['🦌', '🐴', '🦓', '🦒', '🦘', '🦙'],
      5:   ['🦊', '🐰', '🦝', '🐨', '🐼', '🐺'],
      1:   ['🐣', '🐭', '🐹', '🐥', '🐿️']
    },
    dead: {
      100: { emoji: '👻', name: 'Ghost Beast' },
      15:  { emoji: '🪤', name: 'Empty Trap' },
      10:  { emoji: '🪨', name: 'Moss Fossil' },
      5:   { emoji: '🦴', name: 'Dry Bone' },
      1:   { emoji: '🥚', name: 'Empty Eggshell' }
    },
    labels: {
      100: 'Mythic Dragon & Unicorn (100d)',
      15:  'Apex Predator (15d)',
      10:  'Prairie Creature (10d)',
      5:   'Energetic Animal (5d)',
      1:   'Baby Creature (1d)'
    }
  },

  aquarium: {
    id: 'aquarium',
    name: 'Ocean Aquarium',
    subtext: 'Deep sea creatures, tropical fish & whale',
    icon: '🐬',
    themeClass: 'theme-aquarium',
    tiers: {
      100: ['🐋', '🧜‍♂️', '🔱', '🦈'],
      15:  ['🐬', '🦈', '🦭', '🪼', '🐊'],
      10:  ['🐢', '🐙', '🦑', '🐡', '🐠'],
      5:   ['🐟', '🦀', '🦞', '🐚'],
      1:   ['🦐', '🫧', '🐌']
    },
    dead: {
      100: { emoji: '🚢', name: 'Sunken Shipwreck' },
      15:  { emoji: '⚓', name: 'Rusted Anchor' },
      10:  { emoji: '🐟', name: 'Fish Skeleton' },
      5:   { emoji: '🪸', name: 'Bleached Coral' },
      1:   { emoji: '🫧', name: 'Popped Bubble' }
    },
    labels: {
      100: 'Colossal Whale (100d)',
      15:  'Playful Dolphin & Shark (15d)',
      10:  'Sea Turtle & Octopus (10d)',
      5:   'Tropical Reef Fish (5d)',
      1:   'Tiny Sea Shrimp (1d)'
    }
  },

  candy: {
    id: 'candy',
    name: 'Candy Land',
    subtext: 'Cupcakes, donuts, chocolate & dessert palace',
    icon: '🍭',
    themeClass: 'theme-candy',
    tiers: {
      100: ['🏰', '🍬', '🍫', '👑'],
      15:  ['🎂', '🍨', '🍧', '🧁'],
      10:  ['🍩', '🧁', '🥞', '🧇'],
      5:   ['🍫', '🍬', '🍪', '🍮'],
      1:   ['🍭']
    },
    dead: {
      100: { emoji: '📦', name: 'Abandoned Moldy Box' },
      15:  { emoji: '🦷', name: 'Cavity Tooth' },
      10:  { emoji: '🧻', name: 'Empty Wrapper' },
      5:   { emoji: '🍪', name: 'Stale Cookie Crumb' },
      1:   { emoji: '🐜', name: 'Fallen Sugar Candy' }
    },
    labels: {
      100: 'Candy Castle (100d)',
      15:  'Royal Birthday Cake (15d)',
      10:  'Glazed Donut & Cupcake (10d)',
      5:   'Chocolate Bar (5d)',
      1:   'Lollipop Sprout (1d)'
    }
  },

  custom: {
    id: 'custom',
    name: 'Custom Icon Theme',
    subtext: 'Your personalized icon universe',
    icon: '⭐',
    themeClass: 'theme-custom',
    tiers: {
      100: ['👑', '🌟', '💎'],
      15:  ['🏆', '🥇', '✨'],
      10:  ['🎖️', '🔥', '🚀'],
      5:   ['🎯', '⚡', '💫'],
      1:   ['⭐']
    },
    dead: {
      100: { emoji: '👻', name: 'Lost Spirit' },
      15:  { emoji: '☠️', name: 'Skull' },
      10:  { emoji: '🪨', name: 'Cold Stone' },
      5:   { emoji: '🍂', name: 'Withered Leaf' },
      1:   { emoji: '🌾', name: 'Dry Straw' }
    },
    labels: {
      100: 'Legendary Tier (100d)',
      15:  'Champion Tier (15d)',
      10:  'Star Tier (10d)',
      5:   'Progress Tier (5d)',
      1:   'First Step (1d)'
    }
  }
};

// ==========================================================================
// 3. CORE STREAK ENGINE
// ==========================================================================
class StreakEngine {
  static TIERS = [100, 15, 10, 5];

  static formatDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static parseDate(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  static diffDays(d1, d2) {
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
  }

  static getHashEmoji(pool, seedStr) {
    if (!pool || pool.length === 0) return '⭐';
    let hash = 0;
    for (let k = 0; k < seedStr.length; k++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(k);
      hash |= 0;
    }
    return pool[Math.abs(hash) % pool.length];
  }

  /** Rule 1 & 2: Record check-in with idempotency + 1-day grace period */
  static recordDailyCompletion(goal, today = new Date()) {
    const todayStr = this.formatDate(today);

    // Rule 1: Idempotency — same day, do nothing
    if (goal.streak && goal.streak.last_completed_date === todayStr) {
      return { isNewDay: false, graceApplied: false };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(dayBefore.getDate() - 2);

    let nextStreak = goal.streak ? goal.streak.current_streak : 0;
    let graceApplied = false;
    const last = goal.streak ? goal.streak.last_completed_date : null;

    if (last === this.formatDate(yesterday)) {
      nextStreak += 1;
    } else if (last === this.formatDate(dayBefore)) {
      // Rule 2: missed exactly 1 day → Grace Period
      nextStreak += 1;
      graceApplied = true;
    } else {
      nextStreak = 1;
    }

    const longest = Math.max(goal.streak ? (goal.streak.longest_streak || 0) : 0, nextStreak);
    goal.streak = { current_streak: nextStreak, longest_streak: longest, last_completed_date: todayStr };

    const dateSet = new Set(goal.streak_dates || []);
    dateSet.add(todayStr);
    goal.streak_dates = Array.from(dateSet).sort();

    return { isNewDay: true, graceApplied };
  }

  /** Rule 3: Passive expiration on app open */
  static checkPassiveExpiration(goal, today = new Date()) {
    if (!goal.streak || !goal.streak.last_completed_date) return;
    const lastDate = this.parseDate(goal.streak.last_completed_date);
    if (!lastDate) return;
    const diff = this.diffDays(lastDate, today);
    if (diff > 2 && goal.streak.current_streak > 0) {
      goal.streak.current_streak = 0;
    }
  }

  /** Section 4: Self-healing engine — recalculate streak from audit trail */
  static recalculateStreakFromDates(streakDates, today = new Date()) {
    if (!streakDates || streakDates.length === 0) {
      return { current_streak: 0, longest_streak: 0, last_completed_date: '' };
    }

    const sorted = Array.from(new Set(streakDates)).sort();
    let calculatedStreak = 1;
    let maxStreak = 1;

    for (let i = 1; i < sorted.length; i++) {
      const prev = this.parseDate(sorted[i - 1]);
      const curr = this.parseDate(sorted[i]);
      const diff = this.diffDays(prev, curr);
      if (diff === 1 || diff === 2) {
        calculatedStreak++;
      } else {
        calculatedStreak = 1;
      }
      maxStreak = Math.max(maxStreak, calculatedStreak);
    }

    const lastCompleted = sorted[sorted.length - 1];
    const lastDate = this.parseDate(lastCompleted);
    const diffFromToday = this.diffDays(lastDate, today);
    const activeStreak = diffFromToday > 2 ? 0 : calculatedStreak;

    return { current_streak: activeStreak, longest_streak: maxStreak, last_completed_date: lastCompleted };
  }

  /** Section 6: Greedy tier decomposition for World Grid */
  static generateWorldItems(streakDates, themeKey = 'garden', customEmoji = '') {
    if (!streakDates || streakDates.length === 0) return [];
    const sorted = Array.from(new Set(streakDates)).sort();
    const config = THEME_CONFIGS[themeKey] || THEME_CONFIGS.garden;
    const items = [];
    let runStart = 0;

    for (let i = 1; i <= sorted.length; i++) {
      const isLast = (i === sorted.length);
      let gapDays = 0;

      if (!isLast) {
        const prev = this.parseDate(sorted[i - 1]);
        const curr = this.parseDate(sorted[i]);
        gapDays = this.diffDays(prev, curr) - 1;
      }

      if (gapDays > 0 || isLast) {
        const runDates = sorted.slice(runStart, i);
        let remaining = runDates.length;
        let idx = 0;

        for (const tier of this.TIERS) {
          const count = Math.floor(remaining / tier);
          for (let c = 0; c < count; c++) {
            const repDate = runDates[Math.min(idx + tier - 1, runDates.length - 1)];
            const pool = config.tiers[tier];
            let emoji = pool ? this.getHashEmoji(pool, repDate) : '⭐';
            if (themeKey === 'custom' && customEmoji && tier === 1) emoji = customEmoji;
            items.push({ type: 'healthy', tier, emoji, label: `${tier}d`, date: repDate, title: config.labels[tier] || `${tier} Days Streak` });
            idx += tier;
          }
          remaining %= tier;
        }

        for (let r = 0; r < remaining; r++) {
          const singleDate = runDates[idx + r];
          const pool = config.tiers[1];
          let emoji = pool ? this.getHashEmoji(pool, singleDate) : '🌱';
          if (themeKey === 'custom' && customEmoji) emoji = customEmoji;
          items.push({ type: 'healthy', tier: 1, emoji, label: '1d', date: singleDate, title: config.labels[1] || '1 Day Completed' });
        }

        if (gapDays > 0) {
          let deadTier = 1;
          if (gapDays >= 100) deadTier = 100;
          else if (gapDays >= 15) deadTier = 15;
          else if (gapDays >= 10) deadTier = 10;
          else if (gapDays >= 5) deadTier = 5;
          const deadInfo = config.dead[deadTier] || { emoji: '🌾', name: 'Dry Straw' };
          const fromDate = runDates[runDates.length - 1];
          const toDate = sorted[i];
          items.push({ type: 'dead', tier: deadTier, emoji: deadInfo.emoji, label: `${gapDays}m`, gapDays, title: `Missed ${gapDays} days (${deadInfo.name})`, dateDesc: `From ${fromDate} to ${toDate}` });
          runStart = i;
        }
      }
    }

    return items;
  }
}

// ==========================================================================
// 4. STORAGE & SILENT FIREBASE REST SYNC (Union Merge Strategy)
// ==========================================================================
class AppStorage {
  static STORAGE_KEY = 'streak_universe_goals';
  static FIREBASE_CONFIG_KEY = 'streak_universe_firebase_config';

  static getGoals() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveGoals(goals) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('localStorage save error:', e);
    }
  }

  static getFirebaseConfig() {
    const defaultCfg = {
      databaseUrl: 'https://streakapp-6eab3-default-rtdb.firebaseio.com',
      userSyncId: 'user_' + Math.random().toString(36).substring(2, 10)
    };
    try {
      const data = localStorage.getItem(this.FIREBASE_CONFIG_KEY);
      if (!data) {
        localStorage.setItem(this.FIREBASE_CONFIG_KEY, JSON.stringify(defaultCfg));
        return defaultCfg;
      }
      return { ...defaultCfg, ...JSON.parse(data) };
    } catch (e) {
      return defaultCfg;
    }
  }

  /**
   * Section 5: Union Merge Multi-Device Sync — runs silently, no UI feedback.
   * If Firebase is unavailable, localStorage is still 100% safe.
   */
  static async syncWithFirebase() {
    const cfg = this.getFirebaseConfig();
    if (!cfg.databaseUrl || !cfg.userSyncId) return { success: false };

    const cleanUrl = cfg.databaseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanUrl}/users/${encodeURIComponent(cfg.userSyncId)}/goals.json`;

    try {
      const fetchResp = await fetch(endpoint, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
      if (!fetchResp.ok) throw new Error(`HTTP ${fetchResp.status}`);

      const remoteData = await fetchResp.json();
      const localGoals = this.getGoals();

      let remoteGoals = [];
      if (remoteData) {
        remoteGoals = Array.isArray(remoteData) ? remoteData.filter(Boolean) : Object.values(remoteData);
      }

      const mergedMap = new Map();
      localGoals.forEach(g => mergedMap.set(g.id, { ...g }));
      remoteGoals.forEach(rGoal => {
        if (!rGoal || !rGoal.id) return;
        if (!mergedMap.has(rGoal.id)) {
          mergedMap.set(rGoal.id, rGoal);
        } else {
          const lGoal = mergedMap.get(rGoal.id);
          const combined = Array.from(new Set([...(lGoal.streak_dates || []), ...(rGoal.streak_dates || [])])).sort();
          mergedMap.set(rGoal.id, { ...rGoal, ...lGoal, streak: StreakEngine.recalculateStreakFromDates(combined), streak_dates: combined });
        }
      });

      const finalGoals = Array.from(mergedMap.values());
      this.saveGoals(finalGoals);

      await fetch(endpoint, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalGoals) });
      return { success: true, count: finalGoals.length };
    } catch (err) {
      // Silent fail — localStorage is always authoritative
      console.debug('Firebase sync skipped:', err.message);
      return { success: false, error: err.message };
    }
  }
}

// ==========================================================================
// 5. APPLICATION UI CONTROLLER
// ==========================================================================
class AppController {
  constructor() {
    this.goals = [];
    this.activeCategory = 'all';
    this.searchQuery = '';
    this.currentWorldGoalId = null;
    this.currentWorldItems = [];
    this.deferredPrompt = null;

    this.initElements();
    this.bindEvents();
    this.loadInitialData();
  }

  initElements() {
    // Header
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.themeToggleIcon = document.getElementById('themeToggleIcon');
    this.btnOpenCreateGoal = document.getElementById('btnOpenCreateGoal');

    // Stats
    this.statActiveStreaks = document.getElementById('statActiveStreaks');
    this.statBestStreak = document.getElementById('statBestStreak');
    this.statTotalDays = document.getElementById('statTotalDays');
    this.statTodayRate = document.getElementById('statTodayRate');

    // Goals list
    this.goalsContainer = document.getElementById('goalsContainer');
    this.emptyState = document.getElementById('emptyState');
    this.searchInput = document.getElementById('searchInput');
    this.categoryFilterContainer = document.getElementById('categoryFilterContainer');

    // Goal Form Modal
    this.goalModal = document.getElementById('goalModal');
    this.goalModalBox = document.getElementById('goalModalBox');
    this.goalModalTitle = document.getElementById('goalModalTitle');
    this.goalForm = document.getElementById('goalForm');
    this.btnCloseGoalModal = document.getElementById('btnCloseGoalModal');
    this.btnCancelGoalModal = document.getElementById('btnCancelGoalModal');

    this.formGoalId = document.getElementById('formGoalId');
    this.formGoalTitle = document.getElementById('formGoalTitle');
    this.formGoalCategory = document.getElementById('formGoalCategory');
    // formTargetMode is now a <select>, NOT radio buttons
    this.formTargetMode = document.getElementById('formTargetMode');
    this.customTargetInputContainer = document.getElementById('customTargetInputContainer');
    this.formDailyTarget = document.getElementById('formDailyTarget');
    this.formTargetStreak = document.getElementById('formTargetStreak');
    this.btnAutoDeadline = document.getElementById('btnAutoDeadline');
    this.formDeadline = document.getElementById('formDeadline');
    this.formCustomEmoji = document.getElementById('formCustomEmoji');
    this.customEmojiBox = document.getElementById('customEmojiBox');

    // World Modal
    this.worldModal = document.getElementById('worldModal');
    this.worldModalBox = document.getElementById('worldModalBox');
    this.worldHeaderBanner = document.getElementById('worldHeaderBanner');
    this.worldThemeIcon = document.getElementById('worldThemeIcon');
    this.worldGoalTitle = document.getElementById('worldGoalTitle');
    this.worldThemeSubtext = document.getElementById('worldThemeSubtext');
    this.worldCurrentStreak = document.getElementById('worldCurrentStreak');
    this.worldLongestStreak = document.getElementById('worldLongestStreak');
    this.worldSlotsGrid = document.getElementById('worldSlotsGrid');
    this.worldLegendContent = document.getElementById('worldLegendContent');
    this.slotDetailBox = document.getElementById('slotDetailBox');
    this.slotDetailEmoji = document.getElementById('slotDetailEmoji');
    this.slotDetailTitle = document.getElementById('slotDetailTitle');
    this.slotDetailDesc = document.getElementById('slotDetailDesc');
    this.btnCloseWorldModal = document.getElementById('btnCloseWorldModal');
    this.btnWorldDone = document.getElementById('btnWorldDone');
    this.btnSelfHealStreak = document.getElementById('btnSelfHealStreak');
    this.btnToggleAuditLog = document.getElementById('btnToggleAuditLog');
    this.auditLogDrawer = document.getElementById('auditLogDrawer');
    this.auditDatesList = document.getElementById('auditDatesList');
    this.auditTotalCount = document.getElementById('auditTotalCount');

    // PWA
    this.pwaInstallBanner = document.getElementById('pwaInstallBanner');
    this.btnPwaInstall = document.getElementById('btnPwaInstall');
    this.btnPwaDismiss = document.getElementById('btnPwaDismiss');
  }

  bindEvents() {
    // Theme toggle
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Goal modal open / close / submit
    this.btnOpenCreateGoal.addEventListener('click', () => this.openGoalModal());
    this.btnCloseGoalModal.addEventListener('click', () => this.closeGoalModal());
    this.btnCancelGoalModal.addEventListener('click', () => this.closeGoalModal());
    this.goalForm.addEventListener('submit', (e) => this.handleGoalFormSubmit(e));

    // Daily target <select> toggle (tick vs custom amount)
    this.formTargetMode.addEventListener('change', () => {
      if (this.formTargetMode.value === 'custom') {
        this.customTargetInputContainer.classList.remove('hidden');
        this.formDailyTarget.focus();
      } else {
        this.customTargetInputContainer.classList.add('hidden');
      }
    });

    // ⚡ Auto-calculate deadline from milestone
    this.btnAutoDeadline.addEventListener('click', () => {
      const days = parseInt(this.formTargetStreak.value, 10) || 30;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      this.formDeadline.value = StreakEngine.formatDate(targetDate);
      this.showToast(`⚡ Deadline set: ${this.formDeadline.value} (${days} days from today)`);
    });

    // Theme radio selectors (show/hide custom emoji box)
    document.querySelectorAll('input[name="goalTheme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.customEmojiBox.classList.remove('hidden');
        } else {
          this.customEmojiBox.classList.add('hidden');
        }
        // Update visual selected state
        this._updateThemeRadioStyles();
      });
    });

    // Theme radio visual selection (highlight selected tile)
    document.querySelectorAll('input[name="goalTheme"]').forEach(radio => {
      radio.addEventListener('change', () => this._updateThemeRadioStyles());
    });

    // Category filter pills
    this.categoryFilterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-pill');
      if (!btn) return;
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-indigo-600', 'text-white', 'active');
        p.classList.add('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'active');
      btn.classList.remove('bg-white', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      this.activeCategory = btn.dataset.cat;
      this.renderGoals();
    });

    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderGoals();
    });

    // World Modal close
    this.btnCloseWorldModal.addEventListener('click', () => this.closeWorldModal());
    this.btnWorldDone.addEventListener('click', () => this.closeWorldModal());

    // Audit Log toggle
    this.btnToggleAuditLog.addEventListener('click', () => {
      this.auditLogDrawer.classList.toggle('hidden');
    });

    // Self-Heal
    this.btnSelfHealStreak.addEventListener('click', () => this.handleSelfHealActiveGoal());

    // PWA Install
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      if (this.pwaInstallBanner) this.pwaInstallBanner.classList.remove('hidden');
    });

    if (this.btnPwaInstall) {
      this.btnPwaInstall.addEventListener('click', async () => {
        if (this.deferredPrompt) {
          this.deferredPrompt.prompt();
          const { outcome } = await this.deferredPrompt.userChoice;
          if (outcome === 'accepted') this.pwaInstallBanner.classList.add('hidden');
          this.deferredPrompt = null;
        }
      });
    }

    if (this.btnPwaDismiss) {
      this.btnPwaDismiss.addEventListener('click', () => {
        this.pwaInstallBanner.classList.add('hidden');
      });
    }
  }

  // =========================================================================
  // THEME MANAGEMENT (Light default)
  // =========================================================================
  applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      if (this.themeToggleIcon) this.themeToggleIcon.textContent = '🌙';
    } else {
      document.documentElement.classList.remove('dark');
      if (this.themeToggleIcon) this.themeToggleIcon.textContent = '☀️';
    }
    localStorage.setItem('streak_universe_theme', theme);
  }

  toggleTheme() {
    const isDark = document.documentElement.classList.contains('dark');
    this.applyTheme(isDark ? 'light' : 'dark');
  }

  // =========================================================================
  // INITIAL DATA LOAD
  // =========================================================================
  loadInitialData() {
    const savedTheme = localStorage.getItem('streak_universe_theme') || 'light';
    this.applyTheme(savedTheme);

    this.goals = AppStorage.getGoals();

    if (this.goals.length === 0) {
      this.goals = this.getDefaultGoals();
      AppStorage.saveGoals(this.goals);
    }

    // Passive expiration check on all goals
    const today = new Date();
    this.goals.forEach(goal => StreakEngine.checkPassiveExpiration(goal, today));
    AppStorage.saveGoals(this.goals);

    this.renderStats();
    this.renderGoals();

    // Silent background Firebase sync
    this.triggerCloudSync();
  }

  getDefaultGoals() {
    const today = new Date();
    const d1 = new Date(today); d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today); d2.setDate(d2.getDate() - 2);
    const d3 = new Date(today); d3.setDate(d3.getDate() - 3);

    return [
      {
        id: 'goal_deutsch_c1',
        title: 'German C1 & Vocabulary Practice',
        category: 'study',
        daily_target: '30 mins',
        deadline: '2026-12-31',
        target_streak: 100,
        theme: 'garden',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d3),
        streak: { current_streak: 3, longest_streak: 3, last_completed_date: StreakEngine.formatDate(d1) },
        streak_dates: [StreakEngine.formatDate(d3), StreakEngine.formatDate(d2), StreakEngine.formatDate(d1)]
      },
      {
        id: 'goal_running',
        title: 'Morning 3km Run & Fitness',
        category: 'health',
        daily_target: '',
        deadline: '',
        target_streak: 30,
        theme: 'zoo',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d2),
        streak: { current_streak: 2, longest_streak: 2, last_completed_date: StreakEngine.formatDate(d1) },
        streak_dates: [StreakEngine.formatDate(d2), StreakEngine.formatDate(d1)]
      },
      {
        id: 'goal_reading',
        title: 'Read Books & Mindful Reflection',
        category: 'mind',
        daily_target: '15 mins',
        deadline: '2026-11-30',
        target_streak: 60,
        theme: 'aquarium',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d1),
        streak: { current_streak: 1, longest_streak: 1, last_completed_date: StreakEngine.formatDate(d1) },
        streak_dates: [StreakEngine.formatDate(d1)]
      }
    ];
  }

  // =========================================================================
  // RENDER STATS
  // =========================================================================
  renderStats() {
    let activeStreaks = 0, bestStreak = 0, totalCompletions = 0, todayCount = 0;
    const todayStr = StreakEngine.formatDate(new Date());

    this.goals.forEach(g => {
      const curr = g.streak ? g.streak.current_streak : 0;
      const longest = g.streak ? g.streak.longest_streak : 0;
      if (curr > 0) activeStreaks++;
      if (longest > bestStreak) bestStreak = longest;
      if (g.streak_dates) totalCompletions += g.streak_dates.length;
      if (g.streak && g.streak.last_completed_date === todayStr) todayCount++;
    });

    this.statActiveStreaks.textContent = activeStreaks;
    this.statBestStreak.textContent = bestStreak;
    this.statTotalDays.textContent = totalCompletions;
    const rate = this.goals.length > 0 ? Math.round((todayCount / this.goals.length) * 100) : 0;
    this.statTodayRate.textContent = `${rate}%`;
  }

  // =========================================================================
  // RENDER GOAL CARDS
  // =========================================================================
  renderGoals() {
    const todayStr = StreakEngine.formatDate(new Date());
    let filtered = this.goals;

    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(g => g.category === this.activeCategory);
    }
    if (this.searchQuery) {
      filtered = filtered.filter(g => g.title.toLowerCase().includes(this.searchQuery));
    }

    if (filtered.length === 0) {
      this.goalsContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }
    this.emptyState.classList.add('hidden');

    const catMap = {
      study:   { label: 'Study',   color: 'bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30' },
      health:  { label: 'Health',  color: 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30' },
      work:    { label: 'Work',    color: 'bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30' },
      mind:    { label: 'Wellness',color: 'bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30' },
      finance: { label: 'Finance', color: 'bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-500/30' },
      other:   { label: 'Other',   color: 'bg-slate-100 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-500/30' }
    };

    this.goalsContainer.innerHTML = filtered.map(goal => {
      const isCompletedToday = goal.streak && goal.streak.last_completed_date === todayStr;
      const themeConfig = THEME_CONFIGS[goal.theme] || THEME_CONFIGS.garden;
      const displayIcon = (goal.theme === 'custom' && goal.custom_emoji) ? goal.custom_emoji : themeConfig.icon;
      const streakCount = goal.streak ? goal.streak.current_streak : 0;
      const longestCount = goal.streak ? goal.streak.longest_streak : 0;
      const cat = catMap[goal.category] || catMap.other;

      // Deadline badge
      let deadlineBadge = '';
      if (goal.deadline) {
        const diff = StreakEngine.diffDays(new Date(), StreakEngine.parseDate(goal.deadline));
        if (diff < 0) {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30 font-semibold">Overdue (${Math.abs(diff)}d)</span>`;
        } else if (diff === 0) {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 font-semibold">Due Today!</span>`;
        } else {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 font-semibold">${diff}d left</span>`;
        }
      }

      // Daily target
      const targetText = goal.daily_target
        ? `<strong>Daily:</strong> ${this.escapeHtml(goal.daily_target)}`
        : `<strong>Daily:</strong> Tick ✓`;

      // Milestone progress bar
      const targetStreak = goal.target_streak || 30;
      const progress = Math.min(100, Math.round((streakCount / targetStreak) * 100));

      return `
        <div class="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600/80 group">
          <!-- Top row -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm">${displayIcon}</span>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cat.color}">${cat.label}</span>
              ${deadlineBadge}
            </div>
            <div class="flex items-center gap-1">
              <button onclick="app.openEditGoal('${goal.id}')" title="Edit" class="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-xs transition">✏️</button>
              <button onclick="app.deleteGoal('${goal.id}')" title="Delete" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-xs transition">🗑️</button>
            </div>
          </div>

          <!-- Info -->
          <div class="my-3">
            <h3 class="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
              ${this.escapeHtml(goal.title)}
            </h3>
            <div class="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span>${targetText}</span>
            </div>
            <!-- Milestone progress -->
            <div class="mt-2">
              <div class="flex justify-between text-[10px] text-slate-400 mb-0.5">
                <span>Milestone: ${targetStreak}d</span>
                <span>${progress}%</span>
              </div>
              <div class="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all" style="width:${progress}%"></div>
              </div>
            </div>
          </div>

          <!-- Streak & actions -->
          <div class="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-slate-900 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-lg ${streakCount > 0 ? 'flame-glow' : 'opacity-60'}">🔥</div>
              <div>
                <div class="text-base font-black text-amber-500 leading-tight">${streakCount} <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">days</span></div>
                <div class="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Best: <strong class="text-rose-500">${longestCount}</strong></div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="app.openWorldModal('${goal.id}')" class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-sm">
                <span>${displayIcon}</span>
                <span class="hidden xs:inline">World</span>
              </button>
              <button onclick="app.toggleCheckIn('${goal.id}')" class="streak-check-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                isCompletedToday
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-amber-500/25 active:scale-95'
              }">
                ${isCompletedToday ? '<span>✓</span><span>Done</span>' : '<span>Check-in</span><span>🔥</span>'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // =========================================================================
  // CHECK-IN (RULE 1 & 2)
  // =========================================================================
  toggleCheckIn(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const result = StreakEngine.recordDailyCompletion(goal);

    if (result.isNewDay) {
      if (goal.streak.current_streak % 5 === 0) {
        SoundFX.playMilestone();
      } else {
        SoundFX.playSuccess();
      }

      if (typeof confetti === 'function') {
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981'] });
      }

      AppStorage.saveGoals(this.goals);
      this.renderStats();
      this.renderGoals();
      this.triggerCloudSync();

      if (result.graceApplied) {
        this.showToast('🛡️ Grace Period applied — streak protected!');
      }
    } else {
      SoundFX.playPop();
      this.showToast('Already checked-in today! ✨');
    }
  }

  // =========================================================================
  // GOAL CREATE / EDIT MODAL
  // =========================================================================
  openGoalModal(editingGoal = null) {
    this.goalForm.reset();
    this.customEmojiBox.classList.add('hidden');
    this.customTargetInputContainer.classList.add('hidden');

    if (editingGoal) {
      this.goalModalTitle.textContent = '✏️ Edit Goal';
      this.formGoalId.value = editingGoal.id;
      this.formGoalTitle.value = editingGoal.title;
      this.formGoalCategory.value = editingGoal.category || 'study';

      // Daily target: if non-empty → "custom", else "tick"
      if (editingGoal.daily_target && editingGoal.daily_target.trim()) {
        this.formTargetMode.value = 'custom';
        this.customTargetInputContainer.classList.remove('hidden');
        this.formDailyTarget.value = editingGoal.daily_target;
      } else {
        this.formTargetMode.value = 'tick';
      }

      this.formTargetStreak.value = editingGoal.target_streak || 30;
      this.formDeadline.value = editingGoal.deadline || '';

      // Theme radio
      const themeVal = editingGoal.theme || 'garden';
      const themeRadio = document.querySelector(`input[name="goalTheme"][value="${themeVal}"]`);
      if (themeRadio) themeRadio.checked = true;
      if (themeVal === 'custom') {
        this.customEmojiBox.classList.remove('hidden');
        this.formCustomEmoji.value = editingGoal.custom_emoji || '';
      }
    } else {
      this.goalModalTitle.textContent = '🎯 New Goal';
      this.formGoalId.value = '';
      this.formGoalCategory.value = 'study';
      this.formTargetMode.value = 'tick';
      this.formTargetStreak.value = '30';

      const defaultTheme = document.querySelector('input[name="goalTheme"][value="garden"]');
      if (defaultTheme) defaultTheme.checked = true;
    }

    this._updateThemeRadioStyles();
    this.goalModal.classList.remove('opacity-0', 'pointer-events-none');
    this.goalModalBox.classList.remove('translate-y-8');
  }

  closeGoalModal() {
    this.goalModal.classList.add('opacity-0', 'pointer-events-none');
    this.goalModalBox.classList.add('translate-y-8');
  }

  handleGoalFormSubmit(e) {
    e.preventDefault();
    const id = this.formGoalId.value.trim() || ('goal_' + Date.now());
    const title = this.formGoalTitle.value.trim();
    const category = this.formGoalCategory.value;

    // formTargetMode is a <select>
    const targetMode = this.formTargetMode.value;
    const daily_target = (targetMode === 'custom' && this.formDailyTarget.value.trim())
      ? this.formDailyTarget.value.trim()
      : '';

    const deadline = this.formDeadline.value;
    const target_streak = parseInt(this.formTargetStreak.value, 10) || 30;

    const selectedThemeEl = document.querySelector('input[name="goalTheme"]:checked');
    const theme = selectedThemeEl ? selectedThemeEl.value : 'garden';
    const custom_emoji = this.formCustomEmoji.value.trim();

    const existingIndex = this.goals.findIndex(g => g.id === id);
    if (existingIndex >= 0) {
      const old = this.goals[existingIndex];
      this.goals[existingIndex] = { ...old, title, category, daily_target, deadline, target_streak, theme, custom_emoji };
      this.showToast('Goal updated! ✅');
    } else {
      this.goals.unshift({
        id, title, category, daily_target, deadline, target_streak, theme, custom_emoji,
        created_at: StreakEngine.formatDate(new Date()),
        streak: { current_streak: 0, longest_streak: 0, last_completed_date: '' },
        streak_dates: []
      });
      this.showToast('New goal created! Tap Check-in to start 🔥');
    }

    AppStorage.saveGoals(this.goals);
    this.closeGoalModal();
    this.renderStats();
    this.renderGoals();
    this.triggerCloudSync();
  }

  openEditGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (goal) this.openGoalModal(goal);
  }

  deleteGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (confirm(`Delete "${goal.title}"? Streak history will be removed.`)) {
      this.goals = this.goals.filter(g => g.id !== goalId);
      AppStorage.saveGoals(this.goals);
      this.renderStats();
      this.renderGoals();
      this.triggerCloudSync();
      this.showToast('Goal deleted 🗑️');
    }
  }

  // =========================================================================
  // WORLD MODAL (GAMIFICATION)
  // =========================================================================
  openWorldModal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    this.currentWorldGoalId = goalId;

    const themeConfig = THEME_CONFIGS[goal.theme] || THEME_CONFIGS.garden;
    const displayIcon = (goal.theme === 'custom' && goal.custom_emoji) ? goal.custom_emoji : themeConfig.icon;

    this.worldHeaderBanner.className = `p-4 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between transition-colors duration-300 ${themeConfig.themeClass}`;
    this.worldThemeIcon.textContent = displayIcon;
    this.worldGoalTitle.textContent = goal.title;
    this.worldThemeSubtext.textContent = `${themeConfig.name} • ${themeConfig.subtext}`;

    const curr = goal.streak ? goal.streak.current_streak : 0;
    const longest = goal.streak ? goal.streak.longest_streak : 0;
    this.worldCurrentStreak.textContent = `${curr} days`;
    this.worldLongestStreak.textContent = `${longest} days`;

    const items = StreakEngine.generateWorldItems(goal.streak_dates || [], goal.theme, goal.custom_emoji);
    this.currentWorldItems = items;
    this.slotDetailBox.classList.add('hidden');
    this.auditLogDrawer.classList.add('hidden');

    if (items.length === 0) {
      this.worldSlotsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <div class="text-4xl mb-2">${displayIcon}</div>
          <p class="text-xs">No check-ins yet.</p>
          <p class="text-[11px] text-slate-500 mt-1">Tap "Check-in" to plant your first seed!</p>
        </div>
      `;
    } else {
      this.worldSlotsGrid.innerHTML = items.map((item, idx) => {
        const tierClass = item.type === 'healthy' ? `tier-${item.tier}` : '';
        const delay = Math.min(idx * 0.02, 0.6);
        return `
          <div class="world-slot ${item.type} ${tierClass} animate-pop-in" style="animation-delay:${delay}s" onclick="app.selectWorldSlot(${idx})">
            <span class="text-2xl sm:text-3xl filter select-none">${item.emoji}</span>
            <span class="slot-badge">${item.label}</span>
          </div>
        `;
      }).join('');
    }

    this.populateLegend(themeConfig, goal.custom_emoji);

    const dates = (goal.streak_dates || []).slice().reverse();
    this.auditTotalCount.textContent = `${dates.length} days`;
    this.auditDatesList.innerHTML = dates.length > 0
      ? dates.map(d => `<div class="py-1 border-b border-slate-100 dark:border-slate-800 flex justify-between"><span>${d}</span><span class="text-emerald-600 dark:text-emerald-400 font-semibold">✓</span></div>`).join('')
      : '<div class="text-slate-400">No check-ins recorded yet</div>';

    this.worldModal.classList.remove('opacity-0', 'pointer-events-none');
    this.worldModalBox.classList.remove('translate-y-8');
  }

  selectWorldSlot(index) {
    if (!this.currentWorldItems || !this.currentWorldItems[index]) return;
    const item = this.currentWorldItems[index];
    SoundFX.playPop();
    this.slotDetailBox.classList.remove('hidden');
    this.slotDetailEmoji.textContent = item.emoji;
    this.slotDetailTitle.textContent = item.title;
    this.slotDetailDesc.textContent = item.type === 'healthy'
      ? `Completed on ${item.date} (${item.label})`
      : `${item.dateDesc} — Interrupted for ${item.gapDays} days`;
  }

  populateLegend(themeConfig, customEmoji) {
    const tiers = [100, 15, 10, 5, 1];
    this.worldLegendContent.innerHTML = tiers.map(t => {
      const pool = themeConfig.tiers[t];
      let rep = pool ? pool[0] : '⭐';
      if (customEmoji && t === 1) rep = customEmoji;
      const deadInfo = themeConfig.dead[t] || { emoji: '🌾' };
      return `
        <div class="p-2 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center shadow-sm">
          <div class="flex items-center gap-1.5 text-base sm:text-lg mb-1">
            <span>${rep}</span>
            <span class="text-[10px] text-slate-400">/</span>
            <span class="opacity-70">${deadInfo.emoji}</span>
          </div>
          <span class="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase">${t}d</span>
          <span class="text-[9px] text-slate-500 dark:text-slate-400 truncate max-w-full">${themeConfig.labels[t]}</span>
        </div>
      `;
    }).join('');
  }

  closeWorldModal() {
    this.worldModal.classList.add('opacity-0', 'pointer-events-none');
    this.worldModalBox.classList.add('translate-y-8');
    this.currentWorldGoalId = null;
  }

  handleSelfHealActiveGoal() {
    if (!this.currentWorldGoalId) return;
    const goal = this.goals.find(g => g.id === this.currentWorldGoalId);
    if (!goal) return;
    const healed = StreakEngine.recalculateStreakFromDates(goal.streak_dates || []);
    goal.streak = healed;
    AppStorage.saveGoals(this.goals);
    this.openWorldModal(this.currentWorldGoalId);
    this.renderStats();
    this.renderGoals();
    this.showToast('✨ Streak self-healed from audit log!');
  }

  // =========================================================================
  // SILENT CLOUD SYNC (no UI feedback)
  // =========================================================================
  async triggerCloudSync() {
    const result = await AppStorage.syncWithFirebase();
    if (result.success) {
      // Reload goals in case remote merge brought new data
      this.goals = AppStorage.getGoals();
      this.renderStats();
      this.renderGoals();
    }
    // Fail silently — localStorage is always the source of truth
  }

  // =========================================================================
  // UTILITIES
  // =========================================================================
  _updateThemeRadioStyles() {
    document.querySelectorAll('.theme-choice').forEach(label => {
      const radio = label.querySelector('input[type="radio"]');
      if (radio && radio.checked) {
        label.classList.add('ring-2', 'ring-indigo-500', 'border-indigo-500');
      } else {
        label.classList.remove('ring-2', 'ring-indigo-500', 'border-indigo-500');
      }
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  showToast(message) {
    const existing = document.getElementById('appToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'appToast';
    toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 glass-card px-4 py-2.5 rounded-2xl border border-indigo-500/60 text-xs font-semibold text-slate-900 dark:text-white shadow-2xl flex items-center gap-2';
    toast.innerHTML = `<span>🔔</span><span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s ease';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 3200);
  }
}

// ==========================================================================
// 6. SERVICE WORKER REGISTRATION (OFFLINE-FIRST PWA)
// ==========================================================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.debug('SW register:', err);
    });
  });
}

// Bootstrap
let app = null;
window.addEventListener('DOMContentLoaded', () => {
  app = new AppController();
  window.app = app;
});
