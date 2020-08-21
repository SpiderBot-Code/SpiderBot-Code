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
    func.config('create', 'guild', guild.id).then(i => console.log(i));
});

bot.on('guildDelete', async (guild) => {
    func.config('get', 'guild', guild.id).then(i => {
        console.log(i[0].saveonkick);
        if (i[0].saveonkick) return console.log('Guild not deleted from database');
        func.config('delete', 'guild', guild.id).then(i => console.log(i));
    });
});