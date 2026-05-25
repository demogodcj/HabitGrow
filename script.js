// Local Storage State Repositories 
let habits = JSON.parse(localStorage.getItem('prod_habits')) || [];
let profile = JSON.parse(localStorage.getItem('prod_user')) || { xp: 0, level: 1, coins: 50, hearts: 3, lastResetDay: "" };
let timing = JSON.parse(localStorage.getItem('prod_time_config')) || { deadline: "22:00" };
let alertSettings = JSON.parse(localStorage.getItem('prod_alerts')) || { notifications: true, sounds: true, haptics: true };
let appTheme = localStorage.getItem('prod_theme') || 'light';

// Web Audio API Synth Engine for Native Sounds
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playAlertChime(isFailure = false) {
    if (!alertSettings.sounds) return;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (isFailure) {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
    } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); 
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); 
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
    }
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
}

function executeVibrationAlert() {
    if (alertSettings.haptics && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
    }
}

// Boot Initializations
document.documentElement.setAttribute('data-theme', appTheme);
document.getElementById('toggle-dark-mode').checked = (appTheme === 'dark');
document.getElementById('input-deadline-time').value = timing.deadline;
document.getElementById('toggle-notifications').checked = alertSettings.notifications;
document.getElementById('toggle-sounds').checked = alertSettings.sounds;
document.getElementById('toggle-haptics').checked = alertSettings.haptics;
document.getElementById('lbl-date-sub').textContent = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });

// Setup Optional Reminder UI Toggle Hook
const toggleReminder = document.getElementById('toggle-use-reminder');
const reminderInput = document.getElementById('input-habit-reminder');
toggleReminder.addEventListener('change', (e) => {
    reminderInput.disabled = !e.target.checked;
    reminderInput.style.opacity = e.target.checked ? "1" : "0.4";
    if (e.target.checked && !reminderInput.value) {
        reminderInput.value = "08:00"; // Smart safe default if toggled on
    }
});

// Tab Router Matrix
function navigateTabs(targetViewId, element) {
    document.querySelectorAll('.app-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
    document.getElementById(targetViewId).classList.add('active');
    element.classList.add('active');
    evaluateApplicationLifecycle();
    renderAll();
}

// Configuration Storage Hooks
document.getElementById('toggle-dark-mode').addEventListener('change', (e) => {
    appTheme = e.target.checked ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', appTheme);
    localStorage.setItem('prod_theme', appTheme);
});

document.getElementById('toggle-notifications').addEventListener('change', (e) => {
    alertSettings.notifications = e.target.checked;
    if (alertSettings.notifications) requestSystemNotificationPermission();
    localStorage.setItem('prod_alerts', JSON.stringify(alertSettings));
});

document.getElementById('toggle-sounds').addEventListener('change', (e) => {
    alertSettings.sounds = e.target.checked;
    localStorage.setItem('prod_alerts', JSON.stringify(alertSettings));
});

document.getElementById('toggle-haptics').addEventListener('change', (e) => {
    alertSettings.haptics = e.target.checked;
    localStorage.setItem('prod_alerts', JSON.stringify(alertSettings));
});

function saveDeadlineValue() {
    const val = document.getElementById('input-deadline-time').value;
    if(!val) return;
    timing.deadline = val;
    saveConfigurations();
    renderAll();
    alert(`Daily Operations Deadline updated to: ${val}`);
}

async function requestSystemNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
    }
}

// Custom Form Processor Engine
document.getElementById('form-add-habit').addEventListener('submit', (e) => {
    e.preventDefault();
    const titleField = document.getElementById('input-habit-title');
    const hasReminder = document.getElementById('toggle-use-reminder').checked;
    const reminderTimeValue = hasReminder ? document.getElementById('input-habit-reminder').value : null;
    
    if(!titleField.value.trim()) return;

    habits.push({
        id: Date.now(),
        name: titleField.value.trim(),
        reminderTime: reminderTimeValue, // Stores string time or clean null values
        completedToday: false,
        streak: 0
    });

    titleField.value = '';
    document.getElementById('toggle-use-reminder').checked = false;
    reminderInput.disabled = true;
    reminderInput.style.opacity = "0.4";
    
    saveConfigurations();
    renderAll();
});

function invertHabitExecutionState(id) {
    const currentMultiplier = 1 + (profile.hearts * 0.05);

    habits = habits.map(h => {
        if(h.id === id) {
            h.completedToday = !h.completedToday;
            if(h.completedToday) {
                h.streak += 1;
                profile.xp += Math.round(25 * currentMultiplier);
                profile.coins += Math.round(10 * currentMultiplier);
                playAlertChime(false);
                processLevelUpCalculations();
            } else {
                h.streak = Math.max(0, h.streak - 1);
                profile.xp = Math.max(0, profile.xp - Math.round(25 * currentMultiplier));
                profile.coins = Math.max(0, profile.coins - Math.round(10 * currentMultiplier));
            }
        }
        return h;
    });
    saveConfigurations();
    renderAll();
}

