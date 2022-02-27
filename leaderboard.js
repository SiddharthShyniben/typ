const config = require('./config.js');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

if (!config.has('leaderboard')) config.set('leaderboard', [])

function push(item) {
	config.set('leaderboard', config.get('leaderboard').concat([item]));
}

const score = a => a[1] - a[0];

function getLeaderboard() {
	return config.get('leaderboard').sort((a, b) => score(b) - score(a))
}

const globalLeaderboardBase = 'https://42lu18.deta.dev/';

function addToGlobalLeaderboard(body) {
	return fetch(globalLeaderboardBase + 'add', {
		headers: {'Content-Type': 'application/json'},
		method: 'POST',
		body: JSON.stringify(body)
	}).then(res => res.text());
}

function fetchGlobalLeaderboard() {
	return fetch(globalLeaderboardBase + 'leaderboard').then(res => res.json());
}

module.exports = {
	getLeaderboard,
	push,
	addToGlobalLeaderboard,
	fetchGlobalLeaderboard
};
