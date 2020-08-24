const { MessageEmbed } = require('discord.js');
const { Sequelize, Model, DataTypes } = require('sequelize');
const sqlite3 = require('sqlite3');

// Guild config
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'src/config/database.sqlite',
    logging: false
});

class Guild extends Model { }
Guild.init({
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    prefix: { type: DataTypes.STRING, allowNull: false, defaultValue: '&' },
    logChannel: { type: DataTypes.INTEGER, allowNull: true },
    allowSwearChannels: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
    allowSwearing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    adminRoles: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
    saveonkick: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize, modelName: 'guild' });

class User extends Model { }
User.init({
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    embed: { type: DataTypes.JSON, allowNull: true, defaultValue: { color: '#ff0000' } },
}, { sequelize, modelName: 'user' });

var functions = {};

functions.config = async function (action, db, id, data) {
    await sequelize.sync();
    if (!action || !db || id === undefined) return 'Missing arguments';
    try {
        switch (action) {
            case 'get':
                switch (db) {
                    case 'guild':
                        const guild = await Guild.findOrCreate({
                            where: {
                                id: id
                            },
                            defaults: {
                                id: id
                            }
                        });
                        if (guild[0] === undefined) throw 'Cannot get or create guild';
                        return guild[0];
                    case 'user':
                        const getUser = await User.findAll({
                            where: {
                                id: id
                            }
                        });
                        if (getUser[0] !== undefined) return getUser[0];
                        if (data !== undefined && !data.edit) return User.findAll({
                            where: {
                                id: 0
                            }
                        })
                        const newUser = await User.create({
                            id: id
                        });
                        await newUser.save();
                        return newUser;
                    case 'allguilds':
                        const guilds = await Guild.findAll();
                        if (guilds === undefined) throw 'Error getting all guilds';
                        return guilds;
                    default:
                        throw `The table '${db}' does not exist (get)`;
                };
            case 'create':
                return this.config('get', db, id);
            case 'edit':
                switch (db) {
                    case 'guild':
                        const gotGuild = await Guild.update({ [data.update]: data.value }, {
                            where: {
                                id: id
                            }
                        })
                        return gotGuild;
                    case 'user':
                        const gotUser = await User.update({ [data.update]: data.value }, {
                            where: {
                                id: id
                            }
                        })
                        return gotUser;
                    case 'botinfo':
                        const botInfo = await BotInfo.increment(data.update, 1, data.value);
                    default:
                        throw `The table '${db}' does not exist`;
                }
            case 'delete':
                switch (db) {
                    case 'guild':
                        if (data === true) {
                            return this.config('get', 'guild', id).then(async (guildDB) => {
                                if (guildDB.error) throw guildDB.error;
                                if (guildDB.saveonkick) return 'Guild not deleted (saveonkick)';
                                await Guild.destroy({
                                    where: {
                                        id: id
                                    }
                                });
                                return 'Guild deleted from database';
                            });
                        } else {
                            await Guild.destroy({
                                where: {
                                    id: id
                                }
                            });
                            return 'Guild deleted from database';
                        };
                    default:
                        throw `The table '${db}' does not exist (delete)`;
                }
            default:
                throw `The action '${action}' does not exist (config)`;
        }
    } catch (error) {
        return { error: error };
    };
}

functions.send = async function (msg, sendData, msgType) {
    if (!msg || !sendData) return 'Did not provide all args'
    if (!msgType) var msgType = 'embed';
    switch (msgType) {
        case 'plain': {
            return msg.channel.send(sendData);
        }
        case 'embed': {
            if (!sendData || !sendData.guildDB || !sendData.userDB) return 'Did not provide all args (embed)';
            var embed = new MessageEmbed()
                .setColor(sendData.color || sendData.userDB.embed.color || '#ff0000')
                .setFooter(sendData.footer || `SpiderBot`)
                .setTimestamp()
            if (sendData.username !== false) {
                embed.setAuthor(msg.author.username, msg.author.displayAvatarURL());
            }
            if (sendData.title) embed.setTitle(sendData.title);
            if (sendData.desc) embed.setDescription(sendData.desc);
            if (sendData.fields) {
                sendData.fields.forEach(field => {
                    embed.addField(field.name, field.value);
                });
            };
            msg.channel.send(embed);
        }
    }
};

module.exports = functions;