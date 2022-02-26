const bold = s => `{bold}${s}{/bold}`;
const green = s => `{green-fg}${s}{/green-fg}`;

const clone = x => JSON.parse(JSON.stringify(x));

module.exports = {bold, green, clone};
