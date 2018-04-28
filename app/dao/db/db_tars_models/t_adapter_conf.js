/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_adapter_conf', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		adapter_name: {
			type: DataTypes.STRING(100),
			allowNull: true,
			defaultValue: ''
		},
		registry_timestamp: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		thread_num: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1'
		},
		endpoint: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		max_connections: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '1000'
		},
		allow_ip: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ''
		},
		servant: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		queuecap: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		queuetimeout: {
			type: DataTypes.INTEGER(11),
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true,
			defaultValue: '0000-00-00 00:00:00'
		},
		lastuser: {
			type: DataTypes.STRING(30),
			allowNull: true
		},
		protocol: {
			type: DataTypes.STRING(64),
			allowNull: true,
			defaultValue: 'tars'
		},
		handlegroup: {
			type: DataTypes.STRING(64),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_adapter_conf',
		timestamps: false
	});
};
