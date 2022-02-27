const bold = s => `{bold}${s}{/bold}`;
const green = s => `{green-fg}${s}{/green-fg}`;

const clone = x => JSON.parse(JSON.stringify(x));

const colorize = (frame, height) => {
	const colored = frame
		.split('\n')
		.map(line => {
			const color = line.length < height * 6 / 8 ? 'green-fg' :
				line.length < height * 7 / 8 ? 'yellow-fg' :
					'red-fg';

			return `{${color}}${line}{/}`
		}).join('\n')
	const maxColor = frame.includes('red') ? 'red-fg' : frame.includes('yellow') ? 'yellow-fg' : 'green-fg'

	return [colored, maxColor];
}

module.exports = {bold, green, clone, colorize};