function removeHabitRecord(id) {
    habits = habits.filter(h => h.id !== id);
    saveConfigurations();
    renderAll();
}

function processLevelUpCalculations() {
    const requiredThreshold = profile.level * 100;
    if(profile.xp >= requiredThreshold) {
        profile.xp -= requiredThreshold;
        profile.level += 1;
        triggerNotificationFrame("🎉 EVOLUTION LEVEL ACHIEVED", `Your companion grew to Level ${profile.level}!`);
    }
}

// Sanctuary Merchant Logic
function purchaseShopItem(type, pricing) {
    if(profile.coins < pricing) {
        alert("Insufficient gold funds inside wallet balance.");
        return;
    }

    if(type === 'fruit') {
        profile.coins -= pricing;
        profile.xp += 15;
        processLevelUpCalculations();
        alert("You purchased Orchard Fruit! (+15 XP)");
    } else if(type === 'treat') {
        if(profile.hearts >= 5) {
            alert("Your companion's affection profile is maximized.");
            return;
        }
        profile.coins -= pricing;
        profile.hearts = Math.min(5, profile.hearts + 1);
        alert("You purchased an Affection Treat! (+1 Heart)");
    }
    saveConfigurations();
    renderAll();
}

// Day Cutoff Boundary Evaluations
function evaluateApplicationLifecycle() {
    const currentSystemDate = new Date();
    const dateStringKey = currentSystemDate.toDateString();
    
    const [deadHour, deadMin] = timing.deadline.split(':').map(Number);
    const cutoffBoundaryTime = new Date();
    cutoffBoundaryTime.setHours(deadHour, deadMin, 0, 0);

    if (currentSystemDate >= cutoffBoundaryTime && profile.lastResetDay !== dateStringKey) {
        const checkedCount = habits.filter(h => h.completedToday).length;
        const totalCount = habits.length;
        
        if(totalCount > 0 && (checkedCount / totalCount) < 0.50) {
            profile.hearts = Math.max(0, profile.hearts - 1);
            habits.forEach(h => { if(!h.completedToday) h.streak = 0; });
            playAlertChime(true);
            executeVibrationAlert();
            triggerNotificationFrame("⚠️ COMPANION PENALTY APPLIED", "Habits fell below 50% cutoff limit by the operational deadline. Pet lost 1 Heart.");
        }

        habits.forEach(h => h.completedToday = false);
        profile.lastResetDay = dateStringKey;
        saveConfigurations();
    }
}

function triggerNotificationFrame(title, content) {
    if (alertSettings.notifications && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: content });
    }
}

// Background Clock loop Tracker
setInterval(() => {
    const timeNow = new Date();
    const currentStringTime = `${String(timeNow.getHours()).padStart(2,'0')}:${String(timeNow.getMinutes()).padStart(2,'0')}`;
    
    // Per-Task Reminder Verification Cycle
    if(timeNow.getSeconds() === 0) {
        habits.forEach(h => {
            // Evaluates and filters out null fields dynamically
            if(h.reminderTime && h.reminderTime === currentStringTime && !h.completedToday) {
                playAlertChime(false);
                triggerNotificationFrame(`🔔 Task Reminder: ${h.name}`, `It's time to complete your habit!`);
            }
        });
    }

    // Contextual Deadline Alert Rules
    const [dH, dM] = timing.deadline.split(':').map(Number);
    const targetDeadline = new Date();
    targetDeadline.setHours(dH, dM, 0, 0);
    
    const differenceMinutes = (targetDeadline - timeNow) / 60000;
    const elementBanner = document.getElementById('deadline-banner');
    
    const total = habits.length;
    const checked = habits.filter(h => h.completedToday).length;
    const rate = total ? Math.round((checked / total) * 100) : 0;

    if(differenceMinutes > 0 && differenceMinutes <= 120 && rate < 50) {
        elementBanner.style.display = "flex";
        document.getElementById('lbl-deadline-alert').textContent = timing.deadline;
    } else {
        elementBanner.style.display = "none";
    }
}, 1000);

