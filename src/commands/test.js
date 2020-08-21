module.exports = class Send {
    constructor() {
        this.cmdconf = {
            command: 'test',
            usage: 'Tests the commands thingy',
            cooldown: 100,
            guildOnly: false,
            arguments: '<text>'
        }
    };
    conf() { return this.cmdconf };
    run(msg, args) {
        console.log('Hello test worked')
    }
}