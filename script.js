// Helper function to handle suffix shorthand values
function parseValue(val) {
    if (!val) return 0;
    val = val.toString().toUpperCase().trim();
    const multipliers = { 
        'K': 1e3, 'M': 1e6, 'B': 1e9, 'T': 1e12, 
        'QD': 1e15, 'QN': 1e18, 'SX': 1e21, 'SP': 1e24, 
        'OC': 1e27, 'N': 1e30, 'DE': 1e33, 'UD': 1e36, 'DD': 1e39,
        'TDD': 1e42 
    };
    
    // Check for 3-character suffixes (like TDD)
    const suffix3 = val.slice(-3);
    if (multipliers[suffix3]) {
        return parseFloat(val.slice(0, -3)) * multipliers[suffix3];
    }

    // Check for 2-character suffixes first (like QD, QN, SX, etc.)
    const suffix2 = val.slice(-2);
    if (multipliers[suffix2]) {
        return parseFloat(val.slice(0, -2)) * multipliers[suffix2];
    }

    // Check for 1-character suffixes (like K, M, B, T)
    const suffix1 = val.slice(-1);
    if (multipliers[suffix1]) {
        return parseFloat(val.slice(0, -1)) * multipliers[suffix1];
    }
    
    return parseFloat(val) || 0;
}

// Format seconds into "0d 0h 0m 0s" format
function formatTime(totalSeconds) {
    if (isNaN(totalSeconds) || totalSeconds <= 0 || totalSeconds === Infinity) return "0d 0h 0m 0s";
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
}

// Format large numbers with suffixes
function formatValue(num) {
    if (num === 0) return "0";
    if (num < 1000) return num.toFixed(2).replace(/\.00$/, '');
    const suffixes = [
        { s: 'TDD', v: 1e42 }, { s: 'DD', v: 1e39 }, { s: 'UD', v: 1e36 }, { s: 'DE', v: 1e33 },
        { s: 'N', v: 1e30 }, { s: 'OC', v: 1e27 }, { s: 'SP', v: 1e24 },
        { s: 'SX', v: 1e21 }, { s: 'QN', v: 1e18 }, { s: 'QD', v: 1e15 },
        { s: 'T', v: 1e12 }, { s: 'B', v: 1e9 }, { s: 'M', v: 1e6 }, { s: 'K', v: 1e3 }
    ];
    for (let i = 0; i < suffixes.length; i++) {
        if (num >= suffixes[i].v) {
            return (num / suffixes[i].v).toFixed(2).replace(/\.00$/, '') + suffixes[i].s;
        }
    }
    return num.toString();
}

// --- Tab Switching Logic ---
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.getAttribute('data-tab');
        if (!tabId) return;

        // Update buttons
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Update contents
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
        
        // Handle unimplemented tabs
        if (!document.getElementById(tabId)) {
            console.warn(`Tab ${tabId} not found.`);
        }
    });
});

// --- 1. NPC Kills Farming Calculator logic ---
document.getElementById('calc-kills-btn').addEventListener('click', () => {
    const current = parseValue(document.getElementById('current-kills').value);
    const wanted = parseValue(document.getElementById('wanted-kills').value);
    const npcAmount = parseValue(document.getElementById('npc-amount').value) || 1;

    const remaining = Math.max(0, wanted - current);
    // Arbitrary default simulation: assuming 12 kills per minute per NPC for basic placeholder logic
    const killsPerMin = npcAmount * 12; 
    const totalSeconds = killsPerMin > 0 ? (remaining / killsPerMin) * 60 : 0;

    document.getElementById('kills-results').innerHTML = `
        Kills / Min: ${formatValue(killsPerMin)}<br>
        Kills Remaining: ${formatValue(remaining)}<br>
        Time: ${formatTime(totalSeconds)}
    `;
});

// --- 2. Stats Calculator logic ---
document.getElementById('calc-stats-btn').addEventListener('click', () => {
    const statPerTick = parseValue(document.getElementById('stat-per-tick').value);
    const current = parseValue(document.getElementById('current-stats').value);
    const wanted = parseValue(document.getElementById('wanted-stats').value);
    const isAfk = document.getElementById('afk-clicking').checked;

    // Simulate tick speed: 1 tick per second normally, faster if afk toggle is active
    const ticksPerMin = isAfk ? 120 : 60; 
    const totalPerMin = statPerTick * ticksPerMin;
    const needed = Math.max(0, wanted - current);
    const totalSeconds = totalPerMin > 0 ? (needed / totalPerMin) * 60 : 0;

    document.getElementById('stats-results').innerHTML = `
        Per Minute: ${formatValue(totalPerMin)}<br>
        Time: ${formatTime(totalSeconds)}
    `;
});

