const Conf = require('conf');
const config = new Conf();

if (!config.has('leaderboard')) config.set('leaderboard', [])

function push(item) {
	config.set('leaderboard', config.get('leaderboard').concat([item]));
}

function getLeaderboard() {
	return config.get('leaderboard');
}

module.exports = {
	getLeaderboard,
	push
};
