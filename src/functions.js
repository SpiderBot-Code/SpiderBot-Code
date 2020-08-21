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
    prefix: { type: DataTypes.STRING, allowNull: true },
    logChannel: { type: DataTypes.INTEGER, allowNull: true },
    noSwear: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
    adminRoles: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
    saveonkick: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize, modelName: 'guild' });

class User extends Model { }
User.init({
    id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
    embed: { type: DataTypes.JSON, allowNull: true, defaultValue: { color: '#ff0000' } }
}, { sequelize, modelName: 'user' });


var functions = {};

functions.config = async function (action, db, id, data) {
    await sequelize.sync();
    if (!action || !db || !id) return 'Missing arguments';
    switch (action) {
        case 'get':
            switch (db) {
                case 'guild':
                    try {
                        const getGuild = await Guild.findAll({
                            where: {
                                id: id,
                            }
                        });
                        if (getGuild[0] !== undefined) return getGuild[0];
                        const newGuild = await Guild.create({
                            id: id,
                        });
                        await newGuild.save();
                        return newGuild;
                    } catch (error) {
                        return { error: error };
                    }
                case 'user':
                    try {
                        const getUser = await User.findAll({
                            where: {
                                id: id
                            }
                        });
                        if (getUser[0] !== undefined) return getUser[0];
                        const newUser = await User.create({
                            id: id
                        });
                        await newUser.save();
                        return newUser;
                    } catch (error) {
                        return { error: error };
                    };
                default:
                    return { error: `The table '${db}' does not exist (get)` };
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
                default:
                    return { error: `The table '${db}' does not exist` };
            }
        case 'delete':
            switch (db) {
                case 'guild':
                    if (data === true) {
                        this.config('get', 'guild', id).then(async (guildDB) => {
                            if (guildDB.error) return console.log(guildDB.error);
                            if (guildDB.saveonkick) return 'Guild not deleted (saveonkick)';
                            try {
                                await Guild.destroy({
                                    where: {
                                        id: id
                                    }
                                });
                                return 'Guild deleted from database';
                            } catch (error) {
                                return { error: error };
                            };
                        });
                    } else {
                        try {
                            await Guild.destroy({
                                where: {
                                    id: id
                                }
                            });
                            return 'Guild deleted from database';
                        } catch (error) {
                            return { error: error };
                        };
                    };
                default:
                    return { error: `The table '${db}' does not exist (delete)` };
            }
        default:
            return { error: `The action '${action}' does not exist (config)` };
    }
}

functions.send = async function (msg, reply, type) {
    msg.channel.send(reply);
};

module.exports = functions;