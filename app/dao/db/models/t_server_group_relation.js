/* jshint indent: 1 */

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('t_server_group_relation', {
		id: {
			type: DataTypes.INTEGER(11),
			allowNull: false,
			primaryKey: true,
			autoIncrement: true
		},
		application: {
			type: DataTypes.STRING(90),
			allowNull: false,
			defaultValue: ''
		},
		server_group: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		server_name: {
			type: DataTypes.STRING(50),
			allowNull: true,
			defaultValue: ''
		},
		create_time: {
			type: DataTypes.DATE,
			allowNull: true
		},
		creator: {
			type: DataTypes.STRING(30),
			allowNull: true,
			defaultValue: ''
		}
	}, {
		tableName: 't_server_group_relation',
		timestamps: false
	});
};
