module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'test',
			usage: 'Tests the commands thingy',
			cooldown: 100,
			guildOnly: false,
			args: '<none>'
		};
	}
	conf() { return this.cmdconf; }
	run(msg) {
		console.log('Hello test worked');
		return msg.channel.send('Test worked.');
	}

};
