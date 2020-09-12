module.exports = class Conf {

	constructor() {
		this.cmdconf = {
			command: 'bot',
			usage: 'Configure guild settings',
			guildOnly: false,
			perms: ['BOT_OWNER'],
			args: '<none>'

		};
	}
	async run(msg, args) {
		if (args[0] === 'shutdown') {
			await msg.channel.send('Shutting down SpiderBot');
			return process.exit();
		}
		return msg.channel.send('this command does not have a function yet');
	}

};
