const { rewards, DAILY_FREE_GAMES, GAME_COST_CREDITS } = require('./config');

/**
 * Checks if a user can play based on their daily games and credits.
 */
function checkDailyGames(userData, gamesPlayedToday) {
    if (gamesPlayedToday < DAILY_FREE_GAMES) {
        return { canPlay: true, cost: 0, type: 'free' };
    }

    if (userData.credits >= GAME_COST_CREDITS) {
        return { canPlay: true, cost: GAME_COST_CREDITS, type: 'paid' };
    }

    return { canPlay: false, message: 'No tienes suficientes créditos.' };
}

/**
 * Calculates rewards based on the level reached.
 */
function getRewardForLevel(level) {
    return rewards.find(r => r.level === level) || null;
}

/**
 * Handles the logic of granting rewards and connecting to membership.
 */
async function grantReward(userId, level, membershipService) {
    const reward = getRewardForLevel(level);
    if (!reward) return null;

    const results = {
        credits: 0,
        days: 0
    };

    if (reward.credits > 0) {
        await membershipService.addCredits(userId, reward.credits);
        results.credits = reward.credits;
    }

    if (reward.days > 0) {
        await membershipService.addDays(userId, reward.days);
        results.days = reward.days;
    }

    return { reward, results };
}

module.exports = {
    checkDailyGames,
    getRewardForLevel,
    grantReward
};
