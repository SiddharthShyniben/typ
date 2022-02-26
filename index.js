const blessed = require('blessed');

const {bold, green} = require('./util.js');
const getWords = require('./words.js')();

const screen = blessed.screen({
  smartCSR: true,
});

const initBox = blessed.box({
	top: 'center',
	left: 'center',
	width: '50%',
	height: '50%',
	content: `
{center}
${green('Typ v1.0.0')}

${bold('T')}est your speed
${bold('L')}eaderboard
Escape to quit
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

const failBox = blessed.box({
	width: '100%',
	height: '10%',
	top: '0',
	content: '0 misses',
	tags: true,
	style: {fg: 'white'},
	border: {type: 'line'},
	grabKeys: true
})

const typingBox = blessed.box({
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

const cmdLineTwo = blessed.textbox({
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

screen.append(initBox);

screen.key(['escape', 'C-c'], function() {
  return process.exit(0);
});

screen.key(['t'], () => {
	screen.remove(initBox);
	screen.append(typingBox);
	screen.append(cmdLineTwo);
	screen.append(failBox);
	cmdLineTwo.focus();

	let frame = '';
	let failCount = 0;
	let framePassed = 0;

	cmdLineTwo.on('submit', text => {
		cmdLineTwo.clearValue();
		cmdLineTwo.focus();
		screen.render();

		const lineIdx = frame.split('\n').findIndex(line => line.includes(text));

		if (lineIdx > -1) {
			frame = frame.split('\n');
			frame[lineIdx] = frame[lineIdx].replace(text, ''.repeat(text.length)).trimEnd();
			frame = frame.join('\n');

			text = '';

			typingBox.setContent(frame);
			screen.render();
		}
	})

	setInterval(() => {
		if (frame.trim()) {
			framePassed++;

			frame = frame.split('\n').map(s => s.trimEnd()).join('\n');
			typingBox.setContent(frame);
			screen.render();

			if (
				framePassed > frame.length
			) {
				framePassed = 0;
				frame = getFrame(typingBox);
				typingBox.setContent(frame);
				screen.render();
			}

			if (frame.split('\n').find(x => x.length >= typingBox.width - 2)) {
				const failingLineNumber = frame.split('\n').findIndex(x => x.length >= typingBox.width - 2);

				frame = frame.split('\n');
				frame[failingLineNumber] = '';
				frame = frame.join('\n');

				failCount++;
				failBox.setContent(`${failCount} misses`);
				typingBox.setContent(frame);

				screen.render();
				return;
			}

			frame = frame.split('\n').map(x => ' ' + x).join('\n');
			typingBox.setContent(frame);
			screen.render();
		} else {
			framePassed = 0;
			frame = getFrame(typingBox);
			typingBox.setContent(frame);
			screen.render();
		}
	}, 150);

	screen.render();
})

initBox.focus();
screen.render();

function getFrame({height}) {
	const strs = new Array(height).fill('');

	const words = getWords.next().value;

	words.forEach(word => {
		const randLine = Math.floor(Math.random() * height);

		word = word.padStart(Math.floor(Math.random() * (typingBox.width / 4)));

		strs[randLine] = word + strs[randLine].slice(word.length);
	})

	return strs.join('\n');
}
