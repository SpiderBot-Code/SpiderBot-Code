const func = require('../functions');

module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'help',
			usage: 'Bot commands help',
			guildOnly: false,
			args: '<none>'
		};
	}
	conf() { return this.cmdconf; }
	run(msg) {
		func.send(msg, {
			title: `The help command is not set up yet`
		});
	}

};
