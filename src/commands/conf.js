module.exports = class Conf {
    constructor(client, message, args, data, bot) {
       this.cmdconf = {
           command: 'conf',
           usage: 'Configure guild settings',
           guildOnly: true,
           perms: ['ADMINISTRATOR'],
           arguments: '<show | set[<option> <value>] | reset[<option> <value>]>'
       }
    };
    conf() { return this.cmdconf };
    run(msg, args) {
        console.log('conf command')
        /*
        if (!this.checkPerms(msg)) return;
        var embed = this.embeds
        .setTitle(`This command does not have any functions yet`)
        .addField('Try again later', `Sadly this command has no function yet`)
        .setColor(this.userData.embed.color)
        .setAuthor(msg.author.username, msg.author.displayAvatarURL())
        .setFooter(`SpiderBot`)
        .setTimestamp();
        msg.channel.send(embed);
        */
    }
};