const { Commands } = require('../main.js');

module.exports = class Conf extends Commands {
    constructor(client, message, args, data, bot) {
       super(client, message, args, data, bot, {
           name: 'conf',
           usage: 'Configure guild settings',
           guildOnly: true,
           perms: ['ADMINISTRATOR'],
           arguments: '<show | set[<option> <value>] | reset[<option> <value>]>'
       })
    };
    run(msg) {
        if (!this.checkPerms(msg)) return;
        var embed = this.embeds
        .setTitle(`This command does not have any functions yet`)
        .addField('Try again later', `Sadly this command has no function yet`)
        .setColor(this.userData.embed.color)
        .setAuthor(msg.author.username, msg.author.displayAvatarURL())
        .setFooter(`SpiderBot`)
        .setTimestamp();
        msg.channel.send(embed);
    }
};