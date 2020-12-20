const func = require('../functions');

module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'ping',
			section: 'info',
			usage: 'Get the bots ping',
			cooldown: 100,
			guildOnly: false,
			args: '<none>'
		};
	}
	run(msg) {
		func.send(msg, {
			title: `Pong ${Date.now() - msg.createdTimestamp}ms. API: ${Math.round(msg.client.ws.ping)}ms`
		});
	}

};
