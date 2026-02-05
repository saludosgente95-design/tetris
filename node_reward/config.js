const rewards = [
    { level: 5, credits: 10, days: 0, type: 'small' },
    { level: 10, credits: 100, days: 1, type: 'big' },
    { level: 15, credits: 50, days: 0, type: 'small' },
    { level: 20, credits: 200, days: 2, type: 'big' },
    { level: 25, credits: 100, days: 0, type: 'small' },
    { level: 30, credits: 300, days: 3, type: 'big' },
    { level: 35, credits: 150, days: 0, type: 'small' },
    { level: 40, credits: 400, days: 4, type: 'big' },
    { level: 45, credits: 200, days: 0, type: 'small' },
    { level: 50, credits: 500, days: 5, type: 'big' }
];

const DAILY_FREE_GAMES = 3;
const GAME_COST_CREDITS = 5;

module.exports = {
    rewards,
    DAILY_FREE_GAMES,
    GAME_COST_CREDITS
};
