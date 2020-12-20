const parser = require('./cmd-parse');

const msg = { content: '&config edit guild', author: { id: '19372482243782', username: 'Spider' } }, prefix = '&';

class Conf {

	constructor() {
		this.cmdconf = {
			commandName: 'conf',
			usage: 'Configure guild settings',
			guildOnly: true,
			perms: ['ADMINISTRATOR'],
			args: [
				{
					key: 'configAction',
					type: 'string',
					options: ['edit', 'reset', 'show'],
					required: true
				},
				{
					key: 'configOption',
					type: 'string',
					options: ['guild', 'user', 'bot', 'all'],
					required: true
				},
				{
					key: 'setting',
					type: 'string'
				}
			]

		};
	}
	run(message, { error, configAction, configOption }, { prefix, originalMsg, userInfo }) {
		console.log(message);
		if (error) console.log(error);
		console.log(configAction);
		console.log(configOption);
		return;
	}

}

const { args, msgs, other } = parser.parse(msg, prefix, new Conf().cmdconf);
new Conf().run(msgs, args, other);
