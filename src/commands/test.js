module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'test',
			section: 'dev',
			usage: 'Tests the commands thingy',
			cooldown: 100,
			guildOnly: false,
			args: ''
		};
	}
	run(msg) {
		console.log('Hello test worked');
		return msg.channel.send('Test worked.');
	}

};
