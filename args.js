const args = process.argv.slice(2);
const conf = require('./config.js');

if (args[0] === 'config') {
	conf.set(args[1], args[2])
	process.exit(0);
} else if (args[0] === 'show-config') {
	console.log(conf.path);
	process.exit(0);
}
