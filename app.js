/**
 * STREAK UNIVERSE - HABIT & WORLD TRACKER
 * Architecture based on Deutsch C1 Technical Specification
 * Features:
 * - Multi-Goal / Multi-Habit System (English UI)
 * - Daily Target Modes: "Just Tick (✓)" vs "Specific Quantity"
 * - Linked Milestone Target & Target Deadline Date with Auto-Calculation
 * - Idempotency & 1-Day Automatic Grace Period
 * - Self-Healing Engine from Audit Log (streak_dates)
 * - Offline-First with Union Merge Firebase RTDB Sync
 * - 4 Handpicked Themes (Garden, Zoo, Aquarium, Candy) + Custom Emoji
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

  // Play pleasant check-in chime
  static playSuccess() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const now = SoundFX.ctx.currentTime;
    const osc = SoundFX.ctx.createOscillator();
    const gain = SoundFX.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.08); // E5
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.16); // G5
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.28); // C6

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(SoundFX.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);
  }

  // Play celebration fanfare for milestones
  static playMilestone() {
    SoundFX.init();
    if (!SoundFX.ctx) return;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
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

  // Play gentle pop sound
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
// 3. CORE STREAK ENGINE (TECHNICAL SPEC IMPLEMENTATION)
// ==========================================================================
class StreakEngine {
  static TIERS = [100, 15, 10, 5];

  /**
   * Format date into local YYYY-MM-DD
   */
  static formatDate(d = new Date()) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Parse YYYY-MM-DD safely into Date
   */
  static parseDate(str) {
    if (!str) return null;
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  /**
   * Compute difference in calendar days between two dates
   */
  static diffDays(d1, d2) {
    const date1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
    const date2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
    return Math.round((date2 - date1) / (1000 * 60 * 60 * 24));
  }

  /**
   * Hash string into integer for stable emoji lookup
   */
  static getHashEmoji(pool, seedStr) {
    if (!pool || pool.length === 0) return '⭐';
    let hash = 0;
    for (let k = 0; k < seedStr.length; k++) {
      hash = (hash << 5) - hash + seedStr.charCodeAt(k);
      hash |= 0;
    }
    return pool[Math.abs(hash) % pool.length];
  }

  /**
   * Rule 1, 2: Record Daily Completion (Idempotency & 1-Day Grace Period)
   */
  static recordDailyCompletion(goal, today = new Date()) {
    const todayStr = this.formatDate(today);

    // Rule 1: Idempotency
    if (goal.streak && goal.streak.last_completed_date === todayStr) {
      return { isNewDay: false, graceApplied: false };
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = this.formatDate(yesterday);

    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    const dayBeforeYesterdayStr = this.formatDate(dayBeforeYesterday);

    let nextStreak = goal.streak ? goal.streak.current_streak : 0;
    let graceApplied = false;

    if (goal.streak && goal.streak.last_completed_date === yesterdayStr) {
      // Completed yesterday -> standard consecutive increment
      nextStreak += 1;
    } else if (goal.streak && goal.streak.last_completed_date === dayBeforeYesterdayStr) {
      // Missed yesterday, but completed day before -> Grace Period forgiven!
      nextStreak += 1;
      graceApplied = true;
    } else {
      // Missed 2+ days or new streak
      nextStreak = 1;
    }

    const longest = Math.max(goal.streak ? (goal.streak.longest_streak || 0) : 0, nextStreak);

    // Update streak state snapshot
    goal.streak = {
      current_streak: nextStreak,
      longest_streak: longest,
      last_completed_date: todayStr
    };

    // Update audit log
    const dateSet = new Set(goal.streak_dates || []);
    dateSet.add(todayStr);
    goal.streak_dates = Array.from(dateSet).sort();

    return { isNewDay: true, graceApplied };
  }

  /**
   * Rule 3: Passive Expiration when loading/opening app
   */
  static checkPassiveExpiration(goal, today = new Date()) {
    if (!goal.streak || !goal.streak.last_completed_date) return;
    const lastDate = this.parseDate(goal.streak.last_completed_date);
    if (!lastDate) return;

    const diff = this.diffDays(lastDate, today);
    // If more than 2 days have passed without check-in, current active streak drops to 0
    if (diff > 2 && goal.streak.current_streak > 0) {
      goal.streak.current_streak = 0;
    }
  }

  /**
   * Section 4: Self-Healing Engine (Recalculate streak from audit trail)
   */
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

      if (diff === 1) {
        calculatedStreak++;
      } else if (diff === 2) {
        // 1-Day Grace Period
        calculatedStreak++;
      } else {
        calculatedStreak = 1;
      }
      maxStreak = Math.max(maxStreak, calculatedStreak);
    }

    const lastCompleted = sorted[sorted.length - 1];
    const lastDate = this.parseDate(lastCompleted);
    const diffFromToday = this.diffDays(lastDate, today);

    let activeStreak = calculatedStreak;
    if (diffFromToday > 2) {
      // Has expired passively
      activeStreak = 0;
    }

    return {
      current_streak: activeStreak,
      longest_streak: maxStreak,
      last_completed_date: lastCompleted
    };
  }

  /**
   * Section 6: Greedy Tier Decomposition for World Grid
   */
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

        // Compress run into tiers
        for (const tier of this.TIERS) {
          const count = Math.floor(remaining / tier);
          for (let c = 0; c < count; c++) {
            const repDate = runDates[Math.min(idx + tier - 1, runDates.length - 1)];
            const pool = config.tiers[tier];
            let emoji = pool ? this.getHashEmoji(pool, repDate) : '⭐';
            if (themeKey === 'custom' && customEmoji && tier === 1) {
              emoji = customEmoji;
            }

            items.push({
              type: 'healthy',
              tier,
              emoji,
              label: `${tier}d`,
              date: repDate,
              title: config.labels[tier] || `${tier} Days Streak`
            });
            idx += tier;
          }
          remaining %= tier;
        }

        // Remaining 1-day items
        for (let r = 0; r < remaining; r++) {
          const singleDate = runDates[idx + r];
          const pool = config.tiers[1];
          let emoji = pool ? this.getHashEmoji(pool, singleDate) : '🌱';
          if (themeKey === 'custom' && customEmoji) {
            emoji = customEmoji;
          }

          items.push({
            type: 'healthy',
            tier: 1,
            emoji,
            label: '1d',
            date: singleDate,
            title: config.labels[1] || '1 Day Completed'
          });
        }

        // Add Dead Slot if gap occurred
        if (gapDays > 0) {
          let deadTier = 1;
          if (gapDays >= 100) deadTier = 100;
          else if (gapDays >= 15) deadTier = 15;
          else if (gapDays >= 10) deadTier = 10;
          else if (gapDays >= 5) deadTier = 5;

          const deadInfo = config.dead[deadTier] || { emoji: '🌾', name: 'Dry Straw' };
          const fromDate = runDates[runDates.length - 1];
          const toDate = sorted[i];

          items.push({
            type: 'dead',
            tier: deadTier,
            emoji: deadInfo.emoji,
            label: `${gapDays}m`,
            gapDays,
            title: `Missed ${gapDays} days (${deadInfo.name})`,
            dateDesc: `From ${fromDate} to ${toDate}`
          });
          runStart = i;
        }
      }
    }

    return items;
  }
}

