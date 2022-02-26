let _passCount = 0;
let _failCount = 0;

const reset = () => {
	_passCount = 0;
	_failCount = 0;
};

const pass = () => _passCount++;
const fail = () => _failCount++;

const passCount = () => _passCount;
const failCount = () => _failCount;

const render = () => `{green-fg}${_passCount === 0 ? 'no' : _passCount}{/green-fg} words pass, {red-fg}${_failCount === 0 ? 'no' : _failCount}{/red-fg} words missed`;

module.exports = {
	reset, pass, fail, passCount, failCount, render
}

