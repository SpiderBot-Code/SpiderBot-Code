const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const func = require('./functions');
const parser = require('discord-command-parser');
const chalk = require('chalk');


class Commands {

	constructor(botconfig) {
		this.botconfig = botconfig;
		this.getcmds();
	}
	async getcmds() {
		fs.readdir('./src/commands/', (err, files) => {
			if (err) console.log('There was an error getting the command files');
			const jsfiles = files.filter(file => file.split('.').pop() === 'js');

			if (jsfiles.length <= 0) return console.log('There are no commands to load...');

			if (this.botconfig.debug) console.log(`Loading ${jsfiles.length} commands...`);
			// eslint-disable-next-line id-length
			jsfiles.forEach((f, i) => {
				const Props = require(`./commands/${f}`);
				const props = new Props();
				console.log(`${i + 1}: ${f} loaded!`);
				client.commands.set(props.cmdconf.command, props);
				if (props.cmdconf.aliases) {
					props.cmdconf.aliases.forEach(alias => {
						client.aliases.set(alias, props.cmdconf.command);
					});
				}
			});
		});
	}
	async cmd(msg) {
		if (msg.author.bot) return;
		if (msg.channel.type === 'dm') {
			this.run(msg);
		} else {
			const guildData = await func.config('get', 'guild', msg.guild.id).then((data) => data);
			this.run(msg, guildData);
		}
	}
	async perms(msg, command) {
		if (command.perms === undefined) return;
		if (this.botconfig.owners.includes(msg.author.id)) return;
		if (command.perms.includes('BOT_OWNER')) throw new Error('Only the owner of the bot can use this command');
		if (!msg.member.hasPermission[command.config.perms]) throw new Error('You do not have permission to use that command');
		return;
	}
	async cooldown(msg, command) {
		if (!client.cooldowns.has(command.command)) {
			client.cooldowns.set(command.command, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = client.cooldowns.get(command.command);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(msg.author.id)) {
			const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				// return wait for cooldown
				throw new Error(timeLeft.toFixed(1));
			}
		}

		timestamps.set(msg.author.id, now);
		setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);
		return;
	}
	async args(msg, command, args) {
		const isReq = (string) => {
			const matched = string.match(/^<(.+)>$/);
			return matched ? matched[1] : false;
		};

		if (command.args) {
			var everythingAccountedFor = false;
			const options = command.args.split(' | ');
			for (const option of options) {
				const [definer, ...values] = option.split(' ');
				if (definer !== args[0]) continue;

				if (
					values.some((word, index) => {
						console.log(args[index + 1], isReq(word));
						if (isReq(word) && args[index + 1] !== isReq(word)) return true;
						return false;
					})
				) break;

				everythingAccountedFor = true;
				break;
			}
			if (!everythingAccountedFor) throw new Error(command.args);
		}
		return;
		/*
		if (!command.args) return;
		var found = false;
		command.args.forEach((arg) => {
			if (!args.join(' ').includes(arg)) found = true;
		});
		if (found) {
			return msg.channel.send(
				"You're message did not provide a required argument"
			);
		}
		return msg + command + args;
		*/
	}

	async run(msg, guildData) {
		var parsed = parser.parse(msg, guildData.prefix || this.botconfig.prefix);
		if (!parsed.success) return;
		let command;
		const cmd = parsed.command;

		if (client.commands.has(cmd)) {
			command = client.commands.get(cmd);
		} else if (client.aliases.has(cmd)) {
			command = client.commands.get(client.aliases.get(cmd));
		} else {
			client.commands.get('help').run(msg, parsed.arguments, parsed);
			return;
		}
		if (command.guildOnly && msg.channel.type === 'dm') {
			return func.send(msg, {
				desc: 'This command can not be used in the dms'
			});
		}

		this.perms(msg, command).catch((err) => {
			func.send(msg, {
				title: `Missing Permissions`,
				desc: err,
				username: true,
				color: '#fff000'
			});
			return;
		});

		this.cooldown(msg, command).catch((err) => {
			func.send(msg, {
				desc: `Please wait ${err}s before using that command again`,
				title: `Cooldown`
			});
			return;
		});

		this.args(msg, command, parsed.arguments).catch((err) => {
			func.send(msg, {
				title: `Missing arguments`,
				desc: `You did not provide all the needed arguments for that command`,
				fields: [
					{ title: 'Provided', value: parsed.arguments.join(' ') },
					{ title: 'Expected', value: err }
				]
			});
			return;
		});
		return command.run(msg, parsed.arguments, parsed);
	}

}

class SpiderBot {

	constructor(config) {
		this.bot = config;
		this.commands = new Commands(this.bot);
	}
	client() {
		client.login(this.bot.token);

		client.on('ready', async () => {
			console.log(chalk.redBright(`Ready ad ${client.user.username}\nPrefix: ${this.bot.prefix}`));

			var cguilds = await client.guilds.cache.map((guilds) => guilds.id);
			await cguilds.forEach((guild) => {
				func.config('get', 'guild', guild);
			});
			var gguilds = await func.config('get', 'allguilds', 0).then((guilds) => guilds.map((guild) => guild.guildId.toString()));
			await gguilds.forEach((guild) => {
				if (!cguilds.includes(guild)) {
					func.config('delete', 'guild', guild, true);
					// .then(info => console.log(info));
				}
			});
			new BotStatus(client).set(`A game of being built | ${this.bot.prefix}help\n Serving ${gguilds.length} guilds`);
		});

		client.on('error', (error) => {
			console.log(chalk.red(`[Error] - The bot encountered an error - ${error}`));
		});

		client.commands = new Discord.Collection();
		client.aliases = new Discord.Collection();
		client.cooldowns = new Discord.Collection();

		return client;
	}
	async command(msg) {
		return this.commands.cmd(msg);
	}
	async filter(msg) {
		if (msg.channel.type === 'dm' || msg.author.bot) return;
		await func.config('get', 'guild', msg.guild.id).then((guildData) => {
			if (guildData.error) return console.log(guildData);
			if (guildData.allowSwearing) return '';
			if (guildData.allowSwearChannels.includes(msg.channel.id)) return '';
			fs.readFile('src/config/words.csv', 'utf8', (err, file) => {
				if (err) return console.error(err);
				const bannedWords = file.split(/\r?\n/);
				for (const word of bannedWords) {
					if (msg.content.toLowerCase().includes(word)) {
						msg.delete();
						return func.send(msg, { desc: `Please do not swear in this channel`, color: '#ff0000', title: `No swearing` });
					}
				}
			});
		});
	}

}

class BotStatus {

	set(text) {
		client.user.setActivity(`${text}`);
	}

}

module.exports = {
	SpiderBot
};