// --- 3. Yen Calculator logic ---
document.getElementById('calc-yen-btn').addEventListener('click', () => {
    const gamepass = document.getElementById('yen-gamepass').checked ? 2 : 1;
    const nenMulti = parseFloat(document.getElementById('yen-multi').value) || 1;
    const heroMulti = parseFloat(document.getElementById('hero-multi').value) || 1;
    
    // Champion Multipliers logic: Multiplier = (1 + (count * (bonus - 1)))
    const bolmaMulti = 1 + (parseInt(document.getElementById('bolma-count').value) || 0) * 0.1;
    const speedcartMulti = 1 + (parseInt(document.getElementById('speedcart-count').value) || 0) * 0.1;
    const demonLordMulti = 1 + (parseInt(document.getElementById('demon-lord-count').value) || 0) * 0.1;
    const awakenedDemonLordMulti = 1 + (parseInt(document.getElementById('awakened-demon-lord-count').value) || 0) * 0.25;
    const loofiTsMulti = 1 + (parseInt(document.getElementById('loofi-ts-count').value) || 0) * 0.25;
    const shadowMulti = 1 + (parseInt(document.getElementById('shadow-count').value) || 0) * 0.25;
    const kamiMulti = 1 + (parseInt(document.getElementById('kami-count').value) || 0) * 0.25;
    const bartoMulti = 1 + (parseInt(document.getElementById('barto-count').value) || 0) * 0.25;
    const hawkEyeMulti = 1 + (parseInt(document.getElementById('hawk-eye-count').value) || 0) * 0.25;
    const awakenedHunterMulti = 1 + (parseInt(document.getElementById('awakened-hunter-count').value) || 0) * 0.25;

    const totalChampMulti = bolmaMulti * speedcartMulti * demonLordMulti * awakenedDemonLordMulti * 
                           loofiTsMulti * shadowMulti * kamiMulti * bartoMulti * 
                           hawkEyeMulti * awakenedHunterMulti;
    
    const current = parseValue(document.getElementById('current-yen').value);
    const needed = parseValue(document.getElementById('needed-yen').value);

    const baseYenPerMin = parseFloat(document.getElementById('class-select').value) || 1;
    const totalYenPerMin = baseYenPerMin * gamepass * nenMulti * heroMulti * totalChampMulti;
    
    const remainingYen = Math.max(0, needed - current);
    const totalSeconds = totalYenPerMin > 0 ? (remainingYen / totalYenPerMin) * 60 : 0;

    document.getElementById('yen-results').innerHTML = `
        Base Yen / Min: ${formatValue(totalYenPerMin / (gamepass * nenMulti * heroMulti * totalChampMulti))}<br>
        Yen / Min: ${formatValue(totalYenPerMin)}<br>
        Time: ${formatTime(totalSeconds)}
    `;
});

// --- 4. Code Scale Converter logic ---
const scaleData = {
    "Fighter": [500000, 1000000, 1500000],
    "Shinobi": [530000, 1060000, 1590000],
    "Pirate": [543500, 1087000, 1630000],
    "Ghoul": [565000, 1130000, 1695000],
    "Hero": [590000, 1180000, 1770000],
    "Reaper": [620000, 1240000, 1860000],
    "Saiyan": [3750000, 7500000, 11250000],
    "Sin": [9375000, 18750000, 28120000],
    "Magi": [37500000, 75000000, 112500000],
    "Akuma": [162000000, 324000000, 486000000],
    "Yonko": [540000000, 1080000000, 1620000000],
    "Gorosei": [1350000000, 2700000000, 4050000000],
    "Overlord": [4050000000, 8100000000, 12150000000],
    "Hokage": [8100000000, 16200000000, 24300000000],
    "Kaioshin": [27000000000, 54000000000, 81000000000],
    "Sage": [162000000000, 324000000000, 486000000000],
    "Espada": [1158000000000, 2317000000000, 3475000000000],
    "Shinigami": [5873000000000, 11747000000000, 17620000000000],
    "Hashira": [52900000000000, 105800000000000, 158700000000000],
    "Hakaishin": [317370000000000, 634730000000000, 952100000000000],
    "Otsutsuki": [952000000000000, 1904000000000000, 2856000000000000],
    "Pirate King": [5713000000000000, 11427000000000000, 17140000000000000],
    "Kishin": [17137000000000000, 34273000000000000, 51410000000000000],
    "Angel": [51400000000000000, 102800000000000000, 154200000000000000],
    "Demon King": [154230000000000000, 308470000000000000, 462700000000000000],
    "Ultra Instinct": [462670000000000000, 925330000000000000, 1388000000000000000],
    "Upper Moon": [1388000000000000000, 2776000000000000000, 4164000000000000000]
};

document.getElementById('calc-scale-btn').addEventListener('click', () => {
    const selectedClass = document.getElementById('scale-class-select').value;
    const baseValue = document.getElementById('code-base-select').value;
    
    let index = 0;
    if (baseValue === "1000000") index = 1;
    if (baseValue === "1500000") index = 2;

    const scaledValue = scaleData[selectedClass] ? scaleData[selectedClass][index] : 0;

    document.getElementById('scale-results').innerHTML = `
        Scaled Reward: ${formatValue(scaledValue)} Yen
    `;
});
