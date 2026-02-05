const fs = require('fs').promises;
const path = require('path');
const { rewards } = require('./config');

const MEMBERSHIP_FILE = path.join(__dirname, '../../../data/memberships.json');
const DAILY_FILE = path.join(__dirname, '../../../data/tetris_daily.json');

// --- Helper: Read Data ---
async function readJson(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

// --- Helper: Save Data ---
async function saveJson(filePath, data) {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * 6. Verifica partidas diarias y saldo.
 */
async function checkDailyGames(userId) {
    userId = String(userId);
    const dailyData = await readJson(DAILY_FILE);
    const today = new Date().toISOString().split('T')[0];

    const userDaily = dailyData[userId] || { count: 0, date: today };

    // Reset if new day
    if (userDaily.date !== today) {
        userDaily.count = 0;
        userDaily.date = today;
    }

    console.log(`[CheckDaily] User ${userId}: ${userDaily.count}/3 free games used.`);

    if (userDaily.count < 3) {
        return { allowed: true, type: 'free' };
    }

    // Check Credits
    const memberships = await readJson(MEMBERSHIP_FILE);
    const userData = memberships[userId];
    const credits = userData ? (userData.credits || 0) : 0;

    if (credits >= 5) {
        console.log(`[CheckDaily] User ${userId} has ${credits} credits. Enough for paid game.`);
        return { allowed: true, type: 'paid', cost: 5 };
    }

    console.log(`[CheckDaily] User ${userId} BLOCKED. No free games and insufficient credits.`);
    return { allowed: false, message: "Sin partidas gratis ni créditos." };
}

/**
 * 1. Descuenta créditos del saldo global.
 */
async function chargeCredits(userId, amount) {
    userId = String(userId);
    const memberships = await readJson(MEMBERSHIP_FILE);

    if (!memberships[userId]) return false;
    if (!memberships[userId].credits || memberships[userId].credits < amount) return false;

    memberships[userId].credits -= amount;
    await saveJson(MEMBERSHIP_FILE, memberships);

    console.log(`💰 CREDITOS COBRADOS: -${amount} al usuario ${userId}. Nuevo saldo: ${memberships[userId].credits}`);
    return true;
}

/**
 * 2. Asigna recompensas (créditos y días).
 */
async function grantReward(userId, level) {
    userId = String(userId);
    const reward = rewards.find(r => r.level === level);
    if (!reward) return null;

    const memberships = await readJson(MEMBERSHIP_FILE);
    if (!memberships[userId]) return null; // User must exist

    let logMsg = `🏆 RECOMPENSA NIVEL ${level} para ${userId}:`;

    // Grant Credits
    if (reward.credits > 0) {
        memberships[userId].credits = (memberships[userId].credits || 0) + reward.credits;
        logMsg += ` +${reward.credits} créditos`;
    }

    // Grant Days
    if (reward.days > 0) {
        let currentExp = memberships[userId].expiration_date ? new Date(memberships[userId].expiration_date) : new Date();
        if (currentExp < new Date()) currentExp = new Date(); // Reset if expired

        currentExp.setDate(currentExp.getDate() + reward.days);
        memberships[userId].expiration_date = currentExp.toISOString();
        logMsg += `, +${reward.days} días (Expira: ${currentExp.toISOString()})`;
    }

    await saveJson(MEMBERSHIP_FILE, memberships);
    console.log(logMsg);

    return reward;
}

/**
 * Notificación simulada
 */
function notifyUser(userId, message) {
    console.log(`📨 [Telegram Notification to ${userId}]: ${message}`);
}

module.exports = {
    checkDailyGames,
    chargeCredits,
    grantReward,
    notifyUser
};
