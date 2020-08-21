const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const func = require('./functions.js');
const parser = require('discord-command-parser');
const path = require('path');

class Commands {
    constructor(config) {
        this.botconfig = config;
        this.cmdconfig();
    };
    async cmdconfig() {
        var commands = {};
        var commanddir = path.join(__dirname, 'commands');
        fs.readdirSync(commanddir).forEach(function (file) {
            var command = require('./commands/' + file);
            var cmd = new command();
            commands[cmd.conf().command] = { config: cmd.conf(), cmd: cmd };
        });
        this.commands = commands;
    }
    async start(msg, guildDB, userDB) {
        var parsed = parser.parse(msg, guildDB.prefix || this.botconfig.prefix);
        if (!parsed.success) return;
        var args = parsed.arguments;

        this.check(parsed.command).then(data => {
            if (!data.iscmd) return this.help(msg, parsed, guildDB, userDB);
            this.perms(msg, parsed, guildDB, userDB, data.cmd).then(r => {
                if (!r) return func.send(msg, `You do not have permission to use that command`);
                this.run(msg, args, data.cmd, parsed);
            });
        });
    }
    async check(command) {
        var cmd;
        try {
            if (this.commands[command] !== undefined) {
                return { iscmd: true, cmd: command };
            } else {
                throw 'false';
            }
        } catch (error) {
            try {
                for (cmd in this.commands) {
                    if (this.commands[cmd].config.aliases !== undefined) {
                        if (this.commands[cmd].config.aliases.includes(command)) {
                            if (this.commands[cmd] !== undefined) {
                                return { iscmd: true, cmd: this.commands[cmd].config.command };
                            };
                        };
                    };
                };
                return { iscmd: false };
            } catch (error) {
                console.log(error);
                console.log('command does not exist');
                return { iscmd: false };
            };
        };
    }
    async perms(msg, parsed, guildDB, userDB, command) {
        for (const owner of this.botconfig.owners) {
            if (msg.author.id === owner) {
                return true;
            }
        }
        if (this.commands[command].config.perms === undefined) return true;
        if (!msg.member.hasPermission[this.commands[command].config.perms]) {
            return false;
            // this.sendT(msg, { title: 'Permission error', desc: `You do not have permission to use that command (${this.prefix}${this.name})`, color: this.userData.embed.color });
        };
        return true;
    }
    async run(msg, args, command, parsed) {
        this.commands[command].cmd.run(msg, args);
    }
    async help(msg, parsed, guildDB, userDB) {
        var cmd, text = '';
        for (cmd in this.commands) {
            text += `${parsed.prefix}${this.commands[cmd].config.command} ${this.commands[cmd].config.arguments} | ${this.commands[cmd].config.usage}\n`
        }
        func.send(msg, text)
    }
}

class SpiderBot {
    constructor(config) {
        this.bot = config;
        this.commands = new Commands(this.bot);
    };
    client() {
        client.login(this.bot.token);

        client.on('ready', () => {
            this.bot.readyMessage(client);
        });
        /*
        client.on('message', async (msg) => {
            if (msg.author.bot) return;
            this.filter(msg);
            var guildData = {}, userData = {};
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
            let prefix = guildData.prefix || this.bot.prefix;
            const parsed = parser.parse(msg, prefix);
            if (!parsed.success) return;
            // parser: args, command, prefix, message
            this.command(parsed, guildData, userData);
            // this.command(msg, command, { guild: guildData, user: userData, prefix: prefix });
            if (parsed.command === "ping") {
                return message.reply("Pong!");
            }

            if (!msg.content.includes(prefix)) return;
            const command = msg.content.split(/ /g)[0].split(prefix)[1];
            this.command(msg, command, { guild: guildData, user: userData, prefix: prefix });
            
        });
        */
        client.on('messageUpdate', async (msg) => {
            if (msg.author.bot) return;
            console.log(`msg updated: ${msg.content}`)
        })
        return client;
    };
    // async command(msg, command, data) {
    async command(msg) {
        var guildDB = [], userDB = [];
        if (msg.channel.type === 'text') {
            await func.config('get', 'guild', msg.guild.id).then((i) => {
                if (i.error) return console.log(i.error)
                guildDB = i;
            });
        };
        await func.config('get', 'user', msg.author.id).then((i) => {
            if (i.error && !i.exist) return console.log(i.error)
            userDB = i;
        });

        this.commands.start(msg, guildDB[0], userDB[0]);


        /*
        try {
            require(`./commands/${parsed.command}.js`);
        } catch (error) {
            return this.send(parsed.message, { desc: `The command ${parsed.command} does not exist` });
        };
        const cmdModule = require(`./commands/${parsed.command}.js`);
        // let args = msg.content.replace(`${guildData.prefix}${parsed.command}`, '');
        const cmd = new cmdModule(client, parsed, guildData, userData, this.bot);
        // const cmd = new cmdModule(client, msg, args, data, this.bot);
        cmd.run();
        */
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

class CommandsOld extends SpiderBot {
    constructor(client, parsed, guildData, userData, bot, config) {
        super()
        this.embeds = new Discord.MessageEmbed();
        this.bott = bot;
        this.msg = parsed.message;
        this.name = config.name;
        this.usage = config.usage;
        this.cooldown = config.cooldown || 0;
        this.guildOnly = config.guildOnly || false;
        this.perms = config.perms || ['ANY'];
        this.arguments = config.arguments || '<text>';
        this.args = parsed.arguments;
        this.guildData = guildData;
        this.prefix = parsed.prefix;
        if (userData[0] !== undefined) {
            this.userData = userData[0];
        } else {
            this.userData = { embed: { color: '#ff0000' } };
        };
    }
    checkPerms(msg) {
        for (const owner of this.bott.owners) {
            if (msg.author.id === owner) return true;
        }
        if (!msg.member.hasPermission(this.perms)) {
            this.sendT(msg, { title: 'Permission error', desc: `You do not have permission to use that command (${this.prefix}${this.name})`, color: this.userData.embed.color });
            return false;
        }
        return true;
    }
}

module.exports = {
    SpiderBot,
    CommandsOld,
    Commands
}