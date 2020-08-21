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
    embed: { type: DataTypes.JSON, allowNull: true, defaultValue: { color: null } }
}, { sequelize, modelName: 'user' });


var functions = {};

functions.config = async function (action, db, id, data) {
    await sequelize.sync();
    if (!action || !db || !id) return 'Missing arguments';
    switch (action) {
        case 'create':
            switch (db) {
                case 'guild':
                    try {
                        const getGuild = await Guild.findAll({
                            where: {
                                id: id,
                            }
                        });
                        if (getGuild[0] !== undefined) throw { error: 'Guild already exists' };
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
                        if (getUser[0] !== undefined) throw { error: 'User already exists' };
                        const newUser = await User.create({
                            id: id
                        });
                        await newUser.save();
                        return newUser;
                    } catch (error) {
                        return { error: error };
                    };
                default:
                    return { error: 'Nothing provided (create)' };
            }
        case 'get':
            switch (db) {
                case 'guild':
                    try {
                        const gotGuild = await Guild.findAll({
                            where: {
                                id: id,
                            }
                        });
                        if (gotGuild[0] === undefined) throw { error: `Guild does not exist`, exist: false };
                        return gotGuild;
                    } catch (error) {
                        return { error: error, exist: true };
                    };
                case 'user':
                    try {
                        const gotUser = await User.findAll({
                            where: {
                                id: id
                            }
                        });
                        if (gotUser[0] === undefined) throw { error: 'User does not exist', exist: false }
                        return gotUser;
                    } catch (error) {
                        return { error: error, exist: true };
                    }
                default:
                    return { error: 'Nothing provided (get)' };
            }
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
                    return { error: 'Nothing provided (edit)' };
            }
        case 'delete':
            switch (db) {
                case 'guild':
                    try {
                        await Guild.destroy({
                            where: {
                                id: id
                            }
                        });
                        return 'Guild deleted from database';
                    } catch (error) {
                        return { error: error };
                    }
                default:
                    return { error: 'Nothing provided' };
            }
        default:
            return { error: 'Nothing provided' };
    }
}

functions.send = async function (msg, reply, type) {
    msg.channel.send(reply);
};

module.exports = functions;