// ==========================================================================
// 4. STORAGE & FIREBASE REST SYNC ENGINE (Union Merge Strategy)
// ==========================================================================
class AppStorage {
  static STORAGE_KEY = 'streak_universe_goals';
  static FIREBASE_CONFIG_KEY = 'streak_universe_firebase_config';

  static getGoals() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch (e) {
      console.error('Error reading localStorage:', e);
      return [];
    }
  }

  static saveGoals(goals) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving localStorage:', e);
    }
  }

  static getFirebaseConfig() {
    const defaultConfig = {
      projectId: 'streakapp-6eab3',
      databaseUrl: 'https://streakapp-6eab3-default-rtdb.firebaseio.com',
      userSyncId: 'user_' + Math.random().toString(36).substring(2, 10)
    };

    try {
      const data = localStorage.getItem(this.FIREBASE_CONFIG_KEY);
      if (!data) {
        localStorage.setItem(this.FIREBASE_CONFIG_KEY, JSON.stringify(defaultConfig));
        return defaultConfig;
      }
      return { ...defaultConfig, ...JSON.parse(data) };
    } catch (e) {
      return defaultConfig;
    }
  }

  static saveFirebaseConfig(cfg) {
    localStorage.setItem(this.FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
  }

  /**
   * Section 5: Union Merge Multi-Device Synchronization
   */
  static async syncWithFirebase(showNotifications = false) {
    const cfg = this.getFirebaseConfig();
    if (!cfg.databaseUrl || !cfg.userSyncId) {
      return { success: false, message: 'Missing Firebase Database URL or User Sync ID' };
    }

    const cleanDbUrl = cfg.databaseUrl.replace(/\/+$/, '');
    const endpoint = `${cleanDbUrl}/users/${encodeURIComponent(cfg.userSyncId)}/goals.json`;

    try {
      // 1. Fetch remote snapshot
      const fetchResp = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!fetchResp.ok) {
        throw new Error(`Firebase RTDB HTTP ${fetchResp.status}: ${fetchResp.statusText}`);
      }

      const remoteData = await fetchResp.json();
      const localGoals = this.getGoals();

      // Convert remote dictionary or array into standard array
      let remoteGoals = [];
      if (remoteData) {
        if (Array.isArray(remoteData)) {
          remoteGoals = remoteData.filter(Boolean);
        } else if (typeof remoteData === 'object') {
          remoteGoals = Object.values(remoteData);
        }
      }

      // 2. Perform Union Merge per Goal
      const mergedMap = new Map();

      // Put all local goals first
      localGoals.forEach(g => mergedMap.set(g.id, { ...g }));

      // Merge remote goals with union set on streak_dates
      remoteGoals.forEach(rGoal => {
        if (!rGoal || !rGoal.id) return;

        if (!mergedMap.has(rGoal.id)) {
          // New goal from another device
          mergedMap.set(rGoal.id, rGoal);
        } else {
          // Both devices have this goal -> Union Merge history!
          const lGoal = mergedMap.get(rGoal.id);
          const combinedDates = Array.from(new Set([...(lGoal.streak_dates || []), ...(rGoal.streak_dates || [])])).sort();

          // Recalculate streak using Self-Healing algorithm on merged dates
          const healed = StreakEngine.recalculateStreakFromDates(combinedDates);

          mergedMap.set(rGoal.id, {
            ...rGoal,
            ...lGoal, // keep latest local fields
            streak: healed,
            streak_dates: combinedDates
          });
        }
      });

      const finalGoals = Array.from(mergedMap.values());

      // 3. Save merged result to LocalStorage
      this.saveGoals(finalGoals);

      // 4. Push merged result back to Firebase
      const pushResp = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalGoals)
      });

      if (!pushResp.ok) {
        throw new Error(`Failed to update Remote: ${pushResp.status}`);
      }

      return { success: true, count: finalGoals.length };
    } catch (err) {
      console.warn('Firebase Sync Notice:', err.message);
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

    this.initElements();
    this.bindEvents();
    this.loadInitialData();
  }

  initElements() {
    // Header & Stats
    this.btnOpenCreateGoal = document.getElementById('btnOpenCreateGoal');
    this.btnOpenFirebaseModal = document.getElementById('btnOpenFirebaseModal');
    this.syncStatusDot = document.getElementById('syncStatusDot');
    this.syncStatusText = document.getElementById('syncStatusText');

    this.statActiveStreaks = document.getElementById('statActiveStreaks');
    this.statBestStreak = document.getElementById('statBestStreak');
    this.statTotalDays = document.getElementById('statTotalDays');
    this.statTodayRate = document.getElementById('statTodayRate');

    // Goals container
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
    this.formGoalContent = document.getElementById('formGoalContent');
    this.formGoalCategory = document.getElementById('formGoalCategory');
    this.formDailyTarget = document.getElementById('formDailyTarget');
    this.customTargetInputContainer = document.getElementById('customTargetInputContainer');
    this.formCadence = document.getElementById('formCadence');
    this.formDeadline = document.getElementById('formDeadline');
    this.formTargetStreak = document.getElementById('formTargetStreak');
    this.btnAutoCalculateDeadline = document.getElementById('btnAutoCalculateDeadline');
    this.formReminderTime = document.getElementById('formReminderTime');
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
    this.worldGraceStatus = document.getElementById('worldGraceStatus');
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

    // Firebase Modal
    this.firebaseModal = document.getElementById('firebaseModal');
    this.firebaseModalBox = document.getElementById('firebaseModalBox');
    this.btnCloseFirebaseModal = document.getElementById('btnCloseFirebaseModal');
    this.cfgFirebaseProjectId = document.getElementById('cfgFirebaseProjectId');
    this.cfgFirebaseDatabaseUrl = document.getElementById('cfgFirebaseDatabaseUrl');
    this.cfgUserSyncId = document.getElementById('cfgUserSyncId');
    this.btnGenerateNewSyncId = document.getElementById('btnGenerateNewSyncId');
    this.btnTestFirebaseConn = document.getElementById('btnTestFirebaseConn');
    this.btnForceSyncCloud = document.getElementById('btnForceSyncCloud');
    this.btnSaveFirebaseConfig = document.getElementById('btnSaveFirebaseConfig');
    this.firebaseStatusBadge = document.getElementById('firebaseStatusBadge');
    this.btnExportJson = document.getElementById('btnExportJson');
    this.importJsonInput = document.getElementById('importJsonInput');

    // PWA Install prompt
    this.pwaInstallBanner = document.getElementById('pwaInstallBanner');
    this.btnPwaInstall = document.getElementById('btnPwaInstall');
    this.btnPwaDismiss = document.getElementById('btnPwaDismiss');
    this.deferredPrompt = null;
  }

  bindEvents() {
    // Open Create Goal Modal
    this.btnOpenCreateGoal.addEventListener('click', () => this.openGoalModal());
    this.btnCloseGoalModal.addEventListener('click', () => this.closeGoalModal());
    this.btnCancelGoalModal.addEventListener('click', () => this.closeGoalModal());
    this.goalForm.addEventListener('submit', (e) => this.handleGoalFormSubmit(e));

    // Target mode toggle (tick vs custom amount)
    document.querySelectorAll('input[name="targetMode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.customTargetInputContainer.classList.remove('hidden');
          this.formDailyTarget.focus();
        } else {
          this.customTargetInputContainer.classList.add('hidden');
        }
      });
    });

    // Auto-calculate Target Deadline from Milestone
    this.btnAutoCalculateDeadline.addEventListener('click', () => {
      const days = parseInt(this.formTargetStreak.value, 10) || 30;
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      this.formDeadline.value = StreakEngine.formatDate(targetDate);
      this.showToast(`⚡ Deadline set to ${this.formDeadline.value} (${days} days from today)`);
    });

    // Theme selector radios
    document.querySelectorAll('input[name="goalTheme"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
          this.customEmojiBox.classList.remove('hidden');
        } else {
          this.customEmojiBox.classList.add('hidden');
        }
      });
    });

    // Category filter pills
    this.categoryFilterContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-pill');
      if (!btn) return;
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'active');
        p.classList.add('bg-slate-800', 'text-slate-300');
      });
      btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'active');
      btn.classList.remove('bg-slate-800', 'text-slate-300');
      this.activeCategory = btn.dataset.cat;
      this.renderGoals();
    });

    // Search
    this.searchInput.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.toLowerCase().trim();
      this.renderGoals();
    });

    // World Modal Close
    this.btnCloseWorldModal.addEventListener('click', () => this.closeWorldModal());
    this.btnWorldDone.addEventListener('click', () => this.closeWorldModal());

    // Toggle Audit Log in World
    this.btnToggleAuditLog.addEventListener('click', () => {
      this.auditLogDrawer.classList.toggle('hidden');
    });

    // Self Heal
    this.btnSelfHealStreak.addEventListener('click', () => this.handleSelfHealActiveGoal());

    // Firebase Modal
    this.btnOpenFirebaseModal.addEventListener('click', () => this.openFirebaseModal());
    this.btnCloseFirebaseModal.addEventListener('click', () => this.closeFirebaseModal());
    this.btnSaveFirebaseConfig.addEventListener('click', () => this.saveFirebaseConfigHandler());
    this.btnGenerateNewSyncId.addEventListener('click', () => {
      this.cfgUserSyncId.value = 'user_' + Math.random().toString(36).substring(2, 10);
    });
    this.btnTestFirebaseConn.addEventListener('click', () => this.testFirebaseConnection());
    this.btnForceSyncCloud.addEventListener('click', () => this.triggerCloudSync(true));

    // Export / Import
    this.btnExportJson.addEventListener('click', () => this.exportJsonBackup());
    this.importJsonInput.addEventListener('change', (e) => this.importJsonBackup(e));

    // PWA Install Event Listener
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
          if (outcome === 'accepted') {
            this.pwaInstallBanner.classList.add('hidden');
          }
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

  loadInitialData() {
    this.goals = AppStorage.getGoals();

    // If completely new user, generate default goals
    if (this.goals.length === 0) {
      this.goals = this.getDefaultGoals();
      AppStorage.saveGoals(this.goals);
    }

    // Apply passive expiration to all goals
    const today = new Date();
    this.goals.forEach(goal => {
      StreakEngine.checkPassiveExpiration(goal, today);
    });
    AppStorage.saveGoals(this.goals);

    this.renderStats();
    this.renderGoals();

    // Trigger background sync with Firebase
    this.triggerCloudSync(false);
  }

  getDefaultGoals() {
    const today = new Date();
    const d1 = new Date(today);
    d1.setDate(d1.getDate() - 1);
    const d2 = new Date(today);
    d2.setDate(d2.getDate() - 2);
    const d3 = new Date(today);
    d3.setDate(d3.getDate() - 3);

    return [
      {
        id: 'goal_deutsch_c1',
        title: 'German C1 & Vocabulary Practice',
        content: 'Complete at least 1 grammar drill and read German articles daily.',
        category: 'study',
        daily_target: '30 mins',
        cadence: 'daily',
        deadline: '2026-12-31',
        target_streak: 100,
        reminder_time: '20:30',
        theme: 'garden',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d3),
        streak: {
          current_streak: 3,
          longest_streak: 3,
          last_completed_date: StreakEngine.formatDate(d1)
        },
        streak_dates: [StreakEngine.formatDate(d3), StreakEngine.formatDate(d2), StreakEngine.formatDate(d1)]
      },
      {
        id: 'goal_running',
        title: 'Morning 3km Run & Fitness',
        content: 'Cardio workout and light stretching to build core physical endurance.',
        category: 'health',
        daily_target: 'Just tick ✓',
        cadence: 'daily',
        deadline: '',
        target_streak: 30,
        reminder_time: '06:30',
        theme: 'zoo',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d2),
        streak: {
          current_streak: 2,
          longest_streak: 2,
          last_completed_date: StreakEngine.formatDate(d1)
        },
        streak_dates: [StreakEngine.formatDate(d2), StreakEngine.formatDate(d1)]
      },
      {
        id: 'goal_reading',
        title: 'Read Books & Mindful Reflection',
        content: 'Read insightful non-fiction chapters before going to sleep.',
        category: 'mind',
        daily_target: '15 mins',
        cadence: 'daily',
        deadline: '2026-11-30',
        target_streak: 60,
        reminder_time: '22:00',
        theme: 'aquarium',
        custom_emoji: '',
        created_at: StreakEngine.formatDate(d1),
        streak: {
          current_streak: 1,
          longest_streak: 1,
          last_completed_date: StreakEngine.formatDate(d1)
        },
        streak_dates: [StreakEngine.formatDate(d1)]
      }
    ];
  }

  // ========================================================================
  // RENDER STATS & DASHBOARD
  // ========================================================================
  renderStats() {
    let activeStreaks = 0;
    let bestStreak = 0;
    let totalCompletions = 0;
    let todayCompletedCount = 0;
    const todayStr = StreakEngine.formatDate(new Date());

    this.goals.forEach(g => {
      const curr = g.streak ? g.streak.current_streak : 0;
      const longest = g.streak ? g.streak.longest_streak : 0;
      if (curr > 0) activeStreaks++;
      if (longest > bestStreak) bestStreak = longest;
      if (g.streak_dates) totalCompletions += g.streak_dates.length;
      if (g.streak && g.streak.last_completed_date === todayStr) {
        todayCompletedCount++;
      }
    });

    this.statActiveStreaks.textContent = activeStreaks;
    this.statBestStreak.textContent = bestStreak;
    this.statTotalDays.textContent = totalCompletions;

    const rate = this.goals.length > 0 ? Math.round((todayCompletedCount / this.goals.length) * 100) : 0;
    this.statTodayRate.textContent = `${rate}%`;
  }

  renderGoals() {
    const todayStr = StreakEngine.formatDate(new Date());
    let filtered = this.goals;

    // Filter by category
    if (this.activeCategory !== 'all') {
      filtered = filtered.filter(g => g.category === this.activeCategory);
    }

    // Filter by search
    if (this.searchQuery) {
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(this.searchQuery) ||
        (g.content && g.content.toLowerCase().includes(this.searchQuery))
      );
    }

    if (filtered.length === 0) {
      this.goalsContainer.innerHTML = '';
      this.emptyState.classList.remove('hidden');
      return;
    }

    this.emptyState.classList.add('hidden');

    this.goalsContainer.innerHTML = filtered.map(goal => {
      const isCompletedToday = goal.streak && goal.streak.last_completed_date === todayStr;
      const themeConfig = THEME_CONFIGS[goal.theme] || THEME_CONFIGS.garden;
      const displayIcon = (goal.theme === 'custom' && goal.custom_emoji) ? goal.custom_emoji : themeConfig.icon;
      const streakCount = goal.streak ? goal.streak.current_streak : 0;
      const longestCount = goal.streak ? goal.streak.longest_streak : 0;

      // Category badge
      const catMap = {
        study: { label: 'Study', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
        health: { label: 'Health', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        work: { label: 'Work', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
        mind: { label: 'Wellness', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
        finance: { label: 'Finance', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
        other: { label: 'Other', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' }
      };
      const cat = catMap[goal.category] || catMap.other;

      // Deadline text
      let deadlineBadge = '';
      if (goal.deadline) {
        const diff = StreakEngine.diffDays(new Date(), StreakEngine.parseDate(goal.deadline));
        if (diff < 0) {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 font-medium">Overdue (${Math.abs(diff)}d)</span>`;
        } else if (diff === 0) {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">Due Today!</span>`;
        } else {
          deadlineBadge = `<span class="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">${diff} days left</span>`;
        }
      }

      // Display Target
      const targetDisplay = goal.daily_target && goal.daily_target !== 'Just tick ✓'
        ? `<strong>Target:</strong> ${this.escapeHtml(goal.daily_target)}`
        : `<strong>Target:</strong> Tick ✓ to complete`;

      return `
        <div class="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all duration-200 hover:border-slate-600/80 group">
          <!-- Card Top: Category, Theme, Actions Menu -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xl p-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 shadow-sm">${displayIcon}</span>
              <span class="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${cat.color}">${cat.label}</span>
              ${deadlineBadge}
            </div>

            <!-- Quick Actions Dropdown / Buttons -->
            <div class="flex items-center gap-1">
              <button onclick="app.openEditGoal('${goal.id}')" title="Edit goal" class="w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 flex items-center justify-center text-xs transition">
                ✏️
              </button>
              <button onclick="app.deleteGoal('${goal.id}')" title="Delete goal" class="w-7 h-7 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 flex items-center justify-center text-xs transition">
                🗑️
              </button>
            </div>
          </div>

          <!-- Goal Info -->
          <div class="my-3">
            <h3 class="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
              ${this.escapeHtml(goal.title)}
            </h3>
            ${goal.content ? `<p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">${this.escapeHtml(goal.content)}</p>` : ''}
            
            <div class="flex items-center gap-3 mt-2.5 text-[11px] text-slate-400">
              <span class="flex items-center gap-1">🎯 ${targetDisplay}</span>
              ${goal.reminder_time ? `<span class="flex items-center gap-1">⏰ ${goal.reminder_time}</span>` : ''}
            </div>
          </div>

          <!-- Streak Info & Actions -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
            <!-- Streak Flame -->
            <div class="flex items-center gap-2">
              <div class="w-10 h-10 rounded-xl bg-slate-900 border border-amber-500/40 flex items-center justify-center text-lg ${streakCount > 0 ? 'flame-glow' : 'opacity-60'}">
                🔥
              </div>
              <div>
                <div class="text-base font-black text-amber-400 leading-tight">
                  ${streakCount} <span class="text-xs font-semibold text-slate-400">days</span>
                </div>
                <div class="text-[10px] text-slate-400 font-medium">
                  Best: <strong class="text-rose-400">${longestCount}</strong> days
                </div>
              </div>
            </div>

            <!-- Buttons: Complete Today & Open World -->
            <div class="flex items-center gap-2">
              <button
                onclick="app.openWorldModal('${goal.id}')"
                class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <span>${displayIcon}</span>
                <span class="hidden xs:inline">Enter World</span>
              </button>

              <button
                onclick="app.toggleCheckIn('${goal.id}')"
                class="streak-check-btn px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                  isCompletedToday
                    ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/60'
                    : 'bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-amber-500/25 active:scale-95'
                }"
              >
                ${isCompletedToday ? '<span>✓</span><span>Completed</span>' : '<span>Check-in</span><span>🔥</span>'}
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ========================================================================
  // CHECK-IN ACTION (RULE 1, 2)
  // ========================================================================
  toggleCheckIn(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;

    const result = StreakEngine.recordDailyCompletion(goal);

    if (result.isNewDay) {
      // Sound FX
      if (goal.streak.current_streak % 5 === 0) {
        SoundFX.playMilestone();
      } else {
        SoundFX.playSuccess();
      }

      // Confetti burst
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#f59e0b', '#ec4899', '#6366f1', '#10b981']
        });
      }

      // Persist local and trigger background cloud sync
      AppStorage.saveGoals(this.goals);
      this.renderStats();
      this.renderGoals();
      this.triggerCloudSync(false);

      if (result.graceApplied) {
        this.showToast('🛡️ 1-Day Grace Period applied: Your streak is protected and continued!');
      }
    } else {
      SoundFX.playPop();
      this.showToast('Already completed today! Your streak is fully secured! ✨');
    }
  }

  // ========================================================================
  // GOAL CREATE & EDIT MODAL
  // ========================================================================
  openGoalModal(editingGoal = null) {
    this.goalForm.reset();
    this.customEmojiBox.classList.add('hidden');
    this.customTargetInputContainer.classList.add('hidden');

    if (editingGoal) {
      this.goalModalTitle.textContent = '✏️ Edit Goal';
      this.formGoalId.value = editingGoal.id;
      this.formGoalTitle.value = editingGoal.title;
      this.formGoalContent.value = editingGoal.content || '';
      this.formGoalCategory.value = editingGoal.category || 'study';

      // Daily target handling
      if (editingGoal.daily_target && editingGoal.daily_target !== 'Just tick ✓') {
        const customRadio = document.querySelector('input[name="targetMode"][value="custom"]');
        if (customRadio) customRadio.checked = true;
        this.customTargetInputContainer.classList.remove('hidden');
        this.formDailyTarget.value = editingGoal.daily_target;
      } else {
        const tickRadio = document.querySelector('input[name="targetMode"][value="tick"]');
        if (tickRadio) tickRadio.checked = true;
        this.formDailyTarget.value = '';
      }

      this.formCadence.value = editingGoal.cadence || 'daily';
      this.formDeadline.value = editingGoal.deadline || '';
      this.formTargetStreak.value = editingGoal.target_streak || 30;
      this.formReminderTime.value = editingGoal.reminder_time || '20:00';

      const themeRadio = document.querySelector(`input[name="goalTheme"][value="${editingGoal.theme || 'garden'}"]`);
      if (themeRadio) {
        themeRadio.checked = true;
      } else {
        // fallback if previous theme was one of the removed ones
        const gardenRadio = document.querySelector('input[name="goalTheme"][value="garden"]');
        if (gardenRadio) gardenRadio.checked = true;
      }

      if (editingGoal.theme === 'custom') {
        this.customEmojiBox.classList.remove('hidden');
        this.formCustomEmoji.value = editingGoal.custom_emoji || '';
      }
    } else {
      this.goalModalTitle.textContent = '🎯 Set Up New Goal';
      this.formGoalId.value = '';
      this.formGoalCategory.value = 'study';
      this.formCadence.value = 'daily';
      this.formTargetStreak.value = '30';
      this.formReminderTime.value = '20:00';

      const tickRadio = document.querySelector('input[name="targetMode"][value="tick"]');
      if (tickRadio) tickRadio.checked = true;

      const defaultTheme = document.querySelector('input[name="goalTheme"][value="garden"]');
      if (defaultTheme) defaultTheme.checked = true;
    }

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
    const content = this.formGoalContent.value.trim();
    const category = this.formGoalCategory.value;

    const targetMode = document.querySelector('input[name="targetMode"]:checked')?.value || 'tick';
    const daily_target = targetMode === 'custom' && this.formDailyTarget.value.trim()
      ? this.formDailyTarget.value.trim()
      : 'Just tick ✓';

    const cadence = this.formCadence.value;
    const deadline = this.formDeadline.value;
    const target_streak = parseInt(this.formTargetStreak.value, 10) || 30;
    const reminder_time = this.formReminderTime.value;

    const selectedThemeEl = document.querySelector('input[name="goalTheme"]:checked');
    const theme = selectedThemeEl ? selectedThemeEl.value : 'garden';
    const custom_emoji = this.formCustomEmoji.value.trim();

    const existingIndex = this.goals.findIndex(g => g.id === id);

    if (existingIndex >= 0) {
      // Update
      const old = this.goals[existingIndex];
      this.goals[existingIndex] = {
        ...old,
        title,
        content,
        category,
        daily_target,
        cadence,
        deadline,
        target_streak,
        reminder_time,
        theme,
        custom_emoji
      };
      this.showToast('Goal updated successfully! ✅');
    } else {
      // Create new
      const newGoal = {
        id,
        title,
        content,
        category,
        daily_target,
        cadence,
        deadline,
        target_streak,
        reminder_time,
        theme,
        custom_emoji,
        created_at: StreakEngine.formatDate(new Date()),
        streak: {
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: ''
        },
        streak_dates: []
      };
      this.goals.unshift(newGoal);
      this.showToast('New goal created! Tap Check-in to start your streak 🔥');
    }

    AppStorage.saveGoals(this.goals);
    this.closeGoalModal();
    this.renderStats();
    this.renderGoals();
    this.triggerCloudSync(false);
  }

  openEditGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    this.openGoalModal(goal);
  }

  deleteGoal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    if (confirm(`Are you sure you want to delete "${goal.title}"? This goal's streak history will be removed.`)) {
      this.goals = this.goals.filter(g => g.id !== goalId);
      AppStorage.saveGoals(this.goals);
      this.renderStats();
      this.renderGoals();
      this.triggerCloudSync(false);
      this.showToast('Goal deleted. 🗑️');
    }
  }

  // ========================================================================
  // WORLD & GARDEN MODAL (GAMIFICATION ENGINE)
  // ========================================================================
  openWorldModal(goalId) {
    const goal = this.goals.find(g => g.id === goalId);
    if (!goal) return;
    this.currentWorldGoalId = goalId;

    const themeConfig = THEME_CONFIGS[goal.theme] || THEME_CONFIGS.garden;
    const displayIcon = (goal.theme === 'custom' && goal.custom_emoji) ? goal.custom_emoji : themeConfig.icon;

    // Header styling according to Theme
    this.worldHeaderBanner.className = `p-5 border-b border-slate-800/80 flex items-center justify-between relative overflow-hidden transition-colors duration-300 ${themeConfig.themeClass}`;
    this.worldThemeIcon.textContent = displayIcon;
    this.worldGoalTitle.textContent = goal.title;
    this.worldThemeSubtext.textContent = themeConfig.name + ' • ' + themeConfig.subtext;

    // Stats
    const curr = goal.streak ? goal.streak.current_streak : 0;
    const longest = goal.streak ? goal.streak.longest_streak : 0;
    this.worldCurrentStreak.textContent = `${curr} days`;
    this.worldLongestStreak.textContent = `${longest} days`;

    // Render items grid
    const items = StreakEngine.generateWorldItems(goal.streak_dates || [], goal.theme, goal.custom_emoji);
    this.slotDetailBox.classList.add('hidden');
    this.auditLogDrawer.classList.add('hidden');

    if (items.length === 0) {
      this.worldSlotsGrid.innerHTML = `
        <div class="col-span-full py-12 text-center text-slate-400">
          <div class="text-4xl mb-2">${displayIcon}</div>
          <p class="text-xs">No check-ins recorded yet for this goal.</p>
          <p class="text-[11px] text-slate-500 mt-1">Tap "Check-in" on the dashboard to plant your very first seed!</p>
        </div>
      `;
    } else {
      this.worldSlotsGrid.innerHTML = items.map((item, idx) => {
        const isHealthy = item.type === 'healthy';
        const tierClass = isHealthy ? `tier-${item.tier}` : '';
        const delay = Math.min(idx * 0.02, 0.6);

        return `
          <div
            class="world-slot ${item.type} ${tierClass} animate-pop-in"
            style="animation-delay: ${delay}s"
            onclick="app.selectWorldSlot(${idx})"
          >
            <span class="text-2xl sm:text-3xl filter select-none">${item.emoji}</span>
            <span class="slot-badge">${item.label}</span>
          </div>
        `;
      }).join('');
    }

    // Cache current world items for slot click lookup
    this.currentWorldItems = items;

    // Populate Legend
    this.populateLegend(themeConfig, goal.custom_emoji);

    // Populate Audit Log drawer
    const dates = (goal.streak_dates || []).slice().reverse();
    this.auditTotalCount.textContent = `${dates.length} days`;
    this.auditDatesList.innerHTML = dates.length > 0
      ? dates.map(d => `<div class="py-0.5 border-b border-slate-900 flex justify-between"><span>${d}</span><span class="text-emerald-400">✓ Completed</span></div>`).join('')
      : '<div class="text-slate-500">No recorded check-in dates yet</div>';

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

    if (item.type === 'healthy') {
      this.slotDetailDesc.textContent = `Completed on ${item.date} (${item.label})`;
    } else {
      this.slotDetailDesc.textContent = `${item.dateDesc} (Interrupted for ${item.gapDays} days)`;
    }
  }

  populateLegend(themeConfig, customEmoji) {
    const tiers = [100, 15, 10, 5, 1];
    this.worldLegendContent.innerHTML = tiers.map(t => {
      const pool = themeConfig.tiers[t];
      let rep = pool ? pool[0] : '⭐';
      if (customEmoji && t === 1) rep = customEmoji;
      const deadInfo = themeConfig.dead[t] || { emoji: '🌾' };

      return `
        <div class="p-2 rounded-xl bg-slate-950/60 border border-slate-800 text-center flex flex-col items-center">
          <div class="flex items-center gap-1.5 text-base sm:text-lg mb-1">
            <span>${rep}</span>
            <span class="text-[10px] text-slate-500">/</span>
            <span class="opacity-70">${deadInfo.emoji}</span>
          </div>
          <span class="text-[10px] font-black text-indigo-300 uppercase">${t} Days</span>
          <span class="text-[9px] text-slate-400 truncate max-w-full">${themeConfig.labels[t]}</span>
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

    // Run Pure Self-Healing Algorithm
    const healed = StreakEngine.recalculateStreakFromDates(goal.streak_dates || []);
    goal.streak = healed;

    AppStorage.saveGoals(this.goals);
    this.openWorldModal(this.currentWorldGoalId);
    this.renderStats();
    this.renderGoals();
    this.showToast('✨ Streak self-healed accurately from your check-in audit log!');
  }

  // ========================================================================
  // FIREBASE CLOUD SYNC & SETTINGS MODAL
  // ========================================================================
  openFirebaseModal() {
    const cfg = AppStorage.getFirebaseConfig();
    this.cfgFirebaseProjectId.value = cfg.projectId || 'streakapp-6eab3';
    this.cfgFirebaseDatabaseUrl.value = cfg.databaseUrl || 'https://streakapp-6eab3-default-rtdb.firebaseio.com';
    this.cfgUserSyncId.value = cfg.userSyncId || 'my_phone';

    this.firebaseModal.classList.remove('opacity-0', 'pointer-events-none');
    this.firebaseModalBox.classList.remove('translate-y-8');
  }

  closeFirebaseModal() {
    this.firebaseModal.classList.add('opacity-0', 'pointer-events-none');
    this.firebaseModalBox.classList.add('translate-y-8');
  }

  saveFirebaseConfigHandler() {
    const cfg = {
      projectId: this.cfgFirebaseProjectId.value.trim() || 'streakapp-6eab3',
      databaseUrl: this.cfgFirebaseDatabaseUrl.value.trim() || 'https://streakapp-6eab3-default-rtdb.firebaseio.com',
      userSyncId: this.cfgUserSyncId.value.trim() || 'user_default'
    };

    AppStorage.saveFirebaseConfig(cfg);
    this.closeFirebaseModal();
    this.showToast('Firebase configuration saved! Syncing now...');
    this.triggerCloudSync(true);
  }

  async testFirebaseConnection() {
    this.firebaseStatusBadge.textContent = 'Testing connection... ⏳';
    this.firebaseStatusBadge.className = 'font-bold text-amber-400';

    const cfg = {
      projectId: this.cfgFirebaseProjectId.value.trim(),
      databaseUrl: this.cfgFirebaseDatabaseUrl.value.trim(),
      userSyncId: this.cfgUserSyncId.value.trim()
    };
    AppStorage.saveFirebaseConfig(cfg);

    const result = await AppStorage.syncWithFirebase(false);
    if (result.success) {
      this.firebaseStatusBadge.textContent = '🟢 Connected Successfully!';
      this.firebaseStatusBadge.className = 'font-bold text-emerald-400';
    } else {
      this.firebaseStatusBadge.textContent = `🔴 Error: ${result.error || result.message}`;
      this.firebaseStatusBadge.className = 'font-bold text-rose-400';
    }
  }

  async triggerCloudSync(interactive = false) {
    if (interactive) this.showToast('Running Union Merge algorithm with Firebase RTDB...');

    this.syncStatusDot.className = 'w-2 h-2 rounded-full bg-amber-400 animate-spin';
    this.syncStatusText.textContent = 'Syncing...';

    const result = await AppStorage.syncWithFirebase(interactive);

    if (result.success) {
      this.syncStatusDot.className = 'w-2 h-2 rounded-full bg-emerald-400';
      this.syncStatusText.textContent = 'Synced 🟢';

      // Reload goals from local storage since union merge might have brought new goals
      this.goals = AppStorage.getGoals();
      this.renderStats();
      this.renderGoals();

      if (interactive) {
        SoundFX.playSuccess();
        this.showToast(`🎉 Sync completed! (${result.count} goals unified)`);
      }
    } else {
      this.syncStatusDot.className = 'w-2 h-2 rounded-full bg-slate-500';
      this.syncStatusText.textContent = 'Offline 🟡';

      if (interactive) {
        this.showToast(`⚠️ Cloud notice: ${result.error || result.message}. Data is 100% safe offline on this device!`);
      }
    }
  }

  // Backup JSON
  exportJsonBackup() {
    const data = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      goals: this.goals
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `streak-universe-backup-${StreakEngine.formatDate()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('JSON backup exported successfully! 💾');
  }

  importJsonBackup(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        const importedGoals = Array.isArray(parsed) ? parsed : (parsed.goals || []);
        if (!Array.isArray(importedGoals)) throw new Error('Invalid JSON file format');

        // Merge with current goals
        const map = new Map();
        this.goals.forEach(g => map.set(g.id, g));
        importedGoals.forEach(g => {
          if (!g || !g.id) return;
          if (!map.has(g.id)) {
            map.set(g.id, g);
          } else {
            const current = map.get(g.id);
            const combinedDates = Array.from(new Set([...(current.streak_dates || []), ...(g.streak_dates || [])])).sort();
            map.set(g.id, {
              ...current,
              ...g,
              streak_dates: combinedDates,
              streak: StreakEngine.recalculateStreakFromDates(combinedDates)
            });
          }
        });

        this.goals = Array.from(map.values());
        AppStorage.saveGoals(this.goals);
        this.renderStats();
        this.renderGoals();
        this.showToast('JSON data imported and unified! 🎉');
        this.closeFirebaseModal();
      } catch (err) {
        alert('Error parsing JSON backup file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  // ========================================================================
  // UTILITIES & TOAST
  // ========================================================================
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
    toast.className = 'fixed bottom-5 left-1/2 transform -translate-x-1/2 z-50 glass-card px-4 py-2.5 rounded-2xl border border-indigo-500/60 text-xs font-semibold text-white shadow-2xl flex items-center gap-2 animate-bounce';
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
      console.warn('SW register notice:', err);
    });
  });
}

// Start application
let app = null;
window.addEventListener('DOMContentLoaded', () => {
  app = new AppController();
  window.app = app;
});
