/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_server_notifys', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		container_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		set_name: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_area: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		set_group: {
			type: DataTypes.STRING(16),
			allowNull: true
		},
		server_id: {
			type: DataTypes.STRING(100),
			allowNull: true
		},
		thread_id: {
			type: DataTypes.STRING(20),
			allowNull: true
		},
		command: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		result: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		notifytime: {
			type: DataTypes.DATE,
			allowNull: true
		}
	}, {
		tableName: 't_server_notifys',
		timestamps: false
	});
};
