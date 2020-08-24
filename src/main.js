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
        // check perms cooldown args run
        this.check(parsed.command).then(data => {
            if (!data.iscmd) return this.help(msg, parsed, guildDB, userDB);
            this.perms(msg, parsed, guildDB, userDB, data.cmd).then(r => {
                if (!r) return func.send(msg, {
                    username: false,
                    desc: `You do not have permission to use that command`,
                    title: `Missing Permissions`,
                    color: '#fff000',
                    userDB: userDB,
                    guildDB: guildDB
                });
                this.cooldown().then(r => {
                    if (!r) return func.send(msg, {
                        desc: 'Please wait ${cooldown} seconds before using that command again.',
                        title: `Cooldown`,
                        userDB: userDB,
                        guildDB: guildDB
                    });
                    this.args().then(r => {
                        if (!r) return func.send(msg, {
                            desc: 'You did not provide all the arguments (use ${prefix}help ${command})',
                            title: 'Missing Arguments',
                            userDB: userDB,
                            guildDB: guildDB
                        });
                        this.run(msg, args, data.cmd, parsed);
                    });
                });
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
    async cooldown() {
        // Cooldown not added
        return true;
    }
    async args() {
        // Argument testing not added
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
        func.send(msg, { desc: text, guildDB: guildDB, userDB: userDB });
    }
}

class SpiderBot {
    constructor(config) {
        this.bot = config;
        this.commands = new Commands(this.bot);
    };
    client() {
        client.login(this.bot.token);

        client.on('ready', async() => {
            this.bot.readyMessage(client);
            var gguilds = await func.config('get', 'allguilds', 0).then(guilds => { return guilds });
            var cguilds = client.guilds.cache.map(guilds => guilds.id);
            await cguilds.forEach(guild => {
                func.config('get', 'guild', guild);
            });
            await gguilds.forEach(guild => {
                if (!cguilds.includes(guild.id)) {
                    func.config('delete', 'guild', guild.id, false);
                };
            });
            var gguilds = await func.config('get', 'allguilds', 0).then(guilds => { return guilds });
            new BotStatus(client).set(`A Game Of being Built\n Serving ${gguilds.length} guilds`);
        });

        return client;
    }
    async command(msg) {
        var guildDB = {}, userDB = {};
        if (msg.channel.type === 'text') {
            await func.config('get', 'guild', msg.guild.id).then((i) => {
                if (i.error) return console.log(i.error);
                guildDB = i;
            });
        } else {
            return msg.channel.send('Commands in dms disabled');
        };

        await func.config('get', 'user', msg.author.id).then((i) => {
            if (i.error) return console.log(i.error)
            userDB = i;
        });

        this.commands.start(msg, guildDB, userDB);
    };
    async send(msg, data, type) {
        func.send(msg, data, type);
    };
    async filter(msg, guildData) {
        if (guildData.allowSwearing) return;
        if (guildData.allowSwearChannels.includes(msg.channel.id)) return;
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
};

class BotStatus {
    constructor(client) {
        this.client = client;
    }
    set(text) {
        this.client.user.setActivity(text)
    }
};

module.exports = {
    SpiderBot,
    CommandsOld,
    Commands
};