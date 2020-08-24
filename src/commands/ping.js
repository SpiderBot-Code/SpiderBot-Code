const func = require('./functions.js');

module.exports = class Send {
    constructor() {
        this.cmdconf = {
            command: 'ping',
            usage: 'Get the bots ping',
            cooldown: 100,
            guildOnly: false,
            arguments: ''
        }
    };
    conf() { return this.cmdconf };
    run(msg, args) {
        func.send(msg, {
            username: false,
            title: `Pong ${Date.now() - msg.createdTimestamp}ms. API: ${Math.round(msg.client.ws.ping)}ms`
        });
    }
}