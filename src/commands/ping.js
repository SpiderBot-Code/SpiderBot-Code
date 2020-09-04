const func = require('../functions');

module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'ping',
			usage: 'Get the bots ping',
			cooldown: 100,
			guildOnly: false,
			args: '<none>'
		};
	}
	conf() { return this.cmdconf; }
	run(msg) {
		func.send(msg, {
			title: `Pong ${Date.now() - msg.createdTimestamp}ms. API: ${Math.round(msg.client.ws.ping)}ms`
		});
	}

};
