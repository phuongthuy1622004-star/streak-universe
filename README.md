# 🔥 STREAK UNIVERSE - HABIT & WORLD TRACKER

> Multi-goal habit and streak tracker where each goal grows its own distinct gamified world (Magic Garden, Safari Zoo, Aquarium, Candy Land, or Custom Icon). Built with Offline-First architecture and Firebase Realtime Database cloud synchronization.

---

## 🌟 KEY FEATURES

1. **Multi-Goal & Habit Tracking**:
   - Customize Goal / Habit Title, Motivation & Content, and Categories (Study 📚, Health 🏃, Work 💼, Wellness 🧘, Finance 💰, Lifestyle ✨).
   - **Daily Target Modes**:
     - **Just Tick (✓)**: Fast 1-click check-in without needing to enter numbers.
     - **Specific Quantity**: Optional custom targets (e.g., `30 mins`, `10 pages`, `5 km`, `1 lesson`).
   - **Linked Milestone Target & Target Deadline Date**:
     - Choose your milestone (7, 21, 30, 60, 100, 365 days).
     - Pick a custom deadline date on the calendar, or tap **"⚡ Auto-Set Deadline"** to calculate the exact target date from today automatically!
   - Daily reminder time with countdown badge on each goal card.

2. **Gamification Worlds (4 Curated Themes + Custom)**:
   - 🌿 **Magic Garden**: Sprout 🌱 ➔ Majestic Tree 🌳 (5d) ➔ Blooming Flower 🌸 (10d) ➔ Juicy Fruit 🍑 (15d) ➔ Diamond Heart 💖 (100d).
   - 🦁 **Safari Zoo**: Baby Creature 🐣 ➔ Wild Rabbit & Fox 🦊 (5d) ➔ Deer & Horse 🦌 (10d) ➔ Lion & Tiger 🦁 (15d) ➔ Mythic Dragon & Unicorn 🦄 (100d).
   - 🐬 **Ocean Aquarium**: Tiny Shrimp 🦐 ➔ Tropical Reef Fish 🐠 (5d) ➔ Sea Turtle & Octopus 🐢 (10d) ➔ Dolphin & Shark 🐬 (15d) ➔ Colossal Whale 🐋 (100d).
   - 🍭 **Candy Land**: Lollipop 🍭 ➔ Chocolate Bar 🍫 (5d) ➔ Glazed Donut & Cupcake 🍩 (10d) ➔ Birthday Cake 🎂 (15d) ➔ Candy Castle 🏰 (100d).
   - ⭐ **Custom Icon**: Type any emoji of your choice (e.g. 🚀, 💻, 🥋, ☕, 🎨) to grow your own themed universe.

3. **Core Streak Algorithm Rules (100% Reliable)**:
   - **Idempotency**: Multiple check-ins on the same day never duplicate or inflate streaks.
   - **1-Day Automatic Grace Period**: Missed 1 day due to unexpected busy schedules? The streak is automatically protected and continues upon the next check-in!
   - **Self-Healing Engine**: A dedicated **"Self-Heal Streak"** button scans the immutable `streak_dates` audit trail to recalculate current & longest streaks accurately.
   - **Passive Expiration**: Drops active streak display to 0 if inactive for more than 2 consecutive days.
   - **Web Audio API & Confetti**: Offline synthesized celebratory chimes & canvas confetti.

4. **Firebase Realtime Database (`streakapp-6eab3`) & Offline-First**:
   - Pre-configured with project `streakapp-6eab3`.
   - **Union Merge Strategy**: Saves immediately to local storage on your device. When online, merges historical check-in dates between mobile and desktop without overwriting or losing past days.
   - Manual JSON Backup export and import.

---

## 📱 MOBILE INSTALLATION GUIDE (VIA GITHUB PAGES)

### Step 1: Create a Repository on GitHub
1. Open GitHub: [https://github.com/new](https://github.com/new)
2. In **Repository name**, enter: `streak-universe`
3. Choose **Public**, then click **Create repository**.

### Step 2: Push Code to GitHub
Run the following commands in your PowerShell terminal:
```bash
git add .
git commit -m "feat: complete English UI, curated themes, and tick daily target mode"
git push -u origin main
```

### Step 3: Enable GitHub Pages
1. Go to your repo on GitHub: `https://github.com/phuongthuy1622004-star/streak-universe`
2. Click **Settings** ➔ choose **Pages** from the left sidebar.
3. Under **Build and deployment** ➔ **Branch**: Select `main` and folder `/ (root)` ➔ Click **Save**.
4. In 1–2 minutes, your live website URL will be ready:
   👉 **`https://phuongthuy1622004-star.github.io/streak-universe/`**

### Step 4: Open on Phone & "Add to Home Screen"
- **On iPhone (Safari)**:
  1. Open your GitHub Pages link in Safari.
  2. Tap the **Share** button (box with an upward arrow).
  3. Scroll down and tap **"Add to Home Screen"**.
- **On Android (Chrome)**:
  1. Open your GitHub Pages link in Chrome.
  2. Tap the **3-dot menu** at the top right.
  3. Tap **"Install app"** or **"Add to Home screen"**.

---

## ☁️ FIREBASE DATABASE SETUP (`streakapp-6eab3`)

To allow read/write sync between your phone and laptop:
1. Open your Firebase Console: [https://console.firebase.google.com/u/0/project/streakapp-6eab3/database](https://console.firebase.google.com/u/0/project/streakapp-6eab3/database)
2. Go to the **Rules** tab and set:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```
3. Click **Publish**. In the app header, tap **"Firebase Sync ☁️"** to verify connection.
