const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const func = require('./functions.js')


class SpiderBot {
    constructor(config) {
        this.bot = config;
    };
    client() {
        client.login(this.bot.token);

        client.on('ready', () => {
            this.bot.readyMessage(client);
        });

        client.on('message', async (msg) => {
            if (msg.author.bot) return;
            this.filter(msg);
            var guildData = [], userData = [];
            if (msg.channel.type === 'dm') return this.send(msg, { title: 'The bot is disabled in the dms' })
            if (msg.channel.type === 'text') {
                await func.config('get', 'guild', msg.guild.id).then((i) => {
                    if (i.error) return console.log('Error')
                    guildData = i;
                });
            };
            await func.config('get', 'user', msg.author.id).then((i) => {
                if (i.error && !i.exist) return console.log(i.error)
                userData = i;
            });
            let prefix = guildData[0].prefix || this.bot.prefix;
            if (!msg.content.includes(prefix)) return;
            const command = msg.content.split(/ /g)[0].split(prefix)[1];
            this.command(msg, command, { guild: guildData, user: userData, prefix: prefix });
        });

        client.on('messageUpdate', async (msg) => {
            if (msg.author.bot) return;
            console.log(`msg updated: ${msg.content}`)
        })
        return client;
    };
    async command(msg, command, data) {
        try {
            require(`./commands/${command}.js`);
        } catch (error) {
            return this.send(msg, { desc: `The command ${command} does not exist` });
        };
        const cmdModule = require(`./commands/${command}.js`);
        let args = msg.content.replace(`${data.prefix}${command}`, '');
        const cmd = new cmdModule(client, msg, args, data, this.bot);
        cmd.run(msg)
    };
    async send(msg, data) {
        msg.channel.send({
            embed: {
                color: data && data.color || '#fff000',
                title: data && data.title || '',
                author: {
                    name: msg.author.username,
                    icon_url: msg.author.displayAvatarURL()
                },
                description: data && data.desc || '',
                timestamp: new Date(),
                footer: {
                    text: 'Spiderbot'
                }
            }
        })
    };
    async filter(msg) {
        fs.readFile('src/config/words.csv', 'utf8', (err, file) => {
            if (err) return console.error(err);
            const bannedWords = file.split(/\r?\n/);
            for (const word of bannedWords) {
                if (msg.content.toLowerCase().includes(word)) {
                    msg.delete();
                    return this.send(msg, { desc: `Please do not swear in this channel`, color: '#ff0000', title: `No swearing` })
                }
            }
        })
    };
    async info(action, db, id, data) {
        func.config(action, db, id, data);
    }
}

class Commands extends SpiderBot {
    constructor(client, msg, args, data, bot, config) {
        super()
        this.embeds = new Discord.MessageEmbed();
        this.bott = bot;
        this.msg = msg;
        this.name = config.name;
        this.usage = config.usage;
        this.cooldown = config.cooldown || 0;
        this.guildOnly = config.guildOnly || false;
        this.perms = config.perms || ['ANY'];
        this.arguments = config.arguments || '<text>';
        this.args = args;
        this.guildData = data.guild;
        this.prefix = data.prefix;
        if (data.user[0] !== undefined) {
            this.userData = data.user[0];
        } else {
            this.userData = { embed: { color: '#ff0000' }};
        };
    }
    setArgs() {
        var argument = this.arguments.split(/ /g);
        if (argument.length === 1) {
            if (this.args.split(/ /g).length <= 1) {
                return false;
            }
            return true;
        }
    }
    checkPerms(msg) {
        for (const owner of this.bott.owners) {
            if (msg.author.id === owner) return true;
        }
        if (!msg.member.hasPermission(this.perms)) {
            this.sendT(msg, { title: 'Permission error', desc: `You do not have permission to use that command (${this.prefix}${this.name})`, color: this.userData.embed.color});
            return false;
        }
        return true;
    }
}

module.exports = {
    SpiderBot,
    Commands
}