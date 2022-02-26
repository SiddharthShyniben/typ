const {bold, green} = require('./util.js');

const baseBox = {
	tags: true,
	border: {
		type: 'line',
	},
	style: {
		fg: 'white',
		bg: 'black',
	},
}

const initBox = {
	...baseBox,
	top: 'center',
	left: 'center',
	width: '50%',
	height: '50%',
	content: `
{center}
${green('typ v1.0.0')}

${bold('t')}est your speed
${bold('l')}eaderboard
${bold('q')}uit
{/center}
`.trim(),
}

module.exports = {
	baseBox,
	initBox,
}
