/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_node_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		node_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: '',
			unique: true
		},
		node_obj: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		endpoint_ip: {
			type: DataTypes.STRING(16),
			allowNull: true,
			defaultValue: ''
		},
		endpoint_port: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '0'
		},
		data_dir: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		load_avg1: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		load_avg5: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		load_avg15: {
			type: DataTypes.FLOAT,
			allowNull: true,
			defaultValue: '0'
		},
		last_reg_time: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '1970-01-01 00:08:00'
		},
		last_heartbeat: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '1970-01-01 00:08:00'
		},
		setting_state: {
			type: DataTypes.ENUM('active','inactive'),
			allowNull: true,
			defaultValue: 'inactive'
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
		template_name: {
			type: DataTypes.STRING(128),
			allowNull: false,
			defaultValue: ''
		},
		modify_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		group_id: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '-1'
		}
	}, {
		tableName: 't_node_info',
		timestamps: false
	});
};
