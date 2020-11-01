const func = require('../functions');

module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'eval',
			section: 'util',
			usage: '',
			cooldown: 0,
			guildOnly: false,
			perms: ['BOT_OWNER'],
			args: '<none>'
		};
	}
	run(msg) {
		func.send(msg, {
			title: `Pong ${Date.now() - msg.createdTimestamp}ms. API: ${Math.round(msg.client.ws.ping)}ms`
		});
	}

};
