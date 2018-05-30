/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_registry_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		locator_id: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		servant: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		endpoint: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		last_heartbeat: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '1970-01-01 00:08:00'
		},
		present_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: true,
			defaultValue: 'inactive'
		},
		tars_version: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		modify_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		enable_group: {
			type: DataTypes.CHAR(1),
			allowNull: true,
			defaultValue: 'N'
		}
	}, {
		tableName: 't_registry_info',
		timestamps: false
	});
};
