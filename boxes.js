const {bold, green} = require('./util.js');
const {passCount, render: renderScoring} = require('./scoring.js');

const _initBox = () => ({
	top: 'center',
	left: 'center',
	width: '50%',
	height: '50%',
	content: `
{center}
${green('Typ v1.0.0')}

${green(bold('T'))}est your speed
${green(bold('L'))}eaderboard
Press ${green('<Esc>')} to exit
{/center}
`.trim(),
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
	}
});

const _gameOverBox = () => ({
	top: 'center',
	left: 'center',
	width: '50%',
	content: `
{center}
Game over!
You got ${passCount()} words right!

${green(bold('P'))}lay again
${green(bold('L'))}eaderboard
Press ${green('<Esc>')} to exit
{/center}
`.trim(),
	tags: true,
	border: {
		type: 'line',
		fg: 'red',
	},
	style: {
		fg: 'red',
	}
});

const _statsBox = () => ({
	width: '100%',
	height: '10%',
	top: '0',
	content: renderScoring(),
	tags: true,
	style: {fg: 'white'},
	border: {type: 'line'},
	grabKeys: true
});

const _floatingWordBox = () => ({
	width: '100%',
	height: '80%',
	top: '10%',
	content: ``.trim(),
	tags: true,
	border: {
		type: 'line'
	},
	style: {
		fg: 'white',
	}
});

const _inputBox = () => ({
	width: '100%',
	height: '10%',
	top: '90%',
	keys: true,
	mouse: true,
	inputOnFocus: true,
	input: true,
	border: {
		type: 'line'
	},
});

module.exports = {_initBox, _gameOverBox, _statsBox, _floatingWordBox, _inputBox};
