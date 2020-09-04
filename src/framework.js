const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const func = require('./functions');
const parser = require('discord-command-parser');
// eslint-disable-next-line no-unused-vars
const path = require('path');

class Commands {

	constructor(config) {
		this.botconfig = config;
		this.getcmds();
	}
	async getcmds() {
		fs.readdir('./src/commands/', (err, files) => {
			if (err) console.error(err);
			const jsfiles = files.filter(file => file.split('.').pop() === 'js');

			if (jsfiles.length <= 0) return console.log('There are no commands to load...');

			console.log(`Loading ${jsfiles.length} commands...`);
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
		if (command.perms === undefined) return true;
		for (const owner of this.botconfig.owners) {
			if (msg.author.id === owner) return true;
		}
		if (!msg.member.hasPermission[command.config.perms]) return false;
		return true;
	}
	async cooldown() {
		// Cooldown not added
		return true;
	}
	async args() {
		// Argument testing not added
		return true;
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
			this.help(msg, parsed);
			return;
		}
		if (!this.perms(msg, command)) {
			func.send(msg, {
				desc: `You do not have permission to use that command`,
				title: `Missing Permissions`,
				color: '#fff000'
			});
			return;
		}
		command.run(msg, parsed.arguments);
	}
	async help(msg, parsed) {
		var text = '';
		client.commands.forEach((cmd) => {
			text += `${parsed.prefix}${cmd.cmdconf.command} ${cmd.cmdconf.args} | ${cmd.cmdconf.usage}\n`;
		});
		func.send(msg, { desc: text });
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
			if (this.bot.readyMessage) {
				this.bot.readyMessage(client);
			} else {
				console.log('Bot ready');
			}
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
			new BotStatus(client).set(`A Game Of being Built\n Serving ${gguilds.length} guilds`);
		});

		client.commands = new Discord.Collection();
		client.aliases = new Discord.Collection();

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
