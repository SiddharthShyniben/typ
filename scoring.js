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

const render = () => `${_passCount === 0 ? 'no' : _passCount} words pass, ${_failCount === 0 ? 'no' : _failCount} words missed`;

module.exports = {
	reset, pass, fail, passCount, failCount, render
}

