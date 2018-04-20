/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_config_files', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		server_name: {
			type: DataTypes.STRING(128),
			allowNull: true,
			defaultValue: ''
		},
		set_name: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		set_area: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		set_group: {
			type: DataTypes.STRING(16),
			allowNull: false,
			defaultValue: ''
		},
		host: {
			type: DataTypes.STRING(20),
			allowNull: false,
			defaultValue: ''
		},
		filename: {
			type: DataTypes.STRING(128),
			allowNull: true
		},
		config: {
			type: DataTypes.TEXT,
			allowNull: true
		},
		posttime: {
			type: DataTypes.DATE,
			allowNull: true
		},
		lastuser: {
			type: DataTypes.STRING(50),
			allowNull: true
		},
		level: {
			type: DataTypes.INTEGER(11),
			allowNull: true,
			defaultValue: '2'
		},
		config_flag: {
			type: DataTypes.INTEGER(10),
			allowNull: false,
			defaultValue: '0'
		}
	}, {
		tableName: 't_config_files',
		timestamps: false
	});
};
