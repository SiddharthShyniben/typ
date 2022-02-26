const blessed = require('blessed');

const {clone} = require('./util.js');
const wordGen = require('./words.js');
let getWords = wordGen();
const {_initBox, _gameOverBox, _statsBox, _floatingWordBox, _inputBox} = require('./boxes.js');

const {pass, fail, reset: resetScore, failCount, render: renderScoring} = require('./scoring.js');

const screen = blessed.screen({smartCSR: true});
const initBox = blessed.box(clone(_initBox()));
const statsBox = blessed.box(clone(_statsBox()));
const floatingWordBox = blessed.box(clone(_floatingWordBox()));
const input = blessed.textbox(clone(_inputBox()));

screen.append(initBox);
screen.key(['escape', 'C-c'], () => process.exit(0));
screen.key(['t'], play)

function play() {
	resetScore();
	getWords = wordGen();
	statsBox.setContent(renderScoring());
	screen.remove(initBox);
	screen.append(floatingWordBox);
	screen.append(input);
	screen.append(statsBox);
	screen.render();
	input.focus();

	let frame = '';
	let framePassed = 0;

	const setFrame = f => {
		frame = f;
		floatingWordBox.setContent(frame);
		screen.render();
	}

	setInterval(() => {
		screen.render()
		floatingWordBox.setContent(frame);
	}, 10)

	const getNormalizedFrame = (f = frame) => f.split('\n').map(line => line.trimEnd()).join('\n');
	const getNormalizedFrameArray = (f = frame) => getNormalizedFrame(f).split('\n');

	input.on('submit', text => {
		if (text.trim() === '') return;
		input.clearValue();
		input.focus();
		screen.render();


		const lineIdx = getNormalizedFrameArray().findIndex(line => line.includes(text));

		if (lineIdx > -1) {
			pass();
			statsBox.setContent(renderScoring());

			frame = getNormalizedFrameArray();
			frame[lineIdx] = frame[lineIdx].replace(text, '').trimEnd();
			setFrame(frame.join('\n'));
		}

		text = '';
	});

	const gameLoop = setInterval(() => {
		screen.render();
		if (failCount() >= 3) {
			const gameOverBox = blessed.box(clone(_gameOverBox()));

			gameOverBox.key(['p'], () => {
				screen.remove(gameOverBox);
				screen.render();
				play();
			});

			clearInterval(gameLoop);
			screen.remove(floatingWordBox);
			screen.remove(input);
			screen.remove(statsBox);
			screen.append(gameOverBox);
			screen.render();
			return;
		}

		if (getNormalizedFrame().trim()) {
			framePassed++;

			setFrame(getNormalizedFrame());

			if (
				framePassed > frame.length
			) {
				framePassed = 0;
				setFrame(getFrame(floatingWordBox));
			}

			if (getNormalizedFrameArray().find(x => x.length >= floatingWordBox.width - 2)) {
				const failingLineNumber = getNormalizedFrameArray().findIndex(x => x.length >= floatingWordBox.width - 2);
				console.log(getNormalizedFrame().trim());

				frame = getNormalizedFrameArray();
				frame[failingLineNumber] = '';
				frame = frame.join('\n');

				fail();
				statsBox.setContent(renderScoring());
				setFrame(frame);
				return;
			}

			setFrame(getNormalizedFrameArray().map(x => ' ' + x).join('\n'));
		} else {
			framePassed = 0;
			setFrame(getFrame(floatingWordBox));
		}
	}, 1000);

	screen.render();
}

initBox.focus();
screen.render();

function getFrame({height}) {
	const strs = new Array(height).fill('');

	const words = getWords.next().value;

	words.forEach(word => {
		const randLine = Math.floor(Math.random() * height);
		word = word.padStart(Math.floor(Math.random() * (floatingWordBox.width / 4)));
		strs[randLine] = word + strs[randLine].slice(word.length);
	});

	return strs.join('\n');
}
