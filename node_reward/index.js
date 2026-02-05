const economy = require('./economy');

// Example Usage
async function onGameOver(userId, levelReached) {
    console.log(`--- Game Over: User ${userId} reached Level ${levelReached} ---`);

    // 1. Check daily games / charge credits
    // Note: In real flow, this happens BEFORE game starts, but for this example:
    const check = await economy.checkDailyGames(userId);
    if (!check.allowed) {
        economy.notifyUser(userId, "No puedes jugar: " + check.message);
        return;
    }

    // If cost > 0, charge it
    if (check.type === 'paid') {
        const success = await economy.chargeCredits(userId, check.cost);
        if (!success) {
            economy.notifyUser(userId, "Error al cobrar créditos.");
            return;
        }
    }

    // 2. Grant Reward
    const result = await economy.grantReward(userId, levelReached);

    if (result) {
        const msg = `🏆 ¡Ganaste +${result.credits} créditos y +${result.days} días!`;
        economy.notifyUser(userId, msg);
    } else {
        console.log("No hay recompensa para este nivel.");
    }
}

// Run Test
(async () => {
    const testUserId = "123456";
    await onGameOver(testUserId, 10);
})();
