module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'send',
			aliases: ['hi', 'ok'],
			usage: 'Sends a message to the console',
			cooldown: 100,
			guildOnly: false,
			perms: ['BOT_OWNER'],
			args: '<text>'
		};
	}
	conf() { return this.cmdconf; }
	run(msg, args) {
		if (args[0] === undefined) return msg.channel.send('No args provided');
		console.log(`[{Command.Send}]:[${msg.author.username + msg.author.discriminator}] ${args.join(' ')}`);
		return msg.channel.send(args.join(' '));
	}

};
