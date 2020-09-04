const { SpiderBot } = require('./framework');
const func = require('./functions');
require('dotenv').config();
const { BOT_TOKEN } = process.env;

const Spider = new SpiderBot({
	owners: ['523826395801976842'],
	readyMessage: (client) => { console.log(`Ready as ${client.user.username}`); },
	token: BOT_TOKEN,
	prefix: '&'
});

const bot = Spider.client();
bot.on('message', async (msg) => {
	Spider.command(msg);
	Spider.filter(msg);
});

bot.on('messageUpdate', async (msg) => {
	if (msg.author.bot) return;
	if (msg.channel.type === 'dm') return;
	Spider.filter(msg);
});

bot.on('guildCreate', async (guild) => {
	func.config('create', 'guild', guild.id).then((i) => {
		if (i.error) return console.log(i);
		return console.log('Guild added');
	});
});

bot.on('guildDelete', async (guild) => {
	func.config('delete', 'guild', guild.id, true).then((i) => console.log(i));
});
