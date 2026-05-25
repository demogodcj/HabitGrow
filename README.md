# 🥚 HabitGrow: Web-Synth Gamified Habit Tracker & Pet Sanctuary

HabitGrow is a pixel-perfect, client-side web application that reimagines traditional productivity tracking as a high-stakes, retro virtual pet RPG. Engineered with a sleek iOS human interface aesthetic, HabitGrow transforms daily self-discipline into a rewarding adventure: execute tasks to level up your pet, accumulate gold, and build compound habits, or suffer severe health penalties if your completion metrics drop below critical margins before your daily cutoff.

---

## 🛠️ Architecture & Core Features

### 🎹 1. Audio-Synthesis & Haptic Vibration Engines
* **Zero-Asset Web Audio API:** Rather than loading heavy external `.mp3` or `.wav` media assets, HabitGrow synthesizes audio clips directly at execution runtime. It uses a `sawtooth` oscillator ramp array for failure tones and a crisp, multi-tone `sine` oscillator matrix for positive habit checks.
* **Hardware Interoperability:** Implements the native web `navigator.vibrate` array interface to deliver low-level physical haptic feedback alerts (`[100ms, 50ms, 100ms]`) on mobile viewports during state penalties.

### 🎲 2. The Sanctuary Game Loop & Yield Multiplier Engine
* **Mathematical Progression Scaling:** Habit checks trigger an automated base payoff structure modified by the pet's health state. System rewards scale using a dynamic state formula:
  $$\text{XP / Gold Earned} = \text{Base Reward} \times \left(1 + \left(\text{Current Hearts} \times 0.05\right)\right)$$
* **Evolutionary State Engine:** Evaluates global data arrays against user profiles to morph structural frame classes across three separate growth tiers based on pet levels:
    * `fa-egg` (Vulnerable Mystic Egg) — *Levels 1 to 3*
    * `fa-dove` (Sprout-Winged Juvenile Phoenix) — *Levels 4 to 7*
    * `fa-dragon` (Ancient Sovereign Crested Dragon) — *Level 8+*

### 🕒 3. Background Clock Automation Loop
* **Temporal Tracking Array:** Runs a persistent `setInterval` background checker mapping system strings to task parameters every 1,000 milliseconds.
* **Contextual Danger Elements:** Automatically checks your proximity to daily operations deadlines. If time ticks within 120 minutes of your cutoff time while task completion rates sit below 50%, a warning banner (`#deadline-banner`) triggers on screen.
* **Strict Penalty Constraints:** Missing deadlines results in your companion losing health hearts, your current habit streaks getting wiped to zero, and audio warnings firing immediately.

---

## 🎨 Design Layout Tokens

The design engine utilizes structured custom properties to toggle global styling variables dynamically:

* **Presentation Layer Toggles:** Uses CSS attributes (`[data-theme="dark"]`) to switch theme properties smoothly across light modes (`#f2f2f7`) and true OLED dark environments (`#000000`).
* **Fluid Keyframe Animations:** Features performance-optimized keyframe loops:
    * `bounce`: Implements upbeat motion loops for active, happy pet conditions.
    * `sway`: Applies gentle positional rocking for baseline pet conditions.
    * `floatZ`: Generates floating, fading text structures (`Zzz`) during resting states.

---

## 🛠️ Tech Stack & Dependencies

* **Logic Controller:** Vanilla `JavaScript (ES6+)` with Web Audio and LocalStorage APIs
* **UI Structure:** Semantic `HTML5` Architecture
* **Visual Engine:** `CSS3` (Custom Utility Matrix, Keyframe Chains, Grid Systems)
* **Iconography Repository:** [FontAwesome CDN Link (v6.4.0)](https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css)

---

## 🚀 Quick Start & Local Deployment

Because HabitGrow requires no complex build tools, external module systems, or environment setups, running it is simple:

1. Clone this repository to your target machine:
   ```bash
   git clone [https://github.com/YOUR_USERNAME/HabitGrow.git](https://github.com/YOUR_USERNAME/HabitGrow.git)