// UI DOM Serialization
function renderHabitsSection() {
    const box = document.getElementById('dom-habits-box');
    box.innerHTML = habits.length ? '' : `<p style="text-align:center; color:var(--text-muted); font-size:13px; padding:20px 0;">No active tasks. Create a habit baseline.</p>`;
    
    habits.forEach(h => {
        const displayReminder = h.reminderTime ? `<span><i class="fa-solid fa-bell"></i> ${h.reminderTime}</span>` : `<span style="opacity:0.5;"><i class="fa-solid fa-bell-slash"></i> No Reminder</span>`;
        const el = document.createElement('div');
        el.className = `ios-card habit-card ${h.completedToday ? 'completed' : ''}`;
        el.innerHTML = `
            <div>
                <h3 style="font-size:15px; font-weight:600; color:var(--text-main);">${h.name}</h3>
                <div style="display:flex; gap:10px; margin-top:4px; font-size:11px; color:var(--text-muted); font-weight:500;">
                    <span><i class="fa-solid fa-fire" style="color:#ff9500"></i> ${h.streak}d Streak</span>
                    ${displayReminder}
                </div>
            </div>
            <div class="action-cluster">
                <button class="btn-circle" onclick="invertHabitExecutionState(${h.id})"><i class="fa-solid fa-check"></i></button>
                <button class="btn-trash" onclick="removeHabitRecord(${h.id})"><i class="fa-solid fa-trash"></i></button>
            </div>
        `;
        box.appendChild(el);
    });

    const checked = habits.filter(h => h.completedToday).length;
    const rate = habits.length ? Math.round((checked / habits.length) * 100) : 0;
    document.getElementById('ui-progress-rate').textContent = `${rate}%`;
    document.getElementById('ui-active-habits').textContent = habits.length;
}

function renderCompanionSection() {
    const checked = habits.filter(h => h.completedToday).length;
    const rate = habits.length ? Math.round((checked / habits.length) * 100) : 0;

    let icon = "fa-egg"; let name = "Vulnerable Mystic Egg";
    if(profile.level >= 8) { icon = "fa-dragon"; name = "Ancient Sovereign Crested Dragon"; }
    else if(profile.level >= 4) { icon = "fa-dove"; name = "Sprout-Winged Juvenile Phoenix"; }

    document.getElementById('pet-render-frame').innerHTML = `<i class="fa-solid ${icon}"></i>`;
    document.getElementById('pet-name-ui').textContent = name;

    const wrap = document.getElementById('pet-mood-wrapper');
    const badge = document.getElementById('pet-mood-badge');
    wrap.className = "ios-card pet-stage-display";

    let narrative = "It sits quietly within the sanctuary ecosystem nesting. Progress tasks to expand core structures.";
    if(rate >= 80) {
        wrap.classList.add('mood-ecstatic');
        badge.className = "mood-badge bg-ecstatic"; badge.textContent = "Ecstatic";
        if(profile.level >= 4) narrative = "The creature tracks the sky trails with blazing paths celebrating your absolute consistency!";
    } else if(rate >= 40) {
        wrap.classList.add('mood-neutral');
        badge.className = "mood-badge bg-neutral"; badge.textContent = "Content";
    } else {
        wrap.classList.add('mood-sleeping');
        badge.className = "mood-badge bg-sleeping"; badge.textContent = "Sleeping";
        narrative = "The pet entered deep recovery sleep modes because today's discipline ratios dropped. Complete a tracking item to awaken it.";
    }
    document.getElementById('pet-status-narrative').textContent = narrative;

    const heartsContainer = document.getElementById('pet-hearts-box');
    heartsContainer.innerHTML = '';
    for(let i = 1; i <= 5; i++) {
        const heart = document.createElement('i');
        heart.className = i <= profile.hearts ? "fa-solid fa-heart" : "fa-regular fa-heart";
        heartsContainer.appendChild(heart);
    }

    document.getElementById('val-level').textContent = profile.level;
    document.getElementById('val-coins').textContent = profile.coins;
    const req = profile.level * 100;
    document.getElementById('val-xp-fill').style.width = `${Math.min(100, (profile.xp / req) * 100)}%`;
    document.getElementById('val-xp-text').textContent = `${profile.xp} / ${req} XP (Current Yield Multiplier: x${(1 + (profile.hearts * 0.05)).toFixed(2)})`;
}

function renderAll() {
    renderHabitsSection();
    renderCompanionSection();
}

// Persistence Engine Loops
function saveConfigurations() {
    localStorage.setItem('prod_habits', JSON.stringify(habits));
    localStorage.setItem('prod_user', JSON.stringify(profile));
    localStorage.setItem('prod_time_config', JSON.stringify(timing));
}

function purgeMemory() {
    if(confirm("Are you sure you want to completely erase all data configurations?")) {
        localStorage.clear();
        location.reload();
    }
}

// Initial Boot Sequence
renderAll();