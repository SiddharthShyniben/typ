const words = [
	'cron',
	'ls',
	'cd',
	'df',
	'traceroute',
	'map',
	'reduce',
	'javascript',
	'typescript',
	'lua',
	'emacs',
	'vim',
	'ping',
	'document',
	'window',
	'writefilesync',
	'chmod',
	'tolocaledatestring',
	'vscode',
	'flocinaucinihilipilification', // lmao
	'iterm2',
	'value',
	'operator',
	'true',
	'default',
	'async',
	'short',
	'new',
	'constructor',
	'bug',
	'async',
	'dependency',
	'for',
	'eventlistener',
	'stdio',
	'reference',
	'object',
	'unsafe',
	'as',
	'node',
	'encodeuri',
	'element',
	'dislocate',
	'quotastats',
	'string',
	'xargs'
];

// returns a bunch of words for the new frame.
// number of words increases exponentially with the number of frames

const series = [1, 2, 1, 3, 2, 1, 3, 4, 6, 7, 8]

function* getWords() {
	let i = 0;
	let count = series[i];

	while (true) {
		const items = new Array(count).fill('').map(() => words[Math.floor(Math.random() * words.length)]);
		yield items;

		i++;
		if (i >= series.length) {
			i = 0;
		}
		count = series[i];
	}
}

module.exports = getWords;
module.exports.words = words;
