module.exports = class Conf {

	constructor() {
		this.cmdconf = {
			command: 'conf',
			usage: 'Configure guild settings',
			guildOnly: true,
			perms: ['ADMINISTRATOR'],
			args: '<show | set[<option> <value>] | reset[<option> <value>]>'

		};
	}
	run(msg) {
		return msg.channel.send('this command does not have a function yet');
	}

};
