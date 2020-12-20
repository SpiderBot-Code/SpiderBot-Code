const { MessageEmbed } = require('discord.js');
const { Sequelize, Model, DataTypes } = require('sequelize');
const fs = require('fs');

const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: './src/config/database.sqlite3',
	logging: false
});

class Guild extends Model { }
Guild.init({
	id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
	guildId: { type: DataTypes.STRING, allowNull: false },
	prefix: { type: DataTypes.STRING, allowNull: false, defaultValue: '&' },
	logChannel: { type: DataTypes.INTEGER, allowNull: true },
	// eslint-disable-next-line new-cap
	allowSwearChannels: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
	allowSwearing: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
	// eslint-disable-next-line new-cap
	adminRoles: { type: DataTypes.ARRAY(DataTypes.INTEGER), allowNull: true },
	saveonkick: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
}, { sequelize, modelName: 'guild' });

class User extends Model { }
User.init({
	id: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
	userId: { type: DataTypes.STRING, allowNull: false },
	embed: { type: DataTypes.JSON, allowNull: true, defaultValue: { color: '#ff0000' } }
}, { sequelize, modelName: 'user' });

sequelize.sync();

var functions = {};

functions.log = async function log(file, message) {
	fs.appendFileSync(`src/logs/${file}.log`, `${message}\n`);
	console.log(`${message}`);
};

functions.config = async function config(action, db, id, data) {
	if (!action || !db || id === undefined) return 'Missing arguments';
	switch (action) {
		case 'get':
			switch (db) {
				case 'guild': {
					const guild = await Guild.findOrCreate({
						where: {
							guildId: id
						},
						defaults: {
							guildId: id
						}
					});
					if (guild[0] === undefined) throw new Error('Cannot get or create guild');
					return guild[0];
				}
				case 'user': {
					const getUser = await User.findAll({
						where: {
							userId: id
						}
					});
					if (getUser[0] !== undefined) throw new Error('user does not exist');
					return getUser[0];
				}
				case 'allguilds': {
					const guilds = await Guild.findAll();
					if (guilds === undefined) throw new Error('Error getting all guilds');
					return guilds;
				}
				default: {
					throw new Error(`The table '${db}' does not exist (get)`);
				}
			}
		case 'create': {
			return this.config('get', db, id);
		}
		case 'edit': {
			switch (db) {
				case 'guild': {
					const gotGuild = await Guild.update({ [data.update]: data.value }, {
						where: {
							guildId: id
						}
					});
					return gotGuild;
				}
				case 'user': {
					const gotUser = await User.update({ [data.update]: data.value }, {
						where: {
							userId: id
						}
					});
					return gotUser;
				}
				default: {
					throw new Error(`The table '${db}' does not exist`);
				}
			}
		}
		case 'delete': {
			switch (db) {
				case 'guild': {
					if (data) {
						return this.config('get', 'guild', id).then(async (guildDB) => {
							if (guildDB.error) throw new Error(guildDB.error);
							if (guildDB.saveonkick) return 'Guild not deleted (saveonkick)';
							await Guild.destroy({
								where: {
									guildId: id
								}
							});
							return 'Guild deleted from database';
						});
					} else {
						await Guild.destroy({
							where: {
								guildId: id
							}
						});
						return 'Guild deleted from database forced';
					}
				}
				case 'user': {
					if (data) {
						return this.config('get', 'user', id).then(async (userData) => {
							if (userData.error) throw new Error(userData.error);
							if (userData.saveonkick) return 'User not deleted (saveonkick)';
							await User.destroy({
								where: {
									userId: id
								}
							});
							return 'User deleted from database';
						});
					} else {
						await User.destroy({
							where: {
								userId: id
							}
						});
						return 'User deleted from database forced';
					}
				}
				default: {
					throw new Error(`The table '${db}' does not exist (delete)`);
				}
			}
		}
		default: {
			throw new Error(`The action '${action}' does not exist (config)`);
		}
	}
};

functions.stats = async function stats() {
	return 'Not created yet';
};

functions.send = async function send(msg, sendData, msgType) {
	if (!msgType) msgType = 'embed';
	switch (msgType) {
		case 'plain': {
			return msg.channel.send(sendData);
		}
		case 'embed': {
			// const guildData = await this.config('get', 'guild', msg.guild.id).then((data) => data);
			const userData = await this.config('get', 'user', msg.author.id).then((data) => data);
			var embed = new MessageEmbed()
				.setColor(sendData.color || userData && userData.embed.color || '#ff0000')
				.setFooter(sendData.footer || `SpiderBot`)
				.setTimestamp();
			if (sendData.username) {
				embed.setAuthor(msg.author.username, msg.author.displayAvatarURL());
			}
			if (sendData.title) embed.setTitle(sendData.title);
			if (sendData.desc) embed.setDescription(sendData.desc);
			if (sendData.fields) {
				sendData.fields.forEach(field => {
					embed.addField(field.title, field.value);
				});
			}
			return msg.channel.send(embed);
		}
		default: {
			throw new Error(`The message type '${msgType}' does not exist`);
		}
	}
};

module.exports = functions;
