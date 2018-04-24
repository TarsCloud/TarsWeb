/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_machine_tars_info', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			autoIncrement: true,
			unique: true
		},
		application: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		server_name: {
			type: DataTypes.STRING(100),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		app_server_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		node_name: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: '',
			primaryKey: true
		},
		location: {
			type: DataTypes.STRING(255),
			allowNull: false,
			defaultValue: ''
		},
		machine_type: {
			type: DataTypes.STRING(50),
			allowNull: false,
			defaultValue: ''
		},
		update_time: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
		},
		update_person: {
			type: DataTypes.STRING(64),
			allowNull: false,
			defaultValue: ''
		}
	}, {
		tableName: 't_machine_tars_info',
		timestamps: false
	});
};
