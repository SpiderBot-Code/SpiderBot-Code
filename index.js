const { SpiderBot } = require('./src/main.js');
const func = require('./src/functions.js')
require('dotenv').config();
const { BOT_TOKEN } = process.env;

const Spider = new SpiderBot({
    owners: ['523826395801976842'],
    readyMessage: (client) => { console.log(`Ready as ${client.user.username}`) },
    token: BOT_TOKEN,
    prefix: '&'
});

const bot = Spider.client();
bot.on('message', async (msg) => {
    if (msg.author.bot) return;
    Spider.filter(msg);
    if (msg.channel.type === 'dm') return Spider.send(msg, { title: 'The bot is disabled in the dms' });
    Spider.command(msg);
})

bot.on('guildCreate', async (guild) => {
    func.config('create', 'guild', guild.id).then(i => {
        if (i.error) return console.log(i);
        console.log('Guild added');
    });
});

bot.on('guildDelete', async (guild) => {
    func.config('delete', 'guild', guild.id, true).then(i => console.log(i));
});