const func = require('../functions');

module.exports = class Send {

	constructor() {
		this.cmdconf = {
			command: 'help',
			section: 'info',
			usage: 'Get command usage info',
			args: '[command | section]'
		};
	}
	run(msg, args, parsed) {
		if (args.length >= 1) {
			if (args[0] !== 'all');
			if (msg.client.commands.get(args[0])) {
				const cmd = msg.client.commands.get(args[0]).cmdconf;
				return func.send(msg, {
					fields: [
						{ title: `${cmd.command} | ${cmd.usage}`, value: `${parsed.prefix}${cmd.command} ${cmd.args}` }
					]
				});
			} else {
				return func.send(msg, { desc: `The command \`${args[0]}\` is not a command` });
			}
		}
		var cmdInfo = [
			{
				title: `The guild specific prefix is \`${parsed.prefix}\``,
				value: `..`
			}
		];
		msg.client.commands.forEach((cmd) => {
			cmdInfo[cmd.cmdconf.section] += `${cmd.cmdconf.command} `;
			// cmdInfo.push({ title: `${cmd.cmdconf.command} | ${cmd.cmdconf.usage}`, value: `${parsed.prefix}${cmd.cmdconf.command} ${cmd.cmdconf.args}` });
		});
		return func.send(msg, {
			title: 'SpiderBot Commands',
			desc: `to get more details on a command or to get more commands from the catagory, use \`&help [command | section]\``,
			fields: cmdInfo,
			user: msg.client.user.username
		});
	}

};
