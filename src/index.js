const { SpiderBot } = require('./framework');
const func = require('./functions');
require('dotenv').config();
const { BOT_TOKEN } = process.env;
const chalk = require('chalk');

const Spider = new SpiderBot({
	owners: ['523826395801976842'],
	readyMessage: (client) => { console.log(chalk.red(`Ready as ${client.user.username}\n`)); },
	token: BOT_TOKEN,
	prefix: '&'
});

const bot = Spider.client();

bot.on('message', async (msg) => {
	Spider.command(msg);
	Spider.filter(msg);
});

bot.on('messageUpdate', async (msg) => {
	Spider.command(msg);
	Spider.filter(msg);
});

bot.on('guildCreate', async (guild) => {
	func.config('create', 'guild', guild.id).then((i) => {
		console.log(`Guild joined - ${i}`);
	}).catch((err) => {
		console.log(`Error adding the guild '${guild.id}' to the database - ${err}`);
	});
});

bot.on('guildDelete', async (guild) => {
	func.config('delete', 'guild', guild.id, true).then((i) => {
		console.log(`Guild left - ${i}`);
	}).catch((err) => {
		console.log(`Error removing the guild '${guild.id}' from the database ${err}`);
	});
});
