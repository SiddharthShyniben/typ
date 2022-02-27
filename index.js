require('./args.js');

const config = require('./config');
const blessed = require('blessed');

const {clone, colorize} = require('./util.js');
const getWord = require('./words.js');
const lb = require('./leaderboard.js');
const {_initBox, _gameOverBox, _statsBox, _floatingWordBox, _inputBox} = require('./boxes.js');

const {pass, fail, reset: resetScore, failCount, render: renderScoring, passCount} = require('./scoring.js');

const screen = blessed.screen({smartCSR: true, dockBorders: true});
const initBox = blessed.box(clone(_initBox()));
const statsBox = blessed.box(clone(_statsBox()));
const floatingWordBox = blessed.box(clone(_floatingWordBox()));
const input = blessed.textbox(clone(_inputBox()));
let gameOverBox;
let optionsBox;

screen.append(initBox);
screen.key(['escape', 'C-c'], () => process.exit(0));
screen.key(['t'], play)
screen.key(['l'], leaderboard);
screen.key(['g'], globalLeaderboard);

function play() {
	resetScore();
	statsBox.setContent(renderScoring());
	screen.remove(initBox);
	screen.append(floatingWordBox);
	screen.append(input);
	screen.append(statsBox);
	screen.render();
	input.focus();

	let frame = '';
	let framePassed = 0;

	const renderLoop = setInterval(() => {
		const [coloredFrame, color] = colorize(frame, floatingWordBox.width);
		floatingWordBox.setContent(coloredFrame);
		floatingWordBox.border.fg = color;
		screen.render()
	}, 1000 / 60)

	const getNormalizedFrame = () => frame.split('\n').map(line => line.trimEnd()).join('\n');
	const getNormalizedFrameArray = () => getNormalizedFrame().split('\n');

	input.on('submit', text => {
		if (text.trim() === '') return;
		input.clearValue();
		input.focus();
		screen.render();

		const reg = new RegExp(`\\b${text.replace('+', '\\+')}\\b`);

		const lineIdx = getNormalizedFrameArray().findIndex(line => reg.test(line));

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

		const maxFails = +config.get('max-misses') ?? 5;
		if (failCount() >= maxFails) {
			clearInterval(renderLoop);
			clearInterval(gameLoop);
			gameOverBox = blessed.box(clone(_gameOverBox()));

			gameOverBox.key(['p'], () => {
				screen.remove(gameOverBox);
				screen.render();
				play();
			});

			gameOverBox.key(['s'], () => {
				lb.addToGlobalLeaderboard({name: config.get('name') || 'unknown', score: passCount() - failCount()}).then(globalLeaderboard);
			})

			lb.push([failCount(), passCount()]);

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
				tempFrame[failingLineNumber] = tempFrame[failingLineNumber].replace(/\w+$/, '');
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
	}, +config.get('tick') || 150);

	const addWord = (i = 20000) => {
		if (i > 1000) i /= 1.5;
		try {
			frame = getFrame(floatingWordBox, frame || undefined)
		} catch(e) {}
		return setTimeout(() => addWord(i), i)
	}

	addWord()

	screen.render();
}

function leaderboard() {
	screen.remove(initBox);
	if (gameOverBox) screen.remove(gameOverBox);
	
	const highScores = blessed.listtable({
		height: '100%',
		width: '100%',
		border: {type: 'line'},
		rows: [
			[' ', 'Missed', 'Passed', 'Score'],
			...lb.getLeaderboard().map((x, i) => [i + 1, ...x, x[1] - x[0]].map(y => y.toString()))
		]
	});

	screen.append(highScores);
	screen.render();
}

async function globalLeaderboard() {
	screen.remove(initBox);
	if (gameOverBox) screen.remove(gameOverBox);

	const leaderboard = (await lb.fetchGlobalLeaderboard()).sort((a, b) => b.score - a.score).map(a => [a.name, a.score]);

	const highScores = blessed.listtable({
		height: '100%',
		width: '100%',
		border: {type: 'line'},
		rows: [
			[' ', 'Name', 'Score'],
			...leaderboard.map((x, i) => [i + 1, ...x].map(y => y.toString()))
		]
	});

	screen.append(highScores);
	screen.render();
}

initBox.focus();
screen.render();

function getFrame(box, prevFrame) {
	if (!box || !box.height) return '';
	const height = box.height - 2;
	const strs = prevFrame ? prevFrame.split('\n') : new Array(height).fill('');

	const word = getWord();

	let randLine = Math.floor(Math.random() * height);

	let i = 10;
	while (strs[randLine].trim() && i) {
		i--;
		randLine = Math.floor(Math.random() * height);
	}

	for (i = 0; i < 1e9; i++);
	strs[randLine] = word + strs[randLine].slice(word.length);

	return strs.join('\n');
}
