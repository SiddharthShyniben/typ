const {bold, green} = require('./util.js');
const {passCount} = require('./scoring.js');

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
	height: 7,
	content: `
{center}
Game over!
You got ${passCount()} words right!

${green(bold('P'))}lay again
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

module.exports = {_initBox, _gameOverBox};
