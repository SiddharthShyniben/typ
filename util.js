const bold = s => `{bold}${s}{/bold}`;
const green = s => `{green-fg}${s}{/green-fg}`;

const isAlpha = x => /^[a-zA-Z]+$/.test(x);

module.exports = {bold, green, isAlpha};
