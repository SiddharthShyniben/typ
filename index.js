const blessed = require('blessed');

const {clone} = require('./util.js');
const wordGen = require('./words.js');
let getWords = wordGen();
const {_initBox, _gameOverBox} = require('./boxes.js');

const {pass, fail, reset, failCount, render: renderScoring} = require('./scoring.js');

const screen = blessed.screen({smartCSR: true});
const initBox = blessed.box(clone(_initBox));

const gameOverBox = blessed.box(clone(_gameOverBox));

gameOverBox.key(['p'], () => {
	screen.remove(gameOverBox);
	screen.render();
	play();
});

const statsBox = blessed.box({
	width: '100%',
	height: '10%',
	top: '0',
	content: renderScoring(),
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

screen.key(['t'], play)

function play() {
	reset();
	getWords = wordGen();

	statsBox.setContent(renderScoring());

	screen.remove(initBox);
	screen.append(typingBox);
	screen.append(cmdLineTwo);
	screen.append(statsBox);
	cmdLineTwo.focus();

	screen.render();

	let frame = '';
	let framePassed = 0;

	const getNormalizedFrame = (frame = frame) => frame.split('\n').map(line => line.trimEnd()).join('\n');
	const getNormalizedFrameArray = (frame = frame) => getNormalizedFrame().split('\n');

	cmdLineTwo.on('submit', text => {
		cmdLineTwo.clearValue();
		cmdLineTwo.focus();
		screen.render();

		const lineIdx = getNormalizedFrameArray().findIndex(line => line.includes(text));

		if (lineIdx > -1) {
			pass();
			statsBox.setContent(renderScoring());
			screen.render();
			frame = getNormalizedFrameArray();
			frame[lineIdx] = frame[lineIdx].replace(text, '').trimEnd();
			frame = frame.join('\n');

			text = '';

			typingBox.setContent();
			screen.render();
		}
	});

	const gameLoop = setInterval(() => {
		if (failCount() >= 3) {
			clearInterval(gameLoop);
			screen.remove(typingBox);
			screen.remove(cmdLineTwo);
			screen.remove(statsBox);
			screen.append(gameOverBox);
			screen.render();
			return;
		}

		if (getNormalizedFrame().trim()) {
			framePassed++;

			frame = getNormalizedFrame();
			typingBox.setContent();
			screen.render();

			if (
				framePassed > frame.length
			) {
				framePassed = 0;
				frame = getFrame(typingBox);
				typingBox.setContent();
				screen.render();
			}

			if (getNormalizedFrameArray().find(x => x.length >= typingBox.width - 2)) {
				const failingLineNumber = getNormalizedFrameArray().split('\n').findIndex(x => x.length >= typingBox.width - 2);

				frame = getNormalizedFrameArray();
				frame[failingLineNumber] = '';
				frame = frame.join('\n');

				fail();
				statsBox.setContent(renderScoring());
				typingBox.setContent();

				screen.render();
				return;
			}

			frame = getNormalizedFrameArray().map(x => ' ' + x).join('\n');
			typingBox.setContent();
			screen.render();
		} else {
			framePassed = 0;
			frame = getFrame(typingBox);
			typingBox.setContent();
			screen.render();
		}
	}, 100);

	screen.render();
}

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
