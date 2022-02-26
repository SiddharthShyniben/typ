const config = require('./config.js');

if (!config.has('leaderboard')) config.set('leaderboard', [])

function push(item) {
	config.set('leaderboard', config.get('leaderboard').concat([item]));
}

const score = a => a[1] - a[0];

function getLeaderboard() {
	return config.get('leaderboard').sort((a, b) => score(b) - score(a))
}

module.exports = {
	getLeaderboard,
	push
};
