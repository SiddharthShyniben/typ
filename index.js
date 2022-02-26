const blessed = require('blessed');

const {clone} = require('./util.js');
const wordGen = require('./words.js');
const lb = require('./leaderboard.js');
let getWords = wordGen();
const {_initBox, _gameOverBox, _statsBox, _floatingWordBox, _inputBox} = require('./boxes.js');

const {pass, fail, reset: resetScore, failCount, render: renderScoring, passCount} = require('./scoring.js');

const screen = blessed.screen({smartCSR: true});
const initBox = blessed.box(clone(_initBox()));
const statsBox = blessed.box(clone(_statsBox()));
const floatingWordBox = blessed.box(clone(_floatingWordBox()));
const input = blessed.textbox(clone(_inputBox()));

screen.append(initBox);
screen.key(['escape', 'C-c'], () => process.exit(0));
screen.key(['t'], play)
screen.key(['l'], leaderboard);

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

	setInterval(() => {
		floatingWordBox.setContent(frame);
		screen.render()
	}, 10)

	const getNormalizedFrame = () => frame.split('\n').map(line => line.trimEnd()).join('\n');
	const getNormalizedFrameArray = () => getNormalizedFrame().split('\n');

	input.on('submit', text => {
		if (text.trim() === '') return;
		input.clearValue();
		input.focus();
		screen.render();

		const lineIdx = getNormalizedFrameArray().findIndex(line => line.includes(text));

		if (lineIdx > -1) {
			pass();
			statsBox.setContent(renderScoring());

			let tempFrame = getNormalizedFrameArray();
			tempFrame[lineIdx] = tempFrame[lineIdx].replace(text, '').trimEnd();
			frame = tempFrame.join('\n');
		}
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

			lb.push([failCount(), passCount()]);

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

			frame = getNormalizedFrame();

			if (
				framePassed > frame.length
			) {
				framePassed = 0;
				frame = getFrame(floatingWordBox);
			}

			if (getNormalizedFrameArray().find(x => x.length >= floatingWordBox.width - 2)) {
				const failingLineNumber = getNormalizedFrameArray().findIndex(x => x.length >= floatingWordBox.width - 2);

				let tempFrame = getNormalizedFrameArray();
				tempFrame[failingLineNumber] = '';
				frame = tempFrame.join('\n');

				fail();
				statsBox.setContent(renderScoring());
				screen.render();
				return;
			}

			frame = getNormalizedFrameArray().map(x => ' ' + x).join('\n');
		} else {
			framePassed = 0;
			frame = getFrame(floatingWordBox);
		}
	}, process.env.DEBUG ? 1000 : 150);

	screen.render();
}

function leaderboard() {
	screen.remove(initBox);

	const highScores = blessed.listtable({
		width: '50%',
		left: 'center',
		height: '100%',
		border: {type: 'line'},
		rows: [
			['Missed', 'Passed'],
			...Object.entries(lb.getLeaderboard()).map(x => x.map(y => y.toString()))
		]
	});

	screen.append(highScores);
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
