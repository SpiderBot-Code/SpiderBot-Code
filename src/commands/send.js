module.exports = class Send {
    constructor() {
        this.cmdconf = {
            command: 'send',
            aliases: ['hi', 'ok'],
            usage: 'Sends a message to the console',
            cooldown: 100,
            guildOnly: false,
            perms: ['BOT_OWNER'],
            arguments: '<text>'
        }
    };
    conf() { return this.cmdconf };
    run(msg, args) {
        msg.channel.send(args.join(' '));
        console.log(`[${msg.author.username + msg.author.discriminator}] ${args.join(' ')}`);
        // if (!this.checkPerms(this.msg)) return;
        /*
        if (!this.setArgs(msg)) {
            return this[this.send(msg, { title: `You did not provide all the needed arguments` })]
        };
        
        console.log(`[${this.msg.author.username + this.msg.author.discriminator}] ${this.args}`);
        var embed = this.embeds
        .setTitle(`Sent the message to the host`)
        .addField('Mesasge', `${this.args}`)
        .setColor(this.userData.embed.color)
        .setAuthor(this.msg.author.username, this.msg.author.displayAvatarURL())
        .setFooter(`SpiderBot`)
        .setTimestamp();
        this.msg.channel.send(embed);
        */
    }
};