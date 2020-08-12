const { Commands } = require('../main.js');

module.exports = class Send extends Commands {
    constructor(client, message, args, data, bot) {
       super(client, message, args, data, bot, {
           name: 'send',
           usage: 'Sends a message to the console',
           cooldown: 100,
           guildOnly: false,
           perms: ['BOT_OWNER'],
           arguments: '<text>'
       })
    };
    run(msg) {
        if (!this.checkPerms(msg)) return;
        if (!this.setArgs(msg)) {
            return this[this.send(msg, { title: `You did not provide all the needed arguments` })]
        };
        console.log(`[${msg.author.username + msg.author.discriminator}] ${this.args}`);
        var embed = this.embeds
        .setTitle(`Sent the message to the host`)
        .addField('Mesasge', `${this.args}`)
        .setColor(this.userData.embed.color)
        .setAuthor(msg.author.username, msg.author.displayAvatarURL())
        .setFooter(`SpiderBot`)
        .setTimestamp();
        msg.channel.send(embed);
    }
